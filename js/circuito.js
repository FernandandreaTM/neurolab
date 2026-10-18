/**
 * NeuroLab — circuito.js
 * Nivel «circuito» de una lámina: reflejos armados sobre la captura del nivel I, ya encajada en el
 * molde (js/molde.js), con el esquema de lo que la tinción no muestra (sustancia gris, raíces, nervio).
 * Secciones, en orden:
 *   A, B… circuitos (p. ej. rotuliano y retirada), cada uno con 3 pasos:
 *        1. Ubicar   -> elige una neurona y toca su lugar; si acierta, se ubica en su punto del esquema
 *        2. Conectar -> toca las neuronas en el orden de la información; al acertar se dibuja la ruta
 *                       (receptor → … → efector) por las raíces y el nervio, con un impulso animado
 *        3. Preguntas-> alternativas; la incorrecta queda en rojo con su pista, hasta acertar
 *   C. Cortes -> casos clínicos: tocar en el esquema dónde se cortó el arco
 * Zonas, puntos, orden y rutas se revisan en api/circuito_check.php. Avance en localStorage (nl_circ_<clave>).
 * Al completar: markDone(clave) y la sección (capturas con los reflejos + preguntas + casos) va a la guía.
 */
import { markDone, bloqueado } from './progress.js';
import { sumarAGuia, urlGuia } from './guia.js';
import { conexionGuia } from './carrera.js';
import { svgMolde, imagenMolde, curva } from './molde.js';

