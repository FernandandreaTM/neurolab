<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../_partials/pool.php';
require_once __DIR__ . '/../_partials/docente.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo  = get_db();
    $rows = $pdo->query("
        SELECT id, topic_id, slug, titulo, descripcion, tipo, familia, enfoque, estado
        FROM actividades
        WHERE activo = 1" . (NL_SOLO_FUNCIONANDO && !nl_es_docente() ? " AND estado = 'funcionando'" : "") . "
        ORDER BY titulo
    ")->fetchAll();
    echo json_encode(['actividades' => $rows], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    echo json_encode(['actividades' => [], 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
