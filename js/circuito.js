/**
 * NeuroLab — circuito.js
 * Nivel «circuito» de una lámina: el estudiante arma un circuito sobre SU captura de un nivel anterior
 * (la imagen y las etiquetas que puso quedan en nl_lam_<clave base>). Tres pasos en el panel:
 *   1. Ubicar   -> elige una neurona y toca su lugar; la zona es la etiqueta suya más cercana
 *   2. Conectar -> toca las neuronas en el orden en que viaja la información; al acertar se dibuja
 *                  el recorrido (receptor → … → músculo) con un impulso animado
 *   3. Preguntas-> alternativas; la incorrecta queda en rojo con su pista, hasta acertar
 * Zonas y orden se revisan en api/circuito_check.php. Avance en localStorage (nl_circ_<clave>).
 * Al completar: markDone(clave) y la sección (captura con el circuito + preguntas) se guarda en la guía.
 */
import { markDone, bloqueado } from './progress.js';
import { sumarAGuia, urlGuia } from './guia.js';
import { conexionGuia } from './carrera.js';

const RAIZ = document.getElementById('nl-circ');
const COLORES = ['#38BDF8', '#2DD4BF', '#E879F9', '#FCD34D'];   // una por neurona, en el orden del circuito
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

/** Puntos del recorrido: receptor → neuronas en orden → músculo (en % de la imagen). */
function recorrido(pos, orden, centro) {
    const pts = orden.map(k => pos[k]).filter(Boolean);
    if (pts.length < 2) return pts;
    const c = centro || [50, 50];
    const afuera = (p, largo) => {
        let dx = p[0] - c[0], dy = p[1] - c[1];
        const m = Math.hypot(dx, dy) || 1;
        dx /= m; dy /= m;
        return [Math.min(92, Math.max(8, p[0] + dx * largo)), Math.min(94, Math.max(6, p[1] + dy * largo))];
    };
    return [afuera(pts[0], 16)].concat(pts, [afuera(pts[pts.length - 1], 16)]);
}

