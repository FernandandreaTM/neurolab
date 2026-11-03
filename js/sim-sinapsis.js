/**
 * NeuroLab — sim-sinapsis.js
 * Simulador de la sinapsis química: botón presináptico (canales de Ca²⁺ por voltaje, vesículas), hendidura,
 * membrana postsináptica con receptores y la prolongación de un astrocito que recapta el neurotransmisor.
 * Llega un potencial de acción → se abren los canales de Ca²⁺ → entra Ca²⁺ → las vesículas se fusionan → el neurotransmisor
 * se une a sus receptores → pasan iones (PPSE o PPSI) → el neurotransmisor se retira (recaptación o enzima).
 * Modelo simple en ms: neurotransmisor en la hendidura C (sube 1 por PA con Ca²⁺, baja con τ según la recaptación),
 * receptores abiertos r, y la neurona postsináptica como un circuito RC (τm 8 ms; umbral −55 mV con un PA estilizado).
 * Receptor muscarínico: proteína G → canal de K⁺ (lento y tardío). El tiempo se muestra más lento cerca de cada PA.
 * Uso: const sim = crearSimSinapsis(caja, { controles: ['pa', 'tren', 'ca', 'recap'] | ['pa', 'nt', 'rec'], nt: 'glu' });
 * sim.estado(); sim.alCambiar(fn). CHEQUEOS: condiciones con nombre para los pasos «sim».
 */
const TS = 150;                    // largo del registro (ms)
const DT = 0.02;                   // paso de integración (ms)
const T_PA = 5, TREN = [5, 9, 13, 17, 21];
const LENTO = 0.6, LENTO_TREN = 0.28, RAPIDO = 0.03; // s reales por ms (cerca de un PA / en un tren / resto)
const P = {
    glu:  { E: 0,   G: 0.5, tr: 2.5, tc: 1.0, tcOff: 3 },
    gaba: { E: -80, G: 2.5, tr: 5,   tc: 1.0, tcOff: 3 },
    nic:  { E: 0,   G: 0.6, tr: 2,   tc: 0.7, tcOff: 0.7 },
    mus:  { E: -92, G: 3,   tr: 0,   tc: 0.7, tcOff: 0.7 },
};
const NT = {
    glu:  { nombre: 'Glutamato', col: '#EC4899', borde: '#9D174D' },
    gaba: { nombre: 'GABA', col: '#F97316', borde: '#9A3412' },
    ach:  { nombre: 'Acetilcolina', col: '#14B8A6', borde: '#115E59' },
};
const ION = { na: ['#22C55E', '#166534', 'Na⁺'], cl: ['#EAB308', '#854D0E', 'Cl⁻'], k: ['#3B82F6', '#1E3A8A', 'K⁺'], ca: ['#A855F7', '#581C87', 'Ca²⁺'] };

