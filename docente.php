<?php
/**
 * NeuroLab — docente.php
 * Activa (docente.php?clave=…) o desactiva (docente.php?salir=1) el modo docente en este navegador.
 * Con el modo activo aparece «⚡ Autocompletar» en cada nivel y «Completar todo» en la ruta del práctico.
 */
error_reporting(0);
require_once __DIR__ . '/_partials/docente.php';

$clave  = nl_docente_clave();
$camino = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\') . '/';
$opc    = ['expires' => time() + 180 * 86400, 'path' => $camino, 'httponly' => true, 'samesite' => 'Lax',
           'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'];
$msg = '';
if (isset($_GET['salir'])) {
    setcookie('nl_docente', '', array_merge($opc, ['expires' => time() - 3600]));
    $activo = false;
    $msg = 'Modo docente desactivado en este navegador.';
} elseif (isset($_GET['clave'])) {
    if ($clave !== '' && hash_equals($clave, (string)$_GET['clave'])) {
        setcookie('nl_docente', nl_docente_token($clave), $opc);
        $activo = true;
        $msg = 'Modo docente activado en este navegador (180 días).';
    } else {
        usleep(800000);   // frena intentos al azar
        $activo = false;
        $msg = $clave === '' ? 'Falta el archivo data/docente.php en el servidor.' : 'Clave incorrecta.';
    }
} else {
    $activo = nl_es_docente();
}
$rutas = @include __DIR__ . '/data/practicos.php';
$ruta1 = is_array($rutas) ? (string)array_key_first($rutas) : '';
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Modo docente — NeuroLab</title>
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="css/base.css">
<style>
.nl-doc { max-width: 560px; margin: 12vh auto; padding: 1.6rem; border-radius: 16px; background: var(--navy-mid); border: 1px solid rgba(167,139,250,.35); }
.nl-doc h1 { margin: 0 0 .6rem; font-size: 1.4rem; }
.nl-doc p { margin: .5rem 0; }
.nl-doc__estado { font-weight: 800; color: #FCD34D; }
.nl-doc__acc { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; }
</style>
</head>
<body>
<div class="bg-mesh"></div>
<main class="nl-doc">
    <h1>⚡ Modo docente</h1>
    <?php if ($msg): ?><p class="nl-doc__estado"><?= htmlspecialchars($msg) ?></p><?php endif; ?>
    <?php if ($activo): ?>
        <p>En cada nivel verás el botón <strong>⚡ Autocompletar</strong> (abajo a la izquierda) y en la ruta del práctico <strong>Completar todo</strong> y <strong>Reiniciar</strong>. Sólo funciona en este navegador.</p>
        <div class="nl-doc__acc">
            <?php if ($ruta1 !== ''): ?><a class="btn btn-primary btn-sm" href="practico.php?p=<?= rawurlencode($ruta1) ?>">Ir a la ruta del práctico →</a><?php endif; ?>
            <a class="btn btn-ghost btn-sm" href="docente.php?salir=1">Desactivar</a>
        </div>
    <?php else: ?>
        <p>El modo docente no está activo en este navegador.</p>
    <?php endif; ?>
</main>
</body>
</html>
