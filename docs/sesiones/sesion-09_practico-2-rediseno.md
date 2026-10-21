# Sesión 09 · Rediseño del práctico 2 (glía) · 20-10-2026

(La sesión 08 —práctico 2 solo glía, esquemas §8 de `prompts-imagenes.md`— no dejó reporte; su trabajo está en los commits `7a5fb9c` a `8a0eb63`.)

## Pedido

El práctico 2 era repetitivo (las mismas preguntas de función en las tres actividades), con preguntas centradas en la tinción, una sobre el Nissl que no se ve en la lámina, niveles de «escribir de memoria» y un rompecabezas que salía ya ordenado.

## Criterio

| Actividad | Pregunta que responde | Herramientas |
|---|---|---|
| 1 · Conoce la glía | ¿Cómo es y dónde está? | Etiquetar esquemas (nombre → clic) · tarjetas de forma y lugar |
| 2 · La glía en el tejido | ¿La reconozco en un corte real? | Capturas · inmunofluorescencias por forma |
| 3 · La glía en acción | ¿Qué hace y cómo responde? | Etiquetar + recorridos animados · clasificar · rompecabezas mezclado · estados |
| Quiz | Repaso de todo | 12 comunes + 4 por carrera |

Contenido nuevo tomado de la clase (nunca preguntado antes): proporción glía:neurona ≈ 1:1, origen de la microglía, sincicio de astrocitos, lactato y glucógeno, qué cruza la BHE (L-dopa, órganos circunventriculares), composición de la mielina (MBP, PLP, P0), neurilema, fibras Aα–C, aplastamiento frente a corte, experimento de Aguayo, estados M0/M1/M2 y A1/A2/cicatriz, precursores NG2.

## Cambios de motor (compatibles con lo anterior)

| Archivo | Cambio |
|---|---|
| `js/circuito.js`, `_partials/mesa.php`, `css/mesa.css` | En niveles «circuito» con `etiquetas`, las `vias` se responden tocando las etiquetas puestas en orden; se anima el recorrido (`ruta` en px de `vb`) y se dibuja en la guía. Cada vía acepta `ayuda` (texto del panel). |
| `js/rompecabezas.js`, `_partials/mesa.php`, `css/mesa.css` | Opciones `barajar` (bandeja en orden aleatorio, fijo por estudiante) y `anonimas` («Pieza A…» hasta ponerla bien; miniaturas más grandes). |
| `js/mesa-practica.js` | Las tarjetas de «elegir» salen barajadas (antes la primera tarjeta era siempre la respuesta del primer ejercicio). |

## Pendiente

| Qué | Quién |
|---|---|
| Probar en producción (escritorio y celular), sobre todo los recorridos de «La glía en acción» I y el rompecabezas IV | Fer |
| Revisar textos con la clase (tareas K y N de ayudantes siguen vigentes) | Ayudantes |
| Estudiantes que ya avanzaron con la versión anterior: niveles renumerados (Conoce la glía IV y La glía en acción V cambiaron); conviene «Reiniciar avance» | — |

## Prompt para la sesión siguiente

```
Retomo NeuroLab (C:\\repo\\neurolab). Lee docs/sesiones/sesion-09_practico-2-rediseno.md y docs/practico-2_tareas.md.
Revisa conmigo cómo funcionó el práctico 2 rediseñado y corrige lo que te reporte. Luego proponer el práctico 3
(potencial de acción y canales iónicos) en tabla antes de programar, reutilizando los recorridos animados y las
tarjetas barajadas. Pruebas con PHP 8.3 + Playwright (1366×660 y celular). Al cerrar, docs/sesiones/sesion-10_*.md.
```
