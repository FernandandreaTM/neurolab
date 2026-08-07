<?php
/**
 * NeuroLab — seed.php
 * Puebla la DB con 2 carreras + 5 topics + 5 actividades demo. Idempotente.
 */
error_reporting(E_ALL);
ini_set('display_errors', '1');

require_once __DIR__ . '/../api/db.php';

$seedPath = __DIR__ . '/../data/seed.sql';
if (!file_exists($seedPath)) { die("No se encontró seed.sql"); }

try {
    $pdo  = get_db();
    $sql  = file_get_contents($seedPath);
    $pdo->exec($sql);

    $stats = [
        'carreras'   => (int)$pdo->query("SELECT COUNT(*) FROM carreras")->fetchColumn(),
        'topics'     => (int)$pdo->query("SELECT COUNT(*) FROM topics")->fetchColumn(),
        'actividades'=> (int)$pdo->query("SELECT COUNT(*) FROM actividades")->fetchColumn(),
        'recursos'   => (int)$pdo->query("SELECT COUNT(*) FROM actividad_recursos")->fetchColumn(),
        'carrera_act'=> (int)$pdo->query("SELECT COUNT(*) FROM actividad_carrera")->fetchColumn(),
    ];
    echo "<h2 style='font-family:sans-serif;color:#1A0E2E'>NeuroLab — seed OK</h2>";
    echo "<ul style='font-family:sans-serif'>";
    foreach ($stats as $k => $v) echo "<li>{$k}: {$v}</li>";
    echo "</ul>";
    echo "<p><a href='../index.php' style='color:#8B5CF6'>→ Ver el sitio</a></p>";
    echo "<p><a href='index.php' style='color:#8B5CF6'>→ Panel admin</a></p>";
} catch (Throwable $e) {
    echo "<h2 style='color:red'>Error</h2><pre>" . htmlspecialchars($e->getMessage()) . "</pre>";
}
