<?php
/**
 * NeuroLab — migrate.php
 * Crea data/neurolab.db desde data/schema.sql. Idempotente.
 */
error_reporting(E_ALL);
ini_set('display_errors', '1');

$dataDir = __DIR__ . '/../data';
$dbPath  = $dataDir . '/neurolab.db';
$schema  = $dataDir . '/schema.sql';

if (!is_dir($dataDir)) { mkdir($dataDir, 0755, true); }

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("PRAGMA journal_mode=WAL");
    $sql = file_get_contents($schema);
    $pdo->exec($sql);
    echo "<h2 style='font-family:sans-serif;color:#1A0E2E'>NeuroLab — migración OK</h2>";
    echo "<p style='font-family:sans-serif'>Base creada en <code>{$dbPath}</code></p>";
    echo "<p><a href='seed.php' style='color:#8B5CF6'>→ Siguiente: poblar datos demo (seed.php)</a></p>";
    echo "<p><a href='index.php' style='color:#8B5CF6'>→ Ir al sitio</a></p>";
} catch (Throwable $e) {
    echo "<h2 style='color:red'>Error</h2><pre>" . htmlspecialchars($e->getMessage()) . "</pre>";
}
