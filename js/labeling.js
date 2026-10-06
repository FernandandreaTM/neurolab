/**
 * NeuroLab — labeling.js
 * Actividad de identificación sobre una imagen, en dos pasos por estructura:
 *   1. Nombre: se escribe de memoria (o "?" si no lo sabe). Se revela el correcto;
 *      si no coincide con un sinónimo conocido, el estudiante decide si era lo mismo.
 *   2. Función: pregunta de alternativas (la correcta + 3 de otras estructuras),
 *      que se repite hasta acertar.
 * Verde = nombre y función bien; ámbar = función bien pero el nombre quedó por repasar.
 * Al completar todas, se puede sumar la tabla Estructura | Función a "Mi guía".
 *
 * Las respuestas se revisan en api/labeling_check.php (no van en el HTML).
 * Avance en localStorage (nl_lab2_<slug>).
 * Con ?calibrar=1 en la URL, un clic sobre la imagen muestra sus coordenadas en %.
 */
import { markDone, isDone } from './progress.js';
import { botonGuia } from './guia.js';

const RAIZ = document.getElementById('nl-lab');
const KEY_BASE = 'nl_lab2_';

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
    const capa     = raiz.querySelector('#nl-lab-capa');
    const svg      = raiz.querySelector('.nl-lab__lineas');
    const canvas   = raiz.querySelector('#nl-lab-canvas');
    const panel    = raiz.querySelector('#nl-lab-feedback');
    const contador = raiz.querySelector('#nl-lab-contador');
    const errores  = raiz.querySelector('#nl-lab-errores');
    const btnReset = raiz.querySelector('#nl-lab-reset');
    const guiaBox  = raiz.querySelector('#nl-lab-guia');
    const angosto  = window.matchMedia('(max-width: 760px)');

    // Nivel que exige completar otro antes
    const requiere = raiz.dataset.requiere || '';
    if (requiere && !isDone(requiere)) {
        raiz.classList.add('is-bloqueada');
        raiz.querySelector('.nl-lab__candado')?.removeAttribute('hidden');
        return;
    }

    let est = leer(slug);
    // est.activa = { id, n, a, r, nombreOk, opciones, mal } mientras se responde una estructura
    let lista = null;

    const guardar = () => escribir(slug, est);
    const lista_ok = () => partes.filter(p => est.partes[p.id]);

    /* --- Marcadores y líneas --- */
    function clase(id) {
        if (est.activa && est.activa.id === id) return ' is-activa';
        const s = est.partes[id];
        return s ? (s.nombreOk ? ' is-ok' : ' is-repasar') : '';
    }

    /** Puntos donde termina la línea del recuadro: el principal y, si hay, los extra. */
    function anclas(p) {
        const extra = p.f && p.f.t === 'puntos' ? p.f.v : [];
        return [[p.x, p.y]].concat(extra);
    }

    /** Contorno o corchete de una estructura general (SVG en % de la imagen). */
    function formaSVG(p) {
        if (!p.f) return '';
        const c = 'nl-lab__forma' + clase(p.id);
        const [a, b, cc, d] = p.f.v;
        if (p.f.t === 'elipse') {
            return `<ellipse cx="${a}" cy="${b}" rx="${cc}" ry="${d}" class="${c}" vector-effect="non-scaling-stroke"/>`;
        }
        if (p.f.t === 'corchete') {
            // Línea a lo largo de la estructura con topes en ambos extremos: |———|
            const dx = cc - a, dy = d - b, L = Math.hypot(dx, dy) || 1;
            const nx = -dy / L * 1.6, ny = dx / L * 1.6;
            return `<path d="M${a + nx} ${b + ny} L${a - nx} ${b - ny} M${a} ${b} L${cc} ${d} M${cc + nx} ${d + ny} L${cc - nx} ${d - ny}"
                          class="${c} nl-lab__corchete" vector-effect="non-scaling-stroke"/>`;
        }
        return '';
    }

    function pintarCanvas() {
        capa.innerHTML = partes.map(p => anclas(p).map(([x, y]) =>
            `<span class="nl-lab__punto${p.f ? ' es-' + p.f.t : ''}${clase(p.id)}" style="left:${x}%;top:${y}%" aria-hidden="true">${p.n}</span>`).join('')).join('');
        svg.innerHTML = partes.map(formaSVG).join('') + partes.map(p => anclas(p)
            .filter(([x, y]) => p.bx !== x || p.by !== y)
            .map(([x, y]) => `<line x1="${p.bx}" y1="${p.by}" x2="${x}" y2="${y}"
                             class="nl-lab__linea${clase(p.id)}" vector-effect="non-scaling-stroke" />`).join('')).join('');
    }

    function campoHTML(p) {
        const num = `<span class="nl-lab__num">${p.n}</span>`;
        const s = est.partes[p.id];
        if (s) {
            return `<button type="button" class="nl-lab__campo nl-lab__ver${clase(p.id)}" data-id="${p.id}"
                            title="Ver su función">${num}<span class="nl-lab__ok">${escapar(s.n)} ${s.nombreOk ? '✓' : '↺'}</span></button>`;
        }
        if (est.activa && est.activa.id === p.id) {
            return `<button type="button" class="nl-lab__campo nl-lab__ver is-activa" data-id="${p.id}"
                            title="Continuar">${num}<span class="nl-lab__ok">${escapar(est.activa.n)}</span>
                            <span class="nl-lab__falta">¿función?</span></button>`;
        }
        const bloq = est.activa ? ' disabled' : '';
        return `<div class="nl-lab__campo" data-id="${p.id}">${num}
                    <input type="text" class="nl-lab__input" data-id="${p.id}"
                           placeholder="¿Qué es?" aria-label="Estructura ${p.n}"
                           autocomplete="off" autocapitalize="off" spellcheck="false"${bloq}>
                    <button type="button" class="nl-lab__nose" data-id="${p.id}" title="No sé"${bloq}>?</button>
                </div>`;
    }

    function render() {
        pintarCanvas();
        const enLista = angosto.matches;
        raiz.classList.toggle('is-lista', enLista);
        capa.querySelectorAll('.nl-lab__slot').forEach(el => el.remove());
        if (lista) { lista.remove(); lista = null; }
        if (enLista) {
            lista = document.createElement('div');
            lista.className = 'nl-lab__lista';
            lista.innerHTML = partes.map(campoHTML).join('');
            canvas.insertAdjacentElement('afterend', lista);
        } else {
            capa.insertAdjacentHTML('beforeend', partes.map(p =>
                `<div class="nl-lab__slot" style="left:${p.bx}%;top:${p.by}%">${campoHTML(p)}</div>`).join(''));
        }
        raiz.querySelectorAll('.nl-lab__input').forEach(inp =>
            inp.addEventListener('keydown', ev => {
                if (ev.key === 'Enter' && inp.value.trim()) { ev.preventDefault(); probarNombre(Number(inp.dataset.id), inp.value.trim(), inp); }
            }));
        raiz.querySelectorAll('.nl-lab__nose').forEach(btn =>
            btn.addEventListener('click', () => probarNombre(Number(btn.dataset.id), '', btn)));
        raiz.querySelectorAll('.nl-lab__ver').forEach(btn =>
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                if (est.activa && est.activa.id === id) siguientePaso();
                else mostrarFicha(id);
            }));
        actualizar();
    }

    /* --- Paso 1: nombre escrito de memoria --- */
    async function probarNombre(id, texto, el) {
        if (est.activa || est.partes[id]) return;
        const campo = el.closest('.nl-lab__campo');
        campo?.classList.add('is-esperando');
        const d = await consultar({ parte_id: id, accion: 'nombre', respuesta: texto });
        campo?.classList.remove('is-esperando');
        if (!d || !d.ok) { aviso((d && d.error) || 'Intenta de nuevo.'); return; }

        // nombreOk: true = coincide · false = no sabía · null = el estudiante debe comparar
        let nombreOk = d.correcto ? true : (texto === '' ? false : null);
        if (nombreOk === false) est.err++;
        est.activa = { id, n: d.nombre, a: d.alternativas || [], r: texto, nombreOk, opciones: d.opciones || [], mal: [] };
        guardar();
        render();
        siguientePaso();
    }

    /** Muestra lo que corresponde a la estructura activa: comparar el nombre o la pregunta de función. */
    function siguientePaso() {
        const a = est.activa;
        if (!a) return;
        if (a.nombreOk === null) compararNombre();
        else preguntarFuncion();
    }

    function compararNombre() {
        const a = est.activa;
        const p = partes.find(x => x.id === a.id);
        panel.className = 'nl-lab__feedback is-pregunta';
        panel.innerHTML =
            `<div class="nl-lab__comp">
                <div><span class="nl-lab__etq">Tu respuesta (${p.n})</span>
                     <span class="nl-lab__suya">${escapar(a.r)}</span></div>
                <div><span class="nl-lab__etq">Respuesta correcta</span>
                     <strong class="nl-lab__correcta">${escapar(a.n)}</strong>
                     ${a.a.length ? `<span class="nl-lab__alt">También: ${a.a.map(escapar).join(' · ')}</span>` : ''}</div>
             </div>
             <div class="nl-lab__decision">
                <span>¿Era lo mismo?</span>
                <button type="button" class="btn btn-sm nl-lab__si">✓ Sí, con otras palabras</button>
                <button type="button" class="btn btn-sm nl-lab__no">✗ No, me equivoqué</button>
             </div>`;
        panel.querySelector('.nl-lab__si').addEventListener('click', () => decidirNombre(true));
        panel.querySelector('.nl-lab__no').addEventListener('click', () => decidirNombre(false));
        panel.querySelector('.nl-lab__si').focus({ preventScroll: true });
    }

    function decidirNombre(ok) {
        if (!est.activa) return;
        est.activa.nombreOk = ok;
        if (!ok) est.err++;
        guardar();
        actualizar();
        preguntarFuncion();
    }

    /* --- Paso 2: función --- */
    function preguntarFuncion() {
        const a = est.activa;
        if (!a) return;
        const p = partes.find(x => x.id === a.id);
        panel.className = 'nl-lab__feedback is-pregunta';
        panel.innerHTML =
            `<p class="nl-lab__q"><span class="nl-lab__etq">${a.nombreOk ? '✓ ¡Bien! Es' : '↺ Era'} · ${p.n}. ${escapar(a.n)}</span>
                Ahora, ¿cuál es su <strong>función</strong>?</p>
             <div class="nl-lab__alts">
               ${a.opciones.map((o, i) => `
                 <button type="button" class="nl-lab__alt-btn${a.mal.includes(i) ? ' is-mal' : ''}" data-i="${i}"${a.mal.includes(i) ? ' disabled' : ''}>
                   <span class="nl-lab__alt-letra">${String.fromCharCode(65 + i)}</span><span>${escapar(o)}</span>
                 </button>`).join('')}
             </div>`;
        panel.querySelectorAll('.nl-lab__alt-btn').forEach(b =>
            b.addEventListener('click', () => probarFuncion(Number(b.dataset.i), b)));
        panel.querySelector('.nl-lab__alt-btn:not([disabled])')?.focus({ preventScroll: true });
        if (angosto.matches) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
            actualizar();
            btn.classList.add('is-mal');
            btn.disabled = true;
            const fb = panel.querySelector('.nl-lab__q-fb') || panel.appendChild(Object.assign(document.createElement('p'), { className: 'nl-lab__q-fb' }));
            fb.textContent = '✗ Esa función corresponde a otra estructura. Piensa en qué hace esta parte e intenta de nuevo.';
            return;
        }
        est.partes[a.id] = { n: d.nombre, f: d.funcion, d: d.detalle, a: d.alternativas || [], nombreOk: !!a.nombreOk, r: a.r, errF: a.mal.length };
        est.activa = null;
        guardar();
        render();
        if (!completa()) mostrarFicha(a.id, '🎯 <strong>¡Función correcta!</strong>');
        enfocarSiguiente(a.id);
    }

    function mostrarFicha(id, encabezado) {
        const s = est.partes[id];
        const p = partes.find(x => x.id === id);
        if (!s || !p) return;
        panel.className = 'nl-lab__feedback ' + (s.nombreOk ? 'is-ok' : 'is-repasar');
        panel.innerHTML =
            `${encabezado ? encabezado + ' ' : ''}<strong>${p.n}. ${escapar(s.n)}</strong>
             ${!s.nombreOk ? `<span class="nl-lab__tuya">Nombre por repasar${s.r ? ' (escribiste: ' + escapar(s.r) + ')' : ''}</span>` : ''}
             ${s.a && s.a.length ? `<span class="nl-lab__alt">También: ${s.a.map(escapar).join(' · ')}</span>` : ''}
             <p class="nl-lab__funcion"><span class="nl-lab__etq">Función</span> ${escapar(s.f)}</p>
             ${s.d && s.d !== s.f ? `<p class="nl-lab__detalle">${escapar(s.d)}</p>` : ''}`;
    }

    function aviso(txt) {
        panel.className = 'nl-lab__feedback is-aviso';
        panel.textContent = txt;
    }

    function enfocarSiguiente(idResuelto) {
        const orden = partes.map(p => p.id);
        const desde = orden.indexOf(idResuelto);
        const resto = orden.slice(desde + 1).concat(orden.slice(0, desde + 1));
        for (const id of resto) {
            const el = raiz.querySelector(`.nl-lab__input[data-id="${id}"]`);
            if (el) { el.focus({ preventScroll: true }); return; }
        }
    }

    function completa() { return partes.every(p => est.partes[p.id]); }

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

    function porRepasar() { return partes.filter(p => est.partes[p.id] && !est.partes[p.id].nombreOk); }

    function actualizar() {
        const hechas = lista_ok().length;
        if (contador) contador.textContent = hechas + ' / ' + partes.length;
        if (errores) errores.textContent = est.err ? `${est.err} ${est.err === 1 ? 'error' : 'errores'}` : '';
        raiz.classList.toggle('is-completa', hechas === partes.length);

        if (hechas === partes.length) {
            panel.className = 'nl-lab__feedback is-ok';
            const rep = porRepasar();
            panel.innerHTML = `🎉 <strong>¡Completaste las ${partes.length} estructuras!</strong> ` +
                (est.err ? `Tuviste ${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}.` : 'Sin ningún error.') +
                (rep.length ? `<span class="nl-lab__alt">Nombres por repasar: ${rep.map(p => p.n + '. ' + escapar(est.partes[p.id].n)).join(' · ')}</span>` : '') +
                `<span class="nl-lab__alt">Toca cualquier estructura para repasar su función.</span>`;
            if (slug) markDone(slug);
            if (guiaBox) { guiaBox.hidden = false; botonGuia(guiaBox, slug, seccionGuia); }
        } else if (guiaBox) {
            guiaBox.hidden = true;
        }
    }

    btnReset?.addEventListener('click', () => {
        if ((lista_ok().length || est.activa) && !confirm('Esto borra todas tus respuestas de esta actividad. ¿Seguro?')) return;
        est = { partes: {}, err: 0 };
        guardar();
        panel.className = 'nl-lab__feedback';
        panel.textContent = '';
        render();
    });

    angosto.addEventListener('change', render);
    render();
    if (est.activa) siguientePaso();

    if (new URLSearchParams(location.search).get('calibrar') === '1') calibrar(canvas, panel);
}

/** Modo docente: clic sobre la imagen -> coordenadas en % para labeling_parts. */
function calibrar(canvas, panel) {
    const caja = document.createElement('pre');
    caja.className = 'nl-lab__calibrar';
    caja.textContent = 'Modo calibrar: haz clic sobre la estructura (x_pct, y_pct) y luego donde va su recuadro (box_x_pct, box_y_pct).\n';
    panel.insertAdjacentElement('afterend', caja);
    let n = 0;
    canvas.addEventListener('click', ev => {
        if (ev.target.closest('.nl-lab__campo')) return;
        const r = canvas.getBoundingClientRect();
        const x = ((ev.clientX - r.left) / r.width * 100).toFixed(1);
        const y = ((ev.clientY - r.top) / r.height * 100).toFixed(1);
        n++;
        caja.textContent += (n % 2 ? `\nPunto: ${x}, ${y}` : `   Recuadro: ${x}, ${y}`);
    });
}

if (RAIZ) iniciar(RAIZ);
