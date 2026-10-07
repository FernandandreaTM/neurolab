# Sesión 03 — Tipos de neurona, Lámina, barra con modo de carrera y quiz por pools

**Fecha:** 2026-10-06/07 · **Asignatura:** ETMP097 Neurobiología · **Práctico:** Células nerviosas I (`practico.php?p=celulas-1`)
**Estado:** las 4 actividades del práctico tienen la misma dinámica de **mesa de trabajo** (vista a la izquierda + panel a la derecha, paso a paso, mismo código de color y cierre). Probado con PHP 8.3 + Playwright en 1366×660 y 390×844 (celular).

---

## 1. Qué quedó construido

| Pieza | Qué hace | Archivos |
|---|---|---|
| **Barra superior común** | Logo NeuroLab + UACh, «← Ruta», título, píldoras de nivel, **switch de carrera TO / Fono** y «📘 Mi guía». En actividad, ruta, guía y quiz | `_partials/barra.php`, `css/base.css` |
| **Modo de carrera** | Siempre hay un modo: **TO por defecto**, Fono con un toque. Se guarda en el navegador (`nl_carrera`). Oculta lo de la otra carrera: «¿Para qué te sirve?» en los cierres y en la guía (cambia al instante) | `js/carrera.js`, `js/guia.js` (bloque `conexion`) |
| **Act. 2 · Tipos de neurona** (2 niveles, `&nivel=1/2`) | **I Armar:** lienzo blanco con piezas; multipolar → bipolar → pseudounipolar; ficha Morfología + Para recordar. **II Cuadro comparativo:** frase grande + 3 tarjetas con ícono que se dan vuelta (rojo + pista / verde); cada acierto escribe su celda en el cuadro 3×3 del panel, fila por fila (morfología → función → localización, al azar dentro de la fila); cierre con el cuadro completo | `js/tipos.js`, `_partials/mesa.php`, `actividad.php`, `api/practica_check.php`, `js/armar-neurona.js` (exporta geometría) |
| **Act. 3 · Lámina: neuronas reales** (3 niveles) | **I Orientación:** esquema propio del corte sagital de rata (bulbo olfatorio, corteza, hipocampo, cerebelo, tronco) con el motor de la act. 1. **II Piramidal y Purkinje con Golgi** y **III Cerebelo con Golgi y cresil violeta:** por captura 4 pasos — buscar y pegar (Ctrl+V) o subir · **recortar dentro de NeuroLab** · **etiquetar sobre la imagen** (lista fija: tocar etiqueta → tocar lugar) · preguntas con pista. Selector de tinción Golgi ⇄ Cresil | `js/lamina.js`, `img/corte-sagital-rata.jpg` (fuente SVG en `img/_fuentes/`, no se sube) |
| **Quiz de cierre en mesa** | Pregunta en la vista (alternativas A–D o tarjetas), avance 1…22 y ficha en el panel; **una oportunidad por pregunta**; resultado grande al final. **Pool común + pool de la carrera activa**; cada carrera guarda su propio avance | `js/quiz-mesa.js` |
| **Guía con imágenes (4.4)** | Neurona/corte **rotulados con sus números** en cada nivel de identificación · **dibujos** de las 3 neuronas armadas · **cuadro comparativo** completo · **capturas etiquetadas** de la lámina · tabla del quiz | `js/labeling.js`, `js/tipos.js`, `js/lamina.js` |
| Datos | `practica_items` + columnas `fila`, `celda`, `nota` (migración). Seed: niveles de la act. 2 reordenados; lámina con recurso `tareas` por niveles + `labeling_parts` del corte; quiz con `id`, `carrera` y `tarjetas` | `admin/migrate.php`, `data/schema.sql`, `data/seed.sql`, `data/practicos.php` |

## 2. Decisiones tomadas con Fer

| Tema | Decisión |
|---|---|
| Subtipos multipolares (ex nivel 3 act. 2) | **Movidos a la lámina** (piramidal y Purkinje reales). La motoneurona queda como ejemplo en el cuadro: «la verás en la médula en el práctico Células II» |
| Frase Golgi I / II | **Eliminada.** Reemplazo: «piramidal y Purkinje son ejemplos de multipolares» (3 ejemplos representativos, no los únicos) |
| «Neurita» | Se explica en las instrucciones del nivel I y en la ficha de la **bipolar** |
| Etiquetado de capturas | **Lista fija** de etiquetas; se revisa que estén todas, no su posición |
| Logos de la barra | NeuroLab + UACh chico (UACh se oculta en celular) |
| Carrera | Switch siempre con modo; **TO por defecto** |
| Médula espinal | Se verá en **Células II** (glía + circuito reflejo sensitiva → interneurona → motoneurona), no en este práctico |

## 3. Quiz: pools (22 preguntas por estudiante)

