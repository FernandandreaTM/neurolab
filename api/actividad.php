<?php
require_once __DIR__ . '/../api/db.php';

header('Content-Type: application/json; charset=utf-8');

$slug = $_GET['slug'] ?? '';
if (!$slug) { echo json_encode(['error' => 'slug requerido']); exit; }

try {
    $pdo = get_db();
    $stmt = $pdo->prepare("SELECT * FROM actividades WHERE slug = ? AND activo = 1");
    $stmt->execute([$slug]);
    $act = $stmt->fetch();
    if (!$act) { echo json_encode(['error' => 'no encontrada']); exit; }

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
    $quicesData = [];
    foreach ($quices->fetchAll() as $q) {
        $quicesData[] = [
            'id' => $q['id'],
            'titulo' => $q['titulo'],
            'preguntas' => json_decode($q['datos_json'], true) ?: [],
        ];
    }

    $labels = $pdo->prepare("SELECT * FROM labeling_parts WHERE actividad_id = ? ORDER BY orden");
    $labels->execute([$act['id']]);
    $labelParts = $labels->fetchAll();

    echo json_encode([
        'actividad' => $act,
        'recursos'  => $recursos,
        'carreras'  => $carreras,
        'quices'    => $quicesData,
        'labeling_parts' => $labelParts,
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
