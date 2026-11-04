/**
 * NeuroLab — escenas.js
 * Nivel «escenas» de una lámina: casos en orden sobre una imagen fija (`fondo`, coordenadas en `vb`).
 *   · modo «poe» (predice → observa → explica): cada caso trae una predicción de una sola oportunidad;
 *     al responder se ve la animación del caso (partículas por rutas, efectos y rótulos) y la explicación.
 *   · modo «casos»: pasos «tocar» (una zona del fondo), «sistema» (SNC o SNP), «tarjeta» (célula con ícono)
 *     y «elegir» (alternativas con pista); al terminar, la lesión se marca en el fondo y el caso suma una fila al cuadro.
 *     Si el caso trae «foto», la vista muestra la ficha del caso (enfermedad, paciente, «contexto») junto a la imagen
 *     real; «dx» en el nivel muestra el nombre de la enfermedad desde el inicio; `cartas_mesa` pone las tarjetas bajo la ficha.
 *   · Pasos comunes: «mira» (instrucción con botón; `vista: "sim"` abre el simulador), «numero» (valor medido, `rango` [mín, máx]).
 *     `capas` en el nivel ([{src, casos}]): imágenes que se superponen al fondo (y quedan) cuando se resuelve alguno de esos casos
 *     `sim` en el nivel ({url, t, pie}) agrega la pestaña del simulador; `fondo`/`fondo_ok` en un caso cambian la imagen
 *     (antes y después de resolverlo); efectos con `a: "traza"` se dibujan como una línea que avanza.
 *   · `simulador: "membrana"` (nivel): el simulador propio (js/sim-membrana.js) ocupa la vista; pasos «sim» con `checks`
 *     [{t, c}] (c = nombre en CHEQUEOS) que se marcan en vivo y, opcional, `q` {p, ops, ok, pista}: una pregunta que se
 *     habilita al cumplirse la lista y se responde en el mismo paso; `reposo_tras` = clave del caso que habilita «Armar reposo».
 *     `simulador: "pa"`: simulador del potencial de acción (js/sim-pa.js), mismos pasos «sim»; `sim_cfg` {vista: "neurona", max, ventana}
 *     (dibujo y estímulos por registro). «Empezar de nuevo» también reinicia el simulador. Un caso con `esquema: true`
 *     muestra el fondo del nivel (pasos «elegir»/«tocar» con animación) en vez del simulador.
 *     `simulador: "sinapsis"`: sinapsis química (js/sim-sinapsis.js); `sim_cfg` {controles: [pa, tren, ca, recap, nt, rec], nt}.
 *     `simulador: "reflejo"`: circuito reflejo (js/sim-reflejo.js); `sim_cfg` {controles: [golpe, clavo, inh, lesion], ascendente}.
 *   · modo «etapas»: una secuencia en columnas (`cols`, filas `filas_y`). Cada etapa es un caso con `col` y un paso
 *     «mira» (la columna se destapa y se anima; texto SNP/SNC en el panel); después un caso con pasos «sistema»
 *     que marcan su columna (`col`) y llenan el cuadro por etapa (`cuadro_etapas`, con `fila` y `celda`).
 * Son preguntas formativas: las respuestas vienen en data-nivel. Avance: localStorage nl_esc_<clave>.
 * Al completar: markDone(clave) y la sección va a la guía (imagen + cuadro + explicaciones).
 */
import { markDone, bloqueado } from './progress.js';
import { sumarAGuia, urlGuia } from './guia.js';
import { conexionGuia } from './carrera.js';
import { crearSimMembrana, CHEQUEOS } from './sim-membrana.js';
import { crearSimPA, CHEQUEOS as CHEQUEOS_PA } from './sim-pa.js';
import { crearSimSinapsis, CHEQUEOS as CHEQUEOS_SIN } from './sim-sinapsis.js';
import { crearSimReflejo, CHEQUEOS as CHEQUEOS_REF } from './sim-reflejo.js';

