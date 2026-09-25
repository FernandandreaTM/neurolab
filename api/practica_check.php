<?php
/**
 * NeuroLab — api/practica_check.php
 * Revisa una respuesta de la práctica por niveles (tabla practica_items).
 *
 * La comprobación se hace acá para que las respuestas no queden escritas
 * en el HTML de la página.
 *
 * POST: item_id, respuesta
 * ->   { "correcto": true,  "respuesta": "Bipolar", "feedback": "..." }
 *      { "correcto": false, "feedback": "..." }
 */
error_reporting(0);
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/** Texto comparable: sin tildes, mayúsculas, signos, artículos ni la palabra "neurona". */
function nl_prac_normaliza($txt) {
    $txt = (string)$txt;
    $map = [
        'á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n',
        'Á'=>'a','É'=>'e','Í'=>'i','Ó'=>'o','Ú'=>'u','Ü'=>'u','Ñ'=>'n',
    ];
    $txt = strtolower(strtr($txt, $map));
    $txt = str_replace(['-', '_'], ' ', $txt);
    $txt = preg_replace('/[^a-z0-9 ]/', '', $txt);
    $txt = trim(preg_replace('/\s+/', ' ', $txt));
    $txt = preg_replace('/^(el|la|los|las|un|una|unos|unas) /', '', $txt);
    $txt = preg_replace('/^(neuronas?|tipo) /', '', $txt);
    return trim($txt);
}

/** Igualdad tolerando singular/plural ("bipolar" / "bipolares"). */
function nl_prac_coincide($a, $b) {
    if ($a === '' || $b === '') return false;
    if ($a === $b) return true;
    $sinS = function ($t) {
        if (substr($t, -2) === 'es' && strlen($t) > 4) return substr($t, 0, -2);
        if (substr($t, -1) === 's'  && strlen($t) > 3) return substr($t, 0, -1);
        return $t;
    };
    return $sinS($a) === $sinS($b);
}

/** Formas aceptadas para una fila de practica_items. */
function nl_prac_validas($fila) {
    $v = [nl_prac_normaliza($fila['respuesta'])];
    if (!empty($fila['sinonimos'])) {
        foreach (explode('|', $fila['sinonimos']) as $alt) {
            $alt = nl_prac_normaliza($alt);
            if ($alt !== '') $v[] = $alt;
        }
    }
    return $v;
}

function nl_prac_calza($limpia, $validas) {
    foreach ($validas as $v) {
        if (nl_prac_coincide($limpia, $v)) return true;
    }
    return false;
}

function nl_prac_json($datos) {
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

$itemId    = isset($_POST['item_id'])   ? (int)$_POST['item_id'] : 0;
$respuesta = isset($_POST['respuesta']) ? (string)$_POST['respuesta'] : '';

if ($itemId <= 0) {
    nl_prac_json(['correcto' => false, 'feedback' => 'Falta indicar la frase.']);
}

$limpia = nl_prac_normaliza($respuesta);
if ($limpia === '') {
    nl_prac_json(['correcto' => false, 'feedback' => 'Escribe tu respuesta antes de revisar.']);
}

try {
    $pdo = get_db();
    $st  = $pdo->prepare("
        SELECT i.id, i.nivel_id, i.respuesta, i.sinonimos, i.pista, i.explicacion
        FROM practica_items i
        JOIN practica_niveles n ON n.id = i.nivel_id
        WHERE i.id = ? AND n.activo = 1
    ");
    $st->execute([$itemId]);
    $item = $st->fetch();

    if (!$item) {
        nl_prac_json(['correcto' => false, 'feedback' => 'No encontramos esa frase.']);
    }

    if (nl_prac_calza($limpia, nl_prac_validas($item))) {
        nl_prac_json([
            'correcto'  => true,
            'respuesta' => $item['respuesta'],
            'feedback'  => $item['explicacion'] ? $item['explicacion'] : '¡Correcto!',
        ]);
    }

    // ¿Escribió otra de las respuestas del nivel (otro tipo de neurona) o algo que no está en juego?
    $otras = $pdo->prepare("SELECT DISTINCT respuesta, sinonimos FROM practica_items WHERE nivel_id = ? ORDER BY respuesta");
    $otras->execute([$item['nivel_id']]);
    $opciones = [];
    $esOpcion = false;
    foreach ($otras->fetchAll() as $o) {
        $opciones[$o['respuesta']] = true;
        if (nl_prac_calza($limpia, nl_prac_validas($o))) $esOpcion = true;
    }

    $pista = $item['pista'] ? ' Pista: ' . $item['pista'] : '';
    if ($esOpcion) {
        nl_prac_json(['correcto' => false, 'feedback' => 'Todavía no.' . $pista]);
    }

    $lista = implode(', ', array_keys($opciones));
    $lista = function_exists('mb_strtolower') ? mb_strtolower($lista, 'UTF-8') : strtolower($lista);
    nl_prac_json([
        'correcto' => false,
        'feedback' => 'Esa respuesta no está entre las opciones de este nivel (' . $lista . ').' . $pista,
    ]);

} catch (Throwable $e) {
    nl_prac_json(['correcto' => false, 'feedback' => 'No pudimos revisar la respuesta. Intenta de nuevo.']);
}
