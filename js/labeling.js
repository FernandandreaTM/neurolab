/**
 * NeuroLab — labeling.js
 * Actividad de identificación: sobre la imagen hay un rectángulo por cada parte.
 * El estudiante escribe el nombre (o presiona "No sé"), se le muestra la
 * respuesta correcta con sus nombres alternativos y su función, y él mismo
 * decide si su respuesta coincidía.
 *
 *   · "Coincide"     -> verde
 *   · "No coincide" / "No sé" -> ámbar ("por repasar"), con el nombre correcto
 *
 * La respuesta se pide a api/labeling_check.php sólo después de responder.
 * El avance se guarda en localStorage (nl_labeling_<slug>).
 */
import { markDone } from './progress.js';

const RAIZ = document.getElementById('nl-lab');
const KEY_BASE = 'nl_labeling_';

/** Estado por parte: { e: 'ok'|'repasar', n: nombre, r: lo que escribió, a: [alternativas], f: función } */
export function getLabelingState(slug) {
    let est = {};
    try { est = JSON.parse(localStorage.getItem(KEY_BASE + slug) || '{}'); } catch { est = {}; }
    // Formato anterior: { id: "Nombre" } -> se considera acertada.
    Object.keys(est).forEach(k => {
        if (typeof est[k] === 'string') est[k] = { e: 'ok', n: est[k], r: est[k], a: [], f: '' };
    });
    return est;
}

function guardar(slug, estado) {
    try { localStorage.setItem(KEY_BASE + slug, JSON.stringify(estado)); } catch { /* modo privado */ }
    document.dispatchEvent(new CustomEvent('nl:labeling', {
        detail: { slug, resueltas: Object.keys(estado).length },
    }));
}

