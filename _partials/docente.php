<?php
/**
 * NeuroLab — _partials/docente.php
 * Modo docente: permite autocompletar actividades para revisar la guía o hacer demostraciones.
 * Se activa una vez por navegador abriendo docente.php?clave=<clave> (cookie del servidor).
 * La clave está en data/docente.php (no va a git; ver data/docente.ejemplo.php).
 */
function nl_docente_clave() {
    $f = __DIR__ . '/../data/docente.php';
    if (!is_file($f)) return '';
    $c = include $f;
    return is_array($c) ? trim((string)($c['clave'] ?? '')) : '';
}

function nl_docente_token($clave) {
    return hash_hmac('sha256', 'neurolab-modo-docente', $clave);
}

function nl_es_docente() {
    $c = nl_docente_clave();
    return $c !== '' && isset($_COOKIE['nl_docente'])
        && hash_equals(nl_docente_token($c), (string)$_COOKIE['nl_docente']);
}

/** Script del modo docente (sólo si está activo). */
function nl_docente_script() {
    if (!nl_es_docente()) return '';
    $f = __DIR__ . '/../js/docente.js';
    return '<script type="module" src="js/docente.js?v=' . (is_file($f) ? filemtime($f) : 1) . '"></script>';
}
