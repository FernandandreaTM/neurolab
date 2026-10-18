<?php
/**
 * NeuroLab — api/zonas_lib.php
 * Zonas de una imagen encajada en un molde (coordenadas 0-100 del marco cuadrado, js/molde.js).
 * Una zona es { "e": [[cx, cy, rx, ry], …], "r": [[x, y, w, h], …], "pista": "…" }: el punto
 * es correcto si cae dentro de alguna elipse o rectángulo.
 */
require_once __DIR__ . '/db.php';

/** Nivel n (de cualquier tipo) del recurso «tareas» de la actividad slug, o null. */
function nl_tareas_nivel($slug, $n) {
    $st = get_db()->prepare("SELECT r.url FROM actividad_recursos r JOIN actividades a ON a.id = r.actividad_id
                             WHERE a.slug = ? AND r.tipo = 'tareas' LIMIT 1");
    $st->execute([(string)$slug]);
    $t = json_decode((string)$st->fetchColumn(), true);
    foreach ((array)($t['niveles'] ?? []) as $nv) {
        if ((int)($nv['n'] ?? 0) === (int)$n) return $nv;
    }
    return null;
}

/** ¿El punto (x, y) cae en la zona? */
function nl_zona_contiene($zona, $x, $y) {
    foreach ((array)($zona['e'] ?? []) as $e) {
        list($cx, $cy, $rx, $ry) = $e;
        if ((($x - $cx) / $rx) ** 2 + (($y - $cy) / $ry) ** 2 <= 1) return true;
    }
    foreach ((array)($zona['r'] ?? []) as $r) {
        list($rx, $ry, $w, $h) = $r;
        if ($x >= $rx && $x <= $rx + $w && $y >= $ry && $y <= $ry + $h) return true;
    }
    return false;
}

/** Centro de la primera forma de la zona (para el modo docente). */
function nl_zona_centro($zona) {
    if (!empty($zona['e'][0])) return [$zona['e'][0][0], $zona['e'][0][1]];
    if (!empty($zona['r'][0])) { $r = $zona['r'][0]; return [$r[0] + $r[2] / 2, $r[1] + $r[3] / 2]; }
    return [50, 50];
}
