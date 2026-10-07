/**
 * NeuroLab — lamina.js
 * Niveles "capturas" de la lámina, en mesa de trabajo (misma dinámica que labeling.js y tipos.js).
 * Vista: la lámina virtual (iframe, con selector de tinción) o la captura del estudiante.
 * Panel: por cada captura, 4 pasos:
 *   1. Buscar   -> dónde buscar; se pega (Ctrl+V) o se sube la captura de pantalla
 *   2. Recortar -> se arrastra un rectángulo sobre la captura (o se usa completa)
 *   3. Etiquetar-> se toca una etiqueta (lista fija) y luego su lugar en la imagen
 *   4. Preguntas-> alternativas; la incorrecta queda en rojo con su pista, hasta acertar
 * Verde = correcto · rojo suave = por repasar · naranjo = lo que se está haciendo.
 * El navegador no puede capturar el iframe de otro sitio: la captura la hace el estudiante.
 *
 * Avance en localStorage (nl_lam_<clave>). Al completar: markDone(clave) y la sección
 * (capturas anotadas + preguntas) se guarda sola en la guía.
 */
import { markDone, isDone } from './progress.js';
import { sumarAGuia, urlGuia } from './guia.js';

const RAIZ = document.getElementById('nl-lam');
const KEY_BASE = 'nl_lam_';
const MAX_BRUTA = 1400;    // captura sin recortar (lado mayor)
const MAX_FINAL = 900;     // captura recortada que se guarda
const MAX_GUIA = 760;      // imagen anotada para la guía

function leer(clave) {
    let e = null;
    try { e = JSON.parse(localStorage.getItem(KEY_BASE + clave) || 'null'); } catch { e = null; }
    if (!e || typeof e !== 'object') e = {};
    if (!e.caps) e.caps = {};
    if (!e.err) e.err = 0;
    return e;
}
function escribir(clave, estado) {
    try { localStorage.setItem(KEY_BASE + clave, JSON.stringify(estado)); return true; }
    catch { return false; }   // sin espacio o modo privado: el avance sigue en memoria
}
function escapar(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function barajar(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}
const angosta = () => window.matchMedia('(max-width: 900px)').matches;

/* ---------------------------------------------------------------
   Imágenes: reducir, recortar, anotar
   --------------------------------------------------------------- */
function cargar(src) {
    return new Promise((ok, mal) => {
        const img = new Image();
        img.onload = () => ok(img);
        img.onerror = () => mal(new Error('imagen'));
        img.src = src;
    });
}

/** Imagen (File/Blob o data URL) -> JPEG data URL; con recorte opcional en % {x, y, w, h}. */
async function procesar(fuente, maxLado, rec) {
    const url = typeof fuente === 'string' ? fuente : URL.createObjectURL(fuente);
    try {
        const img = await cargar(url);
        const r = rec || { x: 0, y: 0, w: 100, h: 100 };
        const sx = img.width * r.x / 100, sy = img.height * r.y / 100;
        const sw = img.width * r.w / 100, sh = img.height * r.h / 100;
        const k = Math.min(1, maxLado / Math.max(sw, sh));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(sw * k));
        c.height = Math.max(1, Math.round(sh * k));
        const g = c.getContext('2d');
        g.fillStyle = '#fff';
        g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
        return c.toDataURL('image/jpeg', 0.82);
    } finally {
        if (typeof fuente !== 'string') URL.revokeObjectURL(url);
    }
}

/** La etiqueta va a la derecha del punto, salvo cerca del borde derecho. */
const ladoIzq = x => x > 62;

