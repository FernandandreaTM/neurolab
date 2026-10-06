-- NeuroLab — schema.sql
-- PHP 7.4 compatible. Idempotente: CREATE TABLE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS carreras (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    slug            TEXT    NOT NULL UNIQUE,
    nombre          TEXT    NOT NULL,
    asignatura_codigo TEXT  NOT NULL,
    descripcion     TEXT,
    activo          INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS topics (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT    NOT NULL UNIQUE,
    nombre      TEXT    NOT NULL,
    parent_id   INTEGER,
    icono       TEXT,
    tipo        TEXT,                        -- estructura | proceso | sensitivo | motor | lenguaje | tronco
    orden       INTEGER NOT NULL DEFAULT 0,
    descripcion TEXT,                        -- texto introductorio que se muestra en tema.php
    FOREIGN KEY (parent_id) REFERENCES topics(id)
);

-- Material del TEMA (no de una actividad): imagenes, enlaces, videos, texto libre.
-- Pensada para ir creciendo: la pagina del tema ya la muestra aunque este vacia.
CREATE TABLE IF NOT EXISTS topic_recursos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id    INTEGER NOT NULL,
    tipo        TEXT    NOT NULL,            -- imagen | enlace | video | documento | texto_html
    titulo      TEXT,
    url         TEXT,
    caption     TEXT,
    orden       INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

CREATE INDEX IF NOT EXISTS idx_topic_recursos_topic ON topic_recursos(topic_id);

CREATE TABLE IF NOT EXISTS actividades (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id     INTEGER,
    slug         TEXT    NOT NULL UNIQUE,
    titulo       TEXT    NOT NULL,
    descripcion  TEXT,                       -- descripción GENERAL (común a ambas carreras)
    tipo         TEXT    NOT NULL,           -- lamina | simulador | comparador | labeling | quiz
    activo       INTEGER NOT NULL DEFAULT 1,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

CREATE TABLE IF NOT EXISTS actividad_recursos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    actividad_id  INTEGER NOT NULL,
    tipo          TEXT    NOT NULL,          -- imagen | embed_3d | iframe_url | texto_html
    url           TEXT,
    caption       TEXT,
    orden         INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (actividad_id) REFERENCES actividades(id)
);

CREATE TABLE IF NOT EXISTS actividad_carrera (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    actividad_id    INTEGER NOT NULL,
    carrera_id      INTEGER NOT NULL,
    descripcion     TEXT,                    -- descripción ESPECÍFICA para esta carrera
    orden           INTEGER NOT NULL DEFAULT 0,
    UNIQUE(actividad_id, carrera_id),
    FOREIGN KEY (actividad_id) REFERENCES actividades(id),
    FOREIGN KEY (carrera_id)   REFERENCES carreras(id)
);

CREATE TABLE IF NOT EXISTS quices (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    actividad_id  INTEGER NOT NULL,
    titulo        TEXT,
    datos_json    TEXT,                      -- formato Aiken extendido (con FEEDBACK:)
    activo        INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (actividad_id) REFERENCES actividades(id)
);

CREATE TABLE IF NOT EXISTS labeling_parts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    actividad_id  INTEGER NOT NULL,
    nombre        TEXT    NOT NULL,          -- respuesta correcta (la que se muestra al acertar)
    x_pct         REAL    NOT NULL,          -- punto de la estructura, en % del ancho (0-100)
    y_pct         REAL    NOT NULL,          -- idem, en % del alto
    descripcion   TEXT,                      -- retroalimentación al acertar / pista al fallar
    sinonimos     TEXT,                      -- otras respuestas válidas, separadas por |
    funcion       TEXT,                      -- función breve (sin nombrar la parte): alternativa correcta del quiz
    box_x_pct     REAL,                      -- centro del rectángulo; NULL = sobre el punto
    box_y_pct     REAL,
    orden         INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (actividad_id) REFERENCES actividades(id)
);

-- Práctica por niveles dentro de una actividad (p. ej. el comparador de tipos de neurona).
-- Cada nivel tiene un tipo de ejercicio; activo = 0 lo muestra como "Próximamente".
CREATE TABLE IF NOT EXISTS practica_niveles (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    actividad_id  INTEGER NOT NULL,
    numero        INTEGER NOT NULL,          -- 1, 2, 3... orden en que se juegan
    titulo        TEXT    NOT NULL,
    instrucciones TEXT,
    tipo          TEXT    NOT NULL DEFAULT 'completar',   -- completar (frase + escribir la respuesta)
    activo        INTEGER NOT NULL DEFAULT 1,
    UNIQUE(actividad_id, numero),
    FOREIGN KEY (actividad_id) REFERENCES actividades(id)
);

-- Ítems de un nivel. En el enunciado, {} marca dónde va el espacio para escribir;
-- si no hay {}, el espacio va al comienzo de la frase.
-- La respuesta NO se manda al navegador: se revisa en api/practica_check.php.
CREATE TABLE IF NOT EXISTS practica_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nivel_id      INTEGER NOT NULL,
    enunciado     TEXT    NOT NULL,
    respuesta     TEXT    NOT NULL,          -- lo que se muestra al acertar (p. ej. "Pseudounipolar")
    sinonimos     TEXT,                      -- otras formas válidas separadas por | (p. ej. "falsa unipolar")
    pista         TEXT,                      -- se muestra al equivocarse, sin decir la respuesta
    explicacion   TEXT,                      -- se muestra al acertar
    orden         INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (nivel_id) REFERENCES practica_niveles(id)
);

CREATE INDEX IF NOT EXISTS idx_practica_items_nivel ON practica_items(nivel_id);
