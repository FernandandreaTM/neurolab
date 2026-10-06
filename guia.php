<?php
/**
 * NeuroLab — guia.php
 * "Mi guía de estudio": reúne las secciones que el estudiante sumó al completar
 * cada actividad (se guardan en su navegador, js/guia.js). Con ?p=<ruta> las
 * ordena según el práctico y muestra las que faltan por desbloquear.
 * El PDF se genera con la impresión del navegador ("Guardar como PDF").
 */
error_reporting(0);
require_once __DIR__ . '/_partials/rutas.php';

$clave = isset($_GET['p']) ? preg_replace('/[^a-z0-9-]/', '', (string)$_GET['p']) : '';
$ruta  = $clave !== '' ? nl_cargar_ruta($clave) : null;
$secciones = $ruta ? nl_secciones_ruta($ruta) : [];
$titulo = $ruta ? $ruta['titulo'] : 'NeuroLab';
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
<body>
<div class="bg-mesh"></div>

<main class="container nl-guia-pag">
    <nav class="nl-guia-pag__nav">
        <?php if ($ruta): ?>
            <a href="practico.php?p=<?= rawurlencode($clave) ?>">← Volver a la ruta del práctico</a>
        <?php else: ?>
            <a href="atlas.php">← Volver al atlas</a>
        <?php endif; ?>
    </nav>

    <article class="nl-guia-doc">
        <header class="nl-guia-doc__head">
            <p class="nl-guia-doc__kicker">NeuroLab · Guía de estudio<?= $ruta ? ' · ' . htmlspecialchars($ruta['asignatura']) : '' ?></p>
            <h1><?= htmlspecialchars($titulo) ?></h1>
            <?php if ($ruta): ?><p class="nl-guia-doc__obj"><strong>Objetivo:</strong> <?= htmlspecialchars($ruta['objetivo']) ?></p><?php endif; ?>
            <label class="nl-guia-doc__grupo">
                <span>Integrantes del grupo</span>
                <input type="text" id="nl-guia-integrantes" placeholder="Nombres de quienes trabajaron en esta guía" autocomplete="off">
            </label>
            <p class="nl-guia-doc__grupo-print" id="nl-guia-integrantes-print"></p>
            <p class="nl-guia-doc__fecha" id="nl-guia-fecha"></p>
        </header>

        <div class="nl-guia-acciones">
            <span id="nl-guia-progreso"></span>
            <button type="button" class="btn btn-primary btn-sm" id="nl-guia-pdf">⬇ Descargar PDF</button>
        </div>
        <p class="nl-guia-ayuda">En la ventana que se abre, elige <strong>«Guardar como PDF»</strong> como destino.</p>

        <div id="nl-guia-secciones"></div>
    </article>

    <p class="nl-guia-borrar"><button type="button" class="btn btn-ghost btn-sm" id="nl-guia-borrar">Borrar mi guía</button></p>
</main>

<?php include '_partials/footer.php'; ?>
<script type="module">
import { leerGuia, guardarMeta, borrarGuia, renderSeccion, esc } from './js/guia.js?v=<?= nl_v('js/guia.js') ?>';

const RUTA = <?= json_encode($secciones, JSON_UNESCAPED_UNICODE) ?>;
const CLAVE = <?= json_encode($clave) ?>;
const cont = document.getElementById('nl-guia-secciones');
const inp = document.getElementById('nl-guia-integrantes');
const inpPrint = document.getElementById('nl-guia-integrantes-print');

function pintar() {
    const g = leerGuia();
    inp.value = g.meta.integrantes || '';
    inpPrint.textContent = g.meta.integrantes ? 'Integrantes: ' + g.meta.integrantes : '';
    document.getElementById('nl-guia-fecha').textContent = 'Fecha: ' + new Date().toLocaleDateString('es-CL');

    let html = '', n = 0, hechas = 0;
    const enRuta = new Set(RUTA.map(s => s.clave));
    const activas = RUTA.filter(s => s.activo);
    RUTA.forEach(s => {
        const sec = g.secciones[s.clave];
        if (sec) { n++; hechas++; html += renderSeccion(sec, n); }
        else if (s.activo) {
            html += `<section class="nl-g-sec nl-g-sec--bloq">
                <h2>🔒 ${esc(s.nombre)}</h2>
                <p>Completa <a href="actividad.php?slug=${encodeURIComponent(s.slug)}&ruta=${encodeURIComponent(CLAVE)}">${esc(s.paso_titulo)}</a> y súmala a tu guía para desbloquear esta sección.</p>
            </section>`;
        }
    });
    // Secciones guardadas que no son de esta ruta (u otras rutas): al final
    Object.keys(g.secciones).filter(k => !enRuta.has(k))
        .sort((a, b) => (g.secciones[a].fecha || 0) - (g.secciones[b].fecha || 0))
        .forEach(k => { n++; html += renderSeccion(g.secciones[k], n); });

    cont.innerHTML = html || '<p class="nl-g-vacia">Tu guía está vacía. Completa una actividad y presiona «Sumar a mi guía».</p>';
    document.getElementById('nl-guia-progreso').textContent = RUTA.length
        ? `${hechas} / ${activas.length} secciones desbloqueadas`
        : `${n} ${n === 1 ? 'sección' : 'secciones'}`;
    document.getElementById('nl-guia-pdf').disabled = n === 0;
}

inp.addEventListener('input', () => {
    const v = inp.value.trim();
    inpPrint.textContent = v ? 'Integrantes: ' + v : '';
});
inp.addEventListener('change', () => guardarMeta({ integrantes: inp.value.trim() }));
window.addEventListener('beforeprint', () => {
    const v = inp.value.trim();
    inpPrint.textContent = v ? 'Integrantes: ' + v : '';
});
document.getElementById('nl-guia-pdf').addEventListener('click', () => {
    guardarMeta({ integrantes: inp.value.trim() });
    pintar();
    window.print();
});
document.getElementById('nl-guia-borrar').addEventListener('click', () => {
    if (confirm('Esto borra todas las secciones de tu guía (no borra tu avance en las actividades). ¿Seguro?')) { borrarGuia(); pintar(); }
});
pintar();
</script>
</body>
</html>
