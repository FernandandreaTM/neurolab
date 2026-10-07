# Sesión 02 — Práctico Células nerviosas I: rediseño de la actividad 1 y bases comunes

**Fecha:** 2026-10-06 · **Asignatura:** ETMP097 Neurobiología (TO) · **Práctico:** autoguiado, a su ritmo, en grupos
**Ruta para estudiantes:** `https://tmeduca.org/ferlopezmoncada/neurolab/practico.php?p=celulas-1`
**Estado:** Actividad 1 (Partes de la neurona, 3 niveles) **cerrada y aprobada por Fer**. Actividades 2 (Tipos de neurona) y 3 (Lámina) quedan para la sesión 03.

---

## 1. Qué quedó construido

| Pieza | Qué hace | Archivos |
|---|---|---|
| Ruta del práctico | Orden de actividades y secciones de la guía que desbloquea cada una (sin tiempos ni pasos "con la docente") | `practico.php`, `data/practicos.php`, `_partials/rutas.php`, `css/practico.css` |
| Mi guía de estudio | Cada actividad completada se **guarda sola** en la guía (localStorage `nl_guia`); `guia.php` la muestra en orden, pide integrantes del grupo y se descarga en PDF (imprimir → Guardar como PDF) | `js/guia.js`, `guia.php`, `css/guia.css` |
| **Mesa de trabajo** | Vista (imagen o lámina) ajustada al alto de pantalla + panel fijo a la derecha donde se responde todo. Encabezado compacto, instrucciones plegables arriba | `_partials/mesa.php`, `css/mesa.css` |
| Actividad 1: Partes de la neurona | 3 niveles sobre la **misma neurona** (ver §3) | `js/labeling.js`, `api/labeling_check.php`, `img/neurona-base.jpg`, `img/neurona-nivel3-zoom.jpg` |
| Actividad 2: Tipos de neurona | Funciona (niveles 1 y 3 con botones-dibujo, nivel 2 armar neurona) **pero con el diseño antiguo**: pendiente sesión 03 | `js/practica.js`, `js/armar-neurona.js`, `_partials/iconos_neurona.php`, `img/tipos/*.png` |
| Actividad 3: Lámina Golgi | Ya en mesa (iframe + panel con pestañas), capturas pegadas + 8 preguntas autocorregidas. **Pendiente rediseño** sesión 03 | `js/tareas.js` (recurso `tareas` JSON en `data/seed.sql`) |
| Quiz de cierre | 23 preguntas, guarda resultado en la guía | `js/quiz.js`, `css/quiz.css` |

---

## 2. Principios de diseño acordados (aplicar a TODAS las actividades)

| Principio | Cómo se implementó en la actividad 1 |
|---|---|
| **Todo en una vista** (notebook 1366×768, sin subir y bajar) | Mesa de trabajo: vista a la izquierda (alto = `100vh − 92px`), panel fijo a la derecha que aprovecha el ancho sobrante; en celular una columna |
| **Paso a paso, atención dirigida** | Una estructura a la vez; en la imagen solo aparecen las respondidas + la activa (aparición progresiva con animación) |
| **No sobrecargar** | Números fuera de la estructura con línea guía gris fina; contornos/corchetes **solo** en la activa; instrucciones plegadas; nada de etiquetas redundantes (el color basta) |
| **Desafío real, no clic para ver** | Nombre de memoria (texto libre) → se revela el correcto (si no coincide, el estudiante decide "era lo mismo / me equivoqué") → **función por alternativas** (correcta + 3 funciones de otras estructuras), se reintenta hasta acertar |
| **Retroalimentación clara y separada** | Ficha con bloques: nombre · "También" (chips, solo nombres frecuentes) · **Función** · **Para recordar** (complementa, no repite) · acciones |
| **Código de color consistente** | Verde = correcto · **Rojo suave** (`#E0524A`) = por repasar · **Naranjo** = activa · Violeta = pendiente |
| **Cierre ordenado y discreto** | Una sola tarjeta: resultado → botón principal (siguiente nivel) → "💡 ¿Para qué te sirve?" plegado → línea discreta "✓ Guardado en tu guía · Ver guía" |
| **Progresión con sentido** | Niveles que se desbloquean; transición de imagen (fundido + acercamiento) al pasar de nivel |
| **Coherencia de contenidos** | Sin repetir entre niveles ni adelantar conceptos de otro nivel/clase (p. ej. Schwann se ve en glía); "También" solo sinónimos de uso frecuente (`+` en `sinonimos`) |
| **Énfasis por carrera con sentido** | Solo al completar, como "¿Para qué te sirve esto?" (ejemplo clínico breve) y copiado a la guía |
| Caché del hosting (7 días) | Imágenes y JS con `?v=<fecha>` (import map en `actividad.php`) |

