<?php
/**
 * NeuroLab — practico.php
 * Ruta guiada de un práctico presencial: pasos en orden, tiempos y modo
 * (en NeuroLab / con la docente). Las rutas están en data/practicos.php.
 * URL: practico.php?p=celulas-1
 */
error_reporting(0);
require_once __DIR__ . '/api/db.php';

$rutas = require __DIR__ . '/data/practicos.php';
$clave = isset($_GET['p']) ? (string)$_GET['p'] : '';
$ruta  = isset($rutas[$clave]) ? $rutas[$clave] : null;

// Títulos de las actividades enlazadas (si la BD no responde, se usa el título del paso)
$titulos = [];
if ($ruta) {
    try {
        $st = get_db()->prepare("SELECT titulo FROM actividades WHERE slug = ? AND activo = 1");
        foreach ($ruta['pasos'] as $p) {
            if (!empty($p['slug']) && !isset($titulos[$p['slug']])) {
                $st->execute([$p['slug']]);
                $t = $st->fetchColumn();
                $titulos[$p['slug']] = $t === false ? null : $t;
            }
        }
    } catch (Throwable $e) { $titulos = []; }
}

function nl_v($rel) {
    $f = __DIR__ . '/' . $rel;
    return is_file($f) ? filemtime($f) : '1';
}
$total = 0;
if ($ruta) foreach ($ruta['pasos'] as $p) $total += (int)$p['min'];
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
        <div class="nl-ruta__meta">
            <span>⏱ <?= $total ?> min</span>
            <span class="nl-ruta__leyenda nl-ruta__leyenda--solo">En NeuroLab</span>
            <span class="nl-ruta__leyenda nl-ruta__leyenda--docente">Con la docente</span>
            <span class="nl-ruta__avance" id="nl-ruta-avance" aria-live="polite"></span>
        </div>
    </header>

    <ol class="nl-ruta__pasos">
    <?php foreach ($ruta['pasos'] as $i => $p):
        $solo = $p['modo'] === 'solo' && !empty($p['slug']);
        $href = $solo ? 'actividad.php?slug=' . rawurlencode($p['slug']) . '&ruta=' . rawurlencode($clave) : '';
        $actTitulo = $solo && !empty($titulos[$p['slug']]) ? $titulos[$p['slug']] : '';
    ?>
        <li class="nl-paso nl-paso--<?= $solo ? 'solo' : 'docente' ?>"<?= $solo ? ' data-slug="' . htmlspecialchars($p['slug']) . '"' : '' ?>>
            <div class="nl-paso__num"><?= $i + 1 ?></div>
            <div class="nl-paso__cuerpo">
                <div class="nl-paso__top">
                    <h2><?= htmlspecialchars($p['titulo']) ?></h2>
                    <span class="nl-paso__min"><?= (int)$p['min'] ?> min</span>
                </div>
                <p class="nl-paso__modo"><?= $solo ? '💻 En NeuroLab' : '👩‍🏫 Con la docente' ?><?= $actTitulo ? ' · ' . htmlspecialchars($actTitulo) : '' ?></p>
                <p class="nl-paso__tarea"><?= htmlspecialchars($p['tarea']) ?></p>
                <?php if ($solo): ?>
                    <a class="btn btn-primary btn-sm nl-paso__ir" href="<?= htmlspecialchars($href) ?>">Ir a la actividad →</a>
                    <span class="nl-paso__hecho" hidden>✓ Completada</span>
                <?php endif; ?>
            </div>
        </li>
    <?php endforeach; ?>
    </ol>
<?php endif; ?>
</main>

<?php include '_partials/footer.php'; ?>
<script type="module">
import { isDone } from './js/progress.js';
const pasos = [...document.querySelectorAll('.nl-paso--solo')];
const slugs = [...new Set(pasos.map(p => p.dataset.slug))];
pasos.forEach(p => {
    if (isDone(p.dataset.slug)) {
        p.classList.add('is-hecho');
        p.querySelector('.nl-paso__hecho').hidden = false;
    }
});
const av = document.getElementById('nl-ruta-avance');
if (av && slugs.length) av.textContent = `${slugs.filter(isDone).length} / ${slugs.length} actividades completadas`;
</script>
</body>
</html>
