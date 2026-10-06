<?php
error_reporting(0);
$active_page = 'atlas';
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Atlas — NeuroLab</title>
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/atlas.css">
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
<style>
/* Layout mínimo del atlas (paleta morada) */
.nl-atlas-header { padding: 3rem 0 2rem; text-align: center; }
.nl-atlas-header h1 { margin-bottom: .5rem; }
.nl-atlas-header p { max-width: 540px; margin: 0 auto 1.5rem; }
.nl-atlas-tabs { display: flex; justify-content: center; gap: .5rem; margin-top: 1.5rem; flex-wrap: wrap; }
.nl-atlas-tab {
    padding: .5rem 1.1rem;
    border-radius: 100px;
    border: 1px solid var(--gray-700);
    background: transparent;
    color: var(--gray-300);
    font-size: .85rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color var(--t-fast), color var(--t-fast), background var(--t-fast);
}
.nl-atlas-tab:hover, .nl-atlas-tab.active {
    border-color: var(--violet);
    color: var(--violet);
    background: rgba(139,92,246,.08);
}

.nl-atlas-body { padding: 2rem 0 4rem; }
.nl-tree-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }
.nl-tree-panel {
    background: var(--navy-mid);
    border: 1px solid var(--gray-700);
    border-radius: var(--radius);
    padding: 1rem;
    max-height: 70vh;
    overflow-y: auto;
}
.nl-tree-panel h3 { font-size: .85rem; margin-bottom: 1rem; color: var(--gray-300); }

.nl-atlas-gridhead {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
}
.nl-atlas-gridhead h2 { margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--white); }

@media (max-width: 800px) { .nl-tree-layout { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="bg-mesh"></div>

<div class="nl-atlas-header">
  <div class="container">
    <span class="label">Atlas de Actividades</span>
    <h1 class="mt-2">Explora el sistema nervioso</h1>
    <p>Presiona el nombre de un tema o subtema para abrir su página, con el mapa conceptual, la descripción, los quices y el material del tema. El chevron de la derecha despliega los subtemas sin salir de aquí.</p>
    <div class="nl-atlas-tabs">
      <button class="nl-atlas-tab active" data-filtro="todos">Todos</button>
      <button class="nl-atlas-tab" data-filtro="estructura">🔬 Morfología</button>
      <button class="nl-atlas-tab" data-filtro="proceso">⚡ Función</button>
      <button class="nl-atlas-tab" data-filtro="sensitivo">📡 Sensitivo</button>
      <button class="nl-atlas-tab" data-filtro="motor">⚙️ Motor</button>
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
        <div class="nl-atlas-gridhead">
          <h2>Actividades</h2>
          <span class="text-muted text-sm" id="act-count"></span>
        </div>
        <div id="act-grid" class="nl-act-grid">
          <p class="text-muted">Cargando actividades…</p>
        </div>
      </section>
    </div>
  </div>
</div>

<?php include '_partials/footer.php'; ?>
<script type="module" src="js/atlas.js"></script>
</body>
</html>
