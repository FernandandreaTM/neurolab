<?php
/**
 * NeuroLab — api/labeling_check.php
 * Revisa una respuesta de la actividad de identificación (labeling).
 *
 * La comprobación se hace acá y no en el navegador para que los nombres
 * correctos no queden escritos en el HTML de la página.
 *
 * POST: parte_id, respuesta
 * ->   { "correcto": true,  "nombre": "...", "feedback": "..." }
 *      { "correcto": false, "feedback": "..." }
 */
error_reporting(0);
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

/** Deja el texto comparable: sin tildes, sin mayúsculas, sin artículos ni signos. */
function nl_normaliza($txt) {
    $txt = (string)$txt;
    $map = [
        'á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n',
        'Á'=>'a','É'=>'e','Í'=>'i','Ó'=>'o','Ú'=>'u','Ü'=>'u','Ñ'=>'n',
        'à'=>'a','è'=>'e','ì'=>'i','ò'=>'o','ù'=>'u','â'=>'a','ê'=>'e','î'=>'i','ô'=>'o','û'=>'u',
    ];
    $txt = strtr($txt, $map);
    $txt = strtolower($txt);
    $txt = str_replace(['-', '_'], ' ', $txt);
    $txt = preg_replace('/[^a-z0-9 ]/', '', $txt);
    $txt = preg_replace('/\s+/', ' ', $txt);
    $txt = trim($txt);
    $txt = preg_replace('/^(el|la|los|las|un|una|unos|unas) /', '', $txt);
    return trim($txt);
}

/** Compara tolerando singular/plural ("dendrita" vs "dendritas"). */
function nl_coincide($a, $b) {
    if ($a === '' || $b === '') return false;
    if ($a === $b) return true;
    $sinS = function ($t) {
        if (substr($t, -2) === 'es' && strlen($t) > 4) return substr($t, 0, -2);
        if (substr($t, -1) === 's'  && strlen($t) > 3) return substr($t, 0, -1);
        return $t;
    };
    return $sinS($a) === $sinS($b);
}

$parteId  = isset($_POST['parte_id'])  ? (int)$_POST['parte_id'] : 0;
$respuesta = isset($_POST['respuesta']) ? (string)$_POST['respuesta'] : '';

if ($parteId <= 0) {
    echo json_encode(['correcto' => false, 'feedback' => 'Falta indicar la parte.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$limpia = nl_normaliza($respuesta);
if ($limpia === '') {
    echo json_encode(['correcto' => false, 'feedback' => 'Escribe el nombre de la parte antes de revisar.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = get_db();
    $st  = $pdo->prepare("SELECT id, nombre, descripcion, sinonimos FROM labeling_parts WHERE id = ?");
    $st->execute([$parteId]);
    $parte = $st->fetch();

    if (!$parte) {
        echo json_encode(['correcto' => false, 'feedback' => 'No encontramos esa parte.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $validas = [nl_normaliza($parte['nombre'])];
    if (!empty($parte['sinonimos'])) {
        foreach (explode('|', $parte['sinonimos']) as $alt) {
            $alt = nl_normaliza($alt);
            if ($alt !== '') $validas[] = $alt;
        }
    }

    $ok = false;
    foreach ($validas as $v) {
        if (nl_coincide($limpia, $v)) { $ok = true; break; }
    }

    if ($ok) {
        echo json_encode([
            'correcto' => true,
            'nombre'   => $parte['nombre'],
            'feedback' => $parte['descripcion'] ? $parte['descripcion'] : '¡Correcto!',
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Pista sin regalar la respuesta: inicial y cantidad de letras.
    $nombre  = (string)$parte['nombre'];
    $inicial = function_exists('mb_substr') ? mb_substr($nombre, 0, 1, 'UTF-8') : substr($nombre, 0, 1);
    $largo   = function_exists('mb_strlen') ? mb_strlen($nombre, 'UTF-8') : strlen($nombre);

    echo json_encode([
        'correcto' => false,
        'feedback' => 'Todavía no. Empieza con «' . $inicial . '» y tiene ' . $largo . ' caracteres. Vuelve a intentarlo.',
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    echo json_encode(['correcto' => false, 'feedback' => 'No pudimos revisar la respuesta. Intenta de nuevo.'], JSON_UNESCAPED_UNICODE);
}
