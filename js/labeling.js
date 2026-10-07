/**
 * NeuroLab — labeling.js
 * Identificación de estructuras en "mesa de trabajo": la imagen (ajustada al alto de
 * la pantalla) muestra sólo números y formas; todo se responde en el panel derecho.
 *
 * Por estructura:
 *   1. Nombre: se escribe de memoria (o "?" si no lo sabe). Se revela el correcto;
 *      si no coincide con un sinónimo conocido, el estudiante decide si era lo mismo.
 *   2. Función: alternativas (la correcta + 3 de otras estructuras), hasta acertar.
 * Verde = nombre y función bien; ámbar = función bien pero el nombre quedó por repasar.
 * Al completar: "Sumar a mi guía" y paso al nivel siguiente (con transición de imagen).
 *
 * Respuestas en api/labeling_check.php (no van en el HTML). Avance: localStorage nl_lab2_<slug>.
 * Con ?calibrar=1, un clic sobre la imagen muestra coordenadas en % (para labeling_parts).
 */
import { markDone, isDone } from './progress.js';
import { sumarAGuia, urlGuia } from './guia.js';

const RAIZ = document.getElementById('nl-lab');
const KEY_BASE = 'nl_lab2_';
const KEY_TRANS = 'nl_lab_transicion';

function leer(slug) {
    let e = null;
    try { e = JSON.parse(localStorage.getItem(KEY_BASE + slug) || 'null'); } catch { e = null; }
    if (!e || typeof e !== 'object') e = {};
    if (!e.partes) e.partes = {};
    if (!e.err) e.err = 0;
    return e;
}
function escribir(slug, estado) {
    try { localStorage.setItem(KEY_BASE + slug, JSON.stringify(estado)); } catch { /* modo privado */ }
}
function escapar(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
async function consultar(datos) {
    const body = Object.keys(datos).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(datos[k])).join('&');
    try {
        const res = await fetch('api/labeling_check.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body,
        });
        return await res.json();
    } catch { return { ok: false, error: 'No pudimos revisar tu respuesta. ¿Hay conexión?' }; }
}

