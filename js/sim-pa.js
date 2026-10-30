/**
 * NeuroLab — sim-pa.js
 * Simulador del potencial de acción: un trozo de membrana con 1 canal de fuga de K⁺, 2 canales de Na⁺ controlados por voltaje
 * (compuerta de activación afuera + compuerta de inactivación, bola, adentro) y 2 de K⁺ controlados por voltaje (una compuerta lenta).
 * Modelo de Hodgkin y Huxley (1952) con la activación del Na⁺ corrida +4 mV y el voltaje desplazado para que el reposo sea −70 mV:
 * umbral ≈ −55, peak ≈ +35, mínimo ≈ −81 mV. Tiempo en ms del modelo, mostrado a 0,4 s por ms.
 * Los iones que cruzan son solo un reflejo de la corriente: durante un potencial de acción las concentraciones casi no cambian.
 * Herramientas a la izquierda: estímulo (intensidad 1–5 y botón) y borrar registro. A la derecha: voltímetro y registro (20 ms)
 * con cursor: al arrastrarlo sobre un registro terminado, la membrana muestra los canales en ese instante.
 * Uso: const sim = crearSimPA(caja); sim.estado(); sim.alCambiar(fn). CHEQUEOS: condiciones con nombre para los pasos «sim».
 */
const R = 15;
// Disposición: horizontal (membrana a la izquierda, voltímetro y registro a la derecha) o vertical en pantallas angostas
let W, H, ZX, ZH, MY0, MY1, XFUGA, XNA, XK, XESTIM, XREG, X0, WP, VY, VH, RY, RH, PX0, PW, PY0, PH, SC = 1, VERT = false;
function disponer(vert) {
    VERT = vert;
    if (!vert) {
        W = 1200; H = 720; ZX = 700; ZH = 720; MY0 = 300; MY1 = 362;
        XFUGA = 70; XESTIM = 130; XNA = [205, 280, 355, 430]; XK = [515, 590]; XREG = 650; SC = 1;
        X0 = ZX + 16; WP = W - X0 - 12; VY = 12; VH = 152; RY = 176; RH = H - RY - 12;
    } else {
        W = 520; ZX = 520; ZH = 500; MY0 = 200; MY1 = 262;
        XFUGA = 32; XESTIM = 72; XNA = [118, 180, 242, 304]; XK = [370, 432]; XREG = 488; SC = .78;
        X0 = 12; WP = W - 24; VY = ZH + 10; VH = 150; RY = VY + VH + 12; RH = 420; H = RY + RH + 12;
    }
    PX0 = X0 + 54; PW = WP - 70; PY0 = RY + 42; PH = RH - 84;
}
disponer(false);
const COL = { na: ['#22C55E', '#166534'], k: ['#3B82F6', '#1E3A8A'], ext: '#E0F2FE', int: '#FFF4E0', cabeza: '#FB923C', cola: '#FDBA74' };
const ESC = 0.4;                         // s reales por ms del modelo
const DT = 0.01;                         // paso de integración (ms)
const TS = 20;                           // largo del registro (ms)
const SH = 4;                            // corrimiento de la activación del Na⁺ (mV)
const AMP = [13, 29, 49, 81, 130];       // µA/cm² por nivel (pulso de 0,5 ms); umbral ≈ 32
const NIVELES = AMP.length;
const K_FLUJO = 0.0055;                  // partículas por (µA/cm² · ms) y canal

export const CHEQUEOS = {
    nivelBajo: s => s.nivel <= 2,
    nivel1:    s => s.nivel === 1,
    nivel2:    s => s.nivel === 2,
    nivelMax:  s => s.nivel === NIVELES,
    sub:       s => s.sub,
    pa:        s => s.pa,
    dosNiveles: s => s.niveles >= 2,
    pa3:       s => s.paNiv.includes(3),
    pa45:      s => s.paNiv.includes(4) || s.paNiv.includes(5),
    suma:      s => s.suma,
    curDespol: s => s.fase === 'despol',
    curRepol:  s => s.fase === 'repol',
    curHiper:  s => s.fase === 'hiper',
    refAbs:    s => s.refAbs,
    refRel:    s => s.refRel,
    relDebil:  s => s.relDebil,
    cur2do:    s => s.cur2do,
    int3:      s => s.intervalo === 3,
    int9:      s => s.intervalo === 9,
};

/* ---------- Modelo de Hodgkin y Huxley ---------- */
function tasas(V) {
    const vm = V - SH;
    const x = vm + 40, y = V + 55;
    return {
        am: Math.abs(x) < 1e-6 ? 1 : 0.1 * x / (1 - Math.exp(-x / 10)), bm: 4 * Math.exp(-(vm + 65) / 18),
        ah: 0.07 * Math.exp(-(V + 65) / 20), bh: 1 / (1 + Math.exp(-(V + 35) / 10)),
        an: Math.abs(y) < 1e-6 ? 0.1 : 0.01 * y / (1 - Math.exp(-y / 10)), bn: 0.125 * Math.exp(-(V + 65) / 80),
    };
}
function crearModelo() {
    const M = { V: -65, m: .05, h: .6, n: .32, INa: 0, IK: 0 };
    M.paso = I => {
        const r = tasas(M.V);
        M.m += DT * (r.am * (1 - M.m) - r.bm * M.m);
        M.h += DT * (r.ah * (1 - M.h) - r.bh * M.h);
        M.n += DT * (r.an * (1 - M.n) - r.bn * M.n);
        M.INa = 120 * M.m ** 3 * M.h * (M.V - 50);
        M.IK = 36 * M.n ** 4 * (M.V + 77);
        M.V += DT * (I - M.INa - M.IK - 0.3 * (M.V + 54.387));
    };
    for (let i = 0; i < 30000; i++) M.paso(0);
    M.off = -70 - M.V;                   // desplazamiento para mostrar el reposo en −70 mV
    M.reposo = { m: M.m, h: M.h, n: M.n, INa: M.INa, IK: M.IK };
    M.ini = { V: M.V, m: M.m, h: M.h, n: M.n, INa: M.INa, IK: M.IK };
    return M;
}

