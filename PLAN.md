# NeuroLab — Plataforma de Actividades para Neurobiología y Fisiología de Sistemas

**Estado:** planificación (pre-implementación)
**Carreras destino:** Fonoaudiología (ETMP061) · Terapia Ocupacional (ETMP097)
**Stack base:** PHP 7.4 + SQLite (WAL) + Vanilla JS ES Modules — reusado de `C:\repo\cellview`

---

## 1. Tópicos compartidos (justificación del proyecto)

Análisis comparativo de los programas 2025-II:

| Tópico | ETMP061 Fisiología de Sistemas | ETMP097 Neurobiología |
|---|---|---|
| Células del SN (neurona/glía) | clase 4 | clases 8–9, prácticos 6–7 |
| Potencial de acción | clase 5 | clases 10–12 |
| Sinapsis / neurotransmisión | clase 6 | clases 11–12, prácticos 8–9 |
| SN sensitivo y receptores | clases 7–8 | clase 19, Unidad III |
| SN autónomo | clase 9 | clase 6 |
| Integración neuromuscular / control motor | clase 10 | clases 17–18, Unidad III |
| Tópicos específicos Fono | vía auditiva, lenguaje | afasias, Broca/Wernicke |
| Tópicos específicos TO | — | ocupación, TEC, control motor fino |

**Tronco común** (5 temas donde las actividades valen para ambas carreras):
1. Células del sistema nervioso
2. Potencial de acción
3. Sinapsis y neurotransmisión
4. Sistema nervioso sensitivo
5. Sistema nervioso autónomo

**Diferenciadores por carrera** (entran como `actividad_carrera`):
- Fono: sistema auditivo, lenguaje, fonación.
- TO: control motor, integración sensorial, neuroplasticidad aplicada.

---

## 2. Gramática de actividad digital (mapeo desde tus prácticos)

Tipos de actividad observados en los prácticos de Neurobiología 2024-2:

| Práctico (papel) | Equivalente NeuroLab | Recurso en cellview |
|---|---|---|
| Identificar partes de neurona con flechas | `labeling` (imagen con hotspots) | `activities.tipo='labeling'` |
| Cuadro comparativo bipolar/pseudo/multipolar | `comparador` (tabla 2–3 col) | nuevo |
| Lámina histologyguide.com + preguntas | `lamina` (iframe) | nuevo |
| PhET membrane-channels / neuron | `simulador` (iframe PhET) | nuevo |
| Preguntas abiertas | `quiz` (selección múltiple + FEEDBACK) | `parse_aiken.php` + `quiz.js` |

**5 tipos soportados en MVP:**
1. `lamina` — iframe a histologyguide.com, con hotspots opcionales y preguntas asociadas
2. `simulador` — iframe a PhET Colorado (membrane-channels, neuron)
3. `comparador` — tabla 2–3 columnas lado a lado (sin interactividad)
4. `labeling` — imagen con hotspots + selección correcta
5. `quiz` — 20 preguntas selección múltiple, feedback inmediato (reusa cellview)

---

## 3. Stack y decisiones

| Decisión | Valor | Razón |
|---|---|---|
| Nombre | **NeuroLab** | Describe el lab. virtual de actividades, no compite con "visor" |
| Paleta | **Morado/violeta** | Diferencia de cellview (azul/verde), vincula con neurociencia |
| Reutilizar de cellview | `progress.js`, `quiz.js`, `parse_aiken.php`, `_partials/`, patrón admin | Validado en LiteSpeed + PHP 7.4 |
| Nuevo | `actividad.php`, `actividad_carrera` UI, CSS `activity.css` | Requerido por el wireframe de doble descripción |
| Alcance MVP | 5 tipos completos | Estudiantes-ayudantes podrán poblar contenido de inmediato |

---

## 4. Arquitectura de archivos

```
neuroview/
├── _partials/             nav.php, footer.php (reusados de cellview con copy)
├── admin/                 CRUD: actividades, carreras, recursos, relaciones
├── api/                   db.php + endpoints JSON (topics, actividades, carrera)
├── css/                   base.css + nav.css (reusados) + atlas.css + activity.css
├── js/                    progress.js + quiz.js (reusados) + activity.js (nuevo)
├── data/                  schema.sql + seed.sql + .htaccess
├── img/                   logo UACH, hero, favicon
├── index.php              landing (paleta morada, copy NeuroLab)
├── atlas.php              árbol de temas (mismo patrón cellview)
└── actividad.php          el "viewer" renombrado — layout split:
                           izq: recurso (imagen/3D/iframe) + tab imagen|3D
                           der: descripcion general + 2 cards carrera + quiz
```

---

## 5. Schema SQLite

Extiende el schema de cellview con énfasis en "actividad por tema" (no solo "actividad por modelo"):

