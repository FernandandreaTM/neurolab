<?php
/**
 * NeuroLab — api/circuito_check.php
 * Revisa el nivel «circuito» de una lámina (js/circuito.js), sobre la captura encajada en el molde
 * (coordenadas 0-100). Zonas, puntos, orden y rutas viven en el recurso «tareas» y no se mandan al navegador.
 *   POST slug, n, accion=ubicar, circuito, pieza, x, y      -> { correcto, feedback, exp, zona, punto, trazo }
 *   POST slug, n, accion=orden,  circuito, via, orden (JSON) -> { correcto, feedback, ruta, inhibe }
 *   POST slug, n, accion=corte,  caso, sitio (letra)         -> { correcto, feedback, respuesta, exp }
 *   POST slug, n, accion=pieza,  pieza, x, y                  -> { correcto, feedback, caja, exp }  (nivel «rompecabezas»)
 */
error_reporting(0);
require_once __DIR__ . '/zonas_lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function nl_circ_json($d) { echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }

try {
    $nivel = nl_tareas_nivel((string)($_POST['slug'] ?? ''), (int)($_POST['n'] ?? 0));
    if (!$nivel || !in_array($nivel['tipo'] ?? '', ['circuito', 'rompecabezas'], true)) nl_circ_json(['correcto' => false, 'red' => true, 'feedback' => 'Nivel no encontrado.']);
    $accion = (string)($_POST['accion'] ?? '');
    $x = (float)($_POST['x'] ?? -1);
    $y = (float)($_POST['y'] ?? -1);

    if ($accion === 'pieza') {
        // Correcta si el punto (centro de la pieza al soltarla) cae cerca del centro de su caja
        $pieza = null;
        foreach ((array)($nivel['piezas'] ?? []) as $p) { if ($p['clave'] === (string)($_POST['pieza'] ?? '')) $pieza = $p; }
        if (!$pieza) nl_circ_json(['correcto' => false, 'red' => true, 'feedback' => 'Pieza no reconocida.']);
        list($cx, $cy, $cw, $ch) = $pieza['caja'];
        // Con «zona» (huecos): vale cualquier punto de la silueta. Sin zona: cerca del centro de la caja
        $ok = !empty($pieza['zona']) ? nl_zona_contiene($pieza['zona'], $x, $y)
            : abs($x - ($cx + $cw / 2)) <= max(7, $cw * 0.35) && abs($y - ($cy + $ch / 2)) <= max(9, $ch * 0.35);
        nl_circ_json($ok ? ['correcto' => true, 'caja' => $pieza['caja'], 'exp' => (string)($pieza['exp'] ?? '')]
                         : ['correcto' => false, 'feedback' => 'No va ahí. Pista: ' . (string)($pieza['pista'] ?? '')]);
    }

    if ($accion === 'corte') {
        $caso = $nivel['cortes']['casos'][(int)($_POST['caso'] ?? -1)] ?? null;
        if (!$caso) nl_circ_json(['correcto' => false, 'red' => true, 'feedback' => 'Caso no encontrado.']);
        $ok = isset($caso['sitio']) ? (string)$caso['sitio'] === (string)($_POST['sitio'] ?? '') : nl_zona_contiene($caso['zona'], $x, $y);
        nl_circ_json($ok ? ['correcto' => true, 'respuesta' => (string)$caso['respuesta'], 'exp' => (string)$caso['exp']]
                         : ['correcto' => false, 'feedback' => (string)$caso['pista']]);
    }

    $circ = null;
    foreach ((array)($nivel['circuitos'] ?? []) as $c) { if ($c['clave'] === (string)($_POST['circuito'] ?? '')) $circ = $c; }
    if (!$circ) nl_circ_json(['correcto' => false, 'red' => true, 'feedback' => 'Circuito no encontrado.']);

    if ($accion === 'ubicar') {
        $pieza = null;
        foreach ($circ['piezas'] as $p) { if ($p['clave'] === (string)($_POST['pieza'] ?? '')) $pieza = $p; }
        if (!$pieza) nl_circ_json(['correcto' => false, 'red' => true, 'feedback' => 'Neurona no reconocida.']);
        if (nl_zona_contiene($pieza['zona'], $x, $y)) {
            nl_circ_json(['correcto' => true, 'exp' => (string)($pieza['exp'] ?? ''), 'zona' => (string)($pieza['zona_nombre'] ?? ''),
                          'punto' => $pieza['punto'], 'trazo' => $pieza['trazo'] ?? null]);
        }
        nl_circ_json(['correcto' => false, 'feedback' => 'Todavía no. Pista: ' . (string)($pieza['pista'] ?? '')]);
    }

    if ($accion === 'orden') {
        $orden = json_decode((string)($_POST['orden'] ?? '[]'), true);
        // Varias vías (p. ej. directa e inhibición recíproca) o una sola (orden, ruta)
        $via = isset($circ['vias']) ? ($circ['vias'][(int)($_POST['via'] ?? 0)] ?? null)
             : ['orden' => $circ['orden'], 'ruta' => $circ['ruta'], 'exp' => $circ['orden_exp'] ?? '', 'pista' => $circ['orden_pista'] ?? ''];
        if (!$via) nl_circ_json(['correcto' => false, 'red' => true, 'feedback' => 'Vía no encontrada.']);
        if (is_array($orden) && array_values($orden) === array_values($via['orden'])) {
            nl_circ_json(['correcto' => true, 'feedback' => (string)($via['exp'] ?? ''), 'ruta' => $via['ruta'], 'inhibe' => (string)($via['inhibe'] ?? '')]);
        }
        nl_circ_json(['correcto' => false, 'feedback' => (string)($via['pista'] ?? 'Revisa el orden.')]);
    }

    nl_circ_json(['correcto' => false, 'red' => true, 'feedback' => 'Acción no reconocida.']);
} catch (Throwable $e) {
    nl_circ_json(['correcto' => false, 'red' => true, 'feedback' => 'Error del servidor.']);
}
