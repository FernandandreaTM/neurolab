<?php
error_reporting(0);
$active_page = 'home';

// Stats directamente desde la BD
$stat_actividades = 0; $stat_topics = 0; $stat_quices = 0; $root_topics = []; $act_por_unidad = [];
$db_path = __DIR__ . '/data/neurolab.db';
if (file_exists($db_path)) {
    $sdb = new SQLite3($db_path, SQLITE3_OPEN_READONLY);
    $stat_actividades = (int)$sdb->querySingle("SELECT COUNT(*) FROM actividades WHERE activo=1");
    $stat_topics      = (int)$sdb->querySingle("SELECT COUNT(*) FROM topics WHERE parent_id IS NULL");
    $stat_quices      = (int)$sdb->querySingle("SELECT COUNT(*) FROM quices WHERE activo=1");
    $res = $sdb->query("SELECT id, slug, nombre, icono, tipo FROM topics WHERE parent_id IS NULL ORDER BY orden");
    while ($row = $res->fetchArray(SQLITE3_ASSOC)) $root_topics[] = $row;
    // Actividades por unidad (incluye las de sus subtemas)
    $res = $sdb->query("SELECT COALESCE(t.parent_id, t.id) AS raiz, COUNT(*) AS n FROM actividades a JOIN topics t ON t.id = a.topic_id WHERE a.activo = 1 GROUP BY raiz");
    while ($row = $res->fetchArray(SQLITE3_ASSOC)) $act_por_unidad[(int)$row['raiz']] = (int)$row['n'];
    $sdb->close();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NeuroLab — Plataforma de Actividades del Sistema Nervioso</title>
<meta name="description" content="Plataforma de actividades para Neurobiología y Fisiología de Sistemas. Láminas virtuales, simuladores PhET, identificación de partes y quices con retroalimentación inmediata.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="icon" href="img/favicon.ico" sizes="any">
<link rel="icon" href="img/favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
<link rel="stylesheet" href="css/base.css">
<style>
/* --- Layout específico de la landing --- */
.nl-practicos { padding: 3rem 16px 1rem; }
.nl-practicos__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 1.2rem; }
.nl-practico-card {
    display: flex; flex-direction: column; align-items: flex-start; gap: .45rem; padding: 1.2rem 1.3rem;
    border-radius: 16px; text-decoration: none; color: var(--gray-100, #EDE9FE);
    background: linear-gradient(135deg, rgba(139,92,246,.22), rgba(236,72,153,.12)); border: 1px solid rgba(167,139,250,.45);
    transition: transform .2s ease, border-color .2s ease;
}
.nl-practico-card:hover { transform: translateY(-3px); border-color: #FCD34D; color: inherit; }
.nl-practico-card strong { font-size: 1.2rem; color: #fff; }
.nl-practico-card__asig { font-size: .78rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #FCD34D; }
.nl-practico-card__obj { font-size: .9rem; line-height: 1.5; }
.nl-practico-card__pasos { font-size: .82rem; color: var(--gray-300); }
.nl-practico-card .btn { margin-top: .4rem; }
.nl-hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    overflow: clip;
    padding-top: 2rem;
    position: relative;
}
.nl-hero__bg {
    position: absolute; inset: 0;
    background: url('img/hero.png') center right/contain no-repeat;
    opacity: .14;
    z-index: 0;
}
.nl-hero__bg-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to right, var(--navy) 45%, transparent 100%);
    z-index: 0;
}
.nl-hero__grid-lines {
    position: absolute; inset: 0;
    background-image:
        linear-gradient(rgba(139,92,246,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139,92,246,.04) 1px, transparent 1px);
    background-size: 60px 60px;
    z-index: 0;
}
.nl-hero__top {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1.5rem;
    align-items: start;
    margin-bottom: 2.5rem;
}
.nl-hero__top-left { max-width: 640px; }
.nl-hero__logo-uach {
    width: 110px; height: auto; display: block;
    margin-bottom: 1.25rem;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,.4));
}
.nl-hero__inner {
    position: relative;
    z-index: 1;
    max-width: 720px;
}
.nl-hero__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    padding: .35rem .9rem;
    border-radius: 100px;
    border: 1px solid rgba(139,92,246,.4);
    background: rgba(139,92,246,.1);
    font-size: .75rem;
    font-weight: 700;
    color: var(--violet-light);
    letter-spacing: .06em;
    text-transform: uppercase;
    margin-bottom: 1.25rem;
    animation: fadeUp .6s ease both;
}
.nl-hero__title {
    margin-bottom: 1.25rem;
    animation: fadeUp .6s .1s ease both;
}
.nl-hero__title .highlight {
    color: var(--violet);
    position: relative;
    display: inline-block;
}
.nl-hero__title .highlight::after {
    content: '';
    position: absolute;
    bottom: 4px; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--violet), var(--pink));
    border-radius: 2px;
    opacity: .6;
}
.nl-hero__ctas { position: relative; z-index: 1; display: flex; flex-wrap: wrap; gap: .8rem; margin: 1.6rem 0 0; }
.nl-hero__desc {
    font-size: 1.1rem;
    color: var(--gray-300);
    margin-bottom: 2rem;
    max-width: 540px;
    animation: fadeUp .6s .2s ease both;
}
.nl-hero__stats {
    display: flex;
    gap: 2rem;
    margin-top: 2.5rem;
    padding-top: 2rem;
    border-top: 1px solid var(--gray-700);
    animation: fadeUp .6s .4s ease both;
}
.nl-hero__stat-num { font-size: 1.75rem; font-weight: 800; color: var(--white); display: block; }
.nl-hero__stat-label { font-size: .78rem; color: var(--gray-500); font-weight: 600; }

