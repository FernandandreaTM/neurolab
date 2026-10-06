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

/** Bloque plegable con instrucciones, descripción y énfasis por carrera. */
$info = function ($instrucciones) use ($act, $carreras) {
    ob_start(); ?>
    <details class="nl-mesa__info">
        <summary>ⓘ Instrucciones y énfasis por carrera</summary>
        <?php if ($instrucciones): ?><p><?= $instrucciones ?></p><?php endif; ?>
        <p><?= nl2br(htmlspecialchars($act['descripcion'] ?? '')) ?></p>
        <?php foreach ($carreras as $c): ?>
            <p class="nl-mesa__carrera"><strong><?= htmlspecialchars($c['carrera_nombre']) ?>:</strong> <?= htmlspecialchars($c['descripcion'] ?? '') ?></p>
        <?php endforeach; ?>
    </details>
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
            <img src="<?= htmlspecialchars($imgLab) ?>" alt="Ilustración de una neurona para identificar sus estructuras" class="nl-lab__img">
            <svg class="nl-lab__lineas" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
            <div class="nl-lab__capa" id="nl-lab-capa"></div>
        </div>
    </div>
    <aside class="nl-mesa__panel">
        <div class="nl-lab__estado">
            <span class="nl-lab__contador" id="nl-lab-contador">0 / <?= count($partesLab) ?></span>
            <span class="nl-lab__errores" id="nl-lab-errores"></span>
            <button type="button" class="nl-lab__reset" id="nl-lab-reset">Empezar de nuevo</button>
        </div>
        <div class="nl-lab__chips" id="nl-lab-chips" aria-label="Estructuras"></div>
        <div class="nl-lab__fin" id="nl-lab-fin" hidden>
            <div class="nl-lab__resumen" id="nl-lab-resumen"></div>
            <div id="nl-lab-guia"></div>
            <a class="btn btn-primary btn-sm nl-lab__sig-nivel" id="nl-lab-sig" hidden>🔍 Acercarse más: siguiente nivel →</a>
        </div>
        <div class="nl-lab__trabajo" id="nl-lab-feedback" role="status" aria-live="polite"></div>
        <?= $info('Toca un número de la imagen. Escribe de memoria el nombre de esa estructura, compáralo con la respuesta correcta y elige su función. Verde: nombre y función correctos. Ámbar: el nombre quedó por repasar.') ?>
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
        <?= $info('') ?>
    </aside>
</div>
<?php endif; ?>