```sql
-- Topics: árbol jerárquico (mismo patrón cellview)
CREATE TABLE topics (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE,
  nombre TEXT,
  parent_id INTEGER,
  icono TEXT,
  tipo TEXT,                 -- estructura / proceso / sensitivo / motor / lenguaje
  orden INTEGER
);

-- Actividades: 1 por tema, con tipo y descripción general
CREATE TABLE actividades (
  id INTEGER PRIMARY KEY,
  topic_id INTEGER,
  slug TEXT UNIQUE,
  titulo TEXT,
  descripcion TEXT,          -- descripción general (lado derecho del wireframe)
  tipo TEXT,                 -- lamina | simulador | comparador | labeling | quiz
  activo INTEGER DEFAULT 1
);

-- Recursos asociados a la actividad (puede haber varios)
CREATE TABLE actividad_recursos (
  id INTEGER PRIMARY KEY,
  actividad_id INTEGER,
  tipo TEXT,                 -- imagen | embed_3d | iframe_url
  url TEXT,
  caption TEXT,
  orden INTEGER
);

-- Carreras (Fonoaudiología, Terapia Ocupacional)
CREATE TABLE carreras (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE,
  nombre TEXT,
  asignatura_codigo TEXT,    -- ETMP061 / ETMP097
  descripcion TEXT,
  activo INTEGER DEFAULT 1
);

-- Descripción específica por carrera dentro de una actividad
CREATE TABLE actividad_carrera (
  id INTEGER PRIMARY KEY,
  actividad_id INTEGER,
  carrera_id INTEGER,
  descripcion TEXT,          -- texto específico para esta carrera
  orden INTEGER,
  UNIQUE(actividad_id, carrera_id)
);

-- Quices: reusamos el patrón cellview (activities.datos_json con preguntas + FEEDBACK)
-- Se guardan en actividad_recursos con tipo='quiz_json' o en tabla propia
CREATE TABLE quices (
  id INTEGER PRIMARY KEY,
  actividad_id INTEGER,
  titulo TEXT,
  datos_json TEXT,           -- formato Aiken extendido (con FEEDBACK:)
  activo INTEGER DEFAULT 1
);
```

**Datos seed mínimos (MVP):**
- 2 carreras: Fonoaudiología (ETMP061), Terapia Ocupacional (ETMP097)
- 5 topics raíz del tronco común
- 1 actividad de ejemplo de cada uno de los 5 tipos
- 1 quiz de 5 preguntas de ejemplo

---

## 6. Wireframe funcional (mapeo a archivos)

```
index.php
├─ logo UACH (esq. sup. izq)
├─ título "NeuroLab"
├─ descripción (uso, asignaturas, síntesis)
├─ bloque "qué encontrarás" — 6 tarjetas:
│   ├─ 🔬 Láminas virtuales
│   ├─ ⚡ Simuladores interactivos
│   ├─ 🔄 Comparadores
│   ├─ 🏷️ Identificación de partes
│   ├─ ✏️ Quices con feedback
│   └─ 📖 Lecturas guiadas
└─ botón admin (esq. inf. der)
   al lado del título: 2 rectángulos interactuables
   [Morfología] [Biología] ← filtran el atlas por tipo de tema

atlas.php → mismo motor que cellview, árbol colapsable

actividad.php?slug=células-del-sn
┌──────────────────────────────────┬─────────────────────────────�
│ tabs: [Imagen] [Modelo 3D]       │ descripción GENERAL          │
│ [recurso: lamina/3D/simulador/   │ ┌─────────┐ ┌─────────┐     │
│  imagen labeling]                │ │  Fono   │ │   TO    │     │
│                                  │ │ETMP061  │ │ETMP097  │     │
│ ocupa mitad izq                  │ │descrip. │ │descrip. │     │
│                                  │ │específ. │ │específ. │     │
│                                  │ └─────────┘ └─────────┘     │
│                                  │                             │
│                                  │ QUIZ 20 preguntas            │
│                                  │ (feedback inmediato)         │
└──────────────────────────────────┴─────────────────────────────┘
```

---

## 7. Plan de implementación por fases

### Fase 0 — Esqueleto (esta semana)
- Crear carpeta `neuroview/` con estructura completa
- Migrar `progress.js`, `quiz.js`, `_partials/`, `css/base.css`, `css/nav.css` de cellview
- `index.php` mínimo con paleta morada + logo UACH
- `data/schema.sql` con tablas vacías
- `data/seed.sql` con 2 carreras + 5 topics

### Fase 1 — Atlas + navegación
- `api/topics.php` + `api/actividades.php` (lista por topic)
- `atlas.php` + `js/atlas.js` (adaptado de cellview)
- `actividad.php` con layout split vacío

### Fase 2 — Tipos de actividad (los 5)
- Render por `tipo` en `actividad.php` + `js/activity.js`
- Soporte de tabs imagen|3D cuando hay `embed_3d`
- Adaptar `parse_aiken.php` para apuntar a `quices` en vez de `activities`

### Fase 3 — Admin
- CRUD actividades con selector de tipo, recursos múltiples, asignación a carrera
- CRUD quices (formulario o importador Aiken)
- CRUD topics con tipo

### Fase 4 — Datos seed reales
- Poblar con las 5 actividades del tronco común
- 1 quiz de 20 preguntas por actividad (recolectado de tus prácticos)
- 2–3 láminas y 2 simuladores PhET embebidos

### Fase 5 — Pulido visual
- Hero, animaciones, transiciones
- Pruebas en hosting compartido (tmeduca.org/ferlopezmoncada/neuroview)

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Estudiantes-ayudantes tocan schema sin querer | Admin completo + migraciones idempotentes (patrón cellview) |
| Iframes externos rotos (PhET, histologyguide) | `actividad_recursos` permite cambiar URL sin migrar; placeholder si falla |
| Diferencias Fono/TO se meten en descripción general | Validación admin: si hay `actividad_carrera`, la general queda neutral |
| Quiz muy largo (20 preguntas) | Guardar progreso en localStorage, permitir "continuar después" |
| LiteSpeed + PHP 7.4 (sin `str_starts_with`) | Patrón ya validado en cellview, mantener |

---

## 9. Lo que NO se hace (fuera de alcance MVP)

- Autenticación de estudiantes (localStorage basta para progreso)
- Editor visual de comparadores (escribir HTML directo en admin)
- Sistema de comentarios
- Modo offline / PWA
- Multi-idioma (solo español)

---

**Última edición:** 2026-08-07 · Fernanda López M. · TecMedHub, UACh Puerto Montt
