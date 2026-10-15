<?php
/**
 * NeuroLab — _partials/footer.php
 * Pie común: «Equipo» (foto y usuario de GitHub) a la izquierda y «Contacto» (correo e Instagram)
 * a la derecha; «Experiencia digital» sobre el copyright.
 * $nl_base: prefijo de rutas para páginas en subcarpetas (ej. admin/ usa '../').
 */
$nl_base = $nl_base ?? '';
// [nombre, rol, usuario de GitHub (foto y perfil)]
$nl_equipo = [
    ['Fernanda López-Moncada', 'Docente · diseño y contenidos', 'FernandandreaTM'],
    ['Kaira Santos', 'Ayudante · estudiante de Psicología', 'kamarisss'],
    ['Marcelo Rojas', 'Ayudante · estudiante de Enfermería', 'mikaelroxas-glitch'],
];
?>
<footer class="nl-pie">
  <div class="nl-pie__equipo">
    <div class="nl-pie__cols">
      <div>
        <p class="nl-pie__tit">Equipo</p>
        <ul class="nl-pie__personas">
          <?php foreach ($nl_equipo as $p): ?>
            <li>
              <img src="https://github.com/<?= rawurlencode($p[2]) ?>.png?size=80" alt="" loading="lazy" width="40" height="40">
              <span><strong><?= htmlspecialchars($p[0]) ?></strong><?= htmlspecialchars($p[1]) ?>
                <a href="https://github.com/<?= rawurlencode($p[2]) ?>" target="_blank" rel="noopener">@<?= htmlspecialchars($p[2]) ?></a></span>
            </li>
          <?php endforeach; ?>
        </ul>
      </div>
      <div class="nl-pie__contacto">
        <p class="nl-pie__tit">Contacto</p>
        <strong>Escríbenos</strong>
        <a href="mailto:fernanda.lopez@uach.cl">fernanda.lopez@uach.cl</a>
        <strong>Instagram</strong>
        <a href="https://www.instagram.com/tecmedhub" target="_blank" rel="noopener">TecMedHUB</a>
        <a href="https://www.instagram.com/tecmeduachpm/" target="_blank" rel="noopener">Tecnología Médica UACh PM</a>
      </div>
    </div>
    <p class="nl-pie__exp">Experiencia digital · TecMedHUB, Universidad Austral de Chile, Sede Puerto Montt</p>
    <p class="nl-pie__copy">© <?= date('Y') ?> NeuroLab · Escuela de Tecnología Médica · Láminas: <a href="https://histologyguide.com" target="_blank" rel="noopener">histologyguide.com</a></p>
  </div>
</footer>
