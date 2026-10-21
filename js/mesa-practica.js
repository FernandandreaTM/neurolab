/**
 * NeuroLab — mesa-practica.js
 * Práctica por niveles en mesa de trabajo (misma dinámica que tipos.js): lo que se
 * observa va en la vista (izquierda) y lo que se responde en el panel (derecha). Un nivel por página.
 *   · completar -> la frase con el espacio en la vista; se escribe la respuesta en el panel
 *   · elegir    -> la frase (y una imagen, si tiene) con tarjetas en la vista; si los ítems traen
 *                  `fila`, cada acierto escribe una celda del cuadro comparativo del panel.
 *                  Con `data-img` no hay tarjetas: se toca la célula en la imagen (zonas en el servidor)
 * Verde = correcto al primer intento · rojo suave = por repasar · naranjo = activo.
 * Respuestas en api/practica_check.php. Avance: localStorage nl_mprac_<nivelId>.
 * Al completar: markDone('<slug>:<número>') y la sección se guarda sola en la guía con esa clave.
 * Datos públicos de cada ítem (practica_items.datos, JSON): { img, pie }
 */
import { markDone, bloqueado } from './progress.js';
import { sumarAGuia, urlGuia } from './guia.js';
import { conexionGuia as conexionCarrera } from './carrera.js';

const RAIZ = document.getElementById('nl-mprac');
const KEY_BASE = 'nl_mprac_';
const angosta = () => window.matchMedia('(max-width: 900px)').matches;

function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function leer(nivel) {
    let e = null;
    try { e = JSON.parse(localStorage.getItem(KEY_BASE + nivel) || 'null'); } catch { e = null; }
    if (!e || typeof e !== 'object') e = {};
    if (!e.items) e.items = {};
    if (!e.mal) e.mal = {};
    if (!e.err) e.err = 0;
    return e;
}
function escribir(nivel, est) {
    try { localStorage.setItem(KEY_BASE + nivel, JSON.stringify(est)); } catch { /* modo privado */ }
}
async function revisar(itemId, respuesta, xy) {
    let body = 'item_id=' + encodeURIComponent(itemId) + '&respuesta=' + encodeURIComponent(respuesta);
    if (xy) body += '&x=' + xy[0] + '&y=' + xy[1];   // «elegir» sobre la imagen: el servidor ve qué célula se tocó
    try {
        const r = await fetch('api/practica_check.php', {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body,
        });
        return await r.json();
    } catch { return { correcto: false, feedback: 'No pudimos revisar tu respuesta. ¿Hay conexión?', red: true }; }
}
/** Palabras largas en tarjetas: guion opcional para que no se corten mal (Submeta-céntrico). */
const partir = s => esc(s).split(' ').map(w => w.length > 12 ? w.slice(0, -8) + '&shy;' + w.slice(-8) : w).join(' ');
const sinPista = t => String(t || '').replace(/^Todavía no\.\s*(Pista:\s*)?/, '');

