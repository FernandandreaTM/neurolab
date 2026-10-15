/**
 * NeuroLab — carrera.js
 * Carrera activa del estudiante. La lista viene de la BD (window.NL_CARRERAS, ver _partials/carreras.php);
 * la primera es la carrera por defecto. Se guarda en localStorage (nl_carrera) y se marca en
 * <html data-carrera="…">; se oculta todo lo marcado con data-carrera de otra carrera («¿Para qué te sirve?», guía…).
 * El switch es cualquier botón [data-carrera-btn]. Al cambiar se emite 'nl:carrera'.
 */
const DATOS = (typeof window !== 'undefined' && window.NL_CARRERAS) || { general: { n: 'General', s: 'General' } };
/** { slug: nombre } */
export const CARRERAS = Object.fromEntries(Object.entries(DATOS).map(([k, v]) => [k, v.n]));
/** { slug: sigla } */
export const SIGLAS = Object.fromEntries(Object.entries(DATOS).map(([k, v]) => [k, v.s || v.n]));
const KEY = 'nl_carrera';
const DEF = Object.keys(CARRERAS)[0];

export function carrera() {
    let c = null;
    try { c = localStorage.getItem(KEY); } catch { c = null; }
    return CARRERAS[c] ? c : DEF;
}

export function ponerCarrera(c) {
    if (!CARRERAS[c]) return;
    try { localStorage.setItem(KEY, c); } catch { /* modo privado */ }
    pintar();
    document.dispatchEvent(new CustomEvent('nl:carrera', { detail: { carrera: c } }));
}

function pintar() {
    const c = carrera();
    document.documentElement.dataset.carrera = c;
    let st = document.getElementById('nl-carrera-css');
    if (!st) { st = document.createElement('style'); st.id = 'nl-carrera-css'; document.head.appendChild(st); }
    st.textContent = `[data-carrera]:not(html):not([data-carrera="comun"]):not([data-carrera="${c}"]){display:none!important}`;
    document.querySelectorAll('[data-carrera-btn]').forEach(b => {
        const on = b.dataset.carreraBtn === c;
        b.classList.toggle('active', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
}

/** Bloque de guía «¿Para qué te sirve?» con los textos de cada carrera (la guía muestra el de la carrera activa). */
export function conexionGuia(tpl) {
    if (!tpl) return [];
    const items = Array.from(tpl.content.querySelectorAll('p[data-carrera]')).map(p => ({
        c: p.dataset.carrera,
        txt: p.textContent.replace(/\s+/g, ' ').trim(),
    }));
    return items.length ? [{ t: 'conexion', items }] : [];
}

if (!window.__nlCarrera) {
    window.__nlCarrera = true;
    document.addEventListener('click', ev => {
        const b = ev.target.closest('[data-carrera-btn]');
        if (b) ponerCarrera(b.dataset.carreraBtn);
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pintar); else pintar();
}
