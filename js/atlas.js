/**
 * NeuroLab — atlas.js
 * Carga topics + actividades, renderiza el árbol lateral numerado y la grilla filtrable.
 *
 * Árbol de temas:
 *   - los temas principales van en números romanos (I, II, III…) y parten colapsados
 *   - al presionar un tema principal se despliegan sus subtemas (I.1, I.2…)
 *   - un subtema con hijos se comporta igual, en cascada
 */
import { isDone } from './progress.js';
import { renderMapa } from './mapa.js';

const STATE = {
    topics: [],
    actividades: [],
    filtroTipo: 'todos',
    topicSel: null,
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
    if (STATE.topicSel) renderMapaTema();
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
    const hijos     = hijosDe(node.id);
    const tiene     = hijos.length > 0;
    const abierto   = STATE.abiertos.has(node.id);
    const activo    = Number(STATE.topicSel) === Number(node.id);

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

    return `
        <div class="${clases}" data-id="${node.id}" data-tiene="${tiene ? 1 : 0}"
             role="button" tabindex="0"
             ${tiene ? `aria-expanded="${abierto}"` : ''}
             title="${escapeHTML(node.nombre)}">
            <span class="nl-tree-node__num">${num}</span>
            <span class="nl-tree-node__ico">${node.icono || '•'}</span>
            <span class="nl-tree-node__txt">${escapeHTML(node.nombre)}</span>
            ${tiene ? `<span class="nl-tree-node__count" title="${hijos.length} subtema${hijos.length === 1 ? '' : 's'}">${hijos.length}</span>
                       <span class="nl-tree-node__chev" aria-hidden="true"></span>` : ''}
        </div>
        ${kidsHTML}`;
}

function enlazarTree() {
    document.querySelectorAll('#topic-tree .nl-tree-node').forEach(el => {
        const activar = () => seleccionarTema(+el.dataset.id, el.dataset.tiene === '1');
        el.addEventListener('click', activar);
        el.addEventListener('keydown', ev => {
            if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); activar(); }
        });
    });
}

/** Presionar un tema: lo selecciona y despliega/repliega sus subtemas. */
function seleccionarTema(id, tieneHijos) {
    const yaEstaba = Number(STATE.topicSel) === Number(id);

    if (tieneHijos) {
        // Si vuelvo a presionar el mismo tema ya abierto, lo repliego.
        if (STATE.abiertos.has(id) && yaEstaba) STATE.abiertos.delete(id);
        else STATE.abiertos.add(id);
    }

    STATE.topicSel = id;
    abrirRuta(id);
    renderTree();
    renderMapaTema();
    renderGrid();
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
   Enlace directo desde el home: atlas.php#topic-3 o atlas.php?topic=slug
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
        STATE.topicSel = id;
        STATE.abiertos.add(id);
        abrirRuta(id);
    }
}

/** Un enlace #topic-N dentro de la misma página no recarga: hay que escucharlo. */
window.addEventListener('hashchange', () => {
    const m = /^#topic-(\d+)$/.exec(location.hash || '');
    if (!m) return;
    const id = Number(m[1]);
    if (!STATE.topics.some(t => Number(t.id) === id)) return;
    STATE.abiertos.add(id);
    abrirRuta(id);
    STATE.topicSel = id;
    renderTree();
    renderMapaTema();
    renderGrid();
});

/* ---------------------------------------------------------------
   Mapa conceptual del tema seleccionado
   --------------------------------------------------------------- */
function renderMapaTema() {
    const host = document.getElementById('mapa-conceptual');
    if (!host) return;
    renderMapa(host, {
        topics: STATE.topics,
        actividades: STATE.actividades,
        topicId: STATE.topicSel,
    });
}

/* ---------------------------------------------------------------
   Grilla de actividades
   --------------------------------------------------------------- */
function renderGrid() {
    let acts = STATE.actividades;
    if (STATE.topicSel) {
        const ids = collectDescendants(STATE.topicSel);
        acts = acts.filter(a => ids.includes(Number(a.topic_id)));
    }
    if (STATE.filtroTipo !== 'todos') {
        acts = acts.filter(a => (a.tipo || '').toLowerCase().includes(STATE.filtroTipo)
                             || topicTipo(a.topic_id) === STATE.filtroTipo);
    }

    const grid = document.getElementById('act-grid');
    if (!acts.length) {
        grid.innerHTML = STATE.topicSel
            ? '<p class="text-muted">Este tema todavía no tiene actividades con este filtro.</p>'
            : '<p class="text-muted">Selecciona un tema para ver sus actividades.</p>';
        return;
    }

    grid.innerHTML = acts.map(a => {
        const done = isDone(a.slug) ? ' ✓' : '';
        const desc = (a.descripcion || '');
        return `
        <a class="nl-act-card" href="actividad.php?slug=${encodeURIComponent(a.slug)}">
            <span class="nl-act-card__tipo ${a.tipo}">${tipoLabel(a.tipo)}</span>
            <div class="nl-act-card__title">${escapeHTML(a.titulo)}${done}</div>
            <div class="nl-act-card__desc">${escapeHTML(desc.slice(0, 120))}${desc.length > 120 ? '…' : ''}</div>
        </a>`;
    }).join('');
}

function collectDescendants(rootId) {
    const out = [Number(rootId)];
    const stack = [Number(rootId)];
    while (stack.length) {
        const cur = stack.pop();
        hijosDe(cur).forEach(c => { out.push(Number(c.id)); stack.push(Number(c.id)); });
    }
    return out;
}

function topicTipo(id) {
    const t = STATE.topics.find(x => Number(x.id) === Number(id));
    return t ? (t.tipo || '').toLowerCase() : '';
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
