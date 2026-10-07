/**
 * NeuroLab — carrera.js
 * Modo de carrera del estudiante: 'terapia-ocupacional' (por defecto) o 'fonoaudiologia'.
 * Se guarda en localStorage (nl_carrera) y se marca en <html data-carrera="…">; el CSS oculta
 * todo lo marcado con data-carrera de la otra carrera («¿Para qué te sirve?», guía…).
 * El switch es cualquier botón [data-carrera-btn]. Al cambiar se emite 'nl:carrera'.
 */
export const CARRERAS = { 'terapia-ocupacional': 'Terapia Ocupacional', 'fonoaudiologia': 'Fonoaudiología' };
const KEY = 'nl_carrera';
const DEF = 'terapia-ocupacional';

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
