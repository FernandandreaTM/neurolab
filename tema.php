<?php
/**
 * NeuroLab — tema.php
 * Página propia de un tema o subtema.
 *
 * URL:  tema.php?slug=celulas-sn   (también acepta ?id=1)
 *
 * Reúne en un solo lugar lo que antes estaba disperso:
 *   · descripción del tema
 *   · mapa conceptual (lo dibuja js/tema.js con el mismo módulo del atlas)
 *   · subtemas
 *   · actividades del tema y de sus subtemas
 *   · quices asociados
 *   · imágenes y recursos (tabla topic_recursos, pensada para ir creciendo)
 */
error_reporting(0);
require_once __DIR__ . '/api/db.php';

$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
$id   = isset($_GET['id'])   ? (int)$_GET['id']    : 0;

if ($slug === '' && $id <= 0) {
    header('Location: atlas.php');
    exit;
}

/* ---------------------------------------------------------------
   Helpers
   --------------------------------------------------------------- */

/** Convierte 1..3999 a número romano (I, II, III, IV…). */
function nl_romano($n) {
    $tabla = [1000=>'M',900=>'CM',500=>'D',400=>'CD',100=>'C',90=>'XC',
              50=>'L',40=>'XL',10=>'X',9=>'IX',5=>'V',4=>'IV',1=>'I'];
    $resto = (int)$n; $out = '';
    if ($resto <= 0) return (string)$n;
    foreach ($tabla as $valor => $letra) {
        while ($resto >= $valor) { $out .= $letra; $resto -= $valor; }
    }
    return $out;
}

/** Numeración tipo índice: I, I.2, I.2.1 — igual que el árbol del atlas. */
function nl_numero_tema(array $todos, $topicId) {
    $porPadre = [];
    foreach ($todos as $t) {
        $p = ($t['parent_id'] === null || $t['parent_id'] === '') ? 0 : (int)$t['parent_id'];
        $porPadre[$p][] = $t;
    }
    foreach ($porPadre as $k => $lista) {
        usort($lista, function ($a, $b) {
            $d = (int)$a['orden'] - (int)$b['orden'];
            return $d !== 0 ? $d : strcmp($a['nombre'], $b['nombre']);
        });
        $porPadre[$k] = $lista;
    }

    // ruta raíz → tema
    $indice = [];
    foreach ($todos as $t) { $indice[(int)$t['id']] = $t; }
    $ruta = [];
    $cur  = isset($indice[(int)$topicId]) ? $indice[(int)$topicId] : null;
    $visto = [];
    while ($cur && !isset($visto[(int)$cur['id']])) {
        $visto[(int)$cur['id']] = true;
        array_unshift($ruta, $cur);
        $pid = ($cur['parent_id'] === null || $cur['parent_id'] === '') ? 0 : (int)$cur['parent_id'];
        $cur = $pid && isset($indice[$pid]) ? $indice[$pid] : null;
    }

    $partes = [];
    foreach ($ruta as $nivel => $nodo) {
        $pid = ($nodo['parent_id'] === null || $nodo['parent_id'] === '') ? 0 : (int)$nodo['parent_id'];
        $hermanos = isset($porPadre[$pid]) ? $porPadre[$pid] : [];
        $pos = 1;
        foreach ($hermanos as $i => $h) {
            if ((int)$h['id'] === (int)$nodo['id']) { $pos = $i + 1; break; }
        }
        $partes[] = $nivel === 0 ? nl_romano($pos) : (string)$pos;
    }
    return implode('.', $partes);
}

function nl_tipo_label($t) {
    $m = [
        'lamina'     => '🔬 Lámina',
        'simulador'  => '🎛️ Simulador',
        'comparador' => '🔄 Comparador',
        'labeling'   => '🏷️ Identificación',
        'quiz'       => '✏️ Quiz',
    ];
    return isset($m[$t]) ? $m[$t] : $t;
}

