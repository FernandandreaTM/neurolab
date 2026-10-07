<?php
/**
 * NeuroLab — _partials/mesa.php
 * "Mesa de trabajo": la vista (imagen o lámina) ajustada al alto de la pantalla a la
 * izquierda y un panel fijo a la derecha donde se responde. Lo incluye actividad.php
 * para la identificación (labeling) y para actividades con lámina + tareas.
 * Usa las variables de actividad.php: $act, $ruta, $carreras, $recursos, $tareas,
 * $esLabeling, $partesLab, $imgLab, $nivelesLab, $requiereLab, $siguienteLab,
 * $esTipos, $nivelTip, $nivelesNav, $siguienteTip (tipos de neurona).
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
    <?php $nivelH1 = $esTipos ? $nivelTip : ($lamPorNiveles ? $nivelLam : null); ?>
    <h1><?= htmlspecialchars($act['titulo']) ?><?= $nivelH1 ? ' · Nivel ' . $nivelH1['romano'] . ': ' . htmlspecialchars(mb_strtolower(mb_substr($nivelH1['titulo'], 0, 1, 'UTF-8'), 'UTF-8') . mb_substr($nivelH1['titulo'], 1, null, 'UTF-8')) : '' ?></h1>
    <?php if (count($nivelesNav) > 1): ?>
    <nav class="nl-lab__niveles" aria-label="Niveles de la actividad">
        <?php foreach ($nivelesNav as $nv): ?>
            <?php if ($nv['actual']): ?>
                <span class="nl-lab__nivel is-actual" aria-current="page"><?= htmlspecialchars($nv['etq']) ?></span>
            <?php else: ?>
                <a class="nl-lab__nivel" title="<?= htmlspecialchars($nv['titulo']) ?>" href="<?= htmlspecialchars($nv['href']) ?>"><?= htmlspecialchars($nv['etq']) ?></a>
            <?php endif; ?>
        <?php endforeach; ?>
    </nav>
    <?php endif; ?>
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
     data-clave="<?= htmlspecialchars($claveLab ?: $act['slug']) ?>"
     data-titulo="<?= htmlspecialchars($lamPorNiveles ? $act['titulo'] . ' — Nivel ' . $nivelLam['romano'] . ': ' . $nivelLam['titulo'] : $act['titulo']) ?>"
     data-requiere="<?= htmlspecialchars($requiereLab) ?>"
     data-siguiente="<?= htmlspecialchars($siguienteLab) ?>"
     data-siguiente-href="<?= htmlspecialchars($sigHrefLab) ?>"
     data-partes="<?= htmlspecialchars(json_encode($partesLab, JSON_UNESCAPED_UNICODE), ENT_QUOTES) ?>"
     style="--ar: <?= $ar ?>">
    <div class="nl-lab__candado" hidden>
        <strong>🔒 Nivel bloqueado</strong>
        <p>Completa primero el nivel anterior para desbloquear este.</p>
    </div>
    <div class="nl-mesa__vista">
        <div class="nl-lab__canvas" id="nl-lab-canvas">
            <img src="<?= htmlspecialchars($imgLab) ?>?v=<?= @filemtime(__DIR__ . '/../' . $imgLab) ?: 1 ?>" alt="<?= $lamPorNiveles ? 'Esquema de un corte sagital de cerebro de rata' : 'Ilustración de una neurona para identificar sus estructuras' ?>" class="nl-lab__img">
            <svg class="nl-lab__lineas" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
            <div class="nl-lab__capa" id="nl-lab-capa"></div>
        </div>
    </div>
    <aside class="nl-mesa__panel">
        <?= $instrucciones('Toca un número de la imagen (o un círculo de aquí abajo). Escribe de memoria el nombre de esa estructura y presiona Enter: verás la respuesta correcta. Luego elige su función entre las alternativas. <strong>Verde</strong>: nombre y función correctos. <strong style="color:#FFB4AE">Rojo</strong>: el nombre quedó por repasar. <strong style="color:#FCD34D">Naranjo</strong>: la estructura que estás respondiendo.') ?>
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

<?php elseif ($esTipos):
    // Tipos de neurona: nivel "armar" (lienzo + piezas) o "elegir" (frase + tarjetas y cuadro comparativo)
    $itemsTip = array_map(function ($it) {
        return ['id' => (int)$it['id'], 'e' => $it['enunciado'], 'fila' => $it['fila'] ?? ''];
    }, $nivelTip['items']);
    $tiposTip = ['Bipolar', 'Pseudounipolar', 'Multipolar'];   // columnas del cuadro, en orden
?>
<div class="nl-mesa nl-mesa--tipos container" id="nl-tip"
     data-slug="<?= htmlspecialchars($act['slug']) ?>"
     data-titulo="<?= htmlspecialchars($act['titulo']) ?>"
     data-nivel="<?= (int)$nivelTip['id'] ?>"
     data-numero="<?= (int)$nivelTip['numero'] ?>"
     data-romano="<?= htmlspecialchars($nivelTip['romano']) ?>"
     data-titulo-nivel="<?= htmlspecialchars($nivelTip['titulo']) ?>"
     data-tipo="<?= htmlspecialchars($nivelTip['tipo']) ?>"
     data-requiere="<?= htmlspecialchars($nivelTip['requiere']) ?>"
     data-siguiente="<?= htmlspecialchars($siguienteTip) ?>"
     data-items="<?= htmlspecialchars(json_encode($itemsTip, JSON_UNESCAPED_UNICODE), ENT_QUOTES) ?>"
     data-tipos="<?= htmlspecialchars(json_encode($tiposTip, JSON_UNESCAPED_UNICODE), ENT_QUOTES) ?>">
    <div class="nl-lab__candado" hidden>
        <strong>🔒 Nivel bloqueado</strong>
        <p>Completa primero el nivel anterior para desbloquear este.</p>
    </div>
    <div class="nl-mesa__vista">
        <div class="nl-tip__vista" id="nl-tip-vista"></div>
    </div>
    <aside class="nl-mesa__panel">
        <?= $instrucciones($nivelTip['instrucciones']) ?>
        <div class="nl-lab__estado">
            <span class="nl-lab__contador" id="nl-tip-contador">0 / <?= count($itemsTip) ?></span>
            <span class="nl-lab__errores" id="nl-tip-errores"></span>
            <button type="button" class="nl-lab__reset" id="nl-tip-reset">Empezar de nuevo</button>
        </div>
        <div class="nl-tip__progreso" id="nl-tip-progreso"></div>
        <?= $conexion() ?>
        <div class="nl-lab__trabajo" id="nl-tip-trabajo" role="status" aria-live="polite"></div>
    </aside>
    <template id="nl-tip-iconos">
        <?php foreach ($tiposTip as $t): ?><span data-tipo="<?= htmlspecialchars($t) ?>"><?= nl_icono_neurona($t) ?></span><?php endforeach; ?>
    </template>
</div>

<?php elseif ($esLamina):
    // Lámina por niveles: la lámina (iframe, con selector de tinción) o la captura del estudiante a la
    // izquierda; en el panel los pasos de cada captura (buscar → recortar → etiquetar → preguntas)
    $lamsNivel = [];
    foreach (($nivelLam['laminas'] ?? []) as $k) { if (isset($tareas['laminas'][$k])) $lamsNivel[$k] = $tareas['laminas'][$k]; }
    $primera = $lamsNivel ? reset($lamsNivel) : null;
?>
<div class="nl-mesa nl-mesa--lamina nl-mesa--capturas container" id="nl-lam"
     data-slug="<?= htmlspecialchars($act['slug']) ?>"
     data-clave="<?= htmlspecialchars($nivelLam['clave']) ?>"
     data-titulo="<?= htmlspecialchars($act['titulo'] . ' — Nivel ' . $nivelLam['romano'] . ': ' . $nivelLam['titulo']) ?>"
     data-requiere="<?= htmlspecialchars($nivelLam['requiere']) ?>"
     data-siguiente="<?= htmlspecialchars($nivelLam['siguiente']) ?>"
     data-capturas="<?= htmlspecialchars(json_encode($nivelLam['capturas'] ?? [], JSON_UNESCAPED_UNICODE), ENT_QUOTES) ?>"
     data-laminas="<?= htmlspecialchars(json_encode($lamsNivel, JSON_UNESCAPED_UNICODE), ENT_QUOTES) ?>">
    <div class="nl-lab__candado" hidden>
        <strong>🔒 Nivel bloqueado</strong>
        <p>Completa primero el nivel anterior para desbloquear este.</p>
    </div>
    <div class="nl-mesa__vista nl-lam__vista">
        <div class="nl-lam__barra">
            <div class="nl-lam__tinciones" role="group" aria-label="Tinción"<?= count($lamsNivel) < 2 ? ' hidden' : '' ?>>
                <?php foreach ($lamsNivel as $k => $l): ?>
                    <button type="button" class="nl-lam__tincion" data-lamina="<?= htmlspecialchars($k) ?>"><?= htmlspecialchars($l['nombre']) ?></button>
                <?php endforeach; ?>
            </div>
            <span class="nl-lam__nombre"><?= count($lamsNivel) < 2 && $primera ? htmlspecialchars($primera['nombre']) : '' ?></span>
            <div class="nl-lam__ver" role="group" aria-label="Qué ver">
                <button type="button" class="nl-lam__ver-btn" data-ver="lamina">🔬 Lámina</button>
                <button type="button" class="nl-lam__ver-btn" data-ver="captura" disabled>📷 Tu captura</button>
            </div>
        </div>
        <iframe src="<?= $primera ? htmlspecialchars($primera['url']) : 'about:blank' ?>" class="nl-mesa__iframe nl-lam__iframe" allowfullscreen title="Lámina virtual"></iframe>
        <div class="nl-lam__editor" hidden></div>
        <p class="nl-mesa__caption nl-lam__caption"><?= $primera ? htmlspecialchars($primera['caption']) : '' ?></p>
    </div>
    <aside class="nl-mesa__panel">
        <?= $instrucciones($nivelLam['instrucciones'] ?? '') ?>
        <div class="nl-lab__estado">
            <span class="nl-lab__contador" id="nl-lam-contador"></span>
            <span class="nl-lab__errores" id="nl-lam-errores"></span>
            <button type="button" class="nl-lab__reset" id="nl-lam-reset">Empezar de nuevo</button>
        </div>
        <div class="nl-lab__chips nl-lam__caps" id="nl-lam-caps"></div>
        <?= $conexion() ?>
        <div class="nl-lab__trabajo" id="nl-lam-trabajo" role="status" aria-live="polite"></div>
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
