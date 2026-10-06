<?php
/**
 * NeuroLab — api/labeling_check.php
 * Revela la respuesta de una parte de la actividad de identificación (labeling).
 *
 * No corrige: el estudiante compara su respuesta con la correcta y decide.
 * Se pide al servidor (y no va en el HTML) para que la respuesta aparezca
 * sólo después de que el estudiante escribe o presiona "No sé".
 *
 * POST: parte_id
 * ->   { "ok": true, "nombre": "...", "alternativas": ["..."], "funcion": "..." }
 *      { "ok": false, "error": "..." }
 */
error_reporting(0);
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/** Texto comparable: sin tildes, mayúsculas, artículos ni signos. */
function nl_normaliza($txt) {
    $map = [
        'á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n',
        'Á'=>'a','É'=>'e','Í'=>'i','Ó'=>'o','Ú'=>'u','Ü'=>'u','Ñ'=>'n',
    ];
    $txt = strtolower(strtr((string)$txt, $map));
    $txt = preg_replace('/[^a-z0-9 ]/', '', str_replace(['-', '_'], ' ', $txt));
    $txt = trim(preg_replace('/\s+/', ' ', $txt));
    return trim(preg_replace('/^(el|la|los|las|un|una|unos|unas) /', '', $txt));
}

/** Sin plurales, palabra por palabra: "botones terminales" = "boton terminal". */
function nl_raiz($t) {
    $out = [];
    foreach (explode(' ', $t) as $w) {
        if (substr($w, -2) === 'es' && strlen($w) > 4)     $w = substr($w, 0, -2);
        elseif (substr($w, -1) === 's' && strlen($w) > 3)  $w = substr($w, 0, -1);
        $out[] = $w;
    }
    return implode(' ', $out);
}

/**
 * Sinónimos para mostrar: sin repetir el nombre ni variantes que sólo
 * difieren en tildes o plural; de cada grupo queda la forma con tildes.
 */
function nl_alternativas($nombre, $sinonimos) {
    $base   = nl_raiz(nl_normaliza($nombre));
    $vistos = [$base => true];
    $grupos = [];
    foreach (explode('|', (string)$sinonimos) as $alt) {
        $alt = trim($alt);
        if ($alt === '') continue;
        $k = nl_raiz(nl_normaliza($alt));
        if ($k === '' || isset($vistos[$k])) continue;
        // Fragmentos del propio nombre ("nódulo" en "nódulo de Ranvier") no son otro nombre.
        if (strpos(' ' . $base . ' ', ' ' . $k . ' ') !== false) continue;
        $acentos = strlen($alt) - strlen(nl_normaliza($alt));
        if (!isset($grupos[$k]) || $acentos > $grupos[$k][1]) $grupos[$k] = [$alt, $acentos];
    }
    $out = [];
    foreach ($grupos as $g) {
        $t = $g[0];
        $out[] = function_exists('mb_strtoupper')
            ? mb_strtoupper(mb_substr($t, 0, 1, 'UTF-8'), 'UTF-8') . mb_substr($t, 1, null, 'UTF-8')
            : ucfirst($t);
    }
    return $out;
}

$parteId = isset($_POST['parte_id']) ? (int)$_POST['parte_id'] : 0;
if ($parteId <= 0) {
    echo json_encode(['ok' => false, 'error' => 'Falta indicar la parte.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $st = get_db()->prepare("SELECT nombre, descripcion, sinonimos FROM labeling_parts WHERE id = ?");
    $st->execute([$parteId]);
    $parte = $st->fetch();
    if (!$parte) {
        echo json_encode(['ok' => false, 'error' => 'No encontramos esa parte.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    echo json_encode([
        'ok'           => true,
        'nombre'       => $parte['nombre'],
        'alternativas' => nl_alternativas($parte['nombre'], $parte['sinonimos']),
        'funcion'      => (string)$parte['descripcion'],
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    echo json_encode(['ok' => false, 'error' => 'No pudimos traer la respuesta. Intenta de nuevo.'], JSON_UNESCAPED_UNICODE);
}
