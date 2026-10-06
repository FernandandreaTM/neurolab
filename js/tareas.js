/**
 * NeuroLab — tareas.js
 * Trabajo autocorregible de una actividad (sección #nl-tar de actividad.php),
 * configurado por un recurso "tareas" (JSON) en actividad_recursos:
 *   { titulo, intro,
 *     capturas:  [{ clave, titulo, instruccion, checks: ['Soma', ...] }],
 *     preguntas: [{ p, ops: ['...'], ok: <índice correcto>, pista, exp }] }
 *
 * · Capturas: el estudiante pega (Ctrl+V) o sube una imagen y marca lo que reconoce.
 *   Se reduce a ~900 px (JPEG) para que quepa en el navegador y en la guía.
 * · Preguntas: alternativas; la incorrecta se tacha y muestra la pista; se repite hasta acertar.
 * Al completar todo: actividad completada + "Sumar a mi guía" (capturas + preguntas).
 * Avance en localStorage (nl_tareas_<slug>).
 */
import { markDone } from './progress.js';
import { botonGuia } from './guia.js';

const RAIZ = document.getElementById('nl-tar');
const KEY = 'nl_tareas_';
const MAX_LADO = 900;

function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function barajar(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    return b;
}

/** Lee una imagen (File/Blob) y la devuelve como JPEG reducido en data URL. */
function reducir(blob) {
    return new Promise((ok, mal) => {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            const k = Math.min(1, MAX_LADO / Math.max(img.width, img.height));
            const c = document.createElement('canvas');
            c.width = Math.round(img.width * k);
            c.height = Math.round(img.height * k);
            const g = c.getContext('2d');
            g.fillStyle = '#fff';
            g.fillRect(0, 0, c.width, c.height);
            g.drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            ok(c.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => { URL.revokeObjectURL(url); mal(new Error('imagen')); };
        img.src = url;
    });
}

function iniciar(raiz) {
    let cfg = {};
    try { cfg = JSON.parse(raiz.dataset.config || '{}'); } catch { cfg = {}; }
    const caps = cfg.capturas || [];
    const pregs = cfg.preguntas || [];
    const slug = raiz.dataset.slug || '';
    const cuerpo = raiz.querySelector('.nl-tar__cuerpo');

    let est;
    try { est = JSON.parse(localStorage.getItem(KEY + slug) || 'null'); } catch { est = null; }
    if (!est || typeof est !== 'object') est = {};
    est.caps = est.caps || {};
    est.resp = est.resp || {};
    est.err = est.err || 0;
    const guardar = () => {
        try { localStorage.setItem(KEY + slug, JSON.stringify(est)); return true; }
        catch { return false; }
    };

    // Orden de alternativas: al azar, pero fijo mientras dure la página
    const ordenes = pregs.map(q => barajar(q.ops.map((_, i) => i)));

    const capLista = c => {
        const e = est.caps[c.clave];
        return !!(e && e.img && (c.checks || []).every((_, i) => (e.checks || [])[i]));
    };
    const pregLista = (q, i) => !!(est.resp[i] && est.resp[i].ok);
    const completa = () => caps.every(capLista) && pregs.every(pregLista);

    cuerpo.innerHTML = `
        ${caps.length ? `<div class="nl-tar__caps">${caps.map((c, i) => `
            <div class="nl-tar__cap" data-clave="${esc(c.clave)}">
                <h3><span class="nl-tar__n">📷 ${i + 1}</span> ${esc(c.titulo)}</h3>
                ${c.instruccion ? `<p class="nl-tar__ins">${esc(c.instruccion)}</p>` : ''}
                <div class="nl-tar__zona" tabindex="0" role="button" aria-label="Pegar o subir captura: ${esc(c.titulo)}"></div>
                <input type="file" accept="image/*" hidden>
                <button type="button" class="btn btn-ghost btn-sm nl-tar__subir">📁 Subir imagen</button>
                ${(c.checks || []).length ? `<fieldset class="nl-tar__checks"><legend>En mi captura reconozco:</legend>
                    ${c.checks.map((t, k) => `<label><input type="checkbox" data-k="${k}"> ${esc(t)}</label>`).join('')}
                </fieldset>` : ''}
            </div>`).join('')}</div>` : ''}
        ${pregs.length ? `<ol class="nl-tar__pregs">${pregs.map((q, i) => `
            <li class="nl-tar__preg" data-i="${i}">
                <p class="nl-tar__p">${esc(q.p)}</p>
                <div class="nl-tar__ops">${ordenes[i].map(k => `
                    <button type="button" class="nl-tar__op" data-k="${k}">${esc(q.ops[k])}</button>`).join('')}
                </div>
                <p class="nl-tar__fb" aria-live="polite"></p>
            </li>`).join('')}</ol>` : ''}
        <div class="nl-tar__final" role="status" aria-live="polite"></div>`;

    /* --- Capturas --- */
    caps.forEach(c => {
        const box = cuerpo.querySelector(`.nl-tar__cap[data-clave="${c.clave}"]`);
        const zona = box.querySelector('.nl-tar__zona');
        const file = box.querySelector('input[type=file]');

        function pintarZona() {
            const e = est.caps[c.clave];
            box.classList.toggle('is-ok', capLista(c));
            if (e && e.img) {
                zona.classList.add('tiene');
                zona.innerHTML = `<img src="${e.img}" alt="Tu captura: ${esc(c.titulo)}">
                    <span class="nl-tar__cambiar">Pega otra o súbela para cambiarla</span>`;
            } else {
                zona.classList.remove('tiene');
                zona.innerHTML = `<span class="nl-tar__zona-ico">📋</span>
                    <strong>Haz clic aquí y pega tu captura con Ctrl+V</strong>
                    <span>o arrástrala, o usa «Subir imagen»</span>
                    <small>Para capturar en Windows: <kbd>Win</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> y luego pega aquí</small>`;
            }
            box.querySelectorAll('.nl-tar__checks input').forEach(ch => {
                ch.checked = !!(e && (e.checks || [])[Number(ch.dataset.k)]);
                ch.disabled = !(e && e.img);
            });
        }

        async function usar(blob) {
            try {
                const img = await reducir(blob);
                const prev = est.caps[c.clave] || {};
                est.caps[c.clave] = { img, checks: prev.checks || [] };
                if (!guardar()) {
                    delete est.caps[c.clave];
                    alert('No hay espacio en el navegador para guardar la captura. Prueba con una más pequeña.');
                }
            } catch { alert('No pudimos leer esa imagen. Prueba con otra.'); }
            pintarZona();
            revisar();
        }

        zona.addEventListener('click', () => {
            // En pantallas táctiles no hay "pegar": el toque abre el selector de imagen
            if (matchMedia('(pointer: coarse)').matches) file.click();
            else zona.focus();
        });
        box.querySelector('.nl-tar__subir').addEventListener('click', () => file.click());
        zona.addEventListener('keydown', ev => { if (ev.key === 'Enter') file.click(); });
        zona.addEventListener('paste', ev => {
            const it = Array.from(ev.clipboardData?.items || []).find(x => x.type.startsWith('image/'));
            if (it) { ev.preventDefault(); usar(it.getAsFile()); }
        });
        zona.addEventListener('dragover', ev => { ev.preventDefault(); zona.classList.add('is-sobre'); });
        zona.addEventListener('dragleave', () => zona.classList.remove('is-sobre'));
        zona.addEventListener('drop', ev => {
            ev.preventDefault(); zona.classList.remove('is-sobre');
            const f = Array.from(ev.dataTransfer?.files || []).find(x => x.type.startsWith('image/'));
            if (f) usar(f);
        });
        file.addEventListener('change', () => { if (file.files[0]) usar(file.files[0]); file.value = ''; });
        box.querySelectorAll('.nl-tar__checks input').forEach(ch => ch.addEventListener('change', () => {
            const e = est.caps[c.clave];
            if (!e) return;
            e.checks = e.checks || [];
            e.checks[Number(ch.dataset.k)] = ch.checked;
            guardar();
            pintarZona();
            revisar();
        }));
        pintarZona();
    });

    /* --- Preguntas --- */
    pregs.forEach((q, i) => {
        const li = cuerpo.querySelector(`.nl-tar__preg[data-i="${i}"]`);
        const fb = li.querySelector('.nl-tar__fb');

        function pintar() {
            const r = est.resp[i] || { mal: [] };
            li.classList.toggle('is-ok', !!r.ok);
            li.querySelectorAll('.nl-tar__op').forEach(b => {
                const k = Number(b.dataset.k);
                const esMal = (r.mal || []).includes(k);
                b.classList.toggle('is-mal', esMal);
                b.classList.toggle('is-ok', !!r.ok && k === q.ok);
                b.disabled = !!r.ok || esMal;
                b.hidden = !!r.ok && k !== q.ok;
            });
            if (r.ok) {
                fb.className = 'nl-tar__fb is-ok';
                fb.textContent = '✓ ' + (q.exp || '¡Correcto!');
            }
        }

        li.querySelectorAll('.nl-tar__op').forEach(b => b.addEventListener('click', () => {
            const k = Number(b.dataset.k);
            const r = est.resp[i] = est.resp[i] || { mal: [] };
            if (r.ok) return;
            if (k === q.ok) {
                r.ok = true;
            } else {
                r.mal = (r.mal || []).concat(k);
                est.err++;
                fb.className = 'nl-tar__fb is-mal';
                fb.textContent = '✗ Todavía no. ' + (q.pista || 'Vuelve a mirar la lámina e intenta de nuevo.');
                li.classList.remove('is-sacude'); void li.offsetWidth; li.classList.add('is-sacude');
            }
            guardar();
            pintar();
            revisar();
        }));
        pintar();
    });

    /* --- Cierre --- */
    const final = cuerpo.querySelector('.nl-tar__final');

    function seccion() {
        return {
            titulo: raiz.dataset.titulo || cfg.titulo || 'Actividad',
            subtitulo: cfg.titulo || '',
            slug,
            nota: `${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'} en las preguntas`,
            bloques: [
                caps.length ? { t: 'imagenes', items: caps.map(c => ({
                    src: est.caps[c.clave]?.img || '',
                    titulo: c.titulo,
                    pie: (c.checks || []).length ? 'Reconozco: ' + c.checks.join(', ').toLowerCase() + '.' : '',
                })) } : null,
                pregs.length ? { t: 'tabla', cab: ['Pregunta', 'Respuesta', 'Explicación'],
                    filas: pregs.map(q => [q.p, q.ops[q.ok], q.exp || '']) } : null,
                ...(() => {
                    const tpl = document.getElementById('nl-conexion-tpl');
                    const items = tpl ? Array.from(tpl.content.querySelectorAll('p')).map(p => p.textContent.replace(/\s+/g, ' ').trim()) : [];
                    return items.length ? [{ t: 'texto', txt: '💡 ¿Para qué sirve?' }, { t: 'lista', items }] : [];
                })(),
            ].filter(Boolean),
        };
    }

    function revisar() {
        const nCap = caps.filter(capLista).length;
        const nPre = pregs.filter(pregLista).length;
        if (completa()) {
            const tpl = document.getElementById('nl-conexion-tpl');
            const ruta = new URLSearchParams(location.search).get('ruta');
            final.className = 'nl-tar__final is-ok';
            final.innerHTML = `🎉 <strong>¡Actividad completada!</strong> ` +
                (est.err ? `${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'} en las preguntas.` : 'Sin errores en las preguntas.') +
                (ruta ? ` <a class="nl-tar__ruta" href="practico.php?p=${encodeURIComponent(ruta)}">Volver a la ruta →</a>` : '') +
                (tpl ? `<details class="nl-lab__conexion"><summary>💡 ¿Para qué te sirve esto?</summary>${tpl.innerHTML}</details>` : '') +
                `<span class="nl-tar__guia-linea"></span>`;
            if (slug) markDone(slug);
            botonGuia(final.querySelector('.nl-tar__guia-linea'), slug, seccion);
        } else {
            final.className = 'nl-tar__final';
            final.textContent = `Avance: ${nCap} / ${caps.length} capturas · ${nPre} / ${pregs.length} preguntas`;
        }
    }
    revisar();
}

if (RAIZ) iniciar(RAIZ);
