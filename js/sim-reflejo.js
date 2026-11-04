/**
 * NeuroLab — sim-reflejo.js
 * Simulador del circuito reflejo: una persona sentada con la pierna colgando, el corte de la médula y el ganglio de la
 * raíz dorsal; las neuronas se dibujan encima con su color. Dos estímulos:
 *   · Golpe en el tendón rotuliano → huso del cuádriceps → sensitiva → motoneurona del extensor → la pierna se extiende;
 *     una colateral excita a una interneurona inhibitoria que frena a la motoneurona del flexor.
 *   · Clavo bajo el pie → terminación libre → sensitiva del dolor → interneurona excitatoria → motoneurona del flexor
 *     (el pie se aleja); otra interneurona inhibitoria frena al extensor. Con `ascendente`, una neurona de proyección
 *     cruza la médula y sube al tálamo y a la corteza: el dolor se siente después de que el pie ya se movió.
 * Cada registro se calcula entero al empezar (espigas en ms, impulsos por cada camino, ángulo de la rodilla) y todo lo
 * dibujado depende del instante `tp`: la barra permite pausar, volver, arrastrar y ver a 0,25× o 0,5×.
 * La pierna (muslo fijo; pierna y pie giran en la rodilla) se dibuja con trazos SVG (Path2D); con `fondo` y `pierna`
 * (ilustraciones; la pierna en PNG transparente) se usan las imágenes y el código dibuja encima lo que se mueve.
 * Uso: const sim = crearSimReflejo(caja, { controles: ['golpe', 'clavo', 'inh'], ascendente: false });
 * sim.estado(); sim.alCambiar(fn). CHEQUEOS: condiciones con nombre para los pasos «sim».
 */
const LENTO = 0.06, RAPIDO = 0.011;          // s reales por ms a 1× (con impulsos viajando / el resto)
const VELS = [0.25, 0.5, 1];
const TS = { rot: 320, ret: 600 };            // largo de cada registro (ms)

