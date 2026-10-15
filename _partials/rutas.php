<?php
/**
 * NeuroLab — _partials/rutas.php
 * Carga una ruta de data/practicos.php y le agrega el estado de cada actividad
 * (título y si está activa en la BD). Lo usan practico.php y guia.php.
 */
require_once __DIR__ . '/../api/db.php';

function nl_cargar_ruta($clave) {
    if ($clave === '' && isset($_GET['armar'])) {
        $ruta = nl_ruta_armada((string)$_GET['armar']);
        if (!$ruta) return null;
    } else {
        $rutas = require __DIR__ . '/../data/practicos.php';
        if (!isset($rutas[$clave])) return null;
        $ruta = $rutas[$clave];
    }
    try {
        $st = get_db()->prepare("SELECT titulo, activo, estado FROM actividades WHERE slug = ?");
        foreach ($ruta['pasos'] as $k => $p) {
            $st->execute([$p['slug']]);
            $a = $st->fetch();
            $ruta['pasos'][$k]['act_titulo'] = $a ? $a['titulo'] : '';
            $ruta['pasos'][$k]['activo']     = $a && (int)$a['activo'] === 1;
            $ruta['pasos'][$k]['estado']     = $a ? (string)$a['estado'] : 'en_desarrollo';
        }
    } catch (Throwable $e) {
        foreach ($ruta['pasos'] as $k => $p) { $ruta['pasos'][$k]['activo'] = true; $ruta['pasos'][$k]['act_titulo'] = ''; }
    }
    return $ruta;
}

/**
 * Secciones de "Mi guía" que produce una actividad según su motor:
 * identificación -> slug · práctica por niveles -> slug:N · quiz -> slug · otras -> ninguna.
 */
function nl_guia_por_defecto($slug) {
    try {
        $pdo = get_db();
        $st = $pdo->prepare("SELECT id, titulo, tipo FROM actividades WHERE slug = ?");
        $st->execute([$slug]);
        $a = $st->fetch();
        if (!$a) return [];
        $n = $pdo->prepare("SELECT COUNT(*) FROM labeling_parts WHERE actividad_id = ?");
        $n->execute([$a['id']]);
        if ($a['tipo'] === 'labeling' && $n->fetchColumn()) return [$slug => $a['titulo']];
        $q = $pdo->prepare("SELECT COUNT(*) FROM quices WHERE actividad_id = ? AND activo = 1");
        $q->execute([$a['id']]);
        if ($a['tipo'] === 'quiz' && $q->fetchColumn()) return [$slug => $a['titulo']];
        $nv = $pdo->prepare("SELECT n.numero, n.titulo FROM practica_niveles n WHERE n.actividad_id = ? AND n.activo = 1
                             AND EXISTS (SELECT 1 FROM practica_items i WHERE i.nivel_id = n.id) ORDER BY n.numero");
        $nv->execute([$a['id']]);
        $out = [];
        foreach ($nv->fetchAll() as $r) $out[$slug . ':' . $r['numero']] = 'Nivel ' . $r['numero'] . ': ' . $r['titulo'];
        return $out;
    } catch (Throwable $e) { return []; }
}

/** Práctico armado al vuelo desde pool.php: practico.php?armar=slug1,slug2,… (vista previa, sin editar archivos). */
function nl_ruta_armada($lista) {
    $slugs = array_values(array_filter(array_map(function ($s) { return preg_replace('/[^a-z0-9-]/', '', $s); }, explode(',', $lista))));
    if (!$slugs) return null;
    $pasos = [];
    try {
        $st = get_db()->prepare("SELECT slug, titulo, mecanica FROM actividades WHERE slug = ?");
        foreach (array_slice($slugs, 0, 20) as $s) {
            $st->execute([$s]);
            $a = $st->fetch();
            if (!$a) continue;
            $pasos[] = ['slug' => $a['slug'], 'titulo' => $a['titulo'], 'tarea' => (string)$a['mecanica'], 'guia' => nl_guia_por_defecto($a['slug'])];
        }
    } catch (Throwable $e) { return null; }
    if (!$pasos) return null;
    return ['titulo' => 'Práctico en preparación', 'asignatura' => 'Vista previa · armado desde el pool',
            'objetivo' => 'Revisar la secuencia de actividades antes de publicarla en data/practicos.php.',
            'intro' => 'Este práctico se armó desde el pool de actividades. Si te sirve, copia el bloque generado en pool.php a data/practicos.php.',
            'pasos' => $pasos, 'armado' => implode(',', array_column($pasos, 'slug'))];
}

/** Parámetro de URL que identifica la ruta: p=<clave> o armar=<slugs>. */
function nl_ruta_param($clave, $ruta) {
    if ($clave !== '') return 'p=' . rawurlencode($clave);
    return !empty($ruta['armado']) ? 'armar=' . rawurlencode($ruta['armado']) : '';
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
