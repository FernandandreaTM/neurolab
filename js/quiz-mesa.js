/**
 * NeuroLab — quiz-mesa.js
 * Quiz de cierre en mesa de trabajo (misma organización que las actividades):
 * la pregunta en la vista (alternativas o tarjetas con dibujo), el avance y la explicación en el panel.
 *
 * Pool: preguntas con carrera 'comun' + las de la carrera activa (js/carrera.js, TO por defecto).
 * Una sola oportunidad por pregunta. Avance en localStorage nl_quiz_<slug>_<carrera>.
 * Al terminar: markDone(slug) y la sección (puntaje + tabla) se guarda sola en la guía.
 */
import { markDone } from './progress.js';
import { sumarAGuia, urlGuia } from './guia.js';
import { carrera, CARRERAS } from './carrera.js';

const RAIZ = document.getElementById('nl-quiz');
const KEY_BASE = 'nl_quiz_';

function escapar(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function barajar(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    return b;
}
/** Quita etiquetas HTML que pudiera traer el banco de preguntas (Aiken/Moodle). */
const texto = t => { const d = document.createElement('div'); d.innerHTML = String(t || ''); return d.textContent; };
const angosta = () => window.matchMedia('(max-width: 900px)').matches;

function iniciar(raiz) {
    let todas = [];
    try { todas = JSON.parse(raiz.dataset.preguntas || '[]'); } catch { todas = []; }
    if (!todas.length) return;

    const slug    = raiz.dataset.slug;
    const ruta    = new URLSearchParams(location.search).get('ruta') || '';
    const vista   = raiz.querySelector('#nl-quiz-vista');
    const panel   = raiz.querySelector('#nl-quiz-trabajo');
    const chips   = raiz.querySelector('#nl-quiz-chips');
    const cont    = raiz.querySelector('#nl-quiz-contador');
    const puntos  = raiz.querySelector('#nl-quiz-puntos');
    const instr   = raiz.querySelector('#nl-mesa-instr');
    const iconos  = {};
    document.getElementById('nl-tip-iconos')?.content.querySelectorAll('[data-tipo]').forEach(n => { iconos[n.dataset.tipo] = n.innerHTML; });

    let car, pool, est, sel, verCierre;
    const key = () => KEY_BASE + slug + '_' + car;
    const guardar = () => { try { localStorage.setItem(key(), JSON.stringify(est)); } catch { /* */ } };

    function cargar() {
        car = carrera();
        pool = todas.filter(q => q.carrera === 'comun' || q.carrera === car);
        try { est = JSON.parse(localStorage.getItem(key()) || 'null'); } catch { est = null; }
        const ids = pool.map(q => q.id);
        if (!est || !Array.isArray(est.orden) || est.orden.length !== ids.length || !ids.every(id => est.orden.includes(id))) {
            // orden al azar, pero los casos con tarjetas se reparten entre las demás
            const normales = barajar(pool.filter(q => !q.tarjetas)).map(q => q.id);
            const casos = barajar(pool.filter(q => q.tarjetas)).map(q => q.id);
            const orden = [];
            const paso = Math.max(1, Math.floor(normales.length / (casos.length || 1)));
            normales.forEach((id, i) => { orden.push(id); if ((i + 1) % paso === 0 && casos.length) orden.push(casos.shift()); });
            est = { orden: orden.concat(casos), resp: {}, opc: {} };
            guardar();
        }
        sel = est.orden.find(id => est.resp[id] == null) || null;
        verCierre = !sel;
        if (instr && !Object.keys(est.resp).length) instr.open = true;
    }

    const q = id => pool.find(x => x.id === id);
    const num = id => est.orden.indexOf(id) + 1;
    const ok = id => est.resp[id] === q(id).correcta;
    const hechas = () => est.orden.filter(id => est.resp[id] != null).length;
    const aciertos = () => est.orden.filter(id => est.resp[id] != null && ok(id)).length;
    const etqCarrera = x => x.carrera === 'comun' ? 'Común' : (x.carrera === 'fonoaudiologia' ? 'Fono' : 'TO');
    /** Orden de las alternativas (fijo para cada estudiante; las tarjetas no se barajan). */
    function opciones(id) {
        const x = q(id);
        if (x.tarjetas) return x.opciones.map((_, i) => i);
        if (!est.opc[id]) { est.opc[id] = barajar(x.opciones.map((_, i) => i)); guardar(); }
        return est.opc[id];
    }

    /* --- Vista --- */
    function pintarVista() {
        if (verCierre) {
            const n = aciertos(), t = est.orden.length;
            vista.innerHTML = `<div class="nl-tip__frase-caja nl-quiz__res">
                <p class="nl-tip__fila-etq">Resultado · ${escapar(CARRERAS[car])}</p>
                <p class="nl-quiz__nota">${n} <span>/ ${t}</span></p>
                <div class="nl-quiz__barra"><i style="width:${Math.round(n / t * 100)}%"></i></div>
                <p class="nl-quiz__msj">${n === t ? '¡Perfecto!' : n / t >= .8 ? 'Muy bien: repasa las marcadas en rojo.' : n / t >= .6 ? 'Bien: vale la pena repasar las marcadas en rojo antes de Células II.' : 'Repasa las marcadas en rojo y vuelve a intentarlo.'}</p>
            </div>`;
            return;
        }
        const x = q(sel);
        const r = est.resp[sel];
        const resp = r != null;
        const orden = opciones(sel);
        const cabeza = `<p class="nl-tip__fila-etq">Pregunta ${num(sel)} de ${est.orden.length}
            <span class="nl-quiz__pool is-${x.carrera}">${etqCarrera(x)}</span></p>
            <p class="nl-tip__frase">${escapar(texto(x.pregunta))}</p>`;
        let cuerpo;
        if (x.tarjetas) {
            cuerpo = `<div class="nl-tip__cartas" role="group" aria-label="Elige una tarjeta">${orden.map(i => {
                const t = x.opciones[i];
                const esOk = resp && i === x.correcta, esMal = resp && i === r && !ok(sel);
                const cls = esOk ? ' is-ok is-vuelta' : esMal ? ' is-mal is-vuelta' : (resp ? ' is-apagada' : '');
                const dorso = esOk ? `${iconos[t] || ''}<strong>✓ ${escapar(t).replace('Pseudo', 'Pseudo&shy;')}</strong>` : esMal ? `<strong>✗ ${escapar(t).replace('Pseudo', 'Pseudo&shy;')}</strong>` : '';
                return `<button type="button" class="nl-tip__carta${cls}" data-i="${i}"${resp ? ' disabled' : ''}>
                          <span class="nl-tip__carta-in">
                            <span class="nl-tip__cara">${iconos[t] || ''}<span class="nl-tip__carta-nom">${escapar(t).replace('Pseudo', 'Pseudo&shy;')}</span></span>
                            <span class="nl-tip__dorso">${dorso}</span>
                          </span></button>`;
            }).join('')}</div>`;
        } else {
            cuerpo = `<div class="nl-quiz__ops">${orden.map((i, k) => {
                const cls = resp ? (i === x.correcta ? ' is-ok' : i === r ? ' is-mal' : ' is-apagada') : '';
                return `<button type="button" class="nl-quiz__op${cls}" data-i="${i}"${resp ? ' disabled' : ''}>
                          <span class="nl-lab__alt-letra">${String.fromCharCode(65 + k)}</span><span>${escapar(texto(x.opciones[i]))}</span></button>`;
            }).join('')}</div>`;
        }
        vista.innerHTML = `<div class="nl-tip__frase-caja nl-quiz__caja">${cabeza}${cuerpo}</div>`;
        vista.querySelectorAll('[data-i]:not([disabled])').forEach(b =>
            b.addEventListener('click', () => responder(Number(b.dataset.i))));
    }

    function responder(i) {
        if (est.resp[sel] != null) return;
        if (instr) instr.open = false;
        est.resp[sel] = i;
        guardar();
        pintar();
        if (angosta()) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* --- Panel --- */
    function pintarChips() {
        chips.innerHTML = est.orden.map(id => {
            const r = est.resp[id];
            const cl = r == null ? (id === sel && !verCierre ? ' is-activa' : '') : (ok(id) ? ' is-ok' : ' is-repasar');
            return `<button type="button" class="nl-lab__chip nl-quiz__chip${cl}${id === sel && !verCierre ? ' is-sel' : ''}" data-id="${id}"
                            ${r == null && id !== sel ? 'disabled' : ''} title="Pregunta ${num(id)}">${num(id)}</button>`;
        }).join('');
        chips.querySelectorAll('.nl-lab__chip:not([disabled])').forEach(b => b.addEventListener('click', () => {
            sel = b.dataset.id; verCierre = false; pintar();
        }));
    }

    function pintarPanel() {
        if (verCierre) { mostrarCierre(); return; }
        const x = q(sel);
        const r = est.resp[sel];
        if (r == null) {
            panel.className = 'nl-lab__trabajo is-pregunta';
            panel.innerHTML = `<p class="nl-lab__paso"><span class="nl-lab__badge">${num(sel)}</span> ${x.tarjetas ? 'Toca la tarjeta correcta' : 'Elige una alternativa'}</p>
                <p class="nl-lab__ayuda">Una sola oportunidad: piénsalo antes de tocar.</p>`;
            return;
        }
        const bien = ok(sel);
        const sig = est.orden.find(id => est.resp[id] == null);
        panel.className = 'nl-lab__trabajo ' + (bien ? 'is-ok' : 'is-repasar');
        panel.innerHTML = `
            <p class="nl-lab__paso"><span class="nl-lab__badge">${num(sel)}</span> ${bien ? '✓ Correcta' : '✗ Incorrecta'}</p>
            ${bien ? '' : `<div class="nl-ficha__bloque"><span class="nl-ficha__etq">Respuesta correcta</span><p>${escapar(texto(x.opciones[x.correcta]))}</p></div>`}
            ${x.feedback ? `<div class="nl-ficha__bloque nl-ficha__bloque--extra"><span class="nl-ficha__etq">Para recordar</span><p>${escapar(texto(x.feedback))}</p></div>` : ''}
            <div class="nl-ficha__acciones">
                ${sig ? `<button type="button" class="btn btn-primary btn-sm nl-lab__sig">Siguiente pregunta →</button>`
                      : `<button type="button" class="btn btn-primary btn-sm nl-lab__volver">Ver mi resultado →</button>`}
            </div>`;
        panel.querySelector('.nl-lab__sig')?.addEventListener('click', () => {
            sel = sig; pintar();
            if (angosta()) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        panel.querySelector('.nl-lab__volver')?.addEventListener('click', () => { verCierre = true; pintar(); });
    }

    function mostrarCierre() {
        const mal = est.orden.filter(id => !ok(id));
        const hrefRuta = ruta ? 'practico.php?p=' + encodeURIComponent(ruta) : '';
        panel.className = 'nl-lab__trabajo is-cierre';
        panel.innerHTML = `
            <p class="nl-lab__cierre-tit">🎉 ¡Quiz terminado!</p>
            <p>${aciertos()} de ${est.orden.length} correctas · pool común + ${escapar(CARRERAS[car])}</p>
            ${mal.length ? `<p class="nl-lab__alt nl-lab__repasar">↺ Por repasar: preguntas ${mal.map(num).join(', ')} (tócalas arriba para ver la explicación)</p>` : ''}
            ${hrefRuta ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${hrefRuta}">Volver a la ruta →</a>` : ''}
            <a class="btn btn-ghost btn-sm" href="${urlGuia()}">📘 Abrir mi guía y descargar el PDF</a>
            <p class="nl-guia-ok">✓ Guardado en tu guía de estudio</p>`;
    }

    function actualizar() {
        cont.textContent = hechas() + ' / ' + est.orden.length;
        puntos.textContent = hechas() ? `${aciertos()} correctas` : '';
        if (hechas() === est.orden.length) {
            markDone(slug);
            const n = aciertos(), t = est.orden.length;
            sumarAGuia(slug, {
                titulo: 'Quiz de cierre',
                subtitulo: `Puntaje: ${n} / ${t} (${Math.round(n / t * 100)}%) · pool común + ${CARRERAS[car]}`,
                slug,
                nota: t - n ? `${t - n} preguntas para repasar (marcadas con ✗)` : 'Todas correctas',
                bloques: [{
                    t: 'tabla',
                    cab: ['', 'Pregunta', 'Respuesta correcta', 'Para recordar'],
                    filas: est.orden.map(id => {
                        const x = q(id);
                        return [ok(id) ? '✓' : '✗', texto(x.pregunta), texto(x.opciones[x.correcta]), texto(x.feedback)];
                    }),
                }],
            });
        }
    }

    function pintar() {
        pintarVista();
        pintarChips();
        pintarPanel();
        actualizar();
    }

    raiz.querySelector('#nl-quiz-reset')?.addEventListener('click', () => {
        if (Object.keys(est.resp).length && !confirm('Esto borra tus respuestas del quiz (de esta carrera). ¿Seguro?')) return;
        try { localStorage.removeItem(key()); } catch { /* */ }
        cargar(); pintar();
    });
    // Cambiar de carrera cambia el pool (cada carrera guarda su propio avance)
    document.addEventListener('nl:carrera', () => { cargar(); pintar(); });

    cargar();
    if (verCierre) sel = est.orden[0];
    pintar();
}

if (RAIZ) iniciar(RAIZ);
