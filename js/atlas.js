/**
 * NeuroLab — atlas.js
 * Índice de temas: árbol lateral numerado + grilla de actividades filtrable.
 *
 * Árbol de temas:
 *   - los temas principales van en números romanos (I, II, III…) y parten colapsados
 *   - el NOMBRE del tema es un enlace: abre su página propia (tema.php?slug=…),
 *     donde vive el mapa conceptual, la descripción, los quices y el material del tema
 *   - el chevron de la derecha despliega/repliega los subtemas sin salir del atlas
 */
import { isDone } from './progress.js';

const STATE = {
    topics: [],
    actividades: [],
    filtroTipo: 'todos',
    destacado: null,       // tema resaltado por enlace directo (?topic= / #topic-N)
    abiertos: new Set(),   // ids de temas desplegados
};

async function load() {
    const [tRes, aRes] = await Promise.all([
        fetch('api/topics.php').then(r => r.json()),
        fetch('api/actividades.php').then(r => r.json()),
    ]);
    STATE.topics      = tRes.topics || [];
    STATE.actividades = aRes.actividades || [];

    aplicarEnlaceDirecto();
    renderTree();
    renderGrid();
}

/* ---------------------------------------------------------------
   Árbol lateral numerado y desplegable
   --------------------------------------------------------------- */

