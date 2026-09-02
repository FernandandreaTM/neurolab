<?php
error_reporting(0);
require_once __DIR__ . '/api/db.php';

$slug = $_GET['slug'] ?? '';
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
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/activity.css">
    </head>
    <body>
    <div class="bg-mesh"></div>

    <div class="nl-act-header container">
        <a href="atlas.php" class="nl-act-back">← Volver al atlas</a>
        <div class="nl-act-meta">
            <span class="badge badge-violet"><?= htmlspecialchars(tipoLabel($act['tipo'])) ?></span>
            <span class="text-muted text-sm">slug: <?= htmlspecialchars($act['slug']) ?></span>
        </div>
        <h1><?= htmlspecialchars($act['titulo']) ?></h1>
    </div>

    <div class="nl-act-layout container">
        <!-- IZQUIERDA: recurso (imagen / iframe / 3D) + tabs -->
        <div class="nl-act-stage">
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
                        <?php if (!empty($r['caption'])): ?>
                            <p class="nl-act-caption"><?= htmlspecialchars($r['caption']) ?></p>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            </div>
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

            <?php if (!empty($quicesData)): ?>
            <div class="nl-act-section">
                <span class="label">Quiz</span>
                <?php foreach ($quicesData as $q): ?>
                    <div class="nl-act-quiz"
                         data-preguntas='<?= htmlspecialchars($q['datos_json'], ENT_QUOTES) ?>'
                         data-titulo="<?= htmlspecialchars($q['titulo'] ?? 'Quiz') ?>">
                        <div class="nl-act-quiz-head">
                            <strong>✏️ <?= htmlspecialchars($q['titulo'] ?? 'Quiz') ?></strong>
                            <span class="text-muted text-sm">20 preguntas</span>
                        </div>
                        <button class="btn btn-primary btn-sm nl-act-quiz-start">Iniciar quiz →</button>
                        <div class="nl-act-quiz-body" style="display:none"></div>
                    </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>

            <div class="nl-act-section">
                <button class="btn btn-ghost btn-sm" id="nl-act-complete">✓ Marcar actividad como completada</button>
            </div>
        </aside>
    </div>

    <?php include '_partials/footer.php'; ?>
    <script type="module" src="js/activity.js"></script>
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

function tabLabel($r) {
    if ($r['tipo'] === 'imagen')        return '🖼️ Imagen';
    if ($r['tipo'] === 'embed_3d')      return '🧊 Modelo 3D';
    if ($r['tipo'] === 'iframe_url')    return '🌐 Recurso';
    if ($r['tipo'] === 'texto_html')    return '📋 Contenido';
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
