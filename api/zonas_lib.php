<?php
/**
 * NeuroLab — api/zonas_lib.php
 * Zonas de una imagen encajada en un molde (coordenadas 0-100 del marco cuadrado, js/molde.js).
 * Una zona es { "e": [[cx, cy, rx, ry], …], "r": [[x, y, w, h], …], "p": [[[x, y], …], …], "no": {zona} }:
 * el punto es correcto si cae dentro de alguna elipse, rectángulo o polígono, y no dentro de «no».
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

/** ¿El punto (x, y) cae dentro del polígono [[x, y], …]? (regla par-impar) */
function nl_poligono_contiene($pts, $x, $y) {
    $dentro = false;
    $n = count($pts);
    for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
        list($xi, $yi) = $pts[$i]; list($xj, $yj) = $pts[$j];
        if ((($yi > $y) !== ($yj > $y)) && ($x < ($xj - $xi) * ($y - $yi) / (($yj - $yi) ?: 1e-9) + $xi)) $dentro = !$dentro;
    }
    return $dentro;
}

/** ¿El punto (x, y) cae en la zona? */
function nl_zona_contiene($zona, $x, $y) {
    if (!empty($zona['no']) && nl_zona_contiene($zona['no'], $x, $y)) return false;
    foreach ((array)($zona['p'] ?? []) as $pol) {
        if (nl_poligono_contiene($pol, $x, $y)) return true;
    }
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
    if (!empty($zona['p'][0])) {   // un punto interior del primer polígono (centro de la caja, o un vértice corrido al centro)
        $pol = $zona['p'][0]; $xs = array_column($pol, 0); $ys = array_column($pol, 1);
        $c = [(min($xs) + max($xs)) / 2, (min($ys) + max($ys)) / 2];
        if (nl_zona_contiene($zona, $c[0], $c[1])) return $c;
        foreach ($pol as $v) { $q = [$v[0] * 0.8 + $c[0] * 0.2, $v[1] * 0.8 + $c[1] * 0.2]; if (nl_zona_contiene($zona, $q[0], $q[1])) return $q; }
        return $c;
    }
    return [50, 50];
}
