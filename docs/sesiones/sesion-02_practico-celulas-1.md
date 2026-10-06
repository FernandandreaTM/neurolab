# Sesión 02 — Diagnóstico y ajuste del práctico Células nerviosas I

**Fecha:** 2026-10-06 · **Práctico:** 2026-10-07 · ETMP097 TO · ~120 min presenciales · autoguiado en NeuroLab
**Enlace para estudiantes:** `https://tmeduca.org/ferlopezmoncada/neurolab/practico.php?p=celulas-1`

## 1. Estado al iniciar

| Punto | Estado |
|---|---|
| `js/labeling.js` (855a2d2) en producción | ✅ Verificado en el navegador (contiene `pedirParte` y la recuperación de función) |
| `main` pusheado | ❌ origin/main = f7f784b; faltaban 1732a7d y 855a2d2 (+ los de esta sesión) |
| histologyguide incrustado | ✅ Se ve dentro de NeuroLab en producción |
| `git fetch` dejó `.git/index.lock` | Borrado (bloqueaba commits) |

## 2. Fuentes usadas para alinear

| Fuente | Uso |
|---|---|
| `Células del sistema nervioso I.pdf` (2026) | Funciones por parte (recepción, integración en cono/zona gatillo, conducción, transmisión), Nissl, transporte axonal, clasificación |
| `PRACTICO 6 CELULAS DEL SN ETMP097 2025.pdf` | Partes I, II, III-1 (Golgi: piramidal y Purkinje) |
| Banco Moodle Células I 2025 (30 preguntas) | 17 preguntas de neurona al quiz; las de glía quedan para Células II |

## 3. Diagnóstico de actividades

| Actividad | Antes | Ajuste |
|---|---|---|
| Identificación | Funciona; funciones no calzaban con la clase | Funciones = clase 2026; sinónimos: montículo axonal, zona gatillo, pericarion, célula de Schwann, terminal sináptico, cilindroeje |
| Comparador (tabla) | Respuestas visibles antes de practicar | Instrucciones + cuadro resumen desplegable (morfología, función, dirección, localización) |
| Nivel 1 frases | 9 ítems, sólo morfología | 14 ítems: + retina, coclear/vestibular, motoneurona asta ventral, interneuronas, raíz dorsal |
| Nivel 2 armar | Funciona (probado) | Sin cambios |
| Nivel 3 subtipos | "Próximamente" | Activo: 6 ítems piramidal / Purkinje / motoneurona |
| Lámina Golgi | Sólo iframe | Título nuevo + pestaña **Guía de observación** (5 tareas + 5 preguntas con respuesta desplegable) |
| Quiz de cierre | No existía | `quiz-celulas-nerviosas-1`: 23 preguntas, opciones mezcladas, feedback; al terminar marca la actividad como completada |
| Quiz (motor) | Sin estilos (CSS no venía de CellView); decía "20 preguntas" fijo | `css/quiz.css`; contador real; si la actividad es sólo quiz, se muestra en el panel principal |
| Simulador PhET / Quiz potencial | No son de Células I | Fuera de la ruta; sin cambios |

## 4. Recorrido del práctico (`practico.php?p=celulas-1`, 115 min)

| # | Paso | Min | Modo |
|---|---|---|---|
| 1 | Encuadre | 5 | Docente |
| 2 | Identificación: partes + función (guía I) | 15 | NeuroLab |
| 3 | Flujo recepción → integración → conducción → transmisión | 5 | Docente |
| 4 | Comparador niveles 1–2 + cuadro resumen (guía II) | 20 | NeuroLab |
| 5 | Nivel 3 subtipos multipolares | 10 | NeuroLab |
| 6 | Lámina Golgi: piramidal y Purkinje (guía III-1) | 25 | NeuroLab + Fer valida captura |
| 7 | Morfología ↔ función ↔ localización | 10 | Docente |
| 8 | Quiz de cierre | 15 | NeuroLab |
| 9 | Cierre y dudas | 10 | Docente |