/* ---------- Estado de las compuertas (0 = cerrada, 1 = abierta) ---------- */
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const UMB_NA = [0.003, 0.012, 0.05, 0.2];                             // cada canal de Na⁺ se abre a un voltaje algo mayor
const abreNa = (m, i = 0) => clamp(Math.log(m ** 3 / UMB_NA[i]) / Math.log(4) + 1);
const tapaNa = h => clamp((0.42 - h) / 0.3);                         // bola de inactivación
const abreK = n => clamp(Math.log(n ** 4 / 0.0105) / Math.log(10));  // proporción respecto del reposo


export function crearSimPA(caja, cfg = {}) {
    const NEURONA = cfg.vista === 'neurona', MAXEST = cfg.max || 2, VENTANA = cfg.ventana || 0, FIJA = cfg.intensidad || 0, PAR = !!cfg.par;
    const INTERVALOS = [3, 6, 9, 12, 15], LVL1 = 3;
    // Fondo ilustrado de la vista «neurona» (img/potencial/neurona-simple.jpg); posiciones medidas en la imagen (fracción del lado)
    const NEU_IMG = { sx: .347, sy: .518, r: .124, cx1: .55, ay: .524 };
    let imgN = null;
    if (NEURONA && cfg.fondo) { imgN = new Image(); imgN.src = cfg.fondo; }
    const conImg = () => imgN && imgN.complete && imgN.naturalWidth > 0;   // pares: el 1.º siempre de intensidad 3
    caja.innerHTML = `
      <div class="nl-msim__caja">
        <aside class="nl-msim__herr">
          <p class="nl-msim__etq">${PAR ? 'Par de estímulos' : 'Estímulo'}</p>
          ${PAR ? `<div class="nl-msim__card is-estim">
            <div class="nl-msim__cuerpo nl-msim__cuerpo--int"><strong>2.º estímulo a los…</strong>
              <span class="nl-msim__niveles" role="group" aria-label="Intervalo del segundo estímulo">${INTERVALOS.map(t => `<button type="button" data-int="${t}" aria-pressed="false">${t}</button>`).join('')}</span>
              <span class="nl-msim__escala"><i>ms después del 1.º (intensidad ${LVL1})</i></span>
            </div>
          </div>` : ''}
          <div class="nl-msim__card is-estim"${FIJA ? ' hidden' : ''}>
            <div class="nl-msim__cuerpo nl-msim__cuerpo--int"><strong>${PAR ? 'Intensidad del 2.º' : 'Intensidad'}</strong>
              <span class="nl-msim__niveles" role="group" aria-label="Intensidad del estímulo">${Array.from({ length: NIVELES }, (_, i) => `<button type="button" data-lvl="${i + 1}" aria-pressed="false">${i + 1}</button>`).join('')}</span>
              <span class="nl-msim__escala" aria-hidden="true"><i>débil</i><i>fuerte</i></span>
            </div>
          </div>
          <button type="button" class="nl-msim__estim" data-acc="estimular">⚡ Estimular</button>
          <p class="nl-msim__etq">Registro</p>
          <div class="nl-msim__fila"><button type="button" class="nl-msim__chico" data-acc="borrar">Borrar registro</button></div>
        </aside>
        <canvas class="nl-msim__lienzo nl-msim__lienzo--pa" aria-label="Simulador del potencial de acción: ${NEURONA ? 'neurona con electrodos' : 'canales de la membrana'}, voltímetro y registro"></canvas>
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
        g.setTransform(2, 0, 0, 2, 0, 0);
        fondo.forEach(p => { p.x = Math.min(p.x, ZX - R); p.y = p.lado === 'out' ? Math.min(p.y, MY0 - R - 4) : Math.max(MY1 + R + 4, Math.min(p.y, ZH - 60)); });
    }
    window.addEventListener('resize', aplicar);
    const M = crearModelo();
    let nivel = FIJA || (PAR ? 5 : 1), intervalo = 3, vel = 1, visible = true, cbs = [];
    let barridos = [], sw = null, pulsos = [], tGlobal = 0, cursor = null, arrastra = false, programados = [];
    const flujos = [], acum = { na: 0, k: 0, fuga: 0 }, ondas = [], acumNa = [0, 0, 0, 0];
    let enPA = false;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const Vd = () => M.V + M.off;

    /* ---------- Iones de fondo (solo se agitan; no cambian de lado) ---------- */
    const fondo = [];
    disponer(caja.clientWidth > 0 && caja.clientWidth < 620);
    const nf = VERT ? 13 : 18;
    const sembrar = (ion, lado, n) => { for (let i = 0; i < n; i++) fondo.push({ ion, lado, x: rnd(R + 4, ZX - R - 4), y: lado === 'out' ? rnd(56, MY0 - R - 30) : rnd(MY1 + R + 30, ZH - 70), vx: rnd(-120, 120), vy: rnd(-120, 120) }); };
    sembrar('na', 'out', nf); sembrar('k', 'out', 3); sembrar('k', 'in', nf); sembrar('na', 'in', 3);
    aplicar();

    /* ---------- Estímulo y registro ---------- */
    // Estímulos por registro: máximo MAXEST; con VENTANA (ms), el 2.º solo poco después del 1.º (sin trenes de estímulos)
    const puedeEstimular = () => !sw || sw.done || (!PAR && sw.n < MAXEST && (!VENTANA || sw.t <= 1 + VENTANA));
    function estimular() {
        if (!puedeEstimular()) return;
        cursor = null;
        if (PAR) {   // un clic = par de estímulos con el intervalo elegido
            sw = { t: 0, fin: TS, done: false, stims: [], data: [], t0: tGlobal, n: 2, par: intervalo };
            barridos.push(sw);
            if (barridos.length > 2) barridos.shift();
            programar(1, LVL1); programar(1 + intervalo, nivel);
            avisar(); return;
        }
        if (!sw || sw.done) {
            sw = { t: 0, fin: TS, done: false, stims: [], data: [], t0: tGlobal, n: 1 };
            barridos.push(sw);
            if (barridos.length > 2) barridos.shift();
            programar(1, nivel);
        } else { sw.n++; programar(0, nivel); }
        avisar();
    }
    function programar(dtMs, lvl) { programados.push({ t: tGlobal + dtMs, lvl }); }
    function analizar(b) {
        const v = b.data.map(d => d[0]);
        const on = [], pk = [];
        for (let i = 1; i < v.length; i++) if (v[i - 1] < -20 && v[i] >= -20) {
            let j = i; while (j > 0 && v[j] > -55) j--;
            on.push(j);
            let k = i; while (k + 1 < v.length && v[k + 1] >= v[k]) k++;
            pk.push(k);
        }
        const tOn = on.map(i => i * .05);
        b.spikes = on.length;
        b.peaks = pk.map(i => v[i]);
        b.fases = null;
        if (on.length) {
            const i0 = on[0], ip = pk[0];
            let ir = ip; while (ir + 1 < v.length && v[ir] > -70) ir++;
            let ih = ir; while (ih + 1 < v.length && !(v[ih] >= -72 && v[ih + 1] >= v[ih])) ih++;
            b.fases = { despol: [i0, ip], repol: [ip + 1, ir], hiper: [ir + 1, ih] };
        }
        b.sub = b.stims.length > 0 && !on.length;
        b.suma = on.length > 0 && b.stims.length >= 2 && b.stims.every(s => s.lvl <= 2);
        b.refAbs = on.length > 0 && b.stims.some(s => s.lvl === NIVELES && s.t > tOn[0] + .3 && !tOn.some(t => t > s.t && t <= s.t + 4));
        b.refRel = on.length >= 2 && b.peaks[1] < b.peaks[0] - 2.5;
        b.relDebil = on.length === 1 && b.stims.length === 2 && b.stims[1].lvl <= LVL1 && b.stims[1].t - b.stims[0].t >= 8;
    }

    /* ---------- Paso de tiempo ---------- */
    function paso(dtReal) {
        const ms = dtReal / ESC * vel;
        const n = Math.max(1, Math.round(ms / DT));
        for (let k = 0; k < n; k++) {
            for (let i = programados.length - 1; i >= 0; i--) if (programados[i].t <= tGlobal) {
                const p = programados.splice(i, 1)[0];
                pulsos.push({ t: tGlobal, amp: AMP[p.lvl - 1] });
                if (sw && !sw.done) { sw.stims.push({ t: sw.t, lvl: p.lvl }); sw.fin = Math.max(sw.fin, sw.t + 8); }
            }
            let I = 0;
            pulsos = pulsos.filter(p => tGlobal - p.t < .5);
            pulsos.forEach(p => { I += p.amp; });
            M.paso(I);
            tGlobal += DT;
            if (sw && !sw.done) {
                sw.t += DT;
                if (sw.data.length < Math.round(sw.t / .05)) sw.data.push([Vd(), M.m, M.h, M.n, M.INa, M.IK]);
                if (sw.t >= sw.fin) { sw.done = true; analizar(sw); avisar(); }
            }
            if (!cursor) {
                const fs = XNA.map((_, i) => abreNa(M.m, i) * (1 - tapaNa(M.h))), sf = fs.reduce((a, b) => a + b, 0);
                if (sf > .05) fs.forEach((f, i) => { acumNa[i] += Math.max(0, -(M.INa - M.reposo.INa)) * DT * K_FLUJO * 2 * f / sf; });
                acum.k += Math.max(0, M.IK - M.reposo.IK) * DT * K_FLUJO * (abreK(M.n) > .05 ? 1 : 0);
            }
        }
        const vahora = Vd();
        if (!enPA && vahora > -20) ondas.push({ t: 0 });
        enPA = vahora > -20 ? true : vahora < -40 ? false : enPA;
        ondas.forEach(o => { o.t += dtReal / 1.1; });
        while (ondas.length && ondas[0].t > 1) ondas.shift();
        const bEst = caja.querySelector('[data-acc="estimular"]'), ok = puedeEstimular();
        if (bEst.disabled === ok) bEst.disabled = !ok;
        acum.fuga += dtReal * .35;
        acumNa.forEach((q, i) => { if (q >= 1) { acumNa[i] -= 1; flujos.push({ ion: 'na', x: XNA[i], t: 0, d: rnd(-4, 4), dur: rnd(.5, .7) }); } });
        while (acum.k >= .5) { acum.k -= .5; XK.forEach(x => flujos.push({ ion: 'k', x, t: 0, d: rnd(-6, 6), dur: rnd(.6, .8) })); }
        if (acum.fuga >= 1) { acum.fuga = 0; flujos.push({ ion: 'k', x: XFUGA, t: 0, d: 0, dur: .9 }); }
        for (let i = flujos.length - 1; i >= 0; i--) { flujos[i].t += dtReal / flujos[i].dur; if (flujos[i].t >= 1) flujos.splice(i, 1); }
        for (const p of fondo) {
            p.vx += rnd(-240, 240) * dtReal; p.vy += rnd(-240, 240) * dtReal;
            const sp = Math.hypot(p.vx, p.vy);
            if (sp > 150) { p.vx *= 150 / sp; p.vy *= 150 / sp; }
            p.x += p.vx * dtReal; p.y += p.vy * dtReal;
            if (p.x < R) { p.x = R; p.vx = Math.abs(p.vx); }
            if (p.x > ZX - R) { p.x = ZX - R; p.vx = -Math.abs(p.vx); }
            const lim = p.lado === 'out' ? [44, MY0 - R - 4] : [MY1 + R + 4, ZH - 60];
            if (p.y < lim[0]) { p.y = lim[0]; p.vy = Math.abs(p.vy); }
            if (p.y > lim[1]) { p.y = lim[1]; p.vy = -Math.abs(p.vy); }
        }
    }

    /* ---------- Lo que se muestra: en vivo o en el instante del cursor ---------- */
    function ahora() {
        if (cursor) {
            const b = barridos[barridos.length - 1], d = b.data[Math.min(b.data.length - 1, cursor.i)];
            return { V: d[0], m: d[1], h: d[2], n: d[3], INa: d[4], IK: d[5] };
        }
        return { V: Vd(), m: M.m, h: M.h, n: M.n, INa: M.INa, IK: M.IK };
    }
    function cursorEn2do() {   // cursor sobre el 2.º estímulo (±1 ms) de un registro sin 2.º PA
        const b = barridos[barridos.length - 1];
        if (!cursor || !b || !b.done || b.stims.length < 2 || b.spikes !== 1) return false;
        return Math.abs(cursor.i * .05 - b.stims[1].t) <= 1;
    }
    function faseCursor() {
        if (!cursor) return null;
        const f = barridos[barridos.length - 1].fases;
        if (!f) return null;
        for (const k of ['despol', 'repol', 'hiper']) if (cursor.i >= f[k][0] && cursor.i <= f[k][1]) return k;
        return null;
    }

    /* ---------- Dibujo ---------- */
    function rr(x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
    function texto(t, x, y, size, col, al = 'left', w = 800) {
        g.font = `${w} ${size}px "Plus Jakarta Sans", Arial, sans-serif`; g.fillStyle = col; g.textAlign = al; g.textBaseline = 'alphabetic'; g.fillText(t, x, y);
    }
    function ionDib(x, y, ion, a = 1) {
        g.globalAlpha = a;
        g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2);
        g.fillStyle = COL[ion][0]; g.fill(); g.lineWidth = 2.5; g.strokeStyle = COL[ion][1]; g.stroke();
        g.fillStyle = '#fff'; g.font = '800 11px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(ion === 'na' ? 'Na⁺' : 'K⁺', x, y + .5);
        g.globalAlpha = 1;
    }
    function subunidades(x, gap, f, s, alto = 18) {
        g.fillStyle = f; g.strokeStyle = s; g.lineWidth = 3;
        rr(x - 30, MY0 - alto, 30 - gap / 2, MY1 - MY0 + alto * 2, 8); g.fill(); g.stroke();
        rr(x + gap / 2, MY0 - alto, 30 - gap / 2, MY1 - MY0 + alto * 2, 8); g.fill(); g.stroke();
    }
    function flechaIon(x, ion, k) {   // con el cursor: el ion en el poro y una flecha del tamaño de la corriente
        const baja = ion === 'na', y = (MY0 + MY1) / 2, L = 26 + 40 * k;
        g.strokeStyle = COL[ion][1]; g.fillStyle = COL[ion][1]; g.lineWidth = 4;
        const y0 = baja ? MY0 - 34 : MY1 + 34, y1 = baja ? y0 + L + 30 : y0 - L - 30;
        g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke();
        g.beginPath(); g.moveTo(x - 9, y1 - (baja ? 12 : -12)); g.lineTo(x, y1); g.lineTo(x + 9, y1 - (baja ? 12 : -12)); g.fill();
        ionDib(x, y, ion);
    }
    function canalNa(x, e, i) {
        g.save(); g.translate(x, 0); g.scale(SC, 1); g.translate(-x, 0);
        const a = abreNa(e.m, i), t = tapaNa(e.h);
        subunidades(x, 8 + 16 * a, '#BBF7D0', COL.na[1]);
        // compuerta de activación (afuera): barra que gira al abrir
        g.save(); g.translate(x - 15, MY0 - 24); g.rotate(-1.15 * a);
        g.fillStyle = COL.na[1]; rr(0, -5, 30, 10, 5); g.fill(); g.restore();
        // compuerta de inactivación (adentro): bola con cadena que tapa el poro
        const bx = x + 34 - 34 * t, by = MY1 + 44 - 30 * t;
        g.strokeStyle = '#991B1B'; g.lineWidth = 2.5; g.setLineDash([4, 3]);
        g.beginPath(); g.moveTo(x + 22, MY1 + 18); g.quadraticCurveTo(x + 30, by + 8, bx, by); g.stroke(); g.setLineDash([]);
        g.fillStyle = '#DC2626'; g.beginPath(); g.arc(bx, by, 9, 0, Math.PI * 2); g.fill();
        g.restore();
        const k = clamp(-(e.INa - M.reposo.INa) / 400);
        if (cursor && a * (1 - t) > .2 && k > .02) flechaIon(x, 'na', k);
    }
    function canalK(x, e) {
        g.save(); g.translate(x, 0); g.scale(SC, 1); g.translate(-x, 0);
        const a = abreK(e.n);
        subunidades(x, 8 + 16 * a, '#BFDBFE', COL.k[1]);
        g.save(); g.translate(x - 15, MY1 + 24); g.rotate(1.15 * a);
        g.fillStyle = COL.k[1]; rr(0, -5, 30, 10, 5); g.fill(); g.restore();
        g.restore();
        // el K⁺ sale mientras su canal siga abierto (el interior está sobre el equilibrio del K⁺), aunque la corriente sea pequeña
        const k = clamp(Math.max((e.IK - M.reposo.IK) / 400, a * .25));
        if (cursor && a > .2 && e.IK > 0) flechaIon(x, 'k', k);
    }
    function canalFuga(x) {
        g.fillStyle = '#DBEAFE'; g.strokeStyle = '#60A5FA'; g.lineWidth = 2.5;
        rr(x - 20, MY0 - 8, 14, MY1 - MY0 + 16, 6); g.fill(); g.stroke();
        rr(x + 6, MY0 - 8, 14, MY1 - MY0 + 16, 6); g.fill(); g.stroke();
    }
    function dibujarNeurona(e) {
        g.fillStyle = COL.ext; g.fillRect(0, 0, ZX, ZH);
        const IMG = conImg();
        let sx = ZX * .34, sy = ZH * .52, r = ZX * .13, cx0 = sx + r * .92, cx1 = cx0 + ZX * .08, ay = sy;
        const aw = VERT ? 14 : 18;
        if (IMG) {
            sx = ZX * NEU_IMG.sx; sy = ZH * NEU_IMG.sy; r = ZX * NEU_IMG.r; cx0 = sx + r * .92; cx1 = ZX * NEU_IMG.cx1; ay = ZH * NEU_IMG.ay;
            g.drawImage(imgN, 0, 0, ZX, ZH);
        } else {
        const NF = '#E9D5FF', NS = '#7C3AED';
        g.lineCap = 'round';
        [[-1.0, -.6, -1.9, -1.1], [-1.2, .2, -2.1, .35], [-.8, .9, -1.6, 1.8], [.2, 1.2, .1, 2.3]].forEach(([a, b, c, d]) => {
            g.strokeStyle = NS; g.lineWidth = aw + 8;
            g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + a * r, sy + b * r, sx + c * r, sy + d * r); g.stroke();
            g.strokeStyle = NF; g.lineWidth = aw;
            g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + a * r, sy + b * r, sx + c * r, sy + d * r); g.stroke();
        });
        g.lineCap = 'butt';
        // axón con mielina y nodos
        g.fillStyle = NF; g.strokeStyle = NS; g.lineWidth = 3;
        g.fillRect(cx1, ay - aw / 2, ZX - cx1, aw); g.strokeRect(cx1, ay - aw / 2, ZX - cx1 + 4, aw);
        const seg = (ZX - cx1 - 20) / 3;
        for (let i = 0; i < 3; i++) { g.fillStyle = '#F8FAFC'; g.strokeStyle = '#94A3B8'; rr(cx1 + 14 + i * seg, ay - aw / 2 - 10, seg - 16, aw + 20, 12); g.fill(); g.stroke(); }
        // cono y soma
        g.fillStyle = NF; g.strokeStyle = NS; g.lineWidth = 4;
        g.beginPath(); g.moveTo(cx0, sy - r * .45); g.lineTo(cx1, ay - aw / 2); g.lineTo(cx1, ay + aw / 2); g.lineTo(cx0, sy + r * .45); g.closePath(); g.fill(); g.stroke();
        g.beginPath(); g.arc(sx, sy, r, 0, Math.PI * 2); g.fill(); g.stroke();
        }
        // brillo: potencial local (tenue, graduado) o potencial de acción (intenso)
        const u = e.V > -20 ? 1 : clamp((e.V + 70) / 18);
        if (u > .02) {
            g.globalAlpha = (e.V > -20 ? .85 : .55 * u) * (IMG ? .75 : 1);
            g.fillStyle = e.V > -20 ? '#F59E0B' : '#FCD34D';
            g.beginPath(); g.arc(sx, sy, r, 0, Math.PI * 2); g.fill();
            g.beginPath(); g.moveTo(cx0, sy - r * .45); g.lineTo(cx1, ay - aw / 2); g.lineTo(cx1, ay + aw / 2); g.lineTo(cx0, sy + r * .45); g.closePath(); g.fill();
            g.globalAlpha = 1;
        }
        // el potencial de acción viaja por el axón
        if (!cursor) ondas.forEach(o => {
            const x = cx1 + (ZX - cx1) * o.t;
            g.globalAlpha = Math.max(0, 1 - o.t * .6);
            const gr = g.createRadialGradient(x, ay, 2, x, ay, 34);
            gr.addColorStop(0, 'rgba(245,158,11,.95)'); gr.addColorStop(1, 'rgba(245,158,11,0)');
            g.fillStyle = gr; g.beginPath(); g.arc(x, ay, 34, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
        });
        const fs = VERT ? 16 : 19;
        if (IMG) { g.save(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 5; g.lineJoin = 'round'; g.font = `800 ${fs}px "Plus Jakarta Sans", Arial, sans-serif`; g.textAlign = 'center';
            [['Soma', sx + r * .35, sy - r - 12], ['Dendritas', sx - r * 1.7, sy + r * 2.9], ['Cono axónico', (cx0 + cx1) / 2 + 24, sy + r * .45 + 40], ['Axón', ZX - 50, ay + aw / 2 + 34]]
                .forEach(([t, x, y]) => { g.strokeText(t, x, y); g.fillStyle = '#4C1D95'; g.fillText(t, x, y); }); g.restore(); }
        else texto('Soma', sx, sy + 6, fs, '#5B21B6', 'center');
        if (!IMG) {
            texto('Dendritas', sx - r * 1.7, sy + r * 2.9, fs, '#5B21B6', 'center');
            texto('Cono axónico', (cx0 + cx1) / 2 + 24, sy + r * .45 + 40, fs, '#5B21B6', 'center');
            texto('Axón', ZX - 50, ay + aw / 2 + 34, fs, '#5B21B6', 'center');
        }
        // electrodos: estímulo en el soma; registro en el cono (dentro) y referencia afuera
        const est = pulsos.length > 0, ex = sx - r * .5, ey = sy - r * .86, rx = (cx0 + cx1) / 2, ry = sy - r * .3;
        const pipeta = (x0, y0, x1, y1, col) => { g.strokeStyle = col; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.lineWidth = 2.5; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 + (x1 - x0) * .06, y1 + (y1 - y0) * .06); g.stroke(); g.lineCap = 'butt'; };
        if (est) { g.fillStyle = 'rgba(245,158,11,.45)'; g.beginPath(); g.arc(ex, ey, 26, 0, Math.PI * 2); g.fill(); }
        pipeta(ex - r * .7, 80, ex, ey, '#475569');
        texto('⚡ Estímulo', ex - r * .7, 64, fs, '#B45309', 'center');
        // registro: un electrodo dentro del cono y otro afuera, al lado (como en la membrana)
        const refx = rx + r * .9, refy = sy - r * .95, top = 80;
        pipeta(rx + r * .2, top, rx, ry, '#475569');
        pipeta(refx, top, refx, refy, '#DC2626');
        texto('Registro', rx + r * .2 - 10, top - 4, fs, '#334155', 'right');
        g.lineWidth = 3;
        if (!VERT) {
            g.strokeStyle = '#475569'; g.beginPath(); g.moveTo(rx + r * .2, top); g.lineTo(rx + r * .2, 30); g.lineTo(ZX - 10, 30); g.lineTo(ZX - 10, 100); g.lineTo(ZX + 16, 100); g.stroke();
            g.strokeStyle = '#DC2626'; g.beginPath(); g.moveTo(refx, top); g.lineTo(refx, 42); g.lineTo(ZX - 22, 42); g.lineTo(ZX - 22, 130); g.lineTo(ZX + 16, 130); g.stroke();
        } else {
            g.strokeStyle = '#475569'; g.beginPath(); g.moveTo(rx + r * .2, top); g.lineTo(rx + r * .2, 30); g.lineTo(W - 8, 30); g.lineTo(W - 8, VY); g.stroke();
            g.strokeStyle = '#DC2626'; g.beginPath(); g.moveTo(refx, top); g.lineTo(refx, 42); g.lineTo(W - 18, 42); g.lineTo(W - 18, VY); g.stroke();
        }
    }
    function dibujar() {
        const e = ahora();
        g.clearRect(0, 0, W, H);
        if (NEURONA) { dibujarNeurona(e); panelDer(e); return; }
        g.fillStyle = COL.ext; g.fillRect(0, 0, ZX, MY0);
        g.fillStyle = COL.int; g.fillRect(0, MY1, ZX, ZH - MY1);
        g.fillStyle = '#FFEDD5'; g.fillRect(0, MY0, ZX, MY1 - MY0);
        texto('AFUERA', 16, 32, 20, '#0C4A6E');
        texto('ADENTRO', 16, ZH - 16, 20, '#7C2D12');
        const ocupado = x => [XFUGA, ...XNA, ...XK].some(c => Math.abs(c - x) < 36 * SC);
        for (let x = 10; x < ZX; x += 20) {
            if (ocupado(x)) continue;
            g.strokeStyle = COL.cola; g.lineWidth = 2.5;
            g.beginPath(); g.moveTo(x - 3, MY0 + 18); g.lineTo(x - 3, MY0 + 29); g.moveTo(x + 3, MY0 + 18); g.lineTo(x + 3, MY0 + 29);
            g.moveTo(x - 3, MY1 - 18); g.lineTo(x - 3, MY1 - 29); g.moveTo(x + 3, MY1 - 18); g.lineTo(x + 3, MY1 - 29); g.stroke();
            g.fillStyle = COL.cabeza;
            g.beginPath(); g.arc(x, MY0 + 9, 8, 0, Math.PI * 2); g.fill();
            g.beginPath(); g.arc(x, MY1 - 9, 8, 0, Math.PI * 2); g.fill();
        }
        fondo.forEach(p => ionDib(p.x, p.y, p.ion));
        canalFuga(XFUGA);
        XNA.forEach((x, i) => canalNa(x, e, i));
        XK.forEach(x => canalK(x, e));
        // iones que cruzan: Na⁺ hacia adentro, K⁺ hacia afuera (aparecen y se desvanecen: casi no cambian las concentraciones)
        flujos.forEach(f => {
            const ya = f.ion === 'na' ? MY0 - 46 : MY1 + 46, yb = f.ion === 'na' ? MY1 + 50 : MY0 - 50;
            const u = f.t, a = u < .15 ? u / .15 : u > .7 ? (1 - u) / .3 : 1;
            ionDib(f.x + f.d * (u > .5 ? 1 : 0), ya + (yb - ya) * u, f.ion, a);
        });
        // electrodo de estímulo (adentro) y del voltímetro (a ambos lados, en el mismo punto)
        const est = pulsos.length > 0;
        const px0 = XESTIM - 34, py0 = ZH - 110, py1 = MY1 + 44;
        if (est) { g.fillStyle = 'rgba(245,158,11,.45)'; g.beginPath(); g.arc(XESTIM, py1, 22, 0, Math.PI * 2); g.fill(); }
        g.strokeStyle = '#475569'; g.lineCap = 'round';
        g.lineWidth = 6; g.beginPath(); g.moveTo(px0, py0); g.lineTo(XESTIM, py1); g.stroke();
        g.lineWidth = 2.5; g.beginPath(); g.moveTo(XESTIM, py1); g.lineTo(XESTIM + 2, py1 - 8); g.stroke(); g.lineCap = 'butt';
        texto('⚡ Estímulo', Math.max(px0, 56), py0 + 26, VERT ? 15 : 17, '#B45309', 'center');
        const ya = MY0 - 22, yb = MY1 + 22;
        g.lineWidth = 3;
        if (!VERT) {
            g.strokeStyle = '#475569'; g.beginPath(); g.moveTo(ZX + 16, 100); g.lineTo(ZX - 10, 100); g.lineTo(ZX - 10, ya - 40); g.lineTo(XREG, ya - 40); g.lineTo(XREG, ya); g.stroke();
            g.strokeStyle = '#DC2626'; g.beginPath(); g.moveTo(ZX + 16, 130); g.lineTo(ZX - 4, 130); g.lineTo(ZX - 4, yb + 40); g.lineTo(XREG, yb + 40); g.lineTo(XREG, yb); g.stroke();
        } else {
            g.strokeStyle = '#475569'; g.beginPath(); g.moveTo(XREG, ya); g.lineTo(XREG, ya - 30); g.lineTo(W - 8, ya - 30); g.lineTo(W - 8, VY); g.stroke();
            g.strokeStyle = '#DC2626'; g.beginPath(); g.moveTo(XREG, yb); g.lineTo(XREG, yb + 30); g.lineTo(W - 18, yb + 30); g.lineTo(W - 18, VY); g.stroke();
        }
        g.fillStyle = '#475569'; g.beginPath(); g.moveTo(XREG - 5, ya - 6); g.lineTo(XREG + 5, ya - 6); g.lineTo(XREG, ya + 4); g.fill();
        g.fillStyle = '#DC2626'; g.beginPath(); g.moveTo(XREG - 5, yb + 6); g.lineTo(XREG + 5, yb + 6); g.lineTo(XREG, yb - 4); g.fill();
        leyenda();
        panelDer(e);
    }
    function leyenda() {
        const y = ZH - 46, fs = VERT ? 14 : 16;
        let x = XESTIM + (VERT ? 30 : 42);
        const item = (dib, t) => { dib(x, y); texto(t, x + 16, y + 6, fs, '#7C2D12', 'left', 700); x += (VERT ? 28 : 34) + g.measureText(t).width; };
        item((x0, y0) => { g.fillStyle = COL.na[1]; rr(x0 - 9, y0 - 4, 18, 8, 4); g.fill(); }, VERT ? 'Activación' : 'Activación Na⁺');
        item((x0, y0) => { g.fillStyle = '#DC2626'; g.beginPath(); g.arc(x0, y0, 7, 0, Math.PI * 2); g.fill(); }, VERT ? 'Inactivación' : 'Inactivación Na⁺');
        item((x0, y0) => { g.fillStyle = COL.k[1]; rr(x0 - 9, y0 - 4, 18, 8, 4); g.fill(); }, 'Compuerta K⁺');
    }
    const Ym = mv => PY0 + (50 - mv) / 145 * PH;
    const Xt = (t, fin) => PX0 + PW * t / fin;
    function panelDer(e) {
        g.fillStyle = '#1A0E2E';
        if (VERT) g.fillRect(0, ZH, W, H - ZH); else g.fillRect(ZX, 0, W - ZX, H);
        // voltímetro
        const vy = VY;
        g.fillStyle = '#0F0820'; g.strokeStyle = cursor ? '#FCD34D' : '#A78BFA'; g.lineWidth = 2; rr(X0, vy, WP, VH, 14); g.fill(); g.stroke();
        texto(cursor ? 'VOLTÍMETRO · CURSOR' : 'VOLTÍMETRO', X0 + 14, vy + 26, 16, cursor ? '#FCD34D' : '#C4B5FD', 'left', 800);
        const v = Math.round(e.V);
        texto(`${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)} mV`, X0 + WP / 2, vy + VH - 72, 50, v > -55 ? '#FCD34D' : '#93C5FD', 'center', 800);
        const sx0 = X0 + 24, sw0 = WP - 48, sy = vy + VH - 48, X = mv => sx0 + (mv + 100) / 160 * sw0;
        const gr = g.createLinearGradient(sx0, 0, sx0 + sw0, 0);
        gr.addColorStop(0, '#1D4ED8'); gr.addColorStop(.55, '#64748B'); gr.addColorStop(1, '#F59E0B');
        g.fillStyle = gr; rr(sx0, sy, sw0, 12, 6); g.fill();
        [-100, -70, -50, 0, 50].forEach(m => { texto(String(m).replace('-', '−'), X(m), sy + 32, 15, '#C4B5FD', 'center', 700); });
        const xa = X(clamp(v, -100, 60));
        g.fillStyle = '#fff'; g.beginPath(); g.moveTo(xa, sy - 4); g.lineTo(xa - 7, sy - 14); g.lineTo(xa + 7, sy - 14); g.closePath(); g.fill();
        if (!VERT) {
            g.strokeStyle = '#475569'; g.lineWidth = 3; g.beginPath(); g.moveTo(X0, 100); g.lineTo(X0 + 8, 100); g.stroke();
            g.strokeStyle = '#DC2626'; g.beginPath(); g.moveTo(X0, 130); g.lineTo(X0 + 8, 130); g.stroke();
        }
        // registro
        g.fillStyle = '#fff'; rr(X0, RY, WP, RH, 14); g.fill();
        texto('Registro (mV)', X0 + 14, RY + 26, 18, '#334155');
        const b = barridos[barridos.length - 1], fin = b ? Math.max(TS, b.fin) : TS;
        g.strokeStyle = '#E2E8F0'; g.lineWidth = 1;
        [40, 0, -40, -80].forEach(m => { g.beginPath(); g.moveTo(PX0, Ym(m)); g.lineTo(PX0 + PW, Ym(m)); g.stroke(); texto(String(m).replace('-', '−'), PX0 - 8, Ym(m) + 5, 16, '#64748B', 'right', 700); });
        g.setLineDash([6, 5]); g.lineWidth = 1.5;
        g.strokeStyle = '#94A3B8'; g.beginPath(); g.moveTo(PX0, Ym(-70)); g.lineTo(PX0 + PW, Ym(-70)); g.stroke();
        g.strokeStyle = '#DC2626'; g.beginPath(); g.moveTo(PX0, Ym(-55)); g.lineTo(PX0 + PW, Ym(-55)); g.stroke(); g.setLineDash([]);
        texto('reposo', PX0 + PW - 2, Ym(-70) + 18, 15, '#64748B', 'right', 700);
        texto('umbral', PX0 + PW - 2, Ym(-55) - 6, 15, '#DC2626', 'right', 700);
        for (let t = 0; t <= fin + .01; t += 5) texto(String(t), Xt(t, fin), PY0 + PH + 22, 15, '#64748B', 'center', 700);
        texto('ms', PX0 + PW, PY0 + PH + 42, 15, '#64748B', 'right', 700);
        barridos.forEach((s, k) => {
            const ult = k === barridos.length - 1;
            g.strokeStyle = ult ? '#7C3AED' : 'rgba(100,116,139,.35)'; g.lineWidth = ult ? 3 : 2;
            g.beginPath();
            s.data.forEach((d, i) => { const x = Xt(i * .05, fin), y = Ym(clamp(d[0], -95, 50)); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
            g.stroke();
            if (ult) s.stims.forEach(st => {
                const x = Xt(st.t, fin);
                g.fillStyle = '#F59E0B'; g.beginPath(); g.moveTo(x, PY0 + PH + 2); g.lineTo(x - 6, PY0 + PH - 10); g.lineTo(x + 6, PY0 + PH - 10); g.closePath(); g.fill();
                texto(String(st.lvl), x, PY0 + PH - 14, 14, '#B45309', 'center', 800);
            });
        });
        if (cursor) {
            const x = Xt(cursor.i * .05, fin);
            g.strokeStyle = '#F59E0B'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, PY0); g.lineTo(x, PY0 + PH); g.stroke();
            g.fillStyle = '#F59E0B'; g.beginPath(); g.arc(x, Ym(clamp(e.V, -95, 50)), 7, 0, Math.PI * 2); g.fill();
        }
    }

    /* ---------- Cursor sobre el registro ---------- */
    function ponerCursor(ev) {
        const b = barridos[barridos.length - 1];
        if (!b || !b.done) return false;
        const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W, y = (ev.clientY - r.top) / r.height * H;
        if (x < PX0 - 20 || y < RY || y > RY + RH) return false;
        const fin = Math.max(TS, b.fin);
        const i = Math.round(clamp((x - PX0) / PW) * fin / .05);
        cursor = { i: Math.min(b.data.length - 1, Math.max(0, i)) };
        avisar();
        return true;
    }
    cv.addEventListener('pointerdown', ev => { if (ponerCursor(ev)) { arrastra = true; cv.setPointerCapture?.(ev.pointerId); ev.preventDefault(); } });
    cv.addEventListener('pointermove', ev => { if (arrastra) ponerCursor(ev); });
    cv.addEventListener('pointerup', () => { arrastra = false; });
    cv.addEventListener('pointercancel', () => { arrastra = false; });

    /* ---------- Herramientas ---------- */
    function sincronizar() {
        caja.querySelectorAll('[data-lvl]').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.lvl) === nivel ? 'true' : 'false'));
        caja.querySelectorAll('[data-int]').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.int) === intervalo ? 'true' : 'false'));
        avisar();
    }
    caja.querySelectorAll('[data-lvl]').forEach(b => b.addEventListener('click', () => { nivel = Number(b.dataset.lvl); sincronizar(); }));
    caja.querySelectorAll('[data-int]').forEach(b => b.addEventListener('click', () => { intervalo = Number(b.dataset.int); sincronizar(); }));
    caja.querySelector('[data-acc="estimular"]').addEventListener('click', estimular);
    caja.querySelector('[data-acc="borrar"]').addEventListener('click', () => { barridos = barridos.filter(b => !b.done); cursor = null; avisar(); });

    /* ---------- Estado acumulado (para los chequeos) ---------- */
    let hist = { sub: false, pa: false, niveles: new Set(), suma: false, refAbs: false, refRel: false, relDebil: false };
    function reiniciar() {
        barridos = []; sw = null; programados = []; pulsos = []; cursor = null; ondas.length = 0; flujos.length = 0; enPA = false;
        hist = { sub: false, pa: false, niveles: new Set(), suma: false, refAbs: false, refRel: false, relDebil: false };
        Object.assign(M, M.ini); nivel = FIJA || (PAR ? 5 : 1); intervalo = 3; acumNa.fill(0); sincronizar();
    }
    function estado() {
        barridos.filter(b => b.done).forEach(b => {
            hist.sub = hist.sub || b.sub; hist.pa = hist.pa || b.spikes > 0; hist.suma = hist.suma || b.suma;
            hist.refAbs = hist.refAbs || b.refAbs; hist.refRel = hist.refRel || b.refRel; hist.relDebil = hist.relDebil || b.relDebil;
            if (b.spikes > 0 && b.stims.length === 1) hist.niveles.add(b.stims[0].lvl);
        });
        return { nivel, V: Math.round(ahora().V), corriendo: !!(sw && !sw.done), sub: hist.sub, pa: hist.pa, niveles: hist.niveles.size, paNiv: [...hist.niveles],
                 suma: hist.suma, refAbs: hist.refAbs, refRel: hist.refRel, relDebil: hist.relDebil, fase: faseCursor(), cursor: !!cursor,
                 intervalo, cur2do: cursorEn2do() };
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
        mostrar(si) { visible = !!si; caja.hidden = !si; if (si) aplicar(); },
        lienzo: cv,
        // Para las pruebas automáticas: velocidad, estímulos programados (ms del modelo) y cursor en una fase
        prueba: {
            vel(x) { vel = x; },
            nivel(n) { nivel = clamp(n, 1, NIVELES); sincronizar(); },
            par(t, lvl) { intervalo = t; nivel = lvl; sincronizar(); estimular(); },
            cursor2() { const b = barridos[barridos.length - 1]; if (!b || b.stims.length < 2) return false; cursor = { i: Math.round(b.stims[1].t / .05) + 4 }; avisar(); return true; },
            serie(lista) { lista.forEach(([t, lvl], k) => setTimeout(() => { nivel = lvl; sincronizar(); estimular(); }, t * ESC * 1000 / vel)); },
            cursor(f) {
                const b = barridos[barridos.length - 1];
                if (!b || !b.fases) return false;
                const [a, z] = b.fases[f]; cursor = { i: Math.round(a + (z - a) * (f === 'despol' ? .75 : .5)) }; avisar(); return true;
            },
        },
    };
    caja.__sim = api;
    return api;
}