/* 2 rectángulos interactuables lado derecho del título */
.nl-hero__discipline-row {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    animation: fadeUp .6s .25s ease both;
}
.nl-disc {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem 1.5rem;
    background: var(--navy-mid);
    border: 1.5px solid var(--gray-700);
    border-radius: var(--radius);
    text-decoration: none;
    color: var(--white);
    transition: border-color var(--t-base), transform var(--t-base), background var(--t-base);
    min-width: 220px;
}
.nl-disc:hover {
    border-color: var(--violet);
    background: rgba(139,92,246,.08);
    transform: translateY(-3px);
}
.nl-disc__icon { font-size: 1.6rem; margin-bottom: .4rem; }
.nl-disc__name { font-size: 1rem; font-weight: 700; }
.nl-disc__meta { font-size: .75rem; color: var(--gray-500); margin-top: .2rem; }

/* --- Sección "qué encontrarás" --- */
.nl-features { padding: 5rem 0; border-top: 1px solid var(--gray-700); }
.nl-features__header { text-align: center; margin-bottom: 3rem; }
.nl-features__header p { max-width: 480px; margin: .75rem auto 0; }
.nl-features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
}
.nl-feature {
    padding: 1.5rem;
    background: var(--navy-mid);
    border: 1px solid var(--gray-700);
    border-radius: var(--radius-lg);
    transition: border-color var(--t-base), transform var(--t-base);
    text-align: left;
}
/* Tarjetas descriptivas: no son enlaces (sin efecto al pasar el mouse) */
.nl-feature__icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
    margin-bottom: 1rem;
}
.nl-feature__title { font-size: 1rem; font-weight: 700; color: var(--white); margin-bottom: .4rem; }
.nl-feature__desc { font-size: .82rem; color: var(--gray-500); line-height: 1.5; }

