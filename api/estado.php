<?php
/**
 * NeuroLab — api/estado.php
 * Cambia el estado de revisión de una actividad del pool (sólo modo docente).
 * POST slug, estado, nota  ->  { ok, estado, nota, fecha }
 * Guarda en data/revision.json (sobrevive a un nuevo seed) y actualiza la BD.
 */
error_reporting(0);
date_default_timezone_set('America/Santiago');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/../_partials/docente.php';
require_once __DIR__ . '/../_partials/pool.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function nl_json($d, $code = 200) { http_response_code($code); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') nl_json(['ok' => false, 'error' => 'Usa POST.'], 405);
if (!nl_es_docente()) nl_json(['ok' => false, 'error' => 'Requiere modo docente.'], 403);

$slug   = preg_replace('/[^a-z0-9-]/', '', (string)($_POST['slug'] ?? ''));
$estado = (string)($_POST['estado'] ?? '');
$nota   = trim(substr((string)($_POST['nota'] ?? ''), 0, 4000));
if ($slug === '' || !array_key_exists($estado, NL_ESTADOS)) nl_json(['ok' => false, 'error' => 'Datos inválidos.'], 400);

try {
    $pdo = get_db();
    $st = $pdo->prepare("UPDATE actividades SET estado = ?, notas = ? WHERE slug = ?");
    $st->execute([$estado, $nota, $slug]);
    if (!$st->rowCount()) nl_json(['ok' => false, 'error' => 'Actividad no encontrada.'], 404);

    $rev = nl_revision_leer();
    $fecha = date('Y-m-d H:i');
    $rev[$slug] = ['estado' => $estado, 'nota' => $nota, 'fecha' => $fecha];
    if (!nl_revision_guardar($rev)) nl_json(['ok' => false, 'error' => 'No se pudo escribir data/revision.json (permisos).'], 500);

    nl_json(['ok' => true, 'estado' => $estado, 'nota' => $nota, 'fecha' => $fecha]);
} catch (Throwable $e) {
    nl_json(['ok' => false, 'error' => 'Error al guardar.'], 500);
}
