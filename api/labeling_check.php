<?php
/**
 * NeuroLab — api/labeling_check.php
 * Corrige la actividad de identificación (labeling) en dos pasos, sin que las
 * respuestas viajen en el HTML de la página.
 *
 * POST parte_id, accion=nombre,  respuesta=<nombre escrito, '' = no sé>
 *   -> { ok, correcto, nombre, alternativas, opciones:[4 funciones] }
 *      (correcto = coincide con el nombre o un sinónimo; si no, el estudiante compara)
 * POST parte_id, accion=funcion, respuesta=<función elegida>
 *   -> { ok, correcto:false } | { ok, correcto:true, nombre, funcion, detalle, alternativas }
 * POST parte_id (sin accion): revela nombre, alternativas y función (versión anterior).
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
$accion  = isset($_POST['accion'])   ? (string)$_POST['accion']   : '';
$resp    = isset($_POST['respuesta']) ? (string)$_POST['respuesta'] : '';
if ($parteId <= 0) {
    echo json_encode(['ok' => false, 'error' => 'Falta indicar la parte.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = get_db();
    $st  = $pdo->prepare("SELECT * FROM labeling_parts WHERE id = ?");
    $st->execute([$parteId]);
    $parte = $st->fetch();
    if (!$parte) {
        echo json_encode(['ok' => false, 'error' => 'No encontramos esa parte.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $funcion = isset($parte['funcion']) && $parte['funcion'] !== null && $parte['funcion'] !== ''
             ? (string)$parte['funcion'] : (string)$parte['descripcion'];

    // Paso 1: el nombre escrito. Se revela el correcto y se entregan 4 funciones posibles
    // (la correcta + 3 de otras partes de la misma actividad), en orden al azar.
    if ($accion === 'nombre') {
        $validas = [nl_raiz(nl_normaliza($parte['nombre']))];
        foreach (explode('|', (string)$parte['sinonimos']) as $alt) {
            $k = nl_raiz(nl_normaliza($alt));
            if ($k !== '') $validas[] = $k;
        }
        $limpia   = nl_raiz(nl_normaliza($resp));
        $correcto = $limpia !== '' && in_array($limpia, $validas, true);
        $sd = $pdo->prepare("SELECT COALESCE(NULLIF(funcion, ''), descripcion) FROM labeling_parts
                             WHERE actividad_id = ? AND id <> ? ORDER BY RANDOM() LIMIT 3");
        $sd->execute([$parte['actividad_id'], $parteId]);
        $opciones = array_merge([$funcion], $sd->fetchAll(PDO::FETCH_COLUMN));
        shuffle($opciones);
        echo json_encode(['ok' => true, 'correcto' => $correcto, 'nombre' => $parte['nombre'],
                          'alternativas' => nl_alternativas($parte['nombre'], $parte['sinonimos']),
                          'opciones' => $opciones], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Paso 2: la función elegida entre las alternativas.
    if ($accion === 'funcion') {
        $correcto = trim($resp) === trim($funcion);
        $out = ['ok' => true, 'correcto' => $correcto];
        if ($correcto) {
            $out['nombre']       = $parte['nombre'];
            $out['funcion']      = $funcion;
            $out['detalle']      = (string)$parte['descripcion'];
            $out['alternativas'] = nl_alternativas($parte['nombre'], $parte['sinonimos']);
        }
        echo json_encode($out, JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Sin acción (versión anterior): revela nombre, alternativas y función.
    echo json_encode([
        'ok'           => true,
        'nombre'       => $parte['nombre'],
        'alternativas' => nl_alternativas($parte['nombre'], $parte['sinonimos']),
        'funcion'      => (string)$parte['descripcion'],
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    echo json_encode(['ok' => false, 'error' => 'No pudimos revisar la respuesta. Intenta de nuevo.'], JSON_UNESCAPED_UNICODE);
}