function iniciar(raiz) {
    let items = [];
    try { items = JSON.parse(raiz.dataset.items || '[]'); } catch { items = []; }
    if (!items.length) return;
    const d = raiz.dataset;
    const clave = d.slug + ':' + d.numero;
    const ruta = new URLSearchParams(location.search).get('ruta') || '';
    const vista = raiz.querySelector('#nl-mprac-vista');
    const panel = raiz.querySelector('#nl-mprac-trabajo');
    const chips = raiz.querySelector('#nl-mprac-chips');
    const progreso = raiz.querySelector('#nl-mprac-progreso');
    const contador = raiz.querySelector('#nl-mprac-contador');
    const errores = raiz.querySelector('#nl-mprac-errores');
    const instr = raiz.querySelector('#nl-mesa-instr');
    const tplCx = document.getElementById('nl-conexion-tpl');
    let opciones = [];
    try { opciones = JSON.parse(d.opciones || '[]'); } catch { opciones = []; }
    const iconos = {};   // ícono opcional de cada tarjeta (img/tipos o img/glia; ver _partials/iconos_neurona.php)
    document.getElementById('nl-mprac-iconos')?.content.querySelectorAll('[data-op]').forEach(n => { if (n.innerHTML.trim()) iconos[n.dataset.op] = n.innerHTML; });

    if (bloqueado(d.requiere)) {
        raiz.classList.add('is-bloqueada');
        raiz.querySelector('.nl-lab__candado')?.removeAttribute('hidden');
        return;
    }

    let est = leer(d.nivel);
    if (instr && !Object.keys(est.items).length) instr.open = true;
    // Tarjetas en orden aleatorio (fijo para cada estudiante): así la primera tarjeta no delata la primera respuesta
    const barajarOps = () => { const a = opciones.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    if (!Array.isArray(est.oc) || est.oc.length !== opciones.length || est.oc.some(o => !opciones.includes(o))) est.oc = barajarOps();
    const cartas = () => est.oc;
    const guardar = () => escribir(d.nivel, est);
    const porId = Object.fromEntries(items.map(it => [String(it.id), it]));
    const num = it => items.indexOf(it) + 1;
    const hecho = it => est.items[it.id];
    const mal = it => est.mal[it.id] || [];
    let sel = items.find(it => !hecho(it)) || null;
    let verCierre = !sel;
    if (!sel) sel = items[0];
    let nueva = null;

    const motor = d.tipo === 'elegir' ? motorElegir() : motorCompletar();

    /* ---------------- Común ---------------- */
    function cerrarInstr() { if (instr) instr.open = false; }
    function fallo(it, txt, extra) {
        est.err++;
        est.mal[it.id] = mal(it).concat([Object.assign({ p: sinPista(txt) }, extra || {})]);
        guardar();
    }
    function acierto(it, r, extra) {
        est.items[it.id] = Object.assign({ r: r.respuesta || '', exp: r.feedback || '', celda: r.celda || '', e: mal(it).length }, extra || {});
        nueva = it.id;
        guardar();
    }
    function siguiente() { return items.find(it => !hecho(it)) || null; }

    function pintarChips() {
        chips.innerHTML = items.map(it => {
            const s = hecho(it);
            const cl = s ? (s.e ? ' is-repasar' : ' is-ok') : (it === sel && !verCierre ? ' is-activa' : '');
            return `<button type="button" class="nl-lab__chip${cl}${it === sel && !verCierre ? ' is-sel' : ''}" data-id="${it.id}" title="Ejercicio ${num(it)}">${num(it)}</button>`;
        }).join('');
        chips.querySelectorAll('.nl-lab__chip').forEach(b => b.addEventListener('click', () => {
            sel = porId[b.dataset.id]; verCierre = false; nueva = null; pintar();
        }));
    }

    function actualizar() {
        const n = items.filter(hecho).length;
        contador.textContent = n + ' / ' + items.length;
        errores.textContent = est.err ? `${est.err} ${est.err === 1 ? 'error' : 'errores'}` : '';
        raiz.classList.toggle('is-completa', n === items.length);
        if (n === items.length) {
            markDone(clave);
            if (d.ultimo) markDone(d.slug);
            const rep = items.filter(it => hecho(it).e > 0);
            sumarAGuia(clave, {
                titulo: d.titulo + (d.romano && document.querySelectorAll('.nl-barra__nivel').length > 1 ? ` — Nivel ${d.romano}: ${d.tituloNivel}` : ''),
                subtitulo: motor.subtituloGuia,
                slug: d.slug,
                nota: `${items.length} ejercicios · ${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}`,
                bloques: motor.bloquesGuia()
                    .concat(rep.length ? [{ t: 'texto', txt: '↺ Por repasar: ' + rep.map(it => num(it) + '. ' + motor.nombre(it)).join(' · ') + '.' }] : [])
                    .concat(conexionCarrera(tplCx)),
            });
        }
    }

    function mostrarCierre() {
        const rep = items.filter(it => hecho(it).e > 0);
        const hrefRuta = ruta ? 'practico.php?p=' + encodeURIComponent(ruta) : '';
        panel.className = 'nl-lab__trabajo is-cierre';
        panel.innerHTML = `
            <p class="nl-lab__cierre-tit">🎉 ¡Nivel completado!</p>
            <p>${items.length} ejercicios · ${est.err ? `${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}` : 'sin errores'}</p>
            ${rep.length ? `<p class="nl-lab__alt nl-lab__repasar">↺ Por repasar: ${rep.map(it => num(it) + '. ' + esc(motor.nombre(it))).join(' · ')}</p>` : ''}
            ${d.siguiente ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${esc(d.siguiente)}">Siguiente nivel →</a>`
                          : (hrefRuta ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${hrefRuta}">Volver a la ruta →</a>` : '')}
            ${tplCx ? `<details class="nl-lab__conexion"><summary>💡 ¿Para qué te sirve esto?</summary>${tplCx.innerHTML}</details>` : ''}
            <p class="nl-lab__ayuda">Toca un número para repasar cualquier ejercicio.</p>
            <p class="nl-guia-ok">✓ Guardado en tu guía de estudio · <a href="${urlGuia()}">Ver guía</a></p>`;
    }

    /** Ficha tras un acierto (o al repasar uno resuelto). */
    function mostrarFicha(it, titulo) {
        const s = hecho(it);
        const sig = siguiente();
        panel.className = 'nl-lab__trabajo ' + (s.e ? 'is-repasar' : 'is-ok');
        panel.innerHTML = `
            <p class="nl-lab__paso"><span class="nl-lab__badge">${num(it)}</span> ${titulo}
               ${it.id === nueva ? `<span class="nl-tip__logro">${s.e ? '✓ con pista' : '🎯 al primer intento'}</span>` : ''}</p>
            ${s.exp ? `<div class="nl-ficha__bloque"><span class="nl-ficha__etq">Para recordar</span><p>${esc(s.exp)}</p></div>` : ''}
            <div class="nl-ficha__acciones">
                ${sig ? `<button type="button" class="btn btn-primary btn-sm nl-sig">Siguiente →</button>`
                      : `<button type="button" class="btn btn-primary btn-sm nl-fin">Ver el resumen →</button>`}
            </div>`;
        panel.querySelector('.nl-sig')?.addEventListener('click', () => {
            sel = sig; nueva = null; pintar();
            if (angosta()) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        panel.querySelector('.nl-fin')?.addEventListener('click', () => { verCierre = true; nueva = null; pintar(); });
        panel.querySelector('.nl-sig, .nl-fin')?.focus({ preventScroll: true });
    }

    function avisar(txt) {
        panel.querySelector('.nl-lab__aviso-act')?.remove();
        panel.insertAdjacentHTML('afterbegin', `<p class="nl-lab__aviso-act">${esc(txt)}</p>`);
    }

    function pintar() {
        motor.vista();
        if (progreso) { const p = motor.progreso ? motor.progreso() : ''; progreso.hidden = !p; progreso.innerHTML = p; }
        if (verCierre) mostrarCierre(); else motor.panel();
        pintarChips();
        actualizar();
    }

    /** Imagen opcional del ítem (datos.img). */
    const imagen = it => it.d && it.d.img
        ? `<figure class="nl-mprac__fig"><img src="${esc(it.d.img)}" alt="">${it.d.pie ? `<figcaption>${esc(it.d.pie)}</figcaption>` : ''}</figure>` : '';

    /** Tabla resumen (vista de cierre y guía). */
    function resumen() {
        return `<div class="nl-tip__frase-caja is-cierre"><p class="nl-tip__fila-etq">Resumen del nivel</p>
            <table class="nl-tip__cuadro is-grande nl-mprac__resumen"><thead><tr><th>#</th><th>Enunciado</th><th>Respuesta</th></tr></thead>
            <tbody>${items.map(it => `<tr><td>${num(it)}</td><td>${esc(motor.enunciadoPlano(it))}</td><td><strong>${esc(motor.nombre(it))}</strong></td></tr>`).join('')}</tbody></table></div>`;
    }

    /* ================= completar ================= */
    function motorCompletar() {
        const frase = (it, r) => esc(it.e).replace('{}', r ? `<span class="nl-tip__hueco is-lleno">${esc(r)}</span>` : '<span class="nl-tip__hueco">____</span>');
        const plano = it => it.e.replace('{}', '____');
        return {
            vista() {
                if (verCierre) { vista.innerHTML = resumen(); return; }
                const s = hecho(sel);
                vista.innerHTML = `<div class="nl-tip__frase-caja">
                    <p class="nl-tip__fila-etq">Ejercicio ${num(sel)} de ${items.length}</p>
                    ${imagen(sel)}
                    <p class="nl-tip__frase">${it_frase(sel, s)}</p></div>`;
                function it_frase(it, s2) { return it.e.includes('{}') ? frase(it, s2 && s2.r) : `<span class="nl-tip__hueco${s2 ? ' is-lleno' : ''}">${s2 ? esc(s2.r) : '____'}</span>: ${esc(it.e)}`; }
            },
            panel() {
                if (hecho(sel)) { mostrarFicha(sel, esc(hecho(sel).r)); return; }
                const m = mal(sel);
                panel.className = 'nl-lab__trabajo is-pregunta';
                panel.innerHTML = `
                    <p class="nl-lab__paso"><span class="nl-lab__badge">${num(sel)}</span> ¿Qué va en el espacio?</p>
                    <p class="nl-lab__ayuda">Escríbelo y presiona <kbd>Enter</kbd>.</p>
                    <div class="nl-lab__resp-fila">
                        <input type="text" class="nl-lab__input" placeholder="Tu respuesta" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Respuesta del ejercicio ${num(sel)}">
                        <button type="button" class="btn btn-primary btn-sm nl-comprobar">Comprobar</button>
                    </div>
                    ${m.length ? `<p class="nl-lab__q-fb">✗ ${esc(m[m.length - 1].p || 'Todavía no.')}</p>` : ''}`;
                const inp = panel.querySelector('.nl-lab__input');
                const ir = async () => {
                    const v = inp.value.trim();
                    if (!v) { inp.focus(); return; }
                    cerrarInstr();
                    const it = sel;
                    panel.classList.add('is-esperando');
                    const r = await revisar(it.id, v);
                    panel.classList.remove('is-esperando');
                    if (r.red) { avisar(r.feedback); return; }
                    if (!r.correcto) { fallo(it, r.feedback); pintar(); return; }
                    acierto(it, r); pintar();
                };
                inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ir(); } });
                panel.querySelector('.nl-comprobar').addEventListener('click', ir);
                if (!angosta()) inp.focus({ preventScroll: true });
            },
            nombre: it => (hecho(it) || {}).r || '',
            enunciadoPlano: plano,
            subtituloGuia: 'Cada concepto con su definición',
            bloquesGuia: () => [{ t: 'tabla', cab: ['Respuesta', 'Enunciado', 'Para recordar'],
                filas: items.map(it => [hecho(it).r, plano(it).replace(/^____:\s*/, ''), hecho(it).exp]) }],
        };
    }

    /* ================= elegir ================= */
    function motorElegir() {
        const filas = [...new Set(items.map(it => it.fila).filter(Boolean))];
        const conCuadro = filas.length > 0;
        const frase = it => esc(it.e).replace('{}', '<span class="nl-tip__hueco">____</span>');
        function cuadro(grande) {
            return `<table class="nl-tip__cuadro${grande ? ' is-grande' : ''}${opciones.length > 4 ? ' is-ancho' : ''}">
                <thead><tr><th></th>${opciones.map(o => `<th><span>${esc(o)}</span></th>`).join('')}</tr></thead>
                <tbody>${filas.map(f => `<tr class="${!grande && !verCierre && sel.fila === f ? 'is-actual' : ''}"><th>${esc(f)}</th>${opciones.map(o => {
                    const c = items.filter(it => it.fila === f && hecho(it) && hecho(it).r === o);
                    return `<td>${c.length ? c.map(it => `<span class="nl-tip__celda${it.id === nueva && !grande ? ' is-nueva' : ''}">${esc(hecho(it).celda || '✓')}</span>`).join('')
                                           : '<span class="nl-tip__vacia">·</span>'}</td>`;
                }).join('')}</tr>`).join('')}</tbody></table>`;
        }
        /** Frase arriba y la imagen debajo: se toca la célula (✗ donde se equivocó, ✓ donde acertó). */
        function vistaImagen() {
            const s = hecho(sel), m = mal(sel);
            const marca = (xy, ok, txt) => `<span class="nl-mprac__marca${ok ? ' is-ok' : ''}${xy[0] > 55 ? ' is-izq' : ''}" style="left:${xy[0]}%;top:${xy[1]}%">${ok ? '✓' : '✗'}<em>${esc(txt)}</em></span>`;
            vista.innerHTML = `<div class="nl-tip__frase-caja is-img">
                <p class="nl-tip__fila-etq">${sel.fila ? esc(sel.fila) + ' · ' : ''}ejercicio ${num(sel)} de ${items.length}</p>
                <p class="nl-tip__frase">${frase(sel)}</p>
                <div class="nl-mprac__lienzo${s ? '' : ' is-tocable'}"><img src="${esc(d.img)}" alt="Esquema" draggable="false">
                  ${m.filter(x => x.xy).map(x => marca(x.xy, false, x.t ? 'No es ' + x.t.toLowerCase() : '')).join('')}
                  ${s && s.xy ? marca(s.xy, true, s.r) : ''}</div></div>`;
            const lz = vista.querySelector('.nl-mprac__lienzo');
            lz.addEventListener('click', async ev => {
                if (hecho(sel) || panel.classList.contains('is-esperando')) return;
                cerrarInstr();
                const r0 = lz.querySelector('img').getBoundingClientRect();
                const xy = [Math.round((ev.clientX - r0.left) / r0.width * 1000) / 10, Math.round((ev.clientY - r0.top) / r0.height * 1000) / 10];
                const it = sel;
                panel.classList.add('is-esperando');
                const r = await revisar(it.id, '', xy);
                panel.classList.remove('is-esperando');
                if (r.red || r.fuera) { avisar(r.feedback); return; }
                if (!r.correcto) { fallo(it, r.feedback, { t: r.tocada || '', xy }); pintar(); return; }
                acierto(it, r, { xy }); pintar();
                if (angosta()) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
        return {
            vista() {
                if (!verCierre && d.img) { vistaImagen(); return; }
                if (verCierre) {
                    vista.innerHTML = conCuadro
                        ? `<div class="nl-tip__frase-caja is-cierre"><p class="nl-tip__fila-etq">Tu cuadro comparativo</p>${cuadro(true)}</div>`
                        : resumen();
                    return;
                }
                const s = hecho(sel), m = mal(sel);
                vista.innerHTML = `<div class="nl-tip__frase-caja${cartas().length === 6 ? ' is-compacta' : ''}">
                    <p class="nl-tip__fila-etq">${sel.fila ? esc(sel.fila) + ' · ' : ''}ejercicio ${num(sel)} de ${items.length}</p>
                    ${imagen(sel)}
                    <p class="nl-tip__frase">${frase(sel)}</p>
                    <div class="nl-tip__cartas nl-cartas" data-n="${cartas().length}" role="group" aria-label="Elige una tarjeta">
                    ${cartas().map(o => {
                        const esMal = m.find(x => x.t === o);
                        const esOk = s && s.r === o;
                        const cls = esOk ? ' is-ok is-vuelta' : esMal ? ' is-mal is-vuelta' : (s ? ' is-apagada' : '');
                        const dorso = esOk ? `<strong>✓ ${partir(o)}</strong>` : esMal ? `<strong>✗ No es ${partir(o.toLowerCase())}</strong><small>${esc(esMal.p)}</small>` : '';
                        return `<button type="button" class="nl-tip__carta${cls}" data-op="${esc(o)}"${s || esMal ? ' disabled' : ''}>
                            <span class="nl-tip__carta-in"><span class="nl-tip__cara">${iconos[o] || ''}<span class="nl-tip__carta-nom">${partir(o)}</span></span>
                            <span class="nl-tip__dorso">${dorso}</span></span></button>`;
                    }).join('')}</div></div>`;
                vista.querySelectorAll('.nl-tip__carta:not([disabled])').forEach(b => b.addEventListener('click', async () => {
                    if (hecho(sel) || panel.classList.contains('is-esperando')) return;
                    cerrarInstr();
                    const it = sel;
                    panel.classList.add('is-esperando'); b.classList.add('is-esperando');
                    const r = await revisar(it.id, b.dataset.op);
                    panel.classList.remove('is-esperando');
                    if (r.red) { b.classList.remove('is-esperando'); avisar(r.feedback); return; }
                    if (!r.correcto) { fallo(it, r.feedback, { t: b.dataset.op }); pintar(); return; }
                    acierto(it, r); pintar();
                    if (angosta()) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }));
            },
            panel() {
                if (hecho(sel)) { mostrarFicha(sel, esc(hecho(sel).r)); return; }
                const m = mal(sel);
                panel.className = 'nl-lab__trabajo is-pregunta';
                if (d.img) {
                    const ult = m[m.length - 1];
                    panel.innerHTML = `
                    <p class="nl-lab__paso"><span class="nl-lab__badge">${num(sel)}</span> Toca la célula</p>
                    <p class="nl-lab__ayuda">Lee la frase y toca en la imagen la célula que describe.${sel.fila ? ` Fila del cuadro: <strong>${esc(sel.fila)}</strong>.` : ''}</p>
                    ${ult ? `<p class="nl-lab__q-fb">✗ ${ult.t ? 'No es ' + esc(ult.t.toLowerCase()) + '. ' : ''}${esc(ult.p)}</p>` : ''}`;
                    return;
                }
                panel.innerHTML = `
                    <p class="nl-lab__paso"><span class="nl-lab__badge">${num(sel)}</span> Elige la tarjeta correcta</p>
                    <p class="nl-lab__ayuda">Toca la tarjeta que corresponde.${sel.fila ? ` Fila del cuadro: <strong>${esc(sel.fila)}</strong>.` : ''}</p>
                    ${m.length ? `<p class="nl-lab__q-fb">✗ Esa tarjeta no era: lee la pista y prueba con otra.</p>` : ''}`;
            },
            progreso: () => (conCuadro && !verCierre ? cuadro(false) : ''),
            nombre: it => (hecho(it) || {}).r || '',
            enunciadoPlano: it => it.e.replace('{}', '____'),
            subtituloGuia: conCuadro ? 'Cuadro comparativo construido fila por fila' : 'Cada enunciado con su respuesta',
            bloquesGuia: () => conCuadro
                ? [{ t: 'tabla', cab: ['Característica'].concat(opciones),
                     filas: filas.map(f => [f].concat(opciones.map(o => items.filter(it => it.fila === f && hecho(it) && hecho(it).r === o)
                         .map(it => hecho(it).celda).join(' · ')))) }]
                : [{ t: 'tabla', cab: ['Respuesta', 'Enunciado', 'Para recordar'],
                     filas: items.map(it => [hecho(it).r, it.e.replace('{}', '____'), hecho(it).exp]) }],
        };
    }

    raiz.querySelector('#nl-mprac-reset')?.addEventListener('click', () => {
        if (Object.keys(est.items).length && !confirm('Esto borra todas tus respuestas de este nivel. ¿Seguro?')) return;
        est = { items: {}, mal: {}, err: 0, oc: barajarOps() };
        guardar();
        sel = items[0]; verCierre = false; nueva = null;
        pintar();
    });

    pintar();
}

if (RAIZ) iniciar(RAIZ);