function iniciar(raiz) {
    let partes = [];
    try { partes = JSON.parse(raiz.dataset.partes || '[]'); } catch { partes = []; }
    if (!partes.length) return;

    const slug     = raiz.dataset.slug || '';
    const clave    = raiz.dataset.clave || slug;     // avance, progreso y guía (la lámina usa '<slug>:1')
    const titulo   = raiz.dataset.titulo || 'Partes de la neurona';
    const ruta     = new URLSearchParams(location.search).get('ruta') || '';
    const capa     = raiz.querySelector('#nl-lab-capa');
    const svg      = raiz.querySelector('.nl-lab__lineas');
    const canvas   = raiz.querySelector('#nl-lab-canvas');
    const panel    = raiz.querySelector('#nl-lab-feedback');
    const chips    = raiz.querySelector('#nl-lab-chips');
    const contador = raiz.querySelector('#nl-lab-contador');
    const errores  = raiz.querySelector('#nl-lab-errores');
    const btnReset = raiz.querySelector('#nl-lab-reset');
    const tplCx    = document.getElementById('nl-conexion-tpl');

    transicion(raiz, canvas, slug);

    // Instrucciones abiertas la primera vez (sin avance en esta actividad)
    const instr = raiz.querySelector('#nl-mesa-instr');

    // Nivel que exige completar el anterior
    const requiere = raiz.dataset.requiere || '';
    if (requiere && !isDone(requiere)) {
        raiz.classList.add('is-bloqueada');
        raiz.querySelector('.nl-lab__candado')?.removeAttribute('hidden');
        return;
    }

    let est = leer(clave);
    if (instr && !Object.keys(est.partes).length && !est.activa) instr.open = true;
    // est.activa = { id, n, a, r, nombreOk, opciones, mal } mientras se responde una estructura
    let sel = est.activa ? est.activa.id : (partes.find(p => !est.partes[p.id]) || partes[0]).id;
    // Al completar el nivel el panel muestra el cierre; tocar un número abre esa estructura para repasar
    let verCierre = false;
    const guardar = () => escribir(clave, est);

    /* --- Imagen: números + formas --- */
    function clase(id) {
        if (est.activa && est.activa.id === id) return ' is-activa';
        const s = est.partes[id];
        return s ? (s.nombreOk ? ' is-ok' : ' is-repasar') : '';
    }
    const anclas = p => [[p.x, p.y]].concat(p.f && p.f.t === 'puntos' ? p.f.v : []);

    /** Contorno/corchete: sólo para la estructura que se está respondiendo (o revisando). */
    function formaSVG(p) {
        if (!p.f || p.id !== sel) return '';
        const c = 'nl-lab__forma' + clase(p.id) + (p.id === sel ? ' is-sel' : '');
        const [a, b, cc, d] = p.f.v;
        if (p.f.t === 'elipse') {
            return `<ellipse cx="${a}" cy="${b}" rx="${cc}" ry="${d}" class="${c}" vector-effect="non-scaling-stroke"/>`;
        }
        if (p.f.t === 'corchete') {
            const dx = cc - a, dy = d - b, L = Math.hypot(dx, dy) || 1;
            const nx = -dy / L * 1.6, ny = dx / L * 1.6;
            return `<path d="M${a + nx} ${b + ny} L${a - nx} ${b - ny} M${a} ${b} L${cc} ${d} M${cc + nx} ${d + ny} L${cc - nx} ${d - ny}"
                          class="${c} nl-lab__corchete" vector-effect="non-scaling-stroke"/>`;
        }
        return '';
    }

    /**
     * Cada estructura: un número (en bx, by, fuera de la estructura) unido por una línea gris
     * fina a un punto pequeño sobre la estructura (x, y). La línea se vuelve naranja cuando es
     * la estructura activa; los puntos extra y su línea sólo aparecen en la activa.
     */
    // Sobre la imagen sólo aparecen las estructuras ya respondidas y la que toca ahora,
    // para dirigir la atención (los círculos del panel siguen mostrando todas).
    const yaMostrados = new Set();
    const visible = p => !!est.partes[p.id] || p.id === sel || (est.activa && est.activa.id === p.id);

    function pintarImagen() {
        const destinos = p => (p.id === sel ? anclas(p) : [[p.x, p.y]]);
        const vis = partes.filter(visible);
        const nuevos = new Set(vis.filter(p => !yaMostrados.has(p.id)).map(p => p.id));
        vis.forEach(p => yaMostrados.add(p.id));
        const ap = p => (nuevos.has(p.id) && yaMostrados.size > 1 ? ' is-aparece' : '');
        capa.innerHTML = vis.map(p => {
            const dianas = destinos(p).filter(([x, y]) => x !== p.bx || y !== p.by)
                .map(([x, y]) => `<span class="nl-lab__diana${clase(p.id)}${p.id === sel ? ' is-sel' : ''}${ap(p)}" style="left:${x}%;top:${y}%" aria-hidden="true"></span>`).join('');
            return dianas + `<button type="button" class="nl-lab__punto${clase(p.id)}${p.id === sel ? ' is-sel' : ''}${ap(p)}" data-id="${p.id}"
                     style="left:${p.bx}%;top:${p.by}%" aria-label="Estructura ${p.n}">${p.n}</button>`;
        }).join('');
        svg.innerHTML = vis.map(formaSVG).join('') + vis.map(p => destinos(p)
            .filter(([x, y]) => x !== p.bx || y !== p.by)
            .map(([x, y]) => `<line x1="${p.bx}" y1="${p.by}" x2="${x}" y2="${y}"
                class="nl-lab__guia-linea${clase(p.id)}${p.id === sel ? ' is-sel' : ''}${ap(p)}" vector-effect="non-scaling-stroke"/>`).join('')).join('');
        capa.querySelectorAll('.nl-lab__punto').forEach(b =>
            b.addEventListener('click', () => seleccionar(Number(b.dataset.id))));
    }

    function pintarChips() {
        chips.innerHTML = partes.map(p => {
            const s = est.partes[p.id];
            const t = s ? escapar(s.n) : '';
            return `<button type="button" class="nl-lab__chip${clase(p.id)}${p.id === sel ? ' is-sel' : ''}" data-id="${p.id}"
                            title="${t || 'Estructura ' + p.n}">${p.n}</button>`;
        }).join('');
        chips.querySelectorAll('.nl-lab__chip').forEach(b =>
            b.addEventListener('click', () => seleccionar(Number(b.dataset.id))));
    }

    function seleccionar(id) {
        if (est.activa && est.activa.id !== id) {
            // Primero se termina la estructura en curso
            sel = est.activa.id;
            pintarTodo();
            const fb = panel.querySelector('.nl-lab__aviso-act') || panel.insertAdjacentElement('afterbegin',
                Object.assign(document.createElement('p'), { className: 'nl-lab__aviso-act' }));
            fb.textContent = 'Termina primero esta estructura (falta su función).';
            return;
        }
        sel = id;
        verCierre = false;
        pintarTodo();
    }

    function pintarTodo() {
        pintarImagen();
        pintarChips();
        pintarPanel();
        actualizar();
    }

    /* --- Panel de trabajo --- */
    function pintarPanel() {
        if (completa() && verCierre) { mostrarCierre(); return; }
        if (completa() && !est.partes[sel]) sel = partes[0].id;
        const p = partes.find(x => x.id === sel);
        const s = est.partes[sel];
        if (est.activa && est.activa.id === sel) {
            if (est.activa.nombreOk === null) compararNombre(); else preguntarFuncion();
            return;
        }
        if (s) { mostrarFicha(sel); return; }
        panel.className = 'nl-lab__trabajo';
        panel.innerHTML = `
            <p class="nl-lab__paso"><span class="nl-lab__badge">${p.n}</span> ¿Qué estructura es?</p>
            <p class="nl-lab__ayuda">Escríbela de memoria y presiona <kbd>Enter</kbd>.</p>
            <div class="nl-lab__resp-fila">
                <input type="text" class="nl-lab__input" placeholder="Nombre de la estructura ${p.n}"
                       autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Nombre de la estructura ${p.n}">
                <button type="button" class="btn btn-primary btn-sm nl-lab__comprobar">Comprobar</button>
            </div>
            <button type="button" class="nl-lab__nose">No lo recuerdo</button>`;
        const inp = panel.querySelector('.nl-lab__input');
        const ir = () => probarNombre(p.id, inp.value.trim());
        inp.addEventListener('keydown', ev => { if (ev.key === 'Enter' && inp.value.trim()) { ev.preventDefault(); ir(); } });
        panel.querySelector('.nl-lab__comprobar').addEventListener('click', () => { if (inp.value.trim()) ir(); else inp.focus(); });
        panel.querySelector('.nl-lab__nose').addEventListener('click', () => probarNombre(p.id, ''));
        inp.focus({ preventScroll: true });
    }

    async function probarNombre(id, texto) {
        if (est.activa || est.partes[id]) return;
        if (instr) instr.open = false;          // ya empezó: las instrucciones se pliegan
        panel.classList.add('is-esperando');
        const d = await consultar({ parte_id: id, accion: 'nombre', respuesta: texto });
        panel.classList.remove('is-esperando');
        if (!d || !d.ok) { aviso((d && d.error) || 'Intenta de nuevo.'); return; }
        // nombreOk: true = coincide · false = no sabía · null = el estudiante compara
        const nombreOk = d.correcto ? true : (texto === '' ? false : null);
        if (nombreOk === false) est.err++;
        est.activa = { id, n: d.nombre, a: d.alternativas || [], r: texto, nombreOk, opciones: d.opciones || [], mal: [] };
        guardar();
        pintarTodo();
    }

    function compararNombre() {
        const a = est.activa;
        const p = partes.find(x => x.id === a.id);
        panel.className = 'nl-lab__trabajo is-pregunta';
        panel.innerHTML =
            `<p class="nl-lab__paso"><span class="nl-lab__badge">${p.n}</span> Compara tu respuesta</p>
             <div class="nl-lab__comp">
                <div><span class="nl-lab__etq">Tú escribiste</span><span class="nl-lab__suya">${escapar(a.r)}</span></div>
                <div><span class="nl-lab__etq">Respuesta correcta</span><strong class="nl-lab__correcta">${escapar(a.n)}</strong>
                     ${a.a.length ? `<span class="nl-lab__alt">También: ${a.a.map(escapar).join(' · ')}</span>` : ''}</div>
             </div>
             <p class="nl-lab__q">¿Era lo mismo?</p>
             <div class="nl-lab__decision">
                <button type="button" class="btn btn-sm nl-lab__si">✓ Sí, con otras palabras</button>
                <button type="button" class="btn btn-sm nl-lab__no">✗ No, me equivoqué</button>
             </div>`;
        panel.querySelector('.nl-lab__si').addEventListener('click', () => decidirNombre(true));
        panel.querySelector('.nl-lab__no').addEventListener('click', () => decidirNombre(false));
    }

    function decidirNombre(ok) {
        if (!est.activa) return;
        est.activa.nombreOk = ok;
        if (!ok) est.err++;
        guardar();
        pintarTodo();
    }

    function preguntarFuncion() {
        const a = est.activa;
        const p = partes.find(x => x.id === a.id);
        panel.className = 'nl-lab__trabajo is-pregunta';
        panel.innerHTML =
            `<p class="nl-lab__paso"><span class="nl-lab__badge">${p.n}</span> ${escapar(a.n)}</p>
             ${!a.nombreOk && a.a.length ? `<p class="nl-lab__alt">También: ${a.a.map(escapar).join(' · ')}</p>` : ''}
             <p class="nl-lab__q">¿Cuál es su <strong>función</strong>?</p>
             <div class="nl-lab__alts">
               ${a.opciones.map((o, i) => `
                 <button type="button" class="nl-lab__alt-btn${a.mal.includes(i) ? ' is-mal' : ''}" data-i="${i}"${a.mal.includes(i) ? ' disabled' : ''}>
                   <span class="nl-lab__alt-letra">${String.fromCharCode(65 + i)}</span><span>${escapar(o)}</span>
                 </button>`).join('')}
             </div>
             <p class="nl-lab__q-fb" aria-live="polite">${a.mal.length ? '✗ Esa función corresponde a otra estructura. Intenta de nuevo.' : ''}</p>`;
        panel.querySelectorAll('.nl-lab__alt-btn').forEach(b =>
            b.addEventListener('click', () => probarFuncion(Number(b.dataset.i), b)));
    }

    async function probarFuncion(i, btn) {
        const a = est.activa;
        if (!a || btn.disabled) return;
        btn.classList.add('is-esperando');
        const d = await consultar({ parte_id: a.id, accion: 'funcion', respuesta: a.opciones[i] });
        btn.classList.remove('is-esperando');
        if (!d || !d.ok) { aviso((d && d.error) || 'Intenta de nuevo.'); return; }
        if (!d.correcto) {
            est.err++;
            a.mal.push(i);
            guardar();
            preguntarFuncion();
            actualizar();
            panel.querySelector('.nl-lab__alts')?.classList.add('is-sacude');
            return;
        }
        est.partes[a.id] = { n: d.nombre, f: d.funcion, d: d.detalle, a: d.alternativas || [], nombreOk: !!a.nombreOk, r: a.r, errF: a.mal.length };
        est.activa = null;
        guardar();
        if (completa()) { verCierre = true; sel = null; }
        pintarTodo();
        if (!completa()) mostrarFicha(a.id, '🎯 ¡Función correcta!');
    }

    function mostrarFicha(id, encabezado) {
        const s = est.partes[id];
        const p = partes.find(x => x.id === id);
        if (!s || !p) return;
        const sig = partes.find(x => !est.partes[x.id] && x.id !== id);
        panel.className = 'nl-lab__trabajo ' + (s.nombreOk ? 'is-ok' : 'is-repasar');
        panel.innerHTML =
            `${encabezado ? `<p class="nl-lab__bien">${encabezado}</p>` : ''}
             <p class="nl-lab__paso"><span class="nl-lab__badge">${p.n}</span> ${escapar(s.n)}</p>
             ${s.a && s.a.length ? `<p class="nl-ficha__tambien">También: ${s.a.map(t => `<span>${escapar(t)}</span>`).join('')}</p>` : ''}
             <div class="nl-ficha__bloque">
                <span class="nl-ficha__etq">Función</span>
                <p>${escapar(s.f)}</p>
             </div>
             ${s.d && s.d !== s.f ? `<div class="nl-ficha__bloque nl-ficha__bloque--extra">
                <span class="nl-ficha__etq">Para recordar</span>
                <p>${escapar(s.d)}</p>
             </div>` : ''}
             <div class="nl-ficha__acciones">
                ${sig ? `<button type="button" class="btn btn-primary btn-sm nl-lab__sig">Siguiente: estructura ${sig.n} →</button>` : ''}
                ${completa() ? `<button type="button" class="btn btn-ghost btn-sm nl-lab__volver">← Resumen del nivel</button>` : ''}
             </div>`;
        panel.querySelector('.nl-lab__sig')?.addEventListener('click', () => seleccionar(sig.id));
        panel.querySelector('.nl-lab__volver')?.addEventListener('click', () => { verCierre = true; sel = null; pintarTodo(); });
    }

    function aviso(txt) {
        const p = document.createElement('p');
        p.className = 'nl-lab__aviso-act';
        p.textContent = txt;
        panel.prepend(p);
    }

    const completa = () => partes.every(p => est.partes[p.id]);
    const porRepasar = () => partes.filter(p => est.partes[p.id] && !est.partes[p.id].nombreOk);

    /** Tarjeta de cierre: resultado, siguiente nivel, para qué sirve (plegado) y guía (discreto). */
    function mostrarCierre() {
        const rep = porRepasar();
        const sig = raiz.dataset.siguiente;
        const hrefSig = raiz.dataset.siguienteHref
            || (sig ? 'actividad.php?slug=' + encodeURIComponent(sig) + (ruta ? '&ruta=' + encodeURIComponent(ruta) : '') : '');
        const hrefRuta = ruta ? 'practico.php?p=' + encodeURIComponent(ruta) : '';
        panel.className = 'nl-lab__trabajo is-cierre';
        panel.innerHTML = `
            <p class="nl-lab__cierre-tit">🎉 ¡Nivel completado!</p>
            <p>${partes.length} estructuras · ${est.err ? `${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}` : 'sin errores'}</p>
            ${rep.length ? `<p class="nl-lab__alt nl-lab__repasar">↺ Por repasar: ${rep.map(p => p.n + '. ' + escapar(est.partes[p.id].n)).join(' · ')}</p>` : ''}
            ${hrefSig ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${hrefSig}">🔍 Siguiente nivel →</a>`
                      : (hrefRuta ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${hrefRuta}">Volver a la ruta →</a>` : '')}
            ${tplCx ? `<details class="nl-lab__conexion"><summary>💡 ¿Para qué te sirve esto?</summary>${tplCx.innerHTML}</details>` : ''}
            <p class="nl-lab__ayuda">Toca un número para repasar cualquier estructura.</p>
            <p class="nl-guia-ok">✓ Guardado en tu guía de estudio · <a href="${urlGuia()}">Ver guía</a></p>`;
        panel.querySelector('a.nl-lab__sig-nivel[href^="actividad"]')?.addEventListener('click', () => {
            try { sessionStorage.setItem(KEY_TRANS, JSON.stringify({ a: sig, img: canvas.querySelector('img')?.src })); } catch { /* */ }
        });
    }

    /** Texto de "para qué sirve" (por carrera) para la guía. */
    function conexionGuia() {
        if (!tplCx) return [];
        const items = Array.from(tplCx.content.querySelectorAll('p')).map(p => p.textContent.replace(/\s+/g, ' ').trim());
        return items.length ? [{ t: 'texto', txt: '💡 ¿Para qué sirve?' }, { t: 'lista', items }] : [];
    }

    /** Imagen del nivel con todas las estructuras numeradas (para la guía). */
    async function imagenRotulada() {
        const base = canvas.querySelector('img');
        if (!base) return '';
        if (!base.complete) await new Promise(ok => { base.onload = ok; base.onerror = ok; });
        const W = Math.min(1000, base.naturalWidth || 1000);
        const H = Math.round(W * (base.naturalHeight || 1) / (base.naturalWidth || 1));
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
        g.drawImage(base, 0, 0, W, H);
        const r = Math.max(11, W / 70);
        partes.forEach(p => {
            const s = est.partes[p.id];
            const col = s && !s.nombreOk ? '#E0524A' : '#16A34A';
            const bx = W * p.bx / 100, by = H * p.by / 100;
            anclas(p).forEach(([x, y]) => {
                const ax = W * x / 100, ay = H * y / 100;
                if (ax === bx && ay === by) return;
                g.strokeStyle = 'rgba(70,60,90,.75)'; g.lineWidth = Math.max(1.5, W / 600);
                g.beginPath(); g.moveTo(bx, by); g.lineTo(ax, ay); g.stroke();
                g.fillStyle = col; g.beginPath(); g.arc(ax, ay, r / 3, 0, Math.PI * 2); g.fill();
            });
            g.fillStyle = col; g.strokeStyle = '#fff'; g.lineWidth = 2;
            g.beginPath(); g.arc(bx, by, r, 0, Math.PI * 2); g.fill(); g.stroke();
            g.fillStyle = '#fff'; g.font = `bold ${Math.round(r * 1.1)}px Arial, sans-serif`;
            g.textAlign = 'center'; g.textBaseline = 'middle';
            g.fillText(String(p.n), bx, by + 1);
        });
        return c.toDataURL('image/jpeg', 0.8);
    }
    let imgGuia = null;      // se dibuja una vez por visita, al completar

    function seccionGuia() {
        return {
            titulo,
            subtitulo: 'Identificación de estructuras y su función',
            slug,
            nota: `${partes.length} estructuras · ${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}`,
            bloques: (imgGuia ? [{ t: 'imagenes', items: [{ src: imgGuia, titulo: '', pie: 'Los números corresponden a la tabla.' }] }] : []).concat([{
                t: 'tabla',
                cab: ['Nº', 'Estructura', 'Función', 'Para recordar'],
                filas: partes.map(p => {
                    const s = est.partes[p.id];
                    return [String(p.n) + (s.nombreOk ? '' : ' ↺'), s.n, s.f, s.d && s.d !== s.f ? s.d : ''];
                }),
            }]).concat(porRepasar().length ? [{ t: 'texto',
                txt: '↺ Nombres por repasar: ' + porRepasar().map(p => est.partes[p.id].n).join(', ') + '.' }] : []).concat(conexionGuia()),
        };
    }

    function actualizar() {
        const hechas = partes.filter(p => est.partes[p.id]).length;
        if (contador) contador.textContent = hechas + ' / ' + partes.length;
        if (errores) errores.textContent = est.err ? `${est.err} ${est.err === 1 ? 'error' : 'errores'}` : '';
        raiz.classList.toggle('is-completa', hechas === partes.length);
        if (hechas === partes.length) {
            if (clave) markDone(clave);
            sumarAGuia(clave, seccionGuia());     // se guarda solo (y se actualiza)
            if (imgGuia === null) {
                imgGuia = '';
                imagenRotulada().then(src => { imgGuia = src; if (src) sumarAGuia(clave, seccionGuia()); }).catch(() => {});
            }
        }
    }

    btnReset?.addEventListener('click', () => {
        if ((Object.keys(est.partes).length || est.activa) && !confirm('Esto borra todas tus respuestas de esta actividad. ¿Seguro?')) return;
        est = { partes: {}, err: 0 };
        imgGuia = null;
        sel = partes[0].id;
        verCierre = false;
        guardar();
        pintarTodo();
    });

    if (completa() && !est.activa) { verCierre = true; sel = null; }
    pintarTodo();

    if (new URLSearchParams(location.search).get('calibrar') === '1') calibrar(canvas, raiz);
}

/** Al llegar desde el nivel anterior: la imagen anterior se funde con la nueva. */
function transicion(raiz, canvas, slug) {
    let t = null;
    try { t = JSON.parse(sessionStorage.getItem(KEY_TRANS) || 'null'); sessionStorage.removeItem(KEY_TRANS); } catch { t = null; }
    if (!t || t.a !== slug || !t.img) return;
    const prev = document.createElement('img');
    prev.src = t.img;
    prev.className = 'nl-lab__img-prev';
    prev.alt = '';
    canvas.appendChild(prev);
    canvas.classList.add('is-transicion');
    setTimeout(() => prev.classList.add('is-fuera'), 350);
    setTimeout(() => { prev.remove(); canvas.classList.remove('is-transicion'); }, 1900);
}

/** Modo docente: clic sobre la imagen -> coordenadas en % para labeling_parts. */
function calibrar(canvas, raiz) {
    const caja = document.createElement('pre');
    caja.className = 'nl-lab__calibrar';
    caja.textContent = 'Modo calibrar: clic sobre la imagen = coordenadas (x_pct, y_pct).\n';
    raiz.querySelector('.nl-mesa__panel')?.appendChild(caja);
    canvas.addEventListener('click', ev => {
        if (ev.target.closest('.nl-lab__punto')) return;
        const r = canvas.getBoundingClientRect();
        caja.textContent += `\n${((ev.clientX - r.left) / r.width * 100).toFixed(1)}, ${((ev.clientY - r.top) / r.height * 100).toFixed(1)}`;
    });
}

if (RAIZ) iniciar(RAIZ);