/* --- Unidades temáticas (enlaces) + admin --- */
.nl-unidades { padding-top: 3.5rem; }
.nl-unidades__sub { color: var(--gray-300); margin-top: .4rem; }
.nl-bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding: 2rem 0 4rem;
    gap: 1.5rem;
    flex-wrap: wrap;
}
.nl-modules-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    flex: 1;
    max-width: 800px;
}
.nl-module-mini {
    display: flex;
    align-items: center;
    gap: .9rem;
    padding: 1rem 1.1rem;
    background: var(--navy-mid);
    border: 1px solid var(--gray-700);
    border-radius: var(--radius);
    text-decoration: none;
    transition: border-color var(--t-fast), background var(--t-fast);
}
.nl-module-mini:hover {
    border-color: rgba(139,92,246,.35);
    background: rgba(139,92,246,.05);
}
.nl-module-mini__icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: rgba(139,92,246,.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
}
.nl-module-mini__name { font-size: .875rem; font-weight: 700; color: var(--white); }
.nl-module-mini__cat { font-size: .7rem; color: var(--gray-500); }

.nl-admin-box {
    width: 130px; height: 130px;
    background: var(--navy-mid);
    border: 1.5px dashed var(--gray-700);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: .35rem;
    text-decoration: none;
    color: var(--gray-500);
    transition: border-color var(--t-base), color var(--t-base), background var(--t-base);
    flex-shrink: 0;
}
.nl-admin-box:hover {
    border-color: var(--violet);
    color: var(--violet);
    background: rgba(139,92,246,.05);
}
.nl-admin-box__icon { font-size: 1.6rem; }
.nl-admin-box__label { font-size: .75rem; font-weight: 700; }

/* --- Recursos TecMedHub --- */
.nl-recursos { padding: 6rem 0 4rem; border-top: 1px solid var(--gray-700); }
.nl-recursos h2 { text-align: center; margin-bottom: .5rem; }
.nl-recursos .lead { text-align: center; max-width: 480px; margin: 0 auto 2.5rem; }
.nl-recursos-logos {
    display: flex; align-items: center; justify-content: center;
    flex-wrap: wrap; gap: 2rem;
}
.nl-recurso-logo {
    display: flex; align-items: center; justify-content: center;
    width: 96px; height: 96px;
    background: #fff;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 50%;
    overflow: hidden;
    transition: border-color var(--t-base), transform var(--t-base);
    text-decoration: none;
    flex-shrink: 0;
    padding: 8px;
}
.nl-recurso { display: flex; flex-direction: column; align-items: center; gap: .45rem; text-decoration: none; }
.nl-recurso__nom { font-size: .8rem; font-weight: 700; color: var(--gray-300); }
.nl-recurso:hover .nl-recurso__nom { color: var(--violet-light); }
.nl-recurso:hover .nl-recurso-logo {
    border-color: var(--violet);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,.3);
}
.nl-recurso-logo img {
    width: 100%; height: 100%; padding: 2px;
    object-fit: contain; display: block;
    transition: transform var(--t-fast);
}
.nl-recurso-logo:hover img { transform: scale(1.05); }

