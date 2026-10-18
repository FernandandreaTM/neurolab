<?php
/**
 * NeuroLab — api/circuito_check.php
 * Revisa el nivel «circuito» de una lámina (js/circuito.js), sobre la captura encajada en el molde
 * (coordenadas 0-100). Zonas, puntos, orden y rutas viven en el recurso «tareas» y no se mandan al navegador.
 *   POST slug, n, accion=ubicar, circuito, pieza, x, y -> { correcto, feedback, exp, zona, punto }
 *   POST slug, n, accion=orden,  circuito, orden (JSON) -> { correcto, feedback, ruta }
 *   POST slug, n, accion=corte,  caso, x, y              -> { correcto, feedback, respuesta, exp }
 */
error_reporting(0);
require_once __DIR__ . '/zonas_lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function nl_circ_json($d) { echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }

try {
    $nivel = nl_tareas_nivel((string)($_POST['slug'] ?? ''), (int)($_POST['n'] ?? 0));
    if (!$nivel || ($nivel['tipo'] ?? '') !== 'circuito') nl_circ_json(['correcto' => false, 'red' => true, 'feedback' => 'Nivel no encontrado.']);
    $accion = (string)($_POST['accion'] ?? '');
    $x = (float)($_POST['x'] ?? -1);
    $y = (float)($_POST['y'] ?? -1);

    if ($accion === 'corte') {
        $caso = $nivel['cortes']['casos'][(int)($_POST['caso'] ?? -1)] ?? null;
        if (!$caso) nl_circ_json(['correcto' => false, 'red' => true, 'feedback' => 'Caso no encontrado.']);
        $ok = nl_zona_contiene($caso['zona'], $x, $y);
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
            nl_circ_json(['correcto' => true, 'exp' => (string)($pieza['exp'] ?? ''), 'zona' => (string)$pieza['zona_nombre'], 'punto' => $pieza['punto']]);
        }
        nl_circ_json(['correcto' => false, 'feedback' => 'Todavía no. Pista: ' . (string)($pieza['pista'] ?? '')]);
    }

    if ($accion === 'orden') {
        $orden = json_decode((string)($_POST['orden'] ?? '[]'), true);
        if (is_array($orden) && array_values($orden) === array_values($circ['orden'])) {
            nl_circ_json(['correcto' => true, 'feedback' => (string)($circ['orden_exp'] ?? ''), 'ruta' => $circ['ruta']]);
        }
        nl_circ_json(['correcto' => false, 'feedback' => (string)($circ['orden_pista'] ?? 'Revisa el orden.')]);
    }

    nl_circ_json(['correcto' => false, 'red' => true, 'feedback' => 'Acción no reconocida.']);
} catch (Throwable $e) {
    nl_circ_json(['correcto' => false, 'red' => true, 'feedback' => 'Error del servidor.']);
}
