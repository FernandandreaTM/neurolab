/**
 * NeuroLab — molde.js
 * Moldes de láminas: siluetas en un marco (viewBox 0 0 ancho 100; `vb`, por defecto cuadrado) que el estudiante
 * encaja sobre su captura. Al encajar, la captura queda recortada a ese marco, así todas las
 * capturas comparten la misma geometría (las zonas se revisan en el servidor).
 *   contorno -> lo que se ve en la lámina real (para encajar)
 *   esquema  -> lo que la tinción no muestra (sustancia gris, raíces, nervio), para el circuito.
 *               Con estilos en los atributos: también se dibuja en el canvas de la guía.
 */
const GRIS = 'M49 47 C45 46 41.5 42 39 37 C37.5 33.5 33 32.5 33.5 36 C34.5 40 37.5 44.5 40.5 48.5 C35.5 50.5 30.5 54 30 59 C29.5 64 33.5 67.5 38 66.5 C42.5 65.5 45.5 60.5 47 57 L49 57 Z';
const RAIZ = 'fill="none" stroke="#FDE68A" stroke-width="1.5" stroke-linecap="round" stroke-opacity=".9"';
const NERVIO = 'fill="none" stroke="#FDE68A" stroke-width="3" stroke-linecap="round" stroke-opacity=".75"';
const RAIZ_C = 'fill="none" stroke="#D97706" stroke-width="1.3" stroke-linecap="round"';     // sobre fondo claro
const NERVIO_C = 'fill="none" stroke="#B45309" stroke-width="2.6" stroke-linecap="round" stroke-opacity=".85"';
const TXT = 'font-family="Arial, sans-serif" font-weight="700" font-size="2.6" fill="#fff" stroke="rgba(26,14,46,.9)" stroke-width=".7" paint-order="stroke" text-anchor="middle"';

export const MOLDES = {
    // UCSF-163: médula espinal de gato, cresil violeta (dorsal arriba). Marco 3:2: la médula a la derecha y,
    // a la izquierda, el espacio donde el nivel II arma lo que la lámina no tiene (ganglio, raíces, nervio)
    ucsf163: {
        vb: [150, 100],
        guia: 'el contorno de la médula y el canal central',
        contorno: `
            <path class="nl-molde__medula" d="M102.1 20.0 C105.1 20.0 108.1 19.0 111.1 19.1 C114.1 19.2 117.3 19.7 120.2 20.9 C123.1 22.1 125.4 24.6 128.4 26.4 C131.4 28.2 135.8 29.4 138.4 31.8 C141.0 34.2 142.9 37.9 143.8 40.9 C144.7 43.9 143.8 46.7 143.8 50.0 C143.8 53.3 144.9 57.5 143.8 60.8 C142.8 64.1 140.2 67.5 137.5 69.9 C134.8 72.3 130.7 73.6 127.5 75.4 C124.3 77.2 121.4 79.9 118.4 80.8 C115.4 81.7 111.7 80.9 109.3 80.8 C106.9 80.7 105.1 80.8 103.9 79.9 C102.7 79.0 102.7 75.4 102.1 75.4 C101.5 75.4 101.5 79.0 100.3 79.9 C99.1 80.8 97.2 80.7 94.8 80.8 C92.4 80.9 88.7 81.7 85.7 80.8 C82.7 79.9 79.9 77.2 76.7 75.4 C73.5 73.6 69.4 72.3 66.7 69.9 C64.0 67.5 61.4 64.1 60.3 60.8 C59.2 57.5 60.3 53.3 60.3 50.0 C60.3 46.7 59.4 43.9 60.3 40.9 C61.2 37.9 63.2 34.2 65.8 31.8 C68.4 29.4 72.8 28.2 75.8 26.4 C78.8 24.6 81.0 22.1 83.9 20.9 C86.8 19.7 90.0 19.2 93.0 19.1 C96.0 19.0 99.1 20.0 102.1 20.0 Z"/>
            <path class="nl-molde__hueso" d="M102.1 21 L102.1 46"/>
            <circle class="nl-molde__ganglio" cx="102.8" cy="49.5" r="2.2"/>
            <text x="122" y="36" class="nl-molde__txt">médula</text>
            <text x="102.8" y="56" class="nl-molde__txt">canal</text>`,
        // Lo que la lámina no tiene, a la izquierda de la médula (lado izquierdo del cuerpo)
        esquema: `
            <rect x="1" y="7" width="18" height="15" rx="3" fill="#FBCFE8" stroke="#DB2777" stroke-width=".4"/>
            <path d="M1 11 H19" stroke="#DB2777" stroke-width=".35" stroke-dasharray="1.2 .8"/>
            <ellipse cx="11" cy="86" rx="9" ry="9" fill="#FCA5A5" stroke="#B91C1C" stroke-width=".4"/>
            <path d="M5 80 L17 92 M3.5 84 L14 94.5 M8 78 L19 89" stroke="#B91C1C" stroke-width=".3" opacity=".6"/>
            <path ${NERVIO_C} d="M28 48.5 C22 50 17 50 13 50"/>
            <path ${RAIZ_C} d="M13 50 C10 42 9.5 32 9.5 22"/>
            <path ${RAIZ_C} d="M13 50 C10 60 10.5 70 11 77"/>
            <path ${RAIZ_C} d="M45.5 38.5 C55 34 64 28.5 74 27.5"/>
            <path ${RAIZ_C} d="M30.5 41.5 C29 44 28.5 46 28 48.5"/>
            <path ${RAIZ_C} d="M70 71.5 C60 71 47 64 34 54 C31 51.5 29.5 50 28 49"/>
            <ellipse cx="38" cy="40" rx="7.5" ry="5.5" fill="rgba(252,211,77,.35)" stroke="#D97706" stroke-width=".4"/>
            <text ${TXT} x="38" y="34">ganglio</text>
            <text ${TXT} x="60" y="27">raíz dorsal</text>
            <text ${TXT} x="52" y="73">raíz ventral</text>
            <text ${TXT} x="21" y="55">nervio espinal</text>
            <text ${TXT} x="10" y="5.5">piel</text>
            <text ${TXT} x="23" y="88">músculo</text>`,
    },
    // MH-047: médula espinal de roedor dentro de la vértebra, con ambos ganglios (dorsal arriba)
    mh047: {
        guia: 'la médula, la vértebra y los ganglios',
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

const vbDe = m => (m && m.vb) || [100, 100];
/** Proporción ancho/alto del marco del molde. */
export function arMolde(id) { const [w, h] = vbDe(MOLDES[id]); return w / h; }

/** SVG del molde (capa = 'contorno' | 'esquema'), escalado al contenedor. */
export function svgMolde(id, capa = 'contorno', clase = '') {
    const m = MOLDES[id];
    if (!m || !m[capa]) return '';
    const [w, h] = vbDe(m);
    return `<svg class="nl-molde ${clase}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${m[capa]}</svg>`;
}

/** Imagen (para canvas) de una capa del molde, del ancho pedido. */
export function imagenMolde(id, capa, ancho) {
    const m = MOLDES[id];
    if (!m || !m[capa]) return Promise.resolve(null);
    const [w, h] = vbDe(m);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${Math.round(ancho * h / w)}" viewBox="0 0 ${w} ${h}">${m[capa]}</svg>`;
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