@media (max-width: 900px) {
    .nl-features-grid { grid-template-columns: 1fr; }
    .nl-hero__top { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
    .nl-hero__eyebrow { white-space: normal; max-width: 100%; }
    .nl-hero__inner, .nl-hero__top, .nl-hero__top-left { min-width: 0; max-width: 100%; }
    .nl-modules-row { flex: 1 1 100%; min-width: 0; grid-template-columns: 1fr; }
}
</style>
</head>
<body>
<?php include '_partials/nav.php'; ?>
<div class="bg-mesh"></div>


<!-- ─── HERO ─────────────────────────────────────────── -->
<section class="nl-hero">
  <div class="nl-hero__bg"></div>
  <div class="nl-hero__bg-overlay"></div>
  <div class="nl-hero__grid-lines"></div>
  <div class="container">
    <div class="nl-hero__inner">

      <!-- Título -->
      <div class="nl-hero__top">
        <div class="nl-hero__top-left">
          <h1 class="nl-hero__title">
            NeuroLab<br>
            <span class="highlight">aprende haciendo</span>
          </h1>
        </div>
      </div>

      <!-- Descripción -->
      <p class="nl-hero__desc">
        Plataforma de actividades para <strong>Neurobiología</strong> (Terapia Ocupacional) y
        <strong>Fisiología de Sistemas</strong> (Fonoaudiología). Láminas virtuales, simuladores
        interactivos, identificación de partes y quices con retroalimentación inmediata — todo
        pensado para que el estudio del sistema nervioso sea una experiencia activa.
      </p>

      <div class="nl-hero__ctas">
        <a href="#practicos" class="btn btn-primary">🧪 Empezar un práctico</a>
        <a href="atlas.php" class="btn btn-ghost">🔬 Explorar actividades</a>
      </div>

      <div class="nl-hero__stats">
        <div>
          <span class="nl-hero__stat-num" id="stat-actividades"><?= $stat_actividades ?></span>
          <span class="nl-hero__stat-label">actividades</span>
        </div>
        <div>
          <span class="nl-hero__stat-num" id="stat-topics"><?= $stat_topics ?></span>
          <span class="nl-hero__stat-label">unidades</span>
        </div>
        <div>
          <span class="nl-hero__stat-num" id="stat-quices"><?= $stat_quices ?></span>
          <span class="nl-hero__stat-label">quices</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ─── PRÁCTICOS ───────────────────────────────────── -->
<section class="container nl-practicos" id="practicos">
  <span class="label">Prácticos autoguiados</span>
  <h2 class="mt-1">Avanza a tu ritmo y arma tu guía de estudio</h2>
  <div class="nl-practicos__grid">
    <?php foreach ($nl_rutas_nav as $k => $r): ?>
    <a class="nl-practico-card" href="practico.php?p=<?= rawurlencode($k) ?>">
      <span class="nl-practico-card__asig"><?= htmlspecialchars(preg_replace('/\s*·.*$/', '', $r['asignatura'])) ?></span>
      <strong><?= htmlspecialchars($r['titulo']) ?></strong>
      <span class="nl-practico-card__obj"><?= htmlspecialchars($r['objetivo']) ?></span>
      <span class="nl-practico-card__pasos"><?= implode(' · ', array_map(function ($p) { return htmlspecialchars(preg_replace('/\s*\([^)]*\)$/', '', $p['titulo'])); }, $r['pasos'])) ?></span>
      <span class="btn btn-primary btn-sm">Ir al práctico →</span>
    </a>
    <?php endforeach; ?>
  </div>
</section>

<!-- ─── QUÉ ENCONTRARÁS ──────────────────────────────── -->
<section class="nl-features">
  <div class="container">
    <div class="nl-features__header reveal">
      <span class="label">¿Qué encontrarás?</span>
      <h2 class="mt-1">Cinco tipos de actividades, una sola plataforma</h2>
      <p>Cada actividad está diseñada para reforzar un objetivo de aprendizaje específico del programa.</p>
    </div>
    <div class="nl-features-grid stagger">
      <div class="nl-feature reveal">
        <div class="nl-feature__icon" style="background:rgba(139,92,246,.15)">🔬</div>
        <div class="nl-feature__title">Láminas virtuales</div>
        <div class="nl-feature__desc">Observa tejidos reales teñidos con técnicas histológicas, identifica estructuras y responde preguntas en contexto.</div>
      </div>
      <div class="nl-feature reveal">
        <div class="nl-feature__icon" style="background:rgba(236,72,153,.15)">⚡</div>
        <div class="nl-feature__title">Simuladores PhET</div>
        <div class="nl-feature__desc">Experimenta con canales iónicos y potenciales de acción en simulaciones interactivas de la Universidad de Colorado.</div>
      </div>
      <div class="nl-feature reveal">
        <div class="nl-feature__icon" style="background:rgba(109,40,217,.18)">🔄</div>
        <div class="nl-feature__title">Comparadores</div>
        <div class="nl-feature__desc">Cuadros lado a lado para distinguir tipos de neuronas, vías, neurotransmisores y más.</div>
      </div>
      <div class="nl-feature reveal">
        <div class="nl-feature__icon" style="background:rgba(139,92,246,.15)">🏷️</div>
        <div class="nl-feature__title">Identificación de partes</div>
        <div class="nl-feature__desc">Haz clic en cada estructura señalada y selecciona el nombre correcto. Retroalimentación inmediata.</div>
      </div>
      <div class="nl-feature reveal">
        <div class="nl-feature__icon" style="background:rgba(236,72,153,.15)">✏️</div>
        <div class="nl-feature__title">Quices con feedback</div>
        <div class="nl-feature__desc">20 preguntas de selección múltiple por actividad, con explicación de cada respuesta en el momento.</div>
      </div>
      <div class="nl-feature reveal">
        <div class="nl-feature__icon" style="background:rgba(109,40,217,.18)">🎯</div>
        <div class="nl-feature__title">Énfasis por carrera</div>
        <div class="nl-feature__desc">Cada actividad tiene una descripción para Fonoaudiología y otra para Terapia Ocupacional, con énfasis en lo relevante para cada una.</div>
      </div>
    </div>
  </div>
</section>

<!-- ─── MÓDULOS + ADMIN BOX ────────────────────────── -->
<section class="container nl-unidades">
  <span class="label">Unidades temáticas</span>
  <h2 class="mt-1">Explora por unidad</h2>
  <p class="nl-unidades__sub">Entra a una unidad para ver su mapa conceptual y todas sus actividades.</p>
  <div class="nl-bottom-row">
    <div class="nl-modules-row stagger">
      <?php foreach($root_topics as $t): ?>
      <a href="tema.php?slug=<?= urlencode($t['slug']) ?>" class="nl-module-mini reveal">
        <div class="nl-module-mini__icon"><?= htmlspecialchars($t['icono']) ?></div>
        <div>
          <div class="nl-module-mini__name"><?= htmlspecialchars($t['nombre']) ?></div>
          <div class="nl-module-mini__cat"><?= (int)($act_por_unidad[(int)$t['id']] ?? 0) ?> actividades</div>
        </div>
      </a>
      <?php endforeach; ?>
      <?php if (empty($root_topics)): ?>
        <p class="text-muted">Ejecuta las migraciones y el seed para ver los módulos.</p>
      <?php endif; ?>
    </div>
    <a href="admin/index.php" class="nl-admin-box" title="Panel de administración">
      <div class="nl-admin-box__icon">⚙️</div>
      <div class="nl-admin-box__label">Admin</div>
    </a>
  </div>
</section>

<!-- ─── RECURSOS HERMANOS ──────────────────────────── -->
<section class="nl-recursos">
  <div class="container">
    <h2 class="reveal">Visita nuestros otros recursos educativos</h2>
    <p class="lead reveal">Explora las plataformas de TecMedHUB desarrolladas para la enseñanza en ciencias de la salud.</p>
    <div class="nl-recursos-logos stagger">
      <?php foreach ([
          ['TMeduca', 'https://tmeduca.org/', 'tmeduca.png'],
          ['DigitalDuck', 'https://tmeduca.org/ferlopezmoncada/DigitalDuck/', 'digitalduck.png'],
          ['GenLAB', 'https://tmeduca.org/ferlopezmoncada/genlab/', 'genlab.png'],
          ['CellView', 'https://tmeduca.org/ferlopezmoncada/cellview', 'cellview.png'],
          ['LABIM3D', 'https://tmeduca.org/ferlopezmoncada/labim3d', 'labim3d.png'],
          ['LABIMATHS', 'https://tmeduca.org/ferlopezmoncada/labimaths', 'labimaths.png'],
      ] as $r): ?>
      <a href="<?= $r[1] ?>" target="_blank" rel="noopener" class="nl-recurso reveal" title="<?= $r[0] ?>">
        <span class="nl-recurso-logo"><img src="img/recursos/<?= $r[2] ?>" alt=""></span>
        <span class="nl-recurso__nom"><?= $r[0] ?></span>
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<?php include '_partials/footer.php'; ?>

<script>
(function(){
  const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();
</script>
</body>
</html>
