/**
 * NeuroLab — labeling.js
 * Identificación de estructuras en "mesa de trabajo": la imagen (ajustada al alto de
 * la pantalla) muestra sólo números y formas; todo se responde en el panel derecho.
 *
 * Por estructura:
 *   1. Nombre: se escribe de memoria (o "?" si no lo sabe). Se revela el correcto;
 *      si no coincide con un sinónimo conocido, el estudiante decide si era lo mismo.
 *   2. Función: alternativas (la correcta + 3 de otras estructuras), hasta acertar.
 * Verde = nombre y función bien; ámbar = función bien pero el nombre quedó por repasar.
 * Al completar: "Sumar a mi guía" y paso al nivel siguiente (con transición de imagen).
 *
 * Respuestas en api/labeling_check.php (no van en el HTML). Avance: localStorage nl_lab2_<slug>.
 * Con ?calibrar=1, un clic sobre la imagen muestra coordenadas en % (para labeling_parts).
 */
import { markDone, isDone } from './progress.js';
import { botonGuia } from './guia.js';

const RAIZ = document.getElementById('nl-lab');
const KEY_BASE = 'nl_lab2_';
const KEY_TRANS = 'nl_lab_transicion';

function leer(slug) {
    let e = null;
    try { e = JSON.parse(localStorage.getItem(KEY_BASE + slug) || 'null'); } catch { e = null; }
    if (!e || typeof e !== 'object') e = {};
    if (!e.partes) e.partes = {};
    if (!e.err) e.err = 0;
    return e;
}
function escribir(slug, estado) {
    try { localStorage.setItem(KEY_BASE + slug, JSON.stringify(estado)); } catch { /* modo privado */ }
}
function escapar(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
async function consultar(datos) {
    const body = Object.keys(datos).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(datos[k])).join('&');
    try {
        const res = await fetch('api/labeling_check.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body,
        });
        return await res.json();
    } catch { return { ok: false, error: 'No pudimos revisar tu respuesta. ¿Hay conexión?' }; }
}

