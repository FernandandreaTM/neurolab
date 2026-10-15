<?php
/**
 * NeuroLab — _partials/footer.php
 * Pie común: «Contacto» con columnas (equipo con foto · Instagram · Repositorio GitHub) y, sobre el
 * copyright, «Experiencia digital».
 * $nl_base: prefijo de rutas para páginas en subcarpetas (ej. admin/ usa '../').
 */
$nl_base = $nl_base ?? '';
// [nombre, rol, usuario de GitHub (foto y repositorio), correo (opcional)]
$nl_equipo = [
    ['Fernanda López-Moncada', 'Docente · diseño y contenidos', 'FernandandreaTM', 'fernanda.lopez@uach.cl'],
    ['Kaira Santos', 'Ayudante · estudiante de Psicología', 'kamarisss', ''],
    ['Marcelo Rojas', 'Ayudante · estudiante de Enfermería', 'mikaelroxas-glitch', ''],
];
?>
<footer class="nl-pie">
  <div class="nl-pie__equipo">
    <p class="nl-pie__tit">Contacto</p>
    <ul>
      <?php foreach ($nl_equipo as $p): ?>
        <li>
          <img src="https://github.com/<?= rawurlencode($p[2]) ?>.png?size=80" alt="" loading="lazy" width="40" height="40">
          <span><strong><?= htmlspecialchars($p[0]) ?></strong><?= htmlspecialchars($p[1]) ?>
            <?php if ($p[3] !== ''): ?><a href="mailto:<?= htmlspecialchars($p[3]) ?>"><?= htmlspecialchars($p[3]) ?></a><?php endif; ?>
          </span>
        </li>
      <?php endforeach; ?>
      <li class="nl-pie__contacto">
        <span><strong>Instagram</strong>
          <a href="https://www.instagram.com/tecmedhub" target="_blank" rel="noopener">TecMedHUB</a>
          <a href="https://www.instagram.com/tecmeduachpm/" target="_blank" rel="noopener">Tecnología Médica UACh PM</a></span>
      </li>
      <li class="nl-pie__contacto">
        <span><strong>Repositorio GitHub</strong>
          <?php foreach ($nl_equipo as $p): ?>
            <a href="https://github.com/<?= rawurlencode($p[2]) ?>" target="_blank" rel="noopener">@<?= htmlspecialchars($p[2]) ?></a>
          <?php endforeach; ?></span>
      </li>
    </ul>
    <p class="nl-pie__exp">Experiencia digital · TecMedHUB, Universidad Austral de Chile, Sede Puerto Montt</p>
    <p class="nl-pie__copy">© <?= date('Y') ?> NeuroLab · Escuela de Tecnología Médica · Láminas: <a href="https://histologyguide.com" target="_blank" rel="noopener">histologyguide.com</a></p>
  </div>
</footer>