Médula espinal H-E + arco reflejo (guía III-2) y glía → Células II. Los pasos se editan en `data/practicos.php` (no requiere seed). Desde la ruta, cada actividad muestra "← Volver a la ruta del práctico" y la ruta marca las completadas.

## 5. Pruebas (PHP 8.3 + Playwright, BD nueva con migrate + seed)

| Prueba | Resultado |
|---|---|
| Ruta: 9 pasos, enlaces, avance "x / 4" | OK |
| Nivel 1 (14), nivel 3 (6) con respuestas correctas | OK, sin errores |
| Nivel 2: bipolar y multipolar correctas; error con pista | OK |
| Lámina: 2 pestañas, guía con desplegables | OK |
| Quiz: 23 preguntas hasta resultados; marca completada | OK |
| Identificación: "montículo axonal" → muestra Cono axónico + función nueva | OK |
| Móvil 375 px (ruta, lámina, comparador) | Sin desborde horizontal |
| Errores JS / HTTP 4xx | Ninguno |

## 6. Commits (locales en `main`)

| Commit | Contenido |
|---|---|
| `a75b797` | Ruta, nivel 3, lámina con guía, quiz de cierre, quiz.css, `?v=` en CSS/JS, favicon |
| (este reporte) | `docs/sesiones/sesion-02_practico-celulas-1.md` |

## 7. Pendiente para producción (Fer, antes del práctico)

1. GitHub Desktop → `main` → **Push origin**.
2. Subir por FileZilla (misma subcarpeta en ambos paneles):
   `actividad.php, practico.php, index.php, css/activity.css, css/practico.css, css/quiz.css, js/activity.js, data/seed.sql, data/practicos.php`
3. Abrir `.../neurolab/admin/seed.php` (no hace falta migrate: no hay cambios de esquema).
4. Probar `.../neurolab/practico.php?p=celulas-1` y abrir el quiz.
5. Compartir el enlace (Siveduc / QR en la sala).

> `seed.php` borra y recarga todo el contenido: el progreso de los estudiantes vive en su navegador, no se pierde.

## 8. Pendientes de revisión por Fer

| Tema | Detalle |
|---|---|
| Contenido nuevo | Revisar textos del nivel 3, guía de observación y quiz (23 preguntas) |
| Nivel 2 | No pide dirección del impulso: queda en el dibujo de la guía |
| Acceso a la ruta | Sólo por enlace directo (no hay botón en index/atlas) |
| PR #9 de mika | Sigue pendiente que lo rehaga sobre `main` actual |
| Admin | `admin/` no edita rutas ni ítems de práctica (se editan en archivos) |

## 9. Prompt para la siguiente sesión

```
Retomo NeuroLab (C:\repo\neurolab). Lee docs/sesiones/sesion-02_practico-celulas-1.md.
Tarea: paso 3 — práctico "Células nerviosas II" (ETMP097, TO): circuitos (arco reflejo,
médula espinal H-E: guía 2025 parte III-2) y glía (SNC/SNP, funciones).
1) Confirma que main está pusheado y que practico.php + seed nuevo están en producción.
2) Recoge lo que Fer observó en el práctico Células I (ajustes a la ruta, quiz, lámina).
3) Lee en OneDrive\Docencia: 2026 "Células del sistema nervioso II 2026.pdf", 2025 "Guía Docente
   - Células del SN II.pdf", "Evaluación formativa - TP Células II.pdf", "PREGUNTAS CELULAS SN ii.txt",
   esquema_sistema_neuroglial.svg.
4) Propón y construye la ruta celulas-2 (data/practicos.php) con: lámina médula espinal
   (histologyguide MHS-240), actividad de circuito reflejo, identificación/comparador de glía, quiz.
Trabaja autónomo; pruebas con PHP 8.3 + Playwright en la nube; commits locales.
Al cerrar, escribe docs/sesiones/sesion-03_*.md con reporte + prompt siguiente.
```
