/**
 * NeuroLab — molde.js
 * Moldes de láminas: siluetas en un marco cuadrado (viewBox 0 0 100 100) que el estudiante
 * encaja sobre su captura. Al encajar, la captura queda recortada a ese marco, así todas las
 * capturas comparten la misma geometría (las zonas se revisan en el servidor).
 *   contorno -> lo que se ve en la lámina real (para encajar)
 *   esquema  -> lo que la tinción no muestra (sustancia gris, raíces, nervio), para el circuito.
 *               Con estilos en los atributos: también se dibuja en el canvas de la guía.
 */
const GRIS = 'M49 47 C45 46 41.5 42 39 37 C37.5 33.5 33 32.5 33.5 36 C34.5 40 37.5 44.5 40.5 48.5 C35.5 50.5 30.5 54 30 59 C29.5 64 33.5 67.5 38 66.5 C42.5 65.5 45.5 60.5 47 57 L49 57 Z';
const RAIZ = 'fill="none" stroke="#FDE68A" stroke-width="1.5" stroke-linecap="round" stroke-opacity=".9"';
const NERVIO = 'fill="none" stroke="#FDE68A" stroke-width="3" stroke-linecap="round" stroke-opacity=".75"';
const TXT = 'font-family="Arial, sans-serif" font-weight="700" font-size="2.6" fill="#fff" stroke="rgba(26,14,46,.9)" stroke-width=".7" paint-order="stroke" text-anchor="middle"';

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
        esquema: `
            <g fill="rgba(139,92,246,.30)" stroke="#C4B5FD" stroke-width=".35">
                <path d="${GRIS}"/><path d="${GRIS}" transform="translate(98 0) scale(-1 1)"/></g>
            <circle cx="49" cy="51.3" r=".7" fill="#fff"/>
            <ellipse cx="14" cy="56" rx="7" ry="13" fill="rgba(252,211,77,.12)" stroke="#FCD34D" stroke-width=".35" stroke-dasharray="1 .8"/>
            <path ${RAIZ} d="M15.5 44 C17 37.5 23 34.5 30 35.8"/>
            <path ${RAIZ} d="M29 62.5 C24 64 20 67 16 72"/>
            <path ${NERVIO} d="M14 69.5 C11 74 6 78 0 82"/>
            <g opacity=".45"><path ${RAIZ} d="M80 53.5 C80 45 74.5 37.5 68 36"/><path ${RAIZ} d="M69 62 C73 65 77 69 80.5 73"/>
                <path ${NERVIO} d="M83 72.5 C87 77 92 81 100 84"/></g>
            <text ${TXT} x="20" y="33.5">raíz dorsal</text>
            <text ${TXT} x="27" y="70.5">raíz ventral</text>
            <text ${TXT} x="17" y="80">nervio espinal</text>
            <text ${TXT} x="40" y="31">asta dorsal</text>
            <text ${TXT} x="44" y="69">asta ventral</text>`,
    },
};

/** SVG del molde (capa = 'contorno' | 'esquema'), escalado al contenedor. */
export function svgMolde(id, capa = 'contorno', clase = '') {
    const m = MOLDES[id];
    if (!m || !m[capa]) return '';
    return `<svg class="nl-molde ${clase}" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${m[capa]}</svg>`;
}

/** Imagen (para canvas) de una capa del molde, del tamaño pedido. */
export function imagenMolde(id, capa, lado) {
    const m = MOLDES[id];
    if (!m || !m[capa]) return Promise.resolve(null);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 100 100">${m[capa]}</svg>`;
    return new Promise(ok => {
        const img = new Image();
        img.onload = () => ok(img);
        img.onerror = () => ok(null);
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
}

/** Curva suave (Catmull-Rom) que pasa por los puntos: atributo d de un path. */
export function curva(pts) {
    if (!pts || pts.length < 2) return '';
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0]} ${p2[1]}`;
    }
    return d;
}
