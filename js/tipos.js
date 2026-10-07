/**
 * NeuroLab — tipos.js
 * "Tipos de neurona" en mesa de trabajo (misma dinámica que labeling.js): la vista a la
 * izquierda y todo lo que se responde en el panel derecho. Un nivel por página:
 *   · armar  -> se arma cada tipo de neurona sobre un soma (piezas de armar-neurona.js)
 *   · elegir -> una frase a la vez + 3 tarjetas; cada acierto escribe una celda del
 *               cuadro comparativo (fila por fila: morfología → función → localización)
 * Verde = correcto al primer intento · rojo suave = por repasar · naranjo = activa.
 *
 * Respuestas en api/practica_check.php. Avance: localStorage nl_tipos_<nivelId>.
 * Al completar: markDone('<slug>:<número>') (desbloquea el siguiente nivel) y la sección
 * se guarda sola en la guía con la clave '<slug>:<número>'.
 */
import { markDone, isDone } from './progress.js';
import { sumarAGuia, urlGuia } from './guia.js';
import { C, R, PUNTOS, LUGAR, PIEZAS, ICONOS, dibujoPieza, coordPunto } from './armar-neurona.js';

const RAIZ = document.getElementById('nl-tip');
const KEY_BASE = 'nl_tipos_';
const FILAS = [
    { k: 'morfologia',   t: 'Morfología',              c: 'Morfología' },
    { k: 'funcion',      t: 'Función y dirección',     c: 'Función' },
    { k: 'localizacion', t: 'Localización y ejemplos', c: 'Localización' },
];

function leer(nivel) {
    let e = null;
    try { e = JSON.parse(localStorage.getItem(KEY_BASE + nivel) || 'null'); } catch { e = null; }
    if (!e || typeof e !== 'object') e = {};
    if (!e.items) e.items = {};
    if (!e.err) e.err = 0;
    return e;
}
function escribir(nivel, estado) {
    try { localStorage.setItem(KEY_BASE + nivel, JSON.stringify(estado)); } catch { /* modo privado */ }
}
export function escapar(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
async function revisar(itemId, campos) {
    const body = ['item_id=' + encodeURIComponent(itemId)].concat(Object.keys(campos).map(k =>
        encodeURIComponent(k) + '=' + encodeURIComponent(campos[k]))).join('&');
    try {
        const res = await fetch('api/practica_check.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body,
        });
        return await res.json();
    } catch { return { correcto: false, feedback: 'No pudimos revisar tu respuesta. ¿Hay conexión?', red: true }; }
}

/** Dibujo SVG de una neurona armada (para la vista, las tarjetas y la guía). */
export function svgNeurona(piezas, clase = '') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" class="${clase}">` +
        piezas.map((p, i) => p ? `<g transform="rotate(${i * 360 / PUNTOS} ${C} ${C})">${dibujoPieza(p)}</g>` : '').join('') +
        `<circle class="p-soma" cx="${C}" cy="${C}" r="${R}"/><circle class="p-nucleo" cx="${C}" cy="${C}" r="8"/></svg>`;
}

const angosta = () => window.matchMedia('(max-width: 900px)').matches;

