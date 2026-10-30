/**
 * NeuroLab — sim-membrana.js
 * Simulador de membrana: iones Na⁺ y K⁺ que se mueven al azar, 2 canales de fuga de K⁺ fijos, canales de Na⁺ y de K⁺ con compuerta,
 * bomba Na⁺/K⁺, barras de concentración, voltímetro y registro del potencial.
 * Herramientas a la izquierda: paleta de iones (se elige el ion y se toca afuera o adentro para agregarlo),
 * tarjetas de canales (cantidad + compuerta) y de la bomba.
 * El potencial se calcula con la ecuación de Goldman (GHK) desde las concentraciones y la permeabilidad:
 * los canales de fuga dejan pasar K⁺ siempre (y la membrana, muy poco Na⁺) aunque no haya compuertas abiertas.
 * Uso: const sim = crearSimMembrana(caja); sim.estado(); sim.alCambiar(fn); sim.permitirReposo(true).
 * CHEQUEOS: condiciones con nombre que usan los pasos «sim» de js/escenas.js.
 */
const W = 1200, H = 720;
const ZX = 820;                    // ancho de la zona de la membrana
const MY0 = 330, MY1 = 392;        // bicapa
const R = 13;                      // radio de un ion
const MAXION = 60;                 // máximo por ion y lado
const MM = 5;                      // mM que representa cada partícula
const XBOMBA = 80;
const FUGAS = [200, 290];          // canales de fuga de K⁺: parte fija de la membrana
const SLOTS = [430, 580];
const MAXCANAL = 1;                // por tipo
const COL = {
    na: ['#22C55E', '#166534'], k: ['#3B82F6', '#1E3A8A'],
    ext: '#E0F2FE', int: '#FFF4E0', cabeza: '#FB923C', cola: '#FDBA74',
};
const T_BOMBA = 1.8, MIN_NA_IN = 5, MIN_K_OUT = 0, PASO_FUGA = .3;
const P_REPOSO_K = 2, P_REPOSO_NA = 0.1, P_COMP_NA = 20, P_COMP_K = 10;

export const CHEQUEOS = {
    naAfuera:  s => s.naOut >= 15 && s.naIn * 3 <= s.naOut,
    kAdentro:  s => s.kIn >= 15 && s.kOut * 3 <= s.kIn,
    vNeg:      s => s.V <= -60,
    vCero:     s => s.V >= -40,
    bombaOff:  s => !s.bomba,
    bombaOn:   s => s.bomba,
    compNa:    s => s.compNa >= 1,
    compK:     s => s.compK >= 1,
    cerradoNa: s => !s.abiertoNa,
    cerradoK:  s => !s.abiertoK,
    abiertoNa: s => s.abiertoNa && s.compNa >= 1,
    abiertoK:  s => s.abiertoK && s.compK >= 1,
    vDespol:   s => s.V >= -30,
    vHiper:    s => s.V <= -75,
    naIgual:   s => s.naIn >= 12,
    na150:     s => s.naOut >= 28 && s.naOut <= 32,
    na25:      s => s.naIn >= 4 && s.naIn <= 6,
    k150:      s => s.kIn >= 28 && s.kIn <= 32,
    k0:        s => s.kOut <= 1,
    sinIones:  s => s.naOut + s.naIn + s.kOut + s.kIn === 0,
};

