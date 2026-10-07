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

## 5. Pendientes / ideas

1. Fer revisa en producción la redacción de los casos del quiz (§3) y de los textos «Para recordar» de la act. 2.
2. El badge de la ruta dice «ETMP097 Neurobiología · Terapia Ocupacional»: si el práctico también es para Fono, generalizar el texto en `data/practicos.php`.
3. `js/practica.js` y `js/tareas.js` quedan solo como respaldo (ya no los usa ninguna actividad del práctico): se pueden borrar más adelante.
4. Células II: lámina de médula (glía + circuito reflejo), reutilizando `lamina.js` (captura → recorte → etiquetas) y el armado de `tipos.js` para dibujar el circuito.

---

## 6. Prompt para la sesión 04

```
Retomo NeuroLab (C:\repo\neurolab). Lee docs/sesiones/sesion-03_actividades-2-3-carrera-quiz.md completo
(y si hace falta, la sesión 02 para los principios de diseño de la mesa de trabajo).
Estado: el práctico Células nerviosas I está completo (4 actividades en mesa de trabajo, barra con switch
TO/Fono, quiz por pools, guía con imágenes). Primero: revisa conmigo lo que observé en producción
(sección 4, punto 4 del reporte) y corrige lo que encuentre.
Luego: diseñar el práctico Células nerviosas II (circuitos y glía) con la misma dinámica. Lámina de médula
espinal para ver glía y para que dibujen el circuito reflejo (neurona sensitiva → interneurona → motoneurona).
Antes de programar: propón en una tabla las actividades (vista, panel, pasos, retroalimentación, cierre,
qué va a la guía, pool del quiz común/TO/Fono) y resuelve conmigo las decisiones abiertas.
Implementa por partes, probando con PHP 8.3 + Playwright en 1366×660 y celular; commits locales con mi
autoría; dime exactamente qué subir. Al cerrar, escribe docs/sesiones/sesion-04_*.md con reporte + prompt siguiente.
```
