<?php
/**
 * NeuroLab — _partials/atlas-body.php
 * Cuerpo compartido por los atlas de área (morfologia.php y funcion.php).
 *
 * La página que lo incluye define $ATLAS antes del include:
 *
 *   $ATLAS = [
 *       'area'    => 'morfologia',      // identificador; también pinta el acento de color
 *       'nombre'  => 'Morfología',
 *       'icono'   => '🔬',
 *       'titulo'  => 'La estructura del sistema nervioso',
 *       'bajada'  => 'Texto de una o dos frases bajo el título.',
 *       'temas'   => null,              // null = todos los temas · o ['celulas-sn', 'neurona']
 *       'hermano' => ['url' => 'funcion.php', 'nombre' => 'Función', 'icono' => '⚡'],
 *   ];
 *
 * Para dejar un atlas con solo algunos temas, cambia 'temas' por la lista de
 * slugs que quieras mostrar. Los subtemas de cada uno se incluyen solos.
 */

$ATLAS = array_merge([
    'area'    => 'morfologia',
    'nombre'  => 'Atlas',
    'icono'   => '🧠',
    'titulo'  => 'Explora el sistema nervioso',
    'bajada'  => '',
    'temas'   => null,
    'hermano' => null,
], $ATLAS ?? []);

/* Filtros de la barra superior: por tipo de actividad */
$ATLAS_TABS = [
    'todos'      => 'Todos',
    'lamina'     => '🔬 Láminas',
    'simulador'  => '🎛️ Simuladores',
    'comparador' => '🔄 Comparadores',
    'labeling'   => '🏷️ Identificación',
    'quiz'       => '✏️ Quices',
];
?>

<div class="nl-atlas-header">
  <div class="container">
    <span class="nl-atlas-eyebrow"><?= $ATLAS['icono'] ?> Atlas de <?= htmlspecialchars($ATLAS['nombre']) ?></span>
    <h1 class="mt-2"><?= htmlspecialchars($ATLAS['titulo']) ?></h1>
    <?php if ($ATLAS['bajada']): ?>
      <p><?= htmlspecialchars($ATLAS['bajada']) ?></p>
    <?php endif; ?>

    <?php if ($ATLAS['hermano']): ?>
      <a href="<?= htmlspecialchars($ATLAS['hermano']['url']) ?>" class="nl-atlas-switch">
        <?= $ATLAS['hermano']['icono'] ?> Ir al atlas de <?= htmlspecialchars($ATLAS['hermano']['nombre']) ?> →
      </a>
    <?php endif; ?>

    <div class="nl-atlas-tabs">
      <?php foreach ($ATLAS_TABS as $slug => $label): ?>
        <button class="nl-atlas-tab<?= $slug === 'todos' ? ' active' : '' ?>" data-filtro="<?= $slug ?>"><?= $label ?></button>
      <?php endforeach; ?>
    </div>
  </div>
</div>

<div class="nl-atlas-body">
  <div class="container">
    <div class="nl-tree-layout">
      <aside class="nl-tree-panel">
        <div class="nl-tree-head">
          <h3>Temas</h3>
          <button type="button" id="tree-toggle-all" class="nl-tree-toggle-all" data-modo="expandir">Expandir todo</button>
        </div>
        <div id="topic-tree"><p class="text-muted text-sm">Cargando…</p></div>
      </aside>
      <section>
        <div id="mapa-conceptual"></div>
        <div id="act-grid" class="nl-act-grid">
          <p class="text-muted">Selecciona un tema para ver sus actividades.</p>
        </div>
      </section>
    </div>
  </div>
</div>

<script>
window.NL_ATLAS = <?= json_encode([
    'area'   => $ATLAS['area'],
    'nombre' => $ATLAS['nombre'],
    'temas'  => $ATLAS['temas'],
], JSON_UNESCAPED_UNICODE) ?>;
</script>
<script type="module" src="js/atlas.js"></script>
