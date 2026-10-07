<?php
/**
 * NeuroLab — api/autocompletar.php  (sólo modo docente)
 * Entrega las respuestas de un nivel para que js/docente.js lo deje completo.
 *   GET tipo=labeling&slug=<actividad>  -> { partes: [{ id, n, f, d }] }
 *   GET tipo=practica&nivel=<id>        -> { tipo: 'armar'|'elegir', items: { <id>: estado } }
 * La lámina y el quiz se completan en el navegador con los datos de la página.
 */
error_reporting(0);
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/practica_lib.php';
require_once __DIR__ . '/../_partials/docente.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function nl_ac_json($d, $code = 200) {
    http_response_code($code);
    echo json_encode($d, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!nl_es_docente()) nl_ac_json(['ok' => false, 'error' => 'Sólo en modo docente.'], 403);

try {
    $pdo  = get_db();
    $tipo = (string)($_GET['tipo'] ?? '');

    if ($tipo === 'labeling') {
        $st = $pdo->prepare("SELECT p.id, p.nombre, p.funcion, p.descripcion FROM labeling_parts p
                             JOIN actividades a ON a.id = p.actividad_id WHERE a.slug = ? ORDER BY p.orden, p.id");
        $st->execute([(string)($_GET['slug'] ?? '')]);
        $partes = array_map(function ($p) {
            $f = (string)($p['funcion'] ?: $p['descripcion']);
            return ['id' => (int)$p['id'], 'n' => $p['nombre'], 'f' => $f, 'd' => (string)$p['descripcion']];
        }, $st->fetchAll());
        nl_ac_json(['ok' => true, 'partes' => $partes]);
    }

    if ($tipo === 'practica') {
        $sn = $pdo->prepare("SELECT id, tipo FROM practica_niveles WHERE id = ?");
        $sn->execute([(int)($_GET['nivel'] ?? 0)]);
        $nivel = $sn->fetch();
        if (!$nivel) nl_ac_json(['ok' => false, 'error' => 'Nivel no encontrado.'], 404);
        $si = $pdo->prepare("SELECT id, respuesta, explicacion, celda, nota FROM practica_items WHERE nivel_id = ? ORDER BY orden, id");
        $si->execute([(int)$nivel['id']]);
        $items = [];
        foreach ($si->fetchAll() as $it) {
            if ($nivel['tipo'] === 'armar') {
                $t = nl_prac_normaliza_tipo($it['respuesta']);
                $m = nl_prac_modelo($t);
                if (!$m) continue;
                list(, $fexp) = nl_prac_evalua_flecha($t, $m[0], $m[1]);
                $items[$it['id']] = ['r' => $it['respuesta'], 'piezas' => $m[0], 'exp' => (string)$it['explicacion'],
                                     'nota' => (string)$it['nota'], 'flecha' => $m[1], 'fexp' => $fexp, 'e' => 0];
            } else {
                $items[$it['id']] = ['r' => $it['respuesta'], 'celda' => (string)$it['celda'],
                                     'exp' => (string)$it['explicacion'], 'e' => 0];
            }
        }
        nl_ac_json(['ok' => true, 'tipo' => $nivel['tipo'], 'items' => $items]);
    }

    nl_ac_json(['ok' => false, 'error' => 'Tipo no reconocido.'], 400);
} catch (Throwable $e) {
    nl_ac_json(['ok' => false, 'error' => 'Error del servidor.'], 500);
}

/** "Pseudounipolar" -> "pseudounipolar" (sin tildes). */
function nl_prac_normaliza_tipo($t) {
    return strtolower(strtr(trim((string)$t), ['á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','Á'=>'a','É'=>'e','Í'=>'i','Ó'=>'o','Ú'=>'u']));
}
