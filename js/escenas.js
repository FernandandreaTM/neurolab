/**
 * NeuroLab — escenas.js
 * Nivel «escenas» de una lámina: casos en orden sobre una imagen fija (`fondo`, coordenadas en `vb`).
 *   · modo «poe» (predice → observa → explica): cada caso trae una predicción de una sola oportunidad;
 *     al responder se ve la animación del caso (partículas por rutas, efectos y rótulos) y la explicación.
 *   · modo «casos»: pasos «tocar» (una zona del fondo), «tarjeta» (célula con ícono) y «elegir»
 *     (alternativas con pista); al terminar, la lesión se marca en el fondo y el caso suma una fila al cuadro.
 * Son preguntas formativas: las respuestas vienen en data-nivel. Avance: localStorage nl_esc_<clave>.
 * Al completar: markDone(clave) y la sección va a la guía (imagen + cuadro + explicaciones).
 */
import { markDone, bloqueado } from './progress.js';
import { sumarAGuia, urlGuia } from './guia.js';
import { conexionGuia } from './carrera.js';

const RAIZ = document.getElementById('nl-esc');
const MAX_GUIA = 900;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const angosta = () => window.matchMedia('(max-width: 900px)').matches;
const cargar = src => new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
function barajar(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}

/** Partículas (dibujadas en torno a 0,0; se escalan según el ancho del fondo). */
const FORMAS = {
    glu:  ['Glucosa', '<polygon points="10,0 5,8.7 -5,8.7 -10,0 -5,-8.7 5,-8.7" fill="#FB923C" stroke="#C2410C" stroke-width="2"/>'],
    lac:  ['Lactato', '<path d="M0,-11 C5,-4 8,0 8,4 A8,8 0 0 1 -8,4 C-8,0 -5,-4 0,-11Z" fill="#FDE047" stroke="#A16207" stroke-width="2"/>'],
    glut: ['Glutamato', '<circle r="6.5" fill="#22C55E" stroke="#15803D" stroke-width="2"/>'],
    gln:  ['Glutamina', '<rect x="-5.5" y="-5.5" width="11" height="11" transform="rotate(45)" fill="#2DD4BF" stroke="#0F766E" stroke-width="2"/>'],
    prot: ['Proteínas de la sangre', '<circle r="11" fill="#A78BFA" stroke="#6D28D9" stroke-width="2"/><circle r="4" cx="-3" cy="-3" fill="#EDE9FE"/>'],
    agua: ['Agua', '<path d="M0,-9 C4,-3 6,0 6,3.5 A6,6 0 0 1 -6,3.5 C-6,0 -4,-3 0,-9Z" fill="#7DD3FC" stroke="#0369A1" stroke-width="1.6"/>'],
    ca:   ['Ca²⁺', '<circle r="5.5" fill="#F87171" stroke="#B91C1C" stroke-width="2"/><text y="2.5" font-size="7" font-weight="700" text-anchor="middle" fill="#fff" font-family="Arial">+</text>'],
};

/** Zonas: e = elipse [cx, cy, rx, ry] · r = rectángulo [x, y, w, h] · l = líneas [[[x, y], …], …] con tolerancia w. */
function dentro(z, x, y) {
    if (z.e) { const [cx, cy, rx, ry] = z.e; return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1; }
    if (z.r) { const [rx, ry, w, h] = z.r; return x >= rx && x <= rx + w && y >= ry && y <= ry + h; }
    if (z.l) {
        const w = z.w || 24;
        return z.l.some(lin => lin.some((p, i) => {
            if (!i) return false;
            const [ax, ay] = lin[i - 1], [bx, by] = p, dx = bx - ax, dy = by - ay;
            const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
            return Math.hypot(x - (ax + t * dx), y - (ay + t * dy)) <= w;
        }));
    }
    return false;
}
function centro(z) {
    if (z.e) return [z.e[0], z.e[1]];
    if (z.r) return [z.r[0] + z.r[2] / 2, z.r[1] + z.r[3] / 2];
    const l = z.l[0]; return l[Math.floor(l.length / 2)];
}
function formaSvg(z, attrs) {
    if (z.e) return `<ellipse cx="${z.e[0]}" cy="${z.e[1]}" rx="${z.e[2]}" ry="${z.e[3]}" ${attrs}/>`;
    if (z.r) return `<rect x="${z.r[0]}" y="${z.r[1]}" width="${z.r[2]}" height="${z.r[3]}" rx="${Math.min(z.r[2], z.r[3]) / 3}" ${attrs}/>`;
    return z.l.map(l => `<polyline points="${l.map(p => p.join(',')).join(' ')}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${attrs}/>`).join('');
}