const RAIZ = document.getElementById('nl-esc');
const MAX_GUIA = 900;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const angosta = () => window.matchMedia('(max-width: 900px)').matches;
const cargar = src => new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
function barajar(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

/** Partículas (dibujadas en torno a 0,0; se escalan según el ancho del fondo). */
const FORMAS = {
    glu:  ['Glucosa', '<polygon points="10,0 5,8.7 -5,8.7 -10,0 -5,-8.7 5,-8.7" fill="#FB923C" stroke="#C2410C" stroke-width="2"/>'],
    lac:  ['Lactato', '<path d="M0,-11 C5,-4 8,0 8,4 A8,8 0 0 1 -8,4 C-8,0 -5,-4 0,-11Z" fill="#FDE047" stroke="#A16207" stroke-width="2"/>'],
    glut: ['Glutamato', '<circle r="6.5" fill="#22C55E" stroke="#15803D" stroke-width="2"/>'],
    gln:  ['Glutamina', '<rect x="-5.5" y="-5.5" width="11" height="11" transform="rotate(45)" fill="#2DD4BF" stroke="#0F766E" stroke-width="2"/>'],
    prot: ['Proteínas de la sangre', '<circle r="11" fill="#A78BFA" stroke="#6D28D9" stroke-width="2"/><circle r="4" cx="-3" cy="-3" fill="#EDE9FE"/>'],
    agua: ['Agua', '<path d="M0,-9 C4,-3 6,0 6,3.5 A6,6 0 0 1 -6,3.5 C-6,0 -4,-3 0,-9Z" fill="#7DD3FC" stroke="#0369A1" stroke-width="1.6"/>'],
    ca:   ['Ca²⁺', '<circle r="5.5" fill="#F87171" stroke="#B91C1C" stroke-width="2"/><text y="2.5" font-size="7" font-weight="700" text-anchor="middle" fill="#fff" font-family="Arial">+</text>'],
    na:   ['Na⁺', '<circle r="7" fill="#22C55E" stroke="#166534" stroke-width="2"/>'],
    k:    ['K⁺', '<circle r="7" fill="#3B82F6" stroke="#1E3A8A" stroke-width="2"/>'],
    cl:   ['Cl⁻', '<circle r="6" fill="#FACC15" stroke="#A16207" stroke-width="2"/>'],
    nt:   ['Glutamato', '<polygon points="0,-7 6,4 -6,4" fill="#EC4899" stroke="#9D174D" stroke-width="1.8"/>'],
    gaba: ['GABA', '<rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" fill="#F97316" stroke="#9A3412" stroke-width="1.6"/>'],
    cono: ['Punta del axón que crece', '<circle r="8" fill="#A855F7" stroke="#6B21A8" stroke-width="2.5"/><circle r="3" cx="2.5" cy="-2" fill="#F3E8FF"/>'],
};

/** Zonas: e = elipse [cx, cy, rx, ry] · r = rectángulo [x, y, w, h] · l = líneas [[[x, y], …], …] con tolerancia w. */
function dentro(z, x, y) {
    if (z.e) { const [cx, cy, rx, ry] = z.e; return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1; }
    if (z.r) { const [rx, ry, w, h] = z.r; return x >= rx && x <= rx + w && y >= ry && y <= ry + h; }
    if (z.l) {
        const w = z.w || 24;
        return z.l.some(lin => lin.some((p, i) => {
            if (!i) return false;
            const [ax, ay] = lin[i - 1], [bx, by] = p, dx = bx - ax, dy = by - ay;
            const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
            return Math.hypot(x - (ax + t * dx), y - (ay + t * dy)) <= w;
        }));
    }
    return false;
}
function centro(z) {
    if (z.e) return [z.e[0], z.e[1]];
    if (z.r) return [z.r[0] + z.r[2] / 2, z.r[1] + z.r[3] / 2];
    const l = z.l[0]; return l[Math.floor(l.length / 2)];
}
function formaSvg(z, attrs) {
    if (z.e) return `<ellipse cx="${z.e[0]}" cy="${z.e[1]}" rx="${z.e[2]}" ry="${z.e[3]}" ${attrs}/>`;
    if (z.r) return `<rect x="${z.r[0]}" y="${z.r[1]}" width="${z.r[2]}" height="${z.r[3]}" rx="${Math.min(z.r[2], z.r[3]) / 3}" ${attrs}/>`;
    return z.l.map(l => `<polyline points="${l.map(p => p.join(',')).join(' ')}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${attrs}/>`).join('');
}

function iniciar(raiz) {
    const d = raiz.dataset;
    let N = {};
    try { N = JSON.parse(d.nivel || '{}'); } catch { N = {}; }
    const casos = N.casos || [];
    (N.capas || []).forEach(c => { const i = new Image(); i.src = c.src; });   // capas que se destapan al resolver casos: precargadas
    let capasVistas = null;
    if (!casos.length) return;
    const VB = N.vb || [100, 100];
    const S = N.escala || VB[0] / 640;          // tamaño de las partículas
    const poe = N.modo === 'poe';
    const etapas = N.modo === 'etapas';
    const zonas = N.zonas || {};
    const clave = d.clave, KEY = 'nl_esc_' + clave;
    const ruta = new URLSearchParams(location.search).get('ruta') || '';
    const vista = raiz.querySelector('#nl-esc-vista');
    const panel = raiz.querySelector('#nl-esc-trabajo');
    const pasosEl = raiz.querySelector('#nl-esc-pasos');
    const contador = raiz.querySelector('#nl-esc-contador');
    const errores = raiz.querySelector('#nl-esc-errores');
    const instr = raiz.querySelector('#nl-mesa-instr');
    const tplCx = document.getElementById('nl-conexion-tpl');
    const iconos = {};
    document.getElementById('nl-esc-iconos')?.content.querySelectorAll('[data-op]').forEach(n => { iconos[n.dataset.op] = n.innerHTML; });

    if (bloqueado(d.requiere)) {
        raiz.classList.add('is-bloqueada');
        raiz.querySelector('.nl-lab__candado')?.removeAttribute('hidden');
        return;
    }

    /* Pestaña del simulador (N.sim): el iframe vive fuera de la vista para no recargarse al repintar */
    const simF = raiz.querySelector('.nl-esc__sim'), simPie = raiz.querySelector('.nl-esc__simpie');
    const verBtns = raiz.querySelectorAll('.nl-esc__simbarra [data-ver]');
    let enSim = false, ultPaso = '';
    function mostrarSim(si) {
        if (!simF) return;
        enSim = !!si;
        if (enSim && !simF.getAttribute('src')) simF.setAttribute('src', simF.dataset.src);
        simF.hidden = !enSim; if (simPie) simPie.hidden = !enSim;
        vista.hidden = enSim;
        verBtns.forEach(b => b.classList.toggle('active', (b.dataset.ver === 'sim') === enSim));
    }
    verBtns.forEach(b => b.addEventListener('click', () => mostrarSim(b.dataset.ver === 'sim')));
    /** Al cambiar de paso, la vista que pide el paso (`vista: "sim"`); al resolver un caso con animación, el esquema. */
    function vistaPaso() {
        if (!simF) return;
        const e = ec(ver), p = !verCierre && !listo(ver) ? ver.pasos[e.paso] : null;
        const k = verCierre ? 'fin' : ver.clave + ':' + e.paso;
        if (k === ultPaso) return;
        ultPaso = k;
        if (p && p.vista) mostrarSim(p.vista === 'sim');
        else if (!p && (verCierre || ver.anim || ver.fondo_ok)) mostrarSim(false);
    }

    /* Simulador propio (N.simulador): vive junto a la vista y no se repinta */
    let simM = null, simCaja = null;
    if (N.simulador === 'membrana' || N.simulador === 'pa' || N.simulador === 'sinapsis' || N.simulador === 'reflejo') {
        simCaja = document.createElement('div');
        simCaja.className = 'nl-msim';
        vista.parentNode.insertBefore(simCaja, vista);
        simM = N.simulador === 'pa' ? crearSimPA(simCaja, N.sim_cfg || {})
            : N.simulador === 'sinapsis' ? crearSimSinapsis(simCaja, N.sim_cfg || {})
            : N.simulador === 'reflejo' ? crearSimReflejo(simCaja, N.sim_cfg || {}) : crearSimMembrana(simCaja);
    }
    const CHK = N.simulador === 'pa' ? CHEQUEOS_PA : N.simulador === 'sinapsis' ? CHEQUEOS_SIN : N.simulador === 'reflejo' ? CHEQUEOS_REF : CHEQUEOS;

    let est = null;
    try { est = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { est = null; }
    if (!est || typeof est !== 'object' || !est.c) est = { c: {}, err: 0, nombres: true };
    const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(est)); } catch { /* sin espacio */ } };
    const ec = cs => {
        const e = est.c[cs.clave] || (est.c[cs.clave] = { paso: 0, r: {} });
        cs.pasos.forEach((p, i) => {
            const r = e.r[i] || (e.r[i] = { mal: [] });
            const ops = p.ops || (p.q && p.q.ops);
            if (ops && !Array.isArray(r.orden)) r.orden = p.tipo === 'sistema' ? ops.map((_, k) => k) : barajar(ops.length);
        });
        return e;
    };
    const listo = cs => ec(cs).paso >= cs.pasos.length;
    const actual = () => casos.find(cs => !listo(cs)) || null;
    let ver = actual() || casos[casos.length - 1];
    let verCierre = !actual();
    let marca = null;        // último toque fallido [x, y]
    let recien = false;      // el caso se acaba de resolver: se anima desde el principio
    if (instr && !Object.keys(est.c).length) instr.open = true;

    const NOMBRES_PASO = { predice: 'Predice', mira: 'Mira', numero: 'Mide', sim: 'Simulador', tocar: 'Dónde', sistema: 'SNC o SNP', tarjeta: 'Célula', elegir: 'Por qué' };
    const SISTEMAS = { SNC: 'Sistema nervioso central: encéfalo y médula espinal', SNP: 'Sistema nervioso periférico: nervios y ganglios' };
    const nomPaso = p => p.nombre || (N.nombres_paso || {})[p.tipo] || NOMBRES_PASO[p.tipo] || 'Pregunta';
    const pct = (x, y) => [x / VB[0] * 100, y / VB[1] * 100];
    /** En «casos» el diagnóstico (corto) se ve sólo al resolverlo (salvo «dx»); antes, el paciente. */
    const nombreCaso = cs => (poe || N.dx || listo(cs) ? cs.corto : '') || cs.titulo;
    const malCaso = cs => Object.values(ec(cs).r).some(r => r.mal.length || r.fallo || (r.qmal || []).length);

    /* ---------------- Animación de un caso ---------------- */
    function particula(f, dd, dur, t, rep) {
        const forma = FORMAS[f] || FORMAS.glut;
        const vis = rep
            ? `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.08;.88;1" dur="${dur}s" begin="${t}s" repeatCount="indefinite"/>`
            : `<set attributeName="opacity" to="1" begin="${t}s" fill="freeze"/>`;
        return `<g opacity="0">${vis}<animateMotion path="${dd}" dur="${dur}s" begin="${t}s" ${rep ? 'repeatCount="indefinite"' : 'fill="freeze"'}/>
            <g transform="scale(${S})">${forma[1]}</g></g>`;
    }
    function animSvg(a) {
        let svg = '';
        (a.efectos || []).forEach(ef => {
            const col = ef.c || 'rgba(239,68,68,.35)';
            const traza = ef.a === 'traza';
            const attrs = (ef.l ? `stroke="${col}" stroke-width="${ef.w || 18}"` : `fill="${col}" stroke="${ef.s || 'none'}" stroke-width="${ef.sw || 4}"`)
                + (traza ? ' pathLength="1"' : '') + (ef.dash ? ` stroke-dasharray="${ef.dash}"` : '');
            const cls = traza ? 'nl-esc__traza' : ef.a === 'pulso' ? 'nl-esc__pulso' : ef.a === 'crece' ? 'nl-esc__crece' : '';
            svg += `<g class="nl-esc__ef" style="animation-delay:${ef.t || 0}s"><g class="${cls}"${traza ? ` style="animation-delay:${ef.t || 0}s;animation-duration:${ef.dur || 2}s"` : ''}>${formaSvg(ef, attrs)}</g></g>`;
        });
        (a.flujos || []).forEach(fl => {
            const n = fl.n || 4, dur = fl.dur || 3, t0 = fl.t || 0, rep = fl.rep !== false;
            for (let i = 0; i < n; i++) {
                const fin = fl.fin && fl.fin[i % fl.fin.length];
                const dd = fin ? `${fl.d} L${fin[0]} ${fin[1]}` : fl.d;
                svg += particula(fl.f, dd, dur, rep ? +(t0 + i * dur / n).toFixed(2) : +(t0 + i * (fl.paso || .35)).toFixed(2), rep);
            }
        });
        return svg;
    }
    const rotulos = (lista, base, pos = r => pct(r.x, r.y)) => (lista || []).map(r => {
        const [x, y] = pos(r);
        return `<span class="nl-esc__rot${base ? ' is-base' : ''}${r.i ? ' is-izq' : ''}${r.c ? ' is-' + r.c : ''}" style="left:${x}%;top:${y}%;animation-delay:${base ? 0 : r.s || 0}s"><i></i>${esc(r.t)}</span>`;
    }).join('');
    const formasDe = a => [...new Set((a.flujos || []).map(f => f.f))];

    /* ---------------- Modo «etapas»: columnas, velos y cuadro por etapa ---------------- */
    const conFilas = cs => cs.pasos.some(p => p.fila);
    /** Velos sobre las etapas que vienen, la etapa actual se destapa; en las preguntas, marco en la etapa del hecho. */
    function velos(cs, p) {
        if (!N.cols || !N.filas_y) return '';
        const rect = (j, attrs, cls) => N.filas_y.map(([y0, y1]) =>
            `<rect x="${N.cols[j][0]}" y="${y0}" width="${N.cols[j][1] - N.cols[j][0]}" height="${y1 - y0}" ${attrs}${cls ? ` class="${cls}"` : ''}/>`).join('');
        const VELO = 'fill="rgba(15,8,32,.9)"', MARCO = 'fill="none" stroke="#F59E0B" stroke-width="7" rx="14"';
        let s = '';
        if (cs.col != null) {
            N.cols.forEach((_, j) => {
                if (j > cs.col) s += rect(j, VELO);
                if (j === cs.col) s += rect(j, VELO, 'nl-esc__destapa') + `<g class="nl-esc__ef" style="animation-delay:.6s"><g class="nl-esc__pulso">${rect(j, MARCO)}</g></g>`;
            });
        } else if (p && p.col != null) {
            N.cols.forEach((_, j) => { s += j === p.col ? rect(j, MARCO) : rect(j, 'fill="rgba(15,8,32,.5)"'); });
        }
        return s;
    }
    function cuadroEtapas() {
        const CE = N.cuadro_etapas, cel = {};
        casos.forEach(cs => cs.pasos.forEach((p, i) => {
            if (!p.fila || !(ec(cs).r[i] || {}).ok) return;
            ((cel[p.fila] = cel[p.fila] || {})[p.ok] = cel[p.fila][p.ok] || []).push(p.celda || p.p);
        }));
        return `<table class="nl-tip__cuadro is-grande nl-esc__cuadro">
            <thead><tr><th>Etapa</th>${CE.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
            <tbody>${CE.filas.map(f => `<tr><th>${esc(f)}</th>${CE.cols.map((_, k) => {
                const v = (cel[f] || {})[k];
                return `<td>${v ? v.map(esc).join('<br>') : '<span class="nl-tip__vacia">·</span>'}</td>`;
            }).join('')}</tr>`).join('')}</tbody></table>`;
    }
    function pintarCuadroEtapas(conVolver) {
        vista.innerHTML = `<div class="nl-esc__cuadro-caja"><p class="nl-tip__fila-etq">Tu cuadro por etapa</p>${cuadroEtapas()}</div>
            ${conVolver ? '<div class="nl-esc__barra"><span class="nl-esc__botones"><button type="button" class="nl-esc__btn" data-acc="imagen">🖼 Ver la imagen</button></span></div>' : ''}`;
        vista.querySelector('[data-acc="imagen"]')?.addEventListener('click', () => { est.vc = false; guardar(); pintarVista(); });
    }

    /**
     * Etapa en grande: la columna `col`, recortada por fila (SNP | SNC), con sus rótulos y partículas.
     * Al mirar una etapa (cs.col) se anima; al clasificar un hecho (p.col) se muestra quieta, con su etapa marcada en la miniatura.
     */
    function pintarEtapa(cs, p) {
        const mirando = cs.col != null, col = mirando ? cs.col : p.col;
        const [x0, x1] = N.cols[col], w = x1 - x0;
        const a = (casos.find(c => c.col === col) || {}).anim || {};
        const hMax = Math.max(...N.recortes.map(f => f.y[1] - f.y[0]));
        const figs = N.recortes.map(f => {
            const [y0, y1] = f.y, h = y1 - y0;
            const rots = (a.rotulos || []).filter(r => r.x >= x0 && r.x <= x1 && r.y >= y0 && r.y <= y1);
            return `<figure class="nl-esc__rec is-${esc(f.c)}" style="--rw:${(w / hMax).toFixed(3)}">
                <figcaption>${esc(f.t)}</figcaption>
                <div class="nl-esc__rec-lienzo" style="aspect-ratio:${w} / ${h}">
                  <svg viewBox="${x0} ${y0} ${w} ${h}" aria-hidden="true"><image href="${esc(d.fondo)}" width="${VB[0]}" height="${VB[1]}"/>${animSvg(mirando ? a : { flujos: a.flujos })}</svg>
                  ${rotulos(rots, !mirando, r => [(r.x - x0) / w * 100, (r.y - y0) / h * 100])}
                </div></figure>`;
        }).join('');
        const ley = formasDe(a);
        vista.innerHTML = `
            <div class="nl-esc__etapa${mirando ? '' : ' is-quieta'}">${figs}</div>
            <div class="nl-esc__barra">
              <button type="button" class="nl-esc__mapa" data-acc="ampliar" aria-label="Ver la secuencia completa">
                <svg viewBox="0 0 ${VB[0]} ${VB[1]}" aria-hidden="true"><image href="${esc(d.fondo)}" width="${VB[0]}" height="${VB[1]}"/>${velos(cs, p)}</svg></button>
              <p class="nl-lam__ayuda-vista">${mirando ? `<strong>${esc(cs.titulo)}</strong>: mira lo que pasa` : `<strong>${esc(N.cols_t ? N.cols_t[col] : '')}</strong>: la etapa de este hecho`}<br>
                <span class="nl-esc__mapa-txt">Etapa ${col + 1} de ${N.cols.length} · toca la miniatura para ver la secuencia completa</span></p>
              ${ley.length ? `<span class="nl-esc__ley">${ley.map(f => `<span><svg viewBox="-12 -12 24 24" aria-hidden="true">${FORMAS[f][1]}</svg>${FORMAS[f][0]}</span>`).join('')}</span>` : ''}
              <span class="nl-esc__botones">
                ${mirando ? '<button type="button" class="nl-esc__btn" data-acc="repetir">▶ Ver de nuevo</button>' : ''}
                ${N.cuadro_etapas && conFilas(cs) ? '<button type="button" class="nl-esc__btn" data-acc="cuadro">▦ Ver cuadro</button>' : ''}
              </span>
            </div>`;
        vista.querySelectorAll('svg').forEach(s => { try { s.setCurrentTime(0); } catch { /* sin SMIL */ } });
        recien = false;
        vista.querySelector('[data-acc="repetir"]')?.addEventListener('click', () => { recien = true; pintarVista(); });
        vista.querySelector('[data-acc="cuadro"]')?.addEventListener('click', () => { est.vc = true; guardar(); pintarVista(); });
        vista.querySelector('[data-acc="ampliar"]').addEventListener('click', () => abrirVisor(d.fondo, N.ampliar_t || '', N.ampliar_pie || ''));
    }

    /* ---------------- Vista ---------------- */
    function pintarVista() {
        const cs = ver, e = ec(cs);
        if (simM) {
            const cuadroFin = verCierre && N.cuadro && !est.vsim, esq = !verCierre && cs.esquema;
            simM.mostrar(!cuadroFin && !esq); vista.hidden = !cuadroFin && !esq;
            simM.permitirReposo(N.reposo_tras && casos.some(c => c.clave === N.reposo_tras && listo(c)));
            if (!cuadroFin && !esq) return;
            if (cuadroFin) {
                vista.innerHTML = `<div class="nl-esc__cuadro-caja"><p class="nl-tip__fila-etq">Tu cuadro comparativo</p>${cuadro(true)}</div>
                    <div class="nl-esc__barra"><span class="nl-esc__botones"><button type="button" class="nl-esc__btn" data-acc="sim">🧪 Volver al simulador</button></span></div>`;
                vista.querySelector('[data-acc="sim"]').addEventListener('click', () => { est.vsim = true; guardar(); pintarVista(); });
                return;
            }
        }
        if (verCierre && N.cuadro_etapas) { pintarCuadroEtapas(false); return; }
        if (verCierre && N.cuadro) { vista.innerHTML = `<div class="nl-esc__cuadro-caja"><p class="nl-tip__fila-etq">Tu cuadro comparativo</p>${cuadro(true)}</div>`; return; }
        if (cs.vista === 'cuadro') { vista.innerHTML = `<div class="nl-esc__cuadro-caja"><p class="nl-tip__fila-etq">${esc(cs.titulo)}</p>${cuadro(true)}</div>`; return; }
        if (cs.foto) { pintarFicha(cs); return; }
        if (N.cuadro_etapas && est.vc && conFilas(cs)) { pintarCuadroEtapas(true); return; }
        if (etapas && N.recortes) {
            const pe = !listo(cs) ? cs.pasos[e.paso] : null;
            if (cs.col != null || (pe && pe.col != null)) { pintarEtapa(cs, pe); return; }
        }
        const hecho = listo(cs);
        const p = !hecho ? cs.pasos[e.paso] : null;
        const animar = cs.anim && (hecho || (p && p.tipo === 'mira' && p.anim !== false));
        const fondo = (hecho && cs.fondo_ok) || cs.fondo || d.fondo;
        const capas = (N.capas || []).filter(c => c.casos.some(k => { const x = casos.find(y => y.clave === k); return x && listo(x); }));
        if (!capasVistas) capasVistas = new Set(capas.map(c => c.src));
        const capasHtml = capas.map(c => { const nueva = !capasVistas.has(c.src); capasVistas.add(c.src);
            return `<img class="nl-esc__capa-img${nueva ? ' is-nueva' : ''}" src="${esc(c.src)}" alt="" draggable="false">`; }).join('');
        let svg = velos(cs, p), html = '';
        // Zonas ya halladas en este caso (modo casos)
        cs.pasos.forEach((ps, i) => {
            if (ps.tipo !== 'tocar' || !((e.r[i] || {}).ok || (e.r[i] || {}).tocado) || animar) return;
            ps.ok.forEach(k => { if (zonas[k]) svg += `<g class="nl-esc__zona-ok">${formaSvg(zonas[k], zonas[k].l ? 'stroke="rgba(239,68,68,.55)" stroke-width="22"' : 'fill="rgba(239,68,68,.35)" stroke="#EF4444" stroke-width="4"')}</g>`; });
        });
        if (animar) { svg += animSvg(cs.anim); html += rotulos(cs.anim.rotulos); }
        if (est.nombres && N.nombres && !animar && !(p && p.tipo === 'tocar')) html += rotulos(N.nombres.filter(n => !n.con || casos.some(x => x.clave === n.con && listo(x))), true);   // al tocar y durante la animación, sin nombres
        if (marca && p && p.tipo === 'tocar') { const [x, y] = pct(marca[0], marca[1]); html += `<span class="nl-rompe__marca" style="left:${x}%;top:${y}%">✗</span>`; }
        const ley = animar ? formasDe(cs.anim) : [];
        const tocable = p && p.tipo === 'tocar' && !(e.r[e.paso] || {}).tocado;
        vista.innerHTML = `
            <div class="nl-lam__lienzo nl-circ__lienzo--fijo nl-esc__lienzo${tocable ? ' is-tocable' : ''}" id="nl-esc-lienzo">
              <img src="${esc(fondo)}" alt="${esc(N.alt || 'Esquema')}" draggable="false">${capasHtml}
              <svg class="nl-circ__capa nl-esc__capa" viewBox="0 0 ${VB[0]} ${VB[1]}" preserveAspectRatio="none" aria-hidden="true">${svg}</svg>
              ${html}
            </div>
            <div class="nl-esc__barra">
              <p class="nl-lam__ayuda-vista">${tocable ? `<strong>Toca en ${esc(N.donde || 'la imagen')}</strong>` : animar ? `<strong>${esc(cs.titulo)}</strong>: mira lo que pasa` : p && p.col != null ? `<strong>${esc(N.cols_t ? N.cols_t[p.col] : '')}</strong> marcada en la imagen` : hecho ? esc(cs.titulo) : `<strong>${esc(cs.titulo)}</strong>`}</p>
              ${ley.length ? `<span class="nl-esc__ley">${ley.map(f => `<span><svg viewBox="-12 -12 24 24" aria-hidden="true">${FORMAS[f][1]}</svg>${FORMAS[f][0]}</span>`).join('')}</span>` : ''}
              <span class="nl-esc__botones">
                ${N.nombres && !animar && !(p && p.tipo === 'tocar') ? `<button type="button" class="nl-esc__btn" data-acc="nombres" aria-pressed="${est.nombres ? 'true' : 'false'}">${est.nombres ? '✓ ' : ''}Nombres</button>` : ''}
                ${animar ? '<button type="button" class="nl-esc__btn" data-acc="repetir">▶ Ver de nuevo</button>' : ''}
                ${etapas ? '<button type="button" class="nl-esc__btn" data-acc="ampliar">🔍 Ampliar</button>' : ''}
                ${N.cuadro_etapas && conFilas(cs) ? '<button type="button" class="nl-esc__btn" data-acc="cuadro">▦ Ver cuadro</button>' : ''}
              </span>
            </div>`;
        vista.querySelector('[data-acc="ampliar"]')?.addEventListener('click', () => abrirVisor(d.fondo, N.ampliar_t || '', N.ampliar_pie || ''));
        vista.querySelector('[data-acc="cuadro"]')?.addEventListener('click', () => { est.vc = true; guardar(); pintarVista(); });
        const s = vista.querySelector('svg.nl-esc__capa');
        try { s.setCurrentTime(0); } catch { /* sin SMIL */ }
        recien = false;
        vista.querySelector('[data-acc="nombres"]')?.addEventListener('click', () => { est.nombres = !est.nombres; guardar(); pintarVista(); });
        vista.querySelector('[data-acc="repetir"]')?.addEventListener('click', () => { recien = true; pintarVista(); });
        if (tocable) {
            const lz = vista.querySelector('#nl-esc-lienzo');
            lz.addEventListener('click', ev => {
                const r0 = lz.querySelector('img').getBoundingClientRect();
                const x = (ev.clientX - r0.left) / r0.width * VB[0], y = (ev.clientY - r0.top) / r0.height * VB[1];
                if (x < 0 || y < 0 || x > VB[0] || y > VB[1]) return;
                tocar(cs, [Math.round(x), Math.round(y)]);
            });
        }
    }

    /** Caso con imagen real: ficha (enfermedad, paciente, contexto) + imagen que se amplía en el visor. */
    function pintarFicha(cs) {
        const hecho = listo(cs);
        // `cartas_mesa` (nivel): las tarjetas del paso «tarjeta» se eligen en la mesa, bajo la ficha
        const iT = N.cartas_mesa ? cs.pasos.findIndex(p => p.tipo === 'tarjeta') : -1;
        let cartas = '';
        if (iT >= 0) {
            const e = ec(cs), pT = cs.pasos[iT], rT = e.r[iT], activo = e.paso === iT, resuelto = e.paso > iT;
            cartas = `<div class="nl-esc__sitios${activo ? ' is-activo' : ''}">
                <p class="nl-esc__sitios-etq">${esc(pT.nombre || 'Tarjetas')}${activo ? ' · toca la tarjeta' : ''}</p>
                <div class="nl-esc__mcartas">${rT.orden.map(io => {
                    const txt = pT.ops[io], mal = rT.mal.includes(io), ok = resuelto && io === pT.ok, off = resuelto && io !== pT.ok;
                    return `<button type="button" class="nl-esc__mcarta${mal ? ' is-mal' : ''}${ok ? ' is-ok' : ''}${off ? ' is-off' : ''}" data-mc="${io}"${activo && !mal ? '' : ' disabled'}>
                        ${iconos[txt] || ''}<span>${esc(txt)}</span></button>`;
                }).join('')}</div></div>`;
        }
        vista.innerHTML = `
            <div class="nl-esc__caso">
              <div class="nl-esc__col">
              <div class="nl-esc__ficha">
                <p class="nl-esc__enf">${esc(cs.corto)}${hecho ? ' <span class="nl-esc__ok">✓ Resuelto</span>' : ''}</p>
                <p class="nl-esc__pac"><strong>${esc(cs.titulo)}.</strong> ${esc(cs.situacion || '')}</p>
                ${cs.contexto ? `<div class="nl-esc__sobre"><span class="nl-esc__sobre-etq">Sobre la enfermedad</span><p>${esc(cs.contexto)}</p></div>` : ''}
              </div>
              ${cartas}
              </div>
              <figure class="nl-esc__foto">
                <button type="button" class="nl-esc__foto-btn" aria-label="Ver la imagen grande"><img src="${esc(cs.foto)}" alt="${esc(cs.foto_t || cs.corto)}"><span>🔍 Ampliar</span></button>
                ${cs.foto_t ? `<figcaption>${esc(cs.foto_t)}${cs.foto_pie ? `<small>${esc(cs.foto_pie)}</small>` : ''}</figcaption>` : ''}
              </figure>
            </div>`;
        vista.querySelector('.nl-esc__foto-btn').addEventListener('click', () => abrirVisor(cs.foto, cs.foto_t, cs.foto_pie));
        vista.querySelectorAll('[data-mc]:not([disabled])').forEach(b => b.addEventListener('click', () => {
            const antes = ec(cs).paso;
            responder(cs, Number(b.dataset.mc));
            if (ver === cs && ec(cs).paso === antes) { pintarFicha(cs); vista.querySelector('.nl-esc__mcartas')?.classList.add('is-sacude'); }
        }));
        recien = false;
    }

    /* ---------------- Respuestas ---------------- */
    function avanzar(cs) {
        const e = ec(cs);
        e.paso++;
        marca = null;
        if (e.paso >= cs.pasos.length) recien = true;
        if (listo(cs) && cs.pasos.every(q => q.tipo === 'mira') && actual()) ver = actual();   // etapa vista: sigue la próxima
        if (listo(cs) && conFilas(cs)) est.vc = true;                                          // terminó de clasificar: cuadro
        guardar();
        pintar();
        if (angosta() && ((listo(cs) && cs.anim) || ver !== cs)) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function tocar(cs, xy) {
        if (instr) instr.open = false;
        const e = ec(cs), i = e.paso, p = cs.pasos[i], r = e.r[i];
        if (p.ok.some(k => zonas[k] && dentro(zonas[k], xy[0], xy[1]))) {
            r.xy = xy; marca = null;
            if (p.q) { r.tocado = true; guardar(); pintar(); return; }   // la pregunta del paso aparece en el mismo panel
            r.ok = true; avanzar(cs); return;
        }
        const otra = Object.keys(zonas).find(k => dentro(zonas[k], xy[0], xy[1]));
        r.mal.push(otra && zonas[otra].nombre ? `Tocaste ${zonas[otra].nombre}. ${p.pista || ''}` : (p.pista || 'Ahí no.'));
        est.err++; marca = xy; guardar(); pintar();
    }
    function responder(cs, io) {
        if (instr) instr.open = false;
        const e = ec(cs), i = e.paso, p = cs.pasos[i], r = e.r[i];
        if (p.tipo === 'predice') {          // una sola oportunidad: se anota y se ve qué pasa
            r.elegida = io; r.ok = io === p.ok; r.fallo = !r.ok;
            if (!r.ok) est.err++;
            avanzar(cs); return;
        }
        if (io !== p.ok) {
            r.mal.push(io); est.err++; guardar(); pintarPanel(); actualizar();
            panel.querySelector('.nl-lab__alts, .nl-esc__cartas, .nl-esc__sis')?.classList.add('is-sacude');
            return;
        }
        r.ok = true; r.elegida = io; avanzar(cs);
    }

    /** Paso «numero»: el valor leído en el simulador, dentro de `rango`. */
    function medir(cs, txt) {
        if (instr) instr.open = false;
        const e = ec(cs), i = e.paso, p = cs.pasos[i], r = e.r[i];
        const v = parseFloat(String(txt).replace(/[−–]/g, '-').replace(',', '.').replace(/[^0-9.+-]/g, ''));
        if (!isFinite(v)) { r.mal.push('Escribe solo el número (con su signo).'); est.err++; guardar(); pintarPanel(); actualizar(); return; }
        const [a, b] = p.rango;
        if (v >= a && v <= b) { r.ok = true; r.valor = v; avanzar(cs); return; }
        const signo = -v >= a && -v <= b;
        r.mal.push(`${v} ${p.unidad || ''}: no calza. ${signo ? 'Revisa el signo: ¿el interior queda negativo o positivo?' : (p.pista || '') + (v < a ? ' Tu valor es muy bajo.' : ' Tu valor es muy alto.')}`);
        est.err++; guardar(); pintarPanel(); actualizar();
        panel.querySelector('.nl-esc__num')?.classList.add('is-sacude');
    }

    /* ---------------- Panel ---------------- */
    const bloque = (etq, txt, extra) => `<div class="nl-ficha__bloque${extra ? ' nl-ficha__bloque--extra' : ''}"><span class="nl-ficha__etq">${esc(etq)}</span><p>${esc(txt)}</p></div>`;
    /** Lo que pasa en el SNP y en el SNC en una etapa (modo «etapas»). */
    const narr = cs => (cs.snp || cs.snc) ? `<div class="nl-esc__narr">
        ${cs.snp ? `<p class="is-snp"><b>SNP · nervio (arriba)</b>${esc(cs.snp)}</p>` : ''}
        ${cs.snc ? `<p class="is-snc"><b>SNC · médula (abajo)</b>${esc(cs.snc)}</p>` : ''}</div>` : '';
    /** Respuesta ya dada: los hechos con explicación muestran sólo el último. */
    const hecha = (p, k, ultimo, r) => (p.tipo === 'sim' || p.tipo === 'tocar') && p.q ? bloque('✓ ' + nomPaso({ tipo: 'elegir' }), p.q.ops[p.q.ok])
        : p.tipo === 'sim' ? ''
        : p.tipo === 'predice' || p.tipo === 'tocar' || p.tipo === 'mira' || (p.exp && k !== ultimo && p.tipo !== 'numero') ? ''
        : p.tipo === 'numero' ? bloque(`✓ ${p.nombre || 'Medida'}: ${p.ok_t || ''}`, `Tu valor: ${(r || {}).valor ?? '—'} ${p.unidad || ''}${p.exp ? ' · ' + p.exp : ''}`)
        : p.exp ? bloque(`✓ ${p.celda ? p.celda + ': ' : ''}${p.ops[p.ok]}`, p.exp) : bloque('✓ ' + nomPaso(p), p.ops[p.ok]);

    function pintarPasos() {
        const act = actual();
        pasosEl.innerHTML = casos.map((cs, i) => {
            const cl = listo(cs) ? (malCaso(cs) ? 'is-repasar' : 'is-ok') : cs === act ? 'is-actual' : '';
            return `<li class="${cl}${cs === ver && !verCierre ? ' is-viendo' : ''}"><button type="button" data-i="${i}"${listo(cs) || cs === act ? '' : ' disabled'}>${esc(nombreCaso(cs))}</button></li>`;
        }).join('');
        pasosEl.querySelectorAll('button:not([disabled])').forEach(b => b.addEventListener('click', () => {
            ver = casos[Number(b.dataset.i)]; verCierre = false; marca = null; recien = true; pintar();
        }));
    }

    function cuadro(grande) {
        const filas = casos.filter(cs => cs.fila && (grande || listo(cs) || cs === ver));
        return `<table class="nl-tip__cuadro${grande ? ' is-grande' : ''} nl-esc__cuadro">
            <thead><tr>${N.cuadro.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
            <tbody>${filas.map(cs => `<tr class="${!grande && cs === ver && !verCierre ? 'is-actual' : ''}">${[nombreCaso(cs)].concat(cs.fila).map((v, k) =>
                k ? `<td>${listo(cs) ? esc(v) : '<span class="nl-tip__vacia">·</span>'}</td>` : `<th>${esc(v)}</th>`).join('')}</tr>`).join('')}</tbody></table>`;
    }

    function htmlPaso(cs, p, r) {
        if (p.tipo === 'numero') {
            return `<p class="nl-lab__q">${esc(p.p)}</p>
                <form class="nl-esc__num" autocomplete="off"><input type="text" inputmode="decimal" aria-label="Valor" placeholder="${esc(p.ejemplo || 'ej.: −40')}">
                <span>${esc(p.unidad || '')}</span><button type="submit" class="btn btn-primary btn-sm">Revisar</button></form>
                ${r.mal.length ? `<p class="nl-lab__q-fb">✗ ${esc(r.mal[r.mal.length - 1])}</p>` : ''}`;
        }
        const ops = r.orden.map(io => ({ io, txt: p.ops[io] }));
        if (p.tipo === 'sistema') {
            const clase = t => /ambos/i.test(t) ? 'ambos' : /SNC/.test(t) ? 'snc' : 'snp';
            return `<p class="nl-lab__q">${esc(p.p)}</p>
                <div class="nl-esc__sis" data-n="${ops.length}">${ops.map(o => `<button type="button" class="nl-esc__sis-btn is-${clase(String(o.txt))}${r.mal.includes(o.io) ? ' is-mal' : ''}" data-i="${o.io}"${r.mal.includes(o.io) ? ' disabled' : ''}>
                    <strong>${esc(o.txt)}</strong>${SISTEMAS[o.txt] ? `<small>${esc(SISTEMAS[o.txt])}</small>` : ''}</button>`).join('')}</div>
                ${r.mal.length ? `<p class="nl-lab__q-fb">✗ Pista: ${esc(p.pista || 'intenta de nuevo.')}</p>` : ''}`;
        }
        if (p.tipo === 'tarjeta' && N.cartas_mesa && cs.foto) {
            return `<p class="nl-lab__q">${esc(p.p)}</p>
                <p class="nl-lab__ayuda">👈 Toca la tarjeta en la mesa, bajo la ficha del caso.</p>
                ${r.mal.length ? `<p class="nl-lab__q-fb">✗ Pista: ${esc(p.pista || 'intenta de nuevo.')}</p>` : ''}`;
        }
        if (p.tipo === 'tarjeta') {
            return `<p class="nl-lab__q">${esc(p.p)}</p>
                <div class="nl-esc__cartas">${ops.map(o => `<button type="button" class="nl-esc__carta${r.mal.includes(o.io) ? ' is-mal' : ''}" data-i="${o.io}"${r.mal.includes(o.io) ? ' disabled' : ''}>
                    ${iconos[o.txt] || ''}<span>${esc(o.txt)}</span></button>`).join('')}</div>
                ${r.mal.length ? `<p class="nl-lab__q-fb">✗ Pista: ${esc(p.pista || 'intenta de nuevo.')}</p>` : ''}`;
        }
        return `<p class="nl-lab__q">${esc(p.p)}</p>
            <div class="nl-lab__alts">${ops.map((o, k) => `
                <button type="button" class="nl-lab__alt-btn${r.mal.includes(o.io) ? ' is-mal' : ''}" data-i="${o.io}"${r.mal.includes(o.io) ? ' disabled' : ''}>
                    <span class="nl-lab__alt-letra">${String.fromCharCode(65 + k)}</span><span>${esc(o.txt)}</span></button>`).join('')}</div>
            ${r.mal.length ? `<p class="nl-lab__q-fb">✗ Pista: ${esc(p.pista || 'intenta de nuevo.')}</p>` : ''}`;
    }

    function pintarPanel() {
        if (verCierre) { mostrarCierre(); return; }
        const cs = ver, e = ec(cs), iC = casos.indexOf(cs);
        const soloMira = cs.pasos.every(p => p.tipo === 'mira');
        const estado = i => i < e.paso ? ((e.r[i] || {}).fallo || (e.r[i] || {}).mal?.length ? 'is-repasar' : 'is-ok') : i === e.paso ? 'is-actual' : '';
        const n = cs.pasos.length;
        const mini = soloMira ? ''
            : n > 6 ? `<ol class="nl-esc__puntos" aria-hidden="true">${cs.pasos.map((p, i) => `<li class="${estado(i)}"></li>`).join('')}</ol>
                <p class="nl-esc__prog">${listo(cs) ? `${n} de ${n} listos` : `Hecho ${e.paso + 1} de ${n}`}</p>`
            : `<ol class="nl-lam__pasos nl-circ__mini">${cs.pasos.map((p, i) => `<li class="${estado(i)}">${esc(nomPaso(p))}</li>`).join('')}${poe ? `<li class="${listo(cs) ? 'is-ok' : ''}">Mira</li>` : ''}</ol>`;
        // Con imagen real, el caso se lee en la vista; aquí sólo las preguntas
        const leer = cs.foto && !listo(cs) ? `<p class="nl-esc__leer">📋 Lee el caso y «Sobre la enfermedad» ${angosta() ? 'arriba' : 'a la izquierda'}.</p>` : '';
        const sit = cs.situacion && !(conFilas(cs) && (e.paso > 0 || listo(cs)));   // al clasificar, la consigna sólo al inicio
        const cab = `<p class="nl-lab__paso"><span class="nl-lab__badge">${iC + 1}</span> ${esc(N.dx && cs.foto ? cs.corto : cs.titulo)}</p>${mini}
            ${cs.foto ? leer : sit ? `<p class="nl-esc__situacion">${esc(cs.situacion)}</p>` : ''}`;
        if (!listo(cs)) {
            const i = e.paso, p = cs.pasos[i], r = e.r[i];
            panel.className = 'nl-lab__trabajo is-pregunta';
            if (p.tipo === 'mira') {
                const hechasM = cs.pasos.slice(0, i).map((pp, k) => hecha(pp, k, i - 1, e.r[k])).join('');
                panel.innerHTML = `${cab}${hechasM}${narr(cs)}${p.p ? `<p class="nl-lab__q">${esc(p.p)}</p>` : ''}
                    ${p.lista ? `<ol class="nl-esc__lista">${p.lista.map(t => `<li>${esc(t)}</li>`).join('')}</ol>` : ''}
                    ${p.vista === 'sim' && simF ? '<p class="nl-esc__simaviso">🧪 El simulador está a la ' + (angosta() ? 'vista arriba' : 'izquierda') + '. Puedes volver al esquema con la pestaña 🖼.</p>' : ''}
                    <div class="nl-ficha__acciones"><button type="button" class="btn btn-primary btn-sm nl-mira">${esc(p.boton || 'Siguiente →')}</button></div>`;
                panel.querySelector('.nl-mira').addEventListener('click', () => { if (instr) instr.open = false; r.ok = true; avanzar(cs); });
                return;
            }
            const hechas = cs.pasos.slice(0, i).map((pp, k) => hecha(pp, k, i - 1, e.r[k])).join('');
            if (p.tipo === 'sim' && simM) {
                const pq = p.q ? { tipo: 'elegir', p: p.q.p, ops: p.q.ops, ok: p.q.ok, pista: p.q.pista } : null;
                panel.innerHTML = `${cab}${hechas}<p class="nl-lab__q">🧪 ${esc(p.p)}</p>
                    <ul class="nl-esc__checks">${p.checks.map((c, k) => `<li data-k="${k}"><span class="nl-esc__chk"></span>${esc(c.t)}</li>`).join('')}</ul>
                    ${p.pista ? `<p class="nl-lab__ayuda">${esc(p.pista)}</p>` : ''}
                    ${pq ? `<div class="nl-esc__simq${r.listo ? '' : ' is-bloq'}">${htmlPaso(cs, pq, r)}</div>`
                         : '<div class="nl-ficha__acciones"><button type="button" class="btn btn-primary btn-sm nl-simok" disabled>Haz lo que falta en el simulador</button></div>'}`;
                const btn = panel.querySelector('.nl-simok'), caja = panel.querySelector('.nl-esc__simq');
                const revisar = s => {
                    let todo = true;
                    p.checks.forEach((c, k) => {
                        const ok = !!(CHK[c.c] && CHK[c.c](s));
                        todo = todo && ok;
                        panel.querySelector(`[data-k="${k}"]`)?.classList.toggle('is-ok', ok);
                    });
                    if (todo && !r.listo) { r.listo = true; guardar(); }
                    if (btn) { btn.disabled = !todo; btn.textContent = todo ? (p.boton || '✓ Listo, continuar →') : 'Haz lo que falta en el simulador'; }
                    if (caja) caja.classList.toggle('is-bloq', !r.listo);
                };
                simM.alCambiar(s => { if (ver === cs && ec(cs).paso === i) revisar(s); });
                revisar(simM.estado());
                btn?.addEventListener('click', () => { if (instr) instr.open = false; r.ok = true; avanzar(cs); });
                caja?.querySelectorAll('[data-i]:not([disabled])').forEach(b => b.addEventListener('click', () => {
                    if (!r.listo) return;
                    if (instr) instr.open = false;
                    const io = Number(b.dataset.i);
                    if (io !== p.q.ok) { r.mal.push(io); est.err++; guardar(); pintarPanel(); actualizar(); panel.querySelector('.nl-lab__alts')?.classList.add('is-sacude'); return; }
                    r.ok = true; r.elegida = io; avanzar(cs);
                }));
                return;
            }
            if (p.tipo === 'tocar' && p.q && r.tocado) {
                const pq = { tipo: 'elegir', p: p.q.p, ops: p.q.ops, ok: p.q.ok, pista: p.q.pista };
                panel.innerHTML = `${cab}${hechas}<p class="nl-esc__tocado">✓ ${esc(p.p)} <b>${esc((zonas[p.ok[0]] || {}).nombre || '')}</b></p>${htmlPaso(cs, pq, { orden: r.orden, mal: r.qmal || [] })}`;
                panel.querySelectorAll('[data-i]:not([disabled])').forEach(b => b.addEventListener('click', () => {
                    const io = Number(b.dataset.i);
                    if (io !== p.q.ok) { (r.qmal = r.qmal || []).push(io); est.err++; guardar(); pintarPanel(); actualizar(); panel.querySelector('.nl-lab__alts')?.classList.add('is-sacude'); return; }
                    r.ok = true; r.elegida = io; avanzar(cs);
                }));
                return;
            }
            if (p.tipo === 'tocar') {
                panel.innerHTML = `${cab}${hechas}<p class="nl-lab__q">${esc(p.p)}</p>
                    <p class="nl-lab__ayuda">Toca el lugar en ${esc(N.donde || 'la imagen')}.</p>
                    ${r.mal.length ? `<p class="nl-lab__q-fb">✗ ${esc(r.mal[r.mal.length - 1])}</p>` : ''}`;
                return;
            }
            panel.innerHTML = `${cab}${hechas}${p.tipo === 'predice' ? '<p class="nl-esc__poe">🔮 <strong>Predice</strong> antes de mirar: tienes una sola oportunidad.</p>' : ''}${htmlPaso(cs, p, r)}`;
            panel.querySelectorAll('[data-i]:not([disabled])').forEach(b => b.addEventListener('click', () => responder(cs, Number(b.dataset.i))));
            const fn = panel.querySelector('.nl-esc__num');
            if (fn) {
                fn.addEventListener('submit', ev => { ev.preventDefault(); medir(cs, fn.querySelector('input').value); });
                if (!angosta()) fn.querySelector('input').focus({ preventScroll: true });
            }
            return;
        }
        // Caso resuelto: explicación
        const pr = cs.pasos.findIndex(p => p.tipo === 'predice');
        const rp = pr >= 0 ? e.r[pr] : null;
        const sig = actual();
        panel.className = 'nl-lab__trabajo ' + (malCaso(cs) ? 'is-repasar' : 'is-ok');
        panel.innerHTML = `${cab}
            ${rp ? `<p class="nl-esc__pred ${rp.ok ? 'is-ok' : 'is-mal'}">${rp.ok ? '🎯 Predijiste bien' : '↺ Tu predicción no era'}: «${esc(cs.pasos[pr].ops[rp.elegida])}»</p>
                    ${rp.ok ? '' : bloque('Lo que pasa en realidad', cs.pasos[pr].ops[cs.pasos[pr].ok])}` : ''}
            ${narr(cs)}
            ${cs.pasos.map((p, k) => hecha(p, k, cs.pasos.length - 1, e.r[k])).join('')}
            ${cs.fila && N.cuadro ? bloque('Tu fila del cuadro', N.cuadro.slice(1).map((c, k) => c + ': ' + cs.fila[k]).join(' · ')) : ''}
            ${cs.exp ? bloque('Para recordar', cs.exp, true) : ''}
            ${cs.img ? `<button type="button" class="nl-mprac__mini nl-esc__mini" aria-label="Ver la imagen grande"><img src="${esc(cs.img)}" alt=""><span>🔍 ${esc(cs.img_t || 'Ver imagen real')}</span></button>` : ''}
            <div class="nl-ficha__acciones">
                ${sig ? `<button type="button" class="btn btn-primary btn-sm nl-sig">${poe ? 'Siguiente escena' : etapas ? 'Continuar' : 'Siguiente caso'} →</button>`
                      : '<button type="button" class="btn btn-primary btn-sm nl-fin">Terminar el nivel →</button>'}
            </div>`;
        panel.querySelector('.nl-esc__mini')?.addEventListener('click', () => abrirVisor(cs.img, cs.ctx, cs.pie));
        panel.querySelector('.nl-sig')?.addEventListener('click', () => {
            ver = actual(); recien = true; pintar();
            if (angosta()) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        panel.querySelector('.nl-fin')?.addEventListener('click', () => { verCierre = true; pintar(); });
    }

    function abrirVisor(img, ctx, pie) {
        const v = document.createElement('div');
        v.className = 'nl-mprac__visor';
        v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true');
        v.innerHTML = `<div class="nl-mprac__visor-caja">
            <button type="button" class="nl-mprac__visor-x" aria-label="Cerrar">✕</button>
            <img src="${esc(img)}" alt="">
            ${ctx ? `<p class="nl-mprac__visor-ctx">${esc(ctx)}</p>` : ''}
            ${pie ? `<p class="nl-mprac__visor-pie">${esc(pie)}</p>` : ''}</div>`;
        const cerrar = () => { v.remove(); document.removeEventListener('keydown', tecla); };
        const tecla = ev => { if (ev.key === 'Escape') cerrar(); };
        v.addEventListener('click', ev => { if (ev.target === v || ev.target.closest('.nl-mprac__visor-x')) cerrar(); });
        document.addEventListener('keydown', tecla);
        document.body.appendChild(v);
        v.querySelector('.nl-mprac__visor-x').focus();
    }

    const porRepasar = () => etapas
        ? casos.flatMap(cs => cs.pasos.filter((p, i) => p.fila && ((ec(cs).r[i] || {}).mal || []).length).map(p => p.celda || p.p))
        : casos.filter(malCaso).map(cs => cs.corto || cs.titulo);
    function mostrarCierre() {
        const rep = porRepasar();
        const hrefRuta = ruta ? 'practico.php?p=' + encodeURIComponent(ruta) : '';
        panel.className = 'nl-lab__trabajo is-cierre';
        panel.innerHTML = `
            <p class="nl-lab__cierre-tit">🎉 ¡Nivel completado!</p>
            <p>${est.err ? `${est.err} ${poe ? (est.err === 1 ? 'predicción por repasar' : 'predicciones por repasar') : (est.err === 1 ? 'intento fallido' : 'intentos fallidos')}` : poe ? 'Todas tus predicciones fueron correctas' : 'Sin errores'}</p>
            ${rep.length ? `<p class="nl-lab__alt nl-lab__repasar">↺ Por repasar: ${esc(rep.join(' · '))}</p>` : ''}
            ${d.siguiente ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${esc(d.siguiente)}">Siguiente nivel →</a>`
                          : (hrefRuta ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${hrefRuta}">Volver a la ruta →</a>` : '')}
            ${tplCx ? `<details class="nl-lab__conexion"><summary>💡 ¿Para qué te sirve esto?</summary>${tplCx.innerHTML}</details>` : ''}
            <p class="nl-lab__ayuda">Toca una pestaña arriba para volver a ver cualquier ${poe ? 'escena' : etapas ? 'etapa' : 'caso'}.</p>
            <p class="nl-guia-ok">✓ Guardado en tu guía de estudio · <a href="${urlGuia()}">Ver guía</a></p>`;
        panel.querySelectorAll('.nl-lab__sig-nivel, .nl-guia-ok a').forEach(a => a.addEventListener('click', async ev => {
            if (!guiaPromesa) return;
            ev.preventDefault();
            a.classList.add('is-esperando');
            try { await guiaPromesa; } catch { /* igual se sigue */ }
            location.href = a.href;
        }));
    }

    /* ---------------- Guía ---------------- */
    /** Casos con imagen real: cuadrícula de 2 columnas con cada imagen y su enfermedad. */
    async function imagenFotos(fotos) {
        const W = MAX_GUIA, col = 2, gap = 12, cw = (W - gap * (col + 1)) / col, ch = 300, eh = 36;
        const H = gap + Math.ceil(fotos.length / col) * (ch + eh + gap);
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
        const imgs = await Promise.all(fotos.map(cs => cargar(cs.foto).catch(() => null)));
        imgs.forEach((im, i) => {
            const x = gap + (i % col) * (cw + gap), y = gap + Math.floor(i / col) * (ch + eh + gap);
            g.fillStyle = '#0F0820'; g.fillRect(x, y, cw, ch);
            if (im) {
                const k = Math.min(cw / im.width, ch / im.height), w = im.width * k, h = im.height * k;
                g.drawImage(im, x + (cw - w) / 2, y + (ch - h) / 2, w, h);
            }
            g.fillStyle = '#1A0E2E'; g.fillRect(x, y + ch, cw, eh);
            g.fillStyle = '#fff'; g.font = 'bold 17px Arial, sans-serif'; g.textBaseline = 'middle';
            g.fillText(`${casos.indexOf(fotos[i]) + 1} · ${fotos[i].corto}`, x + 12, y + ch + eh / 2);
        });
        return c.toDataURL('image/jpeg', 0.82);
    }
    async function imagenGuia() {
        const fotos = casos.filter(cs => cs.foto);
        if (fotos.length) return imagenFotos(fotos);
        const img = await cargar(N.guia_src || d.fondo);
        const W = MAX_GUIA, H = Math.round(W * VB[1] / VB[0]);
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
        g.drawImage(img, 0, 0, W, H);
        const sx = W / VB[0], fs = Math.max(12, Math.round(W / 58));
        const rot = (txt, x, y, borde, izq) => {
            g.font = `bold ${fs}px Arial, sans-serif`; g.textBaseline = 'middle';
            const tw = g.measureText(txt).width + fs * .8, h = fs * 1.5;
            let lx = izq ? x - tw - fs * .5 : x + fs * .5;
            lx = Math.min(Math.max(lx, 2), W - tw - 2);
            g.fillStyle = borde; g.beginPath(); g.arc(x, y, fs * .32, 0, Math.PI * 2); g.fill();
            g.fillStyle = 'rgba(26,14,46,.88)'; g.beginPath(); if (g.roundRect) g.roundRect(lx, y - h / 2, tw, h, h / 2); else g.rect(lx, y - h / 2, tw, h); g.fill();
            g.strokeStyle = borde; g.lineWidth = 2; g.stroke();
            g.fillStyle = '#fff'; g.fillText(txt, lx + fs * .4, y);
        };
        if (poe) {
            (N.nombres || []).forEach(n => rot(n.t, n.x * sx, n.y * sx, '#F59E0B', n.i));
        } else if (etapas) {
            // Rótulos de todas las etapas sobre la secuencia
            casos.forEach(cs => ((cs.anim || {}).rotulos || []).forEach(n => rot(n.t, n.x * sx, n.y * sx, '#F59E0B', n.i)));
        } else if (N.guia_src) {
            /* imagen propia de la guía, ya rotulada */
        } else {
            // Cada caso: su zona marcada con su número
            casos.forEach((cs, i) => {
                const ef = ((cs.anim || {}).efectos || []);
                g.save(); g.scale(sx, sx);
                ef.forEach(z => {
                    g.beginPath();
                    if (z.e) g.ellipse(z.e[0], z.e[1], z.e[2], z.e[3], 0, 0, Math.PI * 2);
                    else if (z.r) g.rect(...z.r);
                    else z.l.forEach(l => l.forEach((p, k) => (k ? g.lineTo(...p) : g.moveTo(...p))));
                    if (z.l) { g.strokeStyle = 'rgba(239,68,68,.45)'; g.lineWidth = (z.w || 18); g.lineCap = 'round'; g.stroke(); }
                    else { g.fillStyle = 'rgba(239,68,68,.32)'; g.fill(); }
                });
                g.restore();
            });
        }
        return c.toDataURL('image/jpeg', 0.82);
    }
    let guiaHecha = false, guiaPromesa = null;
    function guardarGuia() {
        if (guiaHecha) return guiaPromesa;
        guiaHecha = true;
        guiaPromesa = (async () => {
            const bloques = [];
            try { bloques.push({ t: 'imagenes', items: [{ src: await imagenGuia(), titulo: N.guia_img || d.titulo, pie: N.guia_pie || '' }] }); }
            catch { /* sin imagen */ }
            if (N.cuadro) bloques.push({ t: 'tabla', cab: N.cuadro, filas: casos.filter(cs => cs.fila).map(cs => [cs.corto || cs.titulo].concat(cs.fila)) });
            if (etapas) {
                const CE = N.cuadro_etapas, hechos = casos.flatMap(cs => cs.pasos.filter(p => p.fila));
                bloques.push({ t: 'tabla', cab: ['Etapa', 'SNP · nervio', 'SNC · médula'], filas: casos.filter(cs => cs.snp || cs.snc).map(cs => [cs.titulo, cs.snp || '', cs.snc || '']) });
                if (CE) bloques.push({ t: 'tabla', cab: ['Etapa'].concat(CE.cols), filas: CE.filas.map(f => [f].concat(CE.cols.map((_, k) =>
                    hechos.filter(p => p.fila === f && p.ok === k).map(p => p.celda).join('; ')))) });
                bloques.push({ t: 'tabla', cab: ['Hecho', 'Ocurre', 'Para recordar'], filas: hechos.map(p => [p.celda || p.p, p.ops[p.ok], p.exp || '']) });
            } else bloques.push(poe
                ? { t: 'tabla', cab: ['Escena', 'Qué pasa', 'Para recordar'], filas: casos.map(cs => {
                    const pr = cs.pasos.find(p => p.tipo === 'predice');
                    return [cs.titulo, pr ? pr.ops[pr.ok] : '', cs.exp || ''];
                }) }
                : { t: 'tabla', cab: ['Caso', 'Pregunta', 'Para recordar'], filas: casos.map(cs => {
                    const el = cs.pasos.map(p => p.q ? p.q : p).filter(p => p.ops || p.tipo === 'numero').filter(p => !['tarjeta', 'tocar', 'mira', 'sim'].includes(p.tipo));
                    return [cs.corto || cs.titulo, el.map(p => p.p + ' → ' + (p.tipo === 'numero' ? p.ok_t : p.ops[p.ok])).join(' · '), cs.exp || ''];
                }) });
            const rep = porRepasar();
            if (rep.length) bloques.push({ t: 'texto', txt: '↺ Por repasar: ' + rep.join(', ') + '.' });
            sumarAGuia(clave, { titulo: d.titulo, subtitulo: N.subtitulo || '', slug: d.slug,
                nota: `${est.err} ${est.err === 1 ? 'error' : 'errores'}`, bloques: bloques.concat(conexionGuia(tplCx)) });
        })();
        return guiaPromesa;
    }

    function actualizar() {
        const total = casos.reduce((a, cs) => a + cs.pasos.length, 0);
        const hechos = casos.reduce((a, cs) => a + Math.min(ec(cs).paso, cs.pasos.length), 0);
        contador.textContent = hechos + ' / ' + total;
        errores.textContent = est.err ? `${est.err} ${est.err === 1 ? 'error' : 'errores'}` : '';
        if (!actual()) {
            markDone(clave);
            if (!d.siguiente) markDone(d.slug);
            guardarGuia();
        }
    }

    function pintar() { pintarVista(); pintarPasos(); pintarPanel(); actualizar(); vistaPaso(); }

    raiz.querySelector('#nl-esc-reset')?.addEventListener('click', () => {
        if (Object.keys(est.c).length && !confirm('Esto borra todas tus respuestas de este nivel. ¿Seguro?')) return;
        est = { c: {}, err: 0, nombres: est.nombres };
        guardar();
        ver = casos[0]; verCierre = false; marca = null;
        simM?.reiniciar?.();
        pintar();
    });

    pintar();
}

if (RAIZ) iniciar(RAIZ);
