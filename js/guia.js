/**
 * NeuroLab — guia.js
 * "Mi guía de estudio": cada actividad, al completarse, guarda sola una sección con lo
 * trabajado (respuestas, explicaciones, dibujos, imágenes). guia.php la muestra y la
 * descarga como PDF.
 *
 * Texto en localStorage (nl_guia):
 *   { v: 2, meta: { integrantes }, secciones: { <clave>: { titulo, slug, carrera?, fecha, nota, bloques } } }
 * Imágenes en IndexedDB (nl_guia_img): la sección guarda sólo 'idb:<clave>#<n>'.
 * Clave de sección: la de data/practicos.php; si depende de la carrera, '<clave>|<carrera>'.
 *
 * Bloques de una sección:
 *   { t: 'tabla',    cab: ['A','B'], filas: [['a','b'], ...] }
 *   { t: 'lista',    items: ['...'] }
 *   { t: 'texto',    txt: '...' }
 *   { t: 'figuras',  items: [{ svg: '<svg…>', titulo, pie }] }
 *   { t: 'imagenes', items: [{ src: 'data:image/jpeg;base64,…' | 'idb:…', titulo, pie }] }
 *   { t: 'conexion', items: [{ c: 'terapia-ocupacional', txt }] }   (se muestra sólo la carrera activa)
 */
import { carrera } from './carrera.js';

const KEY = 'nl_guia';
const VERSION = 2;
const OBSOLETAS = ['nl_tareas_', 'nl_practica_'];   // módulos antiguos de actividades

/* ---------------------------------------------------------------
   Imágenes en IndexedDB
   --------------------------------------------------------------- */
let dbProm = null;
function db() {
    if (!dbProm) {
        dbProm = new Promise((ok, mal) => {
            if (!window.indexedDB) { mal(new Error('sin IndexedDB')); return; }
            const r = indexedDB.open('nl_guia_img', 1);
            r.onupgradeneeded = () => r.result.createObjectStore('img');
            r.onsuccess = () => ok(r.result);
            r.onerror = () => mal(r.error);
        });
        dbProm.catch(() => {});
    }
    return dbProm;
}
async function tx(modo, fn) {
    const d = await db();
    return new Promise((ok, mal) => {
        const t = d.transaction('img', modo);
        const st = t.objectStore('img');
        const res = fn(st);
        t.oncomplete = () => ok(res && 'result' in res ? res.result : undefined);
        t.onerror = () => mal(t.error);
        t.onabort = () => mal(t.error);
    });
}
const imgPoner = (id, dato) => tx('readwrite', st => st.put(dato, id));
const imgLeer = id => tx('readonly', st => st.get(id));
const imgClaves = () => tx('readonly', st => st.getAllKeys());
async function imgBorrar(pred) {
    const ks = await imgClaves();
    const fuera = (ks || []).filter(pred);
    if (fuera.length) await tx('readwrite', st => { fuera.forEach(k => st.delete(k)); });
}

/* ---------------------------------------------------------------
   Lectura y escritura
   --------------------------------------------------------------- */
export function leerGuia() {
    let g = null;
    try { g = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { g = null; }
    if (!g || typeof g !== 'object') g = {};
    if (!g.meta) g.meta = {};
    if (!g.secciones) g.secciones = {};
    return g;
}

function escribirGuia(g) {
    g.v = VERSION;
    try { localStorage.setItem(KEY, JSON.stringify(g)); }
    catch {
        document.dispatchEvent(new CustomEvent('nl:guia-error'));
        return false;
    }
    document.dispatchEvent(new CustomEvent('nl:guia'));
    return true;
}

/** Saca las imágenes de la sección a IndexedDB (si se puede) y deja la referencia. */
async function separarImagenes(clave, seccion) {
    const s = JSON.parse(JSON.stringify(seccion));
    const ids = [];
    let n = 0;
    for (const b of s.bloques || []) {
        if (b.t !== 'imagenes') continue;
        for (const it of b.items || []) {
            if (!/^data:image\//.test(String(it.src || ''))) continue;
            const id = clave + '#' + (n++);
            try { await imgPoner(id, it.src); it.src = 'idb:' + id; ids.push(id); }
            catch { /* sin IndexedDB: queda en línea */ }
        }
    }
    try { await imgBorrar(k => k.startsWith(clave + '#') && !ids.includes(k)); } catch { /* */ }
    return s;
}

let cola = Promise.resolve();
/** Guarda (o reemplaza) la sección `clave`. Las escrituras van en orden. */
export function sumarAGuia(clave, seccion) {
    cola = cola.then(async () => {
        const s = await separarImagenes(clave, seccion);
        const g = leerGuia();
        g.secciones[clave] = Object.assign({}, s, { fecha: Date.now() });
        escribirGuia(g);
    }).catch(() => {});
    return cola;
}

export function enGuia(clave) { return !!leerGuia().secciones[clave]; }

export function quitarDeGuia(clave) {
    const g = leerGuia();
    delete g.secciones[clave];
    escribirGuia(g);
    imgBorrar(k => k.startsWith(clave + '#')).catch(() => {});
}

export function guardarMeta(meta) {
    const g = leerGuia();
    g.meta = Object.assign({}, g.meta, meta);
    escribirGuia(g);
}

export function borrarGuia() {
    try { localStorage.removeItem(KEY); } catch { /* */ }
    imgBorrar(() => true).catch(() => {});
    document.dispatchEvent(new CustomEvent('nl:guia'));
}

const base = k => String(k).split('|')[0];

/**
 * Deja en la guía sólo las secciones de `claves` (las de data/practicos.php), borra sus
 * imágenes huérfanas y el avance guardado por módulos antiguos. Lo llama guia.php.
 */
export async function limpiarGuia(claves) {
    const validas = new Set(claves);
    const g = leerGuia();
    let cambio = g.v !== VERSION;
    Object.keys(g.secciones).forEach(k => {
        if (!validas.has(base(k))) { delete g.secciones[k]; cambio = true; }
    });
    // secciones antiguas con imágenes en línea: se pasan a IndexedDB
    for (const k of Object.keys(g.secciones)) {
        const s = g.secciones[k];
        if ((s.bloques || []).some(b => b.t === 'imagenes' && (b.items || []).some(i => /^data:/.test(i.src || '')))) {
            g.secciones[k] = Object.assign(await separarImagenes(k, s), { fecha: s.fecha });
            cambio = true;
        }
    }
    if (cambio) escribirGuia(g);
    try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && OBSOLETAS.some(p => k.startsWith(p))) localStorage.removeItem(k);
        }
    } catch { /* */ }
    try { await imgBorrar(k => !g.secciones[k.split('#')[0]]); } catch { /* */ }
}