function nl_tipo_tema_label($t) {
    $m = [
        'estructura' => '🔬 Morfología',
        'proceso'    => '⚡ Función',
        'sensitivo'  => '📡 Sensitivo',
        'motor'      => '⚙️ Motor',
        'lenguaje'   => '🗣️ Lenguaje',
        'tronco'     => '🌳 Tronco común',
    ];
    return isset($m[$t]) ? $m[$t] : $t;
}

function nl_plural($n, $sing, $plur) {
    return $n . ' ' . ($n === 1 ? $sing : $plur);
}

/**
 * Recorta un texto a $max caracteres y agrega … si sobró.
 * Usa mbstring si está disponible; si no, cae a substr (el hosting compartido
 * no siempre trae la extensión y acá hay tildes y ñ de por medio).
 */
function nl_recorte($texto, $max) {
    $texto = (string)$texto;
    if (function_exists('mb_strlen')) {
        if (mb_strlen($texto, 'UTF-8') <= $max) return $texto;
        return mb_substr($texto, 0, $max, 'UTF-8') . '…';
    }
    if (strlen($texto) <= $max) return $texto;
    // Corte a la baja + limpieza de un posible byte suelto de UTF-8.
    $corte = substr($texto, 0, $max);
    while ($corte !== '' && (ord(substr($corte, -1)) & 0xC0) === 0x80) {
        $corte = substr($corte, 0, -1);
    }
    if ($corte !== '' && ord(substr($corte, -1)) >= 0xC0) $corte = substr($corte, 0, -1);
    return $corte . '…';
}

