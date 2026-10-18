<?php
/**
 * NeuroLab — api/lamina_check.php
 * Revisa un punto de una captura encajada en un molde (js/lamina.js, paso «Ubicar»).
 *   POST slug, n, captura, etiqueta, x, y (0-100)  -> { correcto, pista }
 * Las zonas viven en el recurso «tareas» (captura.zonas) y no se mandan al navegador.
 */
error_reporting(0);
require_once __DIR__ . '/zonas_lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function nl_lc_json($d) { echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }

try {
    $nivel = nl_tareas_nivel((string)($_POST['slug'] ?? ''), (int)($_POST['n'] ?? 0));
    $cap = null;
    foreach ((array)($nivel['capturas'] ?? []) as $c) { if (($c['clave'] ?? '') === (string)($_POST['captura'] ?? '')) $cap = $c; }
    $zona = $cap['zonas'][(string)($_POST['etiqueta'] ?? '')] ?? null;
    if (!$zona) nl_lc_json(['correcto' => false, 'red' => true, 'pista' => 'No reconocimos esa estructura.']);
    $ok = nl_zona_contiene($zona, (float)($_POST['x'] ?? -1), (float)($_POST['y'] ?? -1));
    nl_lc_json(['correcto' => $ok, 'pista' => $ok ? '' : (string)($zona['pista'] ?? '')]);
} catch (Throwable $e) {
    nl_lc_json(['correcto' => false, 'red' => true, 'pista' => 'Error del servidor.']);
}