/** Sección de `clave` para la carrera activa (las que no dependen de la carrera valen para ambas). */
export function seccionDe(g, clave, car = carrera()) {
    const propia = g.secciones[clave + '|' + car];
    if (propia) return propia;
    const s = g.secciones[clave];
    return s && (!s.carrera || s.carrera === car) ? s : null;
}

/** Enlace a la guía, conservando la ruta del práctico si se llegó desde ella. */
export function urlGuia() {
    const ruta = new URLSearchParams(location.search).get('ruta');
    return 'guia.php' + (ruta ? '?p=' + encodeURIComponent(ruta) : '');
}

/**
 * Al completar una actividad, su sección se guarda sola y en `contenedor` queda una
 * línea discreta con el enlace. `construir()` devuelve la sección.
 */
export function botonGuia(contenedor, clave, construir) {
    if (!contenedor) return;
    sumarAGuia(clave, construir());
    contenedor.className = 'nl-guia-ok';
    contenedor.innerHTML = `✓ Guardado en tu guía de estudio · <a href="${urlGuia()}">Ver guía</a>`;
}

/* ---------------------------------------------------------------
   Render (lo usa guia.php)
   --------------------------------------------------------------- */
export function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Sólo se aceptan SVG generados por NeuroLab (sin scripts ni manejadores de eventos). */
function svgSeguro(svg) {
    const s = String(svg || '');
    if (!/^<svg[\s>]/i.test(s) || /<script|<foreignObject|\son[a-z]+\s*=|javascript:/i.test(s)) return '';
    return s;
}

const pieFig = f => (f.titulo || f.pie)
    ? `<figcaption>${f.titulo ? `<strong>${esc(f.titulo)}</strong>` : ''}${f.pie ? `<span>${esc(f.pie)}</span>` : ''}</figcaption>` : '';

/** Ícono de tipo de neurona en la cabecera de un cuadro (sólo los de img/tipos/). */
const icono = src => /^img\/tipos\/[a-z0-9-]+\.png(\?v=\d+)?$/.test(String(src || '')) ? `<img class="nl-g-ico" src="${src}" alt="">` : '';

/* Lo que no va en la guía: estadísticas y avisos de repaso (se guardan, pero no se muestran). */
const esEstadistica = b => b.t === 'texto' && /^(↺|Puntaje:)/.test(String(b.txt || '').trim());
const PIES_FUERA = /^Los números corresponden a la tabla\.?$/;

