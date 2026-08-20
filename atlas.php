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
<link rel="stylesheet" href="css/nav.css">
<link rel="stylesheet" href="css/atlas.css">
<link rel="stylesheet" href="css/mapa.css">
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
<style>
/* Layout mínimo del atlas (paleta morada) — Fase 1 lo reemplaza por atlas.css */
.nl-atlas-header { padding: 6rem 0 2rem; text-align: center; }
.nl-atlas-header h1 { margin-bottom: .5rem; }
.nl-atlas-header p { max-width: 540px; margin: 0 auto 1.5rem; }
.nl-atlas-tabs { display: flex; justify-content: center; gap: .5rem; margin-top: 1.5rem; }
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
.nl-tree-node {
    padding: .45rem .75rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: .875rem;
    color: var(--gray-300);
    display: flex;
    align-items: center;
    gap: .5rem;
    transition: background var(--t-fast), color var(--t-fast);
}
.nl-tree-node:hover { background: rgba(139,92,246,.1); color: var(--white); }
.nl-tree-node.active { background: rgba(139,92,246,.15); color: var(--violet-light); font-weight: 700; }
.nl-tree-children { padding-left: 1.2rem; margin-top: .25rem; }

.nl-act-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
.nl-act-card {
    background: var(--navy-mid);
    border: 1px solid var(--gray-700);
    border-radius: var(--radius);
    padding: 1.25rem;
    text-decoration: none;
    transition: border-color var(--t-base), transform var(--t-base);
}
.nl-act-card:hover {
    border-color: rgba(139,92,246,.35);
    transform: translateY(-3px);
}
.nl-act-card__tipo {
    display: inline-block;
    padding: .2rem .65rem;
    border-radius: 100px;
    font-size: .7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .04em;
    margin-bottom: .65rem;
}
.nl-act-card__tipo.lamina      { background: rgba(139,92,246,.15); color: var(--violet-light); }
.nl-act-card__tipo.simulador  { background: rgba(236,72,153,.18); color: #F472B6; }
.nl-act-card__tipo.comparador { background: rgba(109,40,217,.18); color: var(--violet-light); }
.nl-act-card__tipo.labeling   { background: rgba(139,92,246,.15); color: var(--violet-light); }
.nl-act-card__tipo.quiz       { background: rgba(236,72,153,.18); color: #F472B6; }
.nl-act-card__title { font-size: 1rem; font-weight: 700; color: var(--white); margin-bottom: .35rem; }
.nl-act-card__desc { font-size: .82rem; color: var(--gray-500); line-height: 1.5; }

@media (max-width: 800px) { .nl-tree-layout { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="bg-mesh"></div>
<?php include '_partials/nav.php'; ?>

<div class="nl-atlas-header">
  <div class="container">
    <span class="label">Atlas de Actividades</span>
    <h1 class="mt-2">Explora el sistema nervioso</h1>
    <p>Selecciona un tema y elige una actividad. Cada actividad tiene una descripción general y descripciones específicas para Fonoaudiología y Terapia Ocupacional.</p>
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
        <h3>Temas</h3>
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

<?php include '_partials/footer.php'; ?>
<script type="module" src="js/atlas.js"></script>
</body>
</html>
