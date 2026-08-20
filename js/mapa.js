/**
 * NeuroLab — mapa.js
 * Mapa conceptual jerárquico: de lo general a lo específico.
 *
 * Se construye con los datos que ya expone la API (topics + actividades):
 *   - los `topics` aportan la jerarquía (parent_id)
 *   - las `actividades` cuelgan de su topic como nodos finales
 *
 * Al elegir un tema, el mapa se dibuja SIEMPRE desde su ancestro más general
 * y resalta la ruta hasta el tema elegido, para que se lea de general a específico.
 *
 * Sin dependencias externas. Conectores dibujados en SVG a partir del DOM.
 */

import { isDone } from './progress.js';

/* ---------------------------------------------------------------
   Estado interno del componente
   --------------------------------------------------------------- */
const M = {
    host: null,          // contenedor donde se pinta
    topics: [],
    actividades: [],
    rootId: null,        // id del topic raíz del mapa
    pathIds: [],         // ruta raíz → tema elegido (ids de topic)
    currentId: null,     // topic elegido en el árbol lateral
    expanded: new Set(), // claves de nodo expandidas
    selected: null,      // clave del nodo con detalle abierto
};

const ICONO_TIPO = {
    lamina:     '🔬',
    simulador:  '🎛️',
    comparador: '🔄',
    labeling:   '🏷️',
    quiz:       '✏️',
};

const LABEL_TIPO = {
    lamina:     'Lámina',
    simulador:  'Simulador',
    comparador: 'Comparador',
    labeling:   'Identificación',
    quiz:       'Quiz',
};

/* ---------------------------------------------------------------
   API pública
   --------------------------------------------------------------- */

/**
 * Dibuja el mapa conceptual del tema indicado.
 * @param {HTMLElement} host        contenedor destino
 * @param {Object}      datos       { topics, actividades, topicId }
 */
export function renderMapa(host, { topics, actividades, topicId }) {
    M.host = host;
    M.topics = topics || [];
    M.actividades = actividades || [];
    M.currentId = topicId ?? null;

    if (!host) return;

    if (!M.currentId) {
        host.innerHTML = '';
        return;
    }

    const topic = findTopic(M.currentId);
    if (!topic) { host.innerHTML = ''; return; }

    M.pathIds = pathToRoot(topic.id);
    M.rootId  = M.pathIds[0];

    // Por defecto: abrimos la ruta desde la raíz hasta el tema elegido,
    // más los hijos directos del tema elegido.
    M.expanded = new Set(M.pathIds.map(id => 't' + id));
    M.selected = null;

    paint();
}

/** Limpia el mapa (por ejemplo, al deseleccionar el tema). */
export function clearMapa(host) {
    if (host) host.innerHTML = '';
    M.currentId = null;
    M.selected = null;
}

/* ---------------------------------------------------------------
   Modelo: construcción del árbol
   --------------------------------------------------------------- */

function findTopic(id) {
    return M.topics.find(t => Number(t.id) === Number(id)) || null;
}

/** Devuelve [raizId, ..., id] subiendo por parent_id. Protegido contra ciclos. */
function pathToRoot(id) {
    const out = [];
    const visto = new Set();
    let cur = findTopic(id);
    while (cur && !visto.has(cur.id)) {
        visto.add(cur.id);
        out.unshift(cur.id);
        cur = cur.parent_id ? findTopic(cur.parent_id) : null;
    }
    return out;
}

/** Nodo de tema, con sus sub-temas y sus actividades como hijos. */
function buildNode(topic) {
    const subTemas = M.topics
        .filter(t => Number(t.parent_id) === Number(topic.id))
        .sort((a, b) => (a.orden - b.orden) || a.nombre.localeCompare(b.nombre))
        .map(buildNode);

    const acts = M.actividades
        .filter(a => Number(a.topic_id) === Number(topic.id))
        .sort((a, b) => a.titulo.localeCompare(b.titulo))
        .map(a => ({
            key: 'a' + a.id,
            kind: 'act',
            nombre: a.titulo,
            icono: ICONO_TIPO[a.tipo] || '•',
            descripcion: a.descripcion || '',
            slug: a.slug,
            tipo: a.tipo,
            children: [],
        }));

    return {
        key: 't' + topic.id,
        id: topic.id,
        kind: 'topic',
        nombre: topic.nombre,
        icono: topic.icono || '•',
        tipo: topic.tipo || '',
        children: [...subTemas, ...acts],
    };
}

