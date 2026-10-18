/**
 * NeuroLab — rompecabezas.js
 * Nivel «rompecabezas» de una lámina: sobre un tablero (imagen con una parte fija, p. ej. la médula)
 * el estudiante pone cada pieza en su lugar: toca la pieza y luego dónde va, o la arrastra (mouse o dedo).
 * Con `huecos` el tablero muestra la silueta punteada de cada pieza: también vale tocar primero el hueco y
 * después la pieza, y cualquier punto de la silueta es correcto. Con `grupos` las piezas salen por etapas
 * (p. ej. primero el lado sensitivo y después el motor).
 * El lugar de cada pieza no va al navegador: se revisa en api/circuito_check.php (accion=pieza), que
 * devuelve su caja al acertar. Luego, preguntas. Avance en localStorage (nl_rompe_<clave>).
 * Al completar: markDone(clave) y la sección (imagen armada + piezas + preguntas) va a la guía.
 */
import { markDone, bloqueado } from './progress.js';
import { sumarAGuia, urlGuia } from './guia.js';
import { conexionGuia } from './carrera.js';

const RAIZ = document.getElementById('nl-rompe');
const MAX_GUIA = 900;

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const angosta = () => window.matchMedia('(max-width: 900px)').matches;
function barajar(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}
function cargar(src) {
    return new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
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

function iniciar(raiz) {
    const d = raiz.dataset;
    let piezas = [], preguntas = [];
    try { piezas = JSON.parse(d.piezas || '[]'); } catch { piezas = []; }
    try { preguntas = JSON.parse(d.preguntas || '[]'); } catch { preguntas = []; }
    const clave = d.clave, KEY = 'nl_rompe_' + clave;
    const huecos = !!d.huecos;
    let grupos = null;
    try { grupos = JSON.parse(d.grupos || 'null'); } catch { grupos = null; }
    const ordenGrupos = grupos ? Object.keys(grupos) : [];
    const ruta = new URLSearchParams(location.search).get('ruta') || '';
    const vista = raiz.querySelector('#nl-rompe-vista');
    const panel = raiz.querySelector('#nl-rompe-trabajo');
    const pasosEl = raiz.querySelector('#nl-rompe-pasos');
    const contador = raiz.querySelector('#nl-rompe-contador');
    const errores = raiz.querySelector('#nl-rompe-errores');
    const instr = raiz.querySelector('#nl-mesa-instr');
    const tplCx = document.getElementById('nl-conexion-tpl');

    if (bloqueado(d.requiere)) {
        raiz.classList.add('is-bloqueada');
        raiz.querySelector('.nl-lab__candado')?.removeAttribute('hidden');
        return;
    }

    let est = null;
    try { est = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { est = null; }
    if (!est || typeof est !== 'object') est = {};
    est.ok = est.ok || {}; est.mal = est.mal || {}; est.exp = est.exp || {}; est.preg = est.preg || {}; est.err = est.err || 0;
    const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(est)); } catch { /* sin espacio */ } };
    if (instr && !Object.keys(est.ok).length) instr.open = true;

    const armado = () => piezas.every(p => est.ok[p.clave]);
    const paso = () => !armado() ? 'armar' : !est.listo ? 'preguntas' : 'listo';
    // Grupo en curso: el primero con piezas sin poner (sin grupos, todas las piezas a la vez)
    const grupoActual = () => ordenGrupos.find(g => piezas.some(p => p.grupo === g && !est.ok[p.clave])) || null;
    const visibles = () => {
        if (!grupos) return piezas;
        const iG = ordenGrupos.indexOf(grupoActual());
        return piezas.filter(p => iG < 0 || ordenGrupos.indexOf(p.grupo) <= iG);
    };
    const primeraLibre = () => huecos ? null : (visibles().find(p => !est.ok[p.clave])?.clave || null);
    let sel = primeraLibre();
    let aviso = '', ocupado = false, enRespuesta = null, marca = null;   // marca: último punto mal puesto
    let pendiente = null;   // hueco tocado antes de elegir la pieza

    /* ---------------- Vista: tablero + piezas puestas ---------------- */
    function pintarVista() {
        const p = paso();
        vista.innerHTML = `<div class="nl-lam__lienzo nl-rompe__tablero${p === 'armar' && sel ? ' is-poner' : ''}" id="nl-rompe-tablero">
              <img src="${esc(d.tablero)}" alt="Tablero del rompecabezas" draggable="false">
              ${piezas.filter(pz => est.ok[pz.clave]).map(pz => {
                  const [x, y, w, h] = est.ok[pz.clave];
                  return `<img class="nl-rompe__puesta" src="${esc(pz.img)}" alt="${esc(pz.nombre)}" draggable="false"
                            style="left:${x}%;top:${y}%;width:${w}%;height:${h}%">`;
              }).join('')}
              ${marca ? `<span class="nl-rompe__marca" style="left:${marca[0]}%;top:${marca[1]}%">✗</span>` : ''}
              ${pendiente ? `<span class="nl-rompe__marca is-pendiente" style="left:${pendiente[0]}%;top:${pendiente[1]}%">?</span>` : ''}
            </div>
            <p class="nl-lam__ayuda-vista">${p === 'armar' ? (sel ? `Toca dónde va: <strong>${esc(nombre(sel))}</strong> (o arrástrala desde el panel)`
                    : pendiente ? 'Ahora elige en el panel <strong>qué pieza va en ese hueco</strong>'
                    : huecos ? 'Toca un hueco punteado o elige una pieza en el panel' : 'Elige una pieza en el panel')
                : 'Tu arco reflejo armado'}</p>`;
        const tab = vista.querySelector('#nl-rompe-tablero');
        tab.addEventListener('click', ev => {
            if (paso() !== 'armar' || ocupado || (!sel && !huecos)) return;
            const r = tab.querySelector('img').getBoundingClientRect();
            const x = (ev.clientX - r.left) / r.width * 100, y = (ev.clientY - r.top) / r.height * 100;
            if (x < 0 || x > 100 || y < 0 || y > 100) return;
            if (sel) poner(sel, [x, y]);
            else if (huecos) {
                pendiente = [x, y]; marca = null; pintar();
                if (angosta()) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    const nombre = k => (piezas.find(p => p.clave === k) || {}).nombre || k;

    async function poner(k, xy) {
        if (instr) instr.open = false;
        ocupado = true; pendiente = null;
        const r = await revisar({ slug: d.slug, n: d.n, accion: 'pieza', pieza: k, x: xy[0].toFixed(1), y: xy[1].toFixed(1) });
        ocupado = false;
        if (r.red) { aviso = r.feedback; pintar(); return; }
        if (r.correcto) {
            est.ok[k] = r.caja;
            est.exp[k] = { exp: r.exp || '', e: (est.mal[k] || []).length };
            marca = null;
            sel = primeraLibre();
        } else {
            est.mal[k] = (est.mal[k] || []).concat([r.feedback]);
            est.err++;
            marca = xy;
        }
        guardar();
        pintar();
    }

    /* Arrastrar una pieza desde el panel hasta el tablero (mouse o dedo) */
    function enlazarArrastre(btn) {
        btn.addEventListener('pointerdown', ev => {
            if (paso() !== 'armar' || ocupado || est.ok[btn.dataset.clave]) return;
            const k = btn.dataset.clave, pz = piezas.find(p => p.clave === k);
            const ini = [ev.clientX, ev.clientY];
            let fantasma = null;
            const mover = e => {
                if (!fantasma && Math.hypot(e.clientX - ini[0], e.clientY - ini[1]) > 8) {
                    const tab = vista.querySelector('#nl-rompe-tablero img');
                    fantasma = document.createElement('img');
                    fantasma.src = pz.img; fantasma.className = 'nl-rompe__fantasma';
                    fantasma.style.width = (tab ? tab.getBoundingClientRect().width * pz.w / 100 : 160) + 'px';
                    document.body.appendChild(fantasma);
                    sel = k; pintarPanel();
                }
                if (fantasma) { fantasma.style.left = e.clientX + 'px'; fantasma.style.top = e.clientY + 'px'; e.preventDefault(); }
            };
            const soltar = e => {
                document.removeEventListener('pointermove', mover);
                document.removeEventListener('pointerup', soltar);
                if (!fantasma) return;   // fue un toque: lo maneja el click
                fantasma.remove();
                const r = vista.querySelector('#nl-rompe-tablero img').getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
                if (x >= 0 && x <= 100 && y >= 0 && y <= 100) poner(k, [x, y]);
            };
            document.addEventListener('pointermove', mover, { passive: false });
            document.addEventListener('pointerup', soltar);
        });
    }

    /* ---------------- Panel ---------------- */
    function pintarPasos() {
        const iP = ['armar', 'preguntas', 'listo'].indexOf(paso());
        pasosEl.innerHTML = ['Armar', 'Preguntas'].map((t, i) => `<li class="${i < iP ? 'is-ok' : i === iP ? 'is-actual' : ''}">${t}</li>`).join('');
    }
    const bloque = (etq, txt, extra) => `<div class="nl-ficha__bloque${extra ? ' nl-ficha__bloque--extra' : ''}"><span class="nl-ficha__etq">${esc(etq)}</span><p>${esc(txt)}</p></div>`;

    function pintarPanel() {
        const av = aviso ? `<p class="nl-lab__aviso-act">${esc(aviso)}</p>` : '';
        aviso = '';
        panel.className = 'nl-lab__trabajo is-pregunta';
        const p = paso();
        if (p === 'armar') {
            const malSel = sel && !est.ok[sel] ? (est.mal[sel] || []) : [];
            const g = grupoActual();
            panel.innerHTML = `${av}
                <p class="nl-lab__paso"><span class="nl-lab__badge">1</span> ${grupos && g ? esc(grupos[g]) : 'Arma el arco reflejo'}</p>
                <p class="nl-lab__ayuda">${huecos ? (pendiente ? '<strong>¿Qué pieza va en el hueco que tocaste?</strong>' : 'Toca un hueco y luego su pieza, o toca la pieza y luego su hueco. También puedes arrastrarla.')
                    : 'Toca una pieza y luego su lugar en el tablero, o arrástrala.'} La médula ya está puesta.</p>
                <div class="nl-rompe__bandeja">${visibles().map(pz => {
                    const ok = !!est.ok[pz.clave];
                    return `<button type="button" class="nl-rompe__pieza${ok ? ' is-ok' : ''}${pz.clave === sel ? ' is-sel' : ''}" data-clave="${esc(pz.clave)}"${ok ? ' disabled' : ''}>
                        <span class="nl-rompe__mini"><img src="${esc(pz.img)}" alt="" draggable="false"></span>
                        <strong>${ok ? '✓ ' : ''}${esc(pz.nombre)}</strong></button>`;
                }).join('')}</div>
                ${malSel.length ? `<p class="nl-lab__q-fb">✗ ${esc(malSel[malSel.length - 1])}</p>` : ''}
                ${piezas.filter(pz => est.ok[pz.clave]).map(pz => bloque(pz.nombre, est.exp[pz.clave].exp)).join('')}`;
            panel.querySelectorAll('.nl-rompe__pieza:not([disabled])').forEach(b => {
                b.addEventListener('click', () => {
                    if (pendiente) { const xy = pendiente; sel = b.dataset.clave; poner(b.dataset.clave, xy); return; }
                    sel = b.dataset.clave; marca = null; pintar();
                    if (angosta()) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
                enlazarArrastre(b);
            });
            return;
        }
        if (enRespuesta != null) { mostrarRespuesta(enRespuesta); return; }
        if (p === 'listo') { mostrarCierre(); return; }
        const iq = preguntas.findIndex((q, i) => !(est.preg[i] || {}).ok);
        if (iq < 0) { est.listo = true; guardar(); pintar(); return; }
        const q = preguntas[iq];
        const r = est.preg[iq] || (est.preg[iq] = { mal: [], orden: barajar(q.ops.length) });
        panel.innerHTML = `${av}
            <p class="nl-lab__paso"><span class="nl-lab__badge">2</span> Pregunta ${iq + 1} de ${preguntas.length}</p>
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
            r.ok = true; guardar(); enRespuesta = iq; pintarPanel(); actualizar();
        }));
    }

    function mostrarRespuesta(iq) {
        const q = preguntas[iq], r = est.preg[iq], ultima = iq === preguntas.length - 1;
        panel.className = 'nl-lab__trabajo ' + (r.mal.length ? 'is-repasar' : 'is-ok');
        panel.innerHTML = `
            <p class="nl-lab__paso"><span class="nl-lab__badge">2</span> Pregunta ${iq + 1} de ${preguntas.length}
               <span class="nl-tip__logro">${r.mal.length ? '✓ con pista' : '🎯 al primer intento'}</span></p>
            <p class="nl-lab__q">${esc(q.p)}</p>
            ${bloque('Respuesta', q.ops[q.ok])}${q.exp ? bloque('Para recordar', q.exp, true) : ''}
            <div class="nl-ficha__acciones"><button type="button" class="btn btn-primary btn-sm nl-lab__sig">${ultima ? 'Terminar el nivel →' : 'Siguiente pregunta →'}</button></div>`;
        panel.querySelector('.nl-lab__sig').addEventListener('click', () => {
            enRespuesta = null;
            if (ultima) { est.listo = true; guardar(); }
            pintar();
        });
    }

    const porRepasar = () => piezas.filter(pz => (est.mal[pz.clave] || []).length).map(pz => 'ubicar ' + pz.nombre.toLowerCase())
        .concat(preguntas.map((q, i) => ((est.preg[i] || {}).mal || []).length ? 'pregunta ' + (i + 1) : '').filter(Boolean));

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
            ${piezas.map(pz => bloque(pz.nombre, (est.exp[pz.clave] || {}).exp || '')).join('')}
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
    async function imagenArmada() {
        const base = await cargar(d.tablero);
        const W = Math.min(MAX_GUIA, base.width), H = Math.round(W * base.height / base.width);
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const g = c.getContext('2d');
        g.drawImage(base, 0, 0, W, H);
        for (const pz of piezas) {
            const caja = est.ok[pz.clave];
            if (!caja) continue;
            const im = await cargar(pz.img);
            g.drawImage(im, caja[0] * W / 100, caja[1] * H / 100, caja[2] * W / 100, caja[3] * H / 100);
        }
        return c.toDataURL('image/jpeg', 0.82);
    }
    let guiaHecha = false, guiaPromesa = null;
    function guardarGuia() {
        if (guiaHecha) return guiaPromesa;
        guiaHecha = true;
        guiaPromesa = (async () => {
            const bloques = [];
            try { bloques.push({ t: 'imagenes', items: [{ src: await imagenArmada(), titulo: 'Mi arco reflejo', pie: piezas.map(p => p.nombre).join(' · ') + ' y médula espinal.' }] }); }
            catch { /* sin imagen */ }
            bloques.push({ t: 'tabla', cab: ['Pieza', 'Qué hace'], filas: piezas.map(pz => [pz.nombre, (est.exp[pz.clave] || {}).exp || '']) });
            if (preguntas.length) bloques.push({ t: 'tabla', cab: ['Pregunta', 'Respuesta', 'Para recordar'], filas: preguntas.map(q => [q.p, q.ops[q.ok], q.exp || '']) });
            const rep = porRepasar();
            if (rep.length) bloques.push({ t: 'texto', txt: '↺ Por repasar: ' + rep.join(', ') + '.' });
            sumarAGuia(clave, { titulo: d.titulo, subtitulo: 'El arco reflejo armado pieza por pieza', slug: d.slug,
                nota: `${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}`, bloques: bloques.concat(conexionGuia(tplCx)) });
        })();
        return guiaPromesa;
    }

    function actualizar() {
        const hechos = piezas.filter(pz => est.ok[pz.clave]).length + preguntas.filter((q, i) => (est.preg[i] || {}).ok).length;
        contador.textContent = hechos + ' / ' + (piezas.length + preguntas.length);
        errores.textContent = est.err ? `${est.err} ${est.err === 1 ? 'error' : 'errores'}` : '';
        if (est.listo) {
            markDone(clave);
            if (!d.siguiente) markDone(d.slug);
            guardarGuia();
        }
    }
    function pintar() { pintarVista(); pintarPasos(); pintarPanel(); actualizar(); }

    raiz.querySelector('#nl-rompe-reset')?.addEventListener('click', () => {
        if (Object.keys(est.ok).length && !confirm('Esto desarma tu rompecabezas y borra tus respuestas de este nivel. ¿Seguro?')) return;
        est = { ok: {}, mal: {}, exp: {}, preg: {}, err: 0 };
        guardar(); guiaHecha = false; enRespuesta = null; marca = null; pendiente = null;
        sel = primeraLibre();
        pintar();
    });
    pintar();
}

if (RAIZ) iniciar(RAIZ);
