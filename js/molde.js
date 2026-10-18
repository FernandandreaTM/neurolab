/**
 * NeuroLab — molde.js
 * Moldes de láminas: siluetas en un marco cuadrado (viewBox 0 0 100 100) que el estudiante
 * encaja sobre su captura. Al encajar, la captura queda recortada a ese marco, así todas las
 * capturas comparten la misma geometría (las zonas se revisan en api/lamina_check.php).
 *   contorno -> lo que se ve en la lámina real (para encajar)
 *   esquema  -> lo que la tinción no muestra (sustancia gris, raíces), para el circuito
 */
export const MOLDES = {
    // MH-047: médula espinal de roedor dentro de la vértebra, con ambos ganglios (dorsal arriba)
    mh047: {
        contorno: `
            <path class="nl-molde__hueso" d="M2 37 C10 30 24 27 37 25 L51 3 L59 4 L69 24 C80 29 89 37 95 52"/>
            <rect class="nl-molde__hueso" x="17" y="66" width="54" height="28" rx="11"/>
            <ellipse class="nl-molde__medula" cx="49" cy="50.8" rx="27.5" ry="21"/>
            <ellipse class="nl-molde__ganglio" cx="14" cy="56" rx="7" ry="13"/>
            <ellipse class="nl-molde__ganglio" cx="81.5" cy="63" rx="5.5" ry="10"/>
            <text x="49" y="52" class="nl-molde__txt">médula</text>
            <text x="44" y="82" class="nl-molde__txt">vértebra</text>
            <text x="14" y="76" class="nl-molde__txt">ganglio</text>
            <text x="81.5" y="80" class="nl-molde__txt">ganglio</text>`,
    },
};

/** SVG del molde (capa = 'contorno' | 'esquema'), escalado al contenedor. */
export function svgMolde(id, capa = 'contorno', clase = '') {
    const m = MOLDES[id];
    if (!m || !m[capa]) return '';
    return `<svg class="nl-molde ${clase}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${m[capa]}</svg>`;
}
