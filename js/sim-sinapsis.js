/**
 * NeuroLab — sim-sinapsis.js
 * Simulador de la sinapsis química: botón presináptico (canales de Ca²⁺ por voltaje, vesículas), hendidura,
 * membrana postsináptica con receptores (cada uno con un sitio con la forma de su neurotransmisor) y, con glutamato
 * o GABA, la prolongación de un astrocito que lo recapta; con acetilcolina, la acetilcolinesterasa de la hendidura.
 * Llega un potencial de acción → se abren los canales de Ca²⁺ → entra Ca²⁺ → las vesículas se fusionan → el neurotransmisor
 * encaja en su receptor → el receptor abre su poro y pasan iones (PPSE o PPSI) → el neurotransmisor se retira.
 * Modelo simple en ms: neurotransmisor en la hendidura C (sube 1 por PA con Ca²⁺, baja con τ según la recaptación),
 * receptores abiertos r, y la célula postsináptica como un circuito RC (τm 8 ms; umbral −55 mV con un PA estilizado).
 * Receptor muscarínico: proteína G → canal de K⁺ (lento y tardío).
 * Cada registro se calcula entero al empezar y todo lo que se dibuja depende del instante del registro: la barra de
 * reproducción permite pausar, volver al inicio, arrastrar y ver a 0,25× o 0,5×. Cerca de cada PA el tiempo pasa más lento.
 * Uso: const sim = crearSimSinapsis(caja, { controles: ['pa', 'tren', 'ca', 'recap', 'nt', 'rec'], nt: 'glu' });
 * sim.estado(); sim.alCambiar(fn). CHEQUEOS: condiciones con nombre para los pasos «sim».
 */
const TS = 150;                    // largo del registro (ms)
const DT = 0.02;                   // paso de integración (ms)
const T_PA = 5, TREN = [5, 9, 13, 17, 21];
const LENTO = 0.6, LENTO_TREN = 0.28, RAPIDO = 0.03;   // s reales por ms a 1× (cerca de un PA / en un tren / resto)
const P = {
    glu:  { E: 0,   G: 0.5, tr: 2.5, tc: 1.0, tcOff: 3 },
    gaba: { E: -80, G: 2.5, tr: 5,   tc: 1.0, tcOff: 3 },
    nic:  { E: 0,   G: 0.7, tr: 2,   tc: 0.7, tcOff: 0.7 },
    mus:  { E: -92, G: 3,   tr: 0,   tc: 0.7, tcOff: 0.7 },
};
const NT = {
    glu:  { nombre: 'Glutamato', col: '#EC4899', borde: '#9D174D' },
    gaba: { nombre: 'GABA', col: '#F97316', borde: '#9A3412' },
    ach:  { nombre: 'Acetilcolina', col: '#14B8A6', borde: '#115E59' },
};
const ION = { na: ['#22C55E', '#166534', 'Na⁺'], cl: ['#EAB308', '#854D0E', 'Cl⁻'], k: ['#3B82F6', '#1E3A8A', 'K⁺'], ca: ['#A855F7', '#581C87', 'Ca²⁺'] };
const POST = { glu: 'Neurona postsináptica', gaba: 'Neurona postsináptica', nic: 'Fibra muscular', mus: 'Célula del corazón' };
const VELS = [0.25, 0.5, 1];

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
    trenNic:  s => s.trenNic,
    mus:      s => s.mus,
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function azar(seed) {   // generador con semilla (mulberry32): el mismo registro se ve igual al repetirlo
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Disposición (zona de la sinapsis en coordenadas locales 700 × 720; en pantallas angostas se escala y el panel va abajo)
let W, H, ZX, ZH, S, X0, WP, VY, VH, RY, RH, PX0, PW, PY0, PH, VERT = false;
function disponer(vert) {
    VERT = vert;
    if (!vert) { W = 1200; H = 720; ZX = 700; S = 1; ZH = 720; X0 = ZX + 16; WP = W - X0 - 12; VY = 12; VH = 140; RY = 164; RH = H - RY - 12; }
    else { W = 520; ZX = 520; S = 520 / 700; ZH = Math.round(720 * S); X0 = 12; WP = W - 24; VY = ZH + 10; VH = 130; RY = VY + VH + 12; RH = 380; H = RY + RH + 12; }
    PX0 = X0 + 54; PW = WP - 70; PY0 = RY + 42; PH = RH - 84;
}
disponer(false);

// Estructuras (coordenadas locales de la zona)
const MEM_PRE = 360, MEM_POST = 455;
const VES_D = [300, 350, 400], REC_X = [270, 350, 430], MUS_X = [290, 370], KCH_X = 490;
const ASTRO_T = [130, 386], ENZ = [[208, 404], [534, 404]];
const RES = [[250, 200], [310, 150], [372, 212], [432, 168], [300, 268], [440, 270]];
// Canales de Ca²⁺ en el costado derecho del botón (cerca de la zona activa) y el Ca²⁺ que espera afuera
const CA_CH = [[506, 340], [527, 282]];
const CA_FUERA = [[574, 262], [602, 290], [632, 268], [586, 328], [622, 318], [656, 296], [566, 298], [646, 340]];
const SLOT = [[-8, -6], [8, -7], [0, 2], [-9, 9], [9, 8]];          // neurotransmisor dentro de cada vesícula
// Contorno de la membrana del axón y del botón (izquierdo; el derecho es su reflejo): por ahí corre el PA
const CONTORNO = (() => {
    const pts = [], bez = (a, b, c, d, n) => { for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t;
        pts.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]); } };
    for (let y = 0; y <= 50; y += 5) pts.push([322, y]);
    bez([322, 50], [322, 90], [170, 100], [170, 230], 40);
    bez([170, 230], [170, 320], [190, 360], [240, 360], 34);
    for (let x = 245; x <= 350; x += 5) pts.push([x, 360]);
    return pts;
})();
const PA_DUR = 2.4;                                                  // ms que tarda el PA en recorrer el contorno
const PA_ICA = (() => { let k = 0, d = 1e9; CONTORNO.forEach(([x, y], i) => { const e = Math.hypot(700 - x - CA_CH[1][0], y - CA_CH[1][1]); if (e < d) { d = e; k = i; } }); return k / CONTORNO.length; })();
const sitios = (tipo) => tipo === 'mus' ? MUS_X.flatMap(x => [[x - 11, MEM_POST - 38], [x + 11, MEM_POST - 38]])
    : REC_X.flatMap(x => [[x - 15, MEM_POST - 40], [x + 15, MEM_POST - 40]]);