function iniciar(raiz) {
    const d = raiz.dataset;
    let N = {};
    try { N = JSON.parse(d.nivel || '{}'); } catch { N = {}; }
    const casos = N.casos || [];
    if (!casos.length) return;
    const VB = N.vb || [100, 100];
    const S = N.escala || VB[0] / 640;          // tamaño de las partículas
    const poe = N.modo === 'poe';
    const zonas = N.zonas || {};
    const clave = d.clave, KEY = 'nl_esc_' + clave;
    const ruta = new URLSearchParams(location.search).get('ruta') || '';
    const vista = raiz.querySelector('#nl-esc-vista');
    const panel = raiz.querySelector('#nl-esc-trabajo');
    const pasosEl = raiz.querySelector('#nl-esc-pasos');
    const contador = raiz.querySelector('#nl-esc-contador');
    const errores = raiz.querySelector('#nl-esc-errores');
    const instr = raiz.querySelector('#nl-mesa-instr');
    const tplCx = document.getElementById('nl-conexion-tpl');
    const iconos = {};
    document.getElementById('nl-esc-iconos')?.content.querySelectorAll('[data-op]').forEach(n => { iconos[n.dataset.op] = n.innerHTML; });

    if (bloqueado(d.requiere)) {
        raiz.classList.add('is-bloqueada');
        raiz.querySelector('.nl-lab__candado')?.removeAttribute('hidden');
        return;
    }

    let est = null;
    try { est = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { est = null; }
    if (!est || typeof est !== 'object' || !est.c) est = { c: {}, err: 0, nombres: true };
    const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(est)); } catch { /* sin espacio */ } };
    const ec = cs => {
        const e = est.c[cs.clave] || (est.c[cs.clave] = { paso: 0, r: {} });
        cs.pasos.forEach((p, i) => {
            const r = e.r[i] || (e.r[i] = { mal: [] });
            if (p.ops && !Array.isArray(r.orden)) r.orden = barajar(p.ops.length);
        });
        return e;
    };
    const listo = cs => ec(cs).paso >= cs.pasos.length;
    const actual = () => casos.find(cs => !listo(cs)) || null;
    let ver = actual() || casos[casos.length - 1];
    let verCierre = !actual();
    let marca = null;        // último toque fallido [x, y]
    let recien = false;      // el caso se acaba de resolver: se anima desde el principio
    if (instr && !Object.keys(est.c).length) instr.open = true;

    const NOMBRES_PASO = { predice: 'Predice', tocar: 'Dónde', tarjeta: 'Célula', elegir: 'Por qué' };
    const nomPaso = p => p.nombre || NOMBRES_PASO[p.tipo] || 'Pregunta';
    const pct = (x, y) => [x / VB[0] * 100, y / VB[1] * 100];
    /** En «casos» el diagnóstico (corto) se ve sólo al resolverlo; antes, el paciente. */
    const nombreCaso = cs => (poe || listo(cs) ? cs.corto : '') || cs.titulo;
    const malCaso = cs => Object.values(ec(cs).r).some(r => r.mal.length || r.fallo);

    /* ---------------- Animación de un caso ---------------- */
    function particula(f, dd, dur, t, rep) {
        const forma = FORMAS[f] || FORMAS.glut;
        const vis = rep
            ? `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.08;.88;1" dur="${dur}s" begin="${t}s" repeatCount="indefinite"/>`
            : `<set attributeName="opacity" to="1" begin="${t}s" fill="freeze"/>`;
        return `<g opacity="0">${vis}<animateMotion path="${dd}" dur="${dur}s" begin="${t}s" ${rep ? 'repeatCount="indefinite"' : 'fill="freeze"'}/>
            <g transform="scale(${S})">${forma[1]}</g></g>`;
    }
    function animSvg(a) {
        let svg = '';
        (a.efectos || []).forEach(ef => {
            const col = ef.c || 'rgba(239,68,68,.35)';
            const attrs = ef.l ? `stroke="${col}" stroke-width="${ef.w || 18}"` : `fill="${col}" stroke="${ef.s || 'none'}" stroke-width="${ef.sw || 4}"`;
            svg += `<g class="nl-esc__ef" style="animation-delay:${ef.t || 0}s"><g class="${ef.a === 'pulso' ? 'nl-esc__pulso' : ef.a === 'crece' ? 'nl-esc__crece' : ''}">${formaSvg(ef, attrs)}</g></g>`;
        });
        (a.flujos || []).forEach(fl => {
            const n = fl.n || 4, dur = fl.dur || 3, t0 = fl.t || 0, rep = fl.rep !== false;
            for (let i = 0; i < n; i++) {
                const fin = fl.fin && fl.fin[i % fl.fin.length];
                const dd = fin ? `${fl.d} L${fin[0]} ${fin[1]}` : fl.d;
                svg += particula(fl.f, dd, dur, rep ? +(t0 + i * dur / n).toFixed(2) : +(t0 + i * (fl.paso || .35)).toFixed(2), rep);
            }
        });
        return svg;
    }
    const rotulos = (lista, base) => (lista || []).map(r => {
        const [x, y] = pct(r.x, r.y);
        return `<span class="nl-esc__rot${base ? ' is-base' : ''}${r.i ? ' is-izq' : ''}${r.c ? ' is-' + r.c : ''}" style="left:${x}%;top:${y}%;animation-delay:${base ? 0 : r.s || 0}s"><i></i>${esc(r.t)}</span>`;
    }).join('');
    const formasDe = a => [...new Set((a.flujos || []).map(f => f.f))];

    /* ---------------- Vista ---------------- */
    function pintarVista() {
        const cs = ver, e = ec(cs);
        if (verCierre && N.cuadro) { vista.innerHTML = `<div class="nl-esc__cuadro-caja"><p class="nl-tip__fila-etq">Tu cuadro comparativo</p>${cuadro(true)}</div>`; return; }
        if (cs.vista === 'cuadro') { vista.innerHTML = `<div class="nl-esc__cuadro-caja"><p class="nl-tip__fila-etq">${esc(cs.titulo)}</p>${cuadro(true)}</div>`; return; }
        const hecho = listo(cs);
        const animar = hecho && cs.anim;
        const p = !hecho ? cs.pasos[e.paso] : null;
        let svg = '', html = '';
        // Zonas ya halladas en este caso (modo casos)
        cs.pasos.forEach((ps, i) => {
            if (ps.tipo !== 'tocar' || !(e.r[i] || {}).ok || animar) return;
            ps.ok.forEach(k => { if (zonas[k]) svg += `<g class="nl-esc__zona-ok">${formaSvg(zonas[k], zonas[k].l ? 'stroke="rgba(239,68,68,.55)" stroke-width="22"' : 'fill="rgba(239,68,68,.35)" stroke="#EF4444" stroke-width="4"')}</g>`; });
        });
        if (animar) { svg += animSvg(cs.anim); html += rotulos(cs.anim.rotulos); }
        if (est.nombres && N.nombres && !animar) html += rotulos(N.nombres, true);   // durante la animación hablan sus propios rótulos
        if (marca && p && p.tipo === 'tocar') { const [x, y] = pct(marca[0], marca[1]); html += `<span class="nl-rompe__marca" style="left:${x}%;top:${y}%">✗</span>`; }
        const ley = animar ? formasDe(cs.anim) : [];
        const tocable = p && p.tipo === 'tocar';
        vista.innerHTML = `
            <div class="nl-lam__lienzo nl-circ__lienzo--fijo nl-esc__lienzo${tocable ? ' is-tocable' : ''}" id="nl-esc-lienzo">
              <img src="${esc(d.fondo)}" alt="${esc(N.alt || 'Esquema')}" draggable="false">
              <svg class="nl-circ__capa nl-esc__capa" viewBox="0 0 ${VB[0]} ${VB[1]}" preserveAspectRatio="none" aria-hidden="true">${svg}</svg>
              ${html}
            </div>
            <div class="nl-esc__barra">
              <p class="nl-lam__ayuda-vista">${tocable ? `<strong>Toca en ${esc(N.donde || 'la imagen')}</strong>` : hecho ? (cs.anim ? `<strong>${esc(cs.titulo)}</strong>: mira lo que pasa` : esc(cs.titulo)) : `<strong>${esc(cs.titulo)}</strong>`}</p>
              ${ley.length ? `<span class="nl-esc__ley">${ley.map(f => `<span><svg viewBox="-12 -12 24 24" aria-hidden="true">${FORMAS[f][1]}</svg>${FORMAS[f][0]}</span>`).join('')}</span>` : ''}
              <span class="nl-esc__botones">
                ${N.nombres && !animar ? `<button type="button" class="nl-esc__btn" data-acc="nombres" aria-pressed="${est.nombres ? 'true' : 'false'}">${est.nombres ? '✓ ' : ''}Nombres</button>` : ''}
                ${animar ? '<button type="button" class="nl-esc__btn" data-acc="repetir">▶ Ver de nuevo</button>' : ''}
              </span>
            </div>`;
        const s = vista.querySelector('svg.nl-esc__capa');
        try { s.setCurrentTime(0); } catch { /* sin SMIL */ }
        recien = false;
        vista.querySelector('[data-acc="nombres"]')?.addEventListener('click', () => { est.nombres = !est.nombres; guardar(); pintarVista(); });
        vista.querySelector('[data-acc="repetir"]')?.addEventListener('click', () => { recien = true; pintarVista(); });
        if (tocable) {
            const lz = vista.querySelector('#nl-esc-lienzo');
            lz.addEventListener('click', ev => {
                const r0 = lz.querySelector('img').getBoundingClientRect();
                const x = (ev.clientX - r0.left) / r0.width * VB[0], y = (ev.clientY - r0.top) / r0.height * VB[1];
                if (x < 0 || y < 0 || x > VB[0] || y > VB[1]) return;
                tocar(cs, [Math.round(x), Math.round(y)]);
            });
        }
    }

    /* ---------------- Respuestas ---------------- */
    function avanzar(cs) {
        const e = ec(cs);
        e.paso++;
        marca = null;
        if (e.paso >= cs.pasos.length) recien = true;
        guardar();
        pintar();
        if (angosta() && listo(cs) && cs.anim) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function tocar(cs, xy) {
        if (instr) instr.open = false;
        const e = ec(cs), i = e.paso, p = cs.pasos[i], r = e.r[i];
        if (p.ok.some(k => zonas[k] && dentro(zonas[k], xy[0], xy[1]))) { r.ok = true; r.xy = xy; avanzar(cs); return; }
        const otra = Object.keys(zonas).find(k => dentro(zonas[k], xy[0], xy[1]));
        r.mal.push(otra && zonas[otra].nombre ? `Tocaste ${zonas[otra].nombre}. ${p.pista || ''}` : (p.pista || 'Ahí no.'));
        est.err++; marca = xy; guardar(); pintar();
    }
    function responder(cs, io) {
        if (instr) instr.open = false;
        const e = ec(cs), i = e.paso, p = cs.pasos[i], r = e.r[i];
        if (p.tipo === 'predice') {          // una sola oportunidad: se anota y se ve qué pasa
            r.elegida = io; r.ok = io === p.ok; r.fallo = !r.ok;
            if (!r.ok) est.err++;
            avanzar(cs); return;
        }
        if (io !== p.ok) {
            r.mal.push(io); est.err++; guardar(); pintarPanel(); actualizar();
            panel.querySelector('.nl-lab__alts, .nl-esc__cartas')?.classList.add('is-sacude');
            return;
        }
        r.ok = true; r.elegida = io; avanzar(cs);
    }

    /* ---------------- Panel ---------------- */
    const bloque = (etq, txt, extra) => `<div class="nl-ficha__bloque${extra ? ' nl-ficha__bloque--extra' : ''}"><span class="nl-ficha__etq">${esc(etq)}</span><p>${esc(txt)}</p></div>`;

    function pintarPasos() {
        const act = actual();
        pasosEl.innerHTML = casos.map((cs, i) => {
            const cl = listo(cs) ? (malCaso(cs) ? 'is-repasar' : 'is-ok') : cs === act ? 'is-actual' : '';
            return `<li class="${cl}${cs === ver && !verCierre ? ' is-viendo' : ''}"><button type="button" data-i="${i}"${listo(cs) || cs === act ? '' : ' disabled'}>${esc(nombreCaso(cs))}</button></li>`;
        }).join('');
        pasosEl.querySelectorAll('button:not([disabled])').forEach(b => b.addEventListener('click', () => {
            ver = casos[Number(b.dataset.i)]; verCierre = false; marca = null; recien = true; pintar();
        }));
    }

    function cuadro(grande) {
        const filas = casos.filter(cs => cs.fila && (grande || listo(cs) || cs === ver));
        return `<table class="nl-tip__cuadro${grande ? ' is-grande' : ''} nl-esc__cuadro">
            <thead><tr>${N.cuadro.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
            <tbody>${filas.map(cs => `<tr class="${!grande && cs === ver && !verCierre ? 'is-actual' : ''}">${[nombreCaso(cs)].concat(cs.fila).map((v, k) =>
                k ? `<td>${listo(cs) ? esc(v) : '<span class="nl-tip__vacia">·</span>'}</td>` : `<th>${esc(v)}</th>`).join('')}</tr>`).join('')}</tbody></table>`;
    }

    function htmlPaso(cs, p, r) {
        const ops = r.orden.map(io => ({ io, txt: p.ops[io] }));
        if (p.tipo === 'tarjeta') {
            return `<p class="nl-lab__q">${esc(p.p)}</p>
                <div class="nl-esc__cartas">${ops.map(o => `<button type="button" class="nl-esc__carta${r.mal.includes(o.io) ? ' is-mal' : ''}" data-i="${o.io}"${r.mal.includes(o.io) ? ' disabled' : ''}>
                    ${iconos[o.txt] || ''}<span>${esc(o.txt)}</span></button>`).join('')}</div>
                ${r.mal.length ? `<p class="nl-lab__q-fb">✗ Pista: ${esc(p.pista || 'intenta de nuevo.')}</p>` : ''}`;
        }
        return `<p class="nl-lab__q">${esc(p.p)}</p>
            <div class="nl-lab__alts">${ops.map((o, k) => `
                <button type="button" class="nl-lab__alt-btn${r.mal.includes(o.io) ? ' is-mal' : ''}" data-i="${o.io}"${r.mal.includes(o.io) ? ' disabled' : ''}>
                    <span class="nl-lab__alt-letra">${String.fromCharCode(65 + k)}</span><span>${esc(o.txt)}</span></button>`).join('')}</div>
            ${r.mal.length ? `<p class="nl-lab__q-fb">✗ Pista: ${esc(p.pista || 'intenta de nuevo.')}</p>` : ''}`;
    }

    function pintarPanel() {
        if (verCierre) { mostrarCierre(); return; }
        const cs = ver, e = ec(cs), iC = casos.indexOf(cs);
        const mini = `<ol class="nl-lam__pasos nl-circ__mini">${cs.pasos.map((p, i) => `<li class="${i < e.paso ? ((e.r[i] || {}).fallo || (e.r[i] || {}).mal?.length ? 'is-repasar' : 'is-ok') : i === e.paso ? 'is-actual' : ''}">${esc(nomPaso(p))}</li>`).join('')}${poe ? `<li class="${listo(cs) ? 'is-ok' : ''}">Mira</li>` : ''}</ol>`;
        const cab = `<p class="nl-lab__paso"><span class="nl-lab__badge">${iC + 1}</span> ${esc(cs.titulo)}</p>${mini}
            ${cs.situacion ? `<p class="nl-esc__situacion">${esc(cs.situacion)}</p>` : ''}`;
        if (!listo(cs)) {
            const i = e.paso, p = cs.pasos[i], r = e.r[i];
            panel.className = 'nl-lab__trabajo is-pregunta';
            const hechas = cs.pasos.slice(0, i).map((pp, k) => pp.tipo === 'tocar' ? '' : bloque('✓ ' + nomPaso(pp), pp.ops[pp.ok])).join('');
            if (p.tipo === 'tocar') {
                panel.innerHTML = `${cab}${hechas}<p class="nl-lab__q">${esc(p.p)}</p>
                    <p class="nl-lab__ayuda">Toca el lugar en ${esc(N.donde || 'la imagen')}.</p>
                    ${r.mal.length ? `<p class="nl-lab__q-fb">✗ ${esc(r.mal[r.mal.length - 1])}</p>` : ''}`;
                return;
            }
            panel.innerHTML = `${cab}${hechas}${p.tipo === 'predice' ? '<p class="nl-esc__poe">🔮 <strong>Predice</strong> antes de mirar: tienes una sola oportunidad.</p>' : ''}${htmlPaso(cs, p, r)}`;
            panel.querySelectorAll('[data-i]:not([disabled])').forEach(b => b.addEventListener('click', () => responder(cs, Number(b.dataset.i))));
            return;
        }
        // Caso resuelto: explicación
        const pr = cs.pasos.findIndex(p => p.tipo === 'predice');
        const rp = pr >= 0 ? e.r[pr] : null;
        const sig = actual();
        panel.className = 'nl-lab__trabajo ' + (malCaso(cs) ? 'is-repasar' : 'is-ok');
        panel.innerHTML = `${cab}
            ${rp ? `<p class="nl-esc__pred ${rp.ok ? 'is-ok' : 'is-mal'}">${rp.ok ? '🎯 Predijiste bien' : '↺ Tu predicción no era'}: «${esc(cs.pasos[pr].ops[rp.elegida])}»</p>
                    ${rp.ok ? '' : bloque('Lo que pasa en realidad', cs.pasos[pr].ops[cs.pasos[pr].ok])}` : ''}
            ${cs.pasos.filter(p => p.tipo !== 'predice' && p.tipo !== 'tocar').map(p => bloque('✓ ' + nomPaso(p), p.ops[p.ok])).join('')}
            ${cs.fila && N.cuadro ? bloque('Tu fila del cuadro', N.cuadro.slice(1).map((c, k) => c + ': ' + cs.fila[k]).join(' · ')) : ''}
            ${cs.exp ? bloque('Para recordar', cs.exp, true) : ''}
            ${cs.img ? `<button type="button" class="nl-mprac__mini nl-esc__mini" aria-label="Ver la imagen grande"><img src="${esc(cs.img)}" alt=""><span>🔍 ${esc(cs.img_t || 'Ver imagen real')}</span></button>` : ''}
            <div class="nl-ficha__acciones">
                ${sig ? `<button type="button" class="btn btn-primary btn-sm nl-sig">${poe ? 'Siguiente escena' : 'Siguiente caso'} →</button>`
                      : '<button type="button" class="btn btn-primary btn-sm nl-fin">Terminar el nivel →</button>'}
            </div>`;
        panel.querySelector('.nl-esc__mini')?.addEventListener('click', () => abrirVisor(cs));
        panel.querySelector('.nl-sig')?.addEventListener('click', () => {
            ver = actual(); recien = true; pintar();
            if (angosta()) vista.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        panel.querySelector('.nl-fin')?.addEventListener('click', () => { verCierre = true; pintar(); });
    }

    function abrirVisor(cs) {
        const v = document.createElement('div');
        v.className = 'nl-mprac__visor';
        v.setAttribute('role', 'dialog'); v.setAttribute('aria-modal', 'true');
        v.innerHTML = `<div class="nl-mprac__visor-caja">
            <button type="button" class="nl-mprac__visor-x" aria-label="Cerrar">✕</button>
            <img src="${esc(cs.img)}" alt="">
            ${cs.ctx ? `<p class="nl-mprac__visor-ctx">${esc(cs.ctx)}</p>` : ''}
            ${cs.pie ? `<p class="nl-mprac__visor-pie">${esc(cs.pie)}</p>` : ''}</div>`;
        const cerrar = () => { v.remove(); document.removeEventListener('keydown', tecla); };
        const tecla = ev => { if (ev.key === 'Escape') cerrar(); };
        v.addEventListener('click', ev => { if (ev.target === v || ev.target.closest('.nl-mprac__visor-x')) cerrar(); });
        document.addEventListener('keydown', tecla);
        document.body.appendChild(v);
        v.querySelector('.nl-mprac__visor-x').focus();
    }

    const porRepasar = () => casos.filter(malCaso).map(cs => cs.corto || cs.titulo);
    function mostrarCierre() {
        const rep = porRepasar();
        const hrefRuta = ruta ? 'practico.php?p=' + encodeURIComponent(ruta) : '';
        panel.className = 'nl-lab__trabajo is-cierre';
        panel.innerHTML = `
            <p class="nl-lab__cierre-tit">🎉 ¡Nivel completado!</p>
            <p>${est.err ? `${est.err} ${poe ? (est.err === 1 ? 'predicción por repasar' : 'predicciones por repasar') : (est.err === 1 ? 'intento fallido' : 'intentos fallidos')}` : poe ? 'Todas tus predicciones fueron correctas' : 'Sin errores'}</p>
            ${rep.length ? `<p class="nl-lab__alt nl-lab__repasar">↺ Por repasar: ${esc(rep.join(' · '))}</p>` : ''}
            ${d.siguiente ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${esc(d.siguiente)}">Siguiente nivel →</a>`
                          : (hrefRuta ? `<a class="btn btn-primary nl-lab__sig-nivel" href="${hrefRuta}">Volver a la ruta →</a>` : '')}
            ${tplCx ? `<details class="nl-lab__conexion"><summary>💡 ¿Para qué te sirve esto?</summary>${tplCx.innerHTML}</details>` : ''}
            <p class="nl-lab__ayuda">Toca un número arriba para volver a ver cualquier ${poe ? 'escena' : 'caso'}.</p>
            <p class="nl-guia-ok">✓ Guardado en tu guía de estudio · <a href="${urlGuia()}">Ver guía</a></p>`;
        panel.querySelectorAll('.nl-lab__sig-nivel, .nl-guia-ok a').forEach(a => a.addEventListener('click', async ev => {
            if (!guiaPromesa) return;
            ev.preventDefault();
            a.classList.add('is-esperando');
            try { await guiaPromesa; } catch { /* igual se sigue */ }
            location.href = a.href;
        }));
    }

    /* ---------------- Guía ---------------- */
    async function imagenGuia() {
        const img = await cargar(d.fondo);
        const W = MAX_GUIA, H = Math.round(W * VB[1] / VB[0]);
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
        g.drawImage(img, 0, 0, W, H);
        const sx = W / VB[0], fs = Math.max(12, Math.round(W / 58));
        const rot = (txt, x, y, borde, izq) => {
            g.font = `bold ${fs}px Arial, sans-serif`; g.textBaseline = 'middle';
            const tw = g.measureText(txt).width + fs * .8, h = fs * 1.5;
            let lx = izq ? x - tw - fs * .5 : x + fs * .5;
            lx = Math.min(Math.max(lx, 2), W - tw - 2);
            g.fillStyle = borde; g.beginPath(); g.arc(x, y, fs * .32, 0, Math.PI * 2); g.fill();
            g.fillStyle = 'rgba(26,14,46,.88)'; g.beginPath(); if (g.roundRect) g.roundRect(lx, y - h / 2, tw, h, h / 2); else g.rect(lx, y - h / 2, tw, h); g.fill();
            g.strokeStyle = borde; g.lineWidth = 2; g.stroke();
            g.fillStyle = '#fff'; g.fillText(txt, lx + fs * .4, y);
        };
        if (poe) {
            (N.nombres || []).forEach(n => rot(n.t, n.x * sx, n.y * sx, '#F59E0B', n.i));
        } else {
            // Cada caso: su zona marcada con su número
            casos.forEach((cs, i) => {
                const ef = ((cs.anim || {}).efectos || []);
                g.save(); g.scale(sx, sx);
                ef.forEach(z => {
                    g.beginPath();
                    if (z.e) g.ellipse(z.e[0], z.e[1], z.e[2], z.e[3], 0, 0, Math.PI * 2);
                    else if (z.r) g.rect(...z.r);
                    else z.l.forEach(l => l.forEach((p, k) => (k ? g.lineTo(...p) : g.moveTo(...p))));
                    if (z.l) { g.strokeStyle = 'rgba(239,68,68,.45)'; g.lineWidth = (z.w || 18); g.lineCap = 'round'; g.stroke(); }
                    else { g.fillStyle = 'rgba(239,68,68,.32)'; g.fill(); }
                });
                g.restore();
            });
        }
        return c.toDataURL('image/jpeg', 0.82);
    }
    let guiaHecha = false, guiaPromesa = null;
    function guardarGuia() {
        if (guiaHecha) return guiaPromesa;
        guiaHecha = true;
        guiaPromesa = (async () => {
            const bloques = [];
            try { bloques.push({ t: 'imagenes', items: [{ src: await imagenGuia(), titulo: N.guia_img || d.titulo, pie: N.guia_pie || '' }] }); }
            catch { /* sin imagen */ }
            if (N.cuadro) bloques.push({ t: 'tabla', cab: N.cuadro, filas: casos.filter(cs => cs.fila).map(cs => [cs.corto || cs.titulo].concat(cs.fila)) });
            bloques.push(poe
                ? { t: 'tabla', cab: ['Escena', 'Qué pasa', 'Para recordar'], filas: casos.map(cs => {
                    const pr = cs.pasos.find(p => p.tipo === 'predice');
                    return [cs.titulo, pr ? pr.ops[pr.ok] : '', cs.exp || ''];
                }) }
                : { t: 'tabla', cab: ['Caso', 'Pregunta', 'Para recordar'], filas: casos.map(cs => {
                    const el = cs.pasos.filter(p => p.tipo === 'elegir');
                    return [cs.corto || cs.titulo, el.map(p => p.p + ' → ' + p.ops[p.ok]).join(' '), cs.exp || ''];
                }) });
            const rep = porRepasar();
            if (rep.length) bloques.push({ t: 'texto', txt: '↺ Por repasar: ' + rep.join(', ') + '.' });
            sumarAGuia(clave, { titulo: d.titulo, subtitulo: N.subtitulo || '', slug: d.slug,
                nota: `${est.err} ${est.err === 1 ? 'error' : 'errores'}`, bloques: bloques.concat(conexionGuia(tplCx)) });
        })();
        return guiaPromesa;
    }

    function actualizar() {
        const total = casos.reduce((a, cs) => a + cs.pasos.length, 0);
        const hechos = casos.reduce((a, cs) => a + Math.min(ec(cs).paso, cs.pasos.length), 0);
        contador.textContent = hechos + ' / ' + total;
        errores.textContent = est.err ? `${est.err} ${est.err === 1 ? 'error' : 'errores'}` : '';
        if (!actual()) {
            markDone(clave);
            if (!d.siguiente) markDone(d.slug);
            guardarGuia();
        }
    }

    function pintar() { pintarVista(); pintarPasos(); pintarPanel(); actualizar(); }

    raiz.querySelector('#nl-esc-reset')?.addEventListener('click', () => {
        if (Object.keys(est.c).length && !confirm('Esto borra todas tus respuestas de este nivel. ¿Seguro?')) return;
        est = { c: {}, err: 0, nombres: est.nombres };
        guardar();
        ver = casos[0]; verCierre = false; marca = null;
        pintar();
    });

    pintar();
}

if (RAIZ) iniciar(RAIZ);