function iniciar(raiz) {
    let items = [];
    try { items = JSON.parse(raiz.dataset.items || '[]'); } catch { items = []; }
    if (!items.length) return;

    const d = raiz.dataset;
    const clave    = d.slug + ':' + d.numero;
    const ruta     = new URLSearchParams(location.search).get('ruta') || '';
    const vista    = raiz.querySelector('#nl-tip-vista');
    const panel    = raiz.querySelector('#nl-tip-trabajo');
    const progreso = raiz.querySelector('#nl-tip-progreso');
    const contador = raiz.querySelector('#nl-tip-contador');
    const errores  = raiz.querySelector('#nl-tip-errores');
    const instr    = raiz.querySelector('#nl-mesa-instr');
    const tplCx    = document.getElementById('nl-conexion-tpl');

    if (d.requiere && !isDone(d.requiere)) {
        raiz.classList.add('is-bloqueada');
        raiz.querySelector('.nl-lab__candado')?.removeAttribute('hidden');
        return;
    }

    let est = leer(d.nivel);
    if (instr && !Object.keys(est.items).length) instr.open = true;
    const guardar = () => escribir(d.nivel, est);
    const completa = () => items.every(it => est.items[it.id]);
    const porRepasar = () => items.filter(it => est.items[it.id] && est.items[it.id].e > 0);

    /* Lo común a los dos niveles: contador, cierre, guía. Lo propio lo pone el motor. */
    const comun = {
        raiz, items, vista, panel, progreso, est: () => est, guardar,
        fallo() { est.err++; guardar(); actualizar(); },
        cerrarInstr() { if (instr) instr.open = false; },
        mostrarCierre, completa, actualizar,
    };
    const motor = d.tipo === 'elegir' ? motorElegir(comun) : motorArmar(comun);

    function mostrarCierre() {
        const rep = porRepasar();
        const hrefRuta = ruta ? 'practico.php?p=' + encodeURIComponent(ruta) : '';
        panel.className = 'nl-lab__trabajo is-cierre';
        panel.innerHTML = `
            <p class="nl-lab__cierre-tit">🎉 ¡Nivel completado!</p>
            <p>${motor.resumenCierre()} · ${est.err ? `${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}` : 'sin errores'}</p>
            ${rep.length ? `<p class="nl-lab__alt nl-lab__repasar">↺ Por repasar: ${[...new Set(rep.map(motor.nombreRepaso))].join(' · ')}</p>` : ''}
            ${d.siguiente ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${escapar(d.siguiente)}">Siguiente nivel →</a>`
                          : (hrefRuta ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${hrefRuta}">Volver a la ruta →</a>` : '')}
            ${tplCx ? `<details class="nl-lab__conexion"><summary>💡 ¿Para qué te sirve esto?</summary>${tplCx.innerHTML}</details>` : ''}
            ${motor.ayudaCierre ? `<p class="nl-lab__ayuda">${motor.ayudaCierre}</p>` : ''}
            <p class="nl-guia-ok">✓ Guardado en tu guía de estudio · <a href="${urlGuia()}">Ver guía</a></p>`;
    }

    function conexionGuia() {
        if (!tplCx) return [];
        const li = Array.from(tplCx.content.querySelectorAll('p')).map(p => p.textContent.replace(/\s+/g, ' ').trim());
        return li.length ? [{ t: 'texto', txt: '💡 ¿Para qué sirve?' }, { t: 'lista', items: li }] : [];
    }

    function actualizar() {
        const hechas = items.filter(it => est.items[it.id]).length;
        contador.textContent = hechas + ' / ' + items.length;
        errores.textContent = est.err ? `${est.err} ${est.err === 1 ? 'error' : 'errores'}` : '';
        raiz.classList.toggle('is-completa', hechas === items.length);
        if (hechas === items.length) {
            markDone(clave);
            if (!d.siguiente) markDone(d.slug);           // último nivel: la actividad queda completa en la ruta
            sumarAGuia(clave, {
                titulo: `${d.titulo} — Nivel ${d.romano}: ${d.tituloNivel}`,
                subtitulo: motor.subtituloGuia,
                slug: d.slug,
                nota: `${motor.resumenCierre()} · ${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}`,
                bloques: motor.bloquesGuia().concat(porRepasar().length
                    ? [{ t: 'texto', txt: '↺ Por repasar: ' + [...new Set(porRepasar().map(motor.nombreRepaso))].join(', ') + '.' }] : [])
                    .concat(conexionGuia()),
            });
        }
    }

    raiz.querySelector('#nl-tip-reset')?.addEventListener('click', () => {
        if (Object.keys(est.items).length && !confirm('Esto borra todas tus respuestas de este nivel. ¿Seguro?')) return;
        est = { items: {}, err: 0 };
        guardar();
        motor.reiniciar();
    });

    motor.iniciar();
}

/* ===============================================================
   Nivel "armar": el lienzo en la vista, las instrucciones y Revisar en el panel
   =============================================================== */
function motorArmar(cm) {
    const { items, vista, panel, progreso } = cm;
    let sel = null;            // ítem seleccionado
    let piezas = new Array(PUNTOS).fill(null);
    let herramienta = 'dendrita';
    let verCierre = false;
    let mensaje = '';           // pista del último intento fallido
    const tipoDe = it => it.e.replace(/^Arma una neurona\s*/i, '').replace(/\.$/, '');
    const num = it => items.indexOf(it) + 1;

    function clase(it) {
        const s = cm.est().items[it.id];
        if (!s) return it === sel ? ' is-activa' : '';
        return s.e ? ' is-repasar' : ' is-ok';
    }

    function pintarProgreso() {
        progreso.innerHTML = `<div class="nl-lab__chips">${items.map(it =>
            `<button type="button" class="nl-lab__chip${clase(it)}${it === sel ? ' is-sel' : ''}" data-id="${it.id}"
                     title="${escapar(tipoDe(it))}">${num(it)}</button>`).join('')}</div>`;
        progreso.querySelectorAll('.nl-lab__chip').forEach(b =>
            b.addEventListener('click', () => seleccionar(items.find(x => String(x.id) === b.dataset.id))));
    }

    function seleccionar(it) {
        if (!it) return;
        const s = cm.est().items[it.id];
        if (!s && sel && !cm.est().items[sel.id] && sel !== it && piezas.some(Boolean)) {
            // no se pierde una neurona a medio armar: primero se termina
            avisar('Termina primero esta neurona (presiona Revisar).');
            return;
        }
        if (sel !== it) { piezas = s ? s.piezas.slice() : new Array(PUNTOS).fill(null); mensaje = ''; herramienta = 'dendrita'; }
        sel = it;
        verCierre = false;
        pintar();
    }

    /* --- Vista: paleta arriba + lienzo grande --- */
    function pintarVista() {
        const s = sel && cm.est().items[sel.id];
        const fija = !!s || verCierre;
        if (verCierre) {
            vista.innerHTML = `<div class="nl-tip__lienzo-caja is-galeria">${items.map(it => {
                const g = cm.est().items[it.id];
                return `<figure class="nl-tip__mini${clase(it)}">${svgNeurona(g.piezas)}<figcaption>${num(it)}. ${escapar(g.r)}</figcaption></figure>`;
            }).join('')}</div>`;
            return;
        }
        vista.innerHTML = `
          <div class="nl-tip__lienzo-caja${s ? (s.e ? ' is-repasar' : ' is-ok') : ''}">
            ${fija ? `<p class="nl-tip__sello">✓ Neurona ${escapar(s.r.toLowerCase())}</p>` : `
            <div class="nl-arm__paleta nl-tip__paleta" role="radiogroup" aria-label="Pieza para agregar">
              ${Object.keys(PIEZAS).map(k => `
                <button type="button" class="nl-arm__pieza${herramienta === k ? ' active' : ''}" role="radio" aria-checked="${herramienta === k}" data-pieza="${k}">
                  ${ICONOS[PIEZAS[k].icono]}<span>${PIEZAS[k].nombre}</span></button>`).join('')}
              <button type="button" class="nl-arm__pieza${herramienta === 'quitar' ? ' active' : ''}" role="radio" aria-checked="${herramienta === 'quitar'}" data-pieza="quitar">
                <span aria-hidden="true">✕</span><span>Quitar</span></button>
            </div>`}
            <svg class="nl-tip__lienzo" viewBox="0 0 300 300" role="group" aria-label="Soma de la neurona ${num(sel)}">
              <g>${piezas.map((p, i) => p ? `<g class="pieza" transform="rotate(${i * 360 / PUNTOS} ${C} ${C})">${dibujoPieza(p)}</g>` : '').join('')}</g>
              <circle class="p-soma" cx="${C}" cy="${C}" r="${R}"/><circle class="p-nucleo" cx="${C}" cy="${C}" r="8"/>
              <g class="nl-tip__puntos">${fija ? '' : piezas.map((p, i) => {
                  const [x, y] = coordPunto(i, R + 16);
                  return `<g class="punto${p ? ' is-lleno' : ''}" data-i="${i}" role="button" tabindex="0"
                             aria-label="Punto ${LUGAR[i]} del soma: ${p ? PIEZAS[p].nombre.toLowerCase() : 'vacío'}">
                            <circle class="punto__area" cx="${x}" cy="${y}" r="15"/>
                            <circle class="punto__aro" cx="${x}" cy="${y}" r="8"/>
                            ${p ? '' : `<path class="punto__mas" d="M${x - 4} ${y} H${x + 4} M${x} ${y - 4} V${y + 4}"/>`}
                          </g>`;
              }).join('')}</g>
            </svg>
          </div>`;
        vista.querySelectorAll('.nl-arm__pieza').forEach(b => b.addEventListener('click', () => {
            herramienta = b.dataset.pieza;
            pintarVista();
        }));
        vista.querySelectorAll('.punto').forEach(g => {
            const i = Number(g.dataset.i);
            const poner = () => {
                piezas[i] = herramienta === 'quitar' ? null : (piezas[i] === herramienta ? null : herramienta);
                mensaje = '';
                pintarVista(); pintarPanel();
                vista.querySelector(`.punto[data-i="${i}"]`)?.focus({ preventScroll: true });
            };
            g.addEventListener('click', poner);
            g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); poner(); } });
        });
    }

    function resumen() {
        const n = { dendrita: 0, axon: 0, t: 0 };
        piezas.forEach(p => { if (p) n[p]++; });
        const partes = Object.keys(n).filter(k => n[k]).map(k =>
            n[k] + ' ' + (n[k] === 1 ? PIEZAS[k].nombre.toLowerCase() : PIEZAS[k].plural));
        return partes.length ? 'Tu neurona tiene: ' + partes.join(', ') + '.' : 'Todavía no agregas prolongaciones.';
    }

    /* --- Panel --- */
    function pintarPanel() {
        if (verCierre) { cm.mostrarCierre(); return; }
        const s = cm.est().items[sel.id];
        if (s) { mostrarFicha(sel); return; }
        panel.className = 'nl-lab__trabajo is-pregunta';
        panel.innerHTML = `
            <p class="nl-lab__paso"><span class="nl-lab__badge">${num(sel)}</span> ${escapar(sel.e)}</p>
            <p class="nl-lab__ayuda">Elige una pieza en la imagen y toca los <strong>+</strong> alrededor del soma.</p>
            <p class="nl-tip__resumen">${resumen()}</p>
            ${mensaje ? `<p class="nl-lab__q-fb">✗ ${escapar(mensaje)}</p>` : ''}
            <div class="nl-ficha__acciones">
                <button type="button" class="btn btn-primary btn-sm nl-tip__revisar"${piezas.some(Boolean) ? '' : ' disabled'}>Revisar</button>
                <button type="button" class="btn btn-ghost btn-sm nl-tip__limpiar"${piezas.some(Boolean) ? '' : ' disabled'}>Limpiar</button>
            </div>`;
        panel.querySelector('.nl-tip__revisar').addEventListener('click', enviar);
        panel.querySelector('.nl-tip__limpiar').addEventListener('click', () => {
            piezas = new Array(PUNTOS).fill(null); mensaje = ''; pintarVista(); pintarPanel();
        });
    }

    async function enviar() {
        if (!piezas.some(Boolean) || panel.classList.contains('is-esperando')) return;
        cm.cerrarInstr();
        panel.classList.add('is-esperando');
        const r = await revisar(sel.id, { construccion: JSON.stringify(piezas) });
        panel.classList.remove('is-esperando');
        const it = sel;
        if (!r || !r.correcto) {
            if (!(r && r.red)) { cm.est().fallos = Object.assign({}, cm.est().fallos, { [it.id]: ((cm.est().fallos || {})[it.id] || 0) + 1 }); cm.fallo(); }
            mensaje = (r && r.feedback) || 'Intenta de nuevo.';
            pintarPanel();
            const caja = vista.querySelector('.nl-tip__lienzo-caja');
            caja?.classList.remove('is-sacude'); void caja?.offsetWidth; caja?.classList.add('is-sacude');
            return;
        }
        const e = (cm.est().fallos || {})[it.id] || 0;
        cm.est().items[it.id] = { r: r.respuesta, piezas: piezas.slice(), exp: r.feedback || '', nota: r.nota || '', e };
        cm.guardar();
        pintar();
        mostrarFicha(it, e ? '✓ ¡Lo lograste!' : '🎯 ¡Correcta al primer intento!');
        if (angosta()) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function mostrarFicha(it, encabezado) {
        const s = cm.est().items[it.id];
        const sig = items.find(x => !cm.est().items[x.id]);
        panel.className = 'nl-lab__trabajo ' + (s.e ? 'is-repasar' : 'is-ok');
        panel.innerHTML = `
            ${encabezado ? `<p class="nl-lab__bien">${encabezado}</p>` : ''}
            <p class="nl-lab__paso"><span class="nl-lab__badge">${num(it)}</span> Neurona ${escapar(s.r.toLowerCase())}</p>
            <div class="nl-ficha__bloque"><span class="nl-ficha__etq">Morfología</span><p>${escapar(s.exp)}</p></div>
            ${s.nota ? `<div class="nl-ficha__bloque nl-ficha__bloque--extra"><span class="nl-ficha__etq">Para recordar</span><p>${escapar(s.nota)}</p></div>` : ''}
            <div class="nl-ficha__acciones">
                ${sig ? `<button type="button" class="btn btn-primary btn-sm nl-lab__sig">Siguiente: neurona ${num(sig)} →</button>`
                      : `<button type="button" class="btn btn-primary btn-sm nl-lab__volver">Ver resumen del nivel →</button>`}
            </div>`;
        panel.querySelector('.nl-lab__sig')?.addEventListener('click', () => {
            seleccionar(sig);
            if (angosta()) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        panel.querySelector('.nl-lab__volver')?.addEventListener('click', () => { verCierre = true; pintar(); });
    }

    function avisar(txt) {
        panel.querySelector('.nl-lab__aviso-act')?.remove();
        panel.insertAdjacentHTML('afterbegin', `<p class="nl-lab__aviso-act">${escapar(txt)}</p>`);
    }

    function pintar() {
        pintarVista();
        pintarProgreso();
        pintarPanel();
        cm.actualizar();
    }

    return {
        iniciar() {
            const pend = items.find(it => !cm.est().items[it.id]);
            if (pend) seleccionar(pend);
            else { sel = items[0]; verCierre = true; pintar(); }
        },
        reiniciar() {
            sel = null; verCierre = false;
            seleccionar(items[0]);
        },
        resumenCierre: () => `${items.length} neuronas armadas`,
        nombreRepaso: it => 'neurona ' + tipoDe(it),
        ayudaCierre: 'Toca un número para volver a ver cada neurona.',
        subtituloGuia: 'Dibujo de cada tipo de neurona: soma, dendritas, axón y neuritas',
        bloquesGuia: () => [{
            t: 'figuras',
            items: items.map(it => {
                const s = cm.est().items[it.id];
                return { svg: svgNeurona(s.piezas), titulo: 'Neurona ' + s.r.toLowerCase(), pie: s.exp + (s.nota ? ' ' + s.nota : '') };
            }),
        }],
    };
}

/* ===============================================================
   Nivel "elegir": frase + tarjetas en la vista; cuadro comparativo en el panel
   =============================================================== */
function motorElegir(cm) {
    const { raiz, items, vista, panel, progreso } = cm;
    let tipos = [];
    try { tipos = JSON.parse(raiz.dataset.tipos || '[]'); } catch { tipos = []; }
    const iconos = {};
    document.getElementById('nl-tip-iconos')?.content.querySelectorAll('[data-tipo]').forEach(n => { iconos[n.dataset.tipo] = n.innerHTML; });
    const porId = Object.fromEntries(items.map(it => [it.id, it]));
    const filaT = k => (FILAS.find(f => f.k === k) || { t: '' }).t;
    let sel = null;            // frase en pantalla
    let nueva = null;          // última celda escrita (se destaca en el cuadro)
    let verCierre = false;

    /** Orden: fila por fila (morfología → función → localización); dentro de cada fila, al azar. */
    function orden() {
        const e = cm.est();
        const ids = items.map(it => it.id);
        if (Array.isArray(e.orden) && e.orden.length === ids.length && ids.every(id => e.orden.includes(id))) return e.orden;
        e.orden = FILAS.flatMap(f => {
            const fila = items.filter(it => it.fila === f.k).map(it => it.id);
            for (let i = fila.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [fila[i], fila[j]] = [fila[j], fila[i]]; }
            return fila;
        }).concat(ids.filter(id => !items.find(it => it.id === id && FILAS.some(f => f.k === it.fila))));
        cm.guardar();
        return e.orden;
    }
    const num = it => orden().indexOf(it.id) + 1;
    const mal = it => ((cm.est().mal || {})[it.id]) || [];
    const frase = it => escapar(it.e).replace('{}', '<span class="nl-tip__hueco">____</span>');

    /* --- Vista: la frase y las tres tarjetas --- */
    function pintarVista() {
        if (verCierre) {
            vista.innerHTML = `<div class="nl-tip__frase-caja is-cierre"><p class="nl-tip__fila-etq">Tu cuadro comparativo</p>${cuadro(true)}</div>`;
            return;
        }
        const s = cm.est().items[sel.id];
        const m = mal(sel);
        vista.innerHTML = `
          <div class="nl-tip__frase-caja">
            <p class="nl-tip__fila-etq">${escapar(filaT(sel.fila))} · frase ${num(sel)} de ${items.length}</p>
            <p class="nl-tip__frase">${frase(sel)}</p>
            <div class="nl-tip__cartas" role="group" aria-label="Elige el tipo de neurona">
              ${tipos.map(t => {
                  const esMal = m.some(x => x.t === t);
                  const esOk = s && s.r === t;
                  const cls = esOk ? ' is-ok is-vuelta' : esMal ? ' is-mal is-vuelta' : (s ? ' is-apagada' : '');
                  const dorso = esOk ? `${iconos[t] || ''}<strong>✓ ${escapar(t)}</strong>`
                              : esMal ? `<strong>✗ No es ${escapar(t.toLowerCase())}</strong><small>${escapar(m.find(x => x.t === t).p)}</small>` : '';
                  return `<button type="button" class="nl-tip__carta${cls}" data-tipo="${escapar(t)}"${s || esMal ? ' disabled' : ''}>
                            <span class="nl-tip__carta-in">
                              <span class="nl-tip__cara">${iconos[t] || ''}<span class="nl-tip__carta-nom">${escapar(t).replace("Pseudo", "Pseudo&shy;")}</span></span>
                              <span class="nl-tip__dorso">${dorso}</span>
                            </span>
                          </button>`;
              }).join('')}
            </div>
          </div>`;
        vista.querySelectorAll('.nl-tip__carta:not([disabled])').forEach(b =>
            b.addEventListener('click', () => elegir(b.dataset.tipo, b)));
    }

    async function elegir(tipo, btn) {
        if (cm.est().items[sel.id] || panel.classList.contains('is-esperando')) return;
        cm.cerrarInstr();
        panel.classList.add('is-esperando');
        btn.classList.add('is-esperando');
        const it = sel;
        const r = await revisar(it.id, { respuesta: tipo });
        panel.classList.remove('is-esperando');
        if (!r || !r.correcto) {
            if (r && r.red) { btn.classList.remove('is-esperando'); avisar(r.feedback); return; }
            const e = cm.est();
            e.mal = Object.assign({}, e.mal, { [it.id]: mal(it).concat([{ t: tipo, p: String((r && r.feedback) || '').replace(/^Todavía no\.\s*(Pista:\s*)?/, '') }]) });
            cm.fallo();
            pintarVista(); pintarPanel();
            return;
        }
        cm.est().items[it.id] = { r: r.respuesta, celda: r.celda || '', exp: r.feedback || '', e: mal(it).length };
        nueva = it.id;
        cm.guardar();
        pintar();
        if (angosta()) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* --- Panel: cuadro comparativo + ficha --- */
    function cuadro(grande) {
        const hechos = items.filter(it => cm.est().items[it.id]);
        return `<table class="nl-tip__cuadro${grande ? ' is-grande' : ''}">
            <thead><tr><th></th>${tipos.map(t => `<th>${grande ? '' : iconos[t] || ''}<span>${escapar(t).replace('Pseudo', 'Pseudo&shy;')}</span></th>`).join('')}</tr></thead>
            <tbody>${FILAS.map(f => `<tr class="${!grande && sel && !verCierre && sel.fila === f.k ? 'is-actual' : ''}"><th title="${f.t}">${grande ? f.t : f.c}</th>${tipos.map(t => {
                const c = hechos.filter(it => it.fila === f.k && cm.est().items[it.id].r === t);
                return `<td>${c.length ? c.map(it => `<span class="nl-tip__celda${it.id === nueva && !grande ? ' is-nueva' : ''}">${escapar(cm.est().items[it.id].celda)}</span>`).join('')
                                       : '<span class="nl-tip__vacia">·</span>'}</td>`;
            }).join('')}</tr>`).join('')}</tbody></table>`;
    }

    function pintarProgreso() {
        progreso.hidden = verCierre;
        progreso.innerHTML = verCierre ? '' : cuadro(false);
    }

    function pintarPanel() {
        if (verCierre) { cm.mostrarCierre(); return; }
        const s = cm.est().items[sel.id];
        if (s) { mostrarFicha(sel); return; }
        const m = mal(sel);
        panel.className = 'nl-lab__trabajo is-pregunta';
        panel.innerHTML = `
            <p class="nl-lab__paso"><span class="nl-lab__badge">${num(sel)}</span> ¿Qué tipo de neurona describe la frase?</p>
            <p class="nl-lab__ayuda">Toca la tarjeta en la imagen. Fila del cuadro: <strong>${escapar(filaT(sel.fila))}</strong>.</p>
            ${m.length ? `<p class="nl-lab__q-fb">✗ Esa tarjeta no era: lee la pista y prueba con otra.</p>` : ''}`;
    }

    function mostrarFicha(it) {
        const s = cm.est().items[it.id];
        const sig = orden().map(id => porId[id]).find(x => !cm.est().items[x.id]);
        panel.className = 'nl-lab__trabajo ' + (s.e ? 'is-repasar' : 'is-ok');
        panel.innerHTML = `
            <p class="nl-lab__paso"><span class="nl-lab__badge">${num(it)}</span> Neurona ${escapar(s.r.toLowerCase())}
               ${it.id === nueva ? `<span class="nl-tip__logro">${s.e ? '✓ con pista' : '🎯 al primer intento'}</span>` : ''}</p>
            ${s.exp ? `<div class="nl-ficha__bloque"><span class="nl-ficha__etq">Para recordar</span><p>${escapar(s.exp)}</p></div>` : ''}
            <div class="nl-ficha__acciones">
                ${sig ? `<button type="button" class="btn btn-primary btn-sm nl-lab__sig">Siguiente frase →</button>`
                      : `<button type="button" class="btn btn-primary btn-sm nl-lab__volver">Ver el cuadro completo →</button>`}
            </div>`;
        if (!angosta()) panel.querySelector('.nl-ficha__acciones')?.scrollIntoView({ block: 'nearest' });
        panel.querySelector('.nl-lab__sig')?.addEventListener('click', () => {
            sel = sig; nueva = null; pintar();
            if (angosta()) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        panel.querySelector('.nl-lab__volver')?.addEventListener('click', () => { verCierre = true; nueva = null; pintar(); });
    }

    function avisar(txt) {
        panel.querySelector('.nl-lab__aviso-act')?.remove();
        panel.insertAdjacentHTML('afterbegin', `<p class="nl-lab__aviso-act">${escapar(txt)}</p>`);
    }

    function pintar() {
        pintarVista();
        pintarProgreso();
        pintarPanel();
        cm.actualizar();
    }

    return {
        iniciar() {
            const pend = orden().map(id => porId[id]).find(it => !cm.est().items[it.id]);
            if (pend) sel = pend; else { sel = porId[orden()[0]]; verCierre = true; }
            pintar();
        },
        reiniciar() {
            verCierre = false; nueva = null;
            sel = porId[orden()[0]];
            pintar();
        },
        resumenCierre: () => `${items.length} frases`,
        nombreRepaso: it => cm.est().items[it.id].r.toLowerCase(),
        ayudaCierre: 'Tu cuadro completo está a la izquierda y en tu guía.',
        subtituloGuia: 'Cuadro comparativo construido fila por fila: morfología, función y localización',
        bloquesGuia: () => [{
            t: 'tabla',
            cab: ['Característica'].concat(tipos),
            filas: FILAS.map(f => [f.t].concat(tipos.map(t => items
                .filter(it => it.fila === f.k && cm.est().items[it.id] && cm.est().items[it.id].r === t)
                .map(it => cm.est().items[it.id].celda).join(' · ')))),
        }],
    };
}

if (RAIZ) iniciar(RAIZ);