/* ---------- Modelo: un registro completo ---------- */
function simular(cfgR) {
    const { pas, ca, recap, tipo } = cfgR, p = P[tipo];
    const n = Math.round(TS / DT);
    const V = new Float32Array(n), C = new Float32Array(n), R = new Float32Array(n), Sg = new Float32Array(n), K = new Float32Array(n), I = new Float32Array(n);
    let v = -70, c = 0, r = 0, s = 0, k = 0, spk = -1, post = 0, lib = false, vmax = -70, vmin = -70;
    const fus = pas.map(t => t + 0.8);
    for (let i = 0; i < n; i++) {
        const t = i * DT;
        if (ca) fus.forEach(f => { if (t <= f && t + DT > f) { c += 1; lib = true; } });
        c -= DT * c / (recap ? p.tc : p.tcOff);
        let cur = 0;
        if (tipo === 'mus') { s += DT * (1.2 * c * (1 - s) - s / 60); k += DT * (s - k) / 35; cur = p.G * k * (v - p.E); }
        else { r += DT * (3 * c * (1 - r) - r / p.tr); cur = p.G * r * (v - p.E); }
        if (spk >= 0) {
            const u = t - spk;
            if (u < 0.6) v = -55 + u / 0.6 * 85; else if (u < 1.8) v = 30 - (u - 0.6) / 1.2 * 108; else spk = -1;
        } else {
            v += DT * (-(v + 70) - cur) / 8;
            if (v >= -55 && tipo !== 'mus') { spk = t; post++; }
        }
        vmax = Math.max(vmax, v); vmin = Math.min(vmin, v);
        V[i] = v; C[i] = c; R[i] = r; Sg[i] = s; K[i] = k; I[i] = cur;
    }
    return { V, C, R, Sg, K, I, post, lib, vmax, vmin };
}
// Iones por PPSE de referencia (1 PA, con recaptación): normaliza el número de iones dibujados
const K_FLUJO = {};
for (const [tp, meta] of [['glu', 8], ['gaba', 6], ['nic', 8], ['mus', 9]]) {
    const m = simular({ pas: [T_PA], ca: true, recap: true, tipo: tp });
    let tot = 0; for (let i = 0; i < m.I.length; i++) tot += Math.abs(m.I[i]) * DT;
    K_FLUJO[tp] = meta / tot;
}

