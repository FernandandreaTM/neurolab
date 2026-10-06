<?php
/**
 * NeuroLab — migrate.php
 * Crea data/neurolab.db desde data/schema.sql. Idempotente.
 *
 * Además aplica las migraciones incrementales (columnas nuevas sobre tablas
 * que ya existen), porque SQLite no tiene "ALTER TABLE ... ADD COLUMN IF NOT EXISTS".
 */
error_reporting(E_ALL);
ini_set('display_errors', '1');

$dataDir = __DIR__ . '/../data';
$dbPath  = $dataDir . '/neurolab.db';
$schema  = $dataDir . '/schema.sql';

if (!is_dir($dataDir)) { mkdir($dataDir, 0755, true); }

/** Agrega una columna sólo si todavía no existe. Devuelve true si la agregó. */
function add_column_if_missing(PDO $pdo, $tabla, $columna, $definicion) {
    $cols = $pdo->query("PRAGMA table_info(" . $tabla . ")")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($cols as $c) {
        if (isset($c['name']) && strcasecmp($c['name'], $columna) === 0) return false;
    }
    $pdo->exec("ALTER TABLE {$tabla} ADD COLUMN {$columna} {$definicion}");
    return true;
}

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("PRAGMA journal_mode=WAL");
    $sql = file_get_contents($schema);
    $pdo->exec($sql);

    // --- Migraciones incrementales ---
    $aplicadas = [];
    if (add_column_if_missing($pdo, 'topics', 'descripcion', 'TEXT')) {
        $aplicadas[] = 'topics.descripcion';
    }
    foreach (['sinonimos' => 'TEXT', 'box_x_pct' => 'REAL', 'box_y_pct' => 'REAL', 'funcion' => 'TEXT'] as $col => $tipo) {
        if (add_column_if_missing($pdo, 'labeling_parts', $col, $tipo)) {
            $aplicadas[] = 'labeling_parts.' . $col;
        }
    }

    echo "<h2 style='font-family:sans-serif;color:#1A0E2E'>NeuroLab — migración OK</h2>";
    echo "<p style='font-family:sans-serif'>Base creada/actualizada en <code>{$dbPath}</code></p>";
    if ($aplicadas) {
        echo "<p style='font-family:sans-serif'>Columnas agregadas: <code>" .
             htmlspecialchars(implode(', ', $aplicadas)) . "</code></p>";
    } else {
        echo "<p style='font-family:sans-serif;color:#666'>Sin columnas nuevas que agregar.</p>";
    }
    echo "<p><a href='seed.php' style='color:#8B5CF6'>→ Siguiente: poblar datos demo (seed.php)</a></p>";
    echo "<p><a href='index.php' style='color:#8B5CF6'>→ Ir al sitio</a></p>";
} catch (Throwable $e) {
    echo "<h2 style='color:red'>Error</h2><pre>" . htmlspecialchars($e->getMessage()) . "</pre>";
}
