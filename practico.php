<?php
/**
 * NeuroLab — practico.php
 * Ruta de un práctico: por dónde partir y en qué orden avanzar. Cada paso enlaza
 * una actividad y muestra qué secciones de "Mi guía" desbloquea.
 * Las rutas están en data/practicos.php.   URL: practico.php?p=celulas-1
 */
error_reporting(0);
require_once __DIR__ . '/_partials/rutas.php';
require_once __DIR__ . '/_partials/barra.php';

$clave = isset($_GET['p']) ? preg_replace('/[^a-z0-9-]/', '', (string)$_GET['p']) : '';
$ruta  = $clave !== '' ? nl_cargar_ruta($clave) : null;
$secciones = $ruta ? nl_secciones_ruta($ruta) : [];
$seccionesActivas = array_values(array_filter($secciones, function ($s) { return $s['activo']; }));
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= htmlspecialchars($ruta ? $ruta['titulo'] : 'Práctico') ?> — NeuroLab</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="css/base.css?v=<?= nl_v('css/base.css') ?>">
<link rel="stylesheet" href="css/practico.css?v=<?= nl_v('css/practico.css') ?>">
</head>
<body>
<div class="bg-mesh"></div>
<?php nl_barra(['volver' => ['index.php', '← Inicio'], 'guia' => $ruta ? 'guia.php?p=' . rawurlencode($clave) : '']); ?>

<main class="container nl-ruta">
<?php if (!$ruta): ?>
    <h1>Práctico no encontrado</h1>
    <p class="text-muted">Revisa el enlace o vuelve al <a href="atlas.php">atlas</a>.</p>
<?php else: ?>
    <header class="nl-ruta__head">
        <span class="badge badge-violet"><?= htmlspecialchars($ruta['asignatura']) ?></span>
        <h1><?= htmlspecialchars($ruta['titulo']) ?></h1>
        <p class="nl-ruta__obj"><strong>Objetivo:</strong> <?= htmlspecialchars($ruta['objetivo']) ?></p>
        <p class="nl-ruta__intro"><?= htmlspecialchars($ruta['intro']) ?></p>
    </header>

    <div class="nl-ruta__guia" id="nl-ruta-guia">
        <div class="nl-ruta__guia-txt">
            <strong>📘 Mi guía de estudio</strong>
            <span id="nl-ruta-guia-n">0 / <?= count($seccionesActivas) ?> secciones desbloqueadas</span>
            <div class="nl-ruta__barra"><div class="nl-ruta__barra-fill" id="nl-ruta-barra"></div></div>
        </div>
        <a class="btn btn-primary btn-sm" href="guia.php?p=<?= rawurlencode($clave) ?>">Ver y descargar mi guía →</a>
    </div>

    <ol class="nl-ruta__pasos">
    <?php foreach ($ruta['pasos'] as $i => $p):
        $href = 'actividad.php?slug=' . rawurlencode($p['slug']) . '&ruta=' . rawurlencode($clave);
        $guia = $p['guia'] ?? [];
    ?>
        <li class="nl-paso<?= $p['activo'] ? '' : ' is-pronto' ?>" data-slug="<?= htmlspecialchars($p['slug']) ?>">
            <div class="nl-paso__num"><?= $i + 1 ?></div>
            <div class="nl-paso__cuerpo">
                <div class="nl-paso__top">
                    <h2><?= htmlspecialchars($p['titulo']) ?></h2>
                    <span class="nl-paso__hecho" hidden>✓ Completada</span>
                </div>
                <p class="nl-paso__tarea"><?= htmlspecialchars($p['tarea']) ?></p>
                <?php if ($guia): ?>
                    <ul class="nl-paso__secciones" aria-label="Secciones de tu guía que desbloquea">
                        <?php foreach ($guia as $cl => $nom): ?>
                            <li class="nl-paso__sec" data-clave="<?= htmlspecialchars($cl) ?>"><span class="nl-paso__sec-ico">🔒</span> <?= htmlspecialchars($nom) ?></li>
                        <?php endforeach; ?>
                    </ul>
                <?php elseif ($p['activo']): ?>
                    <p class="nl-paso__nota">Actividad de observación: aún no suma una sección a tu guía.</p>
                <?php endif; ?>
                <?php if ($p['activo']): ?>
                    <a class="btn btn-primary btn-sm nl-paso__ir" href="<?= htmlspecialchars($href) ?>">Ir a la actividad →</a>
                <?php else: ?>
                    <span class="nl-paso__pronto">🔒 Próximamente</span>
                <?php endif; ?>
            </div>
        </li>
    <?php endforeach; ?>
        <li class="nl-paso nl-paso--final">
            <div class="nl-paso__num">★</div>
            <div class="nl-paso__cuerpo">
                <div class="nl-paso__top"><h2>Descarga tu guía de estudio</h2></div>
                <p class="nl-paso__tarea">Revisa tu guía, anota los integrantes del grupo y descárgala en PDF para estudiar.</p>
                <a class="btn btn-primary btn-sm" href="guia.php?p=<?= rawurlencode($clave) ?>">📘 Abrir mi guía</a>
            </div>
        </li>
    </ol>
<?php endif; ?>
</main>

<?php include '_partials/footer.php'; ?>
<script type="module">
import { isDone } from './js/progress.js?v=<?= nl_v('js/progress.js') ?>';
import { leerGuia, seccionDe } from './js/guia.js?v=<?= nl_v('js/guia.js') ?>';
const activas = <?= json_encode(array_column($seccionesActivas, 'clave')) ?>;
function pintar() {
    const g = leerGuia();
    document.querySelectorAll('.nl-paso[data-slug]').forEach(p => {
        const hecho = isDone(p.dataset.slug);
        p.classList.toggle('is-hecho', hecho);
        const h = p.querySelector('.nl-paso__hecho'); if (h) h.hidden = !hecho;
    });
    document.querySelectorAll('.nl-paso__sec').forEach(li => {
        const ok = !!seccionDe(g, li.dataset.clave);
        li.classList.toggle('is-ok', ok);
        li.querySelector('.nl-paso__sec-ico').textContent = ok ? '📘' : '🔒';
    });
    const n = activas.filter(c => seccionDe(g, c)).length;
    document.getElementById('nl-ruta-guia-n').textContent = `${n} / ${activas.length} secciones desbloqueadas`;
    document.getElementById('nl-ruta-barra').style.width = (activas.length ? n * 100 / activas.length : 0) + '%';
}
pintar();
window.addEventListener('pageshow', pintar);
document.addEventListener('nl:carrera', pintar);
</script>
</body>
</html>
