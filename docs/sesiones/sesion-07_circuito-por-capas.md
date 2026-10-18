# Sesión 07: circuito reflejo por capas (5 niveles sobre un solo esquema)

**Fecha:** 2026-10-18 · **Asignatura:** ETMP097 Neurobiología · **Práctico:** Células nerviosas II (`practico.php?p=celulas-2`) · **Uso con estudiantes:** miércoles 21-10
**Estado:** el rediseño de la §4 y §4b de la sesión 06 está implementado. El circuito reflejo tiene 5 niveles sobre `img/reflejo/esquema-base.jpg`, sin lámina real, con las neuronas dibujadas en SVG y 6 lupas. Se probó con PHP 8.3 + Playwright en 1366×660 y 390×844, recorriendo cada nivel como estudiante (con errores a propósito) y con «⚡ Completar todo el práctico»: Células II llega a **14/14** secciones y Células I a **9/9**, sin errores de JS.

---

## 1. Qué quedó hecho (commits locales con la autoría de Fer)

| Commit | Qué | Archivos |
|---|---|---|
| `3b84fab` | **Parte 1.** Imágenes optimizadas (jpg 1152 px; lupas 640 px; originales en `img/_fuentes/reflejo/`, fuera de git). **Nivel I** (etiquetas sobre la médula sola) y **nivel II** (huecos punteados cortados del esquema). Zonas con polígonos y exclusión. `circuito.js` reescrito. Salen las piezas del rompecabezas anterior | `img/reflejo/*`, `js/circuito.js`, `js/rompecabezas.js`, `api/zonas_lib.php`, `api/circuito_check.php`, `_partials/mesa.php`, `css/mesa.css`, `data/seed.sql`, `data/practicos.php` |
| `eb160e5` | **Niveles III-V** probados y ajustados: rutas del impulso sobre las neuronas, rótulos sin choques, lupas reubicadas, botones para conectar desde el panel (en celular los somas son chicos), «⊣ inhibida» en la guía. **Modo docente** al día. Tareas de los ayudantes actualizadas | `js/circuito.js`, `css/mesa.css`, `data/seed.sql`, `api/autocompletar.php`, `js/docente.js`, `docs/practico-2_tareas.md` |

## 2. Los 5 niveles

| Nivel | Fondo | Mecánica | A la guía |
|---|---|---|---|
| I · La médula | `medula.jpg` (médula sola) | Elegir un nombre y tocar su zona: asta dorsal, asta ventral, sustancia gris, sustancia blanca, canal central, fisura media ventral, tabique medio dorsal. 2 preguntas | Médula rotulada + tabla parte/qué es |
| II · Los extremos | `tablero-huecos.jpg` | Huecos punteados: tocar el hueco y luego la pieza, la pieza y luego el hueco, o arrastrar. Vale cualquier punto de la silueta. Primero el lado sensitivo (piel, extensor con huso, nervio, ganglio, raíz dorsal) y después el motor (raíz ventral, flexor). 2 preguntas | Arco armado + tabla |
| III · Rotuliano | `esquema-base.jpg` | 1) Ubicar 4 somas (sensitiva azul, motoneurona del extensor roja, interneurona inhibitoria morada, motoneurona del flexor naranja); cada una aparece dibujada por su camino. 2) Conectar 2 vías: directa y de inhibición recíproca (la naranja queda «⊣ inhibida»). 3) 4 lupas: huso, excitatoria, inhibitoria, placa motora (2 preguntas cada una). 4) 2 preguntas | Esquema con neuronas y rutas + tablas neurona/vía/lupas/preguntas |
| IV · Retirada | `esquema-base.jpg` | Las motoneuronas ya están. Ubicar sensitiva del dolor (celeste), interneurona excitatoria (verde) e inhibitoria (morada); conectar 2 vías (la roja queda inhibida); 2 lupas; 2 preguntas | Igual que III |
| V · ¿Dónde se cortó? | Arco rotuliano (azul + roja) con sitios A, B, C | Emparejar: tocar un caso y luego su sitio (en el esquema o con los botones A·B·C). Casos: hernia L3-L4 sobre la raíz L4 → B raíz dorsal; atrofia muscular espinal → C asta ventral; lesión del nervio femoral → A nervio | Esquema con los casos en su sitio + tabla caso/sitio/por qué |

**Datos** (actividad 9 en `data/seed.sql`): zonas en % de la imagen (`e` elipses, `r` rectángulos, `p` polígonos, `no` exclusión); trazos de las neuronas en px del esquema (1536×1024): `soma`, `d` (axones), `fino` (colaterales, terminaciones), `botones`, `lbl` (posición del rótulo). Zonas, trazos, orden de las vías, rutas y sitios de los casos **no van al navegador**: los revisa `api/circuito_check.php` y el trazo llega al acertar.