/** Tablas de 3-4 columnas como lista de 2: nombre en negrita · explicación + «para recordar» en gris. */
function listaDeTabla(b) {
    const cab = b.cab || [];
    const filas = b.filas || [];
    if (cab[0] === 'Nº') {          // identificación: Nº, Estructura, Función, Para recordar
        return `<ol class="nl-g-items">${filas.map(f => `<li>
            <span class="nl-g-items__n${/↺/.test(f[0]) ? ' is-rep' : ''}">${esc(String(f[0]).replace(/\s*↺\s*/, ''))}</span>
            <strong class="nl-g-items__nom">${esc(f[1])}</strong>
            <span class="nl-g-items__txt">${esc(f[2])}${f[3] ? `<small>${esc(f[3])}</small>` : ''}</span></li>`).join('')}</ol>`;
    }
    if (cab[0] === 'Pregunta') {    // lámina: Pregunta, Respuesta, Para recordar
        return `<ul class="nl-g-qa">${filas.map(f => `<li><strong>${esc(f[0])}</strong>
            <span>→ ${esc(f[1])}</span>${f[2] ? `<small>${esc(f[2])}</small>` : ''}</li>`).join('')}</ul>`;
    }
    if (cab[1] === 'Pregunta') {    // quiz: ✓/✗, Pregunta, Respuesta correcta, Para recordar
        return `<ul class="nl-g-qa nl-g-qa--quiz">${filas.map(f => `<li class="${f[0] === '✗' ? 'is-mal' : 'is-ok'}">
            <i aria-label="${f[0] === '✗' ? 'Por repasar' : 'Correcta'}">${esc(f[0])}</i><strong>${esc(f[1])}</strong>
            <span>→ ${esc(f[2])}</span>${f[3] ? `<small>${esc(f[3])}</small>` : ''}</li>`).join('')}</ul>`;
    }
    return '';
}

export function renderBloque(b, car = carrera()) {
    if (!b || !b.t || esEstadistica(b)) return '';
    if (b.t === 'tabla') {
        const lista = listaDeTabla(b);
        if (lista) return lista;
        return `<div class="nl-g-tabla-wrap"><table class="nl-g-tabla">
            ${b.cab ? `<thead><tr>${b.cab.map((c, i) => `<th>${icono((b.iconos || [])[i])}${esc(c)}</th>`).join('')}</tr></thead>` : ''}
            <tbody>${(b.filas || []).map(f => `<tr>${f.map((c, i) => i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>`;
    }
    if (b.t === 'conexion') {
        const it = (b.items || []).filter(i => i.c === car);
        return it.length ? `<aside class="nl-g-conexion"><span aria-hidden="true">💡</span><div><strong>¿Para qué te sirve?</strong>${it.map(i =>
            `<p>${esc(String(i.txt).replace(/^(Terapia Ocupacional|Fonoaudiología):\s*/, ''))}</p>`).join('')}</div></aside>` : '';
    }
    if (b.t === 'lista') return `<ul class="nl-g-lista">${(b.items || []).map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    if (b.t === 'texto') return `<p class="nl-g-texto">${esc(b.txt)}</p>`;
    if (b.t === 'figuras') {
        return `<div class="nl-g-figuras">${(b.items || []).map(f => `
            <figure class="nl-g-fig">${svgSeguro(f.svg)}${pieFig(f)}</figure>`).join('')}</div>`;
    }
    if (b.t === 'imagenes') {
        const items = b.items || [];
        return `<div class="nl-g-figuras nl-g-figuras--fotos${items.length === 1 ? ' is-una' : ''}">${items.map(f => {
            const src = String(f.src || '');
            const img = src.startsWith('idb:') ? `<img data-idb="${esc(src.slice(4))}" alt="">`
                : /^data:image\/(jpeg|png|webp);base64,/.test(src) ? `<img src="${src}" alt="">` : '';
            return `<figure class="nl-g-fig">${img}${pieFig(Object.assign({}, f, { pie: PIES_FUERA.test(f.pie || '') ? '' : f.pie }))}</figure>`;
        }).join('')}</div>`;
    }
    return '';
}

/**
 * Una sección de nivel: `titulo` es el nombre del nivel en data/practicos.php ('' = sin subtítulo).
 * Imagen única + lista de identificación: lado a lado en pantalla ancha.
 */
export function renderSeccion(s, titulo, car = carrera()) {
    const bl = (s.bloques || []).filter(b => !esEstadistica(b));
    const iImg = bl.findIndex(b => b.t === 'imagenes' && (b.items || []).length === 1);
    const iLista = bl.findIndex(b => b.t === 'tabla' && (b.cab || [])[0] === 'Nº');
    let cuerpo;
    if (iImg >= 0 && iLista >= 0) {
        const resto = bl.filter((_, i) => i !== iImg && i !== iLista);
        cuerpo = `<div class="nl-g-par">${renderBloque(bl[iImg], car)}${renderBloque(bl[iLista], car)}</div>` +
                 resto.map(b => renderBloque(b, car)).join('');
    } else {
        cuerpo = bl.map(b => renderBloque(b, car)).join('');
    }
    return `<section class="nl-g-sec">
        ${titulo === '' ? '' : `<h3>${esc(titulo || s.titulo)}</h3>`}
        ${cuerpo}
    </section>`;
}

/** Carga las imágenes guardadas en IndexedDB. Resuelve cuando todas están listas. */
export async function hidratarImagenes(cont) {
    const imgs = Array.from(cont.querySelectorAll('img[data-idb]'));
    await Promise.all(imgs.map(async im => {
        let src = null;
        try { src = await imgLeer(im.dataset.idb); } catch { src = null; }
        if (!src) { im.closest('figure')?.classList.add('is-sin-img'); im.remove(); return; }
        im.src = src;
        im.removeAttribute('data-idb');
        if (!im.complete) await new Promise(r => { im.onload = im.onerror = r; });
    }));
}
