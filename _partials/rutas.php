<?php
/**
 * NeuroLab — _partials/rutas.php
 * Carga una ruta de data/practicos.php y le agrega el estado de cada actividad
 * (título y si está activa en la BD). Lo usan practico.php y guia.php.
 */
require_once __DIR__ . '/../api/db.php';

function nl_cargar_ruta($clave) {
    $rutas = require __DIR__ . '/../data/practicos.php';
    if (!isset($rutas[$clave])) return null;
    $ruta = $rutas[$clave];
    try {
        $st = get_db()->prepare("SELECT titulo, activo FROM actividades WHERE slug = ?");
        foreach ($ruta['pasos'] as $k => $p) {
            $st->execute([$p['slug']]);
            $a = $st->fetch();
            $ruta['pasos'][$k]['act_titulo'] = $a ? $a['titulo'] : '';
            $ruta['pasos'][$k]['activo']     = $a && (int)$a['activo'] === 1;
        }
    } catch (Throwable $e) {
        foreach ($ruta['pasos'] as $k => $p) { $ruta['pasos'][$k]['activo'] = true; $ruta['pasos'][$k]['act_titulo'] = ''; }
    }
    return $ruta;
}

/** Secciones de la guía en el orden de la ruta: [{clave, nombre, slug, paso, activo}] */
function nl_secciones_ruta($ruta) {
    $out = [];
    foreach ($ruta['pasos'] as $i => $p) {
        foreach (($p['guia'] ?? []) as $clave => $nombre) {
            $out[] = ['clave' => $clave, 'nombre' => $nombre, 'slug' => $p['slug'],
                      'paso' => $i + 1, 'paso_titulo' => $p['titulo'], 'activo' => $p['activo']];
        }
    }
    return $out;
}

function nl_v($rel) {
    $f = __DIR__ . '/../' . $rel;
    return is_file($f) ? filemtime($f) : '1';
}
