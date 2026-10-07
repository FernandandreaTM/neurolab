<?php
/**
 * NeuroLab — _partials/mesa.php
 * "Mesa de trabajo": la vista (imagen o lámina) ajustada al alto de la pantalla a la
 * izquierda y un panel fijo a la derecha donde se responde. Lo incluye actividad.php
 * para la identificación (labeling) y para actividades con lámina + tareas.
 * Usa las variables de actividad.php: $act, $ruta, $carreras, $recursos, $tareas,
 * $esLabeling, $partesLab, $imgLab, $nivelesLab, $requiereLab, $siguienteLab.
 */
$volver = $ruta !== ''
    ? ['practico.php?p=' . rawurlencode($ruta), '← Ruta del práctico']
    : ['atlas.php', '← Atlas'];

/** Instrucciones plegables: van arriba del panel, antes que todo. */
$instrucciones = function ($texto) use ($act) {
    ob_start(); ?>
    <details class="nl-mesa__instr" id="nl-mesa-instr">
        <summary>ⓘ Cómo se responde</summary>
        <?php if ($texto): ?><p><?= $texto ?></p><?php endif; ?>
    </details>
    <?php return ob_get_clean();
};

/** Conexión con la carrera: plantilla que el JS muestra (plegada) en el cierre y copia a la guía. */
$conexion = function () use ($carreras) {
    if (!$carreras) return '';
    ob_start(); ?>
    <template id="nl-conexion-tpl">
        <?php foreach ($carreras as $c): ?>
            <p data-carrera="<?= htmlspecialchars($c['carrera_nombre']) ?>"><strong><?= htmlspecialchars($c['carrera_nombre']) ?>:</strong> <?= htmlspecialchars($c['descripcion'] ?? '') ?></p>
        <?php endforeach; ?>
    </template>
    <?php return ob_get_clean();
};
?>
<header class="nl-mesa-head container">
    <a href="<?= htmlspecialchars($volver[0]) ?>" class="nl-act-back"><?= $volver[1] ?></a>
    <h1><?= htmlspecialchars($act['titulo']) ?></h1>
    <?php if ($esLabeling && $nivelesLab): ?>
    <nav class="nl-lab__niveles" aria-label="Niveles de la actividad">
        <?php foreach ($nivelesLab as $k => $nv):
            $partesT = explode('·', $nv['titulo'], 2);
            $etq = trim(end($partesT));
            $etq = preg_replace('/:.*/', '', $etq);   // "Nivel II: organelos…" -> "Nivel II"
        ?>
            <?php if ($nv['slug'] === $act['slug']): ?>
                <span class="nl-lab__nivel is-actual" aria-current="page"><?= htmlspecialchars($etq) ?></span>
            <?php elseif ((int)$nv['activo']): ?>
                <a class="nl-lab__nivel" title="<?= htmlspecialchars($nv['titulo']) ?>" href="actividad.php?slug=<?= rawurlencode($nv['slug']) ?><?= $ruta !== '' ? '&amp;ruta=' . rawurlencode($ruta) : '' ?>"><?= htmlspecialchars($etq) ?></a>
            <?php endif; ?>
        <?php endforeach; ?>
    </nav>
    <?php endif; ?>
</header>

<?php if ($esLabeling):
    $dim = @getimagesize(__DIR__ . '/../' . $imgLab);
    $ar  = $dim ? round($dim[0] / $dim[1], 4) : 1.5;