/**
 * Reparte los nodos visibles en columnas por profundidad.
 * Un nodo aparece si su padre está expandido.
 */
function buildLevels(root) {
    const niveles = [];
    let actual = [{ node: root, parentKey: null }];
    let depth = 0;

    while (actual.length && depth < 12) {
        niveles.push(actual);
        const siguiente = [];
        actual.forEach(({ node }) => {
            if (M.expanded.has(node.key)) {
                node.children.forEach(c => siguiente.push({ node: c, parentKey: node.key }));
            }
        });
        actual = siguiente;
        depth++;
    }
    return niveles;
}

/* ---------------------------------------------------------------
   Render
   --------------------------------------------------------------- */

function paint() {
    const topic = findTopic(M.currentId);
    if (!topic) return;

    const root = buildNode(findTopic(M.rootId));
    const niveles = buildLevels(root);
    const pathKeys = new Set(M.pathIds.map(id => 't' + id));

    const columnas = niveles.map((fila, i) => `
        <div class="nl-mapa__level" data-depth="${i}">
            <span class="nl-mapa__level-label">${etiquetaNivel(i, niveles.length)}</span>
            ${fila.map(({ node, parentKey }) => nodoHTML(node, parentKey, pathKeys)).join('')}
        </div>
    `).join('');

    M.host.innerHTML = `
        <div class="nl-mapa">
            <div class="nl-mapa__head">
                <div>
                    <div class="nl-mapa__title">🗺️ Mapa conceptual</div>
                    <div class="nl-mapa__hint">De lo general a lo específico · haz clic en un nodo para expandirlo y ver su detalle</div>
                </div>
                <div class="nl-mapa__actions">
                    <button class="nl-mapa__btn" data-accion="expandir">Expandir todo</button>
                    <button class="nl-mapa__btn" data-accion="colapsar">Colapsar</button>
                </div>
            </div>
            <div class="nl-mapa__canvas">
                <div class="nl-mapa__levels">
                    <svg class="nl-mapa__links" aria-hidden="true"></svg>
                    ${columnas}
                </div>
            </div>
            <div class="nl-mapa__detail-slot"></div>
        </div>`;

    conectar();
    enlazarEventos(root);
    if (M.selected) pintarDetalle(root);
}

function etiquetaNivel(i, total) {
    if (i === 0) return 'General';
    if (i === total - 1 && total > 1) return 'Específico';
    return 'Nivel ' + (i + 1);
}

function nodoHTML(node, parentKey, pathKeys) {
    const tieneHijos = node.children.length > 0;
    const abierto    = M.expanded.has(node.key);
    const esRuta     = pathKeys.has(node.key);
    const esActual   = node.kind === 'topic' && Number(node.id) === Number(M.currentId);
    const esSel      = M.selected === node.key;
    const hecho      = node.kind === 'act' && isDone(node.slug);

    const clases = [
        'nl-mapa__node',
        node.kind === 'act' ? 'is-act' : '',
        esRuta   ? 'is-path' : '',
        esActual ? 'is-current' : '',
        esSel    ? 'is-selected' : '',
    ].filter(Boolean).join(' ');

    const badge = tieneHijos
        ? `<span class="nl-mapa__badge">${abierto ? '−' : '+' + node.children.length}</span>`
        : '';

    return `
        <button type="button" class="${clases}"
                data-key="${node.key}"
                data-parent="${parentKey || ''}"
                ${tieneHijos ? `aria-expanded="${abierto}"` : ''}>
            <span class="nl-mapa__node-ico">${node.icono}</span>
            <span class="nl-mapa__node-txt">${esc(node.nombre)}${hecho ? ' ✓' : ''}</span>
            ${badge}
        </button>`;
}

