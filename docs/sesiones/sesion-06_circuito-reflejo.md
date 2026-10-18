# Sesión 06: íconos de glía, tarjetas de Glía del SNC y circuito reflejo (rediseño en curso)

**Fecha:** 2026-10-18 · **Asignatura:** ETMP097 Neurobiología · **Práctico:** Células nerviosas II (`practico.php?p=celulas-2`) · **Uso con estudiantes:** miércoles 21-10
**Estado:** Glía del SNC II con tarjetas e íconos, listo. El **circuito reflejo funciona en 3 niveles** (commit `f7291ab`), pero Fer pidió un **rediseño completo por capas sobre un solo esquema**: queda diseñado (§4). Imágenes: el esquema base y las 4 lupas de ChatGPT sirven; los circuitos de ChatGPT se descartaron y **las neuronas se dibujarán en SVG** (§4b). Todo se probó con PHP 8.3 + Playwright en 1366×660 y 390×844; con «Completar todo el práctico», Células II llega a 12/12 secciones y Células I a 9/9.

---

## 1. Qué quedó hecho (commits locales con la autoría de Fer)

| Commit | Qué | Archivos |
|---|---|---|
| `6a80d71` | **Íconos de glía** (6, bajados a 256 px; originales en `img/_fuentes/glia/`). **Glía del SNC nivel II**: tarjetas con ícono y nombre en vez de escribir de memoria | `img/glia/*.png`, `data/seed.sql` |
| `7d8c51b` | **Molde encajable** (`js/molde.js`): la captura se encaja en una silueta y queda con geometría común; los puntos se revisan en `api/lamina_check.php` (zonas en `api/zonas_lib.php`). Aviso plegable genérico (`$aviso('rata' \| 'roedor')`). Botón «↺ Volver a la vista inicial» en todas las capturas | `js/lamina.js`, `js/molde.js`, `api/lamina_check.php`, `api/zonas_lib.php`, `_partials/mesa.php`, `css/mesa.css`, `js/docente.js`, `api/autocompletar.php` |
| `3f47019` | `js/circuito.js` reescrito: varios **circuitos** (A rotuliano, B retirada) + **C cortes** (casos «¿dónde se cortó?»); zonas, puntos, orden y rutas en el servidor (`api/circuito_check.php`); ruta suave con impulso animado; guía con las imágenes de cada reflejo | `js/circuito.js`, `api/circuito_check.php`, `js/molde.js` |
| `215a053` | Sale **MH-047** (la orientación era ambigua: los autores ponen dorsal arriba, pero no se distingue bien). Orientación con **UCSF-163 (cresil)** y marcos no cuadrados (3:2) | `js/molde.js`, `js/lamina.js`, `data/seed.sql` |
| `f7291ab` | **Rompecabezas** (`js/rompecabezas.js`, nivel `rompecabezas`) con la imagen de Fer cortada en piezas (`img/reflejo/`); el circuito queda en 3 niveles: I orientación UCSF-163 · II rompecabezas · III reflejos y cortes sobre el arco armado (`fondo` en el nivel circuito) | `js/rompecabezas.js`, `actividad.php`, `_partials/mesa.php`, `img/reflejo/*`, `data/practicos.php` |

**Motor reutilizable que queda:** molde encajable con zonas (`molde` en una captura), circuito con fondo fijo o captura (`fondo`), rompecabezas (`tablero`, `piezas` con `caja`), y revisión en el servidor de todo.

## 2. Decisiones con Fer

| Tema | Decisión |
|---|---|
| Glía del SNC II | Tarjetas con íconos (no escribir de memoria) |
| MH-047 | Fuera del práctico: especie no indicada en histologyguide; orientación confusa |
| Lámina real en el circuito | **Fuera** (pedido de cierre): el circuito será solo esquema |
| Rompecabezas actual | Frustrante si no se toca justo donde se espera → se reemplaza (§4) |
| Imágenes | Las hace Fer con ChatGPT; prompts en `docs/prompts-imagenes.md` §7 |

## 3. Para producción (si se quiere usar el miércoles la versión actual)