**Motor reutilizable:** `circuito.js` ahora sirve para etiquetas sobre una imagen fija, neuronas en SVG con varias vías e inhibición, lupas con preguntas y casos para emparejar con sitios. `rompecabezas.js` suma `huecos` y `grupos`.

## 3. Decisiones con Fer

| Tema | Decisión |
|---|---|
| Trazado de las neuronas | Aprobado el boceto (todo del lado izquierdo; colores de la §4b de la sesión 06) |
| Casos del nivel V | Los 3 con el reflejo rotuliano alterado; se distinguen por lo que acompaña (solo sensitivo, solo motor o ambos). La ELA se descartó (puede dar reflejos aumentados) |
| Lupa | Imagen + 2 preguntas de elección (sin rotular sobre la imagen) |
| Retirada | Motoneuronas ya puestas (se ubicaron en el nivel III) |
| Celular | Para conectar, además de tocar los somas, botones en el panel |

## 4. Para producción (Fer)

1. GitHub Desktop → `main` → **Push origin**.
2. FileZilla (misma subcarpeta en ambos paneles, reemplazando):
   `_partials/mesa.php api/autocompletar.php api/circuito_check.php api/zonas_lib.php css/mesa.css data/practicos.php data/seed.sql js/circuito.js js/docente.js js/rompecabezas.js`
   y las imágenes nuevas: `img/reflejo/esquema-base.jpg img/reflejo/medula.jpg img/reflejo/tablero-huecos.jpg img/reflejo/huso-muscular.jpg img/reflejo/placa-motora.jpg img/reflejo/sinapsis-excitatoria.jpg img/reflejo/sinapsis-inhibitoria.jpg` y la carpeta `img/reflejo/piezas/` (7 `.webp`).
3. En el servidor puedes borrar `img/reflejo/arco.jpg tablero.jpg piel.png musculo.png nervio.png raiz-dorsal.png raiz-ventral.png` (ya no se usan).
4. Abrir **`admin/seed.php`** (debe decir **actividades: 12**).
5. Verificar en producción:
   - Que las piezas `.webp` del nivel II se vean (si el hosting no conoce webp, aparecen rotas: avísame y las paso a png).
   - Nivel III en el celular: ubicar, conectar con los botones del panel y abrir las lupas desde el panel.
   - Modo docente: «⚡ Completar todo el práctico» → la guía debe decir 14/14.
   - Quien empezó el circuito antiguo: «Empezar de nuevo» en cada nivel (el avance viejo no calza con los niveles nuevos).

## 5. Pendientes

1. Revisión de Fer en producción (textos de las lupas, casos, posición de rótulos y lupas).
2. Ayudantes: tareas I-L en `docs/practico-2_tareas.md` (más casos del arco, revisar lupas, revisar láminas de glía, mielina en el ganglio).
3. `docs/prompts-imagenes.md` §6 (rompecabezas `arco.png`) quedó obsoleta: actualizar o borrar.
4. Glía del SNC III-IV y Glía del SNP: revisar con ojo docente.
5. Título «Nivel II: sNC frente a SNP» (la barra pasa la primera letra a minúscula).
6. De sesiones anteriores: igualar alternativas de la lámina nivel II del práctico I; borrar `js/practica.js` y `js/tareas.js` (revisar antes).
7. Práctico de potencial de acción y sinapsis (las lupas del nivel III sirven de puente).

---

## 6. Prompt para la sesión 08

```
Retomo NeuroLab (C:\repo\neurolab). Lee docs/sesiones/sesion-07_circuito-por-capas.md completo
(y la sesión 06 para el diseño del circuito y la sesión 04 para el estilo de la guía y la mesa).
Primero: revisa conmigo cómo funcionó en producción el circuito reflejo por capas (5 niveles,
neuronas en SVG, lupas, casos del nivel V, celular) y corrige lo que te reporte.
Luego: los pendientes de la sección 5 (prompts-imagenes §6, título «sNC», limpieza de js viejos).
Después: proponer el práctico de potencial de acción y sinapsis (ruta en tabla: actividades,
niveles, qué va a la guía), reutilizando las lupas sinápticas, antes de programar.
Implementa por partes, probando con PHP 8.3 + Playwright en 1366×660 y celular; commits locales
con mi autoría; dime exactamente qué subir. Al cerrar, escribe docs/sesiones/sesion-08_*.md con
reporte + prompt siguiente.
```