---

## 3. Actividad 1 — contenido final

| Nivel | Imagen | Estructuras |
|---|---|---|
| I · Estructura general (8) | `neurona-base.jpg` (neurona con espinas en todas las dendritas) | Dendritas, Núcleo, Soma, Axón (corchete), Vaina de mielina, Nódulo de Ranvier, Ramas terminales, Botón terminal |
| II · Organelos y especializaciones (6) | La misma `neurona-base.jpg` | Cuerpos de Nissl, Aparato de Golgi, Mitocondria, Segmento inicial del axón (también: cono axónico, zona gatillo), Colateral axónica, Cono de crecimiento |
| III · Citoesqueleto y transporte (6) | `neurona-nivel3-zoom.jpg`: zooms A espina, B axón, C cono, D botón + miniatura de la base con líneas | Espinas dendríticas, Microtúbulos, Neurofilamentos, Proteínas motoras (kinesina/dineína), Filamentos de actina (en espina y cono), Vesículas sinápticas |

Fuentes de imagen en `img/_fuentes/` (no se suben; ignoradas por git). Prompts en `docs/prompts-imagenes.md`.

---

## 4. Para la sesión 03 — cambios pedidos por Fer

### 4.1 Transversal
1. Replicar **todos** los principios de §2 (mesa de trabajo, paso a paso, poco recargado, retroalimentación clara, colores, cierre ordenado).
2. **Misma dinámica y organización** en las tres actividades, para que entender qué hacer no sea un desafío nuevo cada vez.

### 4.2 Actividad 2 — Tipos de neurona
| Pedido | Propuesta / dato |
|---|---|
| Pasar a mesa de trabajo | Vista grande a la izquierda donde aparece **una pregunta a la vez** y las 3 opciones como **tarjetas** (dibujo + nombre); al elegir, la tarjeta se levanta/da vuelta y muestra la retroalimentación (animación). Panel derecho: avance, cuadro que se va completando, cierre |
| Orden | **Primero armar la neurona (dibujo)**, después las frases |
| Frases ordenadas con lógica | Ordenarlas para ir **construyendo el cuadro comparativo paso a paso** (p. ej. por fila: morfología → función/dirección → localización/ejemplo, recorriendo los 3 tipos), en vez de al azar; el cuadro se va llenando en el panel |
| Nivel 3 (subtipos multipolares) se solapa con la actividad 3 | Decidir: **moverlo a la actividad 3** (verlos en la lámina real) o dejar solo un puente breve. Objetivo: no repetir ni alargar la guía |
| ¿Piramidal, Purkinje y motoneurona son las únicas multipolares? | **No.** Son las más grandes, representativas y fáciles de reconocer. Otras multipolares: células granulares (cerebelo, las más numerosas del encéfalo), estrelladas y en cesta (interneuronas), Martinotti, interneuronas espinales, neuronas de núcleos del tronco, etc. Sugerencia: presentarlas como "tres ejemplos representativos", no como la lista completa |
| Golgi I / Golgi II (aparece en una frase y no se vio en clases) | Clasificación por **largo del axón**: Golgi I = axón largo, de **proyección** (piramidales, Purkinje, motoneuronas); Golgi II = axón corto, **interneuronas locales** (granulares, estrelladas). Decidir: agregar una tarjeta breve de explicación o **eliminar la frase** |
| Concepto de **neurita** (no usado en clases) | Aclararlo en una retroalimentación: neurita = cualquier prolongación del soma (dendrita o axón) cuando no se especifica cuál; útil para entender bipolar y pseudounipolar |

