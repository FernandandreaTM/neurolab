# Sesión 04: guía, quiz, flecha de la información, captura de la lámina e inicio

**Fecha:** 2026-10-07 · **Asignatura:** ETMP097 Neurobiología · **Práctico:** Células nerviosas I (`practico.php?p=celulas-1`)
**Estado:** se resolvieron las 7 observaciones de la sesión 03 (§5), en el orden 1 → 7 → 5 → 6 → 3 → 2 → 4. Todo se probó con PHP 8.3 + Playwright en 1366×660 y 390×844, sin errores de JS. Hay 5 commits locales con la autoría de Fer.

---

## 1. Qué quedó construido

| # | Pedido | Solución | Archivos |
|---|---|---|---|
| 1 | **Guía**: no se actualizaba, faltaban imágenes, diseño | **Causa:** el almacenamiento del navegador se llenaba (capturas repetidas y secciones viejas). Pasado ~5 MB `localStorage` falla sin avisar y la guía deja de guardarse; por eso estaban las tablas pero no las imágenes. **Solución:** las imágenes pasan a **IndexedDB**, la guía guarda solo la referencia (~6 KB en vez de MB) y las secciones antiguas se migran solas. `guia.php` muestra **solo las claves de `practicos.php`**, borra las demás y el avance de módulos viejos (`nl_tareas_*`, `nl_practica_*`), y avisa si no puede guardar. **Diseño:** banner violeta con logos NeuroLab · escudo UACh · TecMedHUB; título, asignatura · carrera, objetivo, integrantes y fecha; `H2` = actividad numerada y `H3` = nivel, sin subtítulos ni fechas repetidas; 3 tamaños de letra (1,5 / 1,05 / 0,9 rem) y grises con contraste AA; A4 imprimible; lo pendiente aparece al final y no se imprime. **Carrera:** «¿Para qué te sirve?» y el quiz salen solo de la carrera activa, en pantalla y en PDF. El quiz se guarda por carrera (`quiz-…|carrera`) | `js/guia.js`, `guia.php`, `css/guia.css`, `practico.php`, `img/uach-escudo.png`, `img/tecmedhub-logo.jpg` |
| 7 | **Quiz** desordenado y repetido | **18 preguntas en orden fijo**: 10 conceptos (soma → Nissl → espinas → zona gatillo → recorrido de la información → transporte axonal → velocidad de conducción → núcleos/ganglios → aferente/eferente → postmitótica) + 4 casos comunes + 4 casos de la carrera. Se fusionaron las dos de transporte, diámetro con mielina y las dos de aferente/eferente, y se quitó la del neurotransmisor. Las alternativas tienen largos parejos (±10 %), con distractores que son errores frecuentes | `data/seed.sql`, `js/quiz-mesa.js`, `data/practicos.php` |
| 5 | **Sentido de la información** | En Tipos de neurona, nivel I, después de armar bien hay un **paso 2**: tocar la prolongación por donde **entra** y la prolongación por donde **sale**. Se revisa en el servidor: multipolar y bipolar van de dendrita a axón; la pseudounipolar va de la rama periférica (receptores) a la rama central (botones), sin pasar por el soma. Si hay error, se marca en rojo con una pista y se reintenta. Al acertar, una flecha naranja animada recorre la neurona; la flecha queda en el resumen y en el dibujo de la guía | `js/tipos.js`, `api/practica_check.php`, `css/mesa.css`, `css/guia.css`, `data/seed.sql` (instrucciones) |
| 6 | **Captura** complicada | Botón **«📷 Capturar la lámina»**: el navegador pide compartir **esta pestaña**, se toma un cuadro, se recorta **solo el área de la lámina** (Region Capture en Chrome/Edge; si no está, se recorta según la posición de la lámina) y se abre directo el recorte. Pegar y subir quedan como respaldo; en celular solo aparece el respaldo | `js/lamina.js`, `css/mesa.css` |
| 3 | **Lámina nivel III** muy centrada en la tinción | 5 preguntas de **interpretar y comparar** lo que muestran tus capturas: por qué la capa granular se ve vacía con Golgi, cómo reconocer una Purkinje aislada, por qué el cresil no muestra el árbol dendrítico, qué explica el cambio entre las dos capturas y qué tinción elegir para contar y cuál para ver la forma. Alternativas de largo parejo. **Hipocampo y corteza quedan para Células II** | `data/seed.sql` |
| 2 | **Lámina nivel I**: propósito | Aviso plegable «🐀 ¿Por qué un cerebro de rata?». Se abre en la primera visita; si el estudiante lo cierra, queda cerrado | `_partials/mesa.php`, `css/mesa.css` |
| 4 | **Inicio y navegación** | **Nav común al estilo DigitalDuck** (degradado, logos NeuroLab + UACh blanco, Inicio · Atlas · menú **🧪 Prácticos** con las rutas de `practicos.php` · 📘 Mi guía · 🔒 admin; menú plegable en celular) en inicio, atlas y temas. **Tarjeta del práctico** en el inicio. **Pie común** en tres columnas, NeuroLab · **Otros recursos educativos** (CellView, LABIM3D, LABIMATHS, histologyguide) · **Contacto** (Instagram TecMedHUB y TM UACh PM, correo), y una franja de **equipo** al estilo del libro de Monte Verde: Fernanda López-Moncada (@FernandandreaTM), **Kaira Santos** (Psicología, @kamarisss) y **Marcelo Rojas** (Enfermería, @mikaelroxas-glitch), con su foto de GitHub. La barra de las actividades usa el logo UACh blanco (antes estaba en una caja blanca). La ruta vuelve a «← Inicio». El inicio ya no tiene desborde horizontal en celular | `_partials/nav.php`, `_partials/footer.php`, `_partials/barra.php`, `css/base.css`, `index.php`, `atlas.php`, `tema.php`, `img/uach-blanco.png` |
| — | Import map común | `nl_importmap_tag()` pasa a `barra.php` y se emite una vez por página: guía y ruta también cargan los módulos con `?v=` (sin caché vieja) | `_partials/barra.php`, `actividad.php` |

