/**
 * NeuroLab — practica.js
 * Práctica por niveles dentro de una actividad (sección #nl-prac de actividad.php).
 *
 * Tipos de nivel (practica_niveles.tipo):
 *   · completar -> cada frase tiene un espacio donde se escribe la respuesta
 *   · elegir    -> cada frase se responde tocando un botón (con dibujo) del tipo
 *   · armar     -> se arma una neurona sobre un soma (js/armar-neurona.js)
 * En ambos: correcto = verde y fijo; incorrecto = rojo + pista y reintento.
 *
 * Las respuestas no viajan al navegador: se revisan en api/practica_check.php.
 * El avance de cada nivel se guarda en localStorage (nl_practica_<nivelId>) y un
 * nivel se desbloquea cuando el anterior está completo.
 */
import { markDone } from './progress.js';
import { prepararArmar } from './armar-neurona.js';
import { botonGuia } from './guia.js';

const RAIZ = document.getElementById('nl-prac');
const KEY_BASE = 'nl_practica_';

/* ---------------------------------------------------------------
   Estado persistente (tolera modo privado / storage bloqueado)
   --------------------------------------------------------------- */
function leer(nivelId) {
    try { return JSON.parse(localStorage.getItem(KEY_BASE + nivelId) || '{}') || {}; }
    catch { return {}; }
}
function escribir(nivelId, estado) {
    try { localStorage.setItem(KEY_BASE + nivelId, JSON.stringify(estado)); }
    catch { /* el avance sigue en memoria */ }
}