### 4.3 Actividad 3 — Lámina
| Pedido | Propuesta / dato |
|---|---|
| Homogeneizar con la mesa de trabajo | Mismo patrón: vista = lámina, panel = pasos con avance, retroalimentación y cierre como en la actividad 1 |
| Agregar lámina con **cresil violeta** (Nissl) | `https://histologyguide.com/slideview/MHS-283-brain/06-slide-1.html`. Selector simple Golgi ⇄ Cresil violeta en la vista. Corregir textos: con Golgi la capa granular casi no se ve; con cresil violeta se ven todos los somas (capa granular muy poblada) |
| Tarea comparativa | P. ej. ubicar la misma zona (corteza cerebral o cerebelo) en ambas tinciones y responder qué muestra cada una (Golgi = neuronas completas pocas; Nissl = todos los somas, sin prolongaciones) |
| Orientación inicial | Breve descripción de lo que se ve en un corte sagital de cerebro de rata (corteza, hipocampo, cerebelo y folias, tronco, bulbo olfatorio) para que se ubiquen |
| **Herramienta de recorte** | El navegador no puede capturar un iframe de otro sitio, así que el estudiante igual hace la captura (Win+Shift+S / pegar), pero luego **recorta dentro de NeuroLab** (canvas con selección) |
| **Etiquetar sobre la imagen** | En vez de casillas ✓, el estudiante hace clic en la captura y agrega etiquetas (soma, dendrita apical, axón…); se guardan y van a la guía con la imagen anotada |

### 4.4 Guía final
- Incluir las **imágenes trabajadas**: esquema de la neurona con todas sus estructuras rotuladas (niveles I–III), dibujos del armado, capturas anotadas de la lámina, etc.

---

## 5. Pendiente para producción (Fer)

1. GitHub Desktop → `main` → **Push origin** (local va 13 commits adelante).
2. FileZilla — si hay dudas de qué quedó arriba, subir **todo** este listado (misma subcarpeta en ambos paneles, reemplazando):
   `_partials/iconos_neurona.php _partials/mesa.php _partials/rutas.php actividad.php admin/migrate.php api/labeling_check.php css/activity.css css/guia.css css/mesa.css css/practico.css css/quiz.css data/practicos.php data/schema.sql data/seed.sql guia.php index.php practico.php js/activity.js js/armar-neurona.js js/guia.js js/labeling.js js/practica.js js/tareas.js img/neurona-base.jpg img/neurona-nivel3-zoom.jpg img/tipos/*.png`
3. Abrir `admin/migrate.php` y luego `admin/seed.php` (debe decir **actividades: 8**).
4. Verificar: `.../img/neurona-nivel3-zoom.jpg` muestra **4 círculos** (A–D).

**Lecciones de despliegue:** comprobar en producción por tamaño de archivo (lo hice comparando bytes desde el navegador); si se cambia `seed.sql` hay que **ejecutar** `admin/seed.php`; GitHub Desktop abierto mientras se actualiza el repo puede dejar `.git/index.lock`.

---

## 6. Prompt para la sesión 03

```
Retomo NeuroLab (C:\repo\neurolab). Lee docs/sesiones/sesion-02_practico-celulas-1.md completo.
La actividad 1 (Partes de la neurona, 3 niveles) está cerrada: úsala como MODELO de diseño.
Tarea: rediseñar la actividad 2 (Tipos de neurona) y la actividad 3 (Lámina) siguiendo los
principios de la sección 2 y los pedidos de la sección 4 (4.1 a 4.4), para que las tres
actividades tengan la misma dinámica y organización.
Antes de programar: propón en una tabla el diseño de cada actividad (vista, panel, pasos,
retroalimentación, cierre, qué va a la guía) y resuelve conmigo las decisiones abiertas:
nivel 3 de subtipos (¿se mueve a la lámina?), frase de Golgi I/II (¿explicar o quitar?),
dónde explicar "neurita". Luego implementa por partes, probando con PHP 8.3 + Playwright
en 1366×660 y celular; commits locales con mi autoría; dime exactamente qué subir.
Al cerrar, escribe docs/sesiones/sesion-03_*.md con reporte + prompt siguiente.
```