function iniciar(raiz) {
    const d = raiz.dataset;
    let piezas = [], preguntas = [], base = {};
    try { piezas = JSON.parse(d.piezas || '[]'); } catch { piezas = []; }
    try { preguntas = JSON.parse(d.preguntas || '[]'); } catch { preguntas = []; }
    try { base = JSON.parse(d.base || '{}'); } catch { base = {}; }
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
    const color = k => COLORES[Math.max(0, piezas.findIndex(p => p.clave === k)) % COLORES.length];
    const nombre = k => (piezas.find(p => p.clave === k) || {}).nombre || k;

    if (bloqueado(d.requiere)) {
        raiz.classList.add('is-bloqueada');
        raiz.querySelector('.nl-lab__candado')?.removeAttribute('hidden');
        return;
    }

    // Captura del nivel base (imagen y etiquetas del estudiante)
    const capBase = (leerJSON('nl_lam_' + base.clave, {}).caps || {})[base.captura] || {};
    if (!capBase.img || !capBase.pines || !Object.keys(capBase.pines).length) {
        vista.innerHTML = `<p class="nl-lam__ayuda-vista">No encontramos tu captura del nivel anterior en este navegador.</p>`;
        panel.innerHTML = `<p class="nl-lab__paso">Falta tu captura</p>
            <p>Este nivel se arma sobre la captura etiquetada del nivel I. Ábrelo en este mismo navegador y complétalo (o «Cambiar la captura» si la borraste).</p>`;
        return;
    }
    const pines = capBase.pines;
    const centro = pines[base.centro] || null;

    let est = leerJSON(KEY, null);
    if (!est || typeof est !== 'object') est = {};
    est.pos = est.pos || {}; est.ok = est.ok || {}; est.mal = est.mal || {}; est.exp = est.exp || {};
    est.seq = est.seq || []; est.preg = est.preg || {}; est.err = est.err || 0;
    const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(est)); } catch { /* sin espacio */ } };
    if (instr && !Object.keys(est.pos).length) instr.open = true;

    let selPieza = piezas.find(p => !est.ok[p.clave])?.clave || null;
    let aviso = '';
    let ocupado = false;
    let enRespuesta = null;     // índice de la pregunta recién acertada (muestra su explicación)

    const ubicadas = () => piezas.every(p => est.ok[p.clave]);
    const paso = () => !ubicadas() ? 'ubicar' : !est.orden ? 'conectar' : !est.listo ? 'preguntas' : 'listo';

    /* ---------------- Vista: captura + neuronas + recorrido ---------------- */
    function svgRecorrido(animado) {
        if (!est.orden) return '';
        const pts = recorrido(est.pos, est.ordenOk || [], centro);
        if (pts.length < 2) return '';
        const dpath = 'M' + pts.map(p => p[0] + ' ' + p[1]).join(' L');
        return `<svg class="nl-circ__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="${dpath}" class="nl-circ__halo"/>
            <path d="${dpath}" class="nl-circ__ruta${animado ? ' is-animada' : ''}" pathLength="100"/>
            ${animado ? `<circle r="1.4" class="nl-circ__impulso"><animateMotion dur="2.6s" repeatCount="indefinite" path="${dpath}"/></circle>` : ''}
        </svg>`;
    }
    function pintarVista() {
        const p = paso();
        const extremos = est.orden ? (() => {
            const pts = recorrido(est.pos, est.ordenOk || [], centro);
            const a = pts[0], b = pts[pts.length - 1];
            return `<span class="nl-circ__fin" style="left:${a[0]}%;top:${a[1]}%">Receptor</span>
                    <span class="nl-circ__fin" style="left:${b[0]}%;top:${b[1]}%">Músculo</span>`;
        })() : '';
        vista.innerHTML = `<div class="nl-lam__lienzo nl-circ__lienzo${p === 'ubicar' && selPieza ? ' is-poner' : ''}${p !== 'ubicar' ? ' is-armado' : ''}" id="nl-circ-lienzo">
              <img src="${capBase.img}" alt="Tu captura de la médula" draggable="false">
              ${Object.entries(pines).map(([t, [x, y]]) =>
                  `<span class="nl-lam__pin nl-circ__etq${x > 62 ? ' is-izq' : ''}" style="left:${x}%;top:${y}%"><i></i><b>${esc(t)}</b></span>`).join('')}
              ${svgRecorrido(!!est.orden)}
              ${extremos}
              ${piezas.filter(pz => est.pos[pz.clave]).map(pz => {
                  const [x, y] = est.pos[pz.clave];
                  const i = est.seq.indexOf(pz.clave);
                  const cls = est.ok[pz.clave] ? ' is-ok' : ' is-mal';
                  return `<button type="button" class="nl-circ__neu${cls}${p === 'conectar' ? ' is-tocable' : ''}${i >= 0 ? ' is-elegida' : ''}"
                            data-clave="${esc(pz.clave)}" style="left:${x}%;top:${y}%;--c:${color(pz.clave)}" title="${esc(pz.nombre)}">
                            <span class="nl-circ__ico">${iconos[pz.clave] || ''}</span>
                            ${i >= 0 && !est.orden ? `<span class="nl-circ__num">${i + 1}</span>` : ''}
                            <span class="nl-circ__nom">${esc(pz.nombre)}</span></button>`;
              }).join('')}
            </div>
            <p class="nl-lam__ayuda-vista">${p === 'ubicar' ? (selPieza ? `Toca dónde va: <strong>${esc(nombre(selPieza))}</strong>` : 'Elige una neurona en el panel')
                : p === 'conectar' ? 'Toca las neuronas <strong>en el orden en que viaja la información</strong>, desde el receptor'
                : 'Este es tu circuito reflejo: el impulso va del receptor al músculo'}</p>`;
        const lz = vista.querySelector('#nl-circ-lienzo');
        lz.addEventListener('click', ev => {
            const neu = ev.target.closest('.nl-circ__neu');
            if (paso() === 'conectar' && neu) { tocarNeurona(neu.dataset.clave); return; }
            if (paso() !== 'ubicar' || !selPieza || ocupado) return;
            const r = lz.querySelector('img').getBoundingClientRect();
            const x = (ev.clientX - r.left) / r.width * 100, y = (ev.clientY - r.top) / r.height * 100;
            if (x < 0 || x > 100 || y < 0 || y > 100) return;
            ubicar(selPieza, [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
        });
    }

    /** Etiqueta del estudiante más cercana a un punto (en px de la imagen, no en %). */
    function zonaDe([x, y]) {
        const img = vista.querySelector('img');
        const ar = img && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
        let mejor = '', dmin = Infinity;
        Object.entries(pines).forEach(([t, [px, py]]) => {
            const dd = Math.hypot((px - x) * ar, py - y);
            if (dd < dmin) { dmin = dd; mejor = t; }
        });
        return mejor;
    }

    async function ubicar(k, xy) {
        if (instr) instr.open = false;
        ocupado = true;
        est.pos[k] = xy;
        delete est.ok[k];
        pintarVista();
        const r = await revisar({ slug: d.slug, n: d.n, accion: 'ubicar', pieza: k, zona: zonaDe(xy) });
        ocupado = false;
        if (r.red) { aviso = r.feedback; pintar(); return; }
        if (r.correcto) {
            est.ok[k] = true;
            est.exp[k] = { exp: r.exp || '', zona: r.zona || '', e: (est.mal[k] || []).length };
            selPieza = piezas.find(p => !est.ok[p.clave])?.clave || null;
        } else {
            est.mal[k] = (est.mal[k] || []).concat([r.feedback]);
            est.err++;
        }
        guardar();
        pintar();
    }

    async function tocarNeurona(k) {
        if (ocupado || est.seq.includes(k)) return;
        est.seq.push(k);
        pintarVista();
        if (est.seq.length < piezas.length) { pintarPanel(); return; }
        ocupado = true;
        const r = await revisar({ slug: d.slug, n: d.n, accion: 'orden', orden: JSON.stringify(est.seq) });
        ocupado = false;
        if (r.red) { est.seq = []; aviso = r.feedback; pintar(); return; }
        if (r.correcto) {
            est.orden = true;
            est.ordenOk = est.seq.slice();
            est.ordenExp = r.feedback || '';
        } else {
            est.ordenMal = (est.ordenMal || 0) + 1;
            est.err++;
            aviso = '✗ Ese orden no es. ' + (r.feedback || '');
            est.seq = [];
        }
        guardar();
        pintar();
    }

    /* ---------------- Panel ---------------- */
    function pintarPasos() {
        const orden = ['ubicar', 'conectar', 'preguntas'];
        const iP = paso() === 'listo' ? 3 : orden.indexOf(paso());
        pasosEl.innerHTML = ['Ubicar', 'Conectar', 'Preguntas'].map((t, i) =>
            `<li class="${i < iP ? 'is-ok' : i === iP ? 'is-actual' : ''}">${t}</li>`).join('');
    }

    function pintarPanel() {
        const av = aviso ? `<p class="nl-lab__aviso-act">${esc(aviso)}</p>` : '';
        aviso = '';
        const p = paso();
        panel.className = 'nl-lab__trabajo is-pregunta';

        if (p === 'ubicar') {
            const sel = piezas.find(x => x.clave === selPieza);
            const malSel = sel ? (est.mal[sel.clave] || []) : [];
            const ultimoMal = sel && !est.ok[sel.clave] && est.pos[sel.clave] && malSel.length ? malSel[malSel.length - 1] : '';
            panel.innerHTML = `${av}
                <p class="nl-lab__paso"><span class="nl-lab__badge">1</span> Ubica cada neurona en tu captura</p>
                <p class="nl-lab__ayuda">Elige una neurona y toca su lugar en la imagen. Se revisa con tus etiquetas del nivel I.</p>
                <div class="nl-circ__piezas">${piezas.map(pz => {
                    const ok = est.ok[pz.clave];
                    return `<button type="button" class="nl-circ__pieza${ok ? ' is-ok' : ''}${pz.clave === selPieza ? ' is-sel' : ''}" data-clave="${esc(pz.clave)}" style="--c:${color(pz.clave)}">
                        <span class="nl-circ__ico">${iconos[pz.clave] || ''}</span>
                        <span><strong>${ok ? '✓ ' : ''}${esc(pz.nombre)}</strong>${pz.detalle ? `<small>${esc(pz.detalle)}</small>` : ''}</span></button>`;
                }).join('')}</div>
                ${ultimoMal ? `<p class="nl-lab__q-fb">✗ ${esc(ultimoMal)}</p>` : ''}
                ${piezas.filter(pz => est.ok[pz.clave]).map(pz => `
                    <div class="nl-ficha__bloque"><span class="nl-ficha__etq">${esc(pz.nombre)} · ${esc(est.exp[pz.clave].zona)}</span><p>${esc(est.exp[pz.clave].exp)}</p></div>`).join('')}`;
            panel.querySelectorAll('.nl-circ__pieza').forEach(b => b.addEventListener('click', () => {
                selPieza = b.dataset.clave; pintar();
                if (angosta()) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }));
            return;
        }

        if (p === 'conectar') {
            panel.innerHTML = `${av}
                <p class="nl-lab__paso"><span class="nl-lab__badge">2</span> Conecta el circuito</p>
                <p class="nl-lab__ayuda">Toca en la imagen las ${piezas.length} neuronas en el orden en que viaja la información, empezando por la que recibe del receptor.</p>
                <p class="nl-circ__seq">${est.seq.length ? est.seq.map((k, i) => `<span style="--c:${color(k)}">${i + 1}. ${esc(nombre(k))}</span>`).join(' → ') : '<em>Aún no tocas ninguna</em>'}</p>
                ${est.seq.length ? '<button type="button" class="nl-lab__nose nl-circ__borrar">Borrar y empezar el orden de nuevo</button>' : ''}`;
            panel.querySelector('.nl-circ__borrar')?.addEventListener('click', () => { est.seq = []; guardar(); pintar(); });
            return;
        }

        if (enRespuesta != null) { mostrarRespuesta(enRespuesta); return; }
        if (p === 'listo') { mostrarCierre(); return; }

        // Preguntas: una a la vez
        const iq = preguntas.findIndex((q, i) => !(est.preg[i] || {}).ok);
        if (iq < 0) { est.listo = true; guardar(); pintar(); return; }
        const q = preguntas[iq];
        const r = est.preg[iq] || (est.preg[iq] = { mal: [], orden: barajar(q.ops.length) });
        panel.innerHTML = `${av}
            ${est.ordenExp && iq === 0 && !r.mal.length ? `<div class="nl-ficha__bloque"><span class="nl-ficha__etq">✓ Tu circuito</span><p>${esc(est.ordenExp)}</p></div>` : ''}
            <p class="nl-lab__paso"><span class="nl-lab__badge">3</span> Pregunta ${iq + 1} de ${preguntas.length}</p>
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
            pintarPanel();
        }));
    }

    function mostrarRespuesta(iq) {
        const q = preguntas[iq];
        const r = est.preg[iq];
        const ultima = iq === preguntas.length - 1;
        panel.className = 'nl-lab__trabajo ' + (r.mal.length ? 'is-repasar' : 'is-ok');
        panel.innerHTML = `
            <p class="nl-lab__paso"><span class="nl-lab__badge">3</span> Pregunta ${iq + 1} de ${preguntas.length}
               <span class="nl-tip__logro">${r.mal.length ? '✓ con pista' : '🎯 al primer intento'}</span></p>
            <p class="nl-lab__q">${esc(q.p)}</p>
            <div class="nl-ficha__bloque"><span class="nl-ficha__etq">Respuesta</span><p>${esc(q.ops[q.ok])}</p></div>
            ${q.exp ? `<div class="nl-ficha__bloque nl-ficha__bloque--extra"><span class="nl-ficha__etq">Para recordar</span><p>${esc(q.exp)}</p></div>` : ''}
            <div class="nl-ficha__acciones">
                <button type="button" class="btn btn-primary btn-sm nl-lab__sig">${ultima ? 'Terminar el nivel →' : 'Siguiente pregunta →'}</button>
            </div>`;
        panel.querySelector('.nl-lab__sig').addEventListener('click', () => {
            enRespuesta = null;
            if (ultima) { est.listo = true; guardar(); }
            pintar();
        });
    }

    const porRepasar = () => {
        const rep = piezas.filter(pz => (est.mal[pz.clave] || []).length).map(pz => 'ubicar ' + pz.nombre.toLowerCase());
        if (est.ordenMal) rep.push('el orden del circuito');
        preguntas.forEach((q, i) => { if ((est.preg[i] || {}).mal?.length) rep.push('pregunta ' + (i + 1)); });
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
            <p class="nl-guia-ok">✓ Guardado en tu guía de estudio · <a href="${urlGuia()}">Ver guía</a></p>`;
        panel.querySelectorAll('.nl-lab__sig-nivel, .nl-guia-ok a').forEach(a => a.addEventListener('click', async ev => {
            if (!guiaPromesa) return;
            ev.preventDefault();
            try { await guiaPromesa; } catch { /* igual se sigue */ }
            location.href = a.href;
        }));
    }

    /* ---------------- Guía ---------------- */
    async function imagenGuia() {
        const img = await cargar(capBase.img);
        const k = Math.min(1, MAX_GUIA / img.width);
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0, c.width, c.height);
        const X = p => c.width * p[0] / 100, Y = p => c.height * p[1] / 100;
        const fs = Math.max(12, Math.round(c.width / 48));
        const pts = recorrido(est.pos, est.ordenOk || [], centro);
        // Recorrido con flechas
        g.lineCap = 'round'; g.lineJoin = 'round';
        g.strokeStyle = 'rgba(253,230,138,.55)'; g.lineWidth = fs * 0.9;
        g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(X(p), Y(p)) : g.moveTo(X(p), Y(p))); g.stroke();
        g.strokeStyle = '#F59E0B'; g.lineWidth = Math.max(3, fs / 4);
        g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(X(p), Y(p)) : g.moveTo(X(p), Y(p))); g.stroke();
        for (let i = 1; i < pts.length; i++) {      // punta de flecha a mitad de cada tramo
            const a = [X(pts[i - 1]), Y(pts[i - 1])], b = [X(pts[i]), Y(pts[i])];
            const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = fs * 0.9;
            g.fillStyle = '#F59E0B';
            g.beginPath(); g.moveTo(m[0] + Math.cos(ang) * L, m[1] + Math.sin(ang) * L);
            g.lineTo(m[0] + Math.cos(ang + 2.5) * L, m[1] + Math.sin(ang + 2.5) * L);
            g.lineTo(m[0] + Math.cos(ang - 2.5) * L, m[1] + Math.sin(ang - 2.5) * L); g.fill();
        }
        g.font = `bold ${fs}px Arial, sans-serif`; g.textBaseline = 'middle';
        const rotulo = (txt, x, y, fondo, borde) => {
            const tw = g.measureText(txt).width + fs * 0.8, h = fs * 1.5;
            const lx = Math.min(Math.max(x - tw / 2, 2), c.width - tw - 2), ly = Math.min(Math.max(y, h / 2 + 2), c.height - h / 2 - 2);
            g.fillStyle = fondo;
            g.beginPath(); if (g.roundRect) g.roundRect(lx, ly - h / 2, tw, h, h / 2); else g.rect(lx, ly - h / 2, tw, h); g.fill();
            if (borde) { g.strokeStyle = borde; g.lineWidth = 2; g.stroke(); }
            g.fillStyle = '#fff'; g.fillText(txt, lx + fs * 0.4, ly);
        };
        rotulo('Receptor', X(pts[0]), Y(pts[0]), 'rgba(26,14,46,.85)', '#F59E0B');
        rotulo('Músculo', X(pts[pts.length - 1]), Y(pts[pts.length - 1]), 'rgba(26,14,46,.85)', '#F59E0B');
        (est.ordenOk || []).forEach((kk, i) => {
            const p = est.pos[kk];
            g.fillStyle = color(kk); g.strokeStyle = '#fff'; g.lineWidth = 2;
            g.beginPath(); g.arc(X(p), Y(p), fs * 0.6, 0, Math.PI * 2); g.fill(); g.stroke();
            rotulo(`${i + 1}. ${nombre(kk)}`, X(p), Y(p) - fs * 1.6, 'rgba(26,14,46,.88)', color(kk));
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
        const bloques = [];
        try {
            bloques.push({ t: 'imagenes', items: [{ src: await imagenGuia(), titulo: 'Mi circuito reflejo',
                pie: 'Receptor → ' + (est.ordenOk || []).map(k => nombre(k) + ' (' + ((est.exp[k] || {}).zona || '').toLowerCase() + ')').join(' → ') + ' → músculo.' }] });
        } catch { /* sin imagen: queda el resto */ }
        bloques.push({ t: 'tabla', cab: ['Neurona', 'Dónde está', 'Para recordar'],
                       filas: (est.ordenOk || []).map(k => [nombre(k), (est.exp[k] || {}).zona || '', (est.exp[k] || {}).exp || '']) });
        bloques.push({ t: 'tabla', cab: ['Pregunta', 'Respuesta', 'Para recordar'], filas: preguntas.map(q => [q.p, q.ops[q.ok], q.exp || '']) });
        const rep = porRepasar();
        if (rep.length) bloques.push({ t: 'texto', txt: '↺ Por repasar: ' + rep.join(', ') + '.' });
        sumarAGuia(clave, {
            titulo: d.titulo, subtitulo: 'El circuito armado sobre mi captura y preguntas', slug: d.slug,
            nota: `${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}`,
            bloques: bloques.concat(conexionGuia(tplCx)),
        });
    }

    function actualizar() {
        const hechos = piezas.filter(pz => est.ok[pz.clave]).length + (est.orden ? 1 : 0)
            + preguntas.filter((q, i) => (est.preg[i] || {}).ok).length;
        const total = piezas.length + 1 + preguntas.length;
        contador.textContent = hechos + ' / ' + total;
        errores.textContent = est.err ? `${est.err} ${est.err === 1 ? 'error' : 'errores'}` : '';
        if (est.listo) {
            markDone(clave);
            if (!d.siguiente) markDone(d.slug);
            guardarGuia();
        }
    }

    function pintar() {
        pintarVista();
        pintarPasos();
        pintarPanel();
        actualizar();
    }

    raiz.querySelector('#nl-circ-reset')?.addEventListener('click', () => {
        if (Object.keys(est.pos).length && !confirm('Esto borra tu circuito y tus respuestas de este nivel. ¿Seguro?')) return;
        est = { pos: {}, ok: {}, mal: {}, exp: {}, seq: [], preg: {}, err: 0 };
        guardar();
        guiaHecha = false; enRespuesta = null;
        selPieza = piezas[0]?.clave || null;
        pintar();
    });

    pintar();
}

if (RAIZ) iniciar(RAIZ);