/** Convierte 1..3999 a número romano (I, II, III, IV…). */
function romano(n) {
    const tabla = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
                   [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    let resto = Math.floor(n), out = '';
    if (!(resto > 0)) return String(n);
    for (const [valor, letra] of tabla) {
        while (resto >= valor) { out += letra; resto -= valor; }
    }
    return out;
}

function hijosDe(id) {
    return STATE.topics
        .filter(t => Number(t.parent_id) === Number(id))
        .sort((a, b) => (a.orden - b.orden) || a.nombre.localeCompare(b.nombre));
}

function raices() {
    return STATE.topics
        .filter(t => !t.parent_id)
        .sort((a, b) => (a.orden - b.orden) || a.nombre.localeCompare(b.nombre));
}

function renderTree() {
    const html = raices().map((r, i) => nodeHTML(r, romano(i + 1), 0)).join('');
    const cont = document.getElementById('topic-tree');
    cont.innerHTML = html || '<p class="text-muted text-sm">Sin temas aún.</p>';
    enlazarTree();
    actualizarBotonTodo();
}

function nodeHTML(node, num, depth) {
    const hijos   = hijosDe(node.id);
    const tiene   = hijos.length > 0;
    const abierto = STATE.abiertos.has(node.id);
    const activo  = Number(STATE.destacado) === Number(node.id);

    const clases = [
        'nl-tree-node',
        depth === 0 ? 'is-root' : 'is-child',
        tiene ? 'has-children' : '',
        abierto ? 'is-open' : '',
        activo ? 'active' : '',
    ].filter(Boolean).join(' ');

    const kidsHTML = tiene
        ? `<div class="nl-tree-children"${abierto ? '' : ' hidden'}>
               ${hijos.map((c, i) => nodeHTML(c, `${num}.${i + 1}`, depth + 1)).join('')}
           </div>`
        : '';

    const toggleHTML = tiene
        ? `<button type="button" class="nl-tree-node__toggle" data-id="${node.id}"
                   aria-expanded="${abierto}"
                   aria-label="${abierto ? 'Ocultar' : 'Mostrar'} los ${hijos.length} subtemas de ${escapeHTML(node.nombre)}">
               <span class="nl-tree-node__count">${hijos.length}</span>
               <span class="nl-tree-node__chev" aria-hidden="true"></span>
           </button>`
        : '';

    return `
        <div class="${clases}" data-id="${node.id}">
            <a class="nl-tree-node__link" href="tema.php?slug=${encodeURIComponent(node.slug)}"
               title="Abrir la página de ${escapeHTML(node.nombre)}">
                <span class="nl-tree-node__num">${num}</span>
                <span class="nl-tree-node__ico">${node.icono || '•'}</span>
                <span class="nl-tree-node__txt">${escapeHTML(node.nombre)}</span>
            </a>
            ${toggleHTML}
        </div>
        ${kidsHTML}`;
}

function enlazarTree() {
    document.querySelectorAll('#topic-tree .nl-tree-node__toggle').forEach(btn => {
        btn.addEventListener('click', ev => {
            ev.preventDefault();
            ev.stopPropagation();
            const id = Number(btn.dataset.id);
            if (STATE.abiertos.has(id)) STATE.abiertos.delete(id);
            else STATE.abiertos.add(id);
            renderTree();
        });
    });
}

/** Deja visible la ruta desde la raíz hasta el tema indicado. */
function abrirRuta(id) {
    const visto = new Set();
    let cur = STATE.topics.find(t => Number(t.id) === Number(id));
    while (cur && cur.parent_id && !visto.has(cur.id)) {
        visto.add(cur.id);
        STATE.abiertos.add(Number(cur.parent_id));
        cur = STATE.topics.find(t => Number(t.id) === Number(cur.parent_id));
    }
}

/* --- Botón expandir / colapsar todo --- */
function conHijos() {
    return STATE.topics.filter(t => hijosDe(t.id).length).map(t => Number(t.id));
}

function actualizarBotonTodo() {
    const btn = document.getElementById('tree-toggle-all');
    if (!btn) return;
    const todos = conHijos();
    const todoAbierto = todos.length > 0 && todos.every(id => STATE.abiertos.has(id));
    btn.textContent = todoAbierto ? 'Colapsar todo' : 'Expandir todo';
    btn.dataset.modo = todoAbierto ? 'colapsar' : 'expandir';
}

document.getElementById('tree-toggle-all')?.addEventListener('click', () => {
    const btn = document.getElementById('tree-toggle-all');
    if (btn.dataset.modo === 'colapsar') STATE.abiertos.clear();
    else conHijos().forEach(id => STATE.abiertos.add(id));
    renderTree();
});

/* ---------------------------------------------------------------
   Enlace directo: atlas.php#topic-3 o atlas.php?topic=slug
   Resalta el tema en el árbol (la página del tema es tema.php).
   --------------------------------------------------------------- */
function aplicarEnlaceDirecto() {
    const params = new URLSearchParams(location.search);

    const tipo = params.get('tipo');
    if (tipo) {
        const tab = document.querySelector(`.nl-atlas-tab[data-filtro="${CSS.escape(tipo)}"]`);
        if (tab) {
            document.querySelectorAll('.nl-atlas-tab').forEach(b => b.classList.remove('active'));
            tab.classList.add('active');
            STATE.filtroTipo = tipo;
        }
    }

    let id = null;
    const slug = params.get('topic');
    if (slug) {
        const t = STATE.topics.find(x => x.slug === slug);
        if (t) id = Number(t.id);
    }
    const m = /^#topic-(\d+)$/.exec(location.hash || '');
    if (!id && m) id = Number(m[1]);

    if (id && STATE.topics.some(t => Number(t.id) === id)) {
        STATE.destacado = id;
        STATE.abiertos.add(id);
        abrirRuta(id);
    }
}

window.addEventListener('hashchange', () => {
    const m = /^#topic-(\d+)$/.exec(location.hash || '');
    if (!m) return;
    const id = Number(m[1]);
    if (!STATE.topics.some(t => Number(t.id) === id)) return;
    STATE.destacado = id;
    STATE.abiertos.add(id);
    abrirRuta(id);
    renderTree();
});

/* ---------------------------------------------------------------
   Grilla de actividades (todas, filtrables por tipo)
   --------------------------------------------------------------- */
function renderGrid() {
    let acts = STATE.actividades;
    if (STATE.filtroTipo !== 'todos') {
        acts = acts.filter(a => (a.tipo || '').toLowerCase().includes(STATE.filtroTipo)
                             || topicTipo(a.topic_id) === STATE.filtroTipo);
    }

    const contador = document.getElementById('act-count');
    if (contador) {
        contador.textContent = acts.length === 1 ? '1 actividad' : `${acts.length} actividades`;
    }

    const grid = document.getElementById('act-grid');
    if (!acts.length) {
        grid.innerHTML = '<p class="text-muted">No hay actividades con este filtro.</p>';
        return;
    }

    grid.innerHTML = acts.map(a => {
        const done = isDone(a.slug) ? ' ✓' : '';
        const desc = (a.descripcion || '');
        const tema = topicNombre(a.topic_id);
        return `
        <a class="nl-act-card" href="actividad.php?slug=${encodeURIComponent(a.slug)}">
            <span class="nl-act-card__tipo ${a.tipo}">${tipoLabel(a.tipo)}</span>
            <div class="nl-act-card__title">${escapeHTML(a.titulo)}${done}</div>
            <div class="nl-act-card__desc">${escapeHTML(desc.slice(0, 120))}${desc.length > 120 ? '…' : ''}</div>
            ${tema ? `<span class="nl-act-card__origen">en ${escapeHTML(tema)}</span>` : ''}
        </a>`;
    }).join('');
}

function topicTipo(id) {
    const t = STATE.topics.find(x => Number(x.id) === Number(id));
    return t ? (t.tipo || '').toLowerCase() : '';
}

function topicNombre(id) {
    const t = STATE.topics.find(x => Number(x.id) === Number(id));
    return t ? t.nombre : '';
}

function tipoLabel(t) {
    return ({
        lamina:     '🔬 Lámina',
        simulador:  '🎛️ Simulador',
        comparador: '🔄 Comparador',
        labeling:   '🏷️ Identificación',
        quiz:       '✏️ Quiz',
    })[t] || t;
}

function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Tabs de filtro */
document.querySelectorAll('.nl-atlas-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nl-atlas-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.filtroTipo = btn.dataset.filtro;
        renderGrid();
    });
});

load();