/** Dibujo de una tarjeta: canal (cerrado / abierto) o bomba. */
function iconoCanal(ion, abierto) {
    const [f, s] = ion === 'na' ? ['#BBF7D0', '#166534'] : ['#BFDBFE', '#1E3A8A'];
    const g = abierto ? 14 : 4;
    return `<svg viewBox="0 0 80 64" aria-hidden="true">
      <rect x="0" y="22" width="80" height="20" fill="#FDBA74" opacity=".6"/>
      <rect x="${22}" y="10" width="${18 - g / 2}" height="44" rx="5" fill="${f}" stroke="${s}" stroke-width="2.5"/>
      <rect x="${40 + g / 2}" y="10" width="${18 - g / 2}" height="44" rx="5" fill="${f}" stroke="${s}" stroke-width="2.5"/>
      ${abierto ? `<rect x="12" y="2" width="18" height="6" rx="3" fill="${s}" transform="rotate(-35 21 5)"/>
                   <path d="M40 4 V60" stroke="${s}" stroke-width="2" stroke-dasharray="3 3"/><path d="M36 ${ion === 'na' ? '52 L40 60 L44 52' : '12 L40 4 L44 12'}" fill="none" stroke="${s}" stroke-width="2.5"/>`
                : `<rect x="31" y="4" width="18" height="6" rx="3" fill="${s}"/>`}
    </svg>`;
}
const ICONO_BOMBA = `<svg viewBox="0 0 80 64" aria-hidden="true">
      <rect x="0" y="22" width="80" height="20" fill="#FDBA74" opacity=".6"/>
      <rect x="22" y="6" width="36" height="52" rx="12" fill="#DDD6FE" stroke="#6D28D9" stroke-width="2.5"/>
      <circle cx="33" cy="16" r="5" fill="#22C55E"/><circle cx="47" cy="48" r="5" fill="#3B82F6"/>
      <path d="M33 28 V22 M30 25 L33 21 L36 25" stroke="#166534" stroke-width="2" fill="none"/>
      <path d="M47 36 V42 M44 39 L47 43 L50 39" stroke="#1E3A8A" stroke-width="2" fill="none"/>
    </svg>`;

