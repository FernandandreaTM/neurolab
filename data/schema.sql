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
    FOREIGN KEY (parent_id) REFERENCES topics(id)
);

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
    nombre        TEXT    NOT NULL,
    x_pct         REAL    NOT NULL,          -- posición del hotspot en % (0-100)
    y_pct         REAL    NOT NULL,
    descripcion   TEXT,
    orden         INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (actividad_id) REFERENCES actividades(id)
);