?>
<div class="nl-mesa container" id="nl-lab"
     data-slug="<?= htmlspecialchars($act['slug']) ?>"
     data-titulo="<?= htmlspecialchars($act['titulo']) ?>"
     data-requiere="<?= htmlspecialchars($requiereLab) ?>"
     data-siguiente="<?= htmlspecialchars($siguienteLab) ?>"
     data-partes="<?= htmlspecialchars(json_encode($partesLab, JSON_UNESCAPED_UNICODE), ENT_QUOTES) ?>"
     style="--ar: <?= $ar ?>">
    <div class="nl-lab__candado" hidden>
        <strong>🔒 Nivel bloqueado</strong>
        <p>Completa primero el nivel anterior para desbloquear este.</p>
    </div>
    <div class="nl-mesa__vista">
        <div class="nl-lab__canvas" id="nl-lab-canvas">
            <img src="<?= htmlspecialchars($imgLab) ?>?v=<?= @filemtime(__DIR__ . '/../' . $imgLab) ?: 1 ?>" alt="Ilustración de una neurona para identificar sus estructuras" class="nl-lab__img">
            <svg class="nl-lab__lineas" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
            <div class="nl-lab__capa" id="nl-lab-capa"></div>
        </div>
    </div>
    <aside class="nl-mesa__panel">
        <?= $instrucciones('Toca un número de la imagen (o un círculo de aquí abajo). Escribe de memoria el nombre de esa estructura y presiona Enter: verás la respuesta correcta. Luego elige su función entre las alternativas. <strong>Verde</strong>: nombre y función correctos. <strong>Ámbar</strong>: el nombre quedó por repasar.') ?>
        <div class="nl-lab__estado">
            <span class="nl-lab__contador" id="nl-lab-contador">0 / <?= count($partesLab) ?></span>
            <span class="nl-lab__errores" id="nl-lab-errores"></span>
            <button type="button" class="nl-lab__reset" id="nl-lab-reset">Empezar de nuevo</button>
        </div>
        <div class="nl-lab__chips" id="nl-lab-chips" aria-label="Estructuras"></div>
        <?= $conexion() ?>
        <div class="nl-lab__trabajo" id="nl-lab-feedback" role="status" aria-live="polite"></div>
    </aside>
</div>

<?php else:
    // Lámina + tareas: la primera lámina (iframe) a la izquierda; guía y trabajo en el panel
    $vista = null; $textos = [];
    foreach ($recursos as $r) {
        if (!$vista && $r['tipo'] === 'iframe_url') $vista = $r;
        elseif ($r['tipo'] === 'texto_html') $textos[] = $r;
    }
?>
<div class="nl-mesa nl-mesa--lamina container">
    <div class="nl-mesa__vista">
        <?php if ($vista): ?>
            <iframe src="<?= htmlspecialchars($vista['url']) ?>" class="nl-mesa__iframe" allowfullscreen title="<?= htmlspecialchars($vista['caption'] ?: 'Lámina virtual') ?>"></iframe>
            <?php if (!empty($vista['caption'])): ?><p class="nl-mesa__caption"><?= htmlspecialchars($vista['caption']) ?></p><?php endif; ?>
        <?php endif; ?>
    </div>
    <aside class="nl-mesa__panel">
        <?= $conexion() ?>
        <?= $instrucciones('Lee «Cómo buscarlas», explora la lámina con el zoom y luego, en «Tu trabajo», pega tus capturas y responde las preguntas. Cada pregunta se corrige al instante.') ?>
        <div class="nl-mesa__tabs" role="tablist">
            <?php foreach ($textos as $i => $t): ?>
                <button type="button" role="tab" class="nl-mesa__tab<?= $i === 0 ? ' active' : '' ?>" data-tab="t<?= $i ?>"><?= htmlspecialchars($t['caption'] ?: 'Guía') ?></button>
            <?php endforeach; ?>
            <button type="button" role="tab" class="nl-mesa__tab<?= $textos ? '' : ' active' ?>" data-tab="trabajo">✏️ Tu trabajo</button>
        </div>
        <?php foreach ($textos as $i => $t): ?>
            <div class="nl-mesa__pane nl-act-html" data-pane="t<?= $i ?>"<?= $i === 0 ? '' : ' hidden' ?>>
                <?= $t['url'] ?>
                <button type="button" class="btn btn-primary btn-sm nl-mesa__ir" data-ir="trabajo">Ir a tu trabajo →</button>
            </div>
        <?php endforeach; ?>
        <div class="nl-mesa__pane" data-pane="trabajo"<?= $textos ? ' hidden' : '' ?>>
            <section class="nl-tar" id="nl-tar"
                     data-slug="<?= htmlspecialchars($act['slug']) ?>"
                     data-titulo="<?= htmlspecialchars($act['titulo']) ?>"
                     data-config="<?= htmlspecialchars(json_encode($tareas, JSON_UNESCAPED_UNICODE), ENT_QUOTES) ?>">
                <?php if (!empty($tareas['intro'])): ?><p class="nl-tar__intro"><?= htmlspecialchars($tareas['intro']) ?></p><?php endif; ?>
                <div class="nl-tar__cuerpo"></div>
            </section>
        </div>
    </aside>
</div>
<?php endif; ?>