## 2. Decisiones tomadas con Fer

| Tema | Decisión |
|---|---|
| Imágenes de la guía | IndexedDB (localStorage solo para texto) |
| Largo del quiz | 18 (10 + 4 + 4) |
| Flecha | Tocar entrada → salida (funciona igual en celular) |
| Hipocampo / corteza en la lámina | Se deja para **Células II** |
| Recursos de Instagram en el inicio | Se quitaron de «Otros recursos» (son contacto y van al pie) |

## 3. Para producción (Fer)

1. GitHub Desktop → `main` → **Push origin** (local va 7 commits adelante: 1 de docs de la sesión 03 + 5 de esta sesión + este reporte).
2. FileZilla (misma subcarpeta en ambos paneles, reemplazando):
   `_partials/barra.php _partials/footer.php _partials/mesa.php _partials/nav.php actividad.php api/practica_check.php atlas.php css/base.css css/guia.css css/mesa.css data/practicos.php data/seed.sql guia.php index.php practico.php tema.php js/guia.js js/lamina.js js/quiz-mesa.js js/tipos.js img/tecmedhub-logo.jpg img/uach-blanco.png img/uach-escudo.png`
3. Abrir **`admin/seed.php`** (debe decir **actividades: 8**). No hace falta `migrate.php`.
4. Verificar en producción:
   - **Guía:** abrir `guia.php?p=celulas-1` en el navegador donde fallaba: deben desaparecer las secciones viejas. Si a una sección le falta su imagen (porque nunca se guardó), basta abrir ese nivel otra vez: la imagen se regenera sola.
   - **Capturar** (Chrome/Edge de escritorio): Lámina nivel II → «Capturar la lámina» → elegir «Esta pestaña» → se abre el recorte **solo con la lámina**. Revisar que la lámina externa (histologyguide) salga en la captura; aquí se probó con una lámina simulada.
   - **Quiz:** «Empezar de nuevo» si alguien ya lo tenía a medias (el avance anterior se reinicia solo porque cambiaron las preguntas).
   - Fotos del equipo en el pie (vienen de github.com).

**Notas:** quien ya terminó Tipos de neurona nivel I con la versión anterior conserva sus neuronas **sin flecha**; con «Empezar de nuevo» la hace. Las respuestas que ya estaban dadas en la lámina nivel III quedan marcadas aunque cambió el texto.

## 3b. Segunda ronda (revisión de Fer en producción)