function iniciar(raiz) {
    let partes = [];
    try { partes = JSON.parse(raiz.dataset.partes || '[]'); } catch { partes = []; }
    if (!partes.length) return;

    const slug     = raiz.dataset.slug || '';
    const titulo   = raiz.dataset.titulo || 'Partes de la neurona';
    const ruta     = new URLSearchParams(location.search).get('ruta') || '';
    const capa     = raiz.querySelector('#nl-lab-capa');
    const svg      = raiz.querySelector('.nl-lab__lineas');
    const canvas   = raiz.querySelector('#nl-lab-canvas');
    const panel    = raiz.querySelector('#nl-lab-feedback');
    const chips    = raiz.querySelector('#nl-lab-chips');
    const contador = raiz.querySelector('#nl-lab-contador');
    const errores  = raiz.querySelector('#nl-lab-errores');
    const btnReset = raiz.querySelector('#nl-lab-reset');
    const guiaBox  = raiz.querySelector('#nl-lab-guia');
    const fin      = raiz.querySelector('#nl-lab-fin');
    const resumen  = raiz.querySelector('#nl-lab-resumen');
    const btnSig   = raiz.querySelector('#nl-lab-sig');

    transicion(raiz, canvas, slug);

    // Nivel que exige completar el anterior
    const requiere = raiz.dataset.requiere || '';
    if (requiere && !isDone(requiere)) {
        raiz.classList.add('is-bloqueada');
        raiz.querySelector('.nl-lab__candado')?.removeAttribute('hidden');
        return;
    }

    let est = leer(slug);
    // est.activa = { id, n, a, r, nombreOk, opciones, mal } mientras se responde una estructura
    let sel = est.activa ? est.activa.id : (partes.find(p => !est.partes[p.id]) || partes[0]).id;
    const guardar = () => escribir(slug, est);

    /* --- Imagen: números + formas --- */
    function clase(id) {
        if (est.activa && est.activa.id === id) return ' is-activa';
        const s = est.partes[id];
        return s ? (s.nombreOk ? ' is-ok' : ' is-repasar') : '';
    }
    const anclas = p => [[p.x, p.y]].concat(p.f && p.f.t === 'puntos' ? p.f.v : []);

    function formaSVG(p) {
        if (!p.f) return '';
        const c = 'nl-lab__forma' + clase(p.id) + (p.id === sel ? ' is-sel' : '');
        const [a, b, cc, d] = p.f.v;
        if (p.f.t === 'elipse') {
            return `<ellipse cx="${a}" cy="${b}" rx="${cc}" ry="${d}" class="${c}" vector-effect="non-scaling-stroke"/>`;
        }
        if (p.f.t === 'corchete') {
            const dx = cc - a, dy = d - b, L = Math.hypot(dx, dy) || 1;
            const nx = -dy / L * 1.6, ny = dx / L * 1.6;
            return `<path d="M${a + nx} ${b + ny} L${a - nx} ${b - ny} M${a} ${b} L${cc} ${d} M${cc + nx} ${d + ny} L${cc - nx} ${d - ny}"
                          class="${c} nl-lab__corchete" vector-effect="non-scaling-stroke"/>`;
        }
        return '';
    }

    function pintarImagen() {
        capa.innerHTML = partes.map(p => anclas(p).map(([x, y]) =>
            `<button type="button" class="nl-lab__punto${clase(p.id)}${p.id === sel ? ' is-sel' : ''}" data-id="${p.id}"
                     style="left:${x}%;top:${y}%" aria-label="Estructura ${p.n}">${p.n}</button>`).join('')).join('');
        // Puntos múltiples de una misma estructura: unidos por una línea fina
        svg.innerHTML = partes.map(formaSVG).join('') + partes.filter(p => anclas(p).length > 1).map(p => {
            const [[x0, y0], ...resto] = anclas(p);
            return resto.map(([x, y]) => `<line x1="${x0}" y1="${y0}" x2="${x}" y2="${y}"
                class="nl-lab__linea${clase(p.id)}" vector-effect="non-scaling-stroke"/>`).join('');
        }).join('');
        capa.querySelectorAll('.nl-lab__punto').forEach(b =>
            b.addEventListener('click', () => seleccionar(Number(b.dataset.id))));
    }

    function pintarChips() {
        chips.innerHTML = partes.map(p => {
            const s = est.partes[p.id];
            const t = s ? escapar(s.n) : '';
            return `<button type="button" class="nl-lab__chip${clase(p.id)}${p.id === sel ? ' is-sel' : ''}" data-id="${p.id}"
                            title="${t || 'Estructura ' + p.n}">${p.n}</button>`;
        }).join('');
        chips.querySelectorAll('.nl-lab__chip').forEach(b =>
            b.addEventListener('click', () => seleccionar(Number(b.dataset.id))));
    }

    function seleccionar(id) {
        if (est.activa && est.activa.id !== id) {
            // Primero se termina la estructura en curso
            sel = est.activa.id;
            pintarTodo();
            const fb = panel.querySelector('.nl-lab__aviso-act') || panel.insertAdjacentElement('afterbegin',
                Object.assign(document.createElement('p'), { className: 'nl-lab__aviso-act' }));
            fb.textContent = 'Termina primero esta estructura (falta su función).';
            return;
        }
        sel = id;
        pintarTodo();
    }

    function pintarTodo() {
        pintarImagen();
        pintarChips();
        pintarPanel();
        actualizar();
    }

    /* --- Panel de trabajo --- */
    function pintarPanel() {
        if (completa() && !est.partes[sel]) sel = partes[0].id;
        const p = partes.find(x => x.id === sel);
        const s = est.partes[sel];
        if (est.activa && est.activa.id === sel) {
            if (est.activa.nombreOk === null) compararNombre(); else preguntarFuncion();
            return;
        }
        if (s) { mostrarFicha(sel); return; }
        panel.className = 'nl-lab__trabajo';
        panel.innerHTML = `
            <p class="nl-lab__paso"><span class="nl-lab__badge">${p.n}</span> ¿Qué estructura es?</p>
            <p class="nl-lab__ayuda">Escríbela de memoria y presiona <kbd>Enter</kbd>.</p>
            <div class="nl-lab__resp-fila">
                <input type="text" class="nl-lab__input" placeholder="Nombre de la estructura ${p.n}"
                       autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Nombre de la estructura ${p.n}">
                <button type="button" class="btn btn-primary btn-sm nl-lab__comprobar">Comprobar</button>
            </div>
            <button type="button" class="nl-lab__nose">No lo recuerdo</button>`;
        const inp = panel.querySelector('.nl-lab__input');
        const ir = () => probarNombre(p.id, inp.value.trim());
        inp.addEventListener('keydown', ev => { if (ev.key === 'Enter' && inp.value.trim()) { ev.preventDefault(); ir(); } });
        panel.querySelector('.nl-lab__comprobar').addEventListener('click', () => { if (inp.value.trim()) ir(); else inp.focus(); });
        panel.querySelector('.nl-lab__nose').addEventListener('click', () => probarNombre(p.id, ''));
        inp.focus({ preventScroll: true });
    }

    async function probarNombre(id, texto) {
        if (est.activa || est.partes[id]) return;
        panel.classList.add('is-esperando');
        const d = await consultar({ parte_id: id, accion: 'nombre', respuesta: texto });
        panel.classList.remove('is-esperando');
        if (!d || !d.ok) { aviso((d && d.error) || 'Intenta de nuevo.'); return; }
        // nombreOk: true = coincide · false = no sabía · null = el estudiante compara
        const nombreOk = d.correcto ? true : (texto === '' ? false : null);
        if (nombreOk === false) est.err++;
        est.activa = { id, n: d.nombre, a: d.alternativas || [], r: texto, nombreOk, opciones: d.opciones || [], mal: [] };
        guardar();
        pintarTodo();
    }

    function compararNombre() {
        const a = est.activa;
        const p = partes.find(x => x.id === a.id);
        panel.className = 'nl-lab__trabajo is-pregunta';
        panel.innerHTML =
            `<p class="nl-lab__paso"><span class="nl-lab__badge">${p.n}</span> Compara tu respuesta</p>
             <div class="nl-lab__comp">
                <div><span class="nl-lab__etq">Tú escribiste</span><span class="nl-lab__suya">${escapar(a.r)}</span></div>
                <div><span class="nl-lab__etq">Respuesta correcta</span><strong class="nl-lab__correcta">${escapar(a.n)}</strong>
                     ${a.a.length ? `<span class="nl-lab__alt">También: ${a.a.map(escapar).join(' · ')}</span>` : ''}</div>
             </div>
             <p class="nl-lab__q">¿Era lo mismo?</p>
             <div class="nl-lab__decision">
                <button type="button" class="btn btn-sm nl-lab__si">✓ Sí, con otras palabras</button>
                <button type="button" class="btn btn-sm nl-lab__no">✗ No, me equivoqué</button>
             </div>`;
        panel.querySelector('.nl-lab__si').addEventListener('click', () => decidirNombre(true));
        panel.querySelector('.nl-lab__no').addEventListener('click', () => decidirNombre(false));
    }

    function decidirNombre(ok) {
        if (!est.activa) return;
        est.activa.nombreOk = ok;
        if (!ok) est.err++;
        guardar();
        pintarTodo();
    }

    function preguntarFuncion() {
        const a = est.activa;
        const p = partes.find(x => x.id === a.id);
        panel.className = 'nl-lab__trabajo is-pregunta';
        panel.innerHTML =
            `<p class="nl-lab__paso"><span class="nl-lab__badge">${p.n}</span> ${escapar(a.n)}
                <span class="nl-lab__estado-nombre ${a.nombreOk ? 'ok' : 'rep'}">${a.nombreOk ? '✓ nombre' : '↺ nombre por repasar'}</span></p>
             ${!a.nombreOk && a.a.length ? `<p class="nl-lab__alt">También: ${a.a.map(escapar).join(' · ')}</p>` : ''}
             <p class="nl-lab__q">¿Cuál es su <strong>función</strong>?</p>
             <div class="nl-lab__alts">
               ${a.opciones.map((o, i) => `
                 <button type="button" class="nl-lab__alt-btn${a.mal.includes(i) ? ' is-mal' : ''}" data-i="${i}"${a.mal.includes(i) ? ' disabled' : ''}>
                   <span class="nl-lab__alt-letra">${String.fromCharCode(65 + i)}</span><span>${escapar(o)}</span>
                 </button>`).join('')}
             </div>
             <p class="nl-lab__q-fb" aria-live="polite">${a.mal.length ? '✗ Esa función corresponde a otra estructura. Intenta de nuevo.' : ''}</p>`;
        panel.querySelectorAll('.nl-lab__alt-btn').forEach(b =>
            b.addEventListener('click', () => probarFuncion(Number(b.dataset.i), b)));
    }

    async function probarFuncion(i, btn) {
        const a = est.activa;
        if (!a || btn.disabled) return;
        btn.classList.add('is-esperando');
        const d = await consultar({ parte_id: a.id, accion: 'funcion', respuesta: a.opciones[i] });
        btn.classList.remove('is-esperando');
        if (!d || !d.ok) { aviso((d && d.error) || 'Intenta de nuevo.'); return; }
        if (!d.correcto) {
            est.err++;
            a.mal.push(i);
            guardar();
            preguntarFuncion();
            actualizar();
            panel.querySelector('.nl-lab__alts')?.classList.add('is-sacude');
            return;
        }
        est.partes[a.id] = { n: d.nombre, f: d.funcion, d: d.detalle, a: d.alternativas || [], nombreOk: !!a.nombreOk, r: a.r, errF: a.mal.length };
        est.activa = null;
        guardar();
        pintarTodo();
        if (!completa()) mostrarFicha(a.id, '🎯 ¡Función correcta!');
    }

    function mostrarFicha(id, encabezado) {
        const s = est.partes[id];
        const p = partes.find(x => x.id === id);
        if (!s || !p) return;
        const sig = partes.find(x => !est.partes[x.id] && x.id !== id);
        panel.className = 'nl-lab__trabajo ' + (s.nombreOk ? 'is-ok' : 'is-repasar');
        panel.innerHTML =
            `${encabezado ? `<p class="nl-lab__bien">${encabezado}</p>` : ''}
             <p class="nl-lab__paso"><span class="nl-lab__badge">${p.n}</span> ${escapar(s.n)}</p>
             ${s.a && s.a.length ? `<p class="nl-lab__alt">También: ${s.a.map(escapar).join(' · ')}</p>` : ''}
             ${!s.nombreOk ? `<p class="nl-lab__tuya">↺ Nombre por repasar${s.r ? ' (escribiste: ' + escapar(s.r) + ')' : ''}</p>` : ''}
             <p class="nl-lab__funcion"><span class="nl-lab__etq">Función</span> ${escapar(s.f)}</p>
             ${s.d && s.d !== s.f ? `<p class="nl-lab__detalle">${escapar(s.d)}</p>` : ''}
             ${sig ? `<button type="button" class="btn btn-primary btn-sm nl-lab__sig">Siguiente: estructura ${sig.n} →</button>` : ''}`;
        panel.querySelector('.nl-lab__sig')?.addEventListener('click', () => seleccionar(sig.id));
    }

    function aviso(txt) {
        const p = document.createElement('p');
        p.className = 'nl-lab__aviso-act';
        p.textContent = txt;
        panel.prepend(p);
    }

    const completa = () => partes.every(p => est.partes[p.id]);
    const porRepasar = () => partes.filter(p => est.partes[p.id] && !est.partes[p.id].nombreOk);

    function resumenHTML() {
        const rep = porRepasar();
        return `🎉 <strong>¡Completaste las ${partes.length} estructuras!</strong>
            ${est.err ? `Tuviste ${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}.` : 'Sin ningún error.'}
            ${rep.length ? `<span class="nl-lab__alt">Nombres por repasar: ${rep.map(p => p.n + '. ' + escapar(est.partes[p.id].n)).join(' · ')}</span>` : ''}
            <span class="nl-lab__alt">Toca cualquier número para repasar su función.</span>`;
    }

    function seccionGuia() {
        return {
            titulo,
            subtitulo: 'Identificación de estructuras y su función',
            slug,
            nota: `${partes.length} estructuras · ${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}`,
            bloques: [{
                t: 'tabla',
                cab: ['Nº', 'Estructura', 'Función', 'Para recordar'],
                filas: partes.map(p => {
                    const s = est.partes[p.id];
                    return [String(p.n) + (s.nombreOk ? '' : ' ↺'), s.n, s.f, s.d && s.d !== s.f ? s.d : ''];
                }),
            }].concat(porRepasar().length ? [{ t: 'texto',
                txt: '↺ Nombres por repasar: ' + porRepasar().map(p => est.partes[p.id].n).join(', ') + '.' }] : []),
        };
    }

    function actualizar() {
        const hechas = partes.filter(p => est.partes[p.id]).length;
        if (contador) contador.textContent = hechas + ' / ' + partes.length;
        if (errores) errores.textContent = est.err ? `${est.err} ${est.err === 1 ? 'error' : 'errores'}` : '';
        raiz.classList.toggle('is-completa', hechas === partes.length);
        if (hechas === partes.length) {
            if (slug) markDone(slug);
            fin.hidden = false;
            resumen.innerHTML = resumenHTML();
            botonGuia(guiaBox, slug, seccionGuia);
            const sig = raiz.dataset.siguiente;
            if (sig) {
                btnSig.hidden = false;
                btnSig.href = 'actividad.php?slug=' + encodeURIComponent(sig) + (ruta ? '&ruta=' + encodeURIComponent(ruta) : '');
                btnSig.onclick = () => {
                    try { sessionStorage.setItem(KEY_TRANS, JSON.stringify({ a: sig, img: canvas.querySelector('img')?.src })); } catch { /* */ }
                };
            }
        } else {
            fin.hidden = true;
        }
    }

    btnReset?.addEventListener('click', () => {
        if ((Object.keys(est.partes).length || est.activa) && !confirm('Esto borra todas tus respuestas de esta actividad. ¿Seguro?')) return;
        est = { partes: {}, err: 0 };
        sel = partes[0].id;
        guardar();
        pintarTodo();
    });

    pintarTodo();
    if (completa()) mostrarFicha(sel);

    if (new URLSearchParams(location.search).get('calibrar') === '1') calibrar(canvas, raiz);
}

