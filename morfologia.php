<?php
/**
 * NeuroLab — morfologia.php
 * Atlas de Morfología: la estructura del sistema nervioso.
 *
 * Para dejar aquí solo algunos temas, reemplaza 'temas' => null por la lista
 * de slugs, p. ej.: 'temas' => ['celulas-sn', 'neurona'].
 * Con null se muestran todos los temas.
 */
error_reporting(0);
$active_page = 'morfologia';

$ATLAS = [
    'area'    => 'morfologia',
    'nombre'  => 'Morfología',
    'icono'   => '🔬',
    'titulo'  => 'La estructura del sistema nervioso',
    'bajada'  => 'Qué forma tienen las células y las estructuras nerviosas, cómo se reconocen al microscopio y en qué se diferencian entre sí.',
    'temas'   => null,
    'hermano' => ['url' => 'funcion.php', 'nombre' => 'Función', 'icono' => '⚡'],
];
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Atlas de Morfología — NeuroLab</title>
<meta name="description" content="Atlas de morfología del sistema nervioso: estructura de las células nerviosas y de las vías, con láminas virtuales, identificación de partes y quices.">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/nav.css">
<link rel="stylesheet" href="css/atlas.css">
<link rel="stylesheet" href="css/mapa.css">
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
</head>
<body data-area="morfologia">
<div class="bg-mesh"></div>
<?php include '_partials/nav.php'; ?>
<?php include '_partials/atlas-body.php'; ?>
<?php include '_partials/footer.php'; ?>
</body>
</html>
