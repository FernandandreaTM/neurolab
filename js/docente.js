/**
 * NeuroLab — docente.js  (sólo se carga en modo docente: _partials/docente.php)
 * · En un nivel: botón «⚡ Autocompletar» que lo deja completo (respuestas correctas, sin errores).
 * · En la ruta del práctico: «Completar todo» (nivel por nivel, en orden, y abre la guía) y «Reiniciar».
 * La lámina se completa con una imagen de ejemplo en vez de las capturas.
 */
const raiz = document.querySelector('#nl-lab, #nl-tip, #nl-lam, #nl-quiz');
const url = new URL(location.href);

function leer(k, def) { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? def; } catch { return def; } }
function poner(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
function hecho(clave) { if (!clave) return; const p = leer('nl_progress', {}); p[clave] = Date.now(); poner('nl_progress', p); }

async function api(params) {
    const r = await fetch('api/autocompletar.php?' + new URLSearchParams(params), { cache: 'no-store' });
    const d = await r.json();
    if (!d.ok) throw new Error(d.error || 'sin respuestas');
    return d;
}

/** Imagen de ejemplo para la lámina (en lugar de la captura del estudiante). */
function imagenEjemplo(titulo) {
    const c = document.createElement('canvas');
    c.width = 900; c.height = 560;
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 900, 560);
    gr.addColorStop(0, '#E9D9B8'); gr.addColorStop(1, '#C9B08A');
    g.fillStyle = gr; g.fillRect(0, 0, 900, 560);
    g.strokeStyle = 'rgba(60,40,20,.35)'; g.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
        g.beginPath(); g.moveTo(Math.random() * 900, Math.random() * 560);
        g.bezierCurveTo(Math.random() * 900, Math.random() * 560, Math.random() * 900, Math.random() * 560, Math.random() * 900, Math.random() * 560);
        g.stroke();
    }
    g.fillStyle = 'rgba(26,14,46,.78)'; g.fillRect(0, 230, 900, 100);
    g.fillStyle = '#fff'; g.textAlign = 'center';
    g.font = 'bold 30px Arial, sans-serif'; g.fillText(titulo, 450, 272);
    g.font = '20px Arial, sans-serif'; g.fillText('Imagen de ejemplo (modo docente)', 450, 308);
    return c.toDataURL('image/jpeg', 0.75);
}

/** Deja completo el nivel de esta página (escribe el avance como si se hubiera respondido todo bien). */
async function completarNivel() {
    const d = raiz.dataset;
    hecho(d.requiere);
    if (raiz.id === 'nl-lab') {
        const { partes } = await api({ tipo: 'labeling', slug: d.slug });
        const est = { partes: {}, err: 0 };
        partes.forEach(p => { est.partes[p.id] = { n: p.n, f: p.f, d: p.d, a: [], nombreOk: true, r: p.n, errF: 0 }; });
        poner('nl_lab2_' + (d.clave || d.slug), est);   // la lámina usa '<slug>:1'
    } else if (raiz.id === 'nl-tip') {
        const { items } = await api({ tipo: 'practica', nivel: d.nivel });
        poner('nl_tipos_' + d.nivel, { items, err: 0 });
    } else if (raiz.id === 'nl-lam') {
        const caps = JSON.parse(d.capturas || '[]');
        const est = { caps: {}, err: 0 };
        caps.forEach(c => {
            const pines = {};
            (c.etiquetas || []).forEach((t, i, a) => { pines[t] = [20 + 60 * (i + 0.5) / a.length, 25 + (i % 2) * 45]; });
            const preg = {};
            (c.preguntas || []).forEach((q, i) => { preg[i] = { mal: [], orden: q.ops.map((_, k) => k), ok: true }; });
            est.caps[c.clave] = { paso: 'preguntas', listo: true, img: imagenEjemplo(c.titulo), pines, preg, err: 0 };
        });
        poner('nl_lam_' + d.clave, est);
    } else if (raiz.id === 'nl-quiz') {
        const todas = JSON.parse(d.preguntas || '[]');
        const car = localStorage.getItem('nl_carrera') || 'terapia-ocupacional';
        const pool = todas.filter(q => q.carrera === 'comun' || q.carrera === car);
        const resp = {};
        pool.forEach(q => { resp[q.id] = q.correcta; });
        poner('nl_quiz_' + d.slug + '_' + car, { orden: pool.map(q => q.id), resp, opc: {} });
    }
}

