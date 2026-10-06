/**
 * NeuroLab — armar-neurona.js
 * Motor del nivel "armar" de la práctica por niveles (lo usa js/practica.js).
 *
 * Cada ítem pide un tipo de neurona ("Arma una neurona bipolar"). El estudiante
 * elige una pieza (dendrita, axón o neurita en T) y toca uno de los 8 puntos
 * alrededor del soma para ponerla. Con "Revisar" la construcción se manda a
 * api/practica_check.php, que decide si corresponde al tipo pedido:
 *   · correcto   -> la neurona queda en verde y fija
 *   · incorrecto -> rojo + pista de qué falta o sobra, y se puede corregir
 */

/* ---------------------------------------------------------------
   Geometría
   --------------------------------------------------------------- */
const C = 150;          // centro del lienzo (viewBox 0 0 300 300)
const R = 24;           // radio del soma
const PUNTOS = 8;       // posiciones alrededor del soma, cada 45°
const LUGAR = ['a la derecha', 'abajo a la derecha', 'abajo', 'abajo a la izquierda',
               'a la izquierda', 'arriba a la izquierda', 'arriba', 'arriba a la derecha'];

const PIEZAS = {
    dendrita: { nombre: 'Dendrita',      plural: 'dendritas', icono: 'ic-dend' },
    axon:     { nombre: 'Axón',          plural: 'axones',    icono: 'ic-axon' },
    t:        { nombre: 'Neurita en T',  plural: 'neuritas en T', icono: 'ic-t' },
};

/* Cada pieza se dibuja apuntando a la derecha y después se gira a su posición. */
function dibujoPieza(tipo) {
    const x0 = C + R;
    if (tipo === 'dendrita') {
        return `<path class="p-dend" d="
            M${x0} ${C} L${C + 70} ${C}
            M${C + 50} ${C} L${C + 70} ${C - 18}
            M${C + 50} ${C} L${C + 68} ${C + 18}
            M${C + 70} ${C} L${C + 98} ${C - 10}
            M${C + 70} ${C} L${C + 98} ${C + 10}
            M${C + 70} ${C - 18} L${C + 88} ${C - 32}
            M${C + 68} ${C + 18} L${C + 86} ${C + 32}"/>`;
    }
    if (tipo === 'axon') {
        const vainas = [44, 66, 88].map(x =>
            `<rect class="p-mielina" x="${C + x}" y="${C - 5}" width="16" height="10" rx="4"/>`).join('');
        const botones = [[130, -11], [134, 0], [130, 11]].map(([x, y]) =>
            `<circle class="p-boton" cx="${C + x}" cy="${C + y}" r="3.6"/>`).join('');
        return `<path class="p-axon" d="
                    M${x0} ${C} L${C + 118} ${C}
                    M${C + 118} ${C} L${C + 130} ${C - 11}
                    M${C + 118} ${C} L${C + 134} ${C}
                    M${C + 118} ${C} L${C + 130} ${C + 11}"/>
                ${vainas}${botones}`;
    }
    if (tipo === 't') {
        const xb = C + 58;   // punto donde la neurita se bifurca
        const vainas = [-78, -52, 34, 60].map(y =>
            `<rect class="p-mielina" x="${xb - 5}" y="${C + y}" width="10" height="16" rx="4"/>`).join('');
        return `<path class="p-t" d="
                    M${x0} ${C} L${xb} ${C}
                    M${xb} ${C} L${xb} ${C - 96}
                    M${xb} ${C - 96} L${xb - 14} ${C - 112}
                    M${xb} ${C - 96} L${xb} ${C - 116}
                    M${xb} ${C - 96} L${xb + 14} ${C - 112}
                    M${xb} ${C} L${xb} ${C + 98}
                    M${xb} ${C + 98} L${xb - 12} ${C + 110}
                    M${xb} ${C + 98} L${xb + 12} ${C + 110}"/>
                ${vainas}
                <circle class="p-boton" cx="${xb - 12}" cy="${C + 110}" r="3.6"/>
                <circle class="p-boton" cx="${xb + 12}" cy="${C + 110}" r="3.6"/>`;
    }
    return '';
}

function coordPunto(i, radio) {
    const a = (i * 360 / PUNTOS) * Math.PI / 180;
    return [C + radio * Math.cos(a), C + radio * Math.sin(a)];
}