1. GitHub Desktop → `main` → **Push origin**.
2. FileZilla: `actividad.php _partials/mesa.php api/autocompletar.php api/circuito_check.php api/lamina_check.php api/zonas_lib.php css/mesa.css data/practicos.php data/seed.sql js/circuito.js js/docente.js js/lamina.js js/molde.js js/rompecabezas.js img/glia/ img/reflejo/`
3. Abrir **`admin/seed.php`** (debe decir **actividades: 12**).
4. Revisar que la vista inicial de UCSF-163 (`z=2.4`) deje la médula entera dentro del marco.

## 4. Rediseño acordado del circuito reflejo (sesión 07)

Un solo esquema al que se le van agregando capas, en niveles de la misma actividad:

| Nivel | Qué se ve | Mecánica (sin tener que tocar «justo») |
|---|---|---|
| I · La médula | Solo la médula del esquema (`rotuliano.png`, capa médula) | Tocar zonas amplias: asta dorsal, asta ventral, sustancia gris, sustancia blanca, canal central, fisura media ventral, tabique dorsal |
| II · Los extremos | Médula + **huecos punteados** (siluetas) de raíz dorsal con ganglio, raíz ventral, nervio, piel/receptor y músculo | **Emparejar**: tocar un hueco y elegir la pieza (o arrastrarla al hueco; vale soltarla en cualquier parte de la silueta). Primero el lado sensitivo (receptor → nervio → ganglio → raíz dorsal), después el motor (raíz ventral → nervio → músculo) |
| III · Reflejo rotuliano a nivel celular | Capa de neuronas de `rotuliano.png` (cortadas por color): sensitiva azul (huso → ganglio → asta ventral) y motoneurona roja (asta ventral → placa motora) | Aparecen al ubicarlas; recorrido animado; **lupas sinápticas** (`sinapsis-central.png`, `placa-motora.png`) sobre los botones: identificar pre/postsináptica, hendidura, vesículas, receptores, neurotransmisor (glutamato / acetilcolina) |
| IV · Reflejo de retirada | `retirada.png`: sensitiva celeste (nociceptor) → interneurona verde → motoneurona roja → flexor | Igual que III, con la sinapsis de la interneurona (y la idea de inhibición del antagonista en una pregunta) |
| V · ¿Dónde se cortó? | El arco completo con **3 sitios marcados (A, B, C)** y **3 casos a la vez** | **Emparejar caso ↔ sitio** (no buscar el corte a ciegas) |

**Casos realistas propuestos para el nivel V** (revisar con ojo clínico):

| Sitio | Caso | Por qué es realista |
|---|---|---|
| Raíz dorsal / ganglio | Hernia del núcleo pulposo que comprime la raíz posterior (dolor y hormigueo en el dermatoma, reflejo disminuido, fuerza casi normal); o herpes zóster en el ganglio | Es la causa más frecuente de lesión de una raíz. Un fragmento óseo de una fractura vertebral suele comprimir la médula entera más que una sola raíz |
| Asta ventral / motoneurona | Poliomielitis o ELA: debilidad, atrofia y fasciculaciones, sin reflejo, con sensibilidad intacta | Enfermedades que dañan selectivamente la motoneurona |
| Nervio (mixto) | Herida cortante o fractura que lesiona un nervio periférico: se pierden sensibilidad, fuerza y reflejo en su territorio | El nervio lleva fibras sensitivas y motoras juntas |

## 4b. Imágenes y decisión final (2026-10-18, al cierre)

Se pidió a ChatGPT un set de 7 imágenes con un solo prompt (flexor y extensor por separado, interneurona inhibitoria, lupas). Revisión:

| Imagen (`img/reflejo/`) | Estado | Motivo |
|---|---|---|
| `esquema-base.png` | ✅ Fondo de todos los niveles | Piel con terminación libre, extensor con huso, flexor, ganglio, raíces y médula con dorsal arriba |
| `sinapsis-excitatoria.png`, `sinapsis-inhibitoria.png`, `placa-motora.png`, `huso-muscular.png` | ✅ Lupas | Correctas (vesículas redondas frente a aplanadas, canales, pliegues, espiral sobre fibras intrafusales) |
| `rotuliano.png`, `retirada.png` | ❌ Movidas a `img/_fuentes/descartadas/` | Pseudounipolar con «cola» (parece bipolar); motoneuronas e interneuronas del lado contrario; un axón cruza la médula para salir por la otra raíz; nervios pintados enteros |

