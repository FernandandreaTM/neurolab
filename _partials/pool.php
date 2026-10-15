<?php
/**
 * NeuroLab — _partials/pool.php
 * Estados y enfoques del pool de actividades, y la revisión guardada en data/revision.json.
 * data/revision.json = { "<slug>": { "estado": "...", "nota": "...", "fecha": "..." } }
 * Lo escribe api/estado.php (modo docente) y admin/seed.php lo vuelve a aplicar tras poblar la BD,
 * así un seed no borra lo que ya se revisó.
 */

/** true: los estudiantes sólo ven actividades "funcionando" (el modo docente ve todo). */
const NL_SOLO_FUNCIONANDO = false;

const NL_ESTADOS = [
    'en_desarrollo' => ['nombre' => 'En desarrollo', 'icono' => '🛠️', 'desc' => 'Idea o borrador: falta contenido o herramienta.'],
    'en_revision'   => ['nombre' => 'En revisión',   'icono' => '👀', 'desc' => 'Funciona; espera revisión de contenidos.'],
    'visado'        => ['nombre' => 'Visado',        'icono' => '✅', 'desc' => 'Contenido aprobado; falta publicar o ajustar detalles.'],
    'funcionando'   => ['nombre' => 'Funcionando',   'icono' => '🟢', 'desc' => 'Lista para usar con estudiantes.'],
];

/** Enfoques de una actividad (en NeuroLab sólo «general»; no se muestran en el sitio). */
const NL_ENFOQUES = [
    'general' => ['nombre' => 'General', 'icono' => '🧠'],
];

/** Herramientas propias que resolverían una actividad del pool: [clave => nombre]. */
const NL_HERRAMIENTAS = [];

function nl_herramienta($k) {
    return array_key_exists((string)$k, NL_HERRAMIENTAS) ? NL_HERRAMIENTAS[$k] : (string)$k;
}

function nl_revision_path() { return __DIR__ . '/../data/revision.json'; }

function nl_revision_leer() {
    $f = nl_revision_path();
    if (!is_file($f)) return [];
    $d = json_decode((string)file_get_contents($f), true);
    return is_array($d) ? $d : [];
}

function nl_revision_guardar(array $d) {
    ksort($d);
    return file_put_contents(nl_revision_path(), json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n", LOCK_EX) !== false;
}

/** Aplica data/revision.json a la BD (estado y nota de cada actividad). Devuelve cuántas aplicó. */
function nl_revision_aplicar(PDO $pdo) {
    $n = 0;
    $st = $pdo->prepare("UPDATE actividades SET estado = ?, notas = ? WHERE slug = ?");
    foreach (nl_revision_leer() as $slug => $r) {
        $estado = isset($r['estado']) && array_key_exists($r['estado'], NL_ESTADOS) ? $r['estado'] : null;
        if (!$estado) continue;
        $st->execute([$estado, (string)($r['nota'] ?? ''), $slug]);
        $n += $st->rowCount();
    }
    return $n;
}

/** Etiqueta HTML del estado. */
function nl_badge_estado($estado) {
    $k = array_key_exists((string)$estado, NL_ESTADOS) ? $estado : 'en_desarrollo';
    $e = NL_ESTADOS[$k];
    return '<span class="nl-estado nl-estado--' . $k . '" title="' . htmlspecialchars($e['desc']) . '">'
         . $e['icono'] . ' ' . htmlspecialchars($e['nombre']) . '</span>';
}

function nl_badge_enfoque($enfoque) {
    $k = array_key_exists((string)$enfoque, NL_ENFOQUES) ? $enfoque : 'general';
    $e = NL_ENFOQUES[$k];
    return '<span class="nl-enfoque nl-enfoque--' . $k . '">' . $e['icono'] . ' ' . htmlspecialchars($e['nombre']) . '</span>';
}
