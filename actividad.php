<?php
error_reporting(0);
require_once __DIR__ . '/api/db.php';
require_once __DIR__ . '/_partials/iconos_neurona.php';

$slug = $_GET['slug'] ?? '';
$ruta = isset($_GET['ruta']) ? preg_replace('/[^a-z0-9-]/', '', (string)$_GET['ruta']) : '';
if (!$slug) { echo "slug requerido"; exit; }

try {
    $pdo = get_db();
    $stmt = $pdo->prepare("SELECT * FROM actividades WHERE slug = ? AND activo = 1");
    $stmt->execute([$slug]);
    $act = $stmt->fetch();
    if (!$act) { http_response_code(404); echo "Actividad no encontrada"; exit; }

    $recs = $pdo->prepare("SELECT * FROM actividad_recursos WHERE actividad_id = ? ORDER BY orden");
    $recs->execute([$act['id']]);
    $recursos = $recs->fetchAll();
    // Recurso "tareas": configuración JSON de un trabajo autocorregible (capturas + preguntas).
    // No es una pestaña: se muestra como sección propia (js/tareas.js).
    $tareas = null;
    foreach ($recursos as $k => $r) {
        if ($r['tipo'] === 'tareas') {
            $tareas = json_decode((string)$r['url'], true);
            unset($recursos[$k]);
        }
    }
    $recursos = array_values($recursos);

    $cars = $pdo->prepare("
        SELECT ac.*, c.nombre AS carrera_nombre, c.slug AS carrera_slug, c.asignatura_codigo
        FROM actividad_carrera ac
        JOIN carreras c ON c.id = ac.carrera_id
        WHERE ac.actividad_id = ?
        ORDER BY ac.orden
    ");
    $cars->execute([$act['id']]);
    $carreras = $cars->fetchAll();

    $quices = $pdo->prepare("SELECT id, titulo, datos_json FROM quices WHERE actividad_id = ? AND activo = 1");
    $quices->execute([$act['id']]);
    $quicesData = $quices->fetchAll();

    $labels = $pdo->prepare("SELECT * FROM labeling_parts WHERE actividad_id = ? ORDER BY orden");
    $labels->execute([$act['id']]);
    $labelParts = $labels->fetchAll();

    // Práctica por niveles. Si la BD todavía no tiene las tablas (falta correr
    // admin/migrate.php), la página se muestra igual, sin la sección.
    $niveles = [];
    try {
        $sn = $pdo->prepare("SELECT id, numero, titulo, instrucciones, tipo, activo
                             FROM practica_niveles WHERE actividad_id = ? ORDER BY numero");
        $sn->execute([$act['id']]);
        $niveles = $sn->fetchAll();
        // Ojo: la respuesta NO se selecciona; se revisa en api/practica_check.php
        $si = $pdo->prepare("SELECT id, enunciado FROM practica_items WHERE nivel_id = ? ORDER BY orden, id");
        // Nivel "elegir": los botones son todas las respuestas posibles del nivel (sin decir cuál va en cada ítem)
        $so = $pdo->prepare("SELECT DISTINCT respuesta FROM practica_items WHERE nivel_id = ? ORDER BY respuesta");
        foreach ($niveles as $k => $n) {
            $si->execute([$n['id']]);
            $niveles[$k]['items'] = $si->fetchAll();
            $niveles[$k]['opciones'] = [];
            if ($n['tipo'] === 'elegir') {
                $so->execute([$n['id']]);
                $niveles[$k]['opciones'] = $so->fetchAll(PDO::FETCH_COLUMN);
            }
        }
    } catch (Throwable $e) {
        $niveles = [];
    }

    // --- Actividad de identificación: partes + imagen de fondo ---
    $esLabeling = ($act['tipo'] === 'labeling') && !empty($labelParts);
    $partesLab  = [];
    $imgLab     = '';
    if ($esLabeling) {
        foreach ($recursos as $r) {
            if ($r['tipo'] === 'imagen' && !empty($r['url'])) { $imgLab = $r['url']; break; }
        }
        if ($imgLab === '') { $esLabeling = false; }
    }
    $nivelesLab = [];   // otras actividades de identificación del mismo tema (niveles)
    $requiereLab = '';
    if ($esLabeling) {
        $sv = $pdo->prepare("SELECT slug, titulo, activo FROM actividades
                             WHERE tipo = 'labeling' AND topic_id IS ? ORDER BY id");
        $sv->execute([$act['topic_id']]);
        $nivelesLab = $sv->fetchAll();
        foreach ($nivelesLab as $k => $nv) {
            if ($nv['slug'] === $act['slug'] && $k > 0) { $requiereLab = $nivelesLab[$k - 1]['slug']; }
        }
        if (count($nivelesLab) < 2) { $nivelesLab = []; }
    }
    if ($esLabeling) {
        foreach ($labelParts as $i => $lp) {
            // Ojo: acá NO va el nombre correcto. Lo valida api/labeling_check.php.
            $partesLab[] = [
                'id'    => (int)$lp['id'],
                'n'     => $i + 1,
                'x'     => (float)$lp['x_pct'],
                'y'     => (float)$lp['y_pct'],
                'bx'    => isset($lp['box_x_pct']) && $lp['box_x_pct'] !== null && $lp['box_x_pct'] !== ''
                           ? (float)$lp['box_x_pct'] : (float)$lp['x_pct'],
                'by'    => isset($lp['box_y_pct']) && $lp['box_y_pct'] !== null && $lp['box_y_pct'] !== ''
                           ? (float)$lp['box_y_pct'] : (float)$lp['y_pct'],
                'f'     => nl_forma_lab($lp['forma'] ?? null),
            ];
        }
    }

    // Quiz sin recurso visual: se muestra en el panel principal (no en la columna lateral)
    $quizEnStage = ($act['tipo'] === 'quiz') && empty($recursos) && !empty($quicesData);

    $active_page = 'actividad';
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title><?= htmlspecialchars($act['titulo']) ?> — NeuroLab</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
    <script type="importmap"><?= nl_importmap() ?></script>
    <link rel="stylesheet" href="css/base.css?v=<?= nl_ver('css/base.css') ?>">
    <link rel="stylesheet" href="css/activity.css?v=<?= nl_ver('css/activity.css') ?>">
    <?php if (!empty($quicesData)): ?>
    <link rel="stylesheet" href="css/quiz.css?v=<?= nl_ver('css/quiz.css') ?>">
    <?php endif; ?>
    </head>
    <body>
    <div class="bg-mesh"></div>

    <div class="nl-act-header container">
        <?php if ($ruta !== ''): ?>
        <a href="practico.php?p=<?= htmlspecialchars(rawurlencode($ruta)) ?>" class="nl-act-back">← Volver a la ruta del práctico</a>
        <?php else: ?>
        <a href="atlas.php" class="nl-act-back">← Volver al atlas</a>
        <?php endif; ?>
        <div class="nl-act-meta">
            <span class="badge badge-violet"><?= htmlspecialchars(tipoLabel($act['tipo'])) ?></span>
            <span class="text-muted text-sm">slug: <?= htmlspecialchars($act['slug']) ?></span>
        </div>
        <h1><?= htmlspecialchars($act['titulo']) ?></h1>
    </div>

    <div class="nl-act-layout container<?= $esLabeling ? ' nl-act-layout--ancho' : '' ?>">
        <!-- IZQUIERDA: recurso (imagen / iframe / 3D) + tabs -->
        <div class="nl-act-stage">
            <?php if ($esLabeling): ?>
            <!-- Identificación: escribir el nombre de cada parte sobre la imagen -->
            <?php if ($nivelesLab): ?>
            <nav class="nl-lab__niveles" aria-label="Niveles de la actividad">
                <?php foreach ($nivelesLab as $k => $nv):
                    $esta = $nv['slug'] === $act['slug'];
                    $partesT = explode('·', $nv['titulo'], 2);
                    $etq = trim(end($partesT));
                ?>
                    <?php if ($esta): ?>
                        <span class="nl-lab__nivel is-actual" aria-current="page"><?= htmlspecialchars($etq) ?></span>
                    <?php elseif ((int)$nv['activo']): ?>
                        <a class="nl-lab__nivel" href="actividad.php?slug=<?= rawurlencode($nv['slug']) ?><?= $ruta !== '' ? '&amp;ruta=' . rawurlencode($ruta) : '' ?>"><?= htmlspecialchars($etq) ?></a>
                    <?php else: ?>
                        <span class="nl-lab__nivel is-pronto"><?= htmlspecialchars($etq) ?> · próximamente</span>
                    <?php endif; ?>
                <?php endforeach; ?>
            </nav>
            <?php endif; ?>
            <div class="nl-lab" id="nl-lab"
                 data-slug="<?= htmlspecialchars($act['slug']) ?>"
                 data-titulo="<?= htmlspecialchars($act['titulo']) ?>"
                 data-requiere="<?= htmlspecialchars($requiereLab) ?>"
                 data-partes="<?= htmlspecialchars(json_encode($partesLab, JSON_UNESCAPED_UNICODE), ENT_QUOTES) ?>">
                <div class="nl-lab__candado" hidden>
                    <strong>🔒 Nivel bloqueado</strong>
                    <p>Completa primero el nivel anterior para desbloquear este.</p>
                </div>
                <div class="nl-lab__head">
                    <p class="nl-lab__instruccion">
                        <strong>1.</strong> Escribe de memoria el nombre de cada estructura y presiona <kbd>Enter</kbd>
                        (o <kbd>?</kbd> si no lo recuerdas): verás la respuesta correcta.
                        <strong>2.</strong> Luego elige su <strong>función</strong> entre las alternativas.
                        Queda <span class="nl-lab__verde">verde</span> si acertaste ambas; si el nombre falló, queda por repasar.
                    </p>
                    <div class="nl-lab__estado">
                        <span class="nl-lab__contador" id="nl-lab-contador">0 / <?= count($partesLab) ?></span>
                        <span class="nl-lab__errores" id="nl-lab-errores"></span>
                        <button type="button" class="nl-lab__reset" id="nl-lab-reset">Empezar de nuevo</button>
                    </div>
                </div>

                <div class="nl-lab__canvas" id="nl-lab-canvas">
                    <img src="<?= htmlspecialchars($imgLab) ?>" alt="Esquema de una neurona para identificar sus partes" class="nl-lab__img">
                    <svg class="nl-lab__lineas" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
                    <div class="nl-lab__capa" id="nl-lab-capa"></div>
                </div>

                <div class="nl-lab__feedback" id="nl-lab-feedback" role="status" aria-live="polite"></div>
                <div id="nl-lab-guia" hidden></div>
            </div>
            <?php elseif ($quizEnStage): ?>
            <div class="nl-act-quiz-stage">
                <?php foreach ($quicesData as $q) { echo renderQuiz($q); } ?>
            </div>
            <?php else: ?>
            <div class="nl-act-tabs" id="recursos-tabs">
                <?php foreach ($recursos as $i => $r): ?>
                    <button class="nl-act-tab <?= $i === 0 ? 'active' : '' ?>" data-i="<?= $i ?>">
                        <?= tabLabel($r) ?>
                    </button>
                <?php endforeach; ?>
                <?php if (empty($recursos)): ?>
                    <span class="text-muted text-sm">Sin recurso aún.</span>
                <?php endif; ?>
            </div>
            <div class="nl-act-recurso" id="recursos-container">
                <?php foreach ($recursos as $i => $r): ?>
                    <div class="nl-act-recurso-pane <?= $i === 0 ? 'active' : '' ?>" data-i="<?= $i ?>">
                        <?= renderRecurso($r) ?>
                        <?php if (!empty($r['caption']) && $r['tipo'] !== 'texto_html'): ?>
                            <p class="nl-act-caption"><?= htmlspecialchars($r['caption']) ?></p>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>

        <!-- DERECHA: descripciones + quiz -->
        <aside class="nl-act-panel">
            <div class="nl-act-section">
                <span class="label">Descripción general</span>
                <p class="nl-act-desc-general"><?= nl2br(htmlspecialchars($act['descripcion'] ?? '')) ?></p>
            </div>

            <?php if (!empty($carreras)): ?>
            <div class="nl-act-section">
                <span class="label">Énfasis por carrera</span>
                <div class="nl-act-carreras">
                    <?php foreach ($carreras as $c): ?>
                        <div class="nl-act-carrera-card">
                            <div class="nl-act-carrera-head">
                                <strong><?= htmlspecialchars($c['carrera_nombre']) ?></strong>
                                <span class="badge badge-pink"><?= htmlspecialchars($c['asignatura_codigo']) ?></span>
                            </div>
                            <p><?= nl2br(htmlspecialchars($c['descripcion'] ?? '')) ?></p>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <?php if (!empty($quicesData) && !$quizEnStage): ?>
            <div class="nl-act-section">
                <span class="label">Quiz</span>
                <?php foreach ($quicesData as $q) { echo renderQuiz($q); } ?>
            </div>
            <?php endif; ?>

            <div class="nl-act-section">
                <button class="btn btn-ghost btn-sm" id="nl-act-complete">✓ Marcar actividad como completada</button>
            </div>
        </aside>
    </div>

    <?php if (is_array($tareas)): ?>
    <section class="nl-tar container" id="nl-tar"
             data-slug="<?= htmlspecialchars($act['slug']) ?>"
             data-titulo="<?= htmlspecialchars($act['titulo']) ?>"
             data-config="<?= htmlspecialchars(json_encode($tareas, JSON_UNESCAPED_UNICODE), ENT_QUOTES) ?>">
        <div class="nl-prac__head">
            <span class="label">Tu trabajo</span>
            <h2><?= htmlspecialchars($tareas['titulo'] ?? 'Completa la actividad') ?></h2>
            <?php if (!empty($tareas['intro'])): ?><p class="nl-tar__intro"><?= htmlspecialchars($tareas['intro']) ?></p><?php endif; ?>
        </div>
        <div class="nl-tar__cuerpo"></div>
    </section>
    <?php endif; ?>

    <?php if (!empty($niveles)): ?>
    <section class="nl-prac container" id="nl-prac" data-slug="<?= htmlspecialchars($act['slug']) ?>">
        <div class="nl-prac__head">
            <span class="label">Práctica</span>
            <h2>Practica por niveles</h2>
        </div>

        <div class="nl-prac__niveles" role="tablist" aria-label="Niveles de práctica">
            <?php foreach ($niveles as $i => $n): ?>
                <button type="button" role="tab" class="nl-prac__nivel"
                        id="nl-prac-tab-<?= (int)$n['id'] ?>"
                        aria-controls="nl-prac-panel-<?= (int)$n['id'] ?>"
                        data-nivel="<?= (int)$n['id'] ?>"
                        data-numero="<?= (int)$n['numero'] ?>"
                        data-activo="<?= (int)$n['activo'] ?>"
                        data-total="<?= count($n['items']) ?>">
                    <span class="nl-prac__nivel-num">Nivel <?= (int)$n['numero'] ?></span>
                    <span class="nl-prac__nivel-titulo"><?= htmlspecialchars($n['titulo']) ?></span>
                    <span class="nl-prac__nivel-estado"><?= (int)$n['activo'] ? '' : 'Próximamente' ?></span>
                </button>
            <?php endforeach; ?>
        </div>

        <?php foreach ($niveles as $n): ?>
            <div class="nl-prac__panel" role="tabpanel" hidden
                 id="nl-prac-panel-<?= (int)$n['id'] ?>"
                 aria-labelledby="nl-prac-tab-<?= (int)$n['id'] ?>"
                 data-nivel="<?= (int)$n['id'] ?>"
                 data-tipo="<?= htmlspecialchars($n['tipo'] ?: 'completar') ?>">
                <?php if (!(int)$n['activo'] || empty($n['items'])): ?>
                    <div class="nl-prac__pronto">
                        <strong>🔒 Próximamente</strong>
                        <p><?= htmlspecialchars($n['instrucciones'] ?? '') ?></p>
                    </div>
                <?php else: ?>
                    <div class="nl-prac__bloqueo" hidden>
                        <strong>🔒 Nivel bloqueado</strong>
                        <p>Termina el nivel anterior para desbloquear este.</p>
                    </div>
                    <div class="nl-prac__juego">
                        <div class="nl-prac__barra">
                            <p class="nl-prac__instr"><?= htmlspecialchars($n['instrucciones'] ?? '') ?></p>
                            <div class="nl-prac__estado">
                                <span class="nl-prac__contador" aria-live="polite"></span>
                                <button type="button" class="btn btn-ghost btn-sm nl-prac__reiniciar">↺ Reiniciar</button>
                            </div>
                        </div>
                        <?php if ($n['tipo'] === 'armar'): ?>
                        <!-- Nivel "armar": cada ítem es un soma donde el estudiante agrega
                             prolongaciones. El constructor lo dibuja js/armar-neurona.js -->
                        <ol class="nl-prac__lista nl-arm__lista">
                            <?php foreach ($n['items'] as $it): ?>
                                <li class="nl-prac__item nl-arm__item" data-id="<?= (int)$it['id'] ?>">
                                    <p class="nl-arm__pide"><?= htmlspecialchars($it['enunciado']) ?></p>
                                    <div class="nl-arm__mesa"></div>
                                    <p class="nl-prac__fb" aria-live="polite"></p>
                                </li>
                            <?php endforeach; ?>
                        </ol>
                        <?php elseif ($n['tipo'] === 'elegir'): ?>
                        <!-- Nivel "elegir": se responde tocando el botón (con dibujo) del tipo de neurona -->
                        <ol class="nl-prac__lista nl-eleg__lista">
                            <?php foreach ($n['items'] as $it): ?>
                                <li class="nl-prac__item nl-eleg__item" data-id="<?= (int)$it['id'] ?>">
                                    <p class="nl-prac__frase nl-eleg__frase"><?= htmlspecialchars(str_replace('{}', '____', $it['enunciado'])) ?></p>
                                    <div class="nl-eleg__opciones" role="group" aria-label="Elige la respuesta">
                                        <?php foreach ($n['opciones'] as $op): ?>
                                            <button type="button" class="nl-eleg__op" data-valor="<?= htmlspecialchars($op) ?>">
                                                <?= nl_icono_neurona($op) ?><span><?= htmlspecialchars($op) ?></span>
                                            </button>
                                        <?php endforeach; ?>
                                    </div>
                                    <p class="nl-prac__fb" aria-live="polite"></p>
                                </li>
                            <?php endforeach; ?>
                        </ol>
                        <?php else: ?>
                        <ol class="nl-prac__lista">
                            <?php foreach ($n['items'] as $it): ?>
                                <?php
                                    $partes = explode('{}', $it['enunciado'], 2);
                                    if (count($partes) === 1) { $antes = ''; $despues = $partes[0]; }
                                    else { $antes = $partes[0]; $despues = $partes[1]; }
                                ?>
                                <li class="nl-prac__item" data-id="<?= (int)$it['id'] ?>">
                                    <p class="nl-prac__frase">
                                        <?= htmlspecialchars($antes) ?>
                                        <span class="nl-prac__hueco">
                                            <input type="text" class="nl-prac__input"
                                                   aria-label="Tipo de neurona: <?= htmlspecialchars(str_replace('{}', '…', $it['enunciado'])) ?>"
                                                   placeholder="tipo de neurona"
                                                   autocomplete="off" autocapitalize="off" spellcheck="false">
                                        </span>
                                        <?= htmlspecialchars($despues) ?>
                                    </p>
                                    <p class="nl-prac__fb" aria-live="polite"></p>
                                </li>
                            <?php endforeach; ?>
                        </ol>
                        <?php endif; ?>
                        <div class="nl-prac__final" role="status" aria-live="polite"></div>
                    </div>
                <?php endif; ?>
            </div>
        <?php endforeach; ?>
    </section>
    <?php endif; ?>

    <?php include '_partials/footer.php'; ?>
    <script type="module" src="js/activity.js?v=<?= nl_ver('js/activity.js') ?>"></script>
    <?php if (!empty($niveles)): ?>
    <script type="module" src="js/practica.js?v=<?= nl_ver('js/practica.js') ?>"></script>
    <?php endif; ?>
    <?php if (is_array($tareas)): ?>
    <script type="module" src="js/tareas.js?v=<?= nl_ver('js/tareas.js') ?>"></script>
    <?php endif; ?>
    </body>
    </html>
    <?php
} catch (Throwable $e) {
    http_response_code(500);
    echo "Error: " . htmlspecialchars($e->getMessage());
}

function tipoLabel($t) {
    return [
        'lamina' => 'Lámina',
        'simulador' => 'Simulador',
        'comparador' => 'Comparador',
        'labeling' => 'Identificación',
        'quiz' => 'Quiz',
    ][$t] ?? $t;
}

/** Versión de un archivo estático (fecha de modificación) para evitar caché vieja. */
function nl_ver($rel) {
    $f = __DIR__ . '/' . $rel;
    return is_file($f) ? filemtime($f) : '1';
}

/**
 * Forma con que se marca una estructura sobre la imagen (columna labeling_parts.forma):
 *   NULL/''                  -> punto (estructura puntual)
 *   elipse:cx,cy,rx,ry       -> contorno (estructura general: núcleo, soma…)
 *   corchete:x1,y1,x2,y2     -> corchete a lo largo de la estructura (axón…)
 *   puntos:x,y;x,y           -> puntos extra además de (x_pct, y_pct)
 */
function nl_forma_lab($txt) {
    $txt = trim((string)$txt);
    if ($txt === '' || strpos($txt, ':') === false) return null;
    list($tipo, $datos) = explode(':', $txt, 2);
    $tipo = strtolower(trim($tipo));
    if ($tipo === 'puntos') {
        $pts = [];
        foreach (explode(';', $datos) as $par) {
            $v = array_map('floatval', explode(',', $par));
            if (count($v) === 2) $pts[] = $v;
        }
        return $pts ? ['t' => 'puntos', 'v' => $pts] : null;
    }
    $v = array_map('floatval', explode(',', $datos));
    if (in_array($tipo, ['elipse', 'corchete'], true) && count($v) === 4) return ['t' => $tipo, 'v' => $v];
    return null;
}

/** Import map: cada js/*.js con ?v=<fecha> para que los módulos importados tampoco queden en caché. */
function nl_importmap() {
    $map = [];
    foreach (glob(__DIR__ . '/js/*.js') as $f) {
        $map['./js/' . basename($f)] = './js/' . basename($f) . '?v=' . filemtime($f);
    }
    return json_encode(['imports' => $map], JSON_UNESCAPED_SLASHES);
}

function renderQuiz($q) {
    $n = 0;
    $datos = json_decode((string)$q['datos_json'], true);
    if (is_array($datos)) $n = count($datos);
    $titulo = htmlspecialchars($q['titulo'] ?? 'Quiz');
    return '<div class="nl-act-quiz" data-preguntas=\'' . htmlspecialchars((string)$q['datos_json'], ENT_QUOTES) . '\' data-titulo="' . $titulo . '">'
         . '<div class="nl-act-quiz-head"><strong>✏️ ' . $titulo . '</strong>'
         . '<span class="text-muted text-sm">' . $n . ' pregunta' . ($n === 1 ? '' : 's') . '</span></div>'
         . '<button class="btn btn-primary btn-sm nl-act-quiz-start">Iniciar quiz →</button>'
         . '<div class="nl-act-quiz-body" style="display:none"></div>'
         . '</div>';
}

function tabLabel($r) {
    if ($r['tipo'] === 'imagen')        return '🖼️ Imagen';
    if ($r['tipo'] === 'embed_3d')      return '🧊 Modelo 3D';
    if ($r['tipo'] === 'iframe_url') {
        return strpos((string)$r['url'], 'histologyguide') !== false ? '🔬 Lámina virtual' : '🌐 Recurso';
    }
    if ($r['tipo'] === 'texto_html') {
        return '📋 ' . htmlspecialchars(!empty($r['caption']) ? $r['caption'] : 'Contenido');
    }
    return '• ' . htmlspecialchars($r['tipo']);
}

function renderRecurso($r) {
    if ($r['tipo'] === 'imagen') {
        return '<img src="' . htmlspecialchars($r['url']) . '" alt="" class="nl-act-img">';
    }
    if ($r['tipo'] === 'iframe_url' || $r['tipo'] === 'embed_3d') {
        return '<iframe src="' . htmlspecialchars($r['url']) . '" class="nl-act-iframe" allowfullscreen></iframe>';
    }
    if ($r['tipo'] === 'texto_html') {
        return '<div class="nl-act-html">' . $r['url'] . '</div>';
    }
    return '<p class="text-muted">Tipo de recurso no soportado: ' . htmlspecialchars($r['tipo']) . '</p>';
}