/** Captura con sus etiquetas dibujadas (para la guía). */
async function anotada(src, pines) {
    const img = await cargar(src);
    const k = Math.min(1, MAX_GUIA / img.width);
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0, c.width, c.height);
    const fs = Math.max(13, Math.round(c.width / 42));
    g.font = `bold ${fs}px Arial, sans-serif`;
    g.textBaseline = 'middle';
    Object.entries(pines).forEach(([txt, [px, py]]) => {
        const x = c.width * px / 100, y = c.height * py / 100;
        const izq = ladoIzq(px);
        const largo = fs * 1.6;
        const tw = g.measureText(txt).width + fs * 0.8;
        const lx = izq ? x - largo - tw : x + largo;
        const ly = Math.min(Math.max(y, fs), c.height - fs);
        g.strokeStyle = '#F59E0B'; g.lineWidth = Math.max(2, fs / 7);
        g.beginPath(); g.moveTo(x, y); g.lineTo(izq ? x - largo : x + largo, ly); g.stroke();
        g.fillStyle = '#F59E0B'; g.beginPath(); g.arc(x, y, fs / 3, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
        g.fillStyle = 'rgba(26,14,46,.85)';
        const h = fs * 1.5, rr = h / 2;
        g.beginPath();
        if (g.roundRect) g.roundRect(lx, ly - h / 2, tw, h, rr); else g.rect(lx, ly - h / 2, tw, h);
        g.fill();
        g.fillStyle = '#fff';
        g.fillText(txt, lx + fs * 0.4, ly);
    });
    return c.toDataURL('image/jpeg', 0.8);
}

/* ---------------------------------------------------------------
   Componente
   --------------------------------------------------------------- */
