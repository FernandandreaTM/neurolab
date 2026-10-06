/**
 * NeuroLab — guia.js
 * "Mi guía de estudio": cada actividad, al completarse, ofrece sumar una sección
 * con lo trabajado (respuestas correctas, explicaciones, dibujos). La guía se ve
 * y se descarga como PDF en guia.php.
 *
 * Se guarda en localStorage (nl_guia):
 *   { meta: { integrantes: "..." },
 *     secciones: { <clave>: { titulo, subtitulo, slug, fecha, nota, bloques: [...] } } }
 *
 * Bloques de una sección:
 *   { t: 'tabla',   cab: ['A','B'], filas: [['a','b'], ...] }
 *   { t: 'lista',   items: ['...'] }
 *   { t: 'texto',   txt: '...' }
 *   { t: 'figuras', items: [{ svg: '<svg…>', titulo: '...', pie: '...' }] }
 *   { t: 'imagenes', items: [{ src: 'data:image/jpeg;base64,…', titulo: '...', pie: '...' }] }
 */
const KEY = 'nl_guia';

export function leerGuia() {
    let g = null;
    try { g = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { g = null; }
    if (!g || typeof g !== 'object') g = {};
    if (!g.meta) g.meta = {};
    if (!g.secciones) g.secciones = {};
    return g;
}

function escribirGuia(g) {
    try { localStorage.setItem(KEY, JSON.stringify(g)); } catch { /* sin almacenamiento */ }
    document.dispatchEvent(new CustomEvent('nl:guia'));
}

export function enGuia(clave) { return !!leerGuia().secciones[clave]; }

export function sumarAGuia(clave, seccion) {
    const g = leerGuia();
    g.secciones[clave] = Object.assign({}, seccion, { fecha: Date.now() });
    escribirGuia(g);
}

export function quitarDeGuia(clave) {
    const g = leerGuia();
    delete g.secciones[clave];
    escribirGuia(g);
}

export function guardarMeta(meta) {
    const g = leerGuia();
    g.meta = Object.assign({}, g.meta, meta);
    escribirGuia(g);
}

export function borrarGuia() {
    try { localStorage.removeItem(KEY); } catch { /* */ }
    document.dispatchEvent(new CustomEvent('nl:guia'));
}

/** Enlace a la guía, conservando la ruta del práctico si se llegó desde ella. */
export function urlGuia() {
    const ruta = new URLSearchParams(location.search).get('ruta');
    return 'guia.php' + (ruta ? '?p=' + encodeURIComponent(ruta) : '');
}

/**
 * Al completar una actividad, su sección se guarda sola en la guía (cada vez que se
 * llama, con lo último) y en `contenedor` queda sólo una línea discreta con el enlace.
 * `construir()` devuelve la sección.
 */
export function botonGuia(contenedor, clave, construir) {
    if (!contenedor) return;
    sumarAGuia(clave, construir());
    contenedor.className = 'nl-guia-ok';
    contenedor.innerHTML = `✓ Guardado en tu guía de estudio · <a href="${urlGuia()}">Ver guía</a>`;
}

/* ---------------------------------------------------------------
   Render de una sección (lo usa guia.php)
   --------------------------------------------------------------- */
export function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Sólo se aceptan SVG generados por NeuroLab (sin scripts ni atributos on*). */
function svgSeguro(svg) {
    const s = String(svg || '');
    if (!/^<svg[\s>]/i.test(s) || /<script|on\w+\s*=|javascript:/i.test(s)) return '';
    return s;
}

export function renderBloque(b) {
    if (!b || !b.t) return '';
    if (b.t === 'tabla') {
        return `<div class="nl-g-tabla-wrap"><table class="nl-g-tabla">
            ${b.cab ? `<thead><tr>${b.cab.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>` : ''}
            <tbody>${(b.filas || []).map(f => `<tr>${f.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>`;
    }
    if (b.t === 'lista') return `<ul class="nl-g-lista">${(b.items || []).map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    if (b.t === 'texto') return `<p class="nl-g-texto">${esc(b.txt)}</p>`;
    if (b.t === 'figuras') {
        return `<div class="nl-g-figuras">${(b.items || []).map(f => `
            <figure class="nl-g-fig">${svgSeguro(f.svg)}
                <figcaption>${f.titulo ? `<strong>${esc(f.titulo)}</strong>` : ''}${f.pie ? ` ${esc(f.pie)}` : ''}</figcaption>
            </figure>`).join('')}</div>`;
    }
    if (b.t === 'imagenes') {
        return `<div class="nl-g-figuras nl-g-figuras--fotos">${(b.items || []).map(f => {
            const src = /^data:image\/(jpeg|png|webp);base64,/.test(String(f.src || '')) ? f.src : '';
            return `<figure class="nl-g-fig">${src ? `<img src="${src}" alt="">` : ''}
                <figcaption>${f.titulo ? `<strong>${esc(f.titulo)}</strong>` : ''}${f.pie ? ` ${esc(f.pie)}` : ''}</figcaption>
            </figure>`;
        }).join('')}</div>`;
    }
    return '';
}

export function renderSeccion(s, numero) {
    const fecha = s.fecha ? new Date(s.fecha).toLocaleDateString('es-CL') : '';
    return `<section class="nl-g-sec">
        <header class="nl-g-sec__head">
            <h2>${numero ? numero + '. ' : ''}${esc(s.titulo)}</h2>
            ${s.subtitulo ? `<p class="nl-g-sec__sub">${esc(s.subtitulo)}</p>` : ''}
        </header>
        ${(s.bloques || []).map(renderBloque).join('')}
        <p class="nl-g-sec__nota">${s.nota ? esc(s.nota) + ' · ' : ''}${fecha ? 'Agregada el ' + fecha : ''}</p>
    </section>`;
}