export const CHEQUEOS = {
    golpe:       s => s.golpe,
    golpeSinInh: s => s.golpeSinInh,
    inhOff:      s => !s.inh,
    inhOn:       s => s.inh,
    clavo:       s => s.clavo,
    dolor:       s => s.dolor,
    lesion:      s => s.lesion,
    clavoLesion: s => s.clavoLesion,
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Disposición: zona del dibujo en coordenadas locales 760 × 720; a la derecha (o abajo, en pantallas angostas) el registro
let W, H, ZX, S, ZH, X0, WP, VY, VH, RY, RH, VERT = false;
function disponer(vert) {
    VERT = vert;
    if (!vert) { W = 1200; H = 720; ZX = 760; S = 1; ZH = 720; X0 = ZX + 14; WP = W - X0 - 12; VY = 12; VH = 112; RY = VY + VH + 12; RH = H - RY - 12; }
    else { W = 520; ZX = 520; S = 520 / 760; ZH = Math.round(720 * S); X0 = 12; WP = W - 24; VY = ZH + 10; VH = 112; RY = VY + VH + 10; RH = 560; H = RY + RH + 12; }
}
disponer(false);

/* ---------------- Anatomía (coordenadas locales de la zona) ---------------- */
const K = [122, 418];                          // rodilla: eje de giro de la pierna
const MED = { x: 600, y: 300, rx: 118, ry: 90 };
const GANGLIO = { x: 442, y: 214, rx: 30, ry: 20 };
const J = [392, 270];                          // unión de las raíces: nervio espinal
const CEREBRO = { x: 560, y: 8, w: 192, h: 128 };          // corte coronal (3:2, como la ilustración de 1536 × 1024)
const TALAMO = [668, 92], TALAMO_I = [644, 92];            // la vía cruzó en la médula: sube al tálamo del lado derecho del dibujo
const PIERNA_S1 = [662, 30];                               // área de la pierna de la corteza somatosensorial: cara medial (lóbulo paracentral)
const LESION = [698, 180];

// Neuronas: soma, color y caminos (d en coordenadas fijas; `dPie` en coordenadas de la pierna, que gira en K)
const NEU = {
    ia:    { nombre: 'Sensitiva del huso', col: '#2563EB', soma: [430, 206], r: 11 },
    me:    { nombre: 'Motoneurona del extensor', col: '#DC2626', soma: [524, 350], r: 13 },
    mf:    { nombre: 'Motoneurona del flexor', col: '#EA580C', soma: [560, 358], r: 12 },
    iinh:  { nombre: 'Interneurona inhibitoria', col: '#7C3AED', soma: [584, 316], r: 8 },
    noc:   { nombre: 'Sensitiva del dolor', col: '#0891B2', soma: [452, 224], r: 10 },
    iexc:  { nombre: 'Interneurona excitatoria', col: '#16A34A', soma: [556, 284], r: 8 },
    iinh2: { nombre: 'Interneurona inhibitoria', col: '#9333EA', soma: [528, 304], r: 8 },
    proy:  { nombre: 'Neurona que sube al encéfalo', col: '#CA8A04', soma: [570, 252], r: 8 },
    tal:   { nombre: 'Neurona del tálamo', col: '#CA8A04', soma: TALAMO, r: 7 },
};
const D = {
    // sensitiva del huso: huso → nervio femoral → raíz dorsal (soma en el ganglio) → médula → motoneurona del extensor
    iaPer:  'M252,388 C292,380 330,372 352,360 C368,340 380,302 392,270 C398,246 410,216 430,206',
    iaCen:  'M430,206 C462,198 504,212 528,238 C546,258 546,306 532,340',
    iaCol:  'M545,282 C560,294 572,304 579,311',
    me:     'M524,350 C506,370 470,362 440,342 C416,326 400,300 393,276 C384,306 372,338 354,366 C330,384 290,394 234,398',
    iinh:   'M584,316 C588,330 582,342 570,350',
    mf:     'M560,358 C534,392 482,374 446,352 C418,332 401,302 394,280 C385,310 372,344 356,374 C334,402 298,432 244,440',
    nocPie: 'M84,676 C100,640 130,600 140,540 C146,500 146,462 142,432',
    nocMus: 'M142,432 C200,452 292,448 344,420 C362,398 377,330 391,282 C397,254 412,232 452,224',
    nocCen: 'M452,224 C480,222 506,230 524,246 C534,252 542,256 549,259',
    nocExc: 'M549,259 C552,268 554,274 555,277',
    nocInh: 'M549,259 C541,272 534,286 530,297',
    nocPro: 'M549,259 C556,256 561,254 564,253',
    iexc:   'M556,284 C568,310 570,330 564,346',
    iinh2:  'M528,304 C524,318 524,328 525,337',
    proy:   'M570,252 C592,264 602,330 612,346 C640,354 670,340 688,318 C702,290 700,236 698,206 C696,160 684,120 670,99',
    tal:    'M668,92 C669,72 666,50 663,34',
};
// Qué neuronas forman cada circuito (para dibujar el que corresponde)
const CIRC = {
    rot: ['ia', 'me', 'mf', 'iinh'],
    ret: ['noc', 'iexc', 'iinh2', 'mf', 'me'],
};
// Caminos de cada neurona (para el brillo del axón) y caminos inhibitorios
const CAMINOS = { ia: ['iaPer', 'iaCen', 'iaCol'], me: ['me'], mf: ['mf'], iinh: ['iinh'], noc: ['nocPie', 'nocMus', 'nocCen', 'nocExc', 'nocInh', 'nocPro'], iexc: ['iexc'], iinh2: ['iinh2'], proy: ['proy'], tal: ['tal'] };
const INHIB = new Set(['iinh', 'iinh2']);

// Pierna y pie (coordenadas de la pierna colgando; giran en K)
const PIERNA = 'M94,410 C88,450 96,520 104,600 C106,626 108,640 110,650 C96,660 70,664 52,668 C42,672 44,684 56,686 C86,690 124,688 152,684 C160,682 162,670 156,656 C150,640 146,620 146,600 C150,520 156,470 152,426 Z';
const MUSLO = 'M372,372 C330,364 220,364 150,372 C118,376 96,392 96,416 C96,440 116,456 148,458 C220,462 330,462 372,456 C392,452 396,378 372,372 Z';
const CUADRICEPS = 'M346,378 C300,370 220,370 162,380 C150,384 150,402 166,404 C226,410 300,410 346,402 C356,398 356,382 346,378 Z';
const ISQUIO = 'M346,424 C300,418 230,418 172,426 C158,430 158,446 172,448 C232,454 302,454 346,446 C356,442 356,428 346,424 Z';
const ROTULA = [90, 410];
const TUBEROSIDAD = [102, 472];                // inserción del tendón rotuliano en la tibia (coordenadas de la pierna)
const INS_FLEX = [148, 470];                   // inserción de los isquiotibiales (coordenadas de la pierna)
const HUSO = [252, 388], PLACA_E = [234, 398], PLACA_F = [244, 440], LIBRE = [84, 676];
const CLAVO = { x: 92, yTope: 678 };           // punta del clavo cuando toca la planta
const ESC = { s: 0.85, dx: 110, dy: 60 };      // la escena (coordenadas de dibujo) dentro de la zona de 760 × 720

/* ---------------- Modelo de un registro ---------------- */
// Núcleo de activación muscular (alfa, τ en ms)
const alfa = (dt, tau) => dt <= 0 ? 0 : (dt / tau) * Math.exp(1 - dt / tau);
function simular(o) {
    const TT = TS[o.tipo], sp = {}, imp = [], inhibida = {};
    const add = (n, t) => (sp[n] = sp[n] || []).push(t);
    const viaje = (camino, t0, dur, cfg = {}) => imp.push({ camino, t0, dur, ...cfg });
    const tonico = (n, desde, cada, fase) => { for (let t = desde + fase; t < TT - 5; t += cada) add(n, t); };
    const dolorAntes = [];
    let tDolor = null, tCorteza = null;
    if (o.tipo === 'rot') {
        const sens = [6, 9, 12];
        sens.forEach(t => { add('ia', t); viaje(['iaPer', 'iaCen'], t, 12); viaje(['iaCol'], t + 11, 1); });
        const llega = sens.map(t => t + 12);
        llega.forEach((t, i) => { add('me', t + 1); viaje(['me'], t + 1, 10); });
        add('me', llega[2] + 4); viaje(['me'], llega[2] + 4, 10);
        // tono de base: espigas lentas en ambas motoneuronas
        tonico('me', 0, 46, 14);
        if (o.inh) {
            llega.forEach(t => { add('iinh', t + 1); viaje(['iinh'], t + 1, 1.2); });
            inhibida.mf = [llega[0] + 2, 170];
        } else {
            [40, 50, 60].forEach(t => { add('mf', t); viaje(['mf'], t, 10); });   // el flexor estirado responde: se opone a la extensión
        }
        tonico('mf', 0, 46, 36);
    } else {
        const noc = [12, 18, 24, 30, 36, 42];
        const DN = 55;
        noc.forEach(t => {
            add('noc', t);
            viaje(['nocPie', 'nocMus', 'nocCen'], t, DN);
            viaje(['nocExc'], t + DN, 1); viaje(['nocInh'], t + DN, 1);
            if (o.asc) viaje(['nocPro'], t + DN, 1);
        });
        const llega = noc.map(t => t + DN + 1);
        llega.forEach(t => { add('iexc', t + 0.5); viaje(['iexc'], t + 0.5, 1.4); add('mf', t + 2); viaje(['mf'], t + 2, 10); });
        if (o.inh) {
            llega.forEach(t => { add('iinh2', t + 0.5); viaje(['iinh2'], t + 0.5, 1.2); });
            inhibida.me = [llega[0] + 2, 330];
        }
        tonico('me', 0, 46, 14);
        tonico('mf', 0, 46, 36);
        if (o.asc) {
            const DA = 40, frac = o.lesion ? 0.7 : 1;
            llega.forEach(t => { add('proy', t + 0.5); viaje(['proy'], t + 0.5, DA * frac, { corta: o.lesion }); });
            if (!o.lesion) {
                llega.forEach(t => { add('tal', t + DA + 1.5); viaje(['tal'], t + DA + 1.5, 8); });
                tCorteza = llega[0] + DA + 10;
                tDolor = 270;
            }
        }
    }
    // quitar las espigas de una motoneurona inhibida
    for (const n in inhibida) { const [a, z] = inhibida[n]; sp[n] = (sp[n] || []).filter(t => t < a || t > z); }
    // tono: impulsos tenues por el axón de cada espiga que no estaba en la lista de viajes
    for (const n of ['me', 'mf']) (sp[n] || []).forEach(t => { if (!imp.some(i => i.camino[0] === n && Math.abs(i.t0 - t) < 0.01)) viaje([n], t, 10, { tenue: true }); });
    // activación de cada músculo y ángulo de la rodilla (+ extensión, − flexión), con un filtro de segundo orden
    const NT = Math.ceil(TT) + 1, ang = new Float32Array(NT), aE = new Float32Array(NT), aF = new Float32Array(NT);
    // solo mueven la pierna las espigas del reflejo (el tono de base se compensa entre los dos músculos)
    const tonicas = new Set(imp.filter(i => i.tenue).map(i => i.camino[0] + ':' + i.t0));
    const fuerza = n => (sp[n] || []).filter(t => !tonicas.has(n + ':' + t)).map(t => t + 10);
    const llegaE = fuerza('me'), llegaF = fuerza('mf');
    let y1 = 0, y2 = 0;
    for (let t = 0; t < NT; t++) {
        const e = llegaE.reduce((s, ta) => s + alfa(t - ta, 14), 0), f = llegaF.reduce((s, ta) => s + alfa(t - ta, 14), 0);
        aE[t] = e; aF[t] = f;
        y1 += (e - f - y1) / 30; y2 += (y1 - y2) / 45;
        ang[t] = y2;
    }
    return { TT, sp, imp, inhibida, ang, aE, aF, tDolor, tCorteza, dolorAntes };
}
// Ganancia: con la interneurona activa, el rotuliano extiende unos 30° y la retirada flexiona unos 40°
const G = (() => {
    const pk = (o, sg) => { const m = simular(o); let v = 0; for (const a of m.ang) v = Math.max(v, sg * a); return v; };
    return { rot: 30 / pk({ tipo: 'rot', inh: true }, 1), ret: 40 / pk({ tipo: 'ret', inh: true }, -1) };
})();

export function crearSimReflejo(caja, cfg = {}) {
    const CTRL = cfg.controles || ['golpe', 'clavo', 'inh'];
    const ASC = !!cfg.ascendente;
    const tiene = c => CTRL.includes(c);
    const carga = src => { if (!src) return null; const im = new Image(); im.src = src; return im; };
    const IMG = { fondo: carga(cfg.fondo), pierna: carga(cfg.pierna), encefalo: carga(cfg.encefalo) };
    const lista = im => im && im.complete && im.naturalWidth > 0;
    caja.innerHTML = `
      <div class="nl-msim__caja">
        <aside class="nl-msim__herr">
          <p class="nl-msim__etq">Estímulo</p>
          ${tiene('golpe') ? '<button type="button" class="nl-msim__estim" data-acc="golpe">🔨 Golpe en el tendón</button>' : ''}
          ${tiene('clavo') ? '<button type="button" class="nl-msim__estim" data-acc="clavo">📌 Clavo bajo el pie</button>' : ''}
          ${tiene('inh') ? `<div class="nl-msim__card is-inh"><div class="nl-msim__cuerpo"><strong>Interneuronas inhibitorias</strong>
              <button type="button" class="nl-msim__sw" data-sw="inh" aria-pressed="true"><i></i><span>Activas</span></button></div></div>` : ''}
          ${tiene('lesion') ? `<div class="nl-msim__card is-lesion"><div class="nl-msim__cuerpo"><strong>Médula cortada más arriba</strong>
              <button type="button" class="nl-msim__sw" data-sw="lesion" aria-pressed="false"><i></i><span>Sin lesión</span></button></div></div>` : ''}
          <p class="nl-msim__etq">Registro</p>
          <div class="nl-msim__fila"><button type="button" class="nl-msim__chico" data-acc="borrar">Borrar registro</button></div>
        </aside>
        <div class="nl-msim__der">
          <canvas class="nl-msim__lienzo nl-msim__lienzo--pa" aria-label="Simulador del circuito reflejo: pierna, médula espinal, neuronas y registro"></canvas>
          <div class="nl-msim__play" aria-label="Reproducción del registro">
            <button type="button" data-pl="inicio" title="Volver al inicio" aria-label="Volver al inicio">⏮</button>
            <button type="button" data-pl="pausa" title="Pausa / seguir" aria-label="Pausa o seguir">⏸</button>
            <input type="range" min="0" max="1000" value="0" step="1" aria-label="Instante del registro">
            <span class="nl-msim__t">0 ms</span>
            <span class="nl-msim__vel" role="group" aria-label="Velocidad">${VELS.map(v => `<button type="button" data-vel="${v}" aria-pressed="${v === 1}">${String(v).replace('.', ',')}×</button>`).join('')}</span>
          </div>
        </div>
      </div>`;
    const cv = caja.querySelector('canvas');
    let g = cv.getContext('2d');
    const barra = caja.querySelector('.nl-msim__play'), rango = barra.querySelector('input'), tLbl = barra.querySelector('.nl-msim__t'), bPausa = barra.querySelector('[data-pl="pausa"]');

    // Muestreo de cada camino (SVG oculto): puntos cada ~4 px para ubicar los impulsos
    const svgNS = 'http://www.w3.org/2000/svg';
    const oculto = document.createElementNS(svgNS, 'svg');
    oculto.setAttribute('width', '0'); oculto.setAttribute('height', '0'); oculto.style.position = 'absolute';
    caja.appendChild(oculto);
    const PTS = {}, LARGO = {}, P2D = {};
    for (const k in D) {
        const el = document.createElementNS(svgNS, 'path'); el.setAttribute('d', D[k]); oculto.appendChild(el);
        const L = el.getTotalLength(), n = Math.max(8, Math.ceil(L / 4));
        PTS[k] = Array.from({ length: n + 1 }, (_, i) => { const p = el.getPointAtLength(L * i / n); return [p.x, p.y]; });
        LARGO[k] = L; P2D[k] = new Path2D(D[k]);
    }
    const PP = { pierna: new Path2D(PIERNA), muslo: new Path2D(MUSLO), cuad: new Path2D(CUADRICEPS), isq: new Path2D(ISQUIO) };
    PP.piernaClip = (() => { const c = new Path2D(); c.addPath(PP.pierna, new DOMMatrix().translate(K[0], 548).scale(1.06, 1.03).translate(-K[0], -548)); return c; })();

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

    let inh = true, lesion = false, visible = true, cbs = [];
    let vel = 1, prueba = 1, pausado = false, arrastrando = false;
    let sw = null, barridos = [], ultimoTipo = tiene('golpe') ? 'rot' : 'ret';

    /* ---------- Un registro ---------- */
    // Un registro sin terminar (en pausa o a medio arrastrar) se descarta al pedir otro o al cambiar un interruptor:
    // los botones nunca quedan bloqueados. Lo descartado no cuenta para la lista del paso.
    function descartar() { if (sw && !sw.visto) barridos = barridos.filter(x => x !== sw); sw = null; arrastrando = false; }
    function nuevo(tipo) {
        descartar();
        const b = { tipo, inh, lesion, asc: ASC, tp: 0, visto: false };
        Object.assign(b, simular(b));
        const gg = G[tipo]; for (let i = 0; i < b.ang.length; i++) b.ang[i] *= gg;
        sw = b; pausado = false; ultimoTipo = tipo;
        barridos.push(b); if (barridos.length > 4) barridos.shift();
        sincronizar();
    }
    const enVuelo = (b, t) => b.imp.some(i => !i.tenue && t >= i.t0 - 1 && t <= i.t0 + i.dur + 1) || (b.tipo === 'rot' && t < 6) || (b.tipo === 'ret' && t < 12);
    const angEn = (b, t) => { const i = clamp(Math.floor(t), 0, b.ang.length - 2), f = t - i; return b.ang[i] * (1 - f) + b.ang[i + 1] * f; };
    function paso(dtReal) {
        const b = sw;
        if (!b || pausado || arrastrando || b.tp >= b.TT) return;
        let resto = dtReal * vel * prueba, guard = 0;
        while (resto > 0 && b.tp < b.TT && guard++ < 4000) { const e = enVuelo(b, b.tp) ? LENTO : RAPIDO; const d = Math.min(0.25, resto / e); b.tp += d; resto -= d * e; }
        if (b.tp >= b.TT) { b.tp = b.TT; terminar(b); }
    }
    function terminar(b) { if (b.visto) return; b.visto = true; analizar(b); sincronizar(); }

    let hist = {};
    function limpiarHist() { hist = { golpe: false, golpeSinInh: false, clavo: false, dolor: false, clavoLesion: false }; }
    limpiarHist();
    function analizar(b) {
        if (b.tipo === 'rot' && b.inh) hist.golpe = true;
        if (b.tipo === 'rot' && !b.inh) hist.golpeSinInh = true;
        if (b.tipo === 'ret' && b.inh && !b.lesion) hist.clavo = true;
        if (b.tipo === 'ret' && b.asc && !b.lesion && b.tDolor) hist.dolor = true;
        if (b.tipo === 'ret' && b.lesion) hist.clavoLesion = true;
    }

    /* ---------- Dibujo ---------- */
    function rr(x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
    function texto(t, x, y, size, col, al = 'left', w = 700) {
        g.font = `${w} ${size}px Inter, system-ui, sans-serif`; g.fillStyle = col; g.textAlign = al; g.fillText(t, x, y);
    }
    const FS = () => VERT ? 1.3 : 1;                         // en pantallas angostas el dibujo se achica: letra más grande
    function rotulo(t, x, y, al = 'left', col = '#334155') {   // rótulo con fondo claro para que se lea sobre el dibujo
        const fs = 22 * FS();
        g.font = `700 ${fs}px Inter, system-ui, sans-serif`;
        const w = g.measureText(t).width, x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x;
        g.fillStyle = 'rgba(255,255,255,.85)'; rr(x0 - 5, y - fs, w + 10, fs + 7, 6); g.fill();
        texto(t, x, y, fs, col, al);
    }
    const rotar = (p, a) => { const c = Math.cos(a), s = Math.sin(a), x = p[0] - K[0], y = p[1] - K[1]; return [K[0] + x * c - y * s, K[1] + x * s + y * c]; };
    const piernaRad = b => b ? angEn(b, b.tp) * Math.PI / 180 : 0;

    function anatomia(b, solo) {   // solo: 'fondo' o 'pierna' (para la plantilla de ChatGPT: sin tendones, rótula ni estímulos)
        const a = piernaRad(b);
        const aE = b ? clamp(b.aE[Math.floor(b.tp)] / 2.2, 0, 1) : 0, aF = b ? clamp(b.aF[Math.floor(b.tp)] / 2.2, 0, 1) : 0;
        if (solo === 'pierna') { g.fillStyle = '#FDE7D6'; g.strokeStyle = '#C2876B'; g.lineWidth = 2; g.fill(PP.pierna); g.stroke(PP.pierna); return; }
        if (lista(IMG.fondo) && !solo) {
            g.drawImage(IMG.fondo, 0, 0, 760, 720);
            // la contracción se marca encima de la ilustración
            if (aE > 0.02) { g.fillStyle = `rgba(239,68,68,${aE * 0.45})`; g.fill(PP.cuad); }
            if (aF > 0.02) { g.fillStyle = `rgba(249,115,22,${aF * 0.45})`; g.fill(PP.isq); }
        } else {
            // mesa (la persona está sentada en el borde)
            g.fillStyle = '#E2E8F0'; rr(236, 458, 236, 16, 4); g.fill();
            g.fillStyle = '#CBD5E1'; g.fillRect(452, 474, 12, 230);
            // muslo con sus músculos
            g.fillStyle = '#FDE7D6'; g.strokeStyle = '#C2876B'; g.lineWidth = 2; g.fill(PP.muslo); g.stroke(PP.muslo);
            g.fillStyle = `rgba(220,38,38,${0.32 + aE * 0.6})`; g.strokeStyle = '#B91C1C'; g.lineWidth = 1.5; g.fill(PP.cuad); g.stroke(PP.cuad);
            g.fillStyle = `rgba(234,88,12,${0.28 + aF * 0.6})`; g.strokeStyle = '#C2410C'; g.fill(PP.isq); g.stroke(PP.isq);
            // médula y raíces
            nervios();
            medula();
        }
        if (solo) return;
        // tendones (siguen a la pierna)
        const tub = rotar(TUBEROSIDAD, a), ins = rotar(INS_FLEX, a);
        g.strokeStyle = '#E5E7EB'; g.lineWidth = 7; g.lineCap = 'round';
        g.beginPath(); g.moveTo(166, 392); g.quadraticCurveTo(104, 386, ROTULA[0], ROTULA[1] - 8); g.stroke();
        g.beginPath(); g.moveTo(ROTULA[0], ROTULA[1] + 8); g.lineTo(tub[0], tub[1]); g.stroke();
        g.beginPath(); g.moveTo(172, 438); g.quadraticCurveTo(160, 452, ins[0], ins[1]); g.stroke();
        g.strokeStyle = '#94A3B8'; g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(ROTULA[0], ROTULA[1] + 8); g.lineTo(tub[0], tub[1]); g.stroke();
        // pierna y pie (giran en la rodilla)
        g.save(); g.translate(K[0], K[1]); g.rotate(a); g.translate(-K[0], -K[1]);
        if (lista(IMG.pierna)) g.drawImage(IMG.pierna, 0, 0, 760, 720);   // ilustración con fondo transparente (docs/practico-4_imagenes.py)
        else {
            g.fillStyle = '#FDE7D6'; g.strokeStyle = '#C2876B'; g.lineWidth = 2; g.fill(PP.pierna); g.stroke(PP.pierna);
            g.strokeStyle = '#FDE68A'; g.lineWidth = 9; g.lineCap = 'round'; g.stroke(P2D.nocPie);   // nervio de la pierna
        }
        g.restore();
        // rótula
        g.fillStyle = '#F1F5F9'; g.strokeStyle = '#94A3B8'; g.lineWidth = 1.5;
        g.beginPath(); g.ellipse(ROTULA[0], ROTULA[1], 9, 13, -0.3, 0, Math.PI * 2); g.fill(); g.stroke();
        // huso muscular dentro del cuádriceps
        g.fillStyle = '#BFDBFE'; g.strokeStyle = '#1D4ED8'; g.lineWidth = 1.5;
        g.beginPath(); g.ellipse(HUSO[0], HUSO[1], 20, 6, -0.05, 0, Math.PI * 2); g.fill(); g.stroke();
        estimulos(b, a);
    }
    function nervios() {
        // raíces y nervio espinal (haz gris claro donde corren los axones)
        g.strokeStyle = '#FDE68A'; g.lineCap = 'round'; g.lineWidth = 18;
        g.beginPath(); g.moveTo(GANGLIO.x + 20, GANGLIO.y - 4); g.bezierCurveTo(470, 200, 510, 214, 530, 240); g.stroke();      // raíz dorsal
        g.beginPath(); g.moveTo(528, 350); g.bezierCurveTo(500, 368, 466, 356, 440, 340); g.bezierCurveTo(414, 322, 400, 300, 393, 276); g.stroke();   // raíz ventral
        g.beginPath(); g.moveTo(GANGLIO.x - 18, GANGLIO.y + 8); g.bezierCurveTo(410, 232, 398, 250, J[0], J[1]); g.stroke();
        g.lineWidth = 22;
        g.beginPath(); g.moveTo(J[0], J[1]); g.bezierCurveTo(384, 300, 372, 338, 356, 366); g.stroke();                         // nervio espinal
        g.lineWidth = 12;
        g.beginPath(); g.moveTo(356, 366); g.bezierCurveTo(334, 384, 292, 392, 232, 398); g.stroke();                           // ramo al extensor
        g.beginPath(); g.moveTo(356, 370); g.bezierCurveTo(332, 404, 298, 434, 244, 440); g.stroke();                           // ramo al flexor
        g.beginPath(); g.moveTo(352, 372); g.bezierCurveTo(330, 440, 220, 456, 142, 432); g.stroke();                           // nervio que baja a la pierna
        g.fillStyle = '#FCD34D'; g.strokeStyle = '#D97706'; g.lineWidth = 2;
        g.beginPath(); g.ellipse(GANGLIO.x, GANGLIO.y, GANGLIO.rx, GANGLIO.ry, -0.2, 0, Math.PI * 2); g.fill(); g.stroke();
    }
    function medula() {
        const { x, y, rx, ry } = MED;
        g.fillStyle = '#F5F3FF'; g.strokeStyle = '#8B5CF6'; g.lineWidth = 2.5;
        g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.stroke();
        // sustancia gris en mariposa (astas dorsales arriba, ventrales abajo)
        g.fillStyle = '#DDD6FE'; g.strokeStyle = '#A78BFA'; g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(x, y - 18);
        g.bezierCurveTo(x - 20, y - 22, x - 40, y - 60, x - 58, y - 78);
        g.bezierCurveTo(x - 70, y - 74, x - 66, y - 52, x - 60, y - 34);
        g.bezierCurveTo(x - 78, y - 12, x - 98, y + 28, x - 96, y + 58);
        g.bezierCurveTo(x - 90, y + 80, x - 44, y + 86, x - 26, y + 50);
        g.bezierCurveTo(x - 16, y + 30, x - 8, y + 20, x, y + 18);
        g.bezierCurveTo(x + 8, y + 20, x + 16, y + 30, x + 26, y + 50);
        g.bezierCurveTo(x + 44, y + 86, x + 90, y + 80, x + 96, y + 58);
        g.bezierCurveTo(x + 98, y + 28, x + 78, y - 12, x + 60, y - 34);
        g.bezierCurveTo(x + 66, y - 52, x + 70, y - 74, x + 58, y - 78);
        g.bezierCurveTo(x + 40, y - 60, x + 20, y - 22, x, y - 18);
        g.closePath(); g.fill(); g.stroke();
        g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 4, 0, Math.PI * 2); g.fill();
        // fisura ventral
        g.strokeStyle = '#8B5CF6'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + ry); g.lineTo(x, y + ry - 16); g.stroke();
    }
    function estimulos(b, a) {
        if (!b) return;
        const t = b.tp;
        if (b.tipo === 'rot') {   // martillo: se acerca, golpea el tendón (t≈5) y se aleja
            const fase = t < 5 ? 1 - t / 5 : t < 9 ? 0 : Math.min(1, (t - 9) / 25);
            const ang = 0.35 - fase * 0.9;
            const P = [34, 536];
            g.save(); g.translate(P[0], P[1]); g.rotate(ang);
            g.fillStyle = '#92400E'; rr(-4, -100, 8, 110, 3); g.fill();
            g.fillStyle = '#F87171'; g.strokeStyle = '#991B1B'; g.lineWidth = 2;
            g.beginPath(); g.moveTo(-6, -118); g.lineTo(26, -110); g.lineTo(24, -96); g.lineTo(-8, -100); g.closePath(); g.fill(); g.stroke();
            g.restore();
            if (t >= 5 && t < 14) { g.strokeStyle = 'rgba(245,158,11,.9)'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(96, 446, 10 + k * 7 + (t - 5) * 1.2, -1, 1); g.stroke(); } }
        } else {                  // clavo: sube hasta la planta (t≈10), queda y luego baja
            const sub = t < 10 ? t / 10 : t < 160 ? 1 : Math.max(0, 1 - (t - 160) / 120);
            const yT = CLAVO.yTope + (1 - sub) * 40;
            g.fillStyle = '#A16207'; rr(CLAVO.x - 40, yT + 24, 90, 12, 3); g.fill();
            g.fillStyle = '#94A3B8'; g.strokeStyle = '#475569'; g.lineWidth = 1.2;
            g.beginPath(); g.moveTo(CLAVO.x - 3, yT + 24); g.lineTo(CLAVO.x, yT); g.lineTo(CLAVO.x + 3, yT + 24); g.closePath(); g.fill(); g.stroke();
            if (t >= 10 && t < 40 && Math.abs(a) < 0.12) { g.strokeStyle = 'rgba(220,38,38,.85)'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(CLAVO.x, yT, 9 + k * 7, Math.PI + 0.5, Math.PI * 2 - 0.5); g.stroke(); } }
        }
    }

    // Neuronas del circuito que corresponde
    function inhibidaEn(b, n) { const r = b && b.inhibida[n]; return !!(r && b.tp >= r[0] && b.tp <= r[1]); }
    function disparo(b, n) { if (!b) return 0; const s = b.sp[n] || []; let m = 0; for (const t of s) { const d = b.tp - t; if (d >= 0 && d < 4) m = Math.max(m, 1 - d / 4); } return m; }
    function puntoEn(camino, f, a) {
        const p = PTS[camino], i = clamp(f, 0, 1) * (p.length - 1), k = Math.floor(i), r = i - k;
        const q = k >= p.length - 1 ? p[p.length - 1] : [p[k][0] * (1 - r) + p[k + 1][0] * r, p[k][1] * (1 - r) + p[k + 1][1] * r];
        return camino === 'nocPie' ? rotar(q, a) : q;
    }
    function trazar(camino, a) {
        if (camino !== 'nocPie') return P2D[camino];
        const pts = PTS[camino].map(p => rotar(p, a)), pa = new Path2D();
        pts.forEach((p, i) => i ? pa.lineTo(p[0], p[1]) : pa.moveTo(p[0], p[1]));
        return pa;
    }
    function neuronas(b) {
        const tipo = b ? b.tipo : ultimoTipo, a = piernaRad(b);
        const lst = CIRC[tipo].concat(ASC && tipo === 'ret' ? ['proy', 'tal'] : []);
        g.lineCap = 'round'; g.lineJoin = 'round';
        // axones
        for (const n of lst) {
            const ne = NEU[n], inhb = inhibidaEn(b, n);
            for (const c of CAMINOS[n]) {
                if (c === 'nocPro' && !(ASC && tipo === 'ret')) continue;
                const pa = trazar(c, a);
                g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 7; g.stroke(pa);
                g.strokeStyle = inhb ? '#CBD5E1' : ne.col; g.lineWidth = 3.4; g.stroke(pa);
            }
        }
        // terminales: botones excitatorios (círculo) o inhibitorios (barra)
        const fin = c => { const p = PTS[c]; return p[p.length - 1]; };
        const term = (c, col, inhib) => {
            const p = PTS[c], [x, y] = p[p.length - 1], [x0, y0] = p[p.length - 3];
            const ang = Math.atan2(y - y0, x - x0);
            if (inhib) { g.save(); g.translate(x, y); g.rotate(ang); g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -7); g.lineTo(0, 7); g.stroke(); g.restore(); }
            else { g.fillStyle = col; g.beginPath(); g.arc(x, y, 4.5, 0, Math.PI * 2); g.fill(); }
        };
        if (tipo === 'rot') { term('iaCen', NEU.ia.col); term('iaCol', NEU.ia.col); term('iinh', NEU.iinh.col, true); }
        else { term('nocExc', NEU.noc.col); term('nocInh', NEU.noc.col); term('iexc', NEU.iexc.col); term('iinh2', NEU.iinh2.col, true); if (ASC) { term('nocPro', NEU.noc.col); term('proy', NEU.proy.col); } }
        // placas motoras y receptores
        g.fillStyle = NEU.me.col; g.beginPath(); g.arc(PLACA_E[0], PLACA_E[1], 5, 0, Math.PI * 2); g.fill();
        g.fillStyle = NEU.mf.col; g.beginPath(); g.arc(PLACA_F[0], PLACA_F[1], 5, 0, Math.PI * 2); g.fill();
        if (tipo === 'ret') { const l = rotar(LIBRE, a); g.strokeStyle = NEU.noc.col; g.lineWidth = 2; for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(l[0] - 10 + k * 8, l[1] + 4 - Math.abs(k) * 2); g.stroke(); } }
        // somas
        for (const n of lst) {
            const ne = NEU[n], [x, y] = ne.soma, inhb = inhibidaEn(b, n), f = disparo(b, n);
            if (f > 0 && !inhb) { g.fillStyle = `rgba(250,204,21,${0.55 * f})`; g.beginPath(); g.arc(x, y, ne.r + 9, 0, Math.PI * 2); g.fill(); }
            g.fillStyle = inhb ? '#E2E8F0' : ne.col; g.strokeStyle = '#fff'; g.lineWidth = 2.5;
            g.beginPath(); g.arc(x, y, ne.r, 0, Math.PI * 2); g.fill(); g.stroke();
            if (inhb) { g.strokeStyle = '#7C3AED'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, ne.r + 4, 0, Math.PI * 2); g.stroke(); }
        }
        // impulsos
        if (b) for (const im of b.imp) {
            const t = b.tp - im.t0;
            if (t < 0 || t > im.dur) continue;
            const largos = im.camino.map(c => LARGO[c]), tot = largos.reduce((s, v) => s + v, 0);
            let d = t / im.dur * tot, k = 0;
            while (k < largos.length - 1 && d > largos[k]) { d -= largos[k]; k++; }
            const [x, y] = puntoEn(im.camino[k], d / largos[k], a);
            const inhC = INHIB.has(im.camino[0]);
            g.fillStyle = im.tenue ? 'rgba(250,204,21,.55)' : inhC ? '#C4B5FD' : '#FACC15';
            g.strokeStyle = im.tenue ? 'rgba(146,64,14,.4)' : '#92400E'; g.lineWidth = 1.5;
            g.beginPath(); g.arc(x, y, im.tenue ? 3.5 : 6, 0, Math.PI * 2); g.fill(); g.stroke();
        }
    }
    // Corte coronal del encéfalo (vector de respaldo y base de la plantilla de ChatGPT)
    function encefaloDibujo() {
        const { x, y, w, h } = CEREBRO, m = x + w / 2;
        g.fillStyle = '#F5EEF8'; g.strokeStyle = '#C084FC'; g.lineWidth = 2;
        for (const s of [-1, 1]) {                                     // hemisferios con la fisura longitudinal al medio
            g.beginPath(); g.ellipse(m + s * 45, y + 66, 43, 56, 0, 0, Math.PI * 2); g.fill(); g.stroke();
        }
        g.strokeStyle = '#E9D5FF'; g.lineWidth = 6;                     // corteza (borde gris)
        for (const s of [-1, 1]) { g.beginPath(); g.ellipse(m + s * 45, y + 66, 38, 51, 0, 0, Math.PI * 2); g.stroke(); }
        g.fillStyle = '#FFFFFF'; g.strokeStyle = '#C4B5FD'; g.lineWidth = 1.2;   // ventrículos laterales
        for (const s of [-1, 1]) { g.beginPath(); g.ellipse(m + s * 11, y + 56, 6, 9, -s * 0.3, 0, Math.PI * 2); g.fill(); g.stroke(); }
        g.fillStyle = '#DDD6FE'; g.strokeStyle = '#7C3AED'; g.lineWidth = 1.5;   // tálamos
        for (const [tx, ty] of [TALAMO, TALAMO_I]) { g.beginPath(); g.ellipse(tx, ty, 10, 8, 0, 0, Math.PI * 2); g.fill(); g.stroke(); }
    }
    function encefalo(b) {
        const { x, y, w, h } = CEREBRO;
        g.fillStyle = '#fff'; g.strokeStyle = '#CBD5E1'; g.lineWidth = 1.5; rr(x, y, w, h, 12); g.fill(); g.stroke();
        if (lista(IMG.encefalo)) { g.save(); rr(x, y, w, h, 12); g.clip(); g.drawImage(IMG.encefalo, x, y, w, h); g.restore(); }
        else encefaloDibujo();
        const llega = b && b.tCorteza != null && b.tp >= b.tCorteza, siente = b && b.tDolor != null && b.tp >= b.tDolor;
        // se iluminan el tálamo y el área de la pierna del MISMO lado (la vía ya cruzó en la médula)
        const brillo = (px, py, rx, ry, col) => { const gr = g.createRadialGradient(px, py, 0, px, py, Math.max(rx, ry)); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(px, py, rx, ry, 0, 0, Math.PI * 2); g.fill(); };
        if (b && b.tCorteza != null && b.tp >= b.tCorteza - 9) brillo(TALAMO[0], TALAMO[1], 16, 13, 'rgba(245,158,11,.8)');
        if (llega) brillo(PIERNA_S1[0], PIERNA_S1[1], 12, 24, siente ? 'rgba(220,38,38,.95)' : 'rgba(245,158,11,.85)');
        // rótulos afuera del recuadro, a la izquierda, con una línea a su estructura
        const linea = (x1, y1, x2, y2) => { g.strokeStyle = '#7C3AED'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); };
        linea(552, 24, PIERNA_S1[0] - 4, PIERNA_S1[1] - 4); rotulo('Corteza (pierna)', 550, 32, 'right', '#6D28D9');
        linea(552, 96, TALAMO[0] - 6, TALAMO[1]);   // apunta al tálamo que se activa rotulo('Tálamo', 550, 104, 'right', '#6D28D9');
        if (siente || llega) {
            const t2 = siente ? 'Siente el dolor' : 'Llega la señal…';
            g.font = `800 ${22 * FS()}px Inter, system-ui, sans-serif`;
            const tw = g.measureText(t2).width;
            g.fillStyle = siente ? '#DC2626' : '#F59E0B'; rr(550 - tw - 14, 124, tw + 18, 32, 10); g.fill();
            texto(t2, 541, 148, 22 * FS(), '#fff', 'right', 800);
        }
    }
    function lesionDib() {
        const [x, y] = LESION;
        g.strokeStyle = '#DC2626'; g.lineWidth = 5; g.lineCap = 'round';
        g.beginPath(); g.moveTo(x - 14, y - 10); g.lineTo(x + 14, y + 10); g.moveTo(x + 14, y - 10); g.lineTo(x - 14, y + 10); g.stroke();
        rotulo('Lesión', x - 4, y - 18, 'center', '#B91C1C');
    }
    function rotulos(b) {
        const tipo = b ? b.tipo : ultimoTipo;
        rotulo('Médula espinal', MED.x, MED.y + MED.ry + 28, 'center', '#6D28D9');
        rotulo('Ganglio de la raíz dorsal', GANGLIO.x - 20, GANGLIO.y - 30, 'center', '#92400E');
        rotulo('Extensor (cuádriceps)', 250, 344, 'center', '#B91C1C');
        rotulo('Flexor (isquiotibiales)', 262, 488, 'center', '#C2410C');
        if (tipo === 'rot') { rotulo('Huso muscular', HUSO[0] + 10, HUSO[1] + 30, 'center', '#1D4ED8'); rotulo('Tendón rotuliano', 80, 400, 'right', '#475569'); }
        else { const l = rotar(LIBRE, piernaRad(b)); rotulo('Terminación libre', l[0] + 80, l[1] - 6, 'left', '#0E7490'); }
    }
    function leyenda(b) {
        const tipo = b ? b.tipo : ultimoTipo;
        const lst = CIRC[tipo].concat(ASC && tipo === 'ret' ? ['proy'] : []);
        const x = 14, y0 = 16, f = 1, lh = 30;   // la leyenda no crece en el teléfono: taparía los rótulos
        g.fillStyle = 'rgba(255,255,255,.9)'; g.strokeStyle = '#E2E8F0'; g.lineWidth = 1; rr(x - 6, y0 - 8, 330 * f, lst.length * lh + 12, 10); g.fill(); g.stroke();
        lst.forEach((n, i) => {
            const y = y0 + 8 * f + i * lh;
            g.fillStyle = NEU[n].col; g.beginPath(); g.arc(x + 9, y, 8 * f, 0, Math.PI * 2); g.fill();
            texto(NEU[n].nombre, x + 26 * f, y + 7 * f, 20 * f, '#334155', 'left', 700);
        });
    }
    function zona() {
        const b = sw;
        g.fillStyle = lista(IMG.fondo) ? '#FFFFFF' : '#F8FAFC'; g.fillRect(0, 0, 760, 720);
        g.save(); g.translate(ESC.dx, ESC.dy); g.scale(ESC.s, ESC.s);   // la escena completa, con margen para que el pie no salga
        anatomia(b);
        if (ASC && ultimoTipo === 'ret') encefalo(b);
        neuronas(b);
        if (ASC && lesion && (!b || b.lesion)) lesionDib();
        else if (b && b.lesion) lesionDib();
        rotulos(b);
        g.restore();
        leyenda(b);
    }

    /* ---------- Registro (derecha) ---------- */
    const FILAS = {
        rot: [['ia', 'Sensitiva del huso'], ['iinh', 'Interneurona inhibitoria'], ['me', 'Motoneurona del extensor'], ['mf', 'Motoneurona del flexor']],
        ret: [['noc', 'Sensitiva del dolor'], ['iexc', 'Interneurona excitatoria'], ['iinh2', 'Interneurona inhibitoria'], ['mf', 'Motoneurona del flexor'], ['me', 'Motoneurona del extensor']],
    };
    function panelDer() {
        g.fillStyle = '#1A0E2E';
        if (VERT) g.fillRect(0, ZH, W, H - ZH); else g.fillRect(ZX, 0, W - ZX, H);
        const b = sw, tipo = b ? b.tipo : ultimoTipo;
        const ang = b ? angEn(b, b.tp) : 0, v = Math.round(ang);
        // rodilla
        g.fillStyle = '#0F0820'; g.strokeStyle = '#A78BFA'; g.lineWidth = 2; rr(X0, VY, WP, VH, 14); g.fill(); g.stroke();
        texto('RODILLA', X0 + 16, VY + 28, 18, '#C4B5FD', 'left', 800);
        texto(`${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)}°`, X0 + WP / 2, VY + 70, 44, v > 3 ? '#FCA5A5' : v < -3 ? '#FDBA74' : '#93C5FD', 'center', 800);
        texto(v > 3 ? 'se extiende' : v < -3 ? 'se flexiona' : 'en reposo', X0 + WP / 2, VY + 100, 19, '#E9D5FF', 'center', 700);
        // registro
        g.fillStyle = '#fff'; rr(X0, RY, WP, RH, 14); g.fill();
        const TT = TS[tipo], filas = FILAS[tipo].concat(ASC && tipo === 'ret' ? [['tal', 'Corteza (llega la señal)']] : []);
        const PX0 = X0 + 14, PW = WP - 28, Xt = t => PX0 + PW * t / TT;
        texto('Registro de las neuronas', X0 + 16, RY + 30, 21, '#334155', 'left', 800);
        const fh = 52, fy0 = RY + 44;
        filas.forEach(([n, nom], i) => {
            const y = fy0 + i * fh, col = NEU[n].col;
            texto(nom, PX0, y + 18, 18, col, 'left', 800);
            g.strokeStyle = '#E2E8F0'; g.lineWidth = 1; g.beginPath(); g.moveTo(PX0, y + 48); g.lineTo(PX0 + PW, y + 48); g.stroke();
            if (!b) return;
            const hasta = b.visto ? b.TT : b.tp;
            const r = b.inhibida[n];
            if (r && hasta > r[0]) { g.fillStyle = 'rgba(124,58,237,.14)'; g.fillRect(Xt(r[0]), y + 25, Xt(Math.min(r[1], hasta)) - Xt(r[0]), 23); texto('inhibida', Xt(r[0]) + 6, y + 43, 16, '#6D28D9', 'left', 800); }
            g.strokeStyle = col; g.lineWidth = 2.5;
            (b.sp[n] || []).forEach(t => { if (t > hasta) return; const x = Xt(t); g.beginPath(); g.moveTo(x, y + 48); g.lineTo(x, y + 25); g.stroke(); });
            if (n === 'tal' && b.tDolor && hasta >= b.tDolor) { const x = Xt(b.tDolor); g.fillStyle = '#DC2626'; rr(x - 2, y + 24, 128, 24, 7); g.fill(); texto('siente dolor', x + 8, y + 42, 16, '#fff', 'left', 800); }
            if (n === 'tal' && b.lesion) texto('no llega: lesión', PX0 + PW, y + 42, 16, '#B91C1C', 'right', 800);
        });
        // ángulo de la rodilla: alto fijo, abajo
        const ah = 128, ay0 = RY + RH - 44 - ah, amid = ay0 + ah / 2, Ya = d => amid - d / 45 * (ah / 2);
        texto('Ángulo de la rodilla', PX0, ay0 - 8, 18, '#334155', 'left', 800);
        texto('+ extensión', PX0 + PW, ay0 - 8, 15, '#B91C1C', 'right', 700);
        texto('− flexión', PX0 + PW, ay0 + ah + 2, 15, '#C2410C', 'right', 700);
        g.strokeStyle = '#CBD5E1'; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(PX0, amid); g.lineTo(PX0 + PW, amid); g.stroke(); g.setLineDash([]);
        barridos.filter(s => s.tipo === tipo).forEach(s => {
            const ult = s === b, hasta = ult && !s.visto ? s.tp : s.TT;
            g.strokeStyle = ult ? '#7C3AED' : 'rgba(100,116,139,.4)'; g.lineWidth = ult ? 3 : 2;
            g.beginPath();
            for (let t = 0; t <= hasta; t += 2) { const x = Xt(t), y = Ya(clamp(angEn(s, t), -45, 45)); if (t) g.lineTo(x, y); else g.moveTo(x, y); }
            g.stroke();
        });
        for (let t = 0; t <= TT; t += TT > 400 ? 100 : 50) texto(String(t), Xt(t), RY + RH - 16, 16, '#64748B', 'center', 700);
        texto('ms', PX0 + PW, RY + RH - 2, 14, '#64748B', 'right', 700);
        if (b) {   // cabezal
            const x = Xt(b.tp);
            g.strokeStyle = '#F59E0B'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, fy0); g.lineTo(x, ay0 + ah); g.stroke();
            g.fillStyle = '#F59E0B'; g.beginPath(); g.arc(x, Ya(clamp(ang, -45, 45)), 5, 0, Math.PI * 2); g.fill();
        }
    }
    function dibujar() {
        g.setTransform(2, 0, 0, 2, 0, 0);
        g.clearRect(0, 0, W, H);
        g.save(); g.scale(S, S); g.beginPath(); g.rect(0, 0, 760, 720); g.clip(); zona(); g.restore();
        panelDer();
        const b = sw;
        if (!arrastrando) rango.value = b ? Math.round(b.tp / b.TT * 1000) : 0;
        tLbl.textContent = `${b ? Math.round(b.tp) : 0} ms`;
        bPausa.textContent = b && !pausado && b.tp < b.TT ? '⏸' : '▶';
    }

    /* ---------- Herramientas ---------- */
    function sincronizar() {
        caja.querySelectorAll('[data-sw]').forEach(b2 => {
            const on = b2.dataset.sw === 'inh' ? inh : lesion;
            b2.setAttribute('aria-pressed', on ? 'true' : 'false');
            b2.querySelector('span').textContent = b2.dataset.sw === 'inh' ? (on ? 'Activas' : 'Apagadas') : (on ? 'Con lesión' : 'Sin lesión');
        });
        barra.classList.toggle('is-vacia', !sw);
        rango.disabled = !sw;
        caja.querySelectorAll('[data-vel]').forEach(b2 => b2.setAttribute('aria-pressed', Number(b2.dataset.vel) === vel ? 'true' : 'false'));
        avisar();
    }
    caja.querySelector('[data-acc="golpe"]')?.addEventListener('click', () => nuevo('rot'));
    caja.querySelector('[data-acc="clavo"]')?.addEventListener('click', () => nuevo('ret'));
    caja.querySelectorAll('[data-sw]').forEach(b2 => b2.addEventListener('click', () => {
        if (b2.dataset.sw === 'inh') inh = !inh; else lesion = !lesion;
        descartar();
        sincronizar();
    }));
    caja.querySelector('[data-acc="borrar"]').addEventListener('click', () => { barridos = barridos.filter(b2 => b2 === sw && !b2.visto); if (sw && sw.visto) sw = null; sincronizar(); });
    barra.querySelector('[data-pl="inicio"]').addEventListener('click', () => { if (!sw) return; sw.tp = 0; pausado = false; });
    bPausa.addEventListener('click', () => { if (!sw) return; if (sw.tp >= sw.TT) { sw.tp = 0; pausado = false; } else pausado = !pausado; });
    rango.addEventListener('input', () => { if (!sw) return; arrastrando = true; pausado = true; sw.tp = Number(rango.value) / 1000 * sw.TT; if (sw.tp >= sw.TT - 0.5) terminar(sw); });
    rango.addEventListener('change', () => { arrastrando = false; });
    caja.querySelectorAll('[data-vel]').forEach(b2 => b2.addEventListener('click', () => { vel = Number(b2.dataset.vel); sincronizar(); }));

    function reiniciar() {
        barridos = []; sw = null; inh = true; lesion = false; vel = 1; pausado = false;
        ultimoTipo = tiene('golpe') ? 'rot' : 'ret';
        limpiarHist(); sincronizar();
    }
    function estado() { return { inh, lesion, corriendo: !!(sw && !sw.visto), ...hist }; }
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
            golpe() { nuevo('rot'); },
            clavo() { nuevo('ret'); },
            ir(ms) { if (sw) { sw.tp = ms; pausado = true; } },
            // plantilla para ChatGPT: la escena (coordenadas de dibujo 760 × 720) a 1024 px de ancho, sin neuronas ni rótulos
            plantilla(parte) {
                const enc = parte === 'encefalo', k = enc ? 1536 / CEREBRO.w : 1024 / 760;
                const c = document.createElement('canvas'); c.width = enc ? 1536 : 1024; c.height = enc ? 1024 : Math.round(720 * k);
                const g0 = g; g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.scale(k, k);
                if (enc) { g.translate(-CEREBRO.x, -CEREBRO.y); encefaloDibujo(); } else anatomia(null, parte);
                g = g0;
                return c.toDataURL('image/png');
            },
            poner(o) { if ('inh' in o) inh = o.inh; if ('lesion' in o) lesion = o.lesion; descartar(); sincronizar(); },
        },
    };
    caja.__sim = api;
    return api;
}