const RAIZ = document.getElementById('nl-circ');
const COLORES = { sensitiva: '#38BDF8', interneurona: '#E879F9', motora: '#F87171' };
const MAX_GUIA = 760;

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
    let circuitos = [], cortes = null, base = {};
    try { circuitos = JSON.parse(d.circuitos || '[]'); } catch { circuitos = []; }
    try { cortes = JSON.parse(d.cortes || 'null'); } catch { cortes = null; }
    try { base = JSON.parse(d.base || '{}'); } catch { base = {}; }
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
    const color = k => COLORES[k] || '#FCD34D';
    const casos = (cortes && cortes.casos) || [];

    if (bloqueado(d.requiere)) {
        raiz.classList.add('is-bloqueada');
        raiz.querySelector('.nl-lab__candado')?.removeAttribute('hidden');
        return;
    }

    // Captura del nivel base, encajada en el molde (las capturas encajadas guardan `malp`)
    const capBase = (leerJSON('nl_lam_' + base.clave, {}).caps || {})[base.captura] || {};
    if (!capBase.img || !capBase.listo || !capBase.malp) {
        vista.innerHTML = `<p class="nl-lam__ayuda-vista">No encontramos tu captura del nivel I en este navegador.</p>`;
        panel.innerHTML = `<p class="nl-lab__paso">Falta tu captura</p>
            <p>Este nivel se arma sobre tu captura del nivel I, ya encajada en la silueta. Ábrelo en este mismo navegador y complétalo (si lo hiciste antes del cambio de la silueta, usa «Empezar de nuevo» allí).</p>`;
        return;
    }

    let est = leerJSON(KEY, null);
    if (!est || typeof est !== 'object' || !est.c) est = {};
    est.c = est.c || {}; est.k = est.k || {}; est.err = est.err || 0;
    const ec = k => {
        if (!est.c[k]) est.c[k] = {};
        const e = est.c[k];
        e.pos = e.pos || {}; e.ok = e.ok || {}; e.mal = e.mal || {}; e.exp = e.exp || {}; e.seq = e.seq || []; e.preg = e.preg || {};
        return e;
    };
    const ek = i => (est.k[i] = est.k[i] || { mal: [] });
    const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(est)); } catch { /* sin espacio */ } };
    if (instr && !Object.keys(est.c).length) instr.open = true;

    // Secciones: un circuito por letra y, al final, los cortes
    const secciones = circuitos.map(c => c.clave).concat(casos.length ? ['cortes'] : []);
    const circDe = k => circuitos.find(c => c.clave === k);
    const circListo = k => !!ec(k).listo;
    const cortesListos = () => casos.every((_, i) => ek(i).ok);
    const seccionLista = s => s === 'cortes' ? cortesListos() : circListo(s);
    const actual = () => secciones.find(s => !seccionLista(s)) || null;
    let ver = actual() || secciones[secciones.length - 1];   // sección que se muestra
    let selPieza = null;
    let aviso = '';
    let ocupado = false;
    let enRespuesta = null;     // índice de la pregunta recién acertada (muestra su explicación)
    let casoOk = null;          // índice del caso recién resuelto

    const pasoC = c => {
        const e = ec(c.clave);
        return !c.piezas.every(p => e.ok[p.clave]) ? 'ubicar' : !e.orden ? 'conectar' : !e.listo ? 'preguntas' : 'listo';
    };
    const primeraSinUbicar = c => (c.piezas.find(p => !ec(c.clave).ok[p.clave]) || {}).clave || null;

    /* ---------------- Vista ---------------- */
    function svgRuta(pts, animado, tenue) {
        const dp = curva(pts);
        return `<svg class="nl-circ__svg${tenue ? ' is-tenue' : ''}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="${dp}" class="nl-circ__halo"/>
            <path d="${dp}" class="nl-circ__ruta${animado ? ' is-animada' : ''}"/>
            ${animado ? `<circle r="1.3" class="nl-circ__impulso"><animateMotion dur="3s" repeatCount="indefinite" path="${dp}"/></circle>` : ''}
        </svg>`;
    }
    function extremos(c, pts) {
        const a = pts[0], b = pts[pts.length - 1];
        return `<span class="nl-circ__fin is-entra" style="left:${Math.max(a[0], 1)}%;top:${a[1] - 6}%">⟶ ${esc(c.receptor)}</span>
                <span class="nl-circ__fin is-sale" style="left:${Math.max(b[0], 1)}%;top:${b[1] + 5}%">⟵ ${esc(c.efector)}</span>`;
    }
    function neuronas(c, p) {
        const e = ec(c.clave);
        return c.piezas.filter(pz => e.pos[pz.clave]).map(pz => {
            const [x, y] = e.pos[pz.clave];
            const i = e.seq.indexOf(pz.clave);
            return `<button type="button" class="nl-circ__neu${e.ok[pz.clave] ? ' is-ok' : ' is-mal'}${p === 'conectar' ? ' is-tocable' : ''}${i >= 0 ? ' is-elegida' : ''}"
                      data-clave="${esc(pz.clave)}" style="left:${x}%;top:${y}%;--c:${color(pz.clave)}" title="${esc(pz.nombre)}">
                      <span class="nl-circ__ico">${iconos[pz.clave] || ''}</span>
                      ${i >= 0 && !e.orden ? `<span class="nl-circ__num">${i + 1}</span>` : ''}
                      <span class="nl-circ__nom">${esc(pz.nombre)}</span></button>`;
        }).join('');
    }
    function pintarVista() {
        let capas = '', ayuda = '', clase = '';
        if (ver === 'cortes') {
            const c0 = circuitos[0], e0 = c0 ? ec(c0.clave) : null;
            if (e0 && e0.ruta) capas += svgRuta(e0.ruta, false, true);
            capas += casos.map((_, i) => {
                const k = ek(i);
                if (!k.pos) return '';
                return `<span class="nl-circ__corte${k.ok ? ' is-ok' : ' is-mal'}" style="left:${k.pos[0]}%;top:${k.pos[1]}%">✂<b>${i + 1}</b></span>`;
            }).join('');
            const i = casos.findIndex((_, j) => !ek(j).ok);
            clase = i >= 0 && casoOk == null ? ' is-poner' : '';
            ayuda = i >= 0 ? `Caso ${i + 1}: toca en el esquema <strong>dónde se cortó</strong> el arco` : 'Tus cortes, sobre el reflejo rotuliano';
        } else {
            const c = circDe(ver), e = ec(ver), p = pasoC(c);
            if (e.ruta) capas += svgRuta(e.ruta, true) + extremos(c, e.ruta);
            capas += neuronas(c, p);
            clase = (p === 'ubicar' && selPieza ? ' is-poner' : '') + (p !== 'ubicar' ? ' is-armado' : '');
            ayuda = p === 'ubicar' ? (selPieza ? `Toca dónde va: <strong>${esc((c.piezas.find(x => x.clave === selPieza) || {}).nombre)}</strong>` : 'Elige una neurona en el panel')
                : p === 'conectar' ? 'Toca las neuronas <strong>en el orden en que viaja la información</strong>, desde el receptor'
                : `${esc(c.titulo)}: el impulso va del receptor al efector`;
        }
        vista.innerHTML = `<div class="nl-lam__lienzo nl-circ__lienzo${clase}" id="nl-circ-lienzo">
              <img src="${capBase.img}" alt="Tu captura de la médula" draggable="false">
              ${svgMolde(molde, 'esquema', 'nl-circ__esquema')}
              ${capas}
            </div>
            <p class="nl-lam__ayuda-vista">${ayuda}</p>`;
        const lz = vista.querySelector('#nl-circ-lienzo');
        lz.addEventListener('click', ev => {
            if (ocupado) return;
            const r = lz.querySelector('img').getBoundingClientRect();
            const x = Math.round((ev.clientX - r.left) / r.width * 1000) / 10, y = Math.round((ev.clientY - r.top) / r.height * 1000) / 10;
            const dentro = x >= 0 && x <= 100 && y >= 0 && y <= 100;
            if (ver === 'cortes') {
                const i = casos.findIndex((_, j) => !ek(j).ok);
                if (i >= 0 && dentro && casoOk == null) cortar(i, [x, y]);
                return;
            }
            const c = circDe(ver), p = pasoC(c);
            const neu = ev.target.closest('.nl-circ__neu');
            if (p === 'conectar' && neu) { tocarNeurona(c, neu.dataset.clave); return; }
            if (p === 'ubicar' && selPieza && dentro) ubicar(c, selPieza, [x, y]);
        });
    }

    async function ubicar(c, k, xy) {
        if (instr) instr.open = false;
        const e = ec(c.clave);
        ocupado = true;
        e.pos[k] = xy;
        delete e.ok[k];
        pintarVista();
        const r = await revisar({ slug: d.slug, n: d.n, accion: 'ubicar', circuito: c.clave, pieza: k, x: xy[0], y: xy[1] });
        ocupado = false;
        if (r.red) { aviso = r.feedback; pintar(); return; }
        if (r.correcto) {
            e.ok[k] = true;
            e.pos[k] = r.punto || xy;
            e.exp[k] = { exp: r.exp || '', zona: r.zona || '', e: (e.mal[k] || []).length };
            selPieza = primeraSinUbicar(c);
        } else {
            e.mal[k] = (e.mal[k] || []).concat([r.feedback]);
            est.err++;
        }
        guardar();
        pintar();
    }

    async function tocarNeurona(c, k) {
        const e = ec(c.clave);
        if (e.seq.includes(k)) return;
        e.seq.push(k);
        pintarVista();
        if (e.seq.length < c.piezas.length) { pintarPanel(); return; }
        ocupado = true;
        const r = await revisar({ slug: d.slug, n: d.n, accion: 'orden', circuito: c.clave, orden: JSON.stringify(e.seq) });
        ocupado = false;
        if (r.red) { e.seq = []; aviso = r.feedback; pintar(); return; }
        if (r.correcto) {
            e.orden = true;
            e.ordenOk = e.seq.slice();
            e.ordenExp = r.feedback || '';
            e.ruta = r.ruta || null;
        } else {
            e.ordenMal = (e.ordenMal || 0) + 1;
            est.err++;
            aviso = '✗ Ese orden no es. ' + (r.feedback || '');
            e.seq = [];
        }
        guardar();
        pintar();
    }

    async function cortar(i, xy) {
        if (instr) instr.open = false;
        const k = ek(i);
        ocupado = true;
        k.pos = xy;
        pintarVista();
        const r = await revisar({ slug: d.slug, n: d.n, accion: 'corte', caso: i, x: xy[0], y: xy[1] });
        ocupado = false;
        if (r.red) { delete k.pos; aviso = r.feedback; pintar(); return; }
        if (r.correcto) { k.ok = true; k.resp = r.respuesta || ''; k.exp = r.exp || ''; casoOk = i; }
        else { k.mal.push(r.feedback); est.err++; }
        guardar();
        pintar();
    }

    /* ---------------- Panel ---------------- */
    function pintarPasos() {
        const act = actual();
        pasosEl.innerHTML = secciones.map((s, i) => {
            const t = s === 'cortes' ? `${LETRAS[i]} · Cortes` : `${LETRAS[i]} · ${corto(circDe(s).titulo)}`;
            const cl = seccionLista(s) ? 'is-ok' : s === act ? 'is-actual' : '';
            return `<li class="${cl}${s === ver ? ' is-viendo' : ''}"><button type="button" data-s="${esc(s)}"${seccionLista(s) || s === act ? '' : ' disabled'}>${esc(t)}</button></li>`;
        }).join('');
        pasosEl.querySelectorAll('button:not([disabled])').forEach(b => b.addEventListener('click', () => {
            ver = b.dataset.s; selPieza = ver !== 'cortes' ? primeraSinUbicar(circDe(ver)) : null;
            enRespuesta = null; casoOk = null; pintar();
        }));
    }

    function bloque(etq, txt, extra) {
        return `<div class="nl-ficha__bloque${extra ? ' nl-ficha__bloque--extra' : ''}"><span class="nl-ficha__etq">${esc(etq)}</span><p>${esc(txt)}</p></div>`;
    }

    function pintarPanel() {
        const av = aviso ? `<p class="nl-lab__aviso-act">${esc(aviso)}</p>` : '';
        aviso = '';
        panel.className = 'nl-lab__trabajo is-pregunta';
        if (ver === 'cortes') { panelCortes(av); return; }
        const c = circDe(ver), e = ec(ver), p = pasoC(c);
        const letra = LETRAS[secciones.indexOf(ver)];
        const cab = `<p class="nl-lab__paso"><span class="nl-lab__badge">${letra}</span> ${esc(c.titulo)} <small class="nl-circ__sub">${esc(c.sub)}</small></p>
            ${c.estimulo ? `<p class="nl-circ__estimulo">⚡ ${esc(c.estimulo)}</p>` : ''}
            <ol class="nl-lam__pasos nl-circ__mini">${['Ubicar', 'Conectar', 'Preguntas'].map((t, i) => {
                const iP = ['ubicar', 'conectar', 'preguntas', 'listo'].indexOf(p);
                return `<li class="${i < iP ? 'is-ok' : i === iP ? 'is-actual' : ''}">${t}</li>`;
            }).join('')}</ol>`;

        if (p === 'ubicar') {
            if (!selPieza) selPieza = primeraSinUbicar(c);
            const sel = c.piezas.find(x => x.clave === selPieza);
            const malSel = sel ? (e.mal[sel.clave] || []) : [];
            const ultimoMal = sel && !e.ok[sel.clave] && e.pos[sel.clave] && malSel.length ? malSel[malSel.length - 1] : '';
            panel.innerHTML = `${av}${cab}
                <p class="nl-lab__ayuda">Elige una neurona y toca su lugar en el esquema, del lado izquierdo.</p>
                <div class="nl-circ__piezas">${c.piezas.map(pz => {
                    const ok = e.ok[pz.clave];
                    return `<button type="button" class="nl-circ__pieza${ok ? ' is-ok' : ''}${pz.clave === selPieza ? ' is-sel' : ''}" data-clave="${esc(pz.clave)}" style="--c:${color(pz.clave)}">
                        <span class="nl-circ__ico">${iconos[pz.clave] || ''}</span>
                        <span><strong>${ok ? '✓ ' : ''}${esc(pz.nombre)}</strong>${pz.detalle ? `<small>${esc(pz.detalle)}</small>` : ''}</span></button>`;
                }).join('')}</div>
                ${ultimoMal ? `<p class="nl-lab__q-fb">✗ ${esc(ultimoMal)}</p>` : ''}
                ${c.piezas.filter(pz => e.ok[pz.clave]).map(pz => bloque(pz.nombre + ' · ' + e.exp[pz.clave].zona, e.exp[pz.clave].exp)).join('')}`;
            panel.querySelectorAll('.nl-circ__pieza').forEach(b => b.addEventListener('click', () => {
                selPieza = b.dataset.clave; pintar();
                if (angosta()) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }));
            return;
        }

        if (p === 'conectar') {
            panel.innerHTML = `${av}${cab}
                <p class="nl-lab__ayuda">Toca en la imagen las ${c.piezas.length} neuronas en el orden en que viaja la información, desde la que recibe del <strong>${esc(c.receptor.toLowerCase())}</strong>.</p>
                <p class="nl-circ__seq">${e.seq.length ? e.seq.map((k, i) => `<span style="--c:${color(k)}">${i + 1}. ${esc((c.piezas.find(x => x.clave === k) || {}).nombre)}</span>`).join(' → ') : '<em>Aún no tocas ninguna</em>'}</p>
                ${e.seq.length ? '<button type="button" class="nl-lab__nose nl-circ__borrar">Borrar y empezar el orden de nuevo</button>' : ''}`;
            panel.querySelector('.nl-circ__borrar')?.addEventListener('click', () => { e.seq = []; guardar(); pintar(); });
            if (angosta()) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
        }

        if (enRespuesta != null) { mostrarRespuesta(c, enRespuesta, cab); return; }
        if (p === 'listo') { fichaCircuito(c, cab); return; }

        const preguntas = c.preguntas;
        const iq = preguntas.findIndex((q, i) => !(e.preg[i] || {}).ok);
        if (iq < 0) { e.listo = true; guardar(); pintar(); return; }
        const q = preguntas[iq];
        const r = e.preg[iq] || (e.preg[iq] = { mal: [], orden: barajar(q.ops.length) });
        panel.innerHTML = `${av}${cab}
            ${e.ordenExp && iq === 0 && !r.mal.length ? bloque('✓ Tu reflejo', e.ordenExp) : ''}
            <p class="nl-lab__ayuda">Pregunta ${iq + 1} de ${preguntas.length}</p>
            <p class="nl-lab__q">${esc(q.p)}</p>
            <div class="nl-lab__alts">${r.orden.map((io, k) => `
                <button type="button" class="nl-lab__alt-btn${r.mal.includes(io) ? ' is-mal' : ''}" data-i="${io}"${r.mal.includes(io) ? ' disabled' : ''}>
                    <span class="nl-lab__alt-letra">${String.fromCharCode(65 + k)}</span><span>${esc(q.ops[io])}</span></button>`).join('')}</div>
            ${r.mal.length ? `<p class="nl-lab__q-fb">✗ Pista: ${esc(q.pista || 'intenta de nuevo.')}</p>` : ''}`;
        panel.querySelectorAll('.nl-lab__alt-btn:not([disabled])').forEach(b => b.addEventListener('click', () => {
            const io = Number(b.dataset.i);
            if (io !== q.ok) {
                r.mal.push(io); est.err++; guardar(); pintarPanel(); actualizar();
                panel.querySelector('.nl-lab__alts')?.classList.add('is-sacude');
                return;
            }
            r.ok = true; guardar();
            enRespuesta = iq;
            pintarPanel(); actualizar();
        }));
    }

    function mostrarRespuesta(c, iq, cab) {
        const e = ec(c.clave);
        const q = c.preguntas[iq];
        const r = e.preg[iq];
        const ultima = iq === c.preguntas.length - 1;
        panel.className = 'nl-lab__trabajo ' + (r.mal.length ? 'is-repasar' : 'is-ok');
        panel.innerHTML = `${cab}
            <p class="nl-lab__ayuda">Pregunta ${iq + 1} de ${c.preguntas.length} <span class="nl-tip__logro">${r.mal.length ? '✓ con pista' : '🎯 al primer intento'}</span></p>
            <p class="nl-lab__q">${esc(q.p)}</p>
            ${bloque('Respuesta', q.ops[q.ok])}
            ${q.exp ? bloque('Para recordar', q.exp, true) : ''}
            <div class="nl-ficha__acciones">
                <button type="button" class="btn btn-primary btn-sm nl-lab__sig">${ultima ? 'Terminar este reflejo →' : 'Siguiente pregunta →'}</button>
            </div>`;
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
            ver = s || null; casoOk = null; enRespuesta = null;
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
            ${bloque('✓ Tu reflejo', e.ordenExp)}
            ${bloque('Respuestas', c.preguntas.map(q => '• ' + q.ops[q.ok]).join('  '), true)}
            <div class="nl-ficha__acciones">${siguienteBoton()}</div>`;
        enlazarIr();
    }

    function panelCortes(av) {
        const letra = LETRAS[secciones.indexOf('cortes')];
        const cab = `<p class="nl-lab__paso"><span class="nl-lab__badge">${letra}</span> ${esc(cortes.titulo || 'Cortes')}</p>
            <p class="nl-lab__ayuda">Lee el caso y toca en el esquema el lugar donde se interrumpió el arco reflejo.</p>`;
        if (casoOk != null) {
            const k = ek(casoOk);
            panel.className = 'nl-lab__trabajo ' + (k.mal.length ? 'is-repasar' : 'is-ok');
            panel.innerHTML = `${cab}
                <p class="nl-lab__ayuda">Caso ${casoOk + 1} de ${casos.length} <span class="nl-tip__logro">${k.mal.length ? '✓ con pista' : '🎯 al primer intento'}</span></p>
                <p class="nl-lab__q">${esc(casos[casoOk].caso)}</p>
                ${bloque('Dónde', k.resp)}${bloque('Para recordar', k.exp, true)}
                <div class="nl-ficha__acciones"><button type="button" class="btn btn-primary btn-sm nl-lab__sig">${cortesListos() ? 'Terminar →' : 'Siguiente caso →'}</button></div>`;
            panel.querySelector('.nl-lab__sig').addEventListener('click', () => { casoOk = null; pintar(); });
            return;
        }
        const i = casos.findIndex((_, j) => !ek(j).ok);
        if (i < 0) {
            panel.className = 'nl-lab__trabajo is-ok';
            panel.innerHTML = `${cab}${casos.map((cs, j) => bloque(`Caso ${j + 1} · ${ek(j).resp}`, cs.caso)).join('')}
                <div class="nl-ficha__acciones">${siguienteBoton()}</div>`;
            enlazarIr();
            return;
        }
        const k = ek(i);
        panel.innerHTML = `${av}${cab}
            <p class="nl-lab__ayuda">Caso ${i + 1} de ${casos.length}</p>
            <p class="nl-lab__q">${esc(casos[i].caso)}</p>
            ${k.mal.length ? `<p class="nl-lab__q-fb">✗ Ahí no. Pista: ${esc(k.mal[k.mal.length - 1])}</p>` : ''}`;
        if (angosta()) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const repasarCirc = c => {
        const e = ec(c.clave), rep = [];
        c.piezas.forEach(pz => { if ((e.mal[pz.clave] || []).length) rep.push('ubicar ' + pz.nombre.toLowerCase()); });
        if (e.ordenMal) rep.push('el orden');
        c.preguntas.forEach((q, i) => { if ((e.preg[i] || {}).mal?.length) rep.push('pregunta ' + (i + 1)); });
        return rep;
    };
    const porRepasar = () => {
        const rep = circuitos.flatMap(c => repasarCirc(c).map(t => corto(c.titulo).toLowerCase() + ': ' + t));
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
            ${d.siguiente ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${esc(d.siguiente)}">Siguiente actividad →</a>`
                          : (hrefRuta ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${hrefRuta}">Volver a la ruta →</a>` : '')}
            ${tplCx ? `<details class="nl-lab__conexion"><summary>💡 ¿Para qué te sirve esto?</summary>${tplCx.innerHTML}</details>` : ''}
            <p class="nl-lab__ayuda">Toca A, B o C arriba para repasar cada parte.</p>
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
        const lado = Math.min(MAX_GUIA, img.width);
        const c = document.createElement('canvas');
        c.width = c.height = lado;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0, lado, lado);
        const esq = await imagenMolde(molde, 'esquema', lado);
        if (esq) g.drawImage(esq, 0, 0, lado, lado);
        return { c, g, lado };
    }
    function rotulo(g, lado, txt, x, y, borde, alinear) {
        const fs = Math.max(12, Math.round(lado / 46));
        g.font = `bold ${fs}px Arial, sans-serif`; g.textBaseline = 'middle';
        const tw = g.measureText(txt).width + fs * 0.8, h = fs * 1.5;
        let lx = alinear === 'izq' ? x : x - tw / 2;
        lx = Math.min(Math.max(lx, 2), lado - tw - 2);
        const ly = Math.min(Math.max(y, h / 2 + 2), lado - h / 2 - 2);
        g.fillStyle = 'rgba(26,14,46,.88)';
        g.beginPath(); if (g.roundRect) g.roundRect(lx, ly - h / 2, tw, h, h / 2); else g.rect(lx, ly - h / 2, tw, h); g.fill();
        g.strokeStyle = borde; g.lineWidth = 2; g.stroke();
        g.fillStyle = '#fff'; g.fillText(txt, lx + fs * 0.4, ly);
    }
    async function imagenCircuito(cc) {
        const e = ec(cc.clave);
        const { c, g, lado } = await lienzoBase();
        const k = lado / 100, fs = Math.max(12, Math.round(lado / 46));
        const camino = new Path2D(curva(e.ruta));
        g.save(); g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round';
        g.strokeStyle = 'rgba(253,230,138,.55)'; g.lineWidth = 2.6; g.stroke(camino);
        g.strokeStyle = '#F59E0B'; g.lineWidth = 0.9; g.stroke(camino);
        for (let i = 1; i < e.ruta.length; i += 2) {   // flechas del sentido de la información
            const a = e.ruta[i - 1], b = e.ruta[i], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = 1.8;
            const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
            g.fillStyle = '#B45309';
            g.beginPath(); g.moveTo(m[0] + Math.cos(ang) * L, m[1] + Math.sin(ang) * L);
            g.lineTo(m[0] + Math.cos(ang + 2.5) * L, m[1] + Math.sin(ang + 2.5) * L);
            g.lineTo(m[0] + Math.cos(ang - 2.5) * L, m[1] + Math.sin(ang - 2.5) * L); g.fill();
        }
        g.restore();
        const a = e.ruta[0], b = e.ruta[e.ruta.length - 1];
        rotulo(g, lado, '→ ' + cc.receptor, a[0] * k + 2, (a[1] - 6) * k, '#F59E0B', 'izq');
        rotulo(g, lado, '← ' + cc.efector, b[0] * k + 2, (b[1] + 5) * k, '#F59E0B', 'izq');
        (e.ordenOk || []).forEach((kk, i) => {
            const p = e.pos[kk], pz = cc.piezas.find(x => x.clave === kk);
            g.fillStyle = color(kk); g.strokeStyle = '#fff'; g.lineWidth = 2;
            g.beginPath(); g.arc(p[0] * k, p[1] * k, fs * 0.6, 0, Math.PI * 2); g.fill(); g.stroke();
            rotulo(g, lado, `${i + 1}. ${pz ? pz.nombre : kk}`, p[0] * k + fs * 1.2, p[1] * k - fs * 1.4, color(kk), 'izq');
        });
        return c.toDataURL('image/jpeg', 0.8);
    }
    async function imagenCortes() {
        const { c, g, lado } = await lienzoBase();
        const k = lado / 100, fs = Math.max(14, Math.round(lado / 40));
        casos.forEach((_, i) => {
            const p = ek(i).pos;
            if (!p) return;
            g.fillStyle = '#DC2626'; g.strokeStyle = '#fff'; g.lineWidth = 2;
            g.beginPath(); g.arc(p[0] * k, p[1] * k, fs * 0.75, 0, Math.PI * 2); g.fill(); g.stroke();
            g.fillStyle = '#fff'; g.font = `bold ${fs}px Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillText(String(i + 1), p[0] * k, p[1] * k + 1);
            g.textAlign = 'start';
        });
        return c.toDataURL('image/jpeg', 0.8);
    }

    let guiaHecha = false, guiaPromesa = null;
    function guardarGuia() {
        if (guiaHecha) return guiaPromesa;
        guiaHecha = true;
        guiaPromesa = armarGuia();
        return guiaPromesa;
    }
    async function armarGuia() {
        const items = [];
        for (const cc of circuitos) {
            const e = ec(cc.clave);
            try {
                items.push({ src: await imagenCircuito(cc), titulo: `${cc.titulo} (${cc.sub})`,
                    pie: cc.receptor + ' → ' + (e.ordenOk || []).map(k => {
                        const pz = cc.piezas.find(x => x.clave === k);
                        return (pz ? pz.nombre : k) + ' (' + ((e.exp[k] || {}).zona || '').toLowerCase() + ')';
                    }).join(' → ') + ' → ' + cc.efector.toLowerCase() + '.' });
            } catch { /* sin imagen: queda el resto */ }
        }
        if (casos.length) {
            try { items.push({ src: await imagenCortes(), titulo: cortes.titulo || 'Cortes', pie: 'Los números corresponden a los casos de la tabla.' }); }
            catch { /* sin imagen */ }
        }
        const bloques = [{ t: 'imagenes', items }];
        bloques.push({ t: 'tabla', cab: ['Pregunta', 'Respuesta', 'Para recordar'],
                       filas: circuitos.flatMap(cc => cc.preguntas.map(q => [q.p, q.ops[q.ok], q.exp || ''])) });
        if (casos.length) bloques.push({ t: 'tabla', cab: ['Dónde se cortó', 'Caso', 'Para recordar'],
                       filas: casos.map((cs, i) => [`${i + 1}. ${ek(i).resp || ''}`, cs.caso, ek(i).exp || '']) });
        const rep = porRepasar();
        if (rep.length) bloques.push({ t: 'texto', txt: '↺ Por repasar: ' + rep.join(', ') + '.' });
        sumarAGuia(clave, {
            titulo: d.titulo, subtitulo: 'Los reflejos armados sobre mi captura, preguntas y casos', slug: d.slug,
            nota: `${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}`,
            bloques: bloques.concat(conexionGuia(tplCx)),
        });
    }

    function actualizar() {
        let hechos = 0, total = 0;
        circuitos.forEach(c => {
            const e = ec(c.clave);
            total += c.piezas.length + 1 + c.preguntas.length;
            hechos += c.piezas.filter(pz => e.ok[pz.clave]).length + (e.orden ? 1 : 0) + c.preguntas.filter((q, i) => (e.preg[i] || {}).ok).length;
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
    function verCierreVista() {
        const c0 = circuitos[circuitos.length - 1];
        ver = c0.clave; pintarVista(); ver = null;
    }

    raiz.querySelector('#nl-circ-reset')?.addEventListener('click', () => {
        if (Object.keys(est.c).length && !confirm('Esto borra tus reflejos y respuestas de este nivel. ¿Seguro?')) return;
        est = { c: {}, k: {}, err: 0 };
        guardar();
        guiaHecha = false; enRespuesta = null; casoOk = null;
        ver = secciones[0];
        selPieza = primeraSinUbicar(circDe(ver));
        pintar();
    });

    if (!actual() && est.listo) ver = null;
    else if (ver !== 'cortes' && ver) selPieza = primeraSinUbicar(circDe(ver));
    pintar();
}

if (RAIZ) iniciar(RAIZ);
