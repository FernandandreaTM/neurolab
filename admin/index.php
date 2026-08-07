<?php $active_page = 'admin'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Admin — NeuroLab</title>
<link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/nav.css">
<style>
.nl-admin-wrap { padding: 7rem 0 3rem; max-width: 800px; margin: 0 auto; }
.nl-admin-card {
    background: var(--navy-mid);
    border: 1px solid var(--gray-700);
    border-radius: var(--radius);
    padding: 1.25rem 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}
.nl-admin-card h3 { font-size: 1.1rem; margin: 0; }
.nl-admin-card p { font-size: .85rem; color: var(--gray-300); margin: .25rem 0 0; }
</style>
</head>
<body>
<div class="bg-mesh"></div>
<?php include __DIR__ . '/../_partials/nav.php'; ?>

<div class="container nl-admin-wrap">
    <span class="label">Panel de administración</span>
    <h1 class="mt-2">NeuroLab Admin</h1>
    <p>Primera versión — los CRUDs detallados llegan en Fase 3.</p>

    <div class="nl-admin-card">
        <div>
            <h3>🛠 Migración</h3>
            <p>Crea la base de datos SQLite desde schema.sql. Idempotente.</p>
        </div>
        <a href="migrate.php" class="btn btn-primary btn-sm">Ejecutar migrate.php →</a>
    </div>

    <div class="nl-admin-card">
        <div>
            <h3>🌱 Seed (datos demo)</h3>
            <p>Puebla con 2 carreras, 5 topics del tronco común y 5 actividades (uno de cada tipo).</p>
        </div>
        <a href="seed.php" class="btn btn-pink btn-sm">Ejecutar seed.php →</a>
    </div>

    <div class="nl-admin-card">
        <div>
            <h3>📋 Estado de la BD</h3>
            <p>
            <?php
            $db = __DIR__ . '/../data/neurolab.db';
            if (file_exists($db)) {
                echo "DB existe · " . filesize($db) . " bytes · " . date('Y-m-d H:i', filemtime($db));
            } else {
                echo "DB aún no creada.";
            }
            ?>
            </p>
        </div>
        <a href="../api/topics.php" class="btn btn-ghost btn-sm">Ver JSON topics →</a>
    </div>

    <p class="text-muted text-sm mt-4">Próximas herramientas: CRUD actividades, CRUD quices (con importador Aiken), CRUD carreras, gestión de recursos.</p>
</div>

<?php include __DIR__ . '/../_partials/footer.php'; ?>
</body>
</html>