| Pedido | Solución | Archivos |
|---|---|---|
| «¿Para qué te sirve?» repetido entre niveles (act. 2 y 3) y sin sentido en lámina I | Textos **propios de cada nivel** en `data/practicos.php` (`'conexion' => [clave => textos]`): tipos I (sentido de la información), tipos II (forma y ubicación orientan la evaluación), lámina II (piramidal vs. Purkinje), lámina III (tinciones y plasticidad). Lámina I: `null` (no se muestra). Si un nivel no está ahí, se usa el texto de la actividad (panel admin) | `data/practicos.php`, `_partials/mesa.php` |
| Lámina II: faltaba la sustancia blanca y la pista adelantaba la capa celular | Purkinje: «Dónde buscar» sin mencionar capas; etiqueta **Sustancia blanca**; preguntas: ubicación del soma → **sustancia blanca** → «bajo la hilera hay una capa que se ve vacía, ¿qué crees que hay?» (deducen que es la granular, que la plata no tiñe) → función. En el nivel III la primera pregunta con Golgi pasa a la capa molecular (para no repetir) | `data/seed.sql` |
| Act. 1: no salía la neurona rotulada | En producción, con un navegador limpio, la imagen sí se guarda. En los navegadores donde la sección se guardó cuando el almacenamiento estaba lleno, la imagen faltaba. Ahora **la guía se repara sola**: si una sección de identificación no tiene imagen, abre ese nivel en un marco oculto, la vuelve a dibujar y la guarda | `guia.php` |
| Íconos de los tipos en el cuadro comparativo | La cabecera del cuadro en la guía lleva el ícono de cada tipo (`img/tipos/*.png`) | `js/tipos.js`, `js/guia.js`, `css/guia.css` |
| Descargar la guía en HTML | Botón principal **«⬇ Descargar guía (HTML)»**, arriba de «Imprimir o guardar PDF»: un solo archivo `guia-<práctico>-<integrantes>.html` con estilos e imágenes adentro (se abre sin conexión y también se imprime) | `guia.php`, `css/guia.css` |

**Subir:** `_partials/mesa.php css/guia.css data/practicos.php data/seed.sql guia.php js/guia.js js/tipos.js` y luego abrir `admin/seed.php`. En los navegadores que ya tenían la guía, los textos «¿Para qué te sirve?» y el cuadro con íconos se actualizan cuando se vuelve a abrir ese nivel.

## 4. Pendientes

1. **«LabiMed»**: no encontré la URL. Pásamela (y la de DigitalDuck si quieres incluirla) para sumarla a «Otros recursos» en `_partials/footer.php` (lista `$nl_recursos`).
2. Lámina nivel II: las alternativas también tienen la correcta más larga. Se pueden igualar como en el nivel III.
3. De la sesión 03: el badge «ETMP097 Neurobiología · Terapia Ocupacional» de `practicos.php` (la guía y el inicio ya muestran solo «ETMP097 Neurobiología»); borrar `js/practica.js` y `js/tareas.js`; Células II.
4. Las secciones del inicio que se animan al hacer scroll (`.reveal`) y las estadísticas (8 · 5 · 1) quedaron como estaban.

---

## 5. Prompt para la sesión 05

```
Retomo NeuroLab (C:\repo\neurolab). Lee docs/sesiones/sesion-04_guia-quiz-flecha-captura-inicio.md completo
(y la sesión 02 para los principios de la mesa de trabajo).
Primero: revisa conmigo cómo quedó en producción lo de la sesión 04 (guía, quiz, flecha, Capturar, inicio)
y corrige lo que te reporte. Luego los pendientes de la sección 4 (URL de LabiMed, igualar alternativas
de la lámina nivel II, limpieza de practica.js/tareas.js).
Después, empezar el práctico Células nerviosas II (circuitos y glía): lámina de médula espinal (glía y
circuito reflejo sensitiva → interneurona → motoneurona) reutilizando lamina.js y el armado/flecha de tipos.js,
más neuronas de hipocampo/corteza con Golgi. Antes de programar: propón en una tabla la ruta (actividades,
niveles, qué va a la guía) y resuelve conmigo las decisiones abiertas. Implementa por partes, probando con
PHP 8.3 + Playwright en 1366×660 y celular; commits locales con mi autoría; dime exactamente qué subir.
Al cerrar, escribe docs/sesiones/sesion-05_*.md con reporte + prompt siguiente.
```