| Pool | Preguntas |
|---|---|
| **Común (18)** | 14 del banco que no repiten actividades (soma, Nissl, espinas, zona gatillo, flujo de información, transporte antero/retrógrado, diámetro y velocidad, mielina, núcleos, aferente/eferente, neurotransmisor, postmitótica…) + 4 casos con tarjetas: neuropatía diabética → pseudounipolar · reflejo rotuliano aferente → pseudounipolar · reflejo rotuliano eferente → multipolar · anosmia por golpe → bipolar |
| **TO (4)** | ACV corteza motora, debilidad del brazo opuesto → piramidal · ELA, asta ventral → motoneurona · marcha atáxica y dismetría → Purkinje · lesión de raíz dorsal, abotonarse sin mirar → pseudounipolar |
| **Fono (4)** | Hipoacusia neurosensorial, ganglio coclear → bipolar · afasia de Broca → piramidal · disartria atáxica → Purkinje · núcleo del hipogloso, lengua débil y atrófica → motoneurona |

Quitadas por repetir actividades: preguntas 11–14 y 17–21 del banco anterior (tipos, más común en corteza, piramidal, Purkinje).

## 4. Para producción (Fer)

1. GitHub Desktop → `main` → **Push origin**.
2. FileZilla (misma subcarpeta en ambos paneles, reemplazando):
   `_partials/barra.php _partials/mesa.php actividad.php admin/migrate.php api/practica_check.php css/base.css css/mesa.css data/practicos.php data/schema.sql data/seed.sql guia.php practico.php img/corte-sagital-rata.jpg js/armar-neurona.js js/carrera.js js/guia.js js/labeling.js js/lamina.js js/quiz-mesa.js js/tipos.js`
   (si lo de la sesión 02 aún no estaba arriba, sube también su listado de §5).
3. Abrir **`admin/migrate.php`** (debe decir «Columnas agregadas: practica_items.fila, practica_items.celda, practica_items.nota» la primera vez) y luego **`admin/seed.php`** (debe decir **actividades: 8**).
4. Verificar en producción:
   - La lámina de **cresil violeta** (MHS-283) se ve dentro de NeuroLab (aquí no se pudo probar la lámina externa).
   - Switch TO/Fono: en el cierre de cualquier nivel, «¿Para qué te sirve?» muestra solo la carrera activa.
   - Quiz: con TO aparecen las preguntas con etiqueta **TO**; al cambiar a Fono, el quiz se rearma con las de **Fono**.

**Notas:** las 4 capturas de la lámina ocupan ~0,9 MB del almacenamiento del navegador (límite ~5 MB): si varios grupos usan el mismo equipo, «Empezar de nuevo» o borrar la guía. El progreso de la versión anterior de las actividades 2 y 3 no se conserva (claves nuevas).

## 5. Observaciones de Fer en producción → trabajo de la sesión 04

