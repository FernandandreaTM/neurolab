<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo  = get_db();
    $rows = $pdo->query("
        SELECT id, topic_id, slug, titulo, descripcion, tipo
        FROM actividades
        WHERE activo = 1
        ORDER BY titulo
    ")->fetchAll();
    echo json_encode(['actividades' => $rows], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    echo json_encode(['actividades' => [], 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
