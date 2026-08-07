<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo  = get_db();
    $rows = $pdo->query("
        SELECT id, slug, nombre, parent_id, icono, tipo, orden
        FROM topics
        ORDER BY COALESCE(parent_id, 0), orden, nombre
    ")->fetchAll();
    echo json_encode(['topics' => $rows], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    echo json_encode(['topics' => [], 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
