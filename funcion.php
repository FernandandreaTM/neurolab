<?php
/**
 * NeuroLab — funcion.php
 * Atlas de Función: la fisiología del sistema nervioso.
 *
 * Para dejar aquí solo algunos temas, reemplaza 'temas' => null por la lista
 * de slugs, p. ej.: 'temas' => ['potencial-accion', 'sinapsis'].
 * Con null se muestran todos los temas.
 */
error_reporting(0);
$active_page = 'funcion';

$ATLAS = [
    'area'    => 'funcion',
    'nombre'  => 'Función',
    'icono'   => '⚡',
    'titulo'  => 'La fisiología del sistema nervioso',
    'bajada'  => 'Cómo se genera y se transmite la señal nerviosa, qué ocurre en la sinapsis y cómo se traduce en respuesta sensitiva y motora.',
    'temas'   => null,
    'hermano' => ['url' => 'morfologia.php', 'nombre' => 'Morfología', 'icono' => '🔬'],
];
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Atlas de Función — NeuroLab</title>
<meta name="description" content="Atlas de función del sistema nervioso: potencial de acción, sinapsis y vías sensitivas y motoras, con simuladores, comparadores y quices.">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/nav.css">
<link rel="stylesheet" href="css/atlas.css">
<link rel="stylesheet" href="css/mapa.css">
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
</head>
<body data-area="funcion">
<div class="bg-mesh"></div>
<?php include '_partials/nav.php'; ?>
<?php include '_partials/atlas-body.php'; ?>
<?php include '_partials/footer.php'; ?>
</body>
</html>
