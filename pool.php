<?php
/**
 * NeuroLab — pool.php
 * Pool de actividades: todas las actividades por tema, con su estado de revisión
 * (y agrupadas por familia si la tienen). Desde aquí se arma un práctico: se eligen actividades, se ve la vista previa
 * (practico.php?armar=…) y se copia el bloque para data/practicos.php.
 * En modo docente se cambia el estado y se dejan notas (api/estado.php -> data/revision.json).
 */
error_reporting(0);
require_once __DIR__ . '/api/db.php';
require_once __DIR__ . '/_partials/pool.php';
require_once __DIR__ . '/_partials/docente.php';
require_once __DIR__ . '/_partials/rutas.php';

$docente = nl_es_docente();
$temas = $familias = $acts = [];
try {
    $pdo = get_db();
    $temas = $pdo->query("SELECT id, slug, nombre, parent_id, icono, orden FROM topics ORDER BY COALESCE(parent_id, id), orden")->fetchAll();
    $acts = $pdo->query("SELECT slug, titulo, tipo, familia, enfoque, estado, objetivo, fuente, herramienta, notas, topic_id
                         FROM actividades WHERE activo = 1 ORDER BY id")->fetchAll();
} catch (Throwable $e) { /* BD sin poblar: la página lo indica */ }

$porId = [];
foreach ($temas as $t) $porId[(int)$t['id']] = $t;
/** Tema raíz de un topic. */
$raiz = function ($id) use ($porId) {
    $id = (int)$id;
    while ($id && isset($porId[$id]) && $porId[$id]['parent_id']) $id = (int)$porId[$id]['parent_id'];
    return $id;
};
$raices = array_values(array_filter($temas, function ($t) { return !$t['parent_id']; }));
usort($raices, function ($a, $b) { return (int)$a['orden'] - (int)$b['orden']; });

/** Actividades por tema raíz y, dentro, por familia ('' = sin familia). */
$porTema = [];
foreach ($acts as $a) $porTema[$raiz($a['topic_id'])][(string)$a['familia']][] = $a;
$conteo = array_fill_keys(array_keys(NL_ESTADOS), 0);
foreach ($acts as $a) if (isset($conteo[$a['estado']])) $conteo[$a['estado']]++;

$tipos = ['lamina' => 'Lámina', 'simulador' => 'Simulador', 'comparador' => 'Comparador', 'labeling' => 'Identificación',
          'quiz' => 'Quiz', 'practica' => 'Práctica', 'herramienta' => 'Herramienta', 'ficha' => 'Seminario'];
$active_page = 'pool';
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pool de actividades — NeuroLab</title>
<link rel="icon" href="img/favicon.ico" sizes="any">
<link rel="icon" href="img/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
<link rel="stylesheet" href="css/base.css?v=<?= nl_v('css/base.css') ?>">
<link rel="stylesheet" href="css/pool.css?v=<?= nl_v('css/pool.css') ?>">
</head>
<body>
<div class="bg-mesh"></div>
<?php include '_partials/nav.php'; ?>

<header class="nl-pool-head container">
    <span class="label">Pool de actividades</span>
    <h1 class="mt-2">Elige, revisa y arma prácticos</h1>
    <p>Marca las actividades que quieras y arma un práctico con vista previa. <?= $docente ? 'Estás en <strong>modo docente</strong>: puedes cambiar el estado y dejar notas.' : 'Para cambiar estados activa el <a href="docente.php">modo docente</a>.' ?></p>
    <div class="nl-pool-resumen">
        <?php foreach (NL_ESTADOS as $k => $e): ?>
            <button type="button" class="nl-pool-chip" data-f-estado="<?= $k ?>" aria-pressed="false"><?= nl_badge_estado($k) ?> <b><?= $conteo[$k] ?></b></button>
        <?php endforeach; ?>
    </div>
</header>

<section class="container nl-pool-filtros" aria-label="Filtros">
    <select id="f-tema" aria-label="Tema">
        <option value="">Todos los temas</option>
        <?php foreach ($raices as $t): ?><option value="<?= (int)$t['id'] ?>"><?= htmlspecialchars($t['icono'] . ' ' . $t['nombre']) ?></option><?php endforeach; ?>
    </select>
    <input type="search" id="f-texto" placeholder="Buscar actividad, objetivo o fuente…" aria-label="Buscar">
    <span class="text-muted text-sm" id="f-n"></span>
</section>

<main class="container nl-pool">
<?php if (!$acts): ?>
    <p class="text-muted">La base de datos está vacía: ejecuta admin/migrate.php y admin/seed.php.</p>
<?php endif; ?>
<?php foreach ($raices as $t):
    $fams = $porTema[(int)$t['id']] ?? [];
    if (!$fams) continue; ?>
    <section class="nl-pool-tema" data-tema="<?= (int)$t['id'] ?>">
        <h2><?= htmlspecialchars($t['icono'] . ' ' . $t['nombre']) ?></h2>
        <?php foreach ($fams as $fam => $vars): ?>
        <article class="nl-fam" data-familia="<?= htmlspecialchars($fam) ?>">
            <?php if ($fam !== ''): ?>
            <header class="nl-fam__head"><h3><?= htmlspecialchars($fam) ?></h3></header>
            <?php endif; ?>
            <ul class="nl-fam__vars">
            <?php foreach ($vars as $a):
                $busca = mb_strtolower($a['titulo'] . ' ' . $a['fuente'] . ' ' . nl_herramienta($a['herramienta']) . ' ' . $fam . ' ' . $a['objetivo'], 'UTF-8'); ?>
                <li class="nl-var" id="<?= htmlspecialchars($a['slug']) ?>" data-slug="<?= htmlspecialchars($a['slug']) ?>"
                    data-titulo="<?= htmlspecialchars($a['titulo']) ?>" data-estado="<?= htmlspecialchars($a['estado']) ?>"
                    data-enfoque="<?= htmlspecialchars($a['enfoque']) ?>" data-busca="<?= htmlspecialchars($busca) ?>">
                    <label class="nl-var__check"><input type="checkbox" aria-label="Agregar al práctico"></label>
                    <div class="nl-var__cuerpo">
                        <a class="nl-var__tit" href="actividad.php?slug=<?= rawurlencode($a['slug']) ?>"><?= htmlspecialchars($a['titulo']) ?></a>
                        <div class="nl-var__etqs">
                            <span class="nl-var__tipo"><?= htmlspecialchars($tipos[$a['tipo']] ?? $a['tipo']) ?></span>
                            <?php if ($a['herramienta']): ?><span class="nl-var__herr" title="Herramienta propia propuesta">🧰 <?= htmlspecialchars(nl_herramienta($a['herramienta'])) ?></span><?php endif; ?>
                        </div>
                        <?php if ($a['fuente']): ?><p class="nl-var__fuente">📄 <?= htmlspecialchars($a['fuente']) ?></p><?php endif; ?>
                        <?php if ($docente): ?>
                        <details class="nl-var__rev"<?= $a['notas'] ? ' open' : '' ?>>
                            <summary>Nota de revisión</summary>
                            <textarea rows="2" placeholder="Qué falta, qué cambiar, quién lo revisó…"><?= htmlspecialchars((string)$a['notas']) ?></textarea>
                        </details>
                        <?php elseif ($a['notas']): ?>
                        <p class="nl-var__nota">📝 <?= htmlspecialchars($a['notas']) ?></p>
                        <?php endif; ?>
                    </div>
                    <div class="nl-var__estado">
                        <?php if ($docente): ?>
                            <select aria-label="Estado">
                                <?php foreach (NL_ESTADOS as $k => $e): ?>
                                    <option value="<?= $k ?>"<?= $a['estado'] === $k ? ' selected' : '' ?>><?= $e['icono'] . ' ' . $e['nombre'] ?></option>
                                <?php endforeach; ?>
                            </select>
                            <button type="button" class="btn btn-ghost btn-sm nl-var__guardar">Guardar</button>
                            <span class="nl-var__ok" aria-live="polite"></span>
                        <?php else: ?>
                            <?= nl_badge_estado($a['estado']) ?>
                        <?php endif; ?>
                    </div>
                </li>
            <?php endforeach; ?>
            </ul>
        </article>
        <?php endforeach; ?>
    </section>
<?php endforeach; ?>
</main>

<aside class="nl-armar" id="nl-armar" hidden>
    <div class="nl-armar__in container">
        <div class="nl-armar__top">
            <strong>🧪 Práctico en preparación · <span id="nl-armar-n">0</span> actividades</strong>
            <div class="nl-armar__btns">
                <a class="btn btn-primary btn-sm" id="nl-armar-ver" href="#" target="_blank" rel="noopener">Vista previa →</a>
                <button type="button" class="btn btn-ghost btn-sm" id="nl-armar-codigo">Bloque para data/practicos.php</button>
                <button type="button" class="btn btn-ghost btn-sm" id="nl-armar-limpiar">Vaciar</button>
            </div>
        </div>
        <ol class="nl-armar__lista" id="nl-armar-lista"></ol>
        <div class="nl-armar__code" id="nl-armar-code" hidden>
            <p class="text-sm">Pega este bloque dentro del <code>return [ … ]</code> de <code>data/practicos.php</code> y cambia la clave, el título y el objetivo.</p>
            <textarea readonly rows="12" id="nl-armar-txt"></textarea>
            <button type="button" class="btn btn-primary btn-sm" id="nl-armar-copiar">Copiar</button>
        </div>
    </div>
</aside>

<?php include '_partials/footer.php'; ?>
<script>
window.NL_GUIA = <?= json_encode(array_combine(array_column($acts, 'slug'), array_map(function ($a) { return nl_guia_por_defecto($a['slug']); }, $acts)) ?: new stdClass(), JSON_UNESCAPED_UNICODE) ?>;
</script>
<script type="module" src="js/pool.js?v=<?= nl_v('js/pool.js') ?>"></script>
</body>
</html>
