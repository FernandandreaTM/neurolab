/**
 * NeuroLab — circuito.js
 * Nivel «circuito» de una lámina, sobre una imagen fija (`data-fondo`, p. ej. el esquema del arco reflejo)
 * o sobre la captura del nivel I encajada en el molde (js/molde.js). Secciones, en orden:
 *   A, B… circuitos. Cada uno con los pasos que tenga:
 *        1. Ubicar   -> elige una neurona (o un nombre, con `etiquetas`) y toca su lugar; al acertar aparece
 *                       la neurona dibujada por su camino real (trazo SVG que manda el servidor)
 *        2. Conectar -> una o más vías: toca las neuronas en el orden de la información; al acertar se
 *                       anima el impulso; si la vía inhibe a una neurona, su axón queda apagado
 *        3. Lupas    -> 🔍 sobre las sinapsis: la imagen ampliada y sus preguntas
 *        4. Preguntas
 *   C. Cortes -> casos clínicos: emparejar cada caso con un sitio marcado (A, B, C) o tocar dónde se cortó
 * Zonas, puntos, trazos, orden, rutas y sitios se revisan en api/circuito_check.php. Avance en
 * localStorage (nl_circ_<clave>). Al completar: markDone(clave) y la sección va a la guía.
 */
import { markDone, bloqueado } from './progress.js';
import { sumarAGuia, urlGuia } from './guia.js';
import { conexionGuia } from './carrera.js';
import { svgMolde, imagenMolde } from './molde.js';

const RAIZ = document.getElementById('nl-circ');
const MAX_GUIA = 900;
// Recorte del soma en cada ícono de img/tipos (192 px): centro x, y y radio
const SOMA_ICONO = { Pseudounipolar: [96, 46, 30], Motoneurona: [57, 82, 27], Multipolar: [62, 92, 27] };

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const angosta = () => window.matchMedia('(max-width: 900px)').matches;
function barajar(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}
function leerJSON(k, def) {
    try { return JSON.parse(localStorage.getItem(k) || 'null') || def; } catch { return def; }
}
async function revisar(datos) {
    try {
        const r = await fetch('api/circuito_check.php', {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: new URLSearchParams(datos).toString(),
        });
        return await r.json();
    } catch { return { correcto: false, feedback: 'No pudimos revisar tu respuesta. ¿Hay conexión?', red: true }; }
}
function cargar(src) {
    return new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
}
const LETRAS = 'ABCDEFG';
/** «Reflejo de retirada» -> «Retirada» (para las pestañas A · B · C). */
const corto = t => { const r = t.replace(/^Reflejo (de )?/i, ''); return r.charAt(0).toUpperCase() + r.slice(1); };