export function crearSimSinapsis(caja, cfg = {}) {
    const CTRL = cfg.controles || ['pa', 'tren', 'ca', 'recap'];
    // Fondo ilustrado (img/sinapsis/fondo*.jpg, 700 × 720 a 1,5×); sin imagen se usa el dibujo vectorial
    const carga = src => { if (!src) return null; const im = new Image(); im.src = src; return im; };
    const FONDO = { con: carga(cfg.fondo), sin: carga(cfg.fondo_ach) };
    const lista = im => im && im.complete && im.naturalWidth > 0;
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
        <div class="nl-msim__der">
          <canvas class="nl-msim__lienzo nl-msim__lienzo--pa" aria-label="Simulador de la sinapsis química: botón presináptico, hendidura, receptores y registro postsináptico"></canvas>
          <div class="nl-msim__play" aria-label="Reproducción del registro">
            <button type="button" data-pl="inicio" title="Volver al inicio" aria-label="Volver al inicio">⏮</button>
            <button type="button" data-pl="pausa" title="Pausa / seguir" aria-label="Pausa o seguir">⏸</button>
            <input type="range" min="0" max="1000" value="0" step="1" aria-label="Instante del registro">
            <span class="nl-msim__t">0 ms</span>
            <span class="nl-msim__vel" role="group" aria-label="Velocidad">${VELS.map(v => `<button type="button" data-vel="${v}" aria-pressed="${v === 1}">${String(v).replace('.', ',')}×</button>`).join('')}</span>
          </div>
        </div>
      </div>`;
    const cv = caja.querySelector('canvas'), g = cv.getContext('2d');
    const barra = caja.querySelector('.nl-msim__play'), rango = barra.querySelector('input'), tLbl = barra.querySelector('.nl-msim__t'), bPausa = barra.querySelector('[data-pl="pausa"]');
    let dispuesto = false;
    function aplicar() {
        const ancho = caja.querySelector('.nl-msim__der').clientWidth || caja.clientWidth;
        const vert = ancho > 0 ? ancho < 560 : VERT;
        if (dispuesto && vert === VERT) return;
        dispuesto = true;
        disponer(vert);
        cv.width = W * 2; cv.height = H * 2; cv.style.aspectRatio = `${W} / ${H}`;
    }
    window.addEventListener('resize', aplicar);
    aplicar();

    let ca = true, recap = true, nt = cfg.nt || 'glu', rec = 'nic', visible = true, cbs = [];
    let vel = 1, prueba = 1, pausado = false, arrastrando = false;
    const tipo = () => nt === 'ach' ? rec : nt;
    let sw = null, barridos = [], semilla = 1;

    /* ---------- Un registro: modelo + guion de la animación (todo en ms del registro) ---------- */
    function nuevo(tren) {
        if (sw && !sw.visto) return;
        const b = { pas: tren ? TREN.slice() : [T_PA], tren, ca, recap, nt, rec, tipo: tipo(), tp: 0, visto: false };
        Object.assign(b, simular(b));
        guion(b);
        sw = b; pausado = false;
        barridos.push(b); if (barridos.length > 4) barridos.shift();
        sincronizar();
    }
    const escEn = (b, t) => b.pas.some(p => t >= p - 2.5 && t <= p + 5) ? (b.tren ? LENTO_TREN : LENTO) : RAPIDO;
    function guion(b) {
        const rnd = azar(semilla++ * 7919), r = (a, z) => a + rnd() * (z - a);
        b.ca2 = []; b.mol = []; b.iones = [];
        if (b.ca) b.pas.forEach(tp => { for (let k = 0; k < 6; k++) {
            const [cx, cy] = CA_CH[k % 2], [fx, fy] = CA_FUERA[k];
            b.ca2.push({ k, t0: tp + k * 0.07, pts: [[fx, fy], [cx + 28, cy], [cx - 30, cy + r(-4, 4)], [VES_D[k % 3] + r(-14, 14), MEM_PRE - 58 + r(-12, 12)]], durs: [0.32, 0.22, 0.55] });
        } });
        // neurotransmisor: 15 moléculas por fusión; 6 encajan en los sitios de los receptores y se van al final
        const sit = sitios(b.tipo), p = P[b.tipo], tc = b.recap ? p.tc : p.tcOff;
        if (b.ca) b.pas.forEach(tp => {
            const tf = tp + 0.8;
            for (let j = 0; j < 15; j++) {
                const v = VES_D[j % 3], enSitio = j < sit.length;
                const [tx, ty] = enSitio ? sit[j] : [r(225, 545), r(MEM_PRE + 22, MEM_POST - 54)];
                const rango_ = enSitio ? j * 0.25 : 2 + (j - sit.length);   // las que encajan, últimas en irse
                const t2 = tf + 0.32 + r(0, 0.2);
                const tl = Math.max(t2 + 0.4, tf + 0.6 + tc * Math.log(15 / (rango_ + 0.5)));
                let dest;
                if (b.nt === 'ach') { const e = ENZ[tx < 370 ? 0 : 1]; dest = { x: e[0], y: e[1], modo: 'enzima' }; }
                else if (b.recap) dest = { x: ASTRO_T[0] + 6, y: ASTRO_T[1] + r(-14, 14), modo: 'astro' };
                else dest = { x: tx < 370 ? -10 : 710, y: ty + r(-20, 20), modo: 'difunde' };
                const [sx, sy] = SLOT[Math.floor(j / 3)];
                b.mol.push({ x0: v + sx, y0: MEM_PRE - 18 + sy, xm: v + sx * 0.4, ym: MEM_PRE + 6, tm: tf + 0.15, tx, ty, tf, t2, tl, dur: b.nt === 'ach' ? 0.5 : (dest.modo === 'difunde' ? 1.6 : 0.8), dest, enSitio, rot: r(-0.3, 0.3) });
            }
        });
        // iones por los receptores (o por el canal de K⁺): uno cada vez que la corriente acumulada suma 1
        let acum = 0, fin = [];
        const cap = b.tipo === 'mus' ? 3 : 6, kf = K_FLUJO[b.tipo];
        for (let i = 0; i < b.I.length; i++) {
            acum += Math.abs(b.I[i]) * DT * kf;
            if (acum < 1) continue;
            acum -= 1;
            const t0 = i * DT, dur = 0.55 / escEn(b, t0) * (b.tipo === 'mus' ? 1.4 : 1);
            fin = fin.filter(f => f > t0);
            if (fin.length >= cap) continue;
            fin.push(t0 + dur);
            if (b.tipo === 'mus') b.iones.push({ ion: 'k', t0, dur, x0: KCH_X + r(-4, 4), y0: MEM_POST + 70, x1: KCH_X + r(-14, 14), y1: MEM_POST - 56 });
            else { const x = REC_X[Math.floor(rnd() * 3)]; b.iones.push({ ion: p.E < -60 ? 'cl' : 'na', t0, dur, x0: x + r(-3, 3), y0: MEM_POST - 54, x1: x + r(-16, 16), y1: MEM_POST + 82 }); }
        }
    }
    const idx = (b, t) => clamp(Math.floor(t / DT), 0, b.V.length - 1);

    /* ---------- Reproducción ---------- */
    function paso(dtReal) {
        const b = sw;
        if (!b || pausado || arrastrando) return;
        if (b.tp >= TS) return;
        let resto = dtReal * vel * prueba, guard = 0;
        while (resto > 0 && b.tp < TS && guard++ < 6000) { const e = escEn(b, b.tp); const d = Math.min(0.05, resto / e); b.tp += d; resto -= d * e; }
        if (b.tp >= TS) { b.tp = TS; terminar(b); }
    }
    function terminar(b) {
        if (b.visto) return;
        b.visto = true; analizar(b); sincronizar();
    }

    /* ---------- Análisis de un registro terminado ---------- */
    let hist = {};
    function limpiarHist() { hist = { lib1: false, sinLib: false, tren: false, paPost: false, largo: false, ppsi: false, nic: false, trenNic: false, mus: false }; }
    limpiarHist();
    function analizar(b) {
        const uno = !b.tren;
        if (uno && b.lib && b.tipo === 'glu' && b.recap) hist.lib1 = true;
        if (!b.ca && !b.lib) hist.sinLib = true;
        if (b.tren && b.lib && b.tipo === 'glu') hist.tren = true;
        if (b.post > 0 && b.tipo === 'glu') hist.paPost = true;
        if (uno && b.lib && b.tipo === 'glu' && !b.recap) hist.largo = true;
        if (b.lib && b.tipo === 'gaba' && b.vmin < -72) hist.ppsi = true;
        if (uno && b.lib && b.tipo === 'nic' && b.vmax > -66) hist.nic = true;
        if (b.tren && b.post > 0 && b.tipo === 'nic') hist.trenNic = true;
        if (b.lib && b.tipo === 'mus' && b.vmin < -74) hist.mus = true;
    }

    /* ---------- Dibujo ---------- */
    function rr(x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
    function texto(t, x, y, size, col, al = 'left', w = 800) {
        g.font = `${w} ${size}px Inter, system-ui, sans-serif`; g.fillStyle = col; g.textAlign = al; g.fillText(t, x, y); g.textAlign = 'left';
    }
    function ionDib(x, y, ion, a = 1, r = 12) {
        const [c, b, t] = ION[ion];
        g.globalAlpha = a; g.fillStyle = c; g.strokeStyle = b; g.lineWidth = 2;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
        texto(t, x, y + 4, ion === 'ca' ? r * .78 : r * .9, '#fff', 'center', 800); g.globalAlpha = 1;
    }
    function formaNT(x, y, n, s, rot = 0) {
        g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
        if (n === 'glu') { g.moveTo(0, -s); g.lineTo(s * .95, s * .7); g.lineTo(-s * .95, s * .7); }
        else if (n === 'gaba') { g.moveTo(0, -s); g.lineTo(s * .8, 0); g.lineTo(0, s); g.lineTo(-s * .8, 0); }
        else { for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i + Math.PI / 6; g.lineTo(Math.cos(a) * s, Math.sin(a) * s); } }
        g.closePath(); g.restore();
    }
    function ntDib(x, y, n, a = 1, s = 9, rot = 0) {
        const c = NT[n]; g.globalAlpha = a; g.fillStyle = c.col; g.strokeStyle = c.borde; g.lineWidth = 1.8;
        formaNT(x, y, n, s, rot); g.fill(); g.stroke(); g.globalAlpha = 1;
    }
    function vesicula(x, y, n, a, r = 20) {
        g.globalAlpha = .35 + .65 * a; g.fillStyle = '#FFFFFF'; g.strokeStyle = '#FB923C'; g.lineWidth = 2.5;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke(); g.globalAlpha = 1;
        if (a > .3) SLOT.forEach(([dx, dy]) => ntDib(x + dx, y + dy, n, a, 5.5));
    }
    // Receptor-canal: dos mitades con un sitio con la forma del neurotransmisor arriba de cada una; se abren al unirlo
    function receptorCanal(x, ab, tp, ntR) {
        const col = tp === 'gaba' ? ['#FED7AA', '#C2410C', '#FB923C'] : tp === 'nic' ? ['#99F6E4', '#0F766E', '#2DD4BF'] : ['#FBCFE8', '#BE185D', '#F472B6'];
        const gap = 3 + ab * 9, inc = ab * 0.12;
        if (ab > .1) { g.fillStyle = `rgba(253,224,71,${.18 + ab * .25})`; g.beginPath(); g.ellipse(x, MEM_POST + 6, 46, 50, 0, 0, Math.PI * 2); g.fill(); }
        [-1, 1].forEach(ld => {
            g.save(); g.translate(x + ld * (gap + 11), MEM_POST + 8); g.rotate(-ld * inc);
            g.fillStyle = col[0]; g.strokeStyle = col[1]; g.lineWidth = 2.2;
            rr(-11, -38, 22, 84, 9); g.fill(); g.stroke();
            // sitio de unión (hueco con la forma del neurotransmisor)
            g.fillStyle = '#fff'; g.strokeStyle = col[2]; g.lineWidth = 1.6; formaNT(0, -40, ntR, 8.5); g.fill(); g.stroke();
            g.restore();
        });
    }
    // Receptor metabotrópico (7 hélices) con su proteína G pegada por dentro
    function receptorG(x, act) {
        if (act > .1) { g.fillStyle = `rgba(253,224,71,${.18 + act * .25})`; g.beginPath(); g.ellipse(x, MEM_POST + 6, 40, 46, 0, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = '#99F6E4'; g.strokeStyle = '#0F766E'; g.lineWidth = 2;
        for (let i = 0; i < 4; i++) { rr(x - 26 + i * 13, MEM_POST - 30 + (i % 2) * 4, 11, 70, 5); g.fill(); g.stroke(); }
        [-11, 11].forEach(dx => { g.fillStyle = '#fff'; g.strokeStyle = '#2DD4BF'; g.lineWidth = 1.6; formaNT(x + dx, MEM_POST - 38, 'ach', 8.5); g.fill(); g.stroke(); });
    }
    function canalK(x, ab) {
        const gap = 3 + ab * 9;
        g.fillStyle = '#BFDBFE'; g.strokeStyle = '#1E3A8A'; g.lineWidth = 2.2;
        rr(x - 22 - gap, MEM_POST - 30, 22, 76, 8); g.fill(); g.stroke();
        rr(x + gap, MEM_POST - 30, 22, 76, 8); g.fill(); g.stroke();
    }
    function zona() {
        const b = sw, t = b ? b.tp : 0, i = b ? idx(b, t) : 0;
        const ntAct = b ? b.nt : nt, tpAct = b ? b.tipo : tipo(), caAct = b ? b.ca : ca, recapAct = b ? b.recap : recap;
        const Vp = b ? b.V[i] : -70;
        const imF = ntAct === 'ach' ? FONDO.sin : FONDO.con;
        const postPath = () => { g.beginPath(); g.moveTo(150, 720); g.lineTo(150, 505); g.bezierCurveTo(150, 475, 180, MEM_POST, 230, MEM_POST); g.lineTo(560, MEM_POST);
            g.bezierCurveTo(610, MEM_POST, 640, 475, 640, 505); g.lineTo(640, 720); };
        if (lista(imF)) {
            g.drawImage(imF, 0, 0, 700, 720);
            if (Vp > -40) { g.strokeStyle = 'rgba(245,158,11,.9)'; g.lineWidth = 8; postPath(); g.stroke(); }
            if (ntAct !== 'ach') {
                g.fillStyle = recapAct ? '#059669' : '#CBD5E1'; rr(ASTRO_T[0] - 9, ASTRO_T[1] - 22, 16, 44, 6); g.fill();
                if (!recapAct) { g.strokeStyle = '#DC2626'; g.lineWidth = 3; g.beginPath(); g.moveTo(ASTRO_T[0] - 14, ASTRO_T[1] - 24); g.lineTo(ASTRO_T[0] + 12, ASTRO_T[1] + 24); g.stroke(); }
                texto('Astrocito', 10, 560, 15, '#047857');
            }
            texto(POST[tpAct], 395, 704, 17, '#5B21B6', 'center');
        } else {
        g.fillStyle = '#E0F2FE'; g.fillRect(0, 0, 700, 720);
        // astrocito (solo con glutamato o GABA)
        if (ntAct !== 'ach') {
            g.fillStyle = '#D1FAE5'; g.strokeStyle = '#10B981'; g.lineWidth = 3;
            g.beginPath(); g.moveTo(0, 296); g.bezierCurveTo(92, 296, 134, 356, 136, 408); g.bezierCurveTo(134, 460, 92, 520, 0, 520); g.closePath(); g.fill(); g.stroke();
            texto('Astrocito', 12, 350, 15, '#047857');
            g.fillStyle = recapAct ? '#059669' : '#CBD5E1'; rr(ASTRO_T[0] - 9, ASTRO_T[1] - 22, 16, 44, 6); g.fill();
            if (!recapAct) { g.strokeStyle = '#DC2626'; g.lineWidth = 3; g.beginPath(); g.moveTo(ASTRO_T[0] - 14, ASTRO_T[1] - 24); g.lineTo(ASTRO_T[0] + 12, ASTRO_T[1] + 24); g.stroke(); }
        }
        // célula postsináptica (destello si dispara un PA)
        g.fillStyle = '#EDE9FE'; g.strokeStyle = Vp > -40 ? '#F59E0B' : '#8B5CF6'; g.lineWidth = Vp > -40 ? 7 : 4;
        postPath(); g.fill(); g.stroke();
        texto(POST[tpAct], 395, 704, 17, '#5B21B6', 'center');
        // axón y botón presináptico
        g.fillStyle = '#FFF4E0'; g.strokeStyle = '#FB923C'; g.lineWidth = 4;
        g.beginPath(); g.moveTo(322, 0); g.lineTo(322, 50); g.bezierCurveTo(322, 90, 170, 100, 170, 230); g.bezierCurveTo(170, 320, 190, MEM_PRE, 240, MEM_PRE);
        g.lineTo(460, MEM_PRE); g.bezierCurveTo(510, MEM_PRE, 530, 320, 530, 230); g.bezierCurveTo(530, 100, 378, 90, 378, 50); g.lineTo(378, 0); g.fill(); g.stroke();
        }
        texto('Botón presináptico', 392, 30, 17, '#9A3412');
        texto('Hendidura', 690, 412, 15, '#0C4A6E', 'right');
        // potencial de acción: una onda que corre por la membrana del axón y del botón (por ambos lados)
        if (b) b.pas.forEach(p0 => {
            const N = CONTORNO.length, f = (t - (p0 - PA_DUR * PA_ICA)) / PA_DUR * N;
            if (f < 0 || f > N + 30) return;
            g.save(); g.lineCap = 'round'; g.shadowColor = 'rgba(250,204,21,.9)'; g.shadowBlur = 14;
            for (const lado of [1, -1]) {
                for (let k = Math.max(1, Math.floor(f - 30)); k <= Math.min(N - 1, Math.floor(f)); k++) {
                    const a = 1 - (f - k) / 30, P0 = CONTORNO[k - 1], P1 = CONTORNO[k];
                    const X = q => lado > 0 ? 700 - q[0] : q[0];
                    g.strokeStyle = `rgba(250,204,21,${a.toFixed(2)})`; g.lineWidth = 4 + 6 * a;
                    g.beginPath(); g.moveTo(X(P0), P0[1]); g.lineTo(X(P1), P1[1]); g.stroke();
                }
            }
            g.restore();
            const fr = CONTORNO[Math.min(N - 1, Math.max(0, Math.floor(f)))];
            if (f <= N) texto('PA', 700 - fr[0] + 14, fr[1] + 6, 16, '#B45309');
        });
        // vesículas de reserva y acopladas
        RES.forEach(([x, y]) => vesicula(x, y, ntAct, 1));
        VES_D.forEach(x => {
            let f = 1, baja = 0;
            if (b && b.ca) b.pas.forEach(p0 => {
                const u = t - (p0 + 0.8);
                if (u >= -0.45 && u < 0) baja = Math.max(baja, (u + 0.45) / 0.45);
                if (u >= 0 && u < 2.6) f = Math.min(f, u < .5 ? 0 : (u - .5) / 2.1);
            });
            if (f < .05) { g.strokeStyle = '#FB923C'; g.lineWidth = 3; g.beginPath(); g.arc(x, MEM_PRE - 4, 16, Math.PI * 0.15, Math.PI * 0.85, true); g.stroke(); }
            else vesicula(x, MEM_PRE - 26 + 8 * (f < 1 ? 0 : baja), ntAct, f);
        });
        // canales de Ca²⁺ (costado derecho) y el Ca²⁺ que espera afuera
        CA_CH.forEach(([x, y]) => {
            let ab = 0;
            if (b && b.ca) b.pas.forEach(p0 => { const u = t - p0; if (u > -0.3 && u < 1.6) ab = Math.max(ab, u < 0 ? (u + .3) / .3 : 1 - Math.max(0, u - 1) / .6); });
            const gap = 3 + ab * 8;
            g.fillStyle = '#E9D5FF'; g.strokeStyle = '#6B21A8'; g.lineWidth = 2;
            rr(x - 22, y - gap - 14, 44, 14, 6); g.fill(); g.stroke();
            rr(x - 22, y + gap, 44, 14, 6); g.fill(); g.stroke();
            if (!caAct) { g.fillStyle = '#DC2626'; rr(x + 24, y - 16, 9, 32, 4); g.fill(); }
        });
        const rt = performance.now() / 1000;
        CA_FUERA.forEach(([x, y], k) => {
            let a = 1;
            if (b && b.ca && k < 6) b.pas.forEach(p0 => { const u = t - (p0 + k * 0.07); if (u >= 0 && u < 6) a = Math.min(a, u < 5 ? 0 : u - 5); });
            if (a > 0.02) ionDib(x + Math.sin(rt * 1.3 + k * 2) * 3, y + Math.cos(rt * 1.1 + k) * 3, 'ca', a, 11);
        });
        // receptores
        if (tpAct === 'mus') {
            const s = b ? b.Sg[i] : 0, k = b ? b.K[i] : 0;
            MUS_X.forEach(x => receptorG(x, Math.min(1, s * 3)));
            const u = Math.min(1, s * 3), gx = MUS_X[1] + u * (KCH_X - 40 - MUS_X[1]);
            g.fillStyle = '#FDE68A'; g.strokeStyle = '#B45309'; g.lineWidth = 2; g.beginPath(); g.ellipse(gx, MEM_POST + 58, 18, 11, 0, 0, Math.PI * 2); g.fill(); g.stroke();
            texto('G', gx, MEM_POST + 63, 13, '#92400E', 'center');
            canalK(KCH_X, Math.min(1, k * 2.2));
        } else {
            const ab = b ? Math.min(1, b.R[idx(b, t - 0.35)] * 2.2) : 0;   // se abre justo después de que encaja el neurotransmisor
            REC_X.forEach(x => receptorCanal(x, ab, tpAct, ntAct));
        }
        // acetilcolinesterasa
        if (ntAct === 'ach') ENZ.forEach(([x, y]) => {
            const boca = b ? 0.35 + 0.3 * Math.abs(Math.sin(t * 6)) : 0.45;
            g.fillStyle = '#FCA5A5'; g.strokeStyle = '#B91C1C'; g.lineWidth = 2.2;
            g.beginPath(); g.moveTo(x, y); g.arc(x, y, 17, boca, Math.PI * 2 - boca); g.closePath(); g.fill(); g.stroke();
        });
        // neurotransmisor
        if (b) b.mol.forEach(m => {
            if (t < m.tf) return;
            if (t < m.tm) { const u = (t - m.tf) / (m.tm - m.tf); ntDib(m.x0 + (m.xm - m.x0) * u, m.y0 + (m.ym - m.y0) * u, ntAct, 1, 5.5 + 1.5 * u); return; }
            if (t < m.t2) { const u = (t - m.tm) / (m.t2 - m.tm); ntDib(m.xm + (m.tx - m.xm) * u, m.ym + (m.ty - m.ym) * u, ntAct, 1, 7 + 2 * u, m.rot * (1 - u)); return; }
            if (t < m.tl) {
                const fl = m.enSitio ? 0 : 1;
                ntDib(m.tx + Math.sin(t * 5 + m.tx) * 3 * fl, m.ty + Math.cos(t * 4 + m.ty) * 2 * fl, ntAct, 1, m.enSitio ? 8 : 9, m.enSitio ? 0 : m.rot);
                return;
            }
            const u = (t - m.tl) / m.dur;
            if (u > 1) return;
            const x = m.tx + (m.dest.x - m.tx) * u, y = m.ty + (m.dest.y - m.ty) * u;
            if (m.dest.modo === 'enzima' && u > .7) { const v = (u - .7) / .3; ntDib(x - v * 8, y, ntAct, 1 - v, 5); ntDib(x + v * 8, y + 3, ntAct, 1 - v, 5); }
            else ntDib(x, y, ntAct, m.dest.modo === 'difunde' ? 1 - u : 1 - u * .5, 9);
        });
        // Ca²⁺ e iones
        if (b) {
            b.ca2.forEach(q => {
                let u = t - q.t0; if (u < 0) return;
                for (let L = 0; L < 3; L++) {
                    if (u > q.durs[L]) { u -= q.durs[L]; continue; }
                    const v = u / q.durs[L], A = q.pts[L], B = q.pts[L + 1], a = L === 2 && v > .6 ? (1 - v) / .4 : 1;
                    ionDib(A[0] + (B[0] - A[0]) * v, A[1] + (B[1] - A[1]) * v, 'ca', a, 11); return;
                }
            });
            b.iones.forEach(q => { const u = (t - q.t0) / q.dur; if (u < 0 || u > 1) return; const a = u < .15 ? u / .15 : u > .75 ? (1 - u) / .25 : 1; ionDib(q.x0 + (q.x1 - q.x0) * u, q.y0 + (q.y1 - q.y0) * u, q.ion, a, 12); });
        }
        // electrodo de registro
        g.strokeStyle = '#DC2626'; g.lineWidth = 3; g.lineCap = 'round';
        g.beginPath(); g.moveTo(395, 640); g.lineTo(560, 590); g.lineTo(700, 590); g.stroke(); g.lineCap = 'butt';
        g.fillStyle = '#DC2626'; g.beginPath(); g.arc(395, 640, 6, 0, Math.PI * 2); g.fill();
        texto('Registro', 610, 580, 14, '#B91C1C', 'center');
        leyenda(ntAct, tpAct);
    }
    function leyenda(n, tp) {
        let y = 28;
        const item = (dib, t) => { dib(22, y - 5); texto(t, 40, y, 14, '#334155', 'left', 700); y += 26; };
        item((a, b) => ntDib(a, b, n, 1, 8), NT[n].nombre);
        item((a, b) => ionDib(a, b, 'ca', 1, 9), 'Ca²⁺');
        if (tp === 'mus') item((a, b) => ionDib(a, b, 'k', 1, 9), 'K⁺');
        else item((a, b) => ionDib(a, b, tp === 'gaba' ? 'cl' : 'na', 1, 9), tp === 'gaba' ? 'Cl⁻' : 'Na⁺');
        if (n === 'ach') item((a, b) => { g.fillStyle = '#FCA5A5'; g.strokeStyle = '#B91C1C'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(a, b); g.arc(a, b, 8, .5, Math.PI * 2 - .5); g.closePath(); g.fill(); g.stroke(); }, 'Acetilcolinesterasa');
    }
    const Ym = mv => PY0 + (40 - mv) / 135 * PH;
    const Xt = t => PX0 + PW * t / TS;
    function panelDer() {
        g.fillStyle = '#1A0E2E';
        if (VERT) g.fillRect(0, ZH, W, H - ZH); else g.fillRect(ZX, 0, W - ZX, H);
        const b = sw;
        const V = b ? b.V[idx(b, b.tp)] : -70;
        g.fillStyle = '#0F0820'; g.strokeStyle = '#A78BFA'; g.lineWidth = 2; rr(X0, VY, WP, VH, 14); g.fill(); g.stroke();
        texto((POST[b ? b.tipo : tipo()]).toUpperCase(), X0 + 14, VY + 26, 15, '#C4B5FD', 'left', 800);
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
            const ult = s === sw;
            const hasta = ult && !s.visto ? s.tp : TS;
            g.strokeStyle = ult ? '#7C3AED' : 'rgba(100,116,139,.35)'; g.lineWidth = ult ? 3 : 2;
            g.beginPath();
            const n = Math.min(s.V.length, Math.floor(hasta / DT));
            for (let j = 0; j < n; j += 5) { const x = Xt(j * DT), y = Ym(clamp(s.V[j], -95, 38)); if (j) g.lineTo(x, y); else g.moveTo(x, y); }
            g.stroke();
            if (ult) s.pas.forEach(tp => {
                const x = Xt(tp);
                g.fillStyle = '#F59E0B'; g.beginPath(); g.moveTo(x, PY0 + PH + 2); g.lineTo(x - 5, PY0 + PH - 9); g.lineTo(x + 5, PY0 + PH - 9); g.closePath(); g.fill();
            });
        });
        if (b && b.visto) {   // cabezal de reproducción
            const x = Xt(b.tp);
            g.strokeStyle = '#F59E0B'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, PY0); g.lineTo(x, PY0 + PH); g.stroke();
            g.fillStyle = '#F59E0B'; g.beginPath(); g.arc(x, Ym(clamp(V, -95, 38)), 6, 0, Math.PI * 2); g.fill();
        }
    }
    function dibujar() {
        g.setTransform(2, 0, 0, 2, 0, 0);
        g.clearRect(0, 0, W, H);
        g.save(); g.scale(S, S); zona(); g.restore();
        panelDer();
        // barra
        const b = sw;
        if (!arrastrando) rango.value = b ? Math.round(b.tp / TS * 1000) : 0;
        tLbl.textContent = `${b ? (b.tp < 30 ? b.tp.toFixed(1).replace('.', ',') : Math.round(b.tp)) : 0} ms`;
        const pl = b && !pausado && b.tp < TS;
        bPausa.textContent = pl ? '⏸' : '▶';
    }

    /* ---------- Herramientas ---------- */
    function sincronizar() {
        const corre = !!(sw && !sw.visto);
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
        barra.classList.toggle('is-vacia', !sw);
        rango.disabled = !sw;
        caja.querySelectorAll('[data-vel]').forEach(b2 => b2.setAttribute('aria-pressed', Number(b2.dataset.vel) === vel ? 'true' : 'false'));
        avisar();
    }
    const ajustesCambiaron = () => { if (sw && sw.visto) { sw = null; } };
    caja.querySelector('[data-acc="pa"]').addEventListener('click', () => nuevo(false));
    caja.querySelector('[data-acc="tren"]')?.addEventListener('click', () => nuevo(true));
    caja.querySelectorAll('[data-sw]').forEach(b2 => b2.addEventListener('click', () => { if (b2.dataset.sw === 'ca') ca = !ca; else recap = !recap; ajustesCambiaron(); sincronizar(); }));
    caja.querySelectorAll('[data-nt]').forEach(b2 => b2.addEventListener('click', () => { nt = b2.dataset.nt; ajustesCambiaron(); sincronizar(); }));
    caja.querySelectorAll('[data-rec]').forEach(b2 => b2.addEventListener('click', () => { rec = b2.dataset.rec; ajustesCambiaron(); sincronizar(); }));
    caja.querySelector('[data-acc="borrar"]').addEventListener('click', () => { barridos = barridos.filter(b2 => b2 === sw && !b2.visto); if (sw && sw.visto) sw = null; sincronizar(); });
    // barra de reproducción
    barra.querySelector('[data-pl="inicio"]').addEventListener('click', () => { if (!sw) return; sw.tp = 0; pausado = false; });
    bPausa.addEventListener('click', () => { if (!sw) return; if (sw.tp >= TS) { sw.tp = 0; pausado = false; } else pausado = !pausado; });
    rango.addEventListener('input', () => { if (!sw) return; arrastrando = true; pausado = true; sw.tp = Number(rango.value) / 1000 * TS; if (sw.tp >= TS - 0.01) terminar(sw); });
    rango.addEventListener('change', () => { arrastrando = false; });
    caja.querySelectorAll('[data-vel]').forEach(b2 => b2.addEventListener('click', () => { vel = Number(b2.dataset.vel); sincronizar(); }));

    function reiniciar() {
        barridos = []; sw = null; ca = true; recap = true; nt = cfg.nt || 'glu'; rec = 'nic'; vel = 1; pausado = false;
        limpiarHist(); sincronizar();
    }
    function estado() {
        return { ca, recap, nt, rec, corriendo: !!(sw && !sw.visto), ...hist };
    }
    function avisar() { const e = estado(); cbs.forEach(f => f(e)); }

    let t0 = performance.now();
    function bucle(t) {
        const dt = Math.min(.05, (t - t0) / 1000); t0 = t;
        if (visible) { paso(dt); dibujar(); }
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
        mostrar(si) { visible = !!si; caja.hidden = !si; if (si) { dispuesto = false; aplicar(); } },
        lienzo: cv,
        prueba: {
            vel(x) { prueba = x; },
            pa() { nuevo(false); },
            tren() { nuevo(true); },
            ir(ms) { if (sw) { sw.tp = ms; pausado = true; } },
            poner(o) { if ('ca' in o) ca = o.ca; if ('recap' in o) recap = o.recap; if (o.nt) nt = o.nt; if (o.rec) rec = o.rec; sincronizar(); },
        },
    };
    caja.__sim = api;
    return api;
}