function escapar(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function barajar(nodos) {
    const a = nodos.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/* ---------------------------------------------------------------
   Componente
   --------------------------------------------------------------- */
function iniciar(raiz) {
    const slug  = raiz.dataset.slug || '';
    const tabs  = Array.from(raiz.querySelectorAll('.nl-prac__nivel'));
    const niveles = tabs.map(t => ({
        id: t.dataset.nivel,
        activo: t.dataset.activo === '1',
        total: Number(t.dataset.total) || 0,
        tab: t,
        numero: t.dataset.numero || '',
        titulo: (t.querySelector('.nl-prac__nivel-titulo')?.textContent || '').trim(),
        panel: raiz.querySelector(`.nl-prac__panel[data-nivel="${t.dataset.nivel}"]`),
    }));
    const estados = Object.fromEntries(niveles.map(n => [n.id, leer(n.id)]));

    const jugables = niveles.filter(n => n.activo && n.total > 0);
    const hechas   = n => Object.keys(estados[n.id].resueltas || {}).length;
    const completo = n => n.total > 0 && hechas(n) >= n.total;

    /** Un nivel jugable está bloqueado si el nivel jugable anterior no está completo. */
    function bloqueado(n) {
        const i = jugables.indexOf(n);
        return i > 0 && !completo(jugables[i - 1]);
    }

    /* --- Pestañas --- */
    function mostrar(nivel) {
        niveles.forEach(n => {
            const activo = n === nivel;
            n.tab.classList.toggle('active', activo);
            n.tab.setAttribute('aria-selected', activo ? 'true' : 'false');
            n.tab.tabIndex = activo ? 0 : -1;
            if (n.panel) n.panel.hidden = !activo;
        });
    }

    tabs.forEach((t, i) => {
        t.addEventListener('click', () => mostrar(niveles[i]));
        t.addEventListener('keydown', ev => {
            if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
            ev.preventDefault();
            const j = (i + (ev.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
            tabs[j].focus();
            mostrar(niveles[j]);
        });
    });

    function pintarPestanas() {
        niveles.forEach(n => {
            const estado = n.tab.querySelector('.nl-prac__nivel-estado');
            n.tab.classList.remove('is-completo', 'is-bloqueado', 'is-pronto');
            if (!n.activo || !n.total) {
                n.tab.classList.add('is-pronto');
                estado.textContent = 'Próximamente';
            } else if (bloqueado(n)) {
                n.tab.classList.add('is-bloqueado');
                estado.textContent = '🔒 Bloqueado';
            } else if (completo(n)) {
                n.tab.classList.add('is-completo');
                estado.textContent = '✓ Completado';
            } else {
                estado.textContent = hechas(n) + ' / ' + n.total;
            }
        });
    }

    /* --- Cada nivel jugable --- */
    jugables.forEach(n => prepararNivel(n));

    /**
     * Parte común de todos los niveles: contador, mensaje final, reinicio,
     * bloqueo y guardado. Lo propio de cada tipo de ejercicio (qué se dibuja y
     * cómo se responde) lo pone un "motor": completar (acá abajo) o armar
     * (js/armar-neurona.js).
     */
    function prepararNivel(n) {
        const panel     = n.panel;
        const juego     = panel.querySelector('.nl-prac__juego');
        const aviso     = panel.querySelector('.nl-prac__bloqueo');
        const contador  = panel.querySelector('.nl-prac__contador');
        const final     = panel.querySelector('.nl-prac__final');
        const btnReset  = panel.querySelector('.nl-prac__reiniciar');
        const lista     = panel.querySelector('.nl-prac__lista');
        const guiaBox   = document.createElement('div');
        guiaBox.hidden = true;
        final.insertAdjacentElement('afterend', guiaBox);

        // Mezclamos el orden para que los ítems de un mismo tipo no queden juntos.
        barajar(Array.from(lista.children)).forEach(li => lista.appendChild(li));

        function resueltas() {
            if (!estados[n.id].resueltas) estados[n.id].resueltas = {};
            return estados[n.id].resueltas;
        }

        function refrescar() {
            const bloq = bloqueado(n);
            aviso.hidden = !bloq;
            juego.hidden = bloq;

            const listas = hechas(n);
            contador.textContent = listas + ' / ' + n.total;
            if (completo(n)) {
                const e = estados[n.id].errores || 0;
                final.className = 'nl-prac__final is-ok';
                final.innerHTML = `🎉 <strong>¡Nivel completado!</strong> ` +
                    (e ? `Tuviste ${e} ${e === 1 ? 'intento fallido' : 'intentos fallidos'}.` : 'Sin ningún error.');
                guiaBox.hidden = false;
                botonGuia(guiaBox, slug + ':' + n.numero, () => seccionGuia(n, panel, estados[n.id]));
            } else {
                final.className = 'nl-prac__final';
                final.textContent = '';
                guiaBox.hidden = true;
            }
            pintarPestanas();
            // Los niveles siguientes pueden haberse desbloqueado
            jugables.forEach(o => {
                if (o === n) return;
                const b = bloqueado(o);
                const oa = o.panel.querySelector('.nl-prac__bloqueo');
                const oj = o.panel.querySelector('.nl-prac__juego');
                if (oa) oa.hidden = !b;
                if (oj) oj.hidden = b;
            });
            if (slug && jugables.every(completo)) markDone(slug);
        }

        /** Lo que cada motor recibe para hablar con la parte común. */
        const ctx = {
            panel,
            lista,
            escapar,
            guardadas: () => resueltas(),
            /** Manda un intento a api/practica_check.php y devuelve el JSON. */
            async enviar(itemId, campos) {
                let body = 'item_id=' + encodeURIComponent(itemId);
                Object.keys(campos).forEach(k => {
                    body += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(campos[k]);
                });
                try {
                    const res = await fetch('api/practica_check.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                        body,
                    });
                    return await res.json();
                } catch {
                    return { correcto: false, feedback: 'No pudimos revisar la respuesta. ¿Hay conexión?' };
                }
            },
            /** Guarda la explicación de un acierto para la guía de estudio. */
            explicar(itemId, texto) {
                if (!estados[n.id].exp) estados[n.id].exp = {};
                estados[n.id].exp[itemId] = texto;
                escribir(n.id, estados[n.id]);
            },
            acierto(itemId, valor) {
                resueltas()[itemId] = valor;
                escribir(n.id, estados[n.id]);
                refrescar();
            },
            error() {
                estados[n.id].errores = (estados[n.id].errores || 0) + 1;
                escribir(n.id, estados[n.id]);
            },
        };

        const tipo  = panel.dataset.tipo || 'completar';
        const motor = tipo === 'armar' ? prepararArmar(ctx)
                    : tipo === 'elegir' ? prepararElegir(ctx)
                    : prepararCompletar(ctx);

        btnReset.addEventListener('click', () => {
            if (Object.keys(resueltas()).length &&
                !confirm('Esto borra lo que ya completaste en este nivel. ¿Seguro?')) return;
            estados[n.id] = {};
            escribir(n.id, estados[n.id]);
            motor.reiniciar();
            barajar(Array.from(lista.children)).forEach(li => lista.appendChild(li));
            refrescar();
        });

        refrescar();
    }

    pintarPestanas();
    // Abrimos el primer nivel jugable que no esté completo (o el primero).
    const inicial = jugables.find(n => !completo(n) && !bloqueado(n)) || jugables[0] || niveles[0];
    if (inicial) mostrar(inicial);
}

/* ---------------------------------------------------------------
   Sección para "Mi guía de estudio"
   --------------------------------------------------------------- */
function seccionGuia(n, panel, estado) {
    const titAct = (document.querySelector('.nl-act-header h1')?.textContent || 'Práctica').trim();
    const res = estado.resueltas || {};
    const exp = estado.exp || {};
    const e = estado.errores || 0;
    const items = Array.from(panel.querySelectorAll('.nl-prac__item'))
        .sort((a, b) => Number(a.dataset.id) - Number(b.dataset.id));
    const sec = {
        titulo: `${titAct} — Nivel ${n.numero}: ${n.titulo}`,
        subtitulo: (panel.querySelector('.nl-prac__instr')?.textContent || '').trim(),
        nota: `${items.length} ejercicios · ${e} ${e === 1 ? 'intento fallido' : 'intentos fallidos'}`,
        bloques: [],
    };
    if ((panel.dataset.tipo || '') === 'armar') {
        sec.bloques.push({ t: 'figuras', items: items.map(li => {
            const r = res[li.dataset.id] || {};
            const lienzo = li.querySelector('.nl-arm__lienzo')?.cloneNode(true);
            let svg = '';
            if (lienzo) {
                lienzo.querySelector('.nl-arm__puntos')?.remove();
                ['role', 'aria-labelledby', 'aria-describedby'].forEach(a => lienzo.removeAttribute(a));
                lienzo.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svg = lienzo.outerHTML;
            }
            return { svg, titulo: r.respuesta || '', pie: r.exp || '' };
        }) });
        // El cuadro resumen de la actividad (si existe) completa esta sección
        const tabla = document.querySelector('.nl-comp-resumen table');
        if (tabla) {
            const filas = Array.from(tabla.querySelectorAll('tr')).map(tr =>
                Array.from(tr.children).map(c => c.textContent.trim()));
            sec.bloques.push({ t: 'texto', txt: 'Cuadro comparativo de los tipos de neurona:' });
            sec.bloques.push({ t: 'tabla', cab: filas[0], filas: filas.slice(1) });
        }
    } else {
        sec.bloques.push({ t: 'tabla', cab: ['Enunciado', 'Respuesta', 'Explicación'], filas: items.map(li => {
            const frase = li.querySelector('.nl-prac__frase')?.cloneNode(true);
            frase?.querySelector('.nl-prac__hueco')?.replaceWith('____');
            const txt = (frase ? frase.textContent : '').replace(/\s+/g, ' ').trim();
            return [txt, res[li.dataset.id] || '', exp[li.dataset.id] || ''];
        }) });
    }
    return sec;
}

/* ---------------------------------------------------------------
   Motor "completar": frase con un espacio para escribir la respuesta
   --------------------------------------------------------------- */
function prepararCompletar(ctx) {
    const { lista, escapar: esc } = ctx;
    const items = () => Array.from(lista.querySelectorAll('.nl-prac__item'));

    items().forEach(li => {
        const inp = li.querySelector('.nl-prac__input');
        li.dataset.label = inp ? inp.getAttribute('aria-label') : 'Respuesta';
    });

    function fijar(li, respuesta) {
        li.classList.remove('is-mal', 'is-esperando');
        li.classList.add('is-ok');
        li.querySelector('.nl-prac__hueco').innerHTML = `<span class="nl-prac__ok">${esc(respuesta)}</span>`;
    }

    async function revisar(input) {
        const li = input.closest('.nl-prac__item');
        const fb = li.querySelector('.nl-prac__fb');
        const texto = input.value.trim();
        if (!texto || li.classList.contains('is-ok') || li.dataset.enviando) return;

        li.dataset.enviando = '1';
        li.classList.add('is-esperando');
        const datos = await ctx.enviar(li.dataset.id, { respuesta: texto });
        delete li.dataset.enviando;
        li.classList.remove('is-esperando');

        if (datos && datos.correcto) {
            fijar(li, datos.respuesta);
            fb.className = 'nl-prac__fb is-ok';
            fb.textContent = '✓ ' + (datos.feedback || '¡Correcto!');
            ctx.explicar(li.dataset.id, datos.feedback || '');
            ctx.acierto(li.dataset.id, datos.respuesta);
            siguiente(li);
        } else {
            ctx.error();
            li.classList.remove('is-mal');
            void li.offsetWidth;          // reinicia la animación
            li.classList.add('is-mal');
            fb.className = 'nl-prac__fb is-mal';
            fb.textContent = '✗ ' + ((datos && datos.feedback) || 'Intenta de nuevo.');
            input.select();
        }
    }

    /** Tras acertar, deja el cursor en la siguiente frase pendiente. */
    function siguiente(desde) {
        const todos = items();
        const i = todos.indexOf(desde);
        const orden = todos.slice(i + 1).concat(todos.slice(0, i));
        const prox = orden.find(li => !li.classList.contains('is-ok'));
        if (prox) prox.querySelector('.nl-prac__input')?.focus();
    }

    function enlazar(li) {
        const input = li.querySelector('.nl-prac__input');
        if (!input) return;
        input.addEventListener('keydown', ev => {
            if (ev.key === 'Enter') { ev.preventDefault(); revisar(input); }
        });
        input.addEventListener('input', () => li.classList.remove('is-mal'));
        input.addEventListener('blur', () => { if (input.value.trim()) revisar(input); });
    }

    // Restaurar lo ya acertado
    const guardadas = ctx.guardadas();
    items().forEach(li => {
        const r = guardadas[li.dataset.id];
        if (r) fijar(li, r);
        else enlazar(li);
    });

    return {
        reiniciar() {
            items().forEach(li => {
                li.classList.remove('is-ok', 'is-mal');
                li.querySelector('.nl-prac__hueco').innerHTML =
                    `<input type="text" class="nl-prac__input" aria-label="${esc(li.dataset.label)}"
                            placeholder="tipo de neurona" autocomplete="off" autocapitalize="off" spellcheck="false">`;
                const fb = li.querySelector('.nl-prac__fb');
                fb.className = 'nl-prac__fb';
                fb.textContent = '';
                enlazar(li);
            });
        },
    };
}

if (RAIZ) iniciar(RAIZ);

/* ---------------------------------------------------------------
   Motor "elegir": frase + botones con el dibujo de cada opción
   --------------------------------------------------------------- */
function prepararElegir(ctx) {
    const { lista } = ctx;
    const items = () => Array.from(lista.querySelectorAll('.nl-eleg__item'));

    function fijar(li, respuesta) {
        li.classList.remove('is-mal', 'is-esperando');
        li.classList.add('is-ok');
        li.querySelectorAll('.nl-eleg__op').forEach(b => {
            const es = b.dataset.valor === respuesta;
            b.classList.toggle('is-ok', es);
            b.classList.remove('is-mal');
            b.disabled = true;
            b.hidden = !es;
        });
    }

    async function elegir(li, btn) {
        if (li.classList.contains('is-ok') || li.dataset.enviando || btn.disabled) return;
        const fb = li.querySelector('.nl-prac__fb');
        li.dataset.enviando = '1';
        btn.classList.add('is-esperando');
        const datos = await ctx.enviar(li.dataset.id, { respuesta: btn.dataset.valor });
        delete li.dataset.enviando;
        btn.classList.remove('is-esperando');

        if (datos && datos.correcto) {
            fijar(li, btn.dataset.valor);
            fb.className = 'nl-prac__fb is-ok';
            fb.textContent = '✓ ' + (datos.feedback || '¡Correcto!');
            ctx.explicar(li.dataset.id, datos.feedback || '');
            ctx.acierto(li.dataset.id, btn.dataset.valor);
        } else {
            ctx.error();
            btn.classList.add('is-mal');
            btn.disabled = true;
            li.classList.remove('is-mal');
            void li.offsetWidth;
            li.classList.add('is-mal');
            fb.className = 'nl-prac__fb is-mal';
            fb.textContent = '✗ ' + ((datos && datos.feedback) || 'Intenta de nuevo.');
        }
    }

    const guardadas = ctx.guardadas();
    items().forEach(li => {
        li.querySelectorAll('.nl-eleg__op').forEach(b => b.addEventListener('click', () => elegir(li, b)));
        const r = guardadas[li.dataset.id];
        if (r) fijar(li, r);
    });

    return {
        reiniciar() {
            items().forEach(li => {
                li.classList.remove('is-ok', 'is-mal');
                li.querySelectorAll('.nl-eleg__op').forEach(b => {
                    b.disabled = false; b.hidden = false; b.classList.remove('is-ok', 'is-mal');
                });
                const fb = li.querySelector('.nl-prac__fb');
                fb.className = 'nl-prac__fb';
                fb.textContent = '';
            });
        },
    };
}