try {
    $pdo = get_db();

    // Todos los topics: sirven para breadcrumb, numeración y subárbol.
    // SELECT * y no una lista de columnas: si la base todavía no tiene
    // `descripcion` (falta correr migrate.php), la página igual funciona.
    $todos = $pdo->query("SELECT * FROM topics
                          ORDER BY COALESCE(parent_id,0), orden, nombre")->fetchAll();

    $topic = null;
    foreach ($todos as $t) {
        if (($slug !== '' && $t['slug'] === $slug) || ($id > 0 && (int)$t['id'] === $id)) { $topic = $t; break; }
    }
    if (!$topic) { http_response_code(404); }

} catch (Throwable $e) {
    http_response_code(500);
    $todos = [];
    $topic = null;
    $errorMsg = $e->getMessage();
}

if (!$topic) {
    $active_page = 'atlas';
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Tema no encontrado — NeuroLab</title>
    <link rel="icon" href="img/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/tema.css">
    </head>
    <body>
    <div class="bg-mesh"></div>
    <?php $active_page = 'tema'; include '_partials/nav.php'; ?>
    <div class="container nl-tema-vacio">
        <span class="label">Tema</span>
        <h1 class="mt-2">No encontramos ese tema</h1>
        <p class="text-muted">
            <?= isset($errorMsg)
                ? 'Hubo un problema al leer la base de datos.'
                : 'El tema que buscas no existe o fue renombrado.' ?>
        </p>
        <p class="mt-3"><a href="atlas.php" class="btn btn-primary btn-sm">← Volver al atlas</a></p>
    </div>
    <?php include '_partials/footer.php'; ?>
    </body>
    </html>
    <?php
    exit;
}

/* ---------------------------------------------------------------
   Datos del tema
   --------------------------------------------------------------- */
$topicId = (int)$topic['id'];

// Índice por padre para recorrer el árbol.
$hijosDe = [];
foreach ($todos as $t) {
    $p = ($t['parent_id'] === null || $t['parent_id'] === '') ? 0 : (int)$t['parent_id'];
    $hijosDe[$p][] = $t;
}
$indice = [];
foreach ($todos as $t) { $indice[(int)$t['id']] = $t; }

// Breadcrumb: raíz → … → tema actual
$ruta  = [];
$cur   = $topic;
$visto = [];
while ($cur && !isset($visto[(int)$cur['id']])) {
    $visto[(int)$cur['id']] = true;
    array_unshift($ruta, $cur);
    $pid = ($cur['parent_id'] === null || $cur['parent_id'] === '') ? 0 : (int)$cur['parent_id'];
    $cur = $pid && isset($indice[$pid]) ? $indice[$pid] : null;
}

$subtemas = isset($hijosDe[$topicId]) ? $hijosDe[$topicId] : [];

// Subárbol completo (el tema y todos sus descendientes)
$descIds = [$topicId];
$pila    = [$topicId];
while ($pila) {
    $actual = array_pop($pila);
    if (!isset($hijosDe[$actual])) continue;
    foreach ($hijosDe[$actual] as $h) {
        $descIds[] = (int)$h['id'];
        $pila[]    = (int)$h['id'];
    }
}
$descIds = array_values(array_unique($descIds));
$ph      = implode(',', array_fill(0, count($descIds), '?'));

$actividades = [];
$quices      = [];
$recursos    = [];
try {
    $st = $pdo->prepare("SELECT a.id, a.topic_id, a.slug, a.titulo, a.descripcion, a.tipo,
                                t.nombre AS topic_nombre
                         FROM actividades a
                         LEFT JOIN topics t ON t.id = a.topic_id
                         WHERE a.activo = 1 AND a.topic_id IN ($ph)
                         ORDER BY a.titulo");
    $st->execute($descIds);
    $actividades = $st->fetchAll();

    $sq = $pdo->prepare("SELECT q.id, q.titulo, q.datos_json,
                                a.slug AS actividad_slug, a.titulo AS actividad_titulo
                         FROM quices q
                         JOIN actividades a ON a.id = q.actividad_id
                         WHERE q.activo = 1 AND a.activo = 1 AND a.topic_id IN ($ph)
                         ORDER BY a.titulo");
    $sq->execute($descIds);
    $quices = $sq->fetchAll();

    $sr = $pdo->prepare("SELECT id, tipo, titulo, url, caption, orden
                         FROM topic_recursos WHERE topic_id = ? ORDER BY orden, id");
    $sr->execute([$topicId]);
    $recursos = $sr->fetchAll();
} catch (Throwable $e) {
    // Base sin migrar todavía: la página sigue funcionando con las secciones vacías.
}

$imagenes = [];
$enlaces  = [];
foreach ($recursos as $r) {
    if ($r['tipo'] === 'imagen') $imagenes[] = $r;
    else                         $enlaces[]  = $r;
}

// Las actividades tipo quiz también cuentan como quiz aunque no tengan fila en `quices`.
$quizActs = [];
foreach ($actividades as $a) {
    if ($a['tipo'] === 'quiz') $quizActs[] = $a;
}

$descripcionTema = isset($topic['descripcion']) ? trim((string)$topic['descripcion']) : '';

$numero  = nl_numero_tema($todos, $topicId);
$titulo  = $topic['nombre'];
$padre   = count($ruta) > 1 ? $ruta[count($ruta) - 2] : null;
$active_page = 'atlas';
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= htmlspecialchars($titulo) ?> — NeuroLab</title>
<meta name="description" content="<?= htmlspecialchars(nl_recorte($descripcionTema, 160)) ?>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="icon" href="img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/atlas.css">
<link rel="stylesheet" href="css/mapa.css">
<link rel="stylesheet" href="css/tema.css">
</head>
<body>
<div class="bg-mesh"></div>
<?php $active_page = 'tema'; include '_partials/nav.php'; ?>

<header class="nl-tema-header">
  <div class="container">
    <nav class="nl-tema-crumbs" aria-label="Ruta">
      <a href="atlas.php">Atlas</a>
      <?php foreach ($ruta as $i => $n): ?>
        <span class="nl-tema-crumbs__sep">›</span>
        <?php if ($i === count($ruta) - 1): ?>
          <span class="nl-tema-crumbs__actual"><?= htmlspecialchars($n['nombre']) ?></span>
        <?php else: ?>
          <a href="tema.php?slug=<?= urlencode($n['slug']) ?>"><?= htmlspecialchars($n['nombre']) ?></a>
        <?php endif; ?>
      <?php endforeach; ?>
    </nav>

    <div class="nl-tema-title">
      <span class="nl-tema-num"><?= htmlspecialchars($numero) ?></span>
      <span class="nl-tema-ico"><?= htmlspecialchars($topic['icono'] ? $topic['icono'] : '•') ?></span>
      <h1><?= htmlspecialchars($titulo) ?></h1>
    </div>

    <div class="nl-tema-chips">
      <?php if (!empty($topic['tipo'])): ?>
        <span class="badge badge-violet"><?= htmlspecialchars(nl_tipo_tema_label($topic['tipo'])) ?></span>
      <?php endif; ?>
      <?php if ($subtemas): ?>
        <span class="badge badge-gray"><?= htmlspecialchars(nl_plural(count($subtemas), 'subtema', 'subtemas')) ?></span>
      <?php endif; ?>
      <?php if ($actividades): ?>
        <span class="badge badge-gray"><?= htmlspecialchars(nl_plural(count($actividades), 'actividad', 'actividades')) ?></span>
      <?php endif; ?>
      <?php if ($quices || $quizActs): ?>
        <span class="badge badge-pink"><?= htmlspecialchars(nl_plural(max(count($quices), count($quizActs)), 'quiz', 'quices')) ?></span>
      <?php endif; ?>
    </div>

    <nav class="nl-tema-anclas" aria-label="Secciones de la página">
      <a href="#descripcion">Descripción</a>
      <a href="#mapa">Mapa conceptual</a>
      <?php if ($subtemas): ?><a href="#subtemas">Subtemas</a><?php endif; ?>
      <a href="#actividades">Actividades</a>
      <a href="#quices">Quices</a>
      <a href="#imagenes">Imágenes</a>
      <a href="#recursos">Recursos</a>
    </nav>
  </div>
</header>

<main class="nl-tema-body">
  <div class="container">

    <!-- 1. DESCRIPCIÓN -->
    <section class="nl-tema-sec" id="descripcion">
      <div class="nl-tema-sec__head">
        <h2>Descripción</h2>
      </div>
      <?php if ($descripcionTema !== ''): ?>
        <div class="nl-tema-prosa"><?= nl2br(htmlspecialchars($descripcionTema)) ?></div>
      <?php else: ?>
        <p class="nl-tema-vacia">
          Este tema todavía no tiene descripción.
          Se agrega en la columna <code>descripcion</code> de la tabla <code>topics</code>.
        </p>
      <?php endif; ?>
    </section>

    <!-- 2. MAPA CONCEPTUAL -->
    <section class="nl-tema-sec" id="mapa">
      <div class="nl-tema-sec__head">
        <h2>Mapa conceptual</h2>
        <span class="nl-tema-sec__hint">De lo general a lo específico · haz clic en un nodo para expandirlo</span>
      </div>
      <div id="mapa-conceptual" data-topic-id="<?= $topicId ?>">
        <p class="nl-tema-vacia">Cargando mapa…</p>
      </div>
    </section>

    <!-- 3. SUBTEMAS -->
    <?php if ($subtemas): ?>
    <section class="nl-tema-sec" id="subtemas">
      <div class="nl-tema-sec__head">
        <h2>Subtemas</h2>
        <span class="nl-tema-sec__hint">Cada uno tiene su propia página</span>
      </div>
      <div class="nl-tema-grid">
        <?php foreach ($subtemas as $s): ?>
          <?php
            $nSub  = isset($hijosDe[(int)$s['id']]) ? count($hijosDe[(int)$s['id']]) : 0;
            $resum = isset($s['descripcion']) ? trim((string)$s['descripcion']) : '';
          ?>
          <a class="nl-tema-card" href="tema.php?slug=<?= urlencode($s['slug']) ?>">
            <div class="nl-tema-card__top">
              <span class="nl-tema-card__ico"><?= htmlspecialchars($s['icono'] ? $s['icono'] : '•') ?></span>
              <span class="nl-tema-card__num"><?= htmlspecialchars(nl_numero_tema($todos, (int)$s['id'])) ?></span>
            </div>
            <div class="nl-tema-card__title"><?= htmlspecialchars($s['nombre']) ?></div>
            <?php if ($resum !== ''): ?>
              <p class="nl-tema-card__desc"><?= htmlspecialchars(nl_recorte($resum, 120)) ?></p>
            <?php endif; ?>
            <?php if ($nSub): ?>
              <span class="nl-tema-card__meta"><?= htmlspecialchars(nl_plural($nSub, 'subtema', 'subtemas')) ?></span>
            <?php endif; ?>
          </a>
        <?php endforeach; ?>
      </div>
    </section>
    <?php endif; ?>

    <!-- 4. ACTIVIDADES -->
    <section class="nl-tema-sec" id="actividades">
      <div class="nl-tema-sec__head">
        <h2>Actividades</h2>
        <?php if ($subtemas): ?>
          <span class="nl-tema-sec__hint">Incluye las de sus subtemas</span>
        <?php endif; ?>
      </div>
      <?php if ($actividades): ?>
      <div class="nl-tema-grid">
        <?php foreach ($actividades as $a): ?>
          <?php $d = (string)$a['descripcion']; ?>
          <a class="nl-act-card" href="actividad.php?slug=<?= urlencode($a['slug']) ?>">
            <span class="nl-act-card__tipo <?= htmlspecialchars($a['tipo']) ?>"><?= htmlspecialchars(nl_tipo_label($a['tipo'])) ?></span>
            <div class="nl-act-card__title"><?= htmlspecialchars($a['titulo']) ?></div>
            <div class="nl-act-card__desc"><?= htmlspecialchars(nl_recorte($d, 120)) ?></div>
            <?php if ((int)$a['topic_id'] !== $topicId && !empty($a['topic_nombre'])): ?>
              <span class="nl-act-card__origen">en <?= htmlspecialchars($a['topic_nombre']) ?></span>
            <?php endif; ?>
          </a>
        <?php endforeach; ?>
      </div>
      <?php else: ?>
        <p class="nl-tema-vacia">Este tema todavía no tiene actividades asociadas.</p>
      <?php endif; ?>
    </section>

    <!-- 5. QUICES -->
    <section class="nl-tema-sec" id="quices">
      <div class="nl-tema-sec__head">
        <h2>Quices</h2>
        <span class="nl-tema-sec__hint">Con retroalimentación inmediata</span>
      </div>
      <?php if ($quices || $quizActs): ?>
      <div class="nl-tema-grid">
        <?php foreach ($quices as $q): ?>
          <?php
            $preguntas = json_decode((string)$q['datos_json'], true);
            $nPreg = is_array($preguntas) ? count($preguntas) : 0;
          ?>
          <a class="nl-quiz-card" href="actividad.php?slug=<?= urlencode($q['actividad_slug']) ?>">
            <span class="nl-quiz-card__ico">✏️</span>
            <div>
              <div class="nl-quiz-card__title"><?= htmlspecialchars($q['titulo'] ? $q['titulo'] : $q['actividad_titulo']) ?></div>
              <div class="nl-quiz-card__meta">
                <?= $nPreg ? htmlspecialchars(nl_plural($nPreg, 'pregunta', 'preguntas')) : 'Quiz' ?>
                · <?= htmlspecialchars($q['actividad_titulo']) ?>
              </div>
            </div>
          </a>
        <?php endforeach; ?>
        <?php foreach ($quizActs as $a): ?>
          <a class="nl-quiz-card" href="actividad.php?slug=<?= urlencode($a['slug']) ?>">
            <span class="nl-quiz-card__ico">✏️</span>
            <div>
              <div class="nl-quiz-card__title"><?= htmlspecialchars($a['titulo']) ?></div>
              <div class="nl-quiz-card__meta">Actividad tipo quiz</div>
            </div>
          </a>
        <?php endforeach; ?>
      </div>
      <?php else: ?>
        <p class="nl-tema-vacia">Todavía no hay quices para este tema.</p>
      <?php endif; ?>
    </section>

    <!-- 6. IMÁGENES -->
    <section class="nl-tema-sec" id="imagenes">
      <div class="nl-tema-sec__head">
        <h2>Imágenes</h2>
        <span class="nl-tema-sec__hint">Esquemas, láminas y fotografías del tema</span>
      </div>
      <?php if ($imagenes): ?>
      <div class="nl-tema-galeria">
        <?php foreach ($imagenes as $im): ?>
          <figure class="nl-tema-figura">
            <img src="<?= htmlspecialchars($im['url']) ?>"
                 alt="<?= htmlspecialchars($im['titulo'] ? $im['titulo'] : $titulo) ?>" loading="lazy">
            <?php if (!empty($im['caption'])): ?>
              <figcaption><?= htmlspecialchars($im['caption']) ?></figcaption>
            <?php endif; ?>
          </figure>
        <?php endforeach; ?>
      </div>
      <?php else: ?>
        <p class="nl-tema-vacia">
          Aún no hay imágenes cargadas para este tema.
          Se agregan en <code>topic_recursos</code> con <code>tipo = 'imagen'</code>.
        </p>
      <?php endif; ?>
    </section>

    <!-- 7. RECURSOS Y MATERIAL EXTRA -->
    <section class="nl-tema-sec" id="recursos">
      <div class="nl-tema-sec__head">
        <h2>Recursos y material extra</h2>
        <span class="nl-tema-sec__hint">Enlaces, videos y apuntes</span>
      </div>
      <?php if ($enlaces): ?>
      <ul class="nl-tema-recursos">
        <?php foreach ($enlaces as $r): ?>
          <li class="nl-tema-recurso">
            <?php if ($r['tipo'] === 'texto_html'): ?>
              <div class="nl-tema-recurso__html">
                <?php if (!empty($r['titulo'])): ?><strong><?= htmlspecialchars($r['titulo']) ?></strong><?php endif; ?>
                <div><?= $r['url'] ?></div>
              </div>
            <?php else: ?>
              <a href="<?= htmlspecialchars($r['url']) ?>" target="_blank" rel="noopener">
                <span class="nl-tema-recurso__ico"><?php
                    if ($r['tipo'] === 'video')          echo '🎬';
                    elseif ($r['tipo'] === 'documento')  echo '📄';
                    else                                 echo '🔗';
                ?></span>
                <span>
                  <strong><?= htmlspecialchars($r['titulo'] ? $r['titulo'] : $r['url']) ?></strong>
                  <?php if (!empty($r['caption'])): ?>
                    <em><?= htmlspecialchars($r['caption']) ?></em>
                  <?php endif; ?>
                </span>
              </a>
            <?php endif; ?>
          </li>
        <?php endforeach; ?>
      </ul>
      <?php else: ?>
        <p class="nl-tema-vacia">
          Todavía no hay material extra para este tema.
          Se agrega en <code>topic_recursos</code> con <code>tipo</code> <code>enlace</code>, <code>video</code>,
          <code>documento</code> o <code>texto_html</code>.
        </p>
      <?php endif; ?>
    </section>

    <div class="nl-tema-pie">
      <a href="atlas.php" class="btn btn-ghost btn-sm">← Volver al atlas</a>
      <?php if ($padre): ?>
        <a href="tema.php?slug=<?= urlencode($padre['slug']) ?>" class="btn btn-ghost btn-sm">
          ↑ <?= htmlspecialchars($padre['nombre']) ?>
        </a>
      <?php endif; ?>
    </div>

  </div>
</main>

<?php include '_partials/footer.php'; ?>
<script type="module" src="js/tema.js"></script>
</body>
</html>