/* --- Conectores SVG entre padre e hijo --- */
function conectar() {
    const wrap = M.host.querySelector('.nl-mapa__levels');
    const svg  = M.host.querySelector('.nl-mapa__links');
    if (!wrap || !svg) return;

    const base = wrap.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`);
    svg.setAttribute('width', base.width);
    svg.setAttribute('height', base.height);

    const paths = [];
    M.host.querySelectorAll('.nl-mapa__node[data-parent]').forEach(el => {
        const padreKey = el.dataset.parent;
        if (!padreKey) return;
        const padre = M.host.querySelector(`.nl-mapa__node[data-key="${padreKey}"]`);
        if (!padre) return;

        const a = padre.getBoundingClientRect();
        const b = el.getBoundingClientRect();

        const x1 = a.right - base.left;
        const y1 = a.top + a.height / 2 - base.top;
        const x2 = b.left - base.left;
        const y2 = b.top + b.height / 2 - base.top;
        const mx = x1 + (x2 - x1) / 2;

        const enRuta = padre.classList.contains('is-path') && el.classList.contains('is-path');
        paths.push(
            `<path class="nl-mapa__link${enRuta ? ' is-path' : ''}" ` +
            `d="M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}" />`
        );
    });
    svg.innerHTML = paths.join('');
}

/* --- Panel de detalle --- */
function pintarDetalle(root) {
    const slot = M.host.querySelector('.nl-mapa__detail-slot');
    if (!slot) return;

    const node = buscarNodo(root, M.selected);
    if (!node) { slot.innerHTML = ''; return; }

    const ruta = rutaDe(root, M.selected).map(n => esc(n.nombre));
    const rutaHTML = ruta.length > 1
        ? `<div class="nl-mapa__detail-ruta">${ruta.slice(0, -1).join(' › ')} › <span>${ruta[ruta.length - 1]}</span></div>`
        : '';

    let cuerpo = '';
    if (node.kind === 'act') {
        cuerpo = `
            <p>${esc(node.descripcion) || 'Sin descripción.'}</p>
            <a class="nl-mapa__detail-link" href="actividad.php?slug=${encodeURIComponent(node.slug)}">
                Ir a la actividad →
            </a>`;
    } else {
        const nSub  = node.children.filter(c => c.kind === 'topic').length;
        const nActs = node.children.filter(c => c.kind === 'act').length;
        const partes = [];
        if (nSub)  partes.push(`${nSub} sub-tema${nSub === 1 ? '' : 's'}`);
        if (nActs) partes.push(`${nActs} actividad${nActs === 1 ? '' : 'es'}`);
        cuerpo = `<p>${partes.length
            ? 'Este tema agrupa ' + partes.join(' y ') + '.'
            : 'Este tema todavía no tiene sub-temas ni actividades asociadas.'}</p>`;
    }

    const etiqueta = node.kind === 'act'
        ? `<span class="badge badge-violet">${esc(LABEL_TIPO[node.tipo] || node.tipo)}</span>`
        : '<span class="badge badge-violet">Tema</span>';

    slot.innerHTML = `
        <div class="nl-mapa__detail">
            <div class="nl-mapa__detail-head">
                <span class="nl-mapa__detail-title">${node.icono} ${esc(node.nombre)}</span>
                ${etiqueta}
            </div>
            ${rutaHTML}
            ${cuerpo}
        </div>`;
}

function buscarNodo(node, key) {
    if (!node) return null;
    if (node.key === key) return node;
    for (const c of node.children) {
        const hit = buscarNodo(c, key);
        if (hit) return hit;
    }
    return null;
}

function rutaDe(node, key, acc = []) {
    if (!node) return [];
    const camino = [...acc, node];
    if (node.key === key) return camino;
    for (const c of node.children) {
        const hit = rutaDe(c, key, camino);
        if (hit.length) return hit;
    }
    return [];
}

/* --- Eventos --- */
function enlazarEventos(root) {
    M.host.querySelectorAll('.nl-mapa__node').forEach(el => {
        el.addEventListener('click', () => {
            const key = el.dataset.key;
            const node = buscarNodo(root, key);

            if (node && node.children.length) {
                M.expanded.has(key) ? M.expanded.delete(key) : M.expanded.add(key);
            }
            M.selected = key;
            paint();
        });
    });

    M.host.querySelectorAll('.nl-mapa__btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.accion === 'expandir') {
                todasLasClaves(root).forEach(k => M.expanded.add(k));
            } else {
                M.expanded = new Set([root.key]);
                M.selected = null;
            }
            paint();
        });
    });

    // Recalcular conectores si cambia el ancho disponible
    if (!M._resizeAttached) {
        window.addEventListener('resize', () => {
            if (M.host && M.host.querySelector('.nl-mapa__levels')) conectar();
        });
        M._resizeAttached = true;
    }
}

function todasLasClaves(node, acc = []) {
    if (node.children.length) acc.push(node.key);
    node.children.forEach(c => todasLasClaves(c, acc));
    return acc;
}

/* --- Utilidades --- */
function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
