<?php
/**
 * NeuroLab — _partials/footer.php
 * Pie común: otros recursos educativos, contacto y equipo (con sus perfiles de GitHub).
 */
$nl_equipo = [
    ['Fernanda López-Moncada', 'Docente · diseño y contenidos', 'FernandandreaTM'],
    ['Kaira Santos', 'Ayudante · estudiante de Psicología', 'kamarisss'],
    ['Marcelo Rojas', 'Ayudante · estudiante de Enfermería', 'mikaelroxas-glitch'],
];
$nl_recursos = [
    ['CellView', 'https://tmeduca.org/ferlopezmoncada/cellview', 'Biología celular'],
    ['LABIM3D', 'https://tmeduca.org/ferlopezmoncada/labim3d', 'Modelos 3D'],
    ['LABIMATHS', 'https://tmeduca.org/ferlopezmoncada/labimaths', 'Matemáticas para salud'],
];
?>
<footer class="nl-pie">
  <div class="nl-pie__in">
    <div class="nl-pie__col nl-pie__marca">
      <p class="nl-pie__tit">NeuroLab</p>
      <p>Actividades autoguiadas de neurobiología. Universidad Austral de Chile, Sede Puerto Montt.</p>
      <div class="nl-pie__logos">
        <img src="img/uach-blanco.png" alt="Universidad Austral de Chile">
        <img src="img/tecmedhub-logo.jpg" alt="TecMedHUB" class="nl-pie__logo-tmh">
      </div>
    </div>
    <div class="nl-pie__col">
      <p class="nl-pie__tit">Otros recursos educativos</p>
      <ul>
        <?php foreach ($nl_recursos as $r): ?>
          <li><a href="<?= htmlspecialchars($r[1]) ?>" target="_blank" rel="noopener"><?= htmlspecialchars($r[0]) ?></a> <span><?= htmlspecialchars($r[2]) ?></span></li>
        <?php endforeach; ?>
      </ul>
      <p class="nl-pie__fuentes">Láminas: <a href="https://histologyguide.com" target="_blank" rel="noopener">histologyguide.com</a></p>
    </div>
    <div class="nl-pie__col">
      <p class="nl-pie__tit">Contacto</p>
      <ul>
        <li><a href="https://www.instagram.com/tecmedhub" target="_blank" rel="noopener">Instagram TecMedHUB</a></li>
        <li><a href="https://www.instagram.com/tecmeduachpm/" target="_blank" rel="noopener">Instagram Tecnología Médica UACh PM</a></li>
        <li><a href="mailto:fernanda.lopez@uach.cl">fernanda.lopez@uach.cl</a></li>
      </ul>
    </div>
  </div>
  <div class="nl-pie__equipo">
    <p class="nl-pie__tit">Experiencia digital · TecMedHUB, Universidad Austral de Chile, Sede Puerto Montt</p>
    <ul>
      <?php foreach ($nl_equipo as $p): ?>
        <li>
          <img src="https://github.com/<?= rawurlencode($p[2]) ?>.png?size=80" alt="" loading="lazy" width="40" height="40">
          <span><strong><?= htmlspecialchars($p[0]) ?></strong><?= htmlspecialchars($p[1]) ?>
            <a href="https://github.com/<?= rawurlencode($p[2]) ?>" target="_blank" rel="noopener">@<?= htmlspecialchars($p[2]) ?></a></span>
        </li>
      <?php endforeach; ?>
    </ul>
    <p class="nl-pie__copy">© <?= date('Y') ?> NeuroLab · Escuela de Tecnología Médica</p>
  </div>
</footer>
