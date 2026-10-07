<?php
/**
 * NeuroLab — api/practica_check.php
 * Revisa una respuesta de la práctica por niveles (tabla practica_items).
 *
 * La comprobación se hace acá para que las respuestas no queden escritas
 * en el HTML de la página.
 *
 * Nivel "completar":  POST item_id, respuesta      (texto escrito)
 * Nivel "armar":      POST item_id, construccion   (JSON de 8 posiciones alrededor
 *                     del soma: null | "dendrita" | "axon" | "t", en orden horario
 *                     partiendo desde la derecha)
 * ->   { "correcto": true,  "respuesta": "Bipolar", "feedback": "...", "celda": "...", "nota": "..." }
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

/**
 * Nivel "armar": revisa si las prolongaciones puestas alrededor del soma
 * corresponden al tipo pedido. Devuelve [ok, mensaje-si-no].
 * Reglas (texto de la actividad):
 *   bipolar        -> 2 neuritas en polos opuestos: 1 dendrita y 1 axón
 *   pseudounipolar -> 1 sola neurita que se bifurca en T
 *   multipolar     -> 1 único axón y múltiples dendritas (2 o más)
 */
function nl_prac_evalua_armado($tipo, $piezas) {
    $n = ['dendrita' => 0, 'axon' => 0, 't' => 0];
    $pos = ['dendrita' => [], 'axon' => []];
    foreach ($piezas as $i => $p) {
        if (isset($n[$p])) {
            $n[$p]++;
            if (isset($pos[$p])) $pos[$p][] = $i;
        }
    }
    $total = $n['dendrita'] + $n['axon'] + $n['t'];
    if ($total === 0) return [false, 'Agrega prolongaciones alrededor del soma.'];

    if ($tipo === 'bipolar') {
        if ($n['t'] > 0)        return [false, 'La neurona bipolar no tiene una neurita que se bifurque en T: sus dos prolongaciones son independientes.'];
        if ($n['axon'] === 0)   return [false, 'Le falta la prolongación que transmite la información: el axón.'];
        if ($n['axon'] > 1)     return [false, 'Una neurona tiene un solo axón.'];
        if ($n['dendrita'] === 0) return [false, 'Le falta la prolongación que recibe la información: la dendrita.'];
        if ($n['dendrita'] > 1) return [false, 'Tiene exactamente dos neuritas: sobran dendritas.'];
        $dif = abs($pos['dendrita'][0] - $pos['axon'][0]);
        if ($dif !== 4)         return [false, 'Las dos neuritas deben nacer de polos opuestos del soma.'];
        return [true, ''];
    }

    if ($tipo === 'pseudounipolar') {
        if ($n['t'] === 0)      return [false, 'Del soma de esta neurona sale una sola prolongación, que luego se divide en forma de «T».'];
        if ($n['t'] > 1)        return [false, 'Tiene una sola neurita que se bifurca, no varias.'];
        if ($total > 1)         return [false, 'Del soma sale solo esa neurita en T: quita las demás prolongaciones.'];
        return [true, ''];
    }

    if ($tipo === 'multipolar') {
        if ($n['t'] > 0)        return [false, 'La neurona multipolar no tiene neuritas en T.'];
        if ($n['axon'] === 0)   return [false, 'Le falta el axón.'];
        if ($n['axon'] > 1)     return [false, 'Tiene un único axón.'];
        if ($n['dendrita'] < 2) return [false, 'Necesita múltiples dendritas que nazcan de distintos puntos del soma.'];
        return [true, ''];
    }

    return [false, 'Este tipo de neurona todavía no se puede armar.'];
}

function nl_prac_json($datos) {
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

$itemId    = isset($_POST['item_id'])   ? (int)$_POST['item_id'] : 0;
$respuesta = isset($_POST['respuesta']) ? (string)$_POST['respuesta'] : '';

if ($itemId <= 0) {
    nl_prac_json(['correcto' => false, 'feedback' => 'Falta indicar el ejercicio.']);
}

try {
    $pdo = get_db();
    $st  = $pdo->prepare("
        SELECT i.id, i.nivel_id, i.respuesta, i.sinonimos, i.pista, i.explicacion, i.celda, i.nota, n.tipo AS nivel_tipo
        FROM practica_items i
        JOIN practica_niveles n ON n.id = i.nivel_id
        WHERE i.id = ? AND n.activo = 1
    ");
    $st->execute([$itemId]);
    $item = $st->fetch();

    if (!$item) {
        nl_prac_json(['correcto' => false, 'feedback' => 'No encontramos ese ejercicio.']);
    }

    // --- Nivel "armar": se revisa la neurona construida ---
    if ($item['nivel_tipo'] === 'armar') {
        $piezas = json_decode(isset($_POST['construccion']) ? (string)$_POST['construccion'] : '', true);
        if (!is_array($piezas) || count($piezas) !== 8) {
            nl_prac_json(['correcto' => false, 'feedback' => 'No pudimos leer tu neurona. Intenta de nuevo.']);
        }
        $piezas = array_values(array_map(function ($p) {
            return in_array($p, ['dendrita', 'axon', 't'], true) ? $p : null;
        }, $piezas));

        list($ok, $msg) = nl_prac_evalua_armado(nl_prac_normaliza($item['respuesta']), $piezas);
        if ($ok) {
            nl_prac_json([
                'correcto'  => true,
                'respuesta' => $item['respuesta'],
                'feedback'  => $item['explicacion'] ? $item['explicacion'] : '¡Correcto!',
                'celda'     => (string)$item['celda'],
                'nota'      => (string)$item['nota'],
            ]);
        }
        nl_prac_json([
            'correcto' => false,
            'feedback' => 'Todavía no. ' . $msg . ($item['pista'] ? ' Pista: ' . $item['pista'] : ''),
        ]);
    }

    // --- Nivel "completar": se revisa el texto escrito ---
    $limpia = nl_prac_normaliza($respuesta);
    if ($limpia === '') {
        nl_prac_json(['correcto' => false, 'feedback' => 'Escribe tu respuesta antes de revisar.']);
    }

    if (nl_prac_calza($limpia, nl_prac_validas($item))) {
        nl_prac_json([
            'correcto'  => true,
            'respuesta' => $item['respuesta'],
            'feedback'  => $item['explicacion'] ? $item['explicacion'] : '¡Correcto!',
            'celda'     => (string)$item['celda'],
            'nota'      => (string)$item['nota'],
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