/** Al llegar desde el nivel anterior: la imagen anterior se funde con la nueva. */
function transicion(raiz, canvas, slug) {
    let t = null;
    try { t = JSON.parse(sessionStorage.getItem(KEY_TRANS) || 'null'); sessionStorage.removeItem(KEY_TRANS); } catch { t = null; }
    if (!t || t.a !== slug || !t.img) return;
    const prev = document.createElement('img');
    prev.src = t.img;
    prev.className = 'nl-lab__img-prev';
    prev.alt = '';
    canvas.appendChild(prev);
    canvas.classList.add('is-transicion');
    setTimeout(() => prev.classList.add('is-fuera'), 350);
    setTimeout(() => { prev.remove(); canvas.classList.remove('is-transicion'); }, 1900);
}

/** Modo docente: clic sobre la imagen -> coordenadas en % para labeling_parts. */
function calibrar(canvas, raiz) {
    const caja = document.createElement('pre');
    caja.className = 'nl-lab__calibrar';
    caja.textContent = 'Modo calibrar: clic sobre la imagen = coordenadas (x_pct, y_pct).\n';
    raiz.querySelector('.nl-mesa__panel')?.appendChild(caja);
    canvas.addEventListener('click', ev => {
        if (ev.target.closest('.nl-lab__punto')) return;
        const r = canvas.getBoundingClientRect();
        caja.textContent += `\n${((ev.clientX - r.left) / r.width * 100).toFixed(1)}, ${((ev.clientY - r.top) / r.height * 100).toFixed(1)}`;
    });
}

if (RAIZ) iniciar(RAIZ);
