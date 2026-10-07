<?php
/**
 * NeuroLab — _partials/barra.php
 * Barra superior común (actividad, ruta del práctico, guía): logo, volver, título,
 * niveles, switch de carrera (TO por defecto ⇄ Fono) y enlace a la guía.
 * La carrera elegida la maneja js/carrera.js (localStorage nl_carrera).
 *
 * nl_barra([
 *   'volver'  => ['href', 'texto'],          // opcional
 *   'titulo'  => 'Texto del título',         // opcional
 *   'niveles' => [['etq','titulo','href','actual'], ...],  // opcional (2 o más)
 *   'guia'    => 'guia.php?p=…',             // opcional: enlace «Mi guía»
 * ]);
 */
function nl_barra(array $o) {
    $niveles = $o['niveles'] ?? [];
    ?>
    <script>try { document.documentElement.dataset.carrera = localStorage.getItem('nl_carrera') || 'terapia-ocupacional'; } catch (e) { document.documentElement.dataset.carrera = 'terapia-ocupacional'; }</script>
    <header class="nl-barra">
        <div class="nl-barra__in">
            <a class="nl-barra__logo" href="index.php" title="NeuroLab — inicio">
                <img src="img/logo.svg" alt="NeuroLab" class="nl-barra__logo-nl">
                <img src="img/logo-uach.png" alt="Universidad Austral de Chile" class="nl-barra__logo-uach">
            </a>
            <?php if (!empty($o['volver'])): ?>
                <a class="nl-barra__volver" href="<?= htmlspecialchars($o['volver'][0]) ?>"><?= htmlspecialchars($o['volver'][1]) ?></a>
            <?php endif; ?>
            <?php if (!empty($o['titulo'])): ?>
                <h1 class="nl-barra__tit"><?= htmlspecialchars($o['titulo']) ?></h1>
            <?php endif; ?>
            <?php if (count($niveles) > 1): ?>
            <nav class="nl-barra__niveles" aria-label="Niveles de la actividad">
                <?php foreach ($niveles as $nv): ?>
                    <?php if (!empty($nv['actual'])): ?>
                        <span class="nl-barra__nivel is-actual" aria-current="page" title="<?= htmlspecialchars($nv['titulo']) ?>"><?= htmlspecialchars($nv['etq']) ?></span>
                    <?php else: ?>
                        <a class="nl-barra__nivel" title="<?= htmlspecialchars($nv['titulo']) ?>" href="<?= htmlspecialchars($nv['href']) ?>"><?= htmlspecialchars($nv['etq']) ?></a>
                    <?php endif; ?>
                <?php endforeach; ?>
            </nav>
            <?php endif; ?>
            <div class="nl-barra__der">
                <div class="nl-carrera" role="radiogroup" aria-label="Tu carrera">
                    <button type="button" role="radio" class="nl-carrera__op" data-carrera-btn="terapia-ocupacional" title="Terapia Ocupacional">TO</button>
                    <button type="button" role="radio" class="nl-carrera__op" data-carrera-btn="fonoaudiologia" title="Fonoaudiología">Fono</button>
                </div>
                <?php if (!empty($o['guia'])): ?>
                    <a class="nl-barra__guia" href="<?= htmlspecialchars($o['guia']) ?>" title="Mi guía de estudio">📘<span> Mi guía</span></a>
                <?php endif; ?>
            </div>
        </div>
    </header>
    <script type="module" src="js/carrera.js?v=<?= @filemtime(__DIR__ . '/../js/carrera.js') ?: 1 ?>"></script>
    <?php
}
