<?php
/**
 * NeuroLab — guia.php
 * "Mi guía de estudio": reúne las secciones que el estudiante completó en cada actividad
 * (js/guia.js). Con ?p=<ruta> muestra sólo las secciones de data/practicos.php, en su orden,
 * y sólo lo de la carrera activa. El PDF se genera con la impresión del navegador.
 */
error_reporting(0);
require_once __DIR__ . '/_partials/rutas.php';
require_once __DIR__ . '/_partials/barra.php';

$clave = isset($_GET['p']) ? preg_replace('/[^a-z0-9-]/', '', (string)$_GET['p']) : '';
if ($clave === '') {
    $rutas = require __DIR__ . '/data/practicos.php';
    $clave = (string)array_key_first($rutas);
}
$ruta  = $clave !== '' ? nl_cargar_ruta($clave) : null;
$secciones = $ruta ? nl_secciones_ruta($ruta) : [];
$titulo = $ruta ? $ruta['titulo'] : 'NeuroLab';
$asig = $ruta ? preg_replace('/\s*·.*$/', '', $ruta['asignatura']) : '';
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Guía de estudio — <?= htmlspecialchars($titulo) ?></title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="css/base.css?v=<?= nl_v('css/base.css') ?>">
<link rel="stylesheet" href="css/guia.css?v=<?= nl_v('css/guia.css') ?>">
</head>
<body class="nl-guia-body">
<div class="bg-mesh"></div>
<?php nl_barra(['volver' => $ruta ? ['practico.php?p=' . rawurlencode($clave), '← Ruta'] : ['index.php', '← Inicio'], 'titulo' => 'Mi guía de estudio']); ?>

<main class="nl-guia-pag">
    <div class="nl-guia-herr">
        <label class="nl-guia-herr__grupo">
            <span>Integrantes del grupo</span>
            <input type="text" id="nl-guia-integrantes" placeholder="Nombres de quienes trabajaron en esta guía" autocomplete="off">
        </label>
        <div class="nl-guia-herr__acc">
            <span id="nl-guia-progreso"></span>
            <button type="button" class="btn btn-primary btn-sm" id="nl-guia-pdf">⬇ Descargar PDF</button>
        </div>
        <p class="nl-guia-herr__ayuda">Se incluye sólo lo de tu carrera (<strong id="nl-guia-car"></strong>). En la ventana de impresión elige <strong>«Guardar como PDF»</strong>.</p>
        <p class="nl-guia-herr__error" id="nl-guia-error" hidden>Tu navegador no tiene espacio para guardar más en la guía. Borra la guía y vuelve a completar los niveles, o usa otro navegador.</p>
    </div>

    <article class="nl-guia-doc">
        <header class="nl-gd-banner">
            <div class="nl-gd-banner__marca">
                <img src="img/logo.svg" alt="" class="nl-gd-banner__nl">
                <div><strong>NeuroLab</strong><span>Guía de estudio</span></div>
            </div>
            <div class="nl-gd-banner__logos">
                <img src="img/uach-escudo.png" alt="Universidad Austral de Chile">
                <img src="img/tecmedhub-logo.jpg" alt="TecMedHUB">
            </div>
        </header>

        <div class="nl-gd-meta">
            <h1><?= htmlspecialchars($titulo) ?></h1>
            <p class="nl-gd-meta__asig"><?= htmlspecialchars($asig) ?> · <span id="nl-guia-car2"></span></p>
            <?php if ($ruta): ?><p><strong>Objetivo:</strong> <?= htmlspecialchars($ruta['objetivo']) ?></p><?php endif; ?>
            <dl class="nl-gd-meta__datos">
                <div><dt>Integrantes</dt><dd id="nl-guia-integrantes-print">—</dd></div>
                <div><dt>Fecha</dt><dd id="nl-guia-fecha"></dd></div>
            </dl>
        </div>

        <div id="nl-guia-secciones"></div>
        <footer class="nl-gd-pie">NeuroLab · TecMedHUB · Universidad Austral de Chile, Sede Puerto Montt</footer>
    </article>

    <p class="nl-guia-borrar"><button type="button" class="btn btn-ghost btn-sm" id="nl-guia-borrar">Borrar mi guía</button></p>