export const CHEQUEOS = {
    lib1:     s => s.lib1,
    caOff:    s => !s.ca,
    caOn:     s => s.ca,
    sinLib:   s => s.sinLib,
    tren:     s => s.tren,
    paPost:   s => s.paPost,
    recapOff: s => !s.recap,
    largo:    s => s.largo,
    ntGaba:   s => s.nt === 'gaba',
    ntAch:    s => s.nt === 'ach',
    recNic:   s => s.nt === 'ach' && s.rec === 'nic',
    recMus:   s => s.nt === 'ach' && s.rec === 'mus',
    ppsi:     s => s.ppsi,
    nic:      s => s.nic,
    mus:      s => s.mus,
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Disposición (coordenadas de la zona de la sinapsis: 700 × 720; en pantallas angostas se escala y el panel va abajo)
let W, H, ZX, ZH, S, X0, WP, VY, VH, RY, RH, PX0, PW, PY0, PH, VERT = false;
function disponer(vert) {
    VERT = vert;
    if (!vert) { W = 1200; H = 720; ZX = 700; S = 1; ZH = 720; X0 = ZX + 16; WP = W - X0 - 12; VY = 12; VH = 140; RY = 164; RH = H - RY - 12; }
    else { W = 520; ZX = 520; S = 520 / 700; ZH = Math.round(720 * S); X0 = 12; WP = W - 24; VY = ZH + 10; VH = 130; RY = VY + VH + 12; RH = 380; H = RY + RH + 12; }
    PX0 = X0 + 54; PW = WP - 70; PY0 = RY + 42; PH = RH - 84;
}
disponer(false);

// Estructuras (coordenadas locales de la zona)
const CA_X = [262, 438], VES_D = [302, 350, 398], REC_X = [272, 350, 428], KCH_X = 470, MEM_PRE = 300, MEM_POST = 362;
const ASTRO_T = [104, 331];

export function crearSimSinapsis(caja, cfg = {}) {
    const CTRL = cfg.controles || ['pa', 'tren', 'ca', 'recap'];
    const tiene = c => CTRL.includes(c);
    caja.innerHTML = `
      <div class="nl-msim__caja">
        <aside class="nl-msim__herr">
          <p class="nl-msim__etq">Botón presináptico</p>
          <button type="button" class="nl-msim__estim" data-acc="pa">⚡ 1 potencial de acción</button>
          ${tiene('tren') ? '<button type="button" class="nl-msim__estim" data-acc="tren">⚡⚡⚡ Tren de potenciales</button>' : ''}
          ${tiene('ca') ? `<div class="nl-msim__card is-ca"><div class="nl-msim__cuerpo"><strong>Canales de Ca²⁺</strong>
              <button type="button" class="nl-msim__sw" data-sw="ca" aria-pressed="true"><i></i><span>Activos</span></button></div></div>` : ''}
          ${tiene('recap') ? `<div class="nl-msim__card is-recap"><div class="nl-msim__cuerpo"><strong>Recaptación (astrocito)</strong>
              <button type="button" class="nl-msim__sw" data-sw="recap" aria-pressed="true"><i></i><span>Activa</span></button></div></div>` : ''}
          ${tiene('nt') ? `<p class="nl-msim__etq">Neurotransmisor</p>
            <div class="nl-msim__card is-nt"><div class="nl-msim__cuerpo nl-msim__cuerpo--int">
              <span class="nl-msim__opc" role="group" aria-label="Neurotransmisor">${Object.entries(NT).map(([k, v]) => `<button type="button" data-nt="${k}" aria-pressed="false"><i style="background:${v.col}"></i>${v.nombre}</button>`).join('')}</span>
            </div></div>` : ''}
          ${tiene('rec') ? `<div class="nl-msim__card is-rec" hidden><div class="nl-msim__cuerpo nl-msim__cuerpo--int"><strong>Receptor de acetilcolina</strong>
              <span class="nl-msim__opc nl-msim__opc--2" role="group" aria-label="Receptor">
                <button type="button" data-rec="nic" aria-pressed="false">Nicotínico</button><button type="button" data-rec="mus" aria-pressed="false">Muscarínico</button></span>
            </div></div>` : ''}
          <p class="nl-msim__etq">Registro</p>
          <div class="nl-msim__fila"><button type="button" class="nl-msim__chico" data-acc="borrar">Borrar registro</button></div>
        </aside>
        <canvas class="nl-msim__lienzo nl-msim__lienzo--pa" aria-label="Simulador de la sinapsis química: botón presináptico, hendidura, receptores, astrocito y registro postsináptico"></canvas>
      </div>`;
    const cv = caja.querySelector('canvas'), g = cv.getContext('2d');
    let dispuesto = false;
    function aplicar() {
        const ancho = caja.clientWidth;
        const vert = ancho > 0 ? ancho < 620 : VERT;
        if (dispuesto && vert === VERT) return;
        dispuesto = true;
        disponer(vert);
        cv.width = W * 2; cv.height = H * 2; cv.style.aspectRatio = `${W} / ${H}`;
    }
    window.addEventListener('resize', aplicar);
    aplicar();

    let ca = true, recap = true, nt = cfg.nt || 'glu', rec = 'nic', vel = 1, visible = true, cbs = [];
    const tipo = () => nt === 'ach' ? rec : nt;
    let sw = null, barridos = [];
    let parts = [], ntP = [];      // partículas animadas (tiempo real) y neurotransmisor en la hendidura
    const rnd = (a, b) => a + Math.random() * (b - a);

    /* ---------- Registro y modelo ---------- */
    function nuevo(tren) {
        if (sw && !sw.done) return;
        const pas = tren ? TREN.slice() : [T_PA];
        sw = { t: 0, pas, tren, ca, recap, nt, rec, tipo: tipo(), V: -70, C: 0, r: 0, s: 0, k: 0, spk: -1, post: 0, lib: false,
               vmax: -70, vmin: -70, data: [], done: false, hechos: new Set(), fus: new Set() };
        barridos.push(sw); if (barridos.length > 4) barridos.shift();
        sincronizar();
    }
    function cercaPA(t) { return sw && sw.pas.some(p => t >= p - 2.5 && t <= p + 5); }
    function pasoModelo() {
        const b = sw, p = P[b.tipo];
        b.pas.forEach((tp, i) => {
            if (!b.hechos.has(i) && b.t >= tp) { b.hechos.add(i); eventoPA(b); }
            if (!b.fus.has(i) && b.t >= tp + 0.8) { b.fus.add(i); if (b.ca) { b.C += 1; b.lib = true; fusion(b); } }
        });
        const tc = b.recap ? p.tc : p.tcOff;
        b.C -= DT * b.C / tc;
        let I = 0;
        if (b.tipo === 'mus') { b.s += DT * (1.2 * b.C * (1 - b.s) - b.s / 60); b.k += DT * (b.s - b.k) / 35; I = p.G * b.k * (b.V - p.E); }
        else { b.r += DT * (3 * b.C * (1 - b.r) - b.r / p.tr); I = p.G * b.r * (b.V - p.E); }
        if (b.spk >= 0) {
            const u = b.t - b.spk;
            if (u < 0.6) b.V = -55 + u / 0.6 * 85; else if (u < 1.8) b.V = 30 - (u - 0.6) / 1.2 * 108; else b.spk = -1;
        } else {
            b.V += DT * (-(b.V + 70) - I) / 8;
            if (b.V >= -55 && b.tipo !== 'mus') { b.spk = b.t; b.post++; }
        }
        b.vmax = Math.max(b.vmax, b.V); b.vmin = Math.min(b.vmin, b.V);
        b.I = I;
        if (Math.round(b.t / DT) % 5 === 0) b.data.push(b.V);
        b.t += DT;
        if (b.t >= TS) { b.done = true; analizar(b); avisar(); }
    }
    function paso(dtReal) {
        if (!sw || sw.done) return;
        let restante = dtReal * vel;
        let guard = 0;
        while (restante > 0 && !sw.done && guard++ < 4000) {
            const esc = cercaPA(sw.t) ? (sw.tren ? LENTO_TREN : LENTO) : RAPIDO;
            restante -= DT * esc;
            pasoModelo();
        }
        iones(dtReal);
    }

    /* ---------- Animaciones (tiempo real) ---------- */
    function eventoPA(b) {
        if (!b.ca) return;
        CA_X.forEach(x => { for (let i = 0; i < 3; i++) parts.push({ ion: 'ca', x0: x + rnd(-14, 14), y0: MEM_PRE + 30 + rnd(0, 18), x1: x + rnd(-10, 10), y1: MEM_PRE - 36 - rnd(0, 30), t: -i * .12, dur: .7 }); });
    }
    function fusion(b) {
        VES_D.forEach(x => { for (let i = 0; i < 5; i++) ntP.push({ x: x + rnd(-8, 8), y: MEM_PRE + 2, tx: rnd(200, 500), ty: rnd(318, MEM_POST - 12), t: 0, sale: -1, nt: b.nt }); });
    }
    function iones(dt) {
        const b = sw;
        if (b && !b.done) {
            // neurotransmisor visible ∝ concentración en la hendidura; el que sobra se retira (astrocito o enzima)
            const vivos = ntP.filter(q => q.sale < 0);
            const meta = Math.round(b.C * 15);
            for (let i = meta; i < vivos.length; i++) {
                const q = vivos[i]; q.sale = 0;
                q.ax = q.x; q.ay = q.y;
                if (b.nt !== 'ach' && b.recap) { q.bx = ASTRO_T[0] + 6; q.by = ASTRO_T[1] + rnd(-10, 10); } else { q.bx = q.x; q.by = q.y; }
            }
            // iones por los receptores (o por el canal de K⁺ que abre la proteína G)
            const p = P[b.tipo];
            const flujo = Math.abs(b.I || 0);
            b.acum = (b.acum || 0) + flujo * dt * (b.tipo === 'mus' ? 0.9 : 0.35) * (cercaPA(b.t) ? 1 : 3);
            const enVuelo = parts.filter(q => q.ion !== 'ca').length;
            if (enVuelo > (b.tipo === 'mus' ? 3 : 7)) b.acum = Math.min(b.acum, 1);
            while (b.acum > 1) {
                b.acum -= 1;
                if (parts.filter(q => q.ion !== 'ca').length > (b.tipo === 'mus' ? 3 : 7)) break;
                if (b.tipo === 'mus') parts.push({ ion: 'k', x0: KCH_X, y0: MEM_POST + 46, x1: KCH_X + rnd(-12, 12), y1: MEM_POST - 40, t: 0, dur: .7 });
                else { const x = REC_X[Math.floor(Math.random() * 3)]; parts.push({ ion: p.E < -60 ? 'cl' : 'na', x0: x, y0: MEM_POST - 40, x1: x + rnd(-14, 14), y1: MEM_POST + 54, t: 0, dur: .7 }); }
            }
        }
        parts.forEach(q => { q.t += dt; });
        parts = parts.filter(q => q.t < q.dur);
        ntP.forEach(q => {
            if (q.sale >= 0) { q.sale += dt; return; }
            q.t += dt;
            const u = Math.min(1, q.t / .5);
            if (u < 1) { q.cx = q.x + (q.tx - q.x) * u; q.cy = q.y + (q.ty - q.y) * u; }
            else { q.cx = q.tx + Math.sin(q.t * 6 + q.tx) * 3; q.cy = q.ty + Math.cos(q.t * 5 + q.ty) * 2; }
        });
        ntP = ntP.filter(q => q.sale < .6);
    }

    /* ---------- Análisis de un registro terminado ---------- */
    let hist = {};
    function limpiarHist() { hist = { lib1: false, sinLib: false, tren: false, paPost: false, largo: false, ppsi: false, nic: false, mus: false }; }
    limpiarHist();
    function analizar(b) {
        const uno = !b.tren;
        if (uno && b.lib && b.tipo === 'glu' && b.recap) hist.lib1 = true;
        if (!b.ca && !b.lib) hist.sinLib = true;
        if (b.tren && b.lib) hist.tren = true;
        if (b.post > 0 && b.tipo === 'glu') hist.paPost = true;
        if (uno && b.lib && b.tipo === 'glu' && !b.recap) hist.largo = true;
        if (b.lib && b.tipo === 'gaba' && b.vmin < -72) hist.ppsi = true;
        if (b.lib && b.tipo === 'nic' && b.vmax > -66) hist.nic = true;
        if (b.lib && b.tipo === 'mus' && b.vmin < -74) hist.mus = true;
    }

    /* ---------- Dibujo ---------- */
    function rr(x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
    function texto(t, x, y, size, col, al = 'left', w = 800) {
        g.font = `${w} ${size}px Inter, system-ui, sans-serif`; g.fillStyle = col; g.textAlign = al; g.fillText(t, x, y); g.textAlign = 'left';
    }
    function ionDib(x, y, ion, a = 1, r = 11) {
        const [c, b, t] = ION[ion];
        g.globalAlpha = a; g.fillStyle = c; g.strokeStyle = b; g.lineWidth = 2;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
        texto(t, x, y + 4, ion === 'ca' ? 8.5 : 10, '#fff', 'center', 800); g.globalAlpha = 1;
    }
    function ntDib(x, y, n, a = 1, s = 7) {
        const c = NT[n]; g.globalAlpha = a; g.fillStyle = c.col; g.strokeStyle = c.borde; g.lineWidth = 1.5; g.beginPath();
        if (n === 'glu') { g.moveTo(x, y - s); g.lineTo(x + s, y + s * .8); g.lineTo(x - s, y + s * .8); }
        else if (n === 'gaba') { g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); }
        else { for (let i = 0; i < 6; i++) { const a2 = Math.PI / 3 * i; g.lineTo(x + Math.cos(a2) * s, y + Math.sin(a2) * s); } }
        g.closePath(); g.fill(); g.stroke(); g.globalAlpha = 1;
    }
    function zona() {
        const b = sw, t = b ? b.t : 0, tp = tipo(), ntAct = b && !b.done ? b.nt : nt;
        g.fillStyle = '#E0F2FE'; g.fillRect(0, 0, 700, 720);
        // astrocito (prolongación) con su transportador
        g.fillStyle = '#D1FAE5'; g.strokeStyle = '#10B981'; g.lineWidth = 3;
        g.beginPath(); g.moveTo(0, 236); g.bezierCurveTo(70, 236, 104, 280, 108, 331); g.bezierCurveTo(104, 384, 70, 426, 0, 426); g.closePath(); g.fill(); g.stroke();
        texto('Astrocito', 12, 290, 15, '#047857');
        const recOn = (b && !b.done ? b.recap : recap) && ntAct !== 'ach';
        g.fillStyle = recOn ? '#059669' : '#CBD5E1'; rr(ASTRO_T[0] - 10, ASTRO_T[1] - 18, 16, 36, 6); g.fill();
        if (!recOn && ntAct !== 'ach') { g.strokeStyle = '#DC2626'; g.lineWidth = 3; g.beginPath(); g.moveTo(ASTRO_T[0] - 14, ASTRO_T[1] - 20); g.lineTo(ASTRO_T[0] + 10, ASTRO_T[1] + 20); g.stroke(); }
        // neurona postsináptica
        g.fillStyle = '#EDE9FE'; g.strokeStyle = '#8B5CF6'; g.lineWidth = 4;
        g.beginPath(); g.moveTo(150, 720); g.lineTo(150, 410); g.bezierCurveTo(150, 380, 180, MEM_POST, 220, MEM_POST); g.lineTo(560, MEM_POST);
        g.bezierCurveTo(610, MEM_POST, 640, 384, 640, 420); g.lineTo(640, 720); g.fill(); g.stroke();
        texto('Neurona postsináptica', 395, 700, 17, '#5B21B6', 'center');
        // axón y botón presináptico
        g.fillStyle = '#FFF4E0'; g.strokeStyle = '#FB923C'; g.lineWidth = 4;
        g.beginPath(); g.moveTo(322, 0); g.lineTo(322, 60); g.bezierCurveTo(322, 96, 150, 104, 150, 196); g.bezierCurveTo(150, 266, 196, MEM_PRE, 250, MEM_PRE);
        g.lineTo(450, MEM_PRE); g.bezierCurveTo(504, MEM_PRE, 550, 266, 550, 196); g.bezierCurveTo(550, 104, 378, 96, 378, 60); g.lineTo(378, 0); g.fill(); g.stroke();
        texto('Botón presináptico', 392, 34, 17, '#9A3412');
        texto('Hendidura', 690, 336, 15, '#0C4A6E', 'right');
        // potencial de acción que baja por el axón
        if (b && !b.done) b.pas.forEach(p0 => {
            const u = (t - (p0 - 2)) / 2;
            if (u >= 0 && u <= 1.15) {
                const y = Math.min(1, u) * 240 + 20;
                const gr = g.createRadialGradient(350, y, 4, 350, y, 60);
                gr.addColorStop(0, 'rgba(245,158,11,.75)'); gr.addColorStop(1, 'rgba(245,158,11,0)');
                g.fillStyle = gr; g.beginPath(); g.arc(350, y, 60, 0, Math.PI * 2); g.fill();
                if (u <= 1) texto('PA', 384, y + 6, 16, '#B45309');
            }
        });
        // vesículas de reserva y acopladas
        const res = [[230, 190], [280, 150], [330, 210], [390, 160], [440, 205], [480, 150], [260, 240], [460, 250]];
        res.forEach(([x, y]) => vesicula(x, y, ntAct, 1));
        VES_D.forEach((x, i) => {
            let f = 1;   // 1 = acoplada; 0 = recién fusionada (se rellena)
            if (b && b.ca) b.pas.forEach(p0 => { const u = t - (p0 + 0.8); if (u >= 0 && u < 2.6) f = Math.min(f, u < .5 ? 0 : (u - .5) / 2.1); });
            if (f < .05) { g.strokeStyle = '#FB923C'; g.lineWidth = 3; g.beginPath(); g.arc(x, MEM_PRE - 4, 14, Math.PI * 0.15, Math.PI * 0.85, true); g.stroke(); }
            else vesicula(x, MEM_PRE - 22, ntAct, f);
        });
        // canales de Ca²⁺ (se abren con el PA)
        const caOn = b && !b.done ? b.ca : ca;
        CA_X.forEach(x => {
            let ab = 0;
            if (b && !b.done) b.pas.forEach(p0 => { const u = t - p0; if (u > -0.3 && u < 1.6) ab = Math.max(ab, u < 0 ? (u + .3) / .3 : 1 - Math.max(0, u - 1) / .6); });
            const gap = 4 + ab * 8;
            g.fillStyle = '#C084FC'; g.strokeStyle = '#6B21A8'; g.lineWidth = 2;
            rr(x - 14 - gap, MEM_PRE - 18, 14, 36, 5); g.fill(); g.stroke();
            rr(x + gap, MEM_PRE - 18, 14, 36, 5); g.fill(); g.stroke();
            if (!caOn) { g.fillStyle = '#DC2626'; rr(x - 16, MEM_PRE + 16, 32, 10, 4); g.fill(); texto('bloqueado', x, MEM_PRE + 42, 12, '#B91C1C', 'center'); }
        });
        // receptores
        const tpAct = b && !b.done ? b.tipo : tp;
        if (tpAct === 'mus') {
            const s = b && !b.done ? b.s : 0, k = b && !b.done ? b.k : 0;
            REC_X.slice(0, 2).forEach(x => receptorG(x, s));
            // proteína G que va del receptor al canal de K⁺
            const gx = 330 + Math.min(1, s * 3) * (KCH_X - 345);
            g.fillStyle = '#FDE68A'; g.strokeStyle = '#B45309'; g.lineWidth = 2; g.beginPath(); g.ellipse(gx, MEM_POST + 22, 16, 10, 0, 0, Math.PI * 2); g.fill(); g.stroke();
            texto('G', gx, MEM_POST + 27, 13, '#92400E', 'center');
            canalK(KCH_X, Math.min(1, k * 2.2));
        } else {
            const r = b && !b.done ? b.r : 0;
            REC_X.forEach(x => receptorCanal(x, r, tpAct));
        }
        // enzima en la hendidura (acetilcolinesterasa)
        if (ntAct === 'ach') [205, 548].forEach(x => { g.fillStyle = '#FCA5A5'; g.strokeStyle = '#B91C1C'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 334); g.arc(x, 334, 11, .5, Math.PI * 2 - .5); g.closePath(); g.fill(); g.stroke(); });
        // neurotransmisor
        ntP.forEach(q => {
            if (q.sale >= 0) {
                const u = Math.min(1, q.sale / .6);
                if (q.bx !== q.ax) ntDib(q.ax + (q.bx - q.ax) * u, q.ay + (q.by - q.ay) * u, q.nt, 1 - u * .7);
                else { ntDib(q.ax - u * 6, q.ay, q.nt, 1 - u, 4); ntDib(q.ax + u * 6, q.ay + 3, q.nt, 1 - u, 4); }
            } else if (q.cx != null) ntDib(q.cx, q.cy, q.nt);
        });
        // iones
        parts.forEach(q => {
            const u = Math.max(0, q.t / q.dur);
            if (q.t < 0) return;
            const a = u < .15 ? u / .15 : u > .75 ? (1 - u) / .25 : 1;
            ionDib(q.x0 + (q.x1 - q.x0) * u, q.y0 + (q.y1 - q.y0) * u, q.ion, a, q.ion === 'ca' ? 10 : 11);
        });
        // electrodo de registro
        g.strokeStyle = '#DC2626'; g.lineWidth = 3; g.lineCap = 'round';
        g.beginPath(); g.moveTo(395, 560); g.lineTo(560, 470); g.lineTo(700, 470); g.stroke(); g.lineCap = 'butt';
        g.fillStyle = '#DC2626'; g.beginPath(); g.arc(395, 560, 6, 0, Math.PI * 2); g.fill();
        texto('Registro', 560, 460, 14, '#B91C1C', 'center');
        leyenda(ntAct, tpAct);
    }
    function vesicula(x, y, n, a) {
        g.globalAlpha = .35 + .65 * a; g.fillStyle = '#FFFFFF'; g.strokeStyle = '#FB923C'; g.lineWidth = 2.5;
        g.beginPath(); g.arc(x, y, 17, 0, Math.PI * 2); g.fill(); g.stroke(); g.globalAlpha = 1;
        if (a > .3) { ntDib(x - 6, y - 3, n, a, 4); ntDib(x + 6, y - 2, n, a, 4); ntDib(x, y + 6, n, a, 4); }
    }
    function receptorCanal(x, r, tp) {
        const col = tp === 'gaba' ? ['#FDBA74', '#C2410C'] : tp === 'nic' ? ['#5EEAD4', '#0F766E'] : ['#F9A8D4', '#BE185D'];
        const gap = 3 + Math.min(1, r * 2.2) * 8;
        if (r > .08) { g.fillStyle = 'rgba(253,224,71,.45)'; g.beginPath(); g.arc(x, MEM_POST, 30, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = col[0]; g.strokeStyle = col[1]; g.lineWidth = 2;
        rr(x - 14 - gap, MEM_POST - 20, 14, 40, 5); g.fill(); g.stroke();
        rr(x + gap, MEM_POST - 20, 14, 40, 5); g.fill(); g.stroke();
    }
    function receptorG(x, s) {
        if (s > .08) { g.fillStyle = 'rgba(253,224,71,.45)'; g.beginPath(); g.arc(x, MEM_POST, 30, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = '#5EEAD4'; g.strokeStyle = '#0F766E'; g.lineWidth = 2;
        for (let i = 0; i < 4; i++) { rr(x - 22 + i * 11, MEM_POST - 18, 9, 36, 4); g.fill(); g.stroke(); }
    }
    function canalK(x, a) {
        const gap = 3 + a * 8;
        g.fillStyle = '#93C5FD'; g.strokeStyle = '#1E3A8A'; g.lineWidth = 2;
        rr(x - 14 - gap, MEM_POST - 20, 14, 40, 5); g.fill(); g.stroke();
        rr(x + gap, MEM_POST - 20, 14, 40, 5); g.fill(); g.stroke();
        texto('canal de K⁺', x, MEM_POST + 64, 12, '#1E3A8A', 'center', 700);
    }
    function leyenda(n, tp) {
        const y = 650; let x = 168;
        const item = (dib, t) => { dib(x, y); texto(t, x + 15, y + 5, 13, '#4C1D95', 'left', 700); x += 32 + g.measureText(t).width; };
        item((a, b) => ntDib(a, b, n, 1, 7), NT[n].nombre);
        item((a, b) => ionDib(a, b, 'ca', 1, 8), 'Ca²⁺');
        if (tp === 'mus') item((a, b) => ionDib(a, b, 'k', 1, 8), 'K⁺');
        else item((a, b) => ionDib(a, b, tp === 'gaba' ? 'cl' : 'na', 1, 8), tp === 'gaba' ? 'Cl⁻' : 'Na⁺');
    }
    const Ym = mv => PY0 + (40 - mv) / 135 * PH;
    const Xt = t => PX0 + PW * t / TS;
    function panelDer() {
        g.fillStyle = '#1A0E2E';
        if (VERT) g.fillRect(0, ZH, W, H - ZH); else g.fillRect(ZX, 0, W - ZX, H);
        const b = barridos[barridos.length - 1];
        const V = b ? (b.done ? -70 : b.V) : -70;
        g.fillStyle = '#0F0820'; g.strokeStyle = '#A78BFA'; g.lineWidth = 2; rr(X0, VY, WP, VH, 14); g.fill(); g.stroke();
        texto('NEURONA POSTSINÁPTICA', X0 + 14, VY + 26, 15, '#C4B5FD', 'left', 800);
        const v = Math.round(V);
        texto(`${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)} mV`, X0 + WP / 2, VY + VH - 50, 46, v > -55 ? '#FCD34D' : '#93C5FD', 'center', 800);
        const sx0 = X0 + 24, sw0 = WP - 48, sy = VY + VH - 34, X = mv => sx0 + (mv + 100) / 160 * sw0;
        const gr = g.createLinearGradient(sx0, 0, sx0 + sw0, 0);
        gr.addColorStop(0, '#1D4ED8'); gr.addColorStop(.55, '#64748B'); gr.addColorStop(1, '#F59E0B');
        g.fillStyle = gr; rr(sx0, sy, sw0, 10, 5); g.fill();
        const xa = X(clamp(v, -100, 60));
        g.fillStyle = '#fff'; g.beginPath(); g.moveTo(xa, sy - 3); g.lineTo(xa - 7, sy - 13); g.lineTo(xa + 7, sy - 13); g.closePath(); g.fill();
        // registro
        g.fillStyle = '#fff'; rr(X0, RY, WP, RH, 14); g.fill();
        texto('Registro (mV)', X0 + 14, RY + 26, 18, '#334155');
        g.strokeStyle = '#E2E8F0'; g.lineWidth = 1;
        [20, -20, -60, -90].forEach(m => { g.beginPath(); g.moveTo(PX0, Ym(m)); g.lineTo(PX0 + PW, Ym(m)); g.stroke(); texto(String(m).replace('-', '−'), PX0 - 8, Ym(m) + 5, 15, '#64748B', 'right', 700); });
        g.setLineDash([6, 5]); g.lineWidth = 1.5;
        g.strokeStyle = '#94A3B8'; g.beginPath(); g.moveTo(PX0, Ym(-70)); g.lineTo(PX0 + PW, Ym(-70)); g.stroke();
        g.strokeStyle = '#DC2626'; g.beginPath(); g.moveTo(PX0, Ym(-55)); g.lineTo(PX0 + PW, Ym(-55)); g.stroke(); g.setLineDash([]);
        texto('reposo', PX0 + PW - 2, Ym(-70) + 18, 14, '#64748B', 'right', 700);
        texto('umbral', PX0 + PW - 2, Ym(-55) - 6, 14, '#DC2626', 'right', 700);
        for (let t = 0; t <= TS; t += 25) texto(String(t), Xt(t), PY0 + PH + 22, 14, '#64748B', 'center', 700);
        texto('ms', PX0 + PW, PY0 + PH + 42, 14, '#64748B', 'right', 700);
        barridos.forEach((s, k) => {
            const ult = k === barridos.length - 1;
            g.strokeStyle = ult ? '#7C3AED' : 'rgba(100,116,139,.35)'; g.lineWidth = ult ? 3 : 2;
            g.beginPath();
            s.data.forEach((d, i) => { const x = Xt(i * .1), y = Ym(clamp(d, -95, 38)); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
            g.stroke();
            if (ult) s.pas.forEach(tp => {
                const x = Xt(tp);
                g.fillStyle = '#F59E0B'; g.beginPath(); g.moveTo(x, PY0 + PH + 2); g.lineTo(x - 5, PY0 + PH - 9); g.lineTo(x + 5, PY0 + PH - 9); g.closePath(); g.fill();
            });
        });
    }
    function dibujar() {
        g.setTransform(2, 0, 0, 2, 0, 0);
        g.clearRect(0, 0, W, H);
        g.save(); g.scale(S, S); zona(); g.restore();
        panelDer();
    }

    /* ---------- Herramientas ---------- */
    function sincronizar() {
        const corre = !!(sw && !sw.done);
        caja.querySelectorAll('[data-acc="pa"],[data-acc="tren"]').forEach(b2 => { b2.disabled = corre; });
        caja.querySelectorAll('[data-sw]').forEach(b2 => {
            const on = b2.dataset.sw === 'ca' ? ca : recap;
            b2.setAttribute('aria-pressed', on ? 'true' : 'false');
            b2.querySelector('span').textContent = b2.dataset.sw === 'ca' ? (on ? 'Activos' : 'Bloqueados') : (on ? 'Activa' : 'Apagada');
            b2.disabled = corre;
        });
        caja.querySelectorAll('[data-nt]').forEach(b2 => { b2.setAttribute('aria-pressed', b2.dataset.nt === nt ? 'true' : 'false'); b2.disabled = corre; });
        caja.querySelectorAll('[data-rec]').forEach(b2 => { b2.setAttribute('aria-pressed', b2.dataset.rec === rec ? 'true' : 'false'); b2.disabled = corre; });
        const cr = caja.querySelector('.is-rec'); if (cr) cr.hidden = nt !== 'ach';
        avisar();
    }
    caja.querySelector('[data-acc="pa"]').addEventListener('click', () => nuevo(false));
    caja.querySelector('[data-acc="tren"]')?.addEventListener('click', () => nuevo(true));
    caja.querySelectorAll('[data-sw]').forEach(b2 => b2.addEventListener('click', () => { if (b2.dataset.sw === 'ca') ca = !ca; else recap = !recap; sincronizar(); }));
    caja.querySelectorAll('[data-nt]').forEach(b2 => b2.addEventListener('click', () => { nt = b2.dataset.nt; ntP = []; sincronizar(); }));
    caja.querySelectorAll('[data-rec]').forEach(b2 => b2.addEventListener('click', () => { rec = b2.dataset.rec; sincronizar(); }));
    caja.querySelector('[data-acc="borrar"]').addEventListener('click', () => { barridos = barridos.filter(b2 => !b2.done); avisar(); });

    function reiniciar() {
        barridos = []; sw = null; parts = []; ntP = []; ca = true; recap = true; nt = cfg.nt || 'glu'; rec = 'nic';
        limpiarHist(); sincronizar();
    }
    function estado() {
        return { ca, recap, nt, rec, corriendo: !!(sw && !sw.done), ...hist };
    }
    function avisar() { const e = estado(); cbs.forEach(f => f(e)); }

    let t0 = performance.now(), antes = false;
    function bucle(t) {
        const dt = Math.min(.05, (t - t0) / 1000); t0 = t;
        if (visible) {
            paso(dt);
            dibujar();
            const corre = !!(sw && !sw.done);
            if (corre !== antes) { antes = corre; sincronizar(); }
        }
        requestAnimationFrame(bucle);
    }
    sincronizar();
    dibujar();
    requestAnimationFrame(bucle);
    const api = {
        estado,
        alCambiar(f) { cbs = [f]; },
        permitirReposo() { /* sin «Armar reposo» en este simulador */ },
        reiniciar,
        mostrar(si) { visible = !!si; caja.hidden = !si; if (si) aplicar(); },
        lienzo: cv,
        prueba: {
            vel(x) { vel = x; },
            pa() { nuevo(false); },
            tren() { nuevo(true); },
            poner(o) { if ('ca' in o) ca = o.ca; if ('recap' in o) recap = o.recap; if (o.nt) nt = o.nt; if (o.rec) rec = o.rec; sincronizar(); },
        },
    };
    caja.__sim = api;
    return api;
}