| # | Pedido | Diagnóstico / propuesta para partir |
|---|---|---|
| 1 | **Guía**: no se limpia ni se actualiza (aparecen las fotos nuevas de la lámina **y** las viejas); no salen la neurona rotulada (act. 1) ni los dibujos de los tipos (act. 2); le faltan banner, logos y un formato más estilizado pero imprimible; hay textos muy claros sobre blanco y demasiados tamaños de letra; títulos y subtítulos repiten lo mismo; debe exportar **solo la carrera activa** | La guía (`nl_guia` en localStorage) conserva secciones de claves antiguas (`lamina-neurona-piramidal` sin `:n`, `comparador-tipos-neurona:3`…): `guia.php` debe mostrar **solo las claves de `data/practicos.php`** y purgar las demás (o versionar la guía). Revisar por qué no se ven `imagenes`/`figuras` en producción (¿`svgSeguro` filtra el SVG?, ¿la sección se guardó antes de existir la imagen?, ¿archivos JS/CSS sin subir o caché?). Rediseño: encabezado con banner + logos NeuroLab/UACh/TecMedHUB, fondo blanco, acentos en un solo color, escala de 3 tamaños de letra, grises con contraste AA; quitar subtítulos redundantes; secciones de la otra carrera (quiz y «¿Para qué sirve?») fuera también del PDF |
| 2 | **Lámina, nivel I (corte de rata)**: aviso del propósito al iniciar | Tarjeta inicial que se pliega (o desplegable fijo «¿Por qué un cerebro de rata?»): el objetivo **no es aprender anatomía de la rata**, sino orientarse para **interpretar las imágenes reales** de los niveles siguientes; la anatomía no es idéntica a la humana, pero hay estructuras equivalentes reconocibles y **las funciones son las mismas** |
| 3 | **Lámina, nivel III**: se centró demasiado en la tinción y poco en **comparar e interpretar** («ahora entiendo por qué en Golgi no veo la capa granular»); distractores débiles (la correcta es la más larga o la más explicada) | Reescribir las preguntas como interpretación de lo observado: qué ves en cada captura → por qué. Igualar el largo y el nivel de detalle de las 4 alternativas (distractores plausibles). **Opcional, si no complica mucho:** buscar en las mismas láminas neuronas de la **corteza** o del **hipocampo**. Las muy frondosas del hipocampo con Golgi suelen ser las **piramidales de CA1/CA3** (dendritas apicales y basales muy ramificadas) y las **granulares del giro dentado** (árbol en abanico, sin dendritas basales): **verificar en la lámina**. Si complica, pasarlo al práctico 2 junto con un circuito de corteza |
| 4 | **Página principal y navegación**: agregar el práctico al inicio y que se llegue navegando; arreglar los logos y el nav (que no se ven bien; usar como referencia el nav del repo **digitalduck** de Fer); en el pie separar **otros recursos educativos** (p. ej. LabiMed) de **contacto** (Instagram de TecMedHUB); agregar a las ayudantes en las atribuciones, al estilo de https://tecmedhub.org/hitomonteverde/libro.html | Ayudantes: **Kaira Santos**, estudiante de Psicología, https://github.com/kamarisss · **Marcelo Rojas**, estudiante de Enfermería, https://github.com/mikaelroxas-glitch. Pedir acceso al repo digitalduck (o la URL del sitio) al empezar. Unificar `_partials/nav.php` (sitio) y `_partials/barra.php` (actividades) en un solo estilo |
| 5 | **Dirección de la información** (el quiz la pregunta y ninguna actividad la trabaja) | En **Tipos de neurona, nivel I**: después de armar cada neurona correctamente, un segundo paso: **dibujar/colocar la flecha** del sentido de la información (de dendrita a terminal axonal; en la pseudounipolar, de la rama periférica a la central). Se revisa en `api/practica_check.php`; la flecha queda en el dibujo de la guía |
| 6 | **Recortador** demasiado complicado (tomar pantallazo → pegar → recortar) | El navegador no puede leer los píxeles del iframe de otro sitio, pero sí puede **capturar la pestaña** con permiso del estudiante (`navigator.mediaDevices.getDisplayMedia`, opción `preferCurrentTab`): un botón **«📷 Capturar»** → el navegador pide «compartir esta pestaña» → se toma un cuadro → se abre directo el recorte. Funciona en Chrome/Edge de escritorio; en celular y Safari queda «Subir imagen» como respaldo. Elimina el paso de pegar |
| 7 | **Quiz final** desordenado y con temas repetidos poco relevantes (p. ej. dos preguntas de transporte anterógrado/retrógrado) | Orden **lógico y progresivo** (no al azar): estructura → organelos → flujo de información → conducción/mielina → tipos y localización → casos clínicos (común → carrera). Fusionar las dos de transporte axonal en una; revisar otras redundantes y que cada pregunta aporte un concepto distinto; distractores de largo parejo |

## 6. Otros pendientes

1. El badge de la ruta dice «ETMP097 Neurobiología · Terapia Ocupacional»: generalizar si el práctico también es para Fono.
2. `js/practica.js` y `js/tareas.js` quedan solo como respaldo: borrar cuando se confirme que nada los usa.
3. Células II: lámina de médula (glía + circuito reflejo), reutilizando `lamina.js` y el armado de `tipos.js`.

---

## 7. Prompt para la sesión 04

```
Retomo NeuroLab (C:\repo\neurolab). Lee docs/sesiones/sesion-03_actividades-2-3-carrera-quiz.md completo
(y la sesión 02 para los principios de diseño de la mesa de trabajo).
Tarea: resolver las 7 observaciones de la sección 5, en este orden de prioridad:
 1) Guía: limpiar secciones viejas (mostrar solo las claves de data/practicos.php), arreglar las imágenes que no
    salen (neurona rotulada, dibujos de tipos), rediseño imprimible con banner y logos, contraste y escala de letra,
    sin títulos/subtítulos redundantes, y exportar solo la carrera activa.
 7) Quiz: orden lógico y progresivo, sin preguntas repetidas (transporte axonal) y distractores de largo parejo.
 5) Tipos de neurona nivel I: tras armar, marcar con flecha el sentido de la información.
 6) Lámina: botón «Capturar» con getDisplayMedia (pestaña actual) → recorte directo; subir imagen como respaldo.
 3) Lámina nivel III: preguntas de comparar/interpretar, distractores parejos; evaluar neuronas de corteza o
    hipocampo (si complica, dejarlo para el práctico 2).
 2) Lámina nivel I: aviso plegable del propósito del corte de rata.
 4) Página principal: enlace al práctico, nav nuevo (pídeme acceso al repo digitalduck como referencia), pie con
    «Otros recursos» separado de «Contacto» y atribuciones con las ayudantes (Kaira Santos y Marcelo Rojas, con su GitHub).
Antes de programar: propón en una tabla el diseño de la guía, el orden del quiz y la mecánica de la flecha, y
resuelve conmigo las decisiones abiertas. Implementa por partes, probando con PHP 8.3 + Playwright en 1366×660 y
celular; commits locales con mi autoría; dime exactamente qué subir. Al cerrar, escribe
docs/sesiones/sesion-04_*.md con reporte + prompt siguiente.
```