function iniciar(raiz) {
    let caps = [], laminas = {};
    try { caps = JSON.parse(raiz.dataset.capturas || '[]'); } catch { caps = []; }
    try { laminas = JSON.parse(raiz.dataset.laminas || '{}'); } catch { laminas = {}; }
    if (!caps.length) return;

    const d = raiz.dataset;
    const clave    = d.clave;
    const ruta     = new URLSearchParams(location.search).get('ruta') || '';
    const iframe   = raiz.querySelector('.nl-lam__iframe');
    const editor   = raiz.querySelector('.nl-lam__editor');
    const caption  = raiz.querySelector('.nl-lam__caption');
    const panel    = raiz.querySelector('#nl-lam-trabajo');
    const chips    = raiz.querySelector('#nl-lam-caps');
    const contador = raiz.querySelector('#nl-lam-contador');
    const errores  = raiz.querySelector('#nl-lam-errores');
    const instr    = raiz.querySelector('#nl-mesa-instr');
    const tplCx    = document.getElementById('nl-conexion-tpl');
    const btnsTin  = Array.from(raiz.querySelectorAll('.nl-lam__tincion'));
    const btnsVer  = Array.from(raiz.querySelectorAll('.nl-lam__ver-btn'));

    if (d.requiere && !isDone(d.requiere)) {
        raiz.classList.add('is-bloqueada');
        raiz.querySelector('.nl-lab__candado')?.removeAttribute('hidden');
        return;
    }

    let est = leer(clave);
    if (instr && !Object.keys(est.caps).length) instr.open = true;
    let sel = caps.find(c => !(est.caps[c.clave] || {}).listo) || null;
    let verCierre = !sel;
    if (!sel) sel = caps[0];
    let modo = 'lamina';           // qué muestra la vista: 'lamina' | 'captura'
    let lamActual = null;
    let recorte = null;            // rectángulo en % mientras se recorta
    let etqSel = null;             // etiqueta elegida para poner
    let aviso = '';

    const cs = c => {
        if (!est.caps[c.clave]) est.caps[c.clave] = { paso: 'buscar', pines: {}, preg: {}, err: 0 };
        return est.caps[c.clave];
    };
    function guardar() {
        if (!escribir(clave, est)) aviso = 'Tu navegador no tiene espacio para guardar la imagen: no cierres esta página hasta terminar.';
    }
    const completa = () => caps.every(c => (est.caps[c.clave] || {}).listo);
    const num = c => caps.indexOf(c) + 1;

    /* --- Vista: lámina o captura --- */
    function ponerLamina(k) {
        if (!laminas[k]) return;
        if (lamActual !== k) {
            lamActual = k;
            iframe.src = laminas[k].url;
            caption.textContent = laminas[k].caption || '';
        }
        btnsTin.forEach(b => b.classList.toggle('active', b.dataset.lamina === k));
    }
    btnsTin.forEach(b => b.addEventListener('click', () => { ponerLamina(b.dataset.lamina); verVista('lamina'); }));
    btnsVer.forEach(b => b.addEventListener('click', () => { if (!b.disabled) verVista(b.dataset.ver); }));

    function verVista(m) {
        modo = m;
        const s = est.caps[sel.clave];
        const hayImg = !!(s && (s.img || s.bruta)) || verCierre;
        if (modo === 'captura' && !hayImg) modo = 'lamina';
        iframe.hidden = modo !== 'lamina';
        caption.hidden = modo !== 'lamina';
        editor.hidden = modo !== 'captura';
        btnsVer.forEach(b => {
            b.classList.toggle('active', b.dataset.ver === modo);
            if (b.dataset.ver === 'captura') b.disabled = !hayImg;
        });
        if (modo === 'captura') pintarEditor();
    }

    function pintarEditor() {
        if (verCierre) {
            editor.innerHTML = `<div class="nl-lam__galeria">${caps.map(c => {
                const s = est.caps[c.clave];
                return `<figure class="nl-lam__mini${s.err ? ' is-repasar' : ' is-ok'}">
                          <div class="nl-lam__lienzo">${imgConPines(s.img, s.pines)}</div>
                          <figcaption>${num(c)}. ${escapar(c.titulo)}</figcaption></figure>`;
            }).join('')}</div>`;
            return;
        }
        const s = cs(sel);
        if (s.paso === 'recortar' && s.bruta) {
            editor.innerHTML = `<div class="nl-lam__lienzo is-recorte" id="nl-lam-lienzo">
                  <img src="${s.bruta}" alt="Tu captura" draggable="false">
                  <div class="nl-lam__sel"${recorte ? '' : ' hidden'}></div></div>`;
            enlazarRecorte();
            return;
        }
        if (!s.img) { editor.innerHTML = ''; return; }
        const etiquetando = s.paso === 'etiquetar';
        editor.innerHTML = `<div class="nl-lam__lienzo${etiquetando && etqSel ? ' is-poner' : ''}" id="nl-lam-lienzo">
              ${imgConPines(s.img, s.pines, etiquetando ? etqSel : null)}</div>
            ${etiquetando ? `<p class="nl-lam__ayuda-vista">${etqSel ? `Toca dónde está: <strong>${escapar(etqSel)}</strong>` : 'Elige una etiqueta en el panel'}</p>` : ''}`;
        if (etiquetando) {
            const lz = editor.querySelector('#nl-lam-lienzo');
            lz.addEventListener('click', ev => {
                if (!etqSel) return;
                const r = lz.querySelector('img').getBoundingClientRect();
                const x = (ev.clientX - r.left) / r.width * 100, y = (ev.clientY - r.top) / r.height * 100;
                if (x < 0 || x > 100 || y < 0 || y > 100) return;
                s.pines[etqSel] = [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
                etqSel = sel.etiquetas.find(t => !s.pines[t]) || null;   // pasa sola a la siguiente
                guardar();
                pintarEditor(); pintarPanel();
            });
        }
    }

    function imgConPines(src, pines, activa) {
        return `<img src="${src}" alt="" draggable="false">` + Object.entries(pines || {}).map(([t, [x, y]]) =>
            `<span class="nl-lam__pin${ladoIzq(x) ? ' is-izq' : ''}${t === activa ? ' is-sel' : ''}" style="left:${x}%;top:${y}%">
               <i></i><b>${escapar(t)}</b></span>`).join('');
    }

    /* Recorte con puntero (mouse o dedo) */
    function enlazarRecorte() {
        const lz = editor.querySelector('#nl-lam-lienzo');
        const caja = lz.querySelector('.nl-lam__sel');
        const img = lz.querySelector('img');
        let ini = null;
        const pct = ev => {
            const r = img.getBoundingClientRect();
            return [Math.min(100, Math.max(0, (ev.clientX - r.left) / r.width * 100)),
                    Math.min(100, Math.max(0, (ev.clientY - r.top) / r.height * 100))];
        };
        const dibujar = () => {
            if (!recorte) { caja.hidden = true; return; }
            caja.hidden = false;
            Object.assign(caja.style, { left: recorte.x + '%', top: recorte.y + '%', width: recorte.w + '%', height: recorte.h + '%' });
        };
        dibujar();
        lz.addEventListener('pointerdown', ev => {
            ev.preventDefault();
            lz.setPointerCapture(ev.pointerId);
            ini = pct(ev);
            recorte = { x: ini[0], y: ini[1], w: 0, h: 0 };
            dibujar();
        });
        lz.addEventListener('pointermove', ev => {
            if (!ini) return;
            const [x, y] = pct(ev);
            recorte = { x: Math.min(x, ini[0]), y: Math.min(y, ini[1]), w: Math.abs(x - ini[0]), h: Math.abs(y - ini[1]) };
            dibujar();
        });
        const fin = () => {
            if (!ini) return;
            ini = null;
            if (!recorte || recorte.w < 4 || recorte.h < 4) recorte = null;
            dibujar();
            pintarPanel();
        };
        lz.addEventListener('pointerup', fin);
        lz.addEventListener('pointercancel', fin);
    }

    /* --- Chips de capturas --- */
    function pintarChips() {
        chips.innerHTML = caps.map(c => {
            const s = est.caps[c.clave];
            const cl = s && s.listo ? (s.err ? ' is-repasar' : ' is-ok') : (c === sel && !verCierre ? ' is-activa' : '');
            return `<button type="button" class="nl-lam__cap${cl}${c === sel && !verCierre ? ' is-sel' : ''}" data-clave="${escapar(c.clave)}">
                      <span>${num(c)}</span>${escapar(c.titulo)}</button>`;
        }).join('');
        chips.querySelectorAll('.nl-lam__cap').forEach(b => b.addEventListener('click', () => {
            const c = caps.find(x => x.clave === b.dataset.clave);
            const s = est.caps[c.clave];
            const enCurso = caps.find(x => x !== c && est.caps[x.clave] && !est.caps[x.clave].listo && est.caps[x.clave].paso !== 'buscar');
            if (!(s && s.listo) && enCurso) { aviso = `Termina primero: ${enCurso.titulo}.`; pintarPanel(); return; }
            elegir(c);
        }));
    }

    function elegir(c) {
        sel = c; verCierre = false; recorte = null; etqSel = null; aviso = '';
        if (c.lamina) ponerLamina(c.lamina);
        const s = cs(c);
        pintar();
        verVista(s.listo || s.paso === 'recortar' || s.paso === 'etiquetar' ? 'captura' : 'lamina');
    }

    /* --- Panel: el paso actual de la captura seleccionada --- */
    function pintarPanel() {
        if (verCierre) { mostrarCierre(); return; }
        const s = cs(sel);
        const cab = `<p class="nl-lab__paso"><span class="nl-lab__badge">${num(sel)}</span> ${escapar(sel.titulo)}</p>`;
        const pasos = ['buscar', 'recortar', 'etiquetar', 'preguntas'];
        const iP = s.listo ? 4 : pasos.indexOf(s.paso);
        const linea = `<ol class="nl-lam__pasos">${['Buscar', 'Recortar', 'Etiquetar', 'Preguntas'].map((t, i) =>
            `<li class="${i < iP ? 'is-ok' : i === iP ? 'is-actual' : ''}">${t}</li>`).join('')}</ol>`;
        const av = aviso ? `<p class="nl-lab__aviso-act">${escapar(aviso)}</p>` : '';
        aviso = '';

        if (s.listo) { mostrarFicha(); return; }
        panel.className = 'nl-lab__trabajo is-pregunta';

        if (s.paso === 'buscar') {
            panel.innerHTML = `${av}${cab}${linea}
                <div class="nl-ficha__bloque"><span class="nl-ficha__etq">Dónde buscar</span><p>${escapar(sel.busca)}</p></div>
                <div class="nl-lam__pegar" tabindex="0">
                    <strong>📋 Pega aquí tu captura</strong>
                    <span>Haz zoom, captura la pantalla (<kbd>Win</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd> · Mac: <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>4</kbd> · celular: captura de pantalla) y pégala con <kbd>Ctrl</kbd>+<kbd>V</kbd>.</span>
                    <label class="btn btn-ghost btn-sm nl-lam__subir">o súbela desde tu equipo<input type="file" accept="image/*" hidden></label>
                </div>`;
            panel.querySelector('input[type=file]').addEventListener('change', ev => {
                const f = ev.target.files && ev.target.files[0];
                if (f) recibir(f);
            });
            return;
        }

        if (s.paso === 'recortar') {
            panel.innerHTML = `${av}${cab}${linea}
                <p class="nl-lab__ayuda">Arrastra sobre tu captura para dejar solo ${/capa|cerebelo/i.test(sel.titulo) ? 'la zona que te interesa' : 'la neurona'}.</p>
                <div class="nl-ficha__acciones">
                    <button type="button" class="btn btn-primary btn-sm nl-lam__usar"${recorte ? '' : ' disabled'}>✂ Usar este recorte</button>
                    <button type="button" class="btn btn-ghost btn-sm nl-lam__completa">Usar completa</button>
                </div>
                <button type="button" class="nl-lab__nose nl-lam__otra">Cambiar la captura</button>`;
            panel.querySelector('.nl-lam__usar').addEventListener('click', () => recortar(recorte));
            panel.querySelector('.nl-lam__completa').addEventListener('click', () => recortar(null));
            panel.querySelector('.nl-lam__otra').addEventListener('click', otraCaptura);
            return;
        }

        if (s.paso === 'etiquetar') {
            const puestas = sel.etiquetas.filter(t => s.pines[t]).length;
            panel.innerHTML = `${av}${cab}${linea}
                <p class="nl-lab__ayuda">Toca una etiqueta y luego su lugar en tu imagen. Para moverla, tócala otra vez y elige otro lugar.</p>
                <div class="nl-lam__etqs">${sel.etiquetas.map(t =>
                    `<button type="button" class="nl-lam__etq${s.pines[t] ? ' is-ok' : ''}${t === etqSel ? ' is-sel' : ''}" data-t="${escapar(t)}">${s.pines[t] ? '✓ ' : ''}${escapar(t)}</button>`).join('')}</div>
                <p class="nl-lab__ayuda">${puestas} / ${sel.etiquetas.length} etiquetas</p>
                <div class="nl-ficha__acciones">
                    <button type="button" class="btn btn-primary btn-sm nl-lam__listo"${puestas === sel.etiquetas.length ? '' : ' disabled'}>Listo: a las preguntas →</button>
                </div>
                <button type="button" class="nl-lab__nose nl-lam__otra">Cambiar la captura</button>`;
            panel.querySelectorAll('.nl-lam__etq').forEach(b => b.addEventListener('click', () => {
                etqSel = b.dataset.t; pintarPanel(); verVista('captura');
            }));
            panel.querySelector('.nl-lam__listo').addEventListener('click', () => {
                s.paso = 'preguntas'; etqSel = null; guardar(); pintar(); verVista('captura');
            });
            panel.querySelector('.nl-lam__otra').addEventListener('click', otraCaptura);
            return;
        }

        // Preguntas: una a la vez
        const iq = sel.preguntas.findIndex((q, i) => !(s.preg[i] || {}).ok);
        if (iq < 0) { s.listo = true; guardar(); actualizar(); mostrarFicha(); return; }
        const q = sel.preguntas[iq];
        const r = s.preg[iq] || (s.preg[iq] = { mal: [], orden: barajar(q.ops.length) });
        panel.innerHTML = `${av}${cab}${linea}
            <p class="nl-lab__ayuda">Pregunta ${iq + 1} de ${sel.preguntas.length}</p>
            <p class="nl-lab__q">${escapar(q.p)}</p>
            <div class="nl-lab__alts">${r.orden.map((io, k) => `
                <button type="button" class="nl-lab__alt-btn${r.mal.includes(io) ? ' is-mal' : ''}" data-i="${io}"${r.mal.includes(io) ? ' disabled' : ''}>
                    <span class="nl-lab__alt-letra">${String.fromCharCode(65 + k)}</span><span>${escapar(q.ops[io])}</span></button>`).join('')}</div>
            ${r.mal.length ? `<p class="nl-lab__q-fb">✗ Pista: ${escapar(q.pista || 'intenta de nuevo.')}</p>` : ''}`;
        panel.querySelectorAll('.nl-lab__alt-btn:not([disabled])').forEach(b => b.addEventListener('click', () => {
            const io = Number(b.dataset.i);
            if (io !== q.ok) {
                r.mal.push(io); s.err = (s.err || 0) + 1; est.err++;
                guardar(); pintarPanel(); actualizar();
                panel.querySelector('.nl-lab__alts')?.classList.add('is-sacude');
                return;
            }
            r.ok = true;
            guardar();
            mostrarRespuesta(iq);
        }));
    }

    function mostrarRespuesta(iq) {
        const s = cs(sel);
        const q = sel.preguntas[iq];
        const r = s.preg[iq];
        const ultima = iq === sel.preguntas.length - 1;
        panel.className = 'nl-lab__trabajo ' + (r.mal.length ? 'is-repasar' : 'is-ok');
        panel.innerHTML = `
            <p class="nl-lab__paso"><span class="nl-lab__badge">${num(sel)}</span> ${escapar(sel.titulo)}
               <span class="nl-tip__logro">${r.mal.length ? '✓ con pista' : '🎯 al primer intento'}</span></p>
            <p class="nl-lab__q">${escapar(q.p)}</p>
            <div class="nl-ficha__bloque"><span class="nl-ficha__etq">Respuesta</span><p>${escapar(q.ops[q.ok])}</p></div>
            ${q.exp ? `<div class="nl-ficha__bloque nl-ficha__bloque--extra"><span class="nl-ficha__etq">Para recordar</span><p>${escapar(q.exp)}</p></div>` : ''}
            <div class="nl-ficha__acciones">
                <button type="button" class="btn btn-primary btn-sm nl-lab__sig">${ultima ? 'Terminar esta captura →' : 'Siguiente pregunta →'}</button>
            </div>`;
        panel.querySelector('.nl-lab__sig').addEventListener('click', () => {
            if (ultima) { s.listo = true; guardar(); actualizar(); if (completa()) verCierre = true; }
            pintar();
            if (verCierre) verVista('captura');
        });
    }

    function mostrarFicha() {
        const s = cs(sel);
        const sig = caps.find(c => !(est.caps[c.clave] || {}).listo);
        panel.className = 'nl-lab__trabajo ' + (s.err ? 'is-repasar' : 'is-ok');
        panel.innerHTML = `
            <p class="nl-lab__paso"><span class="nl-lab__badge">${num(sel)}</span> ${escapar(sel.titulo)} <span class="nl-tip__logro">✓ lista</span></p>
            <div class="nl-ficha__bloque"><span class="nl-ficha__etq">Reconociste</span><p>${sel.etiquetas.map(escapar).join(' · ')}</p></div>
            <div class="nl-ficha__bloque nl-ficha__bloque--extra"><span class="nl-ficha__etq">Respuestas</span>
                ${sel.preguntas.map(q => `<p>• ${escapar(q.ops[q.ok])}</p>`).join('')}</div>
            <div class="nl-ficha__acciones">
                ${sig ? `<button type="button" class="btn btn-primary btn-sm nl-lab__sig">Siguiente: ${escapar(sig.titulo)} →</button>`
                      : `<button type="button" class="btn btn-primary btn-sm nl-lab__volver">Resumen del nivel →</button>`}
            </div>`;
        panel.querySelector('.nl-lab__sig')?.addEventListener('click', () => elegir(sig));
        panel.querySelector('.nl-lab__volver')?.addEventListener('click', () => { verCierre = true; pintar(); verVista('captura'); });
    }

    async function recibir(blob) {
        const s = cs(sel);
        if (verCierre || s.listo || (s.paso !== 'buscar' && s.paso !== 'recortar')) return;
        if (instr) instr.open = false;
        panel.classList.add('is-esperando');
        try {
            s.bruta = await procesar(blob, MAX_BRUTA);
            s.paso = 'recortar';
            recorte = null;
            guardar();
        } catch {
            aviso = 'No pudimos leer esa imagen. Prueba con otra captura.';
        }
        panel.classList.remove('is-esperando');
        pintar();
        verVista('captura');
        if (angosta()) raiz.querySelector('.nl-lam__vista').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function recortar(rec) {
        const s = cs(sel);
        panel.classList.add('is-esperando');
        try {
            s.img = await procesar(s.bruta, MAX_FINAL, rec);
            delete s.bruta;
            s.pines = {};
            s.paso = 'etiquetar';
            etqSel = sel.etiquetas[0];
            recorte = null;
            guardar();
        } catch { aviso = 'No pudimos recortar la imagen. Intenta de nuevo.'; }
        panel.classList.remove('is-esperando');
        pintar();
        verVista('captura');
    }

    function otraCaptura() {
        const s = cs(sel);
        delete s.bruta; delete s.img;
        s.pines = {}; s.paso = 'buscar';
        recorte = null; etqSel = null;
        guardar();
        pintar();
        verVista('lamina');
    }

    // Pegar con Ctrl+V en cualquier parte de la página
    document.addEventListener('paste', ev => {
        const it = Array.from((ev.clipboardData && ev.clipboardData.items) || []).find(i => i.type.startsWith('image/'));
        if (!it) return;
        ev.preventDefault();
        recibir(it.getAsFile());
    });

    /* --- Cierre y guía --- */
    const porRepasar = () => caps.filter(c => (est.caps[c.clave] || {}).err);

    function mostrarCierre() {
        const rep = porRepasar();
        const hrefRuta = ruta ? 'practico.php?p=' + encodeURIComponent(ruta) : '';
        panel.className = 'nl-lab__trabajo is-cierre';
        panel.innerHTML = `
            <p class="nl-lab__cierre-tit">🎉 ¡Nivel completado!</p>
            <p>${caps.length} capturas etiquetadas · ${est.err ? `${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}` : 'sin errores'}</p>
            ${rep.length ? `<p class="nl-lab__alt nl-lab__repasar">↺ Por repasar: ${rep.map(c => escapar(c.titulo)).join(' · ')}</p>` : ''}
            ${d.siguiente ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${escapar(d.siguiente)}">Siguiente nivel →</a>`
                          : (hrefRuta ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${hrefRuta}">Volver a la ruta →</a>` : '')}
            ${tplCx ? `<details class="nl-lab__conexion"><summary>💡 ¿Para qué te sirve esto?</summary>${tplCx.innerHTML}</details>` : ''}
            <p class="nl-lab__ayuda">Tus capturas etiquetadas están a la izquierda. Toca una captura arriba para repasarla.</p>
            <p class="nl-guia-ok">✓ Guardado en tu guía de estudio · <a href="${urlGuia()}">Ver guía</a></p>`;
    }

    let guiaHecha = false;
    async function guardarGuia() {
        if (guiaHecha) return;
        guiaHecha = true;
        const imagenes = [];
        for (const c of caps) {
            const s = est.caps[c.clave];
            try { imagenes.push({ src: await anotada(s.img, s.pines), titulo: c.titulo, pie: 'Reconocí: ' + c.etiquetas.join(', ') + '.' }); }
            catch { /* sin imagen: queda el resto de la sección */ }
        }
        const cx = tplCx ? Array.from(tplCx.content.querySelectorAll('p')).map(p => p.textContent.replace(/\s+/g, ' ').trim()) : [];
        sumarAGuia(clave, {
            titulo: d.titulo,
            subtitulo: 'Capturas de la lámina etiquetadas y preguntas',
            slug: d.slug,
            nota: `${caps.length} capturas · ${est.err} ${est.err === 1 ? 'intento fallido' : 'intentos fallidos'}`,
            bloques: [{ t: 'imagenes', items: imagenes },
                      { t: 'tabla', cab: ['Pregunta', 'Respuesta', 'Para recordar'],
                        filas: caps.flatMap(c => c.preguntas.map(q => [q.p, q.ops[q.ok], q.exp || ''])) }]
                .concat(porRepasar().length ? [{ t: 'texto', txt: '↺ Por repasar: ' + porRepasar().map(c => c.titulo).join(', ') + '.' }] : [])
                .concat(cx.length ? [{ t: 'texto', txt: '💡 ¿Para qué sirve?' }, { t: 'lista', items: cx }] : []),
        });
    }

    function actualizar() {
        const hechas = caps.filter(c => (est.caps[c.clave] || {}).listo).length;
        contador.textContent = hechas + ' / ' + caps.length;
        errores.textContent = est.err ? `${est.err} ${est.err === 1 ? 'error' : 'errores'}` : '';
        if (hechas === caps.length) {
            markDone(clave);
            if (!d.siguiente) markDone(d.slug);
            guardarGuia();
        }
    }

    function pintar() {
        pintarChips();
        pintarPanel();
        actualizar();
        if (modo === 'captura') pintarEditor();
    }

    raiz.querySelector('#nl-lam-reset')?.addEventListener('click', () => {
        if (Object.keys(est.caps).length && !confirm('Esto borra tus capturas y respuestas de este nivel. ¿Seguro?')) return;
        est = { caps: {}, err: 0 };
        guardar();
        guiaHecha = false;
        elegir(caps[0]);
    });

    // Inicio
    const primera = (sel && sel.lamina) || Object.keys(laminas)[0];
    if (primera) ponerLamina(primera);
    pintar();
    const s0 = est.caps[sel.clave];
    verVista(verCierre || (s0 && (s0.paso === 'recortar' || s0.paso === 'etiquetar' || s0.listo)) ? 'captura' : 'lamina');
}

if (RAIZ) iniciar(RAIZ);
