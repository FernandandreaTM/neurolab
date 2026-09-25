/**
 * NeuroLab — practica.js
 * Práctica por niveles dentro de una actividad (sección #nl-prac de actividad.php).
 *
 * Nivel tipo "completar": cada frase tiene un espacio donde el estudiante escribe
 * la respuesta (p. ej. el tipo de neurona).
 *   · correcto   -> el espacio queda verde y fijo, con una explicación corta
 *   · incorrecto -> se pone rojo, muestra una pista y deja volver a intentarlo
 *
 * Las respuestas no viajan al navegador: se revisan en api/practica_check.php.
 * El avance de cada nivel se guarda en localStorage (nl_practica_<nivelId>) y un
 * nivel se desbloquea cuando el anterior está completo.
 */
import { markDone } from './progress.js';

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

    function prepararNivel(n) {
        const panel     = n.panel;
        const lista     = panel.querySelector('.nl-prac__lista');
        const juego     = panel.querySelector('.nl-prac__juego');
        const aviso     = panel.querySelector('.nl-prac__bloqueo');
        const contador  = panel.querySelector('.nl-prac__contador');
        const final     = panel.querySelector('.nl-prac__final');
        const btnReset  = panel.querySelector('.nl-prac__reiniciar');

        // Mezclamos el orden para que las frases de un mismo tipo no queden juntas.
        barajar(Array.from(lista.children)).forEach(li => lista.appendChild(li));

        const items = Array.from(lista.querySelectorAll('.nl-prac__item'));
        items.forEach(li => {
            const inp = li.querySelector('.nl-prac__input');
            li.dataset.label = inp ? inp.getAttribute('aria-label') : 'Respuesta';
        });

        function resueltas() {
            if (!estados[n.id].resueltas) estados[n.id].resueltas = {};
            return estados[n.id].resueltas;
        }

        function fijar(li, respuesta) {
            li.classList.remove('is-mal', 'is-esperando');
            li.classList.add('is-ok');
            const hueco = li.querySelector('.nl-prac__hueco');
            hueco.innerHTML = `<span class="nl-prac__ok">${escapar(respuesta)}</span>`;
        }

        function refrescar() {
            const bloq = bloqueado(n);
            aviso.hidden = !bloq;
            juego.hidden = bloq;

            const total = items.length;
            const listas = items.filter(li => li.classList.contains('is-ok')).length;
            contador.textContent = listas + ' / ' + total;
            if (listas === total) {
                final.className = 'nl-prac__final is-ok';
                final.innerHTML = `🎉 <strong>¡Nivel completado!</strong> ` +
                    (estados[n.id].errores
                        ? `Tuviste ${estados[n.id].errores} ${estados[n.id].errores === 1 ? 'intento fallido' : 'intentos fallidos'}.`
                        : 'Sin ningún error.');
            } else {
                final.className = 'nl-prac__final';
                final.textContent = '';
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

        async function revisar(input) {
            const li = input.closest('.nl-prac__item');
            const fb = li.querySelector('.nl-prac__fb');
            const texto = input.value.trim();
            if (!texto || li.classList.contains('is-ok') || li.dataset.enviando) return;

            li.dataset.enviando = '1';
            li.classList.add('is-esperando');
            let datos;
            try {
                const res = await fetch('api/practica_check.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                    body: 'item_id=' + encodeURIComponent(li.dataset.id) + '&respuesta=' + encodeURIComponent(texto),
                });
                datos = await res.json();
            } catch {
                datos = { correcto: false, feedback: 'No pudimos revisar la respuesta. ¿Hay conexión?' };
            }
            delete li.dataset.enviando;
            li.classList.remove('is-esperando');

            if (datos && datos.correcto) {
                resueltas()[li.dataset.id] = datos.respuesta;
                escribir(n.id, estados[n.id]);
                fijar(li, datos.respuesta);
                fb.className = 'nl-prac__fb is-ok';
                fb.textContent = '✓ ' + (datos.feedback || '¡Correcto!');
                refrescar();
                siguiente(li);
            } else {
                estados[n.id].errores = (estados[n.id].errores || 0) + 1;
                escribir(n.id, estados[n.id]);
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
            const i = items.indexOf(desde);
            const orden = items.slice(i + 1).concat(items.slice(0, i));
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
        const guardadas = resueltas();
        items.forEach(li => {
            const r = guardadas[li.dataset.id];
            if (r) fijar(li, r);
            else enlazar(li);
        });

        btnReset.addEventListener('click', () => {
            if (Object.keys(resueltas()).length &&
                !confirm('Esto borra las frases que ya completaste en este nivel. ¿Seguro?')) return;
            estados[n.id] = {};
            escribir(n.id, estados[n.id]);
            // Volvemos a dibujar los espacios vacíos
            items.forEach(li => {
                li.classList.remove('is-ok', 'is-mal');
                li.querySelector('.nl-prac__hueco').innerHTML =
                    `<input type="text" class="nl-prac__input" aria-label="${escapar(li.dataset.label)}"
                            placeholder="tipo de neurona" autocomplete="off" autocapitalize="off" spellcheck="false">`;
                const fb = li.querySelector('.nl-prac__fb');
                fb.className = 'nl-prac__fb';
                fb.textContent = '';
                enlazar(li);
            });
            barajar(items).forEach(li => lista.appendChild(li));
            items.splice(0, items.length, ...Array.from(lista.querySelectorAll('.nl-prac__item')));
            refrescar();
        });

        refrescar();
    }

    pintarPestanas();
    // Abrimos el primer nivel jugable que no esté completo (o el primero).
    const inicial = jugables.find(n => !completo(n) && !bloqueado(n)) || jugables[0] || niveles[0];
    if (inicial) mostrar(inicial);
}

if (RAIZ) iniciar(RAIZ);