/* Íconos chicos para los botones de la paleta */
const ICONOS = {
    'ic-dend': '<svg viewBox="0 0 28 16" aria-hidden="true"><path class="p-dend" d="M2 8 H16 M11 8 L17 2 M11 8 L17 14 M16 8 L26 4 M16 8 L26 12"/></svg>',
    'ic-axon': '<svg viewBox="0 0 28 16" aria-hidden="true"><path class="p-axon" d="M2 8 H22 M22 8 L26 4 M22 8 L26 12"/><rect class="p-mielina" x="8" y="5" width="7" height="6" rx="2"/></svg>',
    'ic-t':    '<svg viewBox="0 0 28 16" aria-hidden="true"><path class="p-t" d="M2 8 H14 M14 1 V15"/></svg>',
};

/* ---------------------------------------------------------------
   Motor
   --------------------------------------------------------------- */
export function prepararArmar(ctx) {
    const { lista } = ctx;
    const tarjetas = Array.from(lista.querySelectorAll('.nl-arm__item')).map(li => crear(li));

    function crear(li) {
        const id    = li.dataset.id;
        const mesa  = li.querySelector('.nl-arm__mesa');
        const fb    = li.querySelector('.nl-prac__fb');
        const uid   = 'nl-arm-' + id;
        const t = {
            li,
            piezas: new Array(PUNTOS).fill(null),
            herramienta: 'dendrita',
            fija: false,
        };

        mesa.innerHTML = `
          <div class="nl-arm__paleta" role="radiogroup" aria-label="Pieza para agregar">
            ${Object.keys(PIEZAS).map(k => `
              <button type="button" class="nl-arm__pieza" role="radio" data-pieza="${k}">
                ${ICONOS[PIEZAS[k].icono]}<span>${PIEZAS[k].nombre}</span>
              </button>`).join('')}
            <button type="button" class="nl-arm__pieza" role="radio" data-pieza="quitar">
              <span aria-hidden="true">✕</span><span>Quitar</span>
            </button>
          </div>
          <svg class="nl-arm__lienzo" viewBox="0 0 300 300" role="group"
               aria-labelledby="${uid}-pide" aria-describedby="${uid}-resumen">
            <g class="nl-arm__piezas"></g>
            <g class="nl-arm__cuerpo">
              <circle class="p-soma" cx="${C}" cy="${C}" r="${R}"/>
              <circle class="p-nucleo" cx="${C}" cy="${C}" r="8"/>
            </g>
            <g class="nl-arm__puntos"></g>
          </svg>
          <p class="nl-arm__resumen" id="${uid}-resumen" aria-live="polite"></p>
          <div class="nl-arm__acciones">
            <button type="button" class="btn btn-ghost btn-sm nl-arm__limpiar">Limpiar</button>
            <button type="button" class="btn btn-primary btn-sm nl-arm__revisar">Revisar</button>
          </div>`;
        li.querySelector('.nl-arm__pide').id = uid + '-pide';

        t.gPiezas  = mesa.querySelector('.nl-arm__piezas');
        t.gPuntos  = mesa.querySelector('.nl-arm__puntos');
        t.resumen  = mesa.querySelector('.nl-arm__resumen');
        t.btnRev   = mesa.querySelector('.nl-arm__revisar');
        t.btnLimp  = mesa.querySelector('.nl-arm__limpiar');
        t.paleta   = Array.from(mesa.querySelectorAll('.nl-arm__pieza'));
        t.fb       = fb;

        t.paleta.forEach(b => b.addEventListener('click', () => elegir(t, b.dataset.pieza)));
        t.btnLimp.addEventListener('click', () => {
            t.piezas.fill(null);
            limpiarError(t);
            dibujar(t);
        });
        t.btnRev.addEventListener('click', () => revisar(t));

        // ¿Ya estaba resuelta?
        const g = ctx.guardadas()[id];
        if (g && Array.isArray(g.piezas)) {
            g.piezas.slice(0, PUNTOS).forEach((p, i) => { t.piezas[i] = PIEZAS[p] ? p : null; });
            fijar(t, g.respuesta, false);
        }
        elegir(t, t.herramienta);
        dibujar(t);
        return t;
    }

    function elegir(t, pieza) {
        t.herramienta = pieza;
        t.paleta.forEach(b => {
            const on = b.dataset.pieza === pieza;
            b.classList.toggle('active', on);
            b.setAttribute('aria-checked', on ? 'true' : 'false');
        });
    }

    function poner(t, i) {
        if (t.fija) return;
        const h = t.herramienta;
        if (h === 'quitar') t.piezas[i] = null;
        else t.piezas[i] = t.piezas[i] === h ? null : h;   // tocar la misma pieza la quita
        limpiarError(t);
        dibujar(t);
        // devolvemos el foco al mismo punto después de redibujar
        t.gPuntos.querySelector(`[data-i="${i}"]`)?.focus();
    }

    function dibujar(t) {
        t.gPiezas.innerHTML = t.piezas.map((p, i) => p
            ? `<g class="pieza" transform="rotate(${i * 360 / PUNTOS} ${C} ${C})">${dibujoPieza(p)}</g>`
            : '').join('');

        if (t.fija) {
            t.gPuntos.innerHTML = '';
        } else {
            t.gPuntos.innerHTML = t.piezas.map((p, i) => {
                const [x, y] = coordPunto(i, R + 16);
                const que = p ? PIEZAS[p].nombre.toLowerCase() : 'vacío';
                return `<g class="punto${p ? ' is-lleno' : ''}" data-i="${i}" role="button" tabindex="0"
                           aria-label="Punto ${LUGAR[i]} del soma: ${que}">
                          <circle class="punto__area" cx="${x}" cy="${y}" r="15"/>
                          <circle class="punto__aro" cx="${x}" cy="${y}" r="8"/>
                          ${p ? '' : `<path class="punto__mas" d="M${x - 4} ${y} H${x + 4} M${x} ${y - 4} V${y + 4}"/>`}
                        </g>`;
            }).join('');
            t.gPuntos.querySelectorAll('.punto').forEach(g => {
                const i = Number(g.dataset.i);
                g.addEventListener('click', () => poner(t, i));
                g.addEventListener('keydown', ev => {
                    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); poner(t, i); }
                });
            });
        }

        t.resumen.textContent = resumen(t.piezas);
        t.btnRev.disabled = t.fija || t.piezas.every(p => !p);
    }

    function resumen(piezas) {
        const n = { dendrita: 0, axon: 0, t: 0 };
        piezas.forEach(p => { if (p) n[p]++; });
        const partes = Object.keys(n).filter(k => n[k]).map(k =>
            n[k] + ' ' + (n[k] === 1 ? PIEZAS[k].nombre.toLowerCase() : PIEZAS[k].plural));
        return partes.length ? 'Tu neurona tiene: ' + partes.join(', ') + '.'
                             : 'Todavía no agregas prolongaciones al soma.';
    }

    async function revisar(t) {
        if (t.fija || t.li.dataset.enviando || t.piezas.every(p => !p)) return;
        t.li.dataset.enviando = '1';
        t.li.classList.add('is-esperando');
        const datos = await ctx.enviar(t.li.dataset.id, { construccion: JSON.stringify(t.piezas) });
        delete t.li.dataset.enviando;
        t.li.classList.remove('is-esperando');

        if (datos && datos.correcto) {
            fijar(t, datos.respuesta, true);
            t.fb.className = 'nl-prac__fb is-ok';
            t.fb.textContent = '✓ ' + (datos.feedback || '¡Correcto!');
            ctx.acierto(t.li.dataset.id, { respuesta: datos.respuesta, piezas: t.piezas.slice() });
        } else {
            ctx.error();
            t.li.classList.remove('is-mal');
            void t.li.offsetWidth;        // reinicia la animación
            t.li.classList.add('is-mal');
            t.fb.className = 'nl-prac__fb is-mal';
            t.fb.textContent = '✗ ' + ((datos && datos.feedback) || 'Intenta de nuevo.');
        }
    }

    function fijar(t, respuesta, anunciar) {
        t.fija = true;
        t.li.classList.remove('is-mal', 'is-esperando');
        t.li.classList.add('is-ok');
        t.paleta.forEach(b => { b.disabled = true; });
        t.btnLimp.hidden = true;
        t.btnRev.hidden = true;
        let sello = t.li.querySelector('.nl-arm__sello');
        if (!sello) {
            sello = document.createElement('span');
            sello.className = 'nl-prac__ok nl-arm__sello';
            t.li.querySelector('.nl-arm__pide').appendChild(sello);
        }
        sello.textContent = '✓ ' + respuesta;
        dibujar(t);
        if (anunciar) t.btnRev.blur();
    }

    function limpiarError(t) {
        t.li.classList.remove('is-mal');
        if (t.fb.classList.contains('is-mal')) {
            t.fb.className = 'nl-prac__fb';
            t.fb.textContent = '';
        }
    }

    return {
        reiniciar() {
            tarjetas.forEach(t => {
                t.fija = false;
                t.piezas.fill(null);
                t.li.classList.remove('is-ok', 'is-mal');
                t.paleta.forEach(b => { b.disabled = false; });
                t.btnLimp.hidden = false;
                t.btnRev.hidden = false;
                t.li.querySelector('.nl-arm__sello')?.remove();
                t.fb.className = 'nl-prac__fb';
                t.fb.textContent = '';
                elegir(t, 'dendrita');
                dibujar(t);
            });
        },
    };
}