function iniciar(raiz) {
    const d = raiz.dataset;
    const json = (s, def) => { try { return JSON.parse(s || 'null') ?? def; } catch { return def; } };
    const circuitos = json(d.circuitos, []);
    const cortes = json(d.cortes, null);
    const base = json(d.base, {});
    const neuronasFijas = json(d.neuronas, []);
    const iconosUrl = json(d.iconos, {});
    const VB = json(d.vb, null) || [100, 100];
    const etiquetas = !!d.etiquetas;
    const molde = d.molde;
    const clave = d.clave;
    const KEY = 'nl_circ_' + clave;
    const ruta = new URLSearchParams(location.search).get('ruta') || '';
    const vista = raiz.querySelector('#nl-circ-vista');
    const panel = raiz.querySelector('#nl-circ-trabajo');
    const pasosEl = raiz.querySelector('#nl-circ-pasos');
    const contador = raiz.querySelector('#nl-circ-contador');
    const errores = raiz.querySelector('#nl-circ-errores');
    const instr = raiz.querySelector('#nl-mesa-instr');
    const tplCx = document.getElementById('nl-conexion-tpl');
    const iconos = {};
    document.getElementById('nl-circ-iconos')?.content.querySelectorAll('[data-clave]').forEach(n => { iconos[n.dataset.clave] = n.innerHTML; });
    const casos = (cortes && cortes.casos) || [];
    const sitios = (cortes && cortes.sitios) || [];
    const pct = (x, y) => [x / VB[0] * 100, y / VB[1] * 100];

    if (bloqueado(d.requiere)) {
        raiz.classList.add('is-bloqueada');
        raiz.querySelector('.nl-lab__candado')?.removeAttribute('hidden');
        return;
    }

    // Fondo: una imagen fija (`data-fondo`) o la captura del nivel base encajada en el molde
    const capBase = d.fondo ? { img: d.fondo, listo: true, malp: {} }
        : (leerJSON('nl_lam_' + base.clave, {}).caps || {})[base.captura] || {};
    if (!capBase.img || !capBase.listo || !capBase.malp) {
        vista.innerHTML = `<p class="nl-lam__ayuda-vista">No encontramos tu captura del nivel I en este navegador.</p>`;
        panel.innerHTML = `<p class="nl-lab__paso">Falta tu captura</p>
            <p>Este nivel se arma sobre tu captura del nivel I, ya encajada en la silueta. Ábrelo en este mismo navegador y complétalo.</p>`;
        return;
    }

    let est = leerJSON(KEY, null);
    if (!est || typeof est !== 'object' || !est.c) est = {};
    est.c = est.c || {}; est.k = est.k || {}; est.err = est.err || 0;
    const ec = k => {
        if (!est.c[k]) est.c[k] = {};
        const e = est.c[k];
        for (const p of ['pos', 'ok', 'mal', 'exp', 'trz', 'via', 'lupa', 'preg']) e[p] = e[p] || {};
        return e;
    };
    const ek = i => (est.k[i] = est.k[i] || { mal: [] });
    const guardar = () => { est.inicio = true; try { localStorage.setItem(KEY, JSON.stringify(est)); } catch { /* sin espacio */ } };
    // Neuronas que el nivel ya trae puestas
    circuitos.forEach(c => c.piezas.filter(p => p.dada).forEach(p => {
        const e = ec(c.clave);
        e.ok[p.clave] = true; e.pos[p.clave] = p.punto; e.trz[p.clave] = p.trazo;
        e.exp[p.clave] = { exp: p.exp || '', zona: p.zona || '', e: 0, dada: true };
    }));
    if (instr && !est.inicio) instr.open = true;

    // Secciones: un circuito por letra y, al final, los cortes
    const secciones = circuitos.map(c => c.clave).concat(casos.length ? ['cortes'] : []);
    const circDe = k => circuitos.find(c => c.clave === k);
    const cortesListos = () => casos.every((_, i) => ek(i).ok);
    const seccionLista = s => s === 'cortes' ? cortesListos() : !!ec(s).listo;
    const actual = () => secciones.find(s => !seccionLista(s)) || null;
    let ver = actual() || secciones[secciones.length - 1];
    let selPieza = null, aviso = '', ocupado = false;
    let enRespuesta = null;     // índice de la pregunta recién acertada
    let casoSel = null;         // caso elegido para emparejar
    let casoOk = null;          // caso recién resuelto
    let lupaSel = null;         // lupa abierta
    let marca = null;           // último punto mal ubicado
    let nueva = null;           // neurona recién aparecida (se dibuja animada)

    const viaOk = (c, i) => !!(ec(c.clave).via[i] || {}).ok;
    const viaActual = c => c.vias.findIndex((_, i) => !viaOk(c, i));
    const lupaLista = (c, lp) => !!(ec(c.clave).lupa[lp.clave] || {}).listo;
    const pasosDe = c => ['ubicar'].concat(c.vias.length ? ['conectar'] : [], (c.lupas || []).length ? ['lupas'] : [], c.preguntas.length ? ['preguntas'] : []);
    const NOMBRE_PASO = { ubicar: 'Ubicar', conectar: 'Conectar', lupas: 'Lupas', preguntas: 'Preguntas' };
    const pasoC = c => {
        const e = ec(c.clave);
        if (!c.piezas.every(p => e.ok[p.clave])) return 'ubicar';
        if (viaActual(c) >= 0) return 'conectar';
        if ((c.lupas || []).some(lp => !lupaLista(c, lp))) return 'lupas';
        return !e.listo ? 'preguntas' : 'listo';
    };
    const primeraSinUbicar = c => (c.piezas.find(p => !ec(c.clave).ok[p.clave]) || {}).clave || null;
    const pieza = (c, k) => c.piezas.find(x => x.clave === k) || {};
    const inhibidas = c => c.vias.map((_, i) => (ec(c.clave).via[i] || {})).filter(v => v.ok && v.inhibe).map(v => v.inhibe);

    /* ---------------- Dibujo de las neuronas (SVG en px del esquema) ---------------- */
    function svgNeurona(id, t, o = {}) {
        if (!t) return '';
        const col = t.color, [sx, sy, sr] = t.soma;
        const lin = (dd, cl) => `<path d="${dd}" class="nl-neu__halo ${cl}"/><path d="${dd}" class="nl-neu__ax ${cl}" stroke="${col}"${o.nueva ? ' pathLength="1"' : ''}/>`;
        const ic = SOMA_ICONO[t.ico], url = iconosUrl[t.ico];
        const img = ic && url && !o.sinIcono ? (() => {
            const s = sr / ic[2];
            return `<clipPath id="nlc-${id}"><circle cx="${sx}" cy="${sy}" r="${sr}"/></clipPath>
                <image href="${esc(url)}" x="${sx - ic[0] * s}" y="${sy - ic[1] * s}" width="${192 * s}" height="${192 * s}" clip-path="url(#nlc-${id})"/>`;
        })() : '';
        return `<g class="nl-neu${o.inhibida ? ' is-inhibida' : ''}${o.nueva ? ' is-nueva' : ''}">
            <g class="nl-neu__axones">${t.d.map(dd => lin(dd, '')).join('')}${(t.fino || []).map(dd => lin(dd, 'is-fino')).join('')}
              ${(t.botones || []).map(b => `<circle cx="${b[0]}" cy="${b[1]}" r="${b[2] || 6}" fill="${col}" class="nl-neu__boton"/>`).join('')}</g>
            <g class="nl-neu__soma${o.tocable ? ' is-tocable' : ''}${o.elegida ? ' is-elegida' : ''}" data-neu="${esc(o.clave || '')}">
              <circle cx="${sx}" cy="${sy}" r="${sr + 10}" class="nl-neu__aura"/>
              ${img}<circle cx="${sx}" cy="${sy}" r="${sr}" fill="${col}" fill-opacity="${img ? .22 : .85}" stroke="${col}" stroke-width="5"/>
            </g>
            ${o.num ? `<g class="nl-neu__num"><circle cx="${sx + sr}" cy="${sy - sr}" r="14"/><text x="${sx + sr}" y="${sy - sr + 6}">${o.num}</text></g>` : ''}
            ${(() => {   // rótulo: nombre y, si corresponde, «⊣ inhibida» (posición relativa al soma en t.lbl)
                const [dx, dy, an] = t.lbl || [0, sr + 26, 'middle'];
                const lx = sx + dx, ly = sy + dy + (dy > 0 ? 0 : 0);
                const nom = o.nombre ? `<tspan x="${lx}" dy="0">${esc(o.nombre)}</tspan>` : '';
                const inh = o.inhibida ? `<tspan x="${lx}" dy="${o.nombre ? (dy < 0 && an === 'middle' ? -24 : 24) : 0}" class="nl-neu__inh">⊣ inhibida</tspan>` : '';
                return nom || inh ? `<text x="${lx}" y="${ly}" class="nl-neu__nom" style="text-anchor:${an}">${nom}${inh}</text>` : '';
            })()}
        </g>`;
    }
    function svgRuta(dd, inhibe, idx) {
        const col = inhibe ? '#A78BFA' : '#F59E0B';
        return `<path d="${dd}" class="nl-circ__ruta is-animada" style="stroke:${col}"/>
            <circle r="${Math.max(3, VB[0] / 150)}" class="nl-circ__impulso${inhibe ? ' is-inh' : ''}"><animateMotion dur="${4 + idx * 0.7}s" repeatCount="indefinite" path="${dd}"/></circle>`;
    }

    /* ---------------- Vista ---------------- */
    function pintarVista() {
        let svg = '', html = '', ayuda = '', clase = '';
        if (ver === 'cortes') {
            svg += neuronasFijas.map((t, i) => svgNeurona('f' + i, t)).join('');
            const resueltos = l => casos.map((_, i) => ek(i).ok && ek(i).sitio === l ? i + 1 : 0).filter(Boolean);
            html += sitios.map(s => {
                const [x, y] = pct(s.x, s.y), r = resueltos(s.letra);
                return `<button type="button" class="nl-circ__sitio${casoSel != null ? ' is-activo' : ''}${r.length ? ' is-ok' : ''}" data-sitio="${esc(s.letra)}" style="left:${x}%;top:${y}%">
                    ${esc(s.letra)}${r.length ? `<b>${r.join('·')}</b>` : ''}</button>`;
            }).join('');
            ayuda = cortesListos() ? 'Los tres casos, cada uno en su sitio' : casoSel != null ? `Caso ${casoSel + 1}: toca el sitio de la lesión (A, B o C)` : 'Elige un caso en el panel';
        } else {
            const c = circDe(ver), e = ec(ver), p = pasoC(c), inh = inhibidas(c);
            const via = viaActual(c);
            if (etiquetas) {
                // Máscara: zonas sombreadas mientras se ubican (p. ej. sustancia gris y blanca)
                if (c.mascara && p === 'ubicar') svg += c.mascara.map(m => m.r
                    ? `<rect x="${m.r[0]}" y="${m.r[1]}" width="${m.r[2]}" height="${m.r[3]}" fill="${m.c || 'rgba(139,92,246,.3)'}" class="nl-circ__mascara"/>`
                    : `<polygon points="${(m.p || []).map(q => q.join(',')).join(' ')}" fill="${m.c || 'rgba(139,92,246,.3)'}" class="nl-circ__mascara"/>`).join('');
                // Con «vias», las etiquetas puestas se tocan en orden (p. ej. el camino de la glucosa)
                const seqE = p === 'conectar' && e.via[via] ? (e.via[via].seq || []) : [];
                html += c.piezas.filter(pz => e.ok[pz.clave]).map(pz => {
                    const [x, y] = e.pos[pz.clave], iS = seqE.indexOf(pz.clave);
                    return p === 'conectar'
                        ? `<button type="button" class="nl-circ__chip is-tocable${iS >= 0 ? ' is-elegida' : ''}" data-neu="${esc(pz.clave)}" style="left:${x}%;top:${y}%"><i>${iS >= 0 ? iS + 1 : ''}</i>${esc(pz.nombre)}</button>`
                        : `<span class="nl-circ__chip" style="left:${x}%;top:${y}%"><i></i>${esc(pz.nombre)}</span>`;
                }).join('');
                c.vias.forEach((v, i) => { const s = e.via[i]; if (s && s.ok && s.ruta) svg += svgRuta(s.ruta, !!s.inhibe, i); });
            } else {
                svg += c.piezas.filter(pz => e.ok[pz.clave] && e.trz[pz.clave]).map(pz => {
                    const iSeq = p === 'conectar' && e.via[via] ? (e.via[via].seq || []).indexOf(pz.clave) : -1;
                    return svgNeurona(pz.clave, e.trz[pz.clave], { clave: pz.clave, inhibida: inh.includes(pz.clave), nueva: nueva === pz.clave,
                        tocable: p === 'conectar', elegida: iSeq >= 0, num: iSeq >= 0 ? iSeq + 1 : 0, nombre: angosta() ? '' : pz.nombre });
                }).join('');
                c.vias.forEach((v, i) => { const s = e.via[i]; if (s && s.ok && s.ruta) svg += svgRuta(s.ruta, !!s.inhibe, i); });
                if (p === 'lupas' || p === 'preguntas' || p === 'listo') {
                    html += (c.lupas || []).map(lp => {
                        const [x, y] = pct(lp.x, lp.y);
                        return `<button type="button" class="nl-circ__lupa${lupaLista(c, lp) ? ' is-ok' : ''}${lupaSel === lp.clave ? ' is-abierta' : ''}" data-lupa="${esc(lp.clave)}"
                                  style="left:${x}%;top:${y}%" title="${esc(lp.titulo)}">🔍</button>`;
                    }).join('');
                }
            }
            if (marca) html += `<span class="nl-rompe__marca" style="left:${marca[0]}%;top:${marca[1]}%">✗</span>`;
            clase = (p === 'ubicar' && selPieza ? ' is-poner' : '') + (p !== 'ubicar' ? ' is-armado' : '');
            ayuda = p === 'ubicar' ? (selPieza ? `Toca dónde va: <strong>${esc(pieza(c, selPieza).nombre)}</strong>` : 'Elige en el panel')
                : p === 'conectar' ? `${etiquetas ? 'Toca las etiquetas' : 'Toca las neuronas'} <strong>en el orden ${etiquetas ? 'del recorrido' : 'en que viaja la información'}</strong>${c.vias.length > 1 ? ` (vía ${via + 1}: ${esc(c.vias[via].titulo)})` : ''}`
                : p === 'lupas' ? 'Toca cada 🔍 para ver la sinapsis de cerca'
                : etiquetas ? esc(d.subtitulo || 'Las partes de la médula') : `${esc(c.titulo)}: el impulso va del receptor al efector`;
        }
        const vbAttr = `0 0 ${VB[0]} ${VB[1]}`;
        vista.innerHTML = `<div class="nl-lam__lienzo nl-circ__lienzo nl-circ__lienzo--fijo${clase}" id="nl-circ-lienzo">
              <img src="${capBase.img}" alt="Esquema" draggable="false">
              ${d.fondo ? '' : svgMolde(molde, 'esquema', 'nl-circ__esquema')}
              ${svg ? `<svg class="nl-circ__capa" viewBox="${vbAttr}" preserveAspectRatio="none" aria-hidden="true">${svg}</svg>` : ''}
              ${html}
            </div>
            <p class="nl-lam__ayuda-vista">${ayuda}</p>`;
        nueva = null;
        const lz = vista.querySelector('#nl-circ-lienzo');
        lz.addEventListener('click', ev => {
            if (ocupado) return;
            const sit = ev.target.closest('[data-sitio]');
            if (ver === 'cortes') {
                if (sit && casoSel != null) emparejar(casoSel, sit.dataset.sitio);
                return;
            }
            const c = circDe(ver), p = pasoC(c);
            const lup = ev.target.closest('[data-lupa]');
            if (lup) { abrirLupa(lup.dataset.lupa); return; }
            const neu = ev.target.closest('[data-neu]');
            if (p === 'conectar' && neu && neu.dataset.neu) { tocarNeurona(c, neu.dataset.neu); return; }
            const r = lz.querySelector('img').getBoundingClientRect();
            const x = Math.round((ev.clientX - r.left) / r.width * 1000) / 10, y = Math.round((ev.clientY - r.top) / r.height * 1000) / 10;
            if (p === 'ubicar' && selPieza && x >= 0 && x <= 100 && y >= 0 && y <= 100) ubicar(c, selPieza, [x, y]);
        });
    }

    async function ubicar(c, k, xy) {
        if (instr) instr.open = false;
        const e = ec(c.clave);
        ocupado = true;
        const r = await revisar({ slug: d.slug, n: d.n, accion: 'ubicar', circuito: c.clave, pieza: k, x: xy[0], y: xy[1] });
        ocupado = false;
        if (r.red) { aviso = r.feedback; pintar(); return; }
        if (r.correcto) {
            e.ok[k] = true;
            e.pos[k] = r.punto || xy;
            if (r.trazo) { e.trz[k] = r.trazo; nueva = k; }
            e.exp[k] = { exp: r.exp || '', zona: r.zona || '', e: (e.mal[k] || []).length };
            marca = null;
            selPieza = primeraSinUbicar(c);
        } else {
            e.mal[k] = (e.mal[k] || []).concat([r.feedback]);
            est.err++;
            marca = xy;
        }
        guardar();
        pintar();
    }

    async function tocarNeurona(c, k) {
        const e = ec(c.clave), i = viaActual(c);
        const v = e.via[i] || (e.via[i] = { seq: [], mal: 0 });
        if (v.seq.includes(k)) return;
        v.seq.push(k);
        pintarVista();
        if (v.seq.length < c.vias[i].n) { pintarPanel(); return; }
        ocupado = true;
        const r = await revisar({ slug: d.slug, n: d.n, accion: 'orden', circuito: c.clave, via: i, orden: JSON.stringify(v.seq) });
        ocupado = false;
        if (r.red) { v.seq = []; aviso = r.feedback; pintar(); return; }
        if (r.correcto) {
            Object.assign(v, { ok: true, exp: r.feedback || '', ruta: r.ruta || null, inhibe: r.inhibe || '' });
        } else {
            v.mal++; est.err++;
            aviso = '✗ Ese orden no es. ' + (r.feedback || '');
            v.seq = [];
        }
        guardar();
        pintar();
    }

    async function emparejar(i, letra) {
        if (instr) instr.open = false;
        const k = ek(i);
        ocupado = true;
        const r = await revisar({ slug: d.slug, n: d.n, accion: 'corte', caso: i, sitio: letra });
        ocupado = false;
        if (r.red) { aviso = r.feedback; pintar(); return; }
        if (r.correcto) { Object.assign(k, { ok: true, sitio: letra, resp: r.respuesta || '', exp: r.exp || '' }); casoOk = i; casoSel = null; }
        else { k.mal.push(letra + ': ' + r.feedback); est.err++; }
        guardar();
        pintar();
    }

    function abrirLupa(k) {
        const c = circDe(ver);
        if (!c || !(c.lupas || []).some(lp => lp.clave === k)) return;
        lupaSel = k; enRespuesta = null;
        pintar();
        if (angosta()) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ---------------- Panel ---------------- */
    function pintarPasos() {
        if (secciones.length === 1) {   // una sola sección: los pasos de esa sección
            const s = secciones[0];
            if (s === 'cortes') { pasosEl.innerHTML = casos.map((_, i) => `<li class="${ek(i).ok ? 'is-ok' : i === casoSel ? 'is-actual' : ''}">Caso ${i + 1}</li>`).join(''); return; }
            const c = circDe(s), lista = pasosDe(c), iP = lista.indexOf(pasoC(c));
            pasosEl.innerHTML = lista.map((t, i) => `<li class="${iP < 0 || i < iP ? 'is-ok' : i === iP ? 'is-actual' : ''}">${NOMBRE_PASO[t]}</li>`).join('');
            return;
        }
        const act = actual();
        pasosEl.innerHTML = secciones.map((s, i) => {
            const t = s === 'cortes' ? `${LETRAS[i]} · Cortes` : `${LETRAS[i]} · ${corto(circDe(s).titulo)}`;
            const cl = seccionLista(s) ? 'is-ok' : s === act ? 'is-actual' : '';
            return `<li class="${cl}${s === ver ? ' is-viendo' : ''}"><button type="button" data-s="${esc(s)}"${seccionLista(s) || s === act ? '' : ' disabled'}>${esc(t)}</button></li>`;
        }).join('');
        pasosEl.querySelectorAll('button:not([disabled])').forEach(b => b.addEventListener('click', () => {
            ver = b.dataset.s; selPieza = ver !== 'cortes' ? primeraSinUbicar(circDe(ver)) : null;
            enRespuesta = null; casoOk = null; lupaSel = null; pintar();
        }));
    }

    const bloque = (etq, txt, extra) => `<div class="nl-ficha__bloque${extra ? ' nl-ficha__bloque--extra' : ''}"><span class="nl-ficha__etq">${esc(etq)}</span><p>${esc(txt)}</p></div>`;

    /** Preguntas de alternativas (del circuito o de una lupa). r: estado {mal, orden, ok}. */
    function htmlPregunta(q, r, titulo) {
        return `<p class="nl-lab__ayuda">${titulo}</p>
            <p class="nl-lab__q">${esc(q.p)}</p>
            <div class="nl-lab__alts">${r.orden.map((io, k) => `
                <button type="button" class="nl-lab__alt-btn${r.mal.includes(io) ? ' is-mal' : ''}" data-i="${io}"${r.mal.includes(io) ? ' disabled' : ''}>
                    <span class="nl-lab__alt-letra">${String.fromCharCode(65 + k)}</span><span>${esc(q.ops[io])}</span></button>`).join('')}</div>
            ${r.mal.length ? `<p class="nl-lab__q-fb">✗ Pista: ${esc(q.pista || 'intenta de nuevo.')}</p>` : ''}`;
    }
    function enlazarAlts(q, r, alAcertar) {
        panel.querySelectorAll('.nl-lab__alt-btn:not([disabled])').forEach(b => b.addEventListener('click', () => {
            const io = Number(b.dataset.i);
            if (io !== q.ok) {
                r.mal.push(io); est.err++; guardar(); pintarPanel(); actualizar();
                panel.querySelector('.nl-lab__alts')?.classList.add('is-sacude');
                return;
            }
            r.ok = true; guardar(); alAcertar();
        }));
    }

    function pintarPanel() {
        const av = aviso ? `<p class="nl-lab__aviso-act">${esc(aviso)}</p>` : '';
        aviso = '';
        panel.className = 'nl-lab__trabajo is-pregunta';
        if (ver === 'cortes') { panelCortes(av); return; }
        const c = circDe(ver), e = ec(ver), p = pasoC(c);
        const letra = LETRAS[secciones.indexOf(ver)];
        const lista = pasosDe(c), iP = lista.indexOf(p);
        const cab = `<p class="nl-lab__paso"><span class="nl-lab__badge">${secciones.length > 1 ? letra : iP < 0 ? '✓' : iP + 1}</span> ${esc(c.titulo)} <small class="nl-circ__sub">${esc(c.sub)}</small></p>
            ${c.estimulo ? `<p class="nl-circ__estimulo">⚡ ${esc(c.estimulo)}</p>` : ''}
            ${secciones.length > 1 ? `<ol class="nl-lam__pasos nl-circ__mini">${lista.map((t, i) => `<li class="${iP < 0 || i < iP ? 'is-ok' : i === iP ? 'is-actual' : ''}">${NOMBRE_PASO[t]}</li>`).join('')}</ol>` : ''}`;

        if (p === 'ubicar') {
            if (!selPieza) selPieza = primeraSinUbicar(c);
            const sel = pieza(c, selPieza);
            const malSel = e.mal[sel.clave] || [];
            const ultimoMal = marca && malSel.length ? malSel[malSel.length - 1] : '';
            const porUbicar = c.piezas.filter(pz => !pz.dada);
            panel.innerHTML = `${av}${cab}
                <p class="nl-lab__ayuda">${etiquetas ? (c.ayuda ? esc(c.ayuda) : 'Elige un nombre y toca su lugar en el esquema (vale cualquier punto de esa zona).')
                    : 'Elige una neurona y toca dónde está su <strong>soma</strong>. Al acertar, aparece dibujada por su camino.'}
                    ${c.piezas.some(pz => pz.dada) ? ' Las motoneuronas ya están puestas.' : ''}</p>
                <div class="nl-circ__piezas${etiquetas ? ' is-etiquetas' : ''}">${porUbicar.map(pz => {
                    const ok = e.ok[pz.clave];
                    return `<button type="button" class="nl-circ__pieza${ok ? ' is-ok' : ''}${pz.clave === selPieza ? ' is-sel' : ''}" data-clave="${esc(pz.clave)}" style="--c:${pz.color || '#FCD34D'}"${ok ? ' disabled' : ''}>
                        ${etiquetas ? '' : `<span class="nl-circ__ico">${iconos[pz.clave] || ''}</span>`}
                        <span><strong>${ok ? '✓ ' : ''}${esc(pz.nombre)}</strong>${pz.detalle ? `<small>${esc(pz.detalle)}</small>` : ''}</span></button>`;
                }).join('')}</div>
                ${ultimoMal ? `<p class="nl-lab__q-fb">✗ ${esc(ultimoMal)}</p>` : ''}
                ${porUbicar.filter(pz => e.ok[pz.clave]).map(pz => bloque(pz.nombre + (e.exp[pz.clave].zona ? ' · ' + e.exp[pz.clave].zona : ''), e.exp[pz.clave].exp)).join('')}`;
            panel.querySelectorAll('.nl-circ__pieza:not([disabled])').forEach(b => b.addEventListener('click', () => {
                selPieza = b.dataset.clave; marca = null; pintar();
                if (angosta()) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }));
            return;
        }

        if (p === 'conectar') {
            const i = viaActual(c), v = e.via[i] || { seq: [] };
            const hechas = c.vias.map((vv, j) => (e.via[j] || {}).ok ? bloque('✓ ' + (vv.titulo || 'Tu reflejo'), e.via[j].exp) : '').join('');
            panel.innerHTML = `${av}${cab}${hechas}
                <p class="nl-lab__paso nl-circ__via">${c.vias.length > 1 ? `Vía ${i + 1} de ${c.vias.length}: ` : ''}<strong>${esc(c.vias[i].titulo || 'Conecta el reflejo')}</strong></p>
                <p class="nl-lab__ayuda">${c.vias[i].ayuda ? c.vias[i].ayuda : `Toca en el esquema las <strong>${c.vias[i].n} neuronas</strong> de esta vía, en el orden en que viaja la información, empezando por la que recibe del <strong>${esc(c.receptor.toLowerCase())}</strong>.`}</p>
                <p class="nl-circ__seq">${v.seq.length ? v.seq.map((k, j) => `<span style="--c:${pieza(c, k).color || '#FCD34D'}">${j + 1}. ${esc(pieza(c, k).nombre)}</span>`).join(' → ') : '<em>Aún no tocas ninguna</em>'}</p>
                ${v.seq.length ? '<button type="button" class="nl-lab__nose nl-circ__borrar">Borrar y empezar el orden de nuevo</button>' : ''}
                <p class="nl-lab__ayuda nl-circ__o">También puedes tocarlas aquí:</p>
                <div class="nl-circ__piezas nl-circ__toque">${c.piezas.map(pz => `<button type="button" class="nl-circ__pieza${v.seq.includes(pz.clave) ? ' is-sel' : ''}" data-neu="${esc(pz.clave)}" style="--c:${pz.color || '#FCD34D'}"${v.seq.includes(pz.clave) ? ' disabled' : ''}>
                    ${etiquetas ? '' : `<span class="nl-circ__ico">${iconos[pz.clave] || ''}</span>`}<span><strong>${v.seq.includes(pz.clave) ? (v.seq.indexOf(pz.clave) + 1) + '. ' : ''}${esc(pz.nombre)}</strong></span></button>`).join('')}</div>`;
            panel.querySelector('.nl-circ__borrar')?.addEventListener('click', () => { v.seq = []; guardar(); pintar(); });
            panel.querySelectorAll('.nl-circ__toque [data-neu]:not([disabled])').forEach(b => b.addEventListener('click', () => { if (!ocupado) tocarNeurona(c, b.dataset.neu); }));
            return;
        }

        if (lupaSel) { panelLupa(c, av, cab); return; }

        if (p === 'lupas') {
            const hechas = (c.lupas || []).filter(lp => lupaLista(c, lp)).length;
            panel.innerHTML = `${av}${cab}
                ${c.vias.map((vv, j) => (e.via[j] || {}).ok ? bloque('✓ ' + (vv.titulo || 'Tu reflejo'), e.via[j].exp) : '').join('')}
                <p class="nl-lab__ayuda">Explora las sinapsis: toca cada 🔍 en el esquema (o aquí) y responde. ${hechas} de ${c.lupas.length} listas.</p>
                <div class="nl-circ__lupas">${c.lupas.map(lp => `<button type="button" class="nl-circ__lupa-btn${lupaLista(c, lp) ? ' is-ok' : ''}" data-lupa="${esc(lp.clave)}">
                    <img src="${esc(lp.img)}" alt="" loading="lazy"><span>${lupaLista(c, lp) ? '✓ ' : '🔍 '}${esc(lp.titulo)}</span></button>`).join('')}</div>`;
            panel.querySelectorAll('[data-lupa]').forEach(b => b.addEventListener('click', () => abrirLupa(b.dataset.lupa)));
            return;
        }

        if (enRespuesta != null) { mostrarRespuesta(c, enRespuesta, cab); return; }
        if (p === 'listo') { fichaCircuito(c, cab); return; }

        const preguntas = c.preguntas;
        const iq = preguntas.findIndex((q, i) => !(e.preg[i] || {}).ok);
        if (iq < 0) { e.listo = true; guardar(); pintar(); return; }
        const q = preguntas[iq];
        const r = e.preg[iq] || (e.preg[iq] = { mal: [], orden: barajar(q.ops.length) });
        panel.innerHTML = `${av}${cab}${htmlPregunta(q, r, `Pregunta ${iq + 1} de ${preguntas.length}`)}`;
        enlazarAlts(q, r, () => { enRespuesta = iq; pintarPanel(); actualizar(); });
    }

    function panelLupa(c, av, cab) {
        const lp = c.lupas.find(x => x.clave === lupaSel), e = ec(c.clave);
        const sl = e.lupa[lp.clave] || (e.lupa[lp.clave] = { preg: {} });
        const fig = `<figure class="nl-circ__zoom"><img src="${esc(lp.img)}" alt="${esc(lp.titulo)}"><figcaption>🔍 ${esc(lp.titulo)}</figcaption></figure>`;
        const volver = `<button type="button" class="nl-lab__nose nl-circ__volver">← Volver a las lupas</button>`;
        const iq = lp.preguntas.findIndex((q, i) => !(sl.preg[i] || {}).ok);
        if (enRespuesta != null || iq < 0) {
            const j = enRespuesta != null ? enRespuesta : lp.preguntas.length - 1;
            const q = lp.preguntas[j], r = sl.preg[j] || { mal: [] }, ultima = lp.preguntas.findIndex((qq, i) => !(sl.preg[i] || {}).ok) < 0;
            panel.className = 'nl-lab__trabajo ' + (r.mal.length ? 'is-repasar' : 'is-ok');
            panel.innerHTML = `${cab}${fig}
                <p class="nl-lab__ayuda">Pregunta ${j + 1} de ${lp.preguntas.length} <span class="nl-tip__logro">${r.mal.length ? '✓ con pista' : '🎯 al primer intento'}</span></p>
                <p class="nl-lab__q">${esc(q.p)}</p>${bloque('Respuesta', q.ops[q.ok])}${q.exp ? bloque('Para recordar', q.exp, true) : ''}
                <div class="nl-ficha__acciones"><button type="button" class="btn btn-primary btn-sm nl-lab__sig">${ultima ? 'Lista esta lupa →' : 'Siguiente pregunta →'}</button></div>`;
            panel.querySelector('.nl-lab__sig').addEventListener('click', () => {
                enRespuesta = null;
                if (ultima) { sl.listo = true; lupaSel = null; guardar(); }
                pintar();
            });
            return;
        }
        const q = lp.preguntas[iq];
        const r = sl.preg[iq] || (sl.preg[iq] = { mal: [], orden: barajar(q.ops.length) });
        panel.innerHTML = `${av}${cab}${fig}${htmlPregunta(q, r, `Pregunta ${iq + 1} de ${lp.preguntas.length}`)}${volver}`;
        enlazarAlts(q, r, () => { enRespuesta = iq; guardar(); pintarPanel(); actualizar(); });
        panel.querySelector('.nl-circ__volver').addEventListener('click', () => { lupaSel = null; pintar(); });
    }

    function mostrarRespuesta(c, iq, cab) {
        const e = ec(c.clave), q = c.preguntas[iq], r = e.preg[iq], ultima = iq === c.preguntas.length - 1;
        panel.className = 'nl-lab__trabajo ' + (r.mal.length ? 'is-repasar' : 'is-ok');
        panel.innerHTML = `${cab}
            <p class="nl-lab__ayuda">Pregunta ${iq + 1} de ${c.preguntas.length} <span class="nl-tip__logro">${r.mal.length ? '✓ con pista' : '🎯 al primer intento'}</span></p>
            <p class="nl-lab__q">${esc(q.p)}</p>
            ${bloque('Respuesta', q.ops[q.ok])}${q.exp ? bloque('Para recordar', q.exp, true) : ''}
            <div class="nl-ficha__acciones"><button type="button" class="btn btn-primary btn-sm nl-lab__sig">${ultima ? 'Terminar →' : 'Siguiente pregunta →'}</button></div>`;
        panel.querySelector('.nl-lab__sig').addEventListener('click', () => {
            enRespuesta = null;
            if (ultima) { e.listo = true; guardar(); }
            pintar();
        });
    }

    function siguienteBoton() {
        const sig = actual();
        if (!sig) return `<button type="button" class="btn btn-primary btn-sm nl-circ__ir" data-s="">Ver el cierre del nivel →</button>`;
        if (sig === ver) return '';
        const t = sig === 'cortes' ? (cortes.titulo || 'Cortes') : circDe(sig).titulo;
        return `<button type="button" class="btn btn-primary btn-sm nl-circ__ir" data-s="${esc(sig)}">Siguiente: ${esc(t)} →</button>`;
    }
    function enlazarIr() {
        panel.querySelector('.nl-circ__ir')?.addEventListener('click', ev => {
            const s = ev.currentTarget.dataset.s;
            ver = s || null; casoOk = null; enRespuesta = null; lupaSel = null;
            if (ver && ver !== 'cortes') selPieza = primeraSinUbicar(circDe(ver));
            if (!ver) { est.listo = true; guardar(); }
            pintar();
            if (angosta() && ver) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    function fichaCircuito(c, cab) {
        const e = ec(c.clave);
        panel.className = 'nl-lab__trabajo ' + (repasarCirc(c).length ? 'is-repasar' : 'is-ok');
        panel.innerHTML = `${cab}
            ${etiquetas ? bloque('✓ Partes ubicadas', c.piezas.map(pz => pz.nombre).join(' · ')) + c.vias.map((vv, j) => bloque('✓ ' + (vv.titulo || 'Recorrido'), (e.via[j] || {}).exp || '')).join('') : c.vias.map((vv, j) => bloque('✓ ' + (vv.titulo || 'Tu reflejo'), (e.via[j] || {}).exp || '')).join('')}
            ${c.preguntas.length ? bloque('Respuestas', c.preguntas.map(q => '• ' + q.ops[q.ok]).join('  '), true) : ''}
            ${(c.lupas || []).length ? '<p class="nl-lab__ayuda">Puedes volver a abrir las 🔍 del esquema para repasar.</p>' : ''}
            <div class="nl-ficha__acciones">${siguienteBoton()}</div>`;
        enlazarIr();
    }

    function panelCortes(av) {
        const titulo = esc(cortes.titulo || 'Cortes');
        const cab = `<p class="nl-lab__paso"><span class="nl-lab__badge">${secciones.length > 1 ? LETRAS[secciones.indexOf('cortes')] : '✂'}</span> ${titulo}</p>`;
        const tarjetas = casos.map((cs, i) => {
            const k = ek(i);
            if (k.ok) return `<div class="nl-circ__caso is-ok${casoOk === i ? ' is-nuevo' : ''}">
                <p class="nl-circ__caso-tit">✓ Caso ${i + 1}${cs.titulo ? ' · ' + esc(cs.titulo) : ''} → <strong>${esc(k.sitio)}: ${esc(k.resp)}</strong></p>
                <p>${esc(cs.caso)}</p>${casoOk === i ? bloque('Para recordar', k.exp, true) : ''}</div>`;
            return `<button type="button" class="nl-circ__caso${casoSel === i ? ' is-sel' : ''}" data-caso="${i}">
                <p class="nl-circ__caso-tit">Caso ${i + 1}${cs.titulo ? ' · ' + esc(cs.titulo) : ''}</p><p>${esc(cs.caso)}</p></button>`;
        }).join('');
        const malSel = casoSel != null ? ek(casoSel).mal : [];
        const fin = cortesListos();
        panel.className = 'nl-lab__trabajo ' + (fin ? 'is-ok' : 'is-pregunta');
        panel.innerHTML = `${av}${cab}
            ${fin ? '' : `<p class="nl-lab__ayuda">${casoSel == null ? 'Toca un caso y luego el sitio de la lesión en el esquema.' : `<strong>Caso ${casoSel + 1}</strong>: ¿en qué sitio está la lesión?`}</p>`}
            ${casoSel != null ? `<div class="nl-circ__sitios">${sitios.map(s => `<button type="button" class="nl-circ__sitio-btn" data-sitio="${esc(s.letra)}">${esc(s.letra)}</button>`).join('')}</div>` : ''}
            ${malSel.length ? `<p class="nl-lab__q-fb">✗ Ahí no. Pista: ${esc(malSel[malSel.length - 1].replace(/^\w: /, ''))}</p>` : ''}
            <div class="nl-circ__casos">${tarjetas}</div>
            ${fin ? `<div class="nl-ficha__acciones">${siguienteBoton()}</div>` : ''}`;
        panel.querySelectorAll('[data-caso]').forEach(b => b.addEventListener('click', () => {
            casoSel = Number(b.dataset.caso); casoOk = null; pintar();
        }));
        panel.querySelectorAll('.nl-circ__sitio-btn').forEach(b => b.addEventListener('click', () => { if (!ocupado) emparejar(casoSel, b.dataset.sitio); }));
        enlazarIr();
    }

    const repasarCirc = c => {
        const e = ec(c.clave), rep = [];
        c.piezas.forEach(pz => { if ((e.mal[pz.clave] || []).length) rep.push('ubicar ' + pz.nombre.toLowerCase()); });
        c.vias.forEach((vv, i) => { if ((e.via[i] || {}).mal) rep.push('el orden' + (vv.titulo ? ' (' + vv.titulo.toLowerCase() + ')' : '')); });
        (c.lupas || []).forEach(lp => { if (Object.values((e.lupa[lp.clave] || {}).preg || {}).some(r => r.mal?.length)) rep.push('lupa ' + lp.titulo.split(' (')[0].toLowerCase()); });
        c.preguntas.forEach((q, i) => { if ((e.preg[i] || {}).mal?.length) rep.push('pregunta ' + (i + 1)); });
        return rep;
    };
    const porRepasar = () => {
        const rep = circuitos.flatMap(c => repasarCirc(c).map(t => (circuitos.length > 1 ? corto(c.titulo).toLowerCase() + ': ' : '') + t));
        casos.forEach((_, i) => { if (ek(i).mal.length) rep.push('caso ' + (i + 1)); });
        return rep;
    };

    function mostrarCierre() {
        const rep = porRepasar();
        const hrefRuta = ruta ? 'practico.php?p=' + encodeURIComponent(ruta) : '';
        panel.className = 'nl-lab__trabajo is-cierre';
        panel.innerHTML = `
            <p class="nl-lab__cierre-tit">🎉 ¡Nivel completado!</p>
            <p>${est.err ? `${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}` : 'Sin errores'}</p>
            ${rep.length ? `<p class="nl-lab__alt nl-lab__repasar">↺ Por repasar: ${esc(rep.join(' · '))}</p>` : ''}
            ${d.siguiente ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${esc(d.siguiente)}">Siguiente nivel →</a>`
                          : (hrefRuta ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${hrefRuta}">Volver a la ruta →</a>` : '')}
            ${tplCx ? `<details class="nl-lab__conexion"><summary>💡 ¿Para qué te sirve esto?</summary>${tplCx.innerHTML}</details>` : ''}
            ${secciones.length > 1 ? '<p class="nl-lab__ayuda">Toca A, B o C arriba para repasar cada parte.</p>' : ''}
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
    async function lienzoBase() {
        const img = await cargar(capBase.img);
        const W = Math.min(MAX_GUIA, img.width), H = Math.round(W * img.height / img.width);
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
        g.drawImage(img, 0, 0, W, H);
        if (!d.fondo) { const esq = await imagenMolde(molde, 'esquema', W); if (esq) g.drawImage(esq, 0, 0, W, H); }
        return { c, g, W, H, px: p => [p[0] * W / 100, p[1] * H / 100], fs: Math.max(12, Math.round(W / 55)) };
    }
    function rotulo(L, txt, x, y, borde, alinear) {
        const { g, W, H, fs } = L;
        g.font = `bold ${fs}px Arial, sans-serif`; g.textBaseline = 'middle';
        const tw = g.measureText(txt).width + fs * 0.8, h = fs * 1.5;
        let lx = alinear === 'izq' ? x : x - tw / 2;
        lx = Math.min(Math.max(lx, 2), W - tw - 2);
        const ly = Math.min(Math.max(y, h / 2 + 2), H - h / 2 - 2);
        g.fillStyle = 'rgba(26,14,46,.88)';
        g.beginPath(); if (g.roundRect) g.roundRect(lx, ly - h / 2, tw, h, h / 2); else g.rect(lx, ly - h / 2, tw, h); g.fill();
        g.strokeStyle = borde; g.lineWidth = 2; g.stroke();
        g.fillStyle = '#fff'; g.fillText(txt, lx + fs * 0.4, ly);
    }
    /** Dibuja neuronas (trazos) en el canvas: el SVG sin imágenes y después el ícono de cada soma. */
    async function dibujarNeuronas(L, lista, rutas) {
        const { g, W, H } = L;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${VB[0]} ${VB[1]}" preserveAspectRatio="none">
            <style>.nl-neu__halo{fill:none;stroke:#fff;stroke-width:9;stroke-linecap:round;stroke-linejoin:round;opacity:.85}
            .nl-neu__ax{fill:none;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}.is-fino{stroke-width:3}.nl-neu__halo.is-fino{stroke-width:7}
            .is-inhibida .nl-neu__axones{opacity:.45}.is-inhibida .nl-neu__ax{stroke-dasharray:10 8}
            .nl-neu__inh{font:700 22px Arial,sans-serif;fill:#7C3AED;stroke:#fff;stroke-width:5px;paint-order:stroke}
            .nl-neu__aura,.nl-neu__num{display:none}.nl-neu__nom{display:none}</style>
            ${(rutas || []).map(r => `<path d="${r.d}" fill="none" stroke="${r.inhibe ? '#A78BFA' : '#F59E0B'}" stroke-width="12" stroke-opacity=".35" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}
            ${lista.map((n, i) => svgNeurona('g' + i, n.t, { inhibida: n.inhibida, sinIcono: true })).join('')}</svg>`;
        const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
        try { g.drawImage(await cargar(url), 0, 0, W, H); } finally { URL.revokeObjectURL(url); }
        const sx = W / VB[0], sy = H / VB[1];
        for (const n of lista) {
            const t = n.t, ic = SOMA_ICONO[t.ico], src = iconosUrl[t.ico];
            const [x, y, r] = [t.soma[0] * sx, t.soma[1] * sy, t.soma[2] * sx];
            if (ic && src) {
                try {
                    const im = await cargar(src), s = r / ic[2];
                    g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip();
                    g.drawImage(im, x - ic[0] * s, y - ic[1] * s, 192 * s, 192 * s); g.restore();
                } catch { /* sin ícono */ }
            }
            g.strokeStyle = t.color; g.lineWidth = Math.max(2, 5 * sx);
            g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
            if (n.nombre) rotulo(L, n.nombre, x + r + 4, y - r, t.color, 'izq');
        }
    }
    async function imagenCircuito(cc) {
        const e = ec(cc.clave), L = await lienzoBase();
        if (etiquetas) {
            cc.vias.map((_, i) => e.via[i] || {}).filter(v => v.ok && v.ruta).forEach(v => {
                const g = L.g; g.save(); g.scale(L.W / VB[0], L.H / VB[1]);
                g.strokeStyle = v.inhibe ? 'rgba(167,139,250,.85)' : 'rgba(245,158,11,.85)'; g.lineWidth = 5 * VB[0] / L.W;
                g.lineCap = 'round'; g.lineJoin = 'round'; g.setLineDash([12 * VB[0] / L.W, 8 * VB[0] / L.W]);
                g.stroke(new Path2D(v.ruta)); g.restore();
            });
            cc.piezas.forEach(pz => {
                if (!e.pos[pz.clave]) return;
                const p = L.px(e.pos[pz.clave]);
                L.g.fillStyle = '#F59E0B'; L.g.beginPath(); L.g.arc(p[0], p[1], L.fs * 0.35, 0, Math.PI * 2); L.g.fill();
                rotulo(L, pz.nombre, p[0] + L.fs * 0.5, p[1], '#F59E0B', 'izq');
            });
        } else {
            const inh = inhibidas(cc);
            const rutas = cc.vias.map((_, i) => e.via[i] || {}).filter(v => v.ok && v.ruta).map(v => ({ d: v.ruta, inhibe: !!v.inhibe }));
            await dibujarNeuronas(L, cc.piezas.filter(pz => e.trz[pz.clave]).map(pz => ({ t: e.trz[pz.clave], inhibida: inh.includes(pz.clave), nombre: pz.nombre + (inh.includes(pz.clave) ? ' ⊣ inhibida' : '') })), rutas);
        }
        return L.c.toDataURL('image/jpeg', 0.82);
    }
    async function imagenCortes() {
        const L = await lienzoBase();
        await dibujarNeuronas(L, neuronasFijas.map(t => ({ t })), []);
        const { g } = L, fs = L.fs * 1.2;
        sitios.forEach(s => {
            const p = L.px(pct(s.x, s.y));
            g.fillStyle = '#1A0E2E'; g.strokeStyle = '#FCD34D'; g.lineWidth = 3;
            g.beginPath(); g.arc(p[0], p[1], fs * 0.9, 0, Math.PI * 2); g.fill(); g.stroke();
            g.fillStyle = '#FCD34D'; g.font = `bold ${fs}px Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillText(s.letra, p[0], p[1] + 1); g.textAlign = 'start';
            const n = casos.map((_, i) => ek(i).sitio === s.letra ? 'caso ' + (i + 1) : '').filter(Boolean).join(', ');
            if (n) rotulo(L, n, p[0] + fs, p[1] + fs * 1.3, '#FCD34D', 'izq');
        });
        return L.c.toDataURL('image/jpeg', 0.82);
    }

    let guiaHecha = false, guiaPromesa = null;
    function guardarGuia() {
        if (guiaHecha) return guiaPromesa;
        guiaHecha = true;
        guiaPromesa = armarGuia();
        return guiaPromesa;
    }
    async function armarGuia() {
        const items = [], bloques = [];
        for (const cc of circuitos) {
            try { items.push({ src: await imagenCircuito(cc), titulo: cc.titulo + (cc.sub ? ` (${cc.sub})` : ''), pie: cc.estimulo || '' }); }
            catch { /* sin imagen: queda el resto */ }
        }
        if (casos.length) {
            try { items.push({ src: await imagenCortes(), titulo: cortes.titulo || 'Cortes', pie: 'Cada caso, en el sitio de su lesión.' }); }
            catch { /* sin imagen */ }
        }
        if (items.length) bloques.push({ t: 'imagenes', items });
        for (const cc of circuitos) {
            const e = ec(cc.clave);
            bloques.push(etiquetas
                ? { t: 'tabla', cab: ['Parte', 'Qué es'], filas: cc.piezas.map(pz => [pz.nombre, (e.exp[pz.clave] || {}).exp || '']) }
                : { t: 'tabla', cab: ['Neurona', 'Su soma está en', 'Qué hace'], filas: cc.piezas.map(pz => [pz.nombre, (e.exp[pz.clave] || {}).zona || '', (e.exp[pz.clave] || {}).exp || '']) });
            if (cc.vias.length) bloques.push({ t: 'tabla', cab: ['Vía', 'Recorrido'], filas: cc.vias.map((vv, i) => [vv.titulo || cc.titulo, (e.via[i] || {}).exp || '']) });
            if ((cc.lupas || []).length) bloques.push({ t: 'tabla', cab: ['Lupa', 'Pregunta', 'Respuesta'],
                filas: cc.lupas.flatMap(lp => lp.preguntas.map((q, i) => [i === 0 ? lp.titulo : '', q.p, q.ops[q.ok]])) });
            if (cc.preguntas.length) bloques.push({ t: 'tabla', cab: ['Pregunta', 'Respuesta', 'Para recordar'], filas: cc.preguntas.map(q => [q.p, q.ops[q.ok], q.exp || '']) });
        }
        if (casos.length) bloques.push({ t: 'tabla', cab: ['Caso', 'Sitio de la lesión', 'Por qué'],
            filas: casos.map((cs, i) => [`${i + 1}. ${cs.titulo || ''}`, `${ek(i).sitio || ''}: ${ek(i).resp || ''}`, ek(i).exp || '']) });
        const rep = porRepasar();
        if (rep.length) bloques.push({ t: 'texto', txt: '↺ Por repasar: ' + rep.join(', ') + '.' });
        sumarAGuia(clave, {
            titulo: d.titulo, subtitulo: etiquetas ? (d.subtitulo || 'Las partes de la médula') : casos.length && !circuitos.length ? 'Casos clínicos y sitio de la lesión' : 'El circuito a nivel celular', slug: d.slug,
            nota: `${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}`,
            bloques: bloques.concat(conexionGuia(tplCx)),
        });
    }

    function actualizar() {
        let hechos = 0, total = 0;
        circuitos.forEach(c => {
            const e = ec(c.clave), lps = c.lupas || [];
            const aUbicar = c.piezas.filter(pz => !pz.dada);
            total += aUbicar.length + c.vias.length + lps.length + c.preguntas.length;
            hechos += aUbicar.filter(pz => e.ok[pz.clave]).length + c.vias.filter((_, i) => viaOk(c, i)).length
                + lps.filter(lp => lupaLista(c, lp)).length + c.preguntas.filter((q, i) => (e.preg[i] || {}).ok).length;
        });
        total += casos.length;
        hechos += casos.filter((_, i) => ek(i).ok).length;
        contador.textContent = hechos + ' / ' + total;
        errores.textContent = est.err ? `${est.err} ${est.err === 1 ? 'error' : 'errores'}` : '';
        if (!actual() && est.listo) {
            markDone(clave);
            if (!d.siguiente) markDone(d.slug);
            guardarGuia();
        }
    }

    function pintar() {
        if (ver === null) { pintarPasos(); verCierreVista(); mostrarCierre(); actualizar(); return; }
        pintarVista();
        pintarPasos();
        pintarPanel();
        actualizar();
    }
    function verCierreVista() { ver = secciones[secciones.length - 1]; pintarVista(); ver = null; }

    raiz.querySelector('#nl-circ-reset')?.addEventListener('click', () => {
        if ((est.err || Object.keys(est.k).length || Object.values(est.c).some(e => Object.keys(e.mal || {}).length || Object.keys(e.via || {}).length || Object.keys(e.preg || {}).length))
            && !confirm('Esto borra tu avance y tus respuestas de este nivel. ¿Seguro?')) return;
        try { localStorage.removeItem(KEY); } catch { /* sin acceso */ }
        location.reload();
    });

    if (!actual() && est.listo) ver = null;
    else if (ver !== 'cortes' && ver) selPieza = primeraSinUbicar(circDe(ver));
    pintar();
}

if (RAIZ) iniciar(RAIZ);
