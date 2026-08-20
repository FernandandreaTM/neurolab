/**
 * NeuroLab — atlas.js
 * Carga topics + actividades, renderiza árbol lateral y grilla filtrable.
 */
import { isDone } from './progress.js';
import { renderMapa } from './mapa.js';

const STATE = { topics: [], actividades: [], filtroTipo: 'todos', topicSel: null };

async function load() {
    const [tRes, aRes] = await Promise.all([
        fetch('api/topics.php').then(r => r.json()),
        fetch('api/actividades.php').then(r => r.json()),
    ]);
    STATE.topics      = tRes.topics || [];
    STATE.actividades = aRes.actividades || [];
    renderTree();
    renderGrid();
}

function renderTree() {
    const roots = STATE.topics.filter(t => !t.parent_id);
    const html = roots.map(r => nodeHTML(r)).join('');
    document.getElementById('topic-tree').innerHTML = html || '<p class="text-muted text-sm">Sin temas aún.</p>';

    document.querySelectorAll('.nl-tree-node').forEach(el => {
        el.addEventListener('click', () => {
            STATE.topicSel = +el.dataset.id;
            document.querySelectorAll('.nl-tree-node').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
            renderMapaTema();
            renderGrid();
        });
    });
}

/** Dibuja el mapa conceptual del tema seleccionado. */
function renderMapaTema() {
    const host = document.getElementById('mapa-conceptual');
    if (!host) return;
    renderMapa(host, {
        topics: STATE.topics,
        actividades: STATE.actividades,
        topicId: STATE.topicSel,
    });
}

function nodeHTML(node) {
    const children = STATE.topics.filter(t => t.parent_id === node.id);
    const kidsHTML = children.length
        ? `<div class="nl-tree-children">${children.map(nodeHTML).join('')}</div>`
        : '';
    return `
        <div class="nl-tree-node" data-id="${node.id}">
            <span>${node.icono || '•'}</span>
            <span>${escapeHTML(node.nombre)}</span>
        </div>
        ${kidsHTML}`;
}

function renderGrid() {
    let acts = STATE.actividades;
    if (STATE.topicSel) acts = acts.filter(a => {
        // incluir si la actividad está en el topic o en un descendiente
        const tId = STATE.topicSel;
        const ids = collectDescendants(tId);
        return ids.includes(a.topic_id);
    });
    if (STATE.filtroTipo !== 'todos') {
        acts = acts.filter(a => (a.tipo || '').toLowerCase().includes(STATE.filtroTipo) || topicTipo(a.topic_id) === STATE.filtroTipo);
    }

    if (!acts.length) {
        document.getElementById('act-grid').innerHTML = '<p class="text-muted">No hay actividades en este filtro.</p>';
        return;
    }

    document.getElementById('act-grid').innerHTML = acts.map(a => {
        const done = isDone(a.slug) ? ' ✓' : '';
        return `
        <a class="nl-act-card" href="actividad.php?slug=${encodeURIComponent(a.slug)}">
            <span class="nl-act-card__tipo ${a.tipo}">${tipoLabel(a.tipo)}</span>
            <div class="nl-act-card__title">${escapeHTML(a.titulo)}${done}</div>
            <div class="nl-act-card__desc">${escapeHTML((a.descripcion || '').slice(0, 120))}…</div>
        </a>`;
    }).join('');
}

function collectDescendants(rootId) {
    const out = [rootId];
    const stack = [rootId];
    while (stack.length) {
        const cur = stack.pop();
        STATE.topics.filter(t => t.parent_id === cur).forEach(c => {
            out.push(c.id);
            stack.push(c.id);
        });
    }
    return out;
}

function topicTipo(id) {
    const t = STATE.topics.find(x => x.id === id);
    return t ? (t.tipo || '').toLowerCase() : '';
}

function tipoLabel(t) {
    return ({
        lamina: '🔬 Lámina',
        simulador: '� Simulador',
        comparador: '🔄 Comparador',
        labeling: '🏷️ Identificación',
        quiz: '✏️ Quiz',
    })[t] || t;
}

function escapeHTML(s) {
    return String(s || '').replace(/[&<>"']/g, c =>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Tabs de filtro
document.querySelectorAll('.nl-atlas-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nl-atlas-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.filtroTipo = btn.dataset.filtro;
        renderGrid();
    });
});

load();
