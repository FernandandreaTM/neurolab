<?php
/**
 * NeuroLab — _partials/carreras.php
 * Carreras activas (tabla carreras, activo = 1). Se administran en admin/carreras.php, sin tocar código.
 * Con una sola carrera activa no se muestra el switch; con dos o más aparece en la barra.
 * Los textos marcados con data-carrera="<slug>" se ocultan si no son de la carrera elegida
 * (data-carrera="comun" se muestra siempre).
 */
require_once __DIR__ . '/../api/db.php';

/** [slug => ['nombre' => …, 'sigla' => …, 'asignatura' => …]] en orden. */
function nl_carreras() {
    static $out = null;
    if ($out !== null) return $out;
    $out = [];
    try {
        $rows = get_db()->query("SELECT slug, nombre, COALESCE(sigla, '') AS sigla, asignatura_codigo
                                 FROM carreras WHERE activo = 1 ORDER BY COALESCE(orden, id), id")->fetchAll();
        foreach ($rows as $r) {
            $out[$r['slug']] = ['nombre' => $r['nombre'], 'sigla' => $r['sigla'] !== '' ? $r['sigla'] : $r['nombre'],
                                'asignatura' => $r['asignatura_codigo']];
        }
    } catch (Throwable $e) { $out = []; }
    if (!$out) $out = ['general' => ['nombre' => 'General', 'sigla' => 'General', 'asignatura' => '']];
    return $out;
}

/** Datos para js/carrera.js + carrera inicial pintada antes de cargar la página (sin parpadeo). */
function nl_carreras_script() {
    static $hecho = false;
    if ($hecho) return '';
    $hecho = true;
    $c = nl_carreras();
    $js = json_encode(array_map(function ($x) { return ['n' => $x['nombre'], 's' => $x['sigla']]; }, $c), JSON_UNESCAPED_UNICODE);
    return "<script>window.NL_CARRERAS = $js; (function () {\n"
         . "  var c = null, l = Object.keys(window.NL_CARRERAS); try { c = localStorage.getItem('nl_carrera'); } catch (e) {}\n"
         . "  if (!window.NL_CARRERAS[c]) c = l[0];\n"
         . "  document.documentElement.dataset.carrera = c;\n"
         . "  var s = document.createElement('style'); s.id = 'nl-carrera-css';\n"
         . "  s.textContent = '[data-carrera]:not(html):not([data-carrera=\"comun\"]):not([data-carrera=\"' + c + '\"]){display:none!important}';\n"
         . "  document.head.appendChild(s);\n"
         . "})();</script>";
}

/** Switch de carrera (sólo si hay 2 o más activas). */
function nl_carreras_switch() {
    $c = nl_carreras();
    if (count($c) < 2) return '';
    $h = '<div class="nl-carrera" role="radiogroup" aria-label="Tu carrera">';
    foreach ($c as $slug => $x) {
        $h .= '<button type="button" role="radio" class="nl-carrera__op" data-carrera-btn="' . htmlspecialchars($slug)
            . '" title="' . htmlspecialchars($x['nombre']) . '">' . htmlspecialchars($x['sigla']) . '</button>';
    }
    return $h . '</div>';
}
