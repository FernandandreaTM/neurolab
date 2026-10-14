// NeuroLab — progress.js
// Módulo ES: gestiona progreso por slug en localStorage.
// Key: 'nl_progress' (separada de cellview 'cv_progress').

const KEY = 'nl_progress';

/**
 * Bloqueo por nivel: si es true, un nivel exige completar el anterior.
 * Con false se puede abrir cualquier nivel (útil mientras se revisan actividades).
 */
export const BLOQUEO_NIVELES = true;

/** ¿Está bloqueado un nivel que requiere completar `requiere`? */
export function bloqueado(requiere) {
    return BLOQUEO_NIVELES && !!requiere && !isDone(requiere);
}

export function getProgress() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch { return {}; }
}

export function isDone(slug) {
    return !!getProgress()[slug];
}

export function markDone(slug) {
    const p = getProgress();
    p[slug] = Date.now();
    localStorage.setItem(KEY, JSON.stringify(p));
    document.dispatchEvent(new CustomEvent('nl:progress', { detail: { slug, done: true } }));
}

export function getStatsOf(totalItems) {
    const p = getProgress();
    const done = Object.values(p).filter(Boolean).length;
    return {
        total: totalItems,
        done,
        pct: totalItems ? Math.round(done * 100 / totalItems) : 0
    };
}

export function reset() {
    localStorage.removeItem(KEY);
    document.dispatchEvent(new CustomEvent('nl:progress', { detail: { reset: true } }));
}