function iniciar(raiz) {
    let partes = [];
    try { partes = JSON.parse(raiz.dataset.partes || '[]'); } catch { partes = []; }
    if (!partes.length) return;

    const slug     = raiz.dataset.slug || '';
    const capa     = raiz.querySelector('#nl-lab-capa');
    const svg      = raiz.querySelector('.nl-lab__lineas');
    const canvas   = raiz.querySelector('#nl-lab-canvas');
    const panel    = raiz.querySelector('#nl-lab-feedback');
    const contador = raiz.querySelector('#nl-lab-contador');
    const btnReset = raiz.querySelector('#nl-lab-reset');
    const angosto  = window.matchMedia('(max-width: 760px)');

    let resueltas = getLabelingState(slug);
    let decidiendo = null;   // { id, r, n, a, f } mientras el estudiante compara
    let lista = null;

    /* --- Marcadores y líneas sobre la imagen --- */
    function claseEstado(id) {
        if (decidiendo && decidiendo.id === id) return ' is-revelada';
        const s = resueltas[id];
        return s ? (s.e === 'ok' ? ' is-ok' : ' is-repasar') : '';
    }

    function pintarCanvas() {
        capa.innerHTML = partes.map(p =>
            `<span class="nl-lab__punto${claseEstado(p.id)}" style="left:${p.x}%;top:${p.y}%"
                   aria-hidden="true">${p.n}</span>`).join('');
        svg.innerHTML = partes
            .filter(p => p.bx !== p.x || p.by !== p.y)
            .map(p => `<line x1="${p.bx}" y1="${p.by}" x2="${p.x}" y2="${p.y}"
                             class="nl-lab__linea${claseEstado(p.id)}" vector-effect="non-scaling-stroke" />`)
            .join('');
    }

    /* --- Un rectángulo según su estado --- */
    function campoHTML(p) {
        const num = `<span class="nl-lab__num">${p.n}</span>`;
        if (decidiendo && decidiendo.id === p.id) {
            return `<div class="nl-lab__campo is-revelada" data-id="${p.id}">${num}
                        <span class="nl-lab__resp">${escapar(decidiendo.r || '—')}</span></div>`;
        }
        const s = resueltas[p.id];
        if (s) {
            const marca = s.e === 'ok' ? '✓' : '↺';
            return `<button type="button" class="nl-lab__campo nl-lab__ver${claseEstado(p.id)}" data-id="${p.id}"
                            title="Ver nombre y función">${num}
                        <span class="nl-lab__ok">${escapar(s.n)} ${marca}</span></button>`;
        }
        const bloqueado = decidiendo ? ' disabled' : '';
        return `<div class="nl-lab__campo" data-id="${p.id}">${num}
                    <input type="text" class="nl-lab__input" data-id="${p.id}"
                           placeholder="¿Qué parte es?" aria-label="Parte ${p.n}"
                           autocomplete="off" autocapitalize="off" spellcheck="false"${bloqueado}>
                    <button type="button" class="nl-lab__nose" data-id="${p.id}"
                            title="No sé: ver la respuesta"${bloqueado}>?</button>
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
        enlazar();
        actualizarContador();
    }

    function enlazar() {
        raiz.querySelectorAll('.nl-lab__input').forEach(input => {
            input.addEventListener('keydown', ev => {
                if (ev.key === 'Enter') { ev.preventDefault(); revelar(Number(input.dataset.id), input.value.trim()); }
            });
        });
        raiz.querySelectorAll('.nl-lab__nose').forEach(btn => {
            btn.addEventListener('click', () => revelar(Number(btn.dataset.id), ''));
        });
        raiz.querySelectorAll('.nl-lab__ver').forEach(btn => {
            btn.addEventListener('click', () => mostrarFicha(Number(btn.dataset.id)));
        });
    }

    async function pedirParte(id) {
        try {
            const res = await fetch('api/labeling_check.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                body: 'parte_id=' + encodeURIComponent(id),
            });
            return await res.json();
        } catch { return { ok: false, error: 'No pudimos traer la respuesta. ¿Hay conexión?' }; }
    }

    /* --- Pide la respuesta y abre la comparación --- */
    async function revelar(id, texto) {
        if (decidiendo || resueltas[id]) return;
        const campo = raiz.querySelector(`.nl-lab__campo[data-id="${id}"]`);
        campo?.classList.add('is-esperando');
        const d = await pedirParte(id);
        campo?.classList.remove('is-esperando');
        if (!d || !d.ok) {
            panel.className = 'nl-lab__feedback is-aviso';
            panel.textContent = (d && d.error) || 'Intenta de nuevo.';
            return;
        }

        const p = partes.find(x => x.id === id);
        if (texto === '') {
            // "No sé": se muestra y queda por repasar, sin pedir decisión.
            resueltas[id] = { e: 'repasar', n: d.nombre, r: '', a: d.alternativas || [], f: d.funcion || '' };
            guardar(slug, resueltas);
            render();
            mostrarFicha(id, 'Quedó <strong>por repasar</strong>.');
            enfocarSiguiente(id);
            return;
        }

        decidiendo = { id, r: texto, n: d.nombre, a: d.alternativas || [], f: d.funcion || '' };
        render();
        panel.className = 'nl-lab__feedback is-decidir';
        panel.innerHTML =
            `<div class="nl-lab__comp">
                <div><span class="nl-lab__etq">Tu respuesta (${p ? p.n : ''})</span>
                     <span class="nl-lab__suya">${escapar(texto)}</span></div>
                <div><span class="nl-lab__etq">Respuesta correcta</span>
                     <strong class="nl-lab__correcta">${escapar(d.nombre)}</strong>
                     ${altHTML(decidiendo.a)}</div>
             </div>
             ${decidiendo.f ? `<p class="nl-lab__funcion"><span class="nl-lab__etq">Función</span> ${escapar(decidiendo.f)}</p>` : ''}
             <div class="nl-lab__decision">
                <span>¿Tu respuesta coincide?</span>
                <button type="button" class="btn btn-sm nl-lab__si">✓ Coincide</button>
                <button type="button" class="btn btn-sm nl-lab__no">✗ No coincide</button>
             </div>`;
        panel.querySelector('.nl-lab__si').addEventListener('click', () => decidir('ok'));
        panel.querySelector('.nl-lab__no').addEventListener('click', () => decidir('repasar'));
        panel.querySelector('.nl-lab__si').focus();
    }

    function decidir(estado) {
        if (!decidiendo) return;
        const { id, r, n, a, f } = decidiendo;
        resueltas[id] = { e: estado, n, r, a, f };
        decidiendo = null;
        guardar(slug, resueltas);
        render();
        if (!completa()) {
            mostrarFicha(id, estado === 'ok' ? '<strong>Coincide.</strong>' : 'Quedó <strong>por repasar</strong>.');
        }
        enfocarSiguiente(id);
    }

    /** Muestra nombre, alternativas y función de una parte ya respondida. */
    async function mostrarFicha(id, encabezado) {
        const s = resueltas[id];
        const p = partes.find(x => x.id === id);
        if (!s || !p) return;
        // Respuestas guardadas por la versión anterior no traen función ni alternativos.
        if (!s.f) {
            const d = await pedirParte(id);
            if (d && d.ok) {
                s.n = d.nombre; s.a = d.alternativas || []; s.f = d.funcion || '';
                guardar(slug, resueltas);
            }
        }
        panel.className = 'nl-lab__feedback ' + (s.e === 'ok' ? 'is-ok' : 'is-repasar');
        panel.innerHTML =
            `${encabezado ? encabezado + ' ' : ''}<strong>${p.n}. ${escapar(s.n)}</strong>${altHTML(s.a)}
             ${s.r && s.e !== 'ok' ? `<span class="nl-lab__tuya">Escribiste: ${escapar(s.r)}</span>` : ''}
             ${s.f ? `<p class="nl-lab__funcion"><span class="nl-lab__etq">Función</span> ${escapar(s.f)}</p>` : ''}`;
    }

    function altHTML(a) {
        return a && a.length ? `<span class="nl-lab__alt">También: ${a.map(escapar).join(' · ')}</span>` : '';
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

    function completa() {
        return partes.every(p => resueltas[p.id]);
    }

    function actualizarContador() {
        const hechas  = partes.filter(p => resueltas[p.id]).length;
        const okN     = partes.filter(p => resueltas[p.id] && resueltas[p.id].e === 'ok').length;
        if (contador) contador.textContent = hechas + ' / ' + partes.length;
        raiz.classList.toggle('is-completa', hechas === partes.length);

        if (hechas === partes.length && !decidiendo) {
            const repasar = partes.filter(p => resueltas[p.id].e !== 'ok');
            panel.className = 'nl-lab__feedback ' + (repasar.length ? 'is-repasar' : 'is-ok');
            panel.innerHTML = `🎉 <strong>¡Terminaste!</strong> ${okN} coinciden · ${repasar.length} por repasar.` +
                (repasar.length
                    ? `<span class="nl-lab__alt">Repasa: ${repasar.map(p => p.n + '. ' + escapar(resueltas[p.id].n)).join(' · ')}</span>`
                    : '') +
                `<span class="nl-lab__alt">Toca cualquier rectángulo para ver su función.</span>`;
            if (slug) markDone(slug);
        }
    }

    btnReset?.addEventListener('click', () => {
        if (Object.keys(resueltas).length && !confirm('Esto borra todas tus respuestas. ¿Seguro?')) return;
        resueltas = {};
        decidiendo = null;
        guardar(slug, resueltas);
        panel.className = 'nl-lab__feedback';
        panel.textContent = '';
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
