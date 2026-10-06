/**
 * NeuroLab — labeling.js
 * Actividad de identificación: sobre la imagen hay un rectángulo por cada parte
 * y el estudiante escribe ahí el nombre de la estructura que tiene debajo.
 *
 *   · correcto  -> el rectángulo queda verde, fijo y ya no se puede editar
 *   · incorrecto-> se pone rojo, muestra una pista y deja volver a intentarlo
 *
 * Las respuestas NO viajan al navegador: cada intento se revisa en
 * api/labeling_check.php. Lo acertado se guarda en localStorage, así el avance
 * sobrevive a una recarga y queda disponible para la actividad siguiente.
 */
import { markDone } from './progress.js';

const RAIZ = document.getElementById('nl-lab');

/* ---------------------------------------------------------------
   Estado persistente
   --------------------------------------------------------------- */
const KEY_BASE = 'nl_labeling_';

export function getLabelingState(slug) {
    try {
        return JSON.parse(localStorage.getItem(KEY_BASE + slug) || '{}');
    } catch { return {}; }
}

function guardar(slug, estado) {
    try {
        localStorage.setItem(KEY_BASE + slug, JSON.stringify(estado));
    } catch { /* modo privado: el avance sigue en memoria */ }
    document.dispatchEvent(new CustomEvent('nl:labeling', {
        detail: { slug, resueltas: Object.keys(estado).length },
    }));
}

/* ---------------------------------------------------------------
   Componente
   --------------------------------------------------------------- */
