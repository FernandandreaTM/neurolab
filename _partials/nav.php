<?php
/**
 * NeuroLab — _partials/nav.php
 * Navegación del sitio (inicio, atlas, temas), al estilo de DigitalDuck: logos a la izquierda,
 * enlaces, menú «Prácticos» con las rutas de data/practicos.php y «Mi guía». En celular, menú plegable.
 * Las páginas de trabajo (actividad, ruta, guía) usan _partials/barra.php.
 * $active_page: 'home' | 'atlas' | 'tema'
 */
$active_page = $active_page ?? 'home';
$nl_rutas_nav = @include __DIR__ . '/../data/practicos.php';
if (!is_array($nl_rutas_nav)) $nl_rutas_nav = [];
$nl_ruta1 = (string)array_key_first($nl_rutas_nav);
?>
<header class="nl-nav" id="nl-nav">
  <div class="nl-nav__in">
    <a href="index.php" class="nl-nav__logos" title="NeuroLab — inicio">
      <img src="img/logo.svg" alt="" class="nl-nav__logo-nl">
      <span class="nl-nav__marca">NeuroLab</span>
      <img src="img/uach-blanco.png" alt="Universidad Austral de Chile" class="nl-nav__logo-uach">
    </a>
    <button type="button" class="nl-nav__toggle" id="nl-nav-toggle" aria-label="Menú" aria-expanded="false" aria-controls="nl-nav-menu">
      <span></span><span></span><span></span>
    </button>
    <nav class="nl-nav__menu" id="nl-nav-menu" aria-label="Principal">
      <a href="index.php" class="nl-nav__link<?= $active_page === 'home' ? ' is-activo' : '' ?>">Inicio</a>
      <a href="atlas.php" class="nl-nav__link<?= $active_page === 'atlas' ? ' is-activo' : '' ?>">Atlas</a>
      <div class="nl-nav__drop">
        <button type="button" class="nl-nav__pill" id="nl-nav-prac" aria-haspopup="true" aria-expanded="false">🧪 Prácticos <span class="nl-nav__caret">▾</span></button>
        <div class="nl-nav__drop-menu" id="nl-nav-prac-menu">
          <?php foreach ($nl_rutas_nav as $k => $r): ?>
            <a href="practico.php?p=<?= rawurlencode($k) ?>">
              <strong><?= htmlspecialchars($r['titulo']) ?></strong>
              <span><?= htmlspecialchars(preg_replace('/\s*·.*$/', '', $r['asignatura'])) ?> · <?= count($r['pasos']) ?> actividades</span>
            </a>
          <?php endforeach; ?>
        </div>
      </div>
      <?php if ($nl_ruta1 !== ''): ?>
      <a href="guia.php?p=<?= rawurlencode($nl_ruta1) ?>" class="nl-nav__pill nl-nav__pill--guia">📘 Mi guía</a>
      <?php endif; ?>
      <a href="admin/index.php" class="nl-nav__admin" title="Panel de administración" aria-label="Panel de administración">🔒</a>
    </nav>
  </div>
</header>
<script>
(function () {
  var t = document.getElementById('nl-nav-toggle'), m = document.getElementById('nl-nav-menu');
  var p = document.getElementById('nl-nav-prac'), d = document.getElementById('nl-nav-prac-menu');
  t.addEventListener('click', function () { var a = m.classList.toggle('is-abierto'); t.setAttribute('aria-expanded', a); });
  p.addEventListener('click', function (e) { e.stopPropagation(); var a = d.classList.toggle('is-abierto'); p.setAttribute('aria-expanded', a); });
  document.addEventListener('click', function (e) { if (!d.contains(e.target)) { d.classList.remove('is-abierto'); p.setAttribute('aria-expanded', false); } });
})();
</script>
