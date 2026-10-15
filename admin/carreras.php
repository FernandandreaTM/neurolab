<?php
/**
 * NeuroLab — admin/carreras.php
 * Activa/desactiva carreras y edita su sigla y orden (modo docente). Con una sola carrera activa
 * no hay switch; con dos o más aparece en la barra de las actividades.
 * Ojo: admin/seed.php vuelve a los valores de data/seed.sql; para que un cambio sea permanente,
 * cámbialo también allí.
 */
error_reporting(0);
require_once __DIR__ . '/../api/db.php';
require_once __DIR__ . '/../_partials/docente.php';

$docente = nl_es_docente();
$msg = '';
$pdo = get_db();
if ($docente && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $st = $pdo->prepare("UPDATE carreras SET activo = ?, sigla = ?, orden = ? WHERE id = ?");
    foreach ((array)($_POST['c'] ?? []) as $id => $c) {
        $st->execute([!empty($c['activo']) ? 1 : 0, substr(trim((string)($c['sigla'] ?? '')), 0, 12), (int)($c['orden'] ?? 0), (int)$id]);
    }
    $msg = 'Cambios guardados.';
}
$carreras = $pdo->query("SELECT * FROM carreras ORDER BY orden, id")->fetchAll();
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Carreras — NeuroLab Admin</title>
<link rel="icon" href="../img/favicon.ico" sizes="any">
<link rel="stylesheet" href="../css/base.css">
<style>
.nl-adm { padding: 3rem 16px; max-width: 860px; margin: 0 auto; }
.nl-adm table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: .9rem; }
.nl-adm th, .nl-adm td { text-align: left; padding: .55rem .5rem; border-bottom: 1px solid var(--gray-700); }
.nl-adm input[type=text], .nl-adm input[type=number] { width: 5.5rem; background: var(--navy-mid); color: var(--gray-100); border: 1px solid var(--gray-700); border-radius: 8px; padding: .3rem .4rem; font: inherit; }
.nl-adm .ok { color: #86EFAC; margin-top: .8rem; }
.nl-adm a { color: var(--violet-light); }
</style>
</head>
<body>
<div class="bg-mesh"></div>
<main class="nl-adm">
    <a href="index.php">← Panel</a>
    <h1 class="mt-2">Carreras</h1>
    <p class="text-muted">Sólo las carreras activas aparecen en el sitio; la primera (menor orden) es la que se usa por defecto.
       Los textos «¿Para qué te sirve?» se escriben por carrera en <code>data/practicos.php</code> y en el panel de cada actividad.</p>
    <?php if (!$docente): ?>
        <p class="mt-2">Para editar activa el <a href="../docente.php">modo docente</a>.</p>
    <?php endif; ?>
    <form method="post">
        <table>
            <thead><tr><th>Activa</th><th>Carrera</th><th>Asignatura</th><th>Sigla</th><th>Orden</th></tr></thead>
            <tbody>
            <?php foreach ($carreras as $c): ?>
                <tr>
                    <td><input type="checkbox" name="c[<?= (int)$c['id'] ?>][activo]" value="1"<?= (int)$c['activo'] ? ' checked' : '' ?><?= $docente ? '' : ' disabled' ?>></td>
                    <td><strong><?= htmlspecialchars($c['nombre']) ?></strong><br><span class="text-muted text-sm"><?= htmlspecialchars((string)$c['descripcion']) ?></span></td>
                    <td><?= htmlspecialchars($c['asignatura_codigo']) ?></td>
                    <td><input type="text" name="c[<?= (int)$c['id'] ?>][sigla]" value="<?= htmlspecialchars((string)$c['sigla']) ?>"<?= $docente ? '' : ' disabled' ?>></td>
                    <td><input type="number" name="c[<?= (int)$c['id'] ?>][orden]" value="<?= (int)$c['orden'] ?>"<?= $docente ? '' : ' disabled' ?>></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
        <?php if ($docente): ?><button class="btn btn-primary btn-sm mt-2" type="submit">Guardar</button><?php endif; ?>
        <?php if ($msg): ?><p class="ok"><?= htmlspecialchars($msg) ?></p><?php endif; ?>
    </form>
    <p class="text-muted text-sm mt-4">Nota: <code>admin/seed.php</code> vuelve a los valores de <code>data/seed.sql</code>. Si un cambio debe quedar fijo, cámbialo también allí.</p>
</main>
</body>
</html>
