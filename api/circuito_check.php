<?php
/**
 * NeuroLab — api/circuito_check.php
 * Revisa el nivel «circuito» de una lámina (js/circuito.js). La zona de cada neurona y el orden
 * del circuito viven en el recurso «tareas» de la actividad y no se mandan al navegador.
 *   POST slug, n, accion=ubicar, pieza, zona   -> { correcto, feedback, exp }
 *   POST slug, n, accion=orden,  orden (JSON)  -> { correcto, feedback }
 * `zona` es la etiqueta del estudiante más cercana al lugar donde puso la neurona.
 */
error_reporting(0);
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function nl_circ_json($d) { echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }

/** Nivel «circuito» n de la actividad slug, o null. */
function nl_circ_nivel($slug, $n) {
    $st = get_db()->prepare("SELECT r.url FROM actividad_recursos r JOIN actividades a ON a.id = r.actividad_id
                             WHERE a.slug = ? AND r.tipo = 'tareas' LIMIT 1");
    $st->execute([$slug]);
    $t = json_decode((string)$st->fetchColumn(), true);
    foreach ((array)($t['niveles'] ?? []) as $nv) {
        if ((int)($nv['n'] ?? 0) === $n && ($nv['tipo'] ?? '') === 'circuito') return $nv;
    }
    return null;
}

try {
    $nivel = nl_circ_nivel((string)($_POST['slug'] ?? ''), (int)($_POST['n'] ?? 0));
    if (!$nivel) nl_circ_json(['correcto' => false, 'feedback' => 'Nivel no encontrado.']);
    $accion = (string)($_POST['accion'] ?? '');

    if ($accion === 'ubicar') {
        $pieza = null;
        foreach ($nivel['piezas'] as $p) { if ($p['clave'] === (string)($_POST['pieza'] ?? '')) $pieza = $p; }
        if (!$pieza) nl_circ_json(['correcto' => false, 'feedback' => 'Neurona no reconocida.']);
        $zona = (string)($_POST['zona'] ?? '');
        if ($zona === $pieza['zona']) {
            nl_circ_json(['correcto' => true, 'feedback' => '', 'exp' => (string)($pieza['exp'] ?? ''), 'zona' => $pieza['zona']]);
        }
        nl_circ_json(['correcto' => false,
                      'feedback' => 'Todavía no: la pusiste en «' . $zona . '». Pista: ' . (string)($pieza['pista'] ?? '')]);
    }

    if ($accion === 'orden') {
        $orden = json_decode((string)($_POST['orden'] ?? '[]'), true);
        if (is_array($orden) && array_values($orden) === array_values($nivel['orden'])) {
            nl_circ_json(['correcto' => true, 'feedback' => (string)($nivel['orden_exp'] ?? '')]);
        }
        nl_circ_json(['correcto' => false, 'feedback' => (string)($nivel['orden_pista'] ?? 'Revisa el orden.')]);
    }

    nl_circ_json(['correcto' => false, 'feedback' => 'Acción no reconocida.']);
} catch (Throwable $e) {
    nl_circ_json(['correcto' => false, 'feedback' => 'Error del servidor.']);
}
