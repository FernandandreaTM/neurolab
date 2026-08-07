<?php
// $active_page: 'home' | 'atlas' | 'actividad'
$active_page = $active_page ?? 'home';
?>
<nav class="nav" id="nav">
  <div class="container">
    <div class="nav__inner">
      <a href="index.php" class="nav__logo">
        <img src="img/logo.svg" alt="NeuroLab" style="height:40px;width:auto;display:block;">
        <img src="img/logo-uach.png" alt="Universidad Austral de Chile" style="height:36px;width:auto;display:block;margin-left:.6rem;opacity:.85;">
      </a>
      <ul class="nav__links" id="nav-links">
        <li><a href="index.php" <?= $active_page==='home'  ? 'class="active"' : '' ?>>Inicio</a></li>
        <li><a href="atlas.php" <?= $active_page==='atlas' ? 'class="active"' : '' ?>>Atlas</a></li>
        <li><a href="admin/index.php">⚙️ Admin</a></li>
      </ul>
      <div class="nav__actions">
        <div class="nav__progress">
          <span class="nav__progress-dot"></span>
          <span id="progress-text">0 completados</span>
        </div>
        <?php if ($active_page !== 'atlas'): ?>
        <a href="atlas.php" class="btn btn-primary btn-sm">Explorar Atlas →</a>
        <?php endif; ?>
      </div>
      <button class="nav__toggle" id="nav-toggle" aria-label="Menú">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>
<script>
window.addEventListener('scroll', () =>
    document.getElementById('nav').classList.toggle('scrolled', scrollY > 20)
);
document.getElementById('nav-toggle').addEventListener('click', () =>
    document.getElementById('nav-links').classList.toggle('open')
);
// Progreso localStorage (key 'nl_progress' para no chocar con cellview)
(function(){
    const p = JSON.parse(localStorage.getItem('nl_progress') || '{}');
    const n = Object.values(p).filter(Boolean).length;
    document.getElementById('progress-text').textContent = n + ' completado' + (n !== 1 ? 's' : '');
})();
</script>
