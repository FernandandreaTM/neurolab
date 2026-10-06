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
│   ├── schema.sql               # topics, topic_recursos, actividades, recursos, carreras, quices
│   ├── seed.sql                 # 2 carreras + 5 topics (con descripción) + 5 actividades demo
│   ├── neurolab.db              # DB generada por migrate.php
│   └── .htaccess                # Bloquea acceso web a la DB
├── img/                         # logo UACH, favicon, hero
├── index.php                    # Landing (logo UACH + título + descripción + cards)
├── atlas.php                    # Índice: árbol de temas + grilla de actividades
├── tema.php                     # Página propia de cada tema/subtema
└── actividad.php                # Layout split: recurso | descripciones + quiz
```

---

## Página de tema (`tema.php`)

Cada tema y subtema tiene su **propia URL**: `tema.php?slug=celulas-sn`.
El árbol del atlas, las tarjetas del home y los nodos del mapa conceptual apuntan ahí.

La página reúne, en este orden:

| Sección | De dónde sale |
|---------|---------------|
| Descripción | `topics.descripcion` |
| Mapa conceptual | `js/mapa.js`, con los datos de `api/topics.php` + `api/actividades.php` |
| Subtemas | `topics` hijos, cada uno enlaza a su propia página |
| Actividades | `actividades` del tema **y de sus subtemas** |
| Quices | `quices` de esas actividades + actividades de tipo `quiz` |
| Imágenes | `topic_recursos` con `tipo = 'imagen'` |
| Recursos y material extra | `topic_recursos` con `tipo` `enlace`, `video`, `documento` o `texto_html` |

Las dos últimas secciones se muestran vacías (con su mensaje) mientras no haya
filas en `topic_recursos`: están pensadas para ir creciendo sin tocar el código.

> Al agregar `tema.php` cambió el schema. Después de hacer `git pull`, correr
> `admin/migrate.php` (agrega `topics.descripcion` y crea `topic_recursos`, es idempotente)
> y luego `admin/seed.php` si se quieren las descripciones demo.

---

## Tipos de actividad soportados

| `tipo` | Qué muestra | Recurso externo |
|--------|--------------|-----------------|
| `lamina` | Iframe histologyguide.com con hotspots opcionales | histologyguide.com |
| `simulador` | Iframe PhET Colorado (membrane-channels, neuron) | phet.colorado.edu |
| `comparador` | Tabla 2–3 columnas lado a lado (HTML puro) | — |
| `labeling` | Imagen con rectángulos: el estudiante escribe el nombre de cada parte | — |
| `quiz` | 20 preguntas selección múltiple + feedback inmediato | — |

Cada actividad puede tener **dos descripciones** almacenadas:
- `actividades.descripcion` — común a ambas carreras
- `actividad_carrera.descripcion` — específica por carrera (Fono / TO)

---

## Práctica por niveles

Cualquier actividad puede tener una sección **Práctica** debajo, con niveles que se
juegan en orden (un nivel se desbloquea al completar el anterior). Hoy la usa el
comparador de tipos de neurona:

| Nivel | Qué hace | Estado |
|-------|----------|--------|
| 1 · Frases | Completar cada frase con el tipo de neurona (bipolar, pseudounipolar, multipolar) | activo |
| 2 · Dibujo de neuronas | Armar cada tipo sobre un soma con dendritas, axón o neurita en T | activo |
| 3 · Subtipos de multipolares | Piramidal, Purkinje, estrellada, motoneurona | próximamente |

- `practica_niveles` — un nivel por fila (`numero`, `titulo`, `instrucciones`, `activo`).
  Con `activo = 0` se muestra como "Próximamente".
- `practica_items` — las frases. En `enunciado`, `{}` marca el espacio para escribir
  (si no hay `{}`, el espacio va al comienzo). `respuesta` + `sinonimos` (separados por `|`)
  son las formas aceptadas; `pista` se muestra al equivocarse y `explicacion` al acertar.
- `practica_niveles.tipo` decide el ejercicio: `completar` (frase con espacio, `js/practica.js`)
  o `armar` (armar la neurona, `js/armar-neurona.js`). En `armar`, `respuesta` es el tipo pedido
  y las reglas de cada tipo están en `nl_prac_evalua_armado()` de `api/practica_check.php`:
  bipolar = 1 dendrita + 1 axón en polos opuestos; pseudounipolar = 1 sola neurita en T;
  multipolar = 1 axón + 2 o más dendritas.
- Las respuestas **no** se mandan al navegador: se revisan en `api/practica_check.php`
  (ignora tildes, mayúsculas, artículos, "neurona" y singular/plural).
- El avance se guarda en `localStorage` (`nl_practica_<nivel_id>`); al completar todos los
  niveles activos la actividad queda marcada como completada.

> Agrega tablas nuevas: después de `git pull`, correr `admin/migrate.php` y luego `admin/seed.php`.
## Actividad de identificación (`labeling`)

Sobre la lámina hay un rectángulo por cada estructura. **No hay corrección automática**:
el estudiante escribe el nombre y presiona <kbd>Enter</kbd> (o <kbd>?</kbd> si no lo sabe),
se le muestra el nombre correcto, los nombres alternativos y la función, y él decide:

- **Coincide** → verde.
- **No coincide** o **No sé** → ámbar ("por repasar"), con el nombre correcto a la vista.

Cada rectángulo se responde una sola vez (sin reintentos) y al terminar aparece un resumen
con las partes por repasar. Tocar un rectángulo resuelto vuelve a mostrar su función.

| Pieza | Rol |
|---------|-----|
| `labeling_parts` | una fila por estructura: `nombre`, punto (`x_pct`,`y_pct`), rectángulo (`box_x_pct`,`box_y_pct`), `sinonimos` (separados por `\|`) y `descripcion` (= la **función** que se muestra) |
| `api/labeling_check.php` | devuelve nombre, alternativas y función de una parte, sólo cuando el estudiante ya respondió |
| `js/labeling.js` | dibuja los rectángulos, muestra la comparación y guarda el avance en `localStorage` (`nl_labeling_<slug>`) |

- Los alternativos se muestran limpios: se ocultan variantes que sólo cambian tildes o plural
  y fragmentos del propio nombre (p. ej. "nódulo" en "Nódulo de Ranvier").
- Si `box_x_pct`/`box_y_pct` quedan en `NULL`, el rectángulo se dibuja sobre el punto.
- En pantallas angostas (< 760 px) los rectángulos bajan a una lista numerada.

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