export function crearSimMembrana(caja) {
    const tarjeta = (t, ion, nombre) => `
        <div class="nl-msim__card is-${ion}" data-card="${t}">
          <div class="nl-msim__ico" data-ico="${t}"></div>
          <div class="nl-msim__cuerpo">
            <strong>${nombre}</strong>
            <span class="nl-msim__cont"><button type="button" data-can="${t}:-1" aria-label="Quitar ${nombre}">−</button><b data-n="${t}">0</b><button type="button" data-can="${t}:1" aria-label="Agregar ${nombre}">+</button></span>
            <button type="button" class="nl-msim__sw" data-tog="${t === 'compNa' ? 'abiertoNa' : 'abiertoK'}" aria-pressed="false"><i></i><span>Compuerta cerrada</span></button>
          </div>
        </div>`;
    caja.innerHTML = `
      <div class="nl-msim__caja">
        <aside class="nl-msim__herr">
          <p class="nl-msim__etq">Iones</p>
          <div class="nl-msim__paleta" role="group" aria-label="Ion para agregar">
            <button type="button" class="nl-msim__ion is-na" data-sel="na" aria-pressed="true"><i>Na⁺</i>Sodio</button>
            <button type="button" class="nl-msim__ion is-k" data-sel="k" aria-pressed="false"><i>K⁺</i>Potasio</button>
          </div>
          <p class="nl-msim__ayuda">Toca <b>afuera</b> o <b>adentro</b> de la membrana: cada toque agrega 5 iones (25 mM).</p>
          <div class="nl-msim__fila"><button type="button" class="nl-msim__chico" data-acc="vaciar">Vaciar</button>
            <button type="button" class="nl-msim__chico is-reposo" data-acc="reposo" hidden>↺ Armar reposo</button></div>
          <p class="nl-msim__etq">Canales</p>
          ${tarjeta('compNa', 'na', 'Canal de Na⁺')}
          ${tarjeta('compK', 'k', 'Canal de K⁺')}
          <p class="nl-msim__etq">Transporte</p>
          <div class="nl-msim__card is-bomba">
            <div class="nl-msim__ico">${ICONO_BOMBA}</div>
            <div class="nl-msim__cuerpo"><strong>Bomba Na⁺/K⁺</strong>
              <button type="button" class="nl-msim__sw" data-tog="bomba" aria-pressed="true"><i></i><span>Encendida</span></button></div>
          </div>
        </aside>
        <canvas class="nl-msim__lienzo" width="${W * 2}" height="${H * 2}" aria-label="Simulador de membrana: iones, canales y voltímetro"></canvas>
      </div>`;
    const cv = caja.querySelector('canvas'), g = cv.getContext('2d');
    g.scale(2, 2);
    const S = { compNa: 0, compK: 0, abiertoNa: false, abiertoK: false, bomba: true };
    let prom = null, dtProm = 0, sel = 'na';
    let iones = [], V = 0, Vd = 0, traza = [], tBomba = 0, tTraza = 0, cbs = [], tAviso = 0, puedeReposo = false, visible = true;
    const pulsos = [], fila = {};   // fila: espera entre iones que entran por cada canal de Na⁺          // destellos donde cruza un ion o se agregan iones
    const rnd = (a, b) => a + Math.random() * (b - a);

    /* ---------- Iones ---------- */
    function nuevo(ion, lado, x, y) {
        const a = rnd(0, Math.PI * 2), v = rnd(140, 220);
        if (x == null) { x = rnd(R + 4, ZX - R - 4); y = lado === 'out' ? rnd(30, MY0 - R - 4) : rnd(MY1 + R + 4, H - 30); }
        return { ion, lado, x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, cruza: null };
    }
    const contar = (ion, lado) => iones.filter(p => p.ion === ion && p.lado === lado && !p.cruza).length;
    function agregar(ion, lado, n, x, y) {
        const lugar = MAXION - contar(ion, lado);
        for (let i = 0; i < Math.min(n, lugar); i++) iones.push(nuevo(ion, lado, x == null ? null : x + rnd(-10, 10), y == null ? null : y + rnd(-10, 10)));
        return lugar > 0;
    }
    function reposo() {
        iones = [];
        agregar('na', 'out', 30); agregar('na', 'in', 5); agregar('k', 'in', 30);
        S.bomba = true; S.abiertoNa = false; S.abiertoK = false;
        prom = null; Vd = V = potencial();
    }

    /* ---------- Canales (cada uno ocupa un lugar en la membrana) ---------- */
    function canales() {
        const l = FUGAS.map(x => ({ t: 'fuga', ion: 'k', abierto: true, x }));
        for (let i = 0; i < S.compNa; i++) l.push({ t: 'compNa', ion: 'na', abierto: S.abiertoNa });
        for (let i = 0; i < S.compK; i++) l.push({ t: 'compK', ion: 'k', abierto: S.abiertoK });
        return l.map((c, i) => c.x ? c : ({ ...c, x: SLOTS[i - FUGAS.length] }));
    }

    /* ---------- Potencial (GHK) ---------- */
    function potencial() {
        const pk = P_REPOSO_K + (S.abiertoK ? S.compK * P_COMP_K : 0);
        const pna = P_REPOSO_NA + (S.abiertoNa ? S.compNa * P_COMP_NA : 0);
        // concentraciones promediadas (~8 s): el voltaje responde de inmediato a la apertura de canales (permeabilidad)
        // y lento al cambio de concentraciones, como en la célula, donde cada impulso mueve muy pocos iones
        const ahora = { 'na:out': contar('na', 'out'), 'na:in': contar('na', 'in'), 'k:out': contar('k', 'out'), 'k:in': contar('k', 'in') };
        if (!prom) prom = { ...ahora };
        for (const k in ahora) prom[k] += (ahora[k] - prom[k]) * Math.min(1, dtProm * .12);
        // piso de 1 ion (5 mM): ningún lado queda en cero (en la célula el K⁺ de afuera es ≈ 5 mM)
        const c = (ion, lado) => Math.max(ion === 'k' && lado === 'out' && iones.length ? 1 : 0.4, prom[ion + ':' + lado]) * MM;
        let v = 61.5 * Math.log10((pk * c('k', 'out') + pna * c('na', 'out')) / (pk * c('k', 'in') + pna * c('na', 'in')));
        if (S.bomba && iones.length) v -= 3;
        return Math.max(-110, Math.min(70, v));
    }

    /* ---------- Paso de tiempo ---------- */
    function paso(dt) {
        const cs = canales();
        for (const p of iones) {
            if (p.cruza) {       // atravesando el poro o la bomba
                p.cruza.t += dt / p.cruza.dur;
                const u = Math.max(0, Math.min(1, p.cruza.t)), cz = p.cruza;
                if (cz.ax != null && u < .45) {           // tramo de acercamiento a la boca del canal
                    const k = u / .45; p.x = cz.ax + (cz.x - cz.ax) * k; p.y = cz.ay + (cz.y0 - cz.ay) * k;
                } else {
                    const k = cz.ax != null ? (u - .45) / .55 : u; p.x = cz.x; p.y = cz.y0 + (cz.y1 - cz.y0) * k;
                }
                if (p.cruza.t >= 1) { p.lado = p.cruza.a; p.vy = (p.lado === 'in' ? 1 : -1) * rnd(180, 230); p.vx = rnd(-110, 110); p.cruza = null; }
                continue;
            }
            p.vx += rnd(-260, 260) * dt; p.vy += rnd(-260, 260) * dt;            // agitación térmica
            // canal de Na⁺ abierto: el Na⁺ cercano de afuera entra en fila, uno tras otro (gradiente químico y eléctrico hacia adentro)
            if (p.ion === 'na' && p.lado === 'out') {
                const c = cs.find(c => c.t === 'compNa' && c.abierto && Math.hypot(c.x - p.x, MY0 - p.y) < 150 && (fila[c.x] || 0) <= 0);
                if (c) {
                    fila[c.x] = .28;
                    p.cruza = { ax: p.x, ay: p.y, x: c.x, y0: MY0 - R, y1: MY1 + R, a: 'in', t: 0, dur: .9 };
                    pulsos.push({ x: c.x, y: (MY0 + MY1) / 2, t: 0, ion: 'na' });
                    continue;
                }
            }
            const sp = Math.hypot(p.vx, p.vy), max = 230;
            if (sp > max) { p.vx *= max / sp; p.vy *= max / sp; }
            if (sp < 90) { p.vx *= 90 / (sp || 1); p.vy *= 90 / (sp || 1); }
            p.x += p.vx * dt; p.y += p.vy * dt;
            if (p.x < R) { p.x = R; p.vx = Math.abs(p.vx); }
            if (p.x > ZX - R) { p.x = ZX - R; p.vx = -Math.abs(p.vx); }
            const lim = p.lado === 'out' ? [R + 4, MY0 - R] : [MY1 + R, H - R - 4];
            if (p.y < lim[0]) { p.y = lim[0]; p.vy = Math.abs(p.vy); }
            if (p.y > lim[1]) { p.y = lim[1]; p.vy = -Math.abs(p.vy); }
            const enMembrana = p.lado === 'out' ? p.y >= MY0 - R - .5 : p.y <= MY1 + R + .5;
            if (enMembrana) {
                const c = cs.find(c => c.abierto && c.ion === p.ion && Math.abs(c.x - p.x) < 34);
                if (!c) continue;
                // Na⁺: el interior negativo y su gradiente lo empujan a entrar; salir por el canal es poco probable
                const prob = c.t === 'fuga' ? PASO_FUGA : c.ion === 'na' ? (p.lado === 'out' ? .9 : .05) : .9;
                if (Math.random() < prob) {
                    const sale = p.lado === 'in';
                    p.cruza = { x: c.x, y0: sale ? MY1 + R : MY0 - R, y1: sale ? MY0 - R : MY1 + R, a: sale ? 'out' : 'in', t: 0, dur: .35 };
                    pulsos.push({ x: c.x, y: (MY0 + MY1) / 2, t: 0, ion: p.ion });
                }
            }
        }
        for (const k in fila) fila[k] -= dt;
        // bomba: cada ciclo saca hasta 3 Na⁺ y mete hasta 2 K⁺ (como en la célula, no deja el lado pobre en cero)
        if (S.bomba) {
            tBomba += dt;
            if (tBomba > T_BOMBA) {
                tBomba = 0;
                const tomar = (ion, lado, n, a) => {
                    if (n <= 0) return 0;
                    const l = iones.filter(p => p.ion === ion && p.lado === lado && !p.cruza)
                        .sort((u, v) => Math.abs(u.x - XBOMBA) - Math.abs(v.x - XBOMBA)).slice(0, n);
                    l.forEach((p, i) => {
                        p.cruza = { x: XBOMBA + (i - 1) * 14, y0: lado === 'in' ? MY1 + R : MY0 - R, y1: a === 'out' ? MY0 - R : MY1 + R, a, t: -i * .15, dur: .5 };
                    });
                    return l.length;
                };
                const n = tomar('na', 'in', Math.min(3, contar('na', 'in') - MIN_NA_IN), 'out') + tomar('k', 'out', Math.min(2, contar('k', 'out') - MIN_K_OUT), 'in');
                if (n) pulsos.push({ x: XBOMBA, y: (MY0 + MY1) / 2, t: 0, ion: 'bomba' });
            }
        }
        dtProm = dt; V = potencial();
        Vd += (V - Vd) * Math.min(1, dt * 5);
        tTraza += dt;
        if (tTraza > .1) { tTraza = 0; traza.push(Vd); if (traza.length > 200) traza.shift(); }
        pulsos.forEach(u => { u.t += dt; });
        while (pulsos.length && pulsos[0].t > .6) pulsos.shift();
        tAviso += dt;
        if (tAviso > .3) { tAviso = 0; avisar(); }
    }

    /* ---------- Dibujo ---------- */
    function ionDib(x, y, ion) {
        g.beginPath(); g.arc(x, y, R, 0, Math.PI * 2);
        g.fillStyle = COL[ion][0]; g.fill(); g.lineWidth = 2.5; g.strokeStyle = COL[ion][1]; g.stroke();
        g.fillStyle = '#fff'; g.font = '800 10px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText(ion === 'na' ? 'Na⁺' : 'K⁺', x, y + .5);
    }
    function rr(x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
    function texto(t, x, y, size, col, al = 'left', w = 800) {
        g.font = `${w} ${size}px "Plus Jakarta Sans", Arial, sans-serif`; g.fillStyle = col; g.textAlign = al; g.textBaseline = 'alphabetic'; g.fillText(t, x, y);
    }
    function canalDib(c) {
        if (c.t === 'fuga') {   // canal de fuga: más angosto, sin compuerta, siempre abierto
            g.fillStyle = '#DBEAFE'; g.strokeStyle = '#60A5FA'; g.lineWidth = 2.5;
            rr(c.x - 22, MY0 - 10, 16, MY1 - MY0 + 20, 6); g.fill(); g.stroke();
            rr(c.x + 6, MY0 - 10, 16, MY1 - MY0 + 20, 6); g.fill(); g.stroke();
            texto('fuga', c.x, MY1 + 26, 12, '#3B82F6', 'center', 700);
            return;
        }
        const [f, s] = c.ion === 'na' ? ['#BBF7D0', COL.na[1]] : ['#BFDBFE', COL.k[1]];
        const gap = c.abierto ? 26 : 8;
        g.fillStyle = f; g.strokeStyle = s; g.lineWidth = 3;
        rr(c.x - 32, MY0 - 18, 32 - gap / 2, MY1 - MY0 + 36, 8); g.fill(); g.stroke();
        rr(c.x + gap / 2, MY0 - 18, 32 - gap / 2, MY1 - MY0 + 36, 8); g.fill(); g.stroke();
        g.fillStyle = s;
        if (c.abierto) { g.save(); g.translate(c.x - 26, MY0 - 26); g.rotate(-.6); rr(-14, -5, 28, 10, 5); g.fill(); g.restore(); }
        else { rr(c.x - 15, MY0 - 28, 30, 10, 5); g.fill(); }
    }
    function dibujar() {
        g.clearRect(0, 0, W, H);
        g.fillStyle = COL.ext; g.fillRect(0, 0, ZX, MY0);
        g.fillStyle = COL.int; g.fillRect(0, MY1, ZX, H - MY1);
        g.fillStyle = '#FFEDD5'; g.fillRect(0, MY0, ZX, MY1 - MY0);
        texto('AFUERA · medio extracelular', 16, 30, 17, '#0C4A6E');
        texto('ADENTRO · citoplasma', 16, H - 16, 17, '#7C2D12');
        const cs = canales();
        const ocupado = x => cs.some(c => Math.abs(c.x - x) < 40) || Math.abs(x - XBOMBA) < 44;
        for (let x = 10; x < ZX; x += 20) {
            if (ocupado(x)) continue;
            g.strokeStyle = COL.cola; g.lineWidth = 2.5;
            g.beginPath(); g.moveTo(x - 3, MY0 + 18); g.lineTo(x - 3, MY0 + 29); g.moveTo(x + 3, MY0 + 18); g.lineTo(x + 3, MY0 + 29);
            g.moveTo(x - 3, MY1 - 18); g.lineTo(x - 3, MY1 - 29); g.moveTo(x + 3, MY1 - 18); g.lineTo(x + 3, MY1 - 29); g.stroke();
            g.fillStyle = COL.cabeza;
            g.beginPath(); g.arc(x, MY0 + 9, 8, 0, Math.PI * 2); g.fill();
            g.beginPath(); g.arc(x, MY1 - 9, 8, 0, Math.PI * 2); g.fill();
        }
        cs.forEach(canalDib);
        // bomba
        g.fillStyle = S.bomba ? '#C4B5FD' : '#E9E5F5'; g.strokeStyle = S.bomba ? '#6D28D9' : '#A1A1AA'; g.lineWidth = 3;
        rr(XBOMBA - 36, MY0 - 24, 72, MY1 - MY0 + 48, 18); g.fill(); g.stroke();
        texto('ATP', XBOMBA, (MY0 + MY1) / 2 + 5, 14, S.bomba ? '#5B21B6' : '#71717A', 'center');
        pulsos.forEach(u => {
            g.globalAlpha = Math.max(0, .6 - u.t);
            g.fillStyle = u.ion === 'na' ? COL.na[0] : u.ion === 'k' ? COL.k[0] : '#8B5CF6';
            g.beginPath(); g.arc(u.x, u.y, (u.r || 22) + u.t * 40, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
        });
        iones.forEach(p => ionDib(p.x, p.y, p.ion));
        // electrodos del voltímetro (por la derecha, lejos de la bomba)
        const xe = ZX - 70, ya = MY0 - 22, yb = MY1 + 22;
        g.lineWidth = 3; g.lineJoin = 'round';
        g.strokeStyle = '#475569'; g.beginPath(); g.moveTo(ZX + 16, 330); g.lineTo(ZX - 12, 330); g.lineTo(ZX - 12, ya - 30); g.lineTo(xe, ya - 30); g.lineTo(xe, ya); g.stroke();
        g.strokeStyle = '#DC2626'; g.beginPath(); g.moveTo(ZX + 16, 392); g.lineTo(ZX - 12, 392); g.lineTo(ZX - 12, yb + 30); g.lineTo(xe, yb + 30); g.lineTo(xe, yb); g.stroke();
        g.fillStyle = '#475569'; g.beginPath(); g.moveTo(xe - 5, ya - 6); g.lineTo(xe + 5, ya - 6); g.lineTo(xe, ya + 4); g.fill();
        g.fillStyle = '#DC2626'; g.beginPath(); g.moveTo(xe - 5, yb + 6); g.lineTo(xe + 5, yb + 6); g.lineTo(xe, yb - 4); g.fill();
        panelDer();
    }
    function panelDer() {
        const x0 = ZX + 16, w = W - x0 - 12;
        g.fillStyle = '#1A0E2E'; g.fillRect(ZX, 0, W - ZX, H);
        // concentraciones
        const y0 = 12;
        g.fillStyle = '#fff'; rr(x0, y0, w, 236, 14); g.fill();
        texto('Concentración (mM)', x0 + 12, y0 + 24, 13, '#334155');
        [['Na⁺', 'na', 'out', 'afuera'], ['Na⁺', 'na', 'in', 'adentro'], ['K⁺', 'k', 'out', 'afuera'], ['K⁺', 'k', 'in', 'adentro']].forEach(([t, ion, lado, l], i) => {
            const y = y0 + 46 + i * 46, n = contar(ion, lado), bw = (w - 150) * n / MAXION;
            texto(`${t} ${l}`, x0 + 12, y + 14, 13, COL[ion][1], 'left', 800);
            g.fillStyle = '#F1F5F9'; rr(x0 + 100, y, w - 150, 20, 6); g.fill();
            g.fillStyle = COL[ion][0]; rr(x0 + 100, y, Math.max(2, bw), 20, 6); g.fill();
            texto(String(n * MM), x0 + w - 12, y + 15, 13, '#334155', 'right', 800);
        });
        // voltímetro
        const vy = 262;
        g.fillStyle = '#0F0820'; g.strokeStyle = '#A78BFA'; g.lineWidth = 2; rr(x0, vy, w, 170, 14); g.fill(); g.stroke();
        texto('VOLTÍMETRO', x0 + 14, vy + 24, 13, '#C4B5FD', 'left', 800);
        const v = Math.round(Vd);
        texto(`${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v)} mV`, x0 + w / 2, vy + 84, 46, v > -50 ? '#FCD34D' : '#93C5FD', 'center', 800);
        // escala −100 a +60 con la aguja
        const sx0 = x0 + 20, sw = w - 40, sy = vy + 112, X = mv => sx0 + (mv + 100) / 160 * sw;
        const gr = g.createLinearGradient(sx0, 0, sx0 + sw, 0);
        gr.addColorStop(0, '#1D4ED8'); gr.addColorStop(.55, '#64748B'); gr.addColorStop(1, '#F59E0B');
        g.fillStyle = gr; rr(sx0, sy, sw, 12, 6); g.fill();
        [-100, -70, -50, 0, 50].forEach(m => { texto(String(m).replace('-', '−'), X(m), sy + 32, 11, '#C4B5FD', 'center', 700); });
        const xa = X(Math.max(-100, Math.min(60, v)));
        g.fillStyle = '#fff'; g.beginPath(); g.moveTo(xa, sy - 4); g.lineTo(xa - 7, sy - 14); g.lineTo(xa + 7, sy - 14); g.closePath(); g.fill();
        g.strokeStyle = '#475569'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, 330); g.lineTo(x0 + 8, 330); g.stroke();
        g.strokeStyle = '#DC2626'; g.beginPath(); g.moveTo(x0, 392); g.lineTo(x0 + 8, 392); g.stroke();
        // registro
        const ry = 446, rh = H - ry - 12;
        g.fillStyle = '#fff'; rr(x0, ry, w, rh, 14); g.fill();
        texto('Registro', x0 + 12, ry + 22, 13, '#334155');
        const px0 = x0 + 44, pw = w - 56, py0 = ry + 34, ph = rh - 46;
        const Y = mv => py0 + (60 - mv) / 170 * ph;
        g.strokeStyle = '#E2E8F0'; g.lineWidth = 1;
        [40, 0, -40, -80].forEach(m => { g.beginPath(); g.moveTo(px0, Y(m)); g.lineTo(px0 + pw, Y(m)); g.stroke(); texto(String(m).replace('-', '−'), px0 - 6, Y(m) + 4, 11, '#64748B', 'right', 700); });
        g.setLineDash([6, 5]); g.strokeStyle = '#94A3B8'; g.beginPath(); g.moveTo(px0, Y(-70)); g.lineTo(px0 + pw, Y(-70)); g.stroke(); g.setLineDash([]);
        g.strokeStyle = '#7C3AED'; g.lineWidth = 3; g.beginPath();
        traza.forEach((m, i) => { const x = px0 + pw * (i + 200 - traza.length) / 200; if (i) g.lineTo(x, Y(m)); else g.moveTo(x, Y(m)); });
        g.stroke();
    }

    /* ---------- Herramientas ---------- */
    function sincronizar() {
        caja.querySelectorAll('[data-n]').forEach(b => { b.textContent = S[b.dataset.n]; });
        caja.querySelectorAll('[data-tog]').forEach(b => {
            const t = b.dataset.tog, on = S[t];
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
            b.querySelector('span').textContent = t === 'bomba' ? (on ? 'Encendida' : 'Apagada') : (on ? 'Compuerta abierta' : 'Compuerta cerrada');
            b.disabled = t !== 'bomba' && !S[t === 'abiertoNa' ? 'compNa' : 'compK'];
        });
        caja.querySelector('[data-ico="compNa"]').innerHTML = iconoCanal('na', S.abiertoNa);
        caja.querySelector('[data-ico="compK"]').innerHTML = iconoCanal('k', S.abiertoK);
        caja.querySelector('[data-acc="reposo"]').hidden = !puedeReposo;
        caja.querySelectorAll('[data-sel]').forEach(b => b.setAttribute('aria-pressed', b.dataset.sel === sel ? 'true' : 'false'));
        cv.classList.toggle('is-k', sel === 'k');
        avisar();
    }
    caja.querySelectorAll('[data-sel]').forEach(b => b.addEventListener('click', () => { sel = b.dataset.sel; sincronizar(); }));
    cv.addEventListener('click', ev => {
        const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width * W, y = (ev.clientY - r.top) / r.height * H;
        if (x > ZX - 4) return;
        const lado = y < MY0 ? 'out' : y > MY1 ? 'in' : null;
        if (!lado) return;
        const yy = Math.max(lado === 'out' ? R + 6 : MY1 + R + 6, Math.min(lado === 'out' ? MY0 - R - 6 : H - R - 6, y));
        prom = null;   // agregar a mano cambia la concentración de inmediato (no es un flujo por canales)
        if (agregar(sel, lado, 5, Math.max(R + 12, Math.min(ZX - R - 12, x)), yy)) pulsos.push({ x, y: yy, t: 0, ion: sel, r: 10 });
        avisar();
    });
    caja.querySelector('[data-acc="vaciar"]').addEventListener('click', () => { iones = []; prom = null; avisar(); });
    caja.querySelector('[data-acc="reposo"]').addEventListener('click', () => { reposo(); sincronizar(); });
    caja.querySelectorAll('[data-can]').forEach(b => b.addEventListener('click', () => {
        const [t, d] = b.dataset.can.split(':');
        S[t] = Math.max(0, Math.min(MAXCANAL, S[t] + Number(d)));
        if (!S[t]) S[t === 'compNa' ? 'abiertoNa' : 'abiertoK'] = false;
        sincronizar();
    }));
    caja.querySelectorAll('[data-tog]').forEach(b => b.addEventListener('click', () => { S[b.dataset.tog] = !S[b.dataset.tog]; sincronizar(); }));

    function estado() {
        return { ...S, V: Math.round(Vd), naOut: contar('na', 'out'), naIn: contar('na', 'in'), kOut: contar('k', 'out'), kIn: contar('k', 'in') };
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
    return {
        estado,
        alCambiar(f) { cbs = [f]; },
        reiniciar() { iones = []; Object.assign(S, { compNa: 0, compK: 0, abiertoNa: false, abiertoK: false, bomba: true }); prom = null; traza = []; sel = 'na'; sincronizar(); },
        permitirReposo(si) { if (puedeReposo !== !!si) { puedeReposo = !!si; sincronizar(); } },
        mostrar(si) { visible = !!si; caja.hidden = !si; },
        lienzo: cv,
    };
}
