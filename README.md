# NeuroLab — Plataforma de Actividades para Neurobiología y Fisiología de Sistemas

**TecMedHub · Escuela de Tecnología Médica · Universidad Austral de Chile, Puerto Montt**
Desarrollado por Dra. Fernanda López M. · fernanda.lopez@uach.cl

---

## ¿Qué es NeuroLab?

NeuroLab es una plataforma web educativa orientada a **actividades** (no a libro de texto) que sirve a dos asignaturas que comparten el estudio del sistema nervioso:

- **ETMP061 — Fisiología de Sistemas** (Fonoaudiología, II semestre)
- **ETMP097 — Neurobiología** (Terapia Ocupacional, 4° semestre)

El tronco común de ambos programas (células del SN, potencial de acción, sinapsis, sensitivo, autónomo) se cubre **una sola vez**, con descripciones específicas por carrera donde los énfasis difieren.

**Diferencia con CellView**: CellView orbita alrededor del modelo 3D. NeuroLab orbita alrededor de la **actividad** — láminas virtuales, simuladores (PhET), comparadores, identificación de partes y quices con feedback inmediato.

**URL de producción:** `https://tmeduca.org/ferlopezmoncada/neurolab/`

---

## Stack Técnico

| Capa | Tecnología |
|------|------------|
| Frontend | HTML5 + CSS3 + Vanilla JS (ES Modules) |
| Backend | PHP 7.4+ (sin frameworks) |
| Base de datos | SQLite con WAL mode |
| Recursos externos | Iframes (histologyguide, PhET) |
| Fuentes | Plus Jakarta Sans (Google Fonts) |
| Dependencias de producción | **Cero** — sin npm, sin bundler |

**Reutilizado de CellView** (`C:\repo\cellview`): patrón de `_partials/`, `css/base.css` adaptado, `js/progress.js`, `js/quiz.js`, `parse_aiken.php`, migraciones idempotentes.

---

## Estructura

```
neurolab/
├── _partials/
│   ├── nav.php                  # Topbar (NeuroLab + logo UACH)
│   └── footer.php               # Footer institucional
├── admin/                       # CRUD actividades, carreras, recursos, quices
├── api/                         # db.php + endpoints JSON
├── css/                         # base, nav, atlas, activity
├── js/                          # progress, quiz, activity (nuevo)
├── data/
│   ├── schema.sql               # topics, actividades, recursos, carreras, quices
│   ├── seed.sql                 # 2 carreras + 5 topics + 5 actividades demo
│   ├── neurolab.db              # DB generada por migrate.php
│   └── .htaccess                # Bloquea acceso web a la DB
├── img/                         # logo UACH, favicon, hero
├── index.php                    # Landing (logo UACH + título + descripción + cards)
├── atlas.php                    # Árbol de temas (mismo patrón CellView)
└── actividad.php                # Layout split: recurso | descripciones + quiz
```

---

## Tipos de actividad soportados

| `tipo` | Qué muestra | Recurso externo |
|--------|--------------|-----------------|
| `lamina` | Iframe histologyguide.com con hotspots opcionales | histologyguide.com |
| `simulador` | Iframe PhET Colorado (membrane-channels, neuron) | phet.colorado.edu |
| `comparador` | Tabla 2–3 columnas lado a lado (HTML puro) | — |
| `labeling` | Imagen con hotspots + quiz de partes | — |
| `quiz` | 20 preguntas selección múltiple + feedback inmediato | — |

Cada actividad puede tener **dos descripciones** almacenadas:
- `actividades.descripcion` — común a ambas carreras
- `actividad_carrera.descripcion` — específica por carrera (Fono / TO)

---

## Instalación

```bash
# 1. Subir carpeta neurolab/ al hosting compartido
# 2. Visitar admin/migrate.php para crear la DB
# 3. Visitar admin/seed.php para poblar datos demo
```

### Notas técnicas (heredadas de CellView)

- **PHP**: nunca usar `str_starts_with()` (PHP 8+). Usar `strpos($str, 'prefix') === 0`
- **SQLite**: devuelve strings — castear campos numéricos en JS con `+valor`
- **JS modules** requieren servidor HTTP, no funcionan con `file://`
- **`data/.htaccess`** protege la DB contra acceso web directo

---

## Plan completo

Ver [`PLAN.md`](./PLAN.md) — análisis comparativo, decisiones de stack, schema, wireframe, fases de implementación.

---

## Créditos

- **Desarrollado por:** Dra. Fernanda López M. — TecMedHub, Escuela de Tecnología Médica, UACh Puerto Montt
- **Asistencia de desarrollo:** Hermes Agent (Nous Research) — arquitectura, migraciones, CSS, JS
- **Recursos externos:** histologyguide.com, PhET Colorado (University of Colorado Boulder)
- **Proyectos hermanos:** CellView (Biología Celular), LABIM3D, LABIMATHS
