/**
 * NeuroLab — pool.js
 * Filtros del pool, armado de un práctico (vista previa + bloque para data/practicos.php)
 * y, en modo docente, guardado del estado y la nota de revisión (api/estado.php).
 * La selección se recuerda en este navegador (localStorage nl_pool_sel).
 */
const KEY = 'nl_pool_sel';
const vars = Array.from(document.querySelectorAll('.nl-var'));
const porSlug = Object.fromEntries(vars.map(li => [li.dataset.slug, li]));
const filtro = { estado: new Set(), enfoque: new Set(), tema: '', texto: '' };

/* ---------- Filtros ---------- */
function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

function aplicar() {
    let n = 0;
    document.querySelectorAll('.nl-pool-tema').forEach(sec => {
        const temaOk = !filtro.tema || sec.dataset.tema === filtro.tema;
        let visTema = 0;
        sec.querySelectorAll('.nl-fam').forEach(fam => {
            let visFam = 0;
            fam.querySelectorAll('.nl-var').forEach(li => {
                const ok = temaOk
                    && (!filtro.estado.size || filtro.estado.has(li.dataset.estado))
                    && (!filtro.enfoque.size || filtro.enfoque.has(li.dataset.enfoque))
                    && (!filtro.texto || norm(li.dataset.busca).includes(filtro.texto));
                li.hidden = !ok;
                if (ok) visFam++;
            });
            fam.hidden = !visFam;
            visTema += visFam;
        });
        sec.hidden = !visTema;
        n += visTema;
    });
    document.getElementById('f-n').textContent = `${n} de ${vars.length} actividades`;
}

document.querySelectorAll('[data-f-estado], [data-f-enfoque]').forEach(b => b.addEventListener('click', () => {
    const [grupo, valor] = b.dataset.fEstado ? ['estado', b.dataset.fEstado] : ['enfoque', b.dataset.fEnfoque];
    const s = filtro[grupo];
    s.has(valor) ? s.delete(valor) : s.add(valor);
    b.setAttribute('aria-pressed', s.has(valor) ? 'true' : 'false');
    aplicar();
}));
document.getElementById('f-tema').addEventListener('change', e => { filtro.tema = e.target.value; aplicar(); });
document.getElementById('f-texto').addEventListener('input', e => { filtro.texto = norm(e.target.value.trim()); aplicar(); });

/* ---------- Armar práctico ---------- */
let sel = [];
try { sel = JSON.parse(localStorage.getItem(KEY) || '[]').filter(s => porSlug[s]); } catch { sel = []; }
const guardarSel = () => { try { localStorage.setItem(KEY, JSON.stringify(sel)); } catch { /* */ } };

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function phpStr(s) { return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"; }

function bloquePhp() {
    const pasos = sel.map(s => {
        const li = porSlug[s];
        const guia = (window.NL_GUIA || {})[s] || {};
        const g = Object.keys(guia).length
            ? '[' + Object.entries(guia).map(([k, v]) => `${phpStr(k)} => ${phpStr(v)}`).join(', ') + ']'
            : '[]';
        return `            ['slug' => ${phpStr(s)},\n             'titulo' => ${phpStr(li.dataset.titulo)},\n             'tarea' => '',\n             'guia' => ${g}],`;
    }).join('\n');
    return `    'nuevo-practico' => [
        'titulo'     => 'Nuevo práctico',
        'asignatura' => 'Asignatura · Carrera',
        'objetivo'   => '',
        'intro'      => 'Avanza a tu ritmo. Cada actividad se corrige sola: cuando la completes, súmala a tu guía de estudio.',
        'pasos' => [
${pasos}
        ],
    ],`;
}

function pintarArmar() {
    vars.forEach(li => { li.querySelector('.nl-var__check input').checked = sel.includes(li.dataset.slug); });
    const caja = document.getElementById('nl-armar');
    caja.hidden = !sel.length;
    document.body.classList.toggle('nl-con-armar', sel.length > 0);
    document.getElementById('nl-armar-n').textContent = sel.length;
    document.getElementById('nl-armar-ver').href = 'practico.php?armar=' + encodeURIComponent(sel.join(','));
    document.getElementById('nl-armar-lista').innerHTML = sel.map((s, i) => {
        const li = porSlug[s];
        return `<li data-slug="${esc(s)}"><span>${esc(li.dataset.titulo)}</span>
            <button type="button" data-mover="-1" ${i === 0 ? 'disabled' : ''} aria-label="Subir">↑</button>
            <button type="button" data-mover="1" ${i === sel.length - 1 ? 'disabled' : ''} aria-label="Bajar">↓</button>
            <button type="button" data-quitar aria-label="Quitar">✕</button></li>`;
    }).join('');
    document.getElementById('nl-armar-txt').value = bloquePhp();
}

vars.forEach(li => li.querySelector('.nl-var__check input').addEventListener('change', e => {
    const s = li.dataset.slug;
    sel = e.target.checked ? sel.concat(sel.includes(s) ? [] : [s]) : sel.filter(x => x !== s);
    guardarSel(); pintarArmar();
}));
document.getElementById('nl-armar-lista').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const s = b.closest('li').dataset.slug, i = sel.indexOf(s);
    if (b.hasAttribute('data-quitar')) sel.splice(i, 1);
    else { const j = i + Number(b.dataset.mover); [sel[i], sel[j]] = [sel[j], sel[i]]; }
    guardarSel(); pintarArmar();
});
document.getElementById('nl-armar-limpiar').addEventListener('click', () => { sel = []; guardarSel(); pintarArmar(); });
document.getElementById('nl-armar-codigo').addEventListener('click', () => {
    const c = document.getElementById('nl-armar-code'); c.hidden = !c.hidden;
});
document.getElementById('nl-armar-copiar').addEventListener('click', async e => {
    const t = document.getElementById('nl-armar-txt');
    try { await navigator.clipboard.writeText(t.value); } catch { t.select(); document.execCommand('copy'); }
    e.target.textContent = '✓ Copiado';
    setTimeout(() => { e.target.textContent = 'Copiar'; }, 1500);
});

/* ---------- Modo docente: estado y nota ---------- */
vars.forEach(li => {
    const btn = li.querySelector('.nl-var__guardar');
    if (!btn) return;
    const selEstado = li.querySelector('.nl-var__estado select');
    const nota = li.querySelector('.nl-var__rev textarea');
    const ok = li.querySelector('.nl-var__ok');
    btn.addEventListener('click', async () => {
        btn.disabled = true; ok.textContent = '…';
        const body = new URLSearchParams({ slug: li.dataset.slug, estado: selEstado.value, nota: nota ? nota.value : '' });
        try {
            const r = await fetch('api/estado.php', { method: 'POST', body });
            const j = await r.json();
            if (!j.ok) throw new Error(j.error || 'Error');
            li.dataset.estado = j.estado;
            ok.textContent = '✓ ' + j.fecha;
        } catch (err) {
            ok.textContent = '⚠ ' + err.message;
        }
        btn.disabled = false;
    });
});

pintarArmar();
aplicar();