**Decisión (Fer):** las neuronas no se piden a ChatGPT. Se dibujan **como capas SVG** sobre `esquema-base.png`:
- Somas con los íconos existentes (`img/tipos/pseudounipolar.png`, `motoneurona.png`, `multipolar.png`; la interneurona inhibitoria con el multipolar, en otro color).
- Axones, la T de la pseudounipolar, ramas y botones terminales trazados por su camino real, **todo del lado izquierdo**: la sensitiva por el nervio → ganglio → raíz dorsal; la motora por la raíz ventral → nervio → placa motora del músculo que corresponde.
- Colores: sensitiva del huso azul #2563EB · sensitiva del dolor celeste #0891B2 · interneurona excitatoria verde #16A34A · interneurona inhibitoria morado #7C3AED · motoneurona del extensor rojo #DC2626 · motoneurona del flexor naranjo #EA580C.
- Rotuliano: azul (huso del extensor) → roja (extensor), y la colateral → morada → naranja (flexor, inhibida). Retirada: celeste (piel) → verde → naranja (flexor) y celeste → morada → roja (extensor, inhibida).
- Las lupas se abren tocando los botones: excitatoria (azul sobre roja), inhibitoria (morada sobre naranja), placa motora, huso.
- Las imágenes de ChatGPT pesan 1,3-1,6 MB: bajarlas (≈1152 px, .jpg el base) antes de usarlas.

## 5. Pendientes

1. Implementar el rediseño (§4 + §4b): base `esquema-base.png`, neuronas en SVG, lupas; reutilizar `rompecabezas.js` (huecos en vez de punto exacto: las piezas se cortan de `esquema-base.png`) y `circuito.js` (fondo fijo).
2. Optimizar las imágenes nuevas de `img/reflejo/` y sacar del repo las piezas viejas (`arco.jpg`, `tablero.jpg`, `piel.png`, `musculo.png`, `nervio.png`, `raiz-*.png`) cuando el rediseño las reemplace.
3. Ayudantes: actualizar `docs/practico-2_tareas.md` (revisar casos clínicos del nivel V, textos de lupas sinápticas, láminas de glía).
4. Glía del SNC III-IV (MHS-240 y UCSF-163) y Glía del SNP: revisar con ojo docente.
5. Arreglar el título «Nivel II: sNC frente a SNP» (la barra pasa la primera letra a minúscula y rompe las siglas).
6. De sesiones anteriores: igualar alternativas de la lámina nivel II del práctico I; borrar `js/practica.js` y `js/tareas.js` (revisar antes).
7. Práctico de potencial de acción y sinapsis (después del rediseño; la lupa sináptica del nivel III sirve de puente).

---

## 6. Prompt para la sesión 07

```
Retomo NeuroLab (C:\repo\neurolab). Lee docs/sesiones/sesion-06_circuito-reflejo.md completo
(y la sesión 05 para el práctico II y la sesión 04 para el estilo de la guía y la mesa de trabajo).
Implementa el rediseño del circuito reflejo de la §4 y §4b: un solo esquema por capas sobre
img/reflejo/esquema-base.png en 5 niveles (médula sola → extremos con huecos para emparejar →
rotuliano con inhibición recíproca y lupas sinápticas → retirada con interneuronas → cortes
emparejando 3 casos con 3 sitios), sin lámina real. Las neuronas las dibujas tú en SVG (somas con
los íconos de img/tipos/, axones y botones por su camino real, todo del lado izquierdo); las lupas
son sinapsis-excitatoria, sinapsis-inhibitoria, placa-motora y huso-muscular. Reutiliza
rompecabezas.js, circuito.js y molde/zonas. Antes de programar muéstrame un boceto del trazado de
las neuronas sobre el esquema base, y revisa conmigo los casos clínicos del nivel V.
Implementa por partes, probando con PHP 8.3 + Playwright en 1366×660 y celular; commits locales con
mi autoría; dime exactamente qué subir. Al cerrar, escribe docs/sesiones/sesion-07_*.md con reporte
+ prompt siguiente.
```