</main>

<script type="module">
import { leerGuia, guardarMeta, borrarGuia, limpiarGuia, seccionDe, renderSeccion, hidratarImagenes, esc } from './js/guia.js';
import { carrera, CARRERAS } from './js/carrera.js';

const RUTA = <?= json_encode($secciones, JSON_UNESCAPED_UNICODE) ?>;
const CLAVE = <?= json_encode($clave) ?>;
const cont = document.getElementById('nl-guia-secciones');
const inp = document.getElementById('nl-guia-integrantes');
const inpPrint = document.getElementById('nl-guia-integrantes-print');
const btnPdf = document.getElementById('nl-guia-pdf');
let listas = Promise.resolve();

const sinParentesis = t => String(t).replace(/\s*\([^)]*\)\s*$/, '');
const ponerIntegrantes = v => { inpPrint.textContent = v || '—'; };

function pintar() {
    const g = leerGuia();
    const car = carrera();
    document.getElementById('nl-guia-car').textContent = CARRERAS[car];
    document.getElementById('nl-guia-car2').textContent = CARRERAS[car];
    if (document.activeElement !== inp) inp.value = g.meta.integrantes || '';
    ponerIntegrantes(inp.value.trim());
    document.getElementById('nl-guia-fecha').textContent = new Date().toLocaleDateString('es-CL');

    // Agrupa por actividad (paso de la ruta)
    const pasos = [];
    RUTA.forEach(s => {
        let p = pasos.find(x => x.paso === s.paso);
        if (!p) pasos.push(p = { paso: s.paso, titulo: sinParentesis(s.paso_titulo), slug: s.slug, secs: [] });
        p.secs.push(s);
    });
    let html = '', hechas = 0, total = 0;
    const faltan = [];
    pasos.forEach(p => {
        let cuerpo = '';
        p.secs.forEach(s => {
            if (!s.activo) return;
            total++;
            const sec = seccionDe(g, s.clave, car);
            if (!sec) { faltan.push({ s, p }); return; }
            hechas++;
            cuerpo += renderSeccion(sec, p.secs.length > 1 ? s.nombre : '', car);
        });
        if (cuerpo) html += `<section class="nl-g-act"><h2><span>${pasos.indexOf(p) + 1}</span>${esc(p.titulo)}</h2>${cuerpo}</section>`;
    });
    if (faltan.length) {
        html += `<div class="nl-g-faltan"><p>Te falta completar:</p><ul>${faltan.map(({ s, p }) =>
            `<li><a href="actividad.php?slug=${encodeURIComponent(s.slug)}&ruta=${encodeURIComponent(CLAVE)}">${esc(p.titulo)}${p.secs.length > 1 ? ' · ' + esc(s.nombre) : ''}</a></li>`).join('')}</ul></div>`;
    }
    cont.innerHTML = hechas ? html : '<p class="nl-g-vacia">Tu guía está vacía. Cada nivel que completes se agrega solo.</p>' + html;
    document.getElementById('nl-guia-progreso').textContent = `${hechas} / ${total} secciones`;
    btnPdf.disabled = hechas === 0;
    listas = hidratarImagenes(cont);
}

inp.addEventListener('input', () => ponerIntegrantes(inp.value.trim()));
inp.addEventListener('change', () => guardarMeta({ integrantes: inp.value.trim() }));
btnPdf.addEventListener('click', async () => {
    guardarMeta({ integrantes: inp.value.trim() });
    ponerIntegrantes(inp.value.trim());
    btnPdf.disabled = true;
    await listas;
    btnPdf.disabled = false;
    window.print();
});
document.getElementById('nl-guia-borrar').addEventListener('click', () => {
    if (confirm('Esto borra todas las secciones de tu guía (no borra tu avance en las actividades). ¿Seguro?')) { borrarGuia(); pintar(); }
});
document.addEventListener('nl:carrera', pintar);
document.addEventListener('nl:guia-error', () => { document.getElementById('nl-guia-error').hidden = false; });

pintar();
limpiarGuia(RUTA.map(s => s.clave)).then(pintar);
</script>
</body>
</html>