function boton(html, clase = '') {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'nl-docente-btn ' + clase;
    b.innerHTML = html;
    return b;
}

function estilos() {
    const s = document.createElement('style');
    s.textContent = `
    .nl-docente { position: fixed; left: 12px; bottom: 12px; z-index: 2000; display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
    .nl-docente-btn { font: 800 13px/1 'Plus Jakarta Sans', Arial, sans-serif; padding: 9px 13px; border-radius: 99px; cursor: pointer;
        color: #2E1065; background: #FCD34D; border: 0; box-shadow: 0 4px 14px rgba(0,0,0,.35); }
    .nl-docente-btn.is-sec { color: #fff; background: rgba(46,16,101,.9); border: 1px solid rgba(252,211,77,.6); }
    .nl-docente-btn:disabled { opacity: .7; cursor: wait; }
    .nl-docente small { font: 600 12px/1.3 Arial, sans-serif; color: #FDE68A; background: rgba(26,14,46,.9); padding: 5px 9px; border-radius: 8px; max-width: 260px; }`;
    document.head.appendChild(s);
}

/* ---------- Nivel ---------- */
if (raiz) {
    const sinParam = () => { url.searchParams.delete('autocompletar'); return url.pathname + url.search; };
    const correr = async () => {
        try { await completarNivel(); location.replace(sinParam()); }
        catch (e) { alert('No se pudo autocompletar: ' + e.message); }
    };
    if (url.searchParams.get('autocompletar') === '1') {
        correr();
    } else {
        estilos();
        const caja = document.createElement('div');
        caja.className = 'nl-docente';
        const b = boton('⚡ Autocompletar');
        b.title = 'Modo docente: deja este nivel completo';
        b.addEventListener('click', () => { b.disabled = true; correr(); });
        caja.appendChild(b);
        document.body.appendChild(caja);
    }
}

/* ---------- Ruta del práctico ---------- */
const secs = Array.from(document.querySelectorAll('.nl-paso__sec[data-clave]')).map(li => li.dataset.clave);
const ruta = url.searchParams.get('p');
if (!raiz && secs.length && ruta) {
    estilos();
    const caja = document.createElement('div');
    caja.className = 'nl-docente';
    const estado = document.createElement('small');
    estado.hidden = true;
    const bTodo = boton('⚡ Completar todo el práctico');
    const bReset = boton('↺ Reiniciar avance y guía', 'is-sec');
    caja.append(estado, bTodo, bReset);
    document.body.appendChild(caja);

    /** Abre cada nivel en un marco oculto con ?autocompletar=1: se completa, se recarga y guarda su sección. */
    const abrir = src => new Promise(ok => {
        const f = document.createElement('iframe');
        f.hidden = true;
        let cargas = 0, t = null;
        const fin = () => { clearTimeout(t); f.remove(); ok(); };
        f.addEventListener('load', () => {
            cargas++;
            if (cargas >= 2) setTimeout(fin, 2500);       // 2.ª carga: el nivel ya completo guarda su sección
        });
        t = setTimeout(fin, 15000);
        f.src = src;
        document.body.appendChild(f);
    });

    bTodo.addEventListener('click', async () => {
        bTodo.disabled = bReset.disabled = true;
        estado.hidden = false;
        for (let i = 0; i < secs.length; i++) {
            const [slug, n] = secs[i].split(':');
            estado.textContent = `Completando ${i + 1} de ${secs.length}…`;
            await abrir(`actividad.php?slug=${encodeURIComponent(slug)}${n ? '&nivel=' + n : ''}&ruta=${encodeURIComponent(ruta)}&autocompletar=1`);
        }
        location.href = 'guia.php?p=' + encodeURIComponent(ruta);
    });

    bReset.addEventListener('click', () => {
        if (!confirm('Borra en este navegador todo el avance de las actividades y la guía. ¿Seguro?')) return;
        Object.keys(localStorage).filter(k => k.startsWith('nl_') && k !== 'nl_carrera').forEach(k => localStorage.removeItem(k));
        try { indexedDB.deleteDatabase('nl_guia_img'); } catch { /* */ }
        location.reload();
    });
}