function iniciar(raiz) {
    let partes = [];
    try { partes = JSON.parse(raiz.dataset.partes || '[]'); } catch { partes = []; }
    if (!partes.length) return;

    const slug      = raiz.dataset.slug || '';
    const capa      = raiz.querySelector('#nl-lab-capa');
    const svg       = raiz.querySelector('.nl-lab__lineas');
    const canvas    = raiz.querySelector('#nl-lab-canvas');
    const feedback  = raiz.querySelector('#nl-lab-feedback');
    const contador  = raiz.querySelector('#nl-lab-contador');
    const btnReset  = raiz.querySelector('#nl-lab-reset');

    let resueltas = getLabelingState(slug);
    let lista     = null;   // contenedor de los inputs en modo angosto
    const angosto = window.matchMedia('(max-width: 760px)');

    /* --- Marcadores y líneas sobre la imagen --- */
    function pintarCanvas() {
        capa.innerHTML = partes.map(p => {
            const ok = !!resueltas[p.id];
            return `<span class="nl-lab__punto${ok ? ' is-ok' : ''}"
                          style="left:${p.x}%;top:${p.y}%" data-n="${p.n}"
                          aria-hidden="true">${p.n}</span>`;
        }).join('');

        svg.innerHTML = partes
            .filter(p => p.bx !== p.x || p.by !== p.y)
            .map(p => `<line x1="${p.bx}" y1="${p.by}" x2="${p.x}" y2="${p.y}"
                             class="nl-lab__linea${resueltas[p.id] ? ' is-ok' : ''}"
                             vector-effect="non-scaling-stroke" />`)
            .join('');
    }

    /* --- Un rectángulo (input o respuesta fija) --- */
    function campoHTML(p) {
        const nombre = resueltas[p.id];
        if (nombre) {
            return `<div class="nl-lab__campo is-ok" data-id="${p.id}">
                        <span class="nl-lab__num">${p.n}</span>
                        <span class="nl-lab__ok" title="Correcto">${escapar(nombre)}</span>
                    </div>`;
        }
        return `<div class="nl-lab__campo" data-id="${p.id}">
                    <span class="nl-lab__num">${p.n}</span>
                    <input type="text" class="nl-lab__input"
                           id="nl-lab-in-${p.id}" data-id="${p.id}"
                           placeholder="¿Qué parte es?"
                           aria-label="Parte ${p.n}"
                           autocomplete="off" autocapitalize="off" spellcheck="false">
                </div>`;
    }

    /* --- Dibuja todo según el ancho disponible --- */
    function render() {
        pintarCanvas();

        const enLista = angosto.matches;
        raiz.classList.toggle('is-lista', enLista);

        // limpiamos los campos anteriores de ambos modos
        capa.querySelectorAll('.nl-lab__campo').forEach(el => el.remove());
        if (lista) { lista.remove(); lista = null; }

        if (enLista) {
            lista = document.createElement('div');
            lista.className = 'nl-lab__lista';
            lista.innerHTML = partes.map(campoHTML).join('');
            canvas.insertAdjacentElement('afterend', lista);
        } else {
            capa.insertAdjacentHTML('beforeend', partes.map(p =>
                `<div class="nl-lab__slot" style="left:${p.bx}%;top:${p.by}%">${campoHTML(p)}</div>`
            ).join(''));
        }

        enlazar();
        actualizarContador();
    }

    function enlazar() {
        raiz.querySelectorAll('.nl-lab__input').forEach(input => {
            input.addEventListener('keydown', ev => {
                if (ev.key === 'Enter') { ev.preventDefault(); revisar(input); }
            });
            input.addEventListener('input', () => {
                const campo = input.closest('.nl-lab__campo');
                campo.classList.remove('is-mal');
            });
            input.addEventListener('blur', () => {
                if (input.value.trim()) revisar(input);
            });
        });
    }

    /* --- Revisión contra el servidor --- */
    async function revisar(input) {
        const id    = Number(input.dataset.id);
        const campo = input.closest('.nl-lab__campo');
        const texto = input.value.trim();
        if (!texto || campo.classList.contains('is-ok') || campo.dataset.enviando) return;

        campo.dataset.enviando = '1';
        campo.classList.add('is-esperando');

        let datos;
        try {
            const res = await fetch('api/labeling_check.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                body: 'parte_id=' + encodeURIComponent(id) + '&respuesta=' + encodeURIComponent(texto),
            });
            datos = await res.json();
        } catch {
            datos = { correcto: false, feedback: 'No pudimos revisar la respuesta. ¿Hay conexión?' };
        }

        delete campo.dataset.enviando;
        campo.classList.remove('is-esperando');

        if (datos && datos.correcto) {
            resueltas[id] = datos.nombre;
            guardar(slug, resueltas);
            decir(datos.feedback, 'ok', datos.nombre);
            render();
            enfocarSiguiente(id);
        } else {
            campo.classList.add('is-mal');
            decir(datos ? datos.feedback : 'Intenta de nuevo.', 'mal');
            input.select();
            input.focus();
        }
    }

    /** Tras acertar, deja el cursor en el siguiente rectángulo pendiente. */
    function enfocarSiguiente(idResuelto) {
        const orden = partes.map(p => p.id);
        const desde = orden.indexOf(idResuelto);
        const resto = orden.slice(desde + 1).concat(orden.slice(0, desde + 1));
        for (const id of resto) {
            const el = raiz.querySelector(`.nl-lab__input[data-id="${id}"]`);
            if (el) { el.focus(); return; }
        }
    }

    function decir(texto, tono, nombre) {
        feedback.className = 'nl-lab__feedback is-' + tono;
        feedback.innerHTML = (tono === 'ok' ? '✓ ' : '✗ ') +
            (nombre ? '<strong>' + escapar(nombre) + '.</strong> ' : '') + escapar(texto || '');
    }

    function actualizarContador() {
        const hechas = partes.filter(p => resueltas[p.id]).length;
        if (contador) contador.textContent = hechas + ' / ' + partes.length;
        raiz.classList.toggle('is-completa', hechas === partes.length);

        if (hechas === partes.length) {
            feedback.className = 'nl-lab__feedback is-ok';
            feedback.innerHTML = '🎉 <strong>¡Listo!</strong> Identificaste las ' +
                partes.length + ' partes de la neurona.';
            if (slug) markDone(slug);
        }
    }

    btnReset?.addEventListener('click', () => {
        if (Object.keys(resueltas).length &&
            !confirm('Esto borra las partes que ya acertaste. ¿Seguro?')) return;
        resueltas = {};
        guardar(slug, resueltas);
        feedback.className = 'nl-lab__feedback';
        feedback.textContent = '';
        render();
    });

    angosto.addEventListener('change', render);
    render();
}

function escapar(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

if (RAIZ) iniciar(RAIZ);
