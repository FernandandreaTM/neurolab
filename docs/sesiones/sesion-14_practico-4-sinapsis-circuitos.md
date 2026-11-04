# Sesión 14 · Práctico 4: sinapsis, neurotransmisores y circuitos · 30-10 a 04-11-2026

## Qué se hizo

Ruta nueva `sinapsis-circuitos` (último práctico de la serie, integrador; **sin quiz**: Fer hace uno formativo en papel).

| Paso | Actividad (id · slug) | Estado |
|---|---|---|
| 1 | 16 · `sinapsis-quimica` · simulador propio `js/sim-sinapsis.js`, 2 niveles, 7 pasos | Nueva, revisada por Fer en local |
| 2 | 9 · `circuito-reflejo` · 5 niveles (los mismos de la sesión 07) | Músculos rotulados, tendón corregido, piezas del nivel II todas a la vez. **Rediseño a 3 niveles pendiente** |
| 3 | 17 · `casos-sinapsis` · 5 casos clínicos | Ayudantes (ISRS, ACV) + Claude (Parkinson, miastenia, toxina botulínica) |

Otros: repo limpio al inicio (práctico 3 commiteado, `.tmpx/` y 17 SVG sin uso borrados); los ayudantes cerraron su participación (`docs/practico-4_tareas.md` y `docs/AYUDANTES.md` quedan como registro).

## Actividad 16 · La sinapsis química

| Nivel | Casos (simulador + pregunta en el mismo paso) | Cuadro |
|---|---|---|
| I · Del PA a la liberación (glutamato) | a 1 PA → Ca²⁺ → PPSE bajo el umbral · b Ca²⁺ bloqueado → sin liberación · c tren → suma de PPSE → PA · d sin recaptación → PPSE más grande y largo | Prueba / En la hendidura / En la postsináptica |
| II · El receptor decide | a GABA → entra Cl⁻ (PPSI) · b ACh nicotínico → canal, Na⁺ (+ tren → PA en la fibra muscular, sin pregunta) · c ACh muscarínico → proteína G, sale K⁺, lento | NT y receptor / Tipo / Ion / Efecto |

### Simulador `js/sim-sinapsis.js`

| Aspecto | Detalle |
|---|---|
| Modelo (ms) | NT en la hendidura C (+1 por PA con Ca²⁺; τ 1 ms con recaptación, 3 sin ella; ACh 0,7 por la enzima), receptores r, célula postsináptica RC (τm 8 ms, umbral −55 con PA estilizado). Muscarínico: proteína G s → canal de K⁺ k. Glu: 1 PA ≈ +7,6 mV, tren de 5 (cada 4 ms) → PA, sin recaptación ≈ +12 mV sin PA. GABA ≈ −5 mV. Nic 1 PA ≈ +7,7 mV, tren → PA. Mus ≈ −10 mV, pico a ~55 ms |
| Reproducción | Cada registro se calcula entero al empezar (`simular` + `guion` con semilla): todo lo dibujado depende del instante `tp`. Barra bajo el lienzo: ⏮, ⏯, línea de tiempo arrastrable con ms, 0,25× · 0,5× · 1×; cabezal naranjo en el registro. Tiempo lento cerca de cada PA (0,6 s/ms; 0,28 en tren) y rápido el resto (0,03) |
| Dibujo | Fondo ilustrado `img/sinapsis/fondo.jpg` (ChatGPT; `fondo-sin-astrocito.jpg` con ACh) + encima lo animado: Ca²⁺ esperando afuera y 2 canales en el costado derecho del botón; PA como onda amarilla por la membrana (`CONTORNO`, ambos lados); vesículas con 5 moléculas que bajan, se abren y las sueltan; receptores con sitio de unión con la forma del NT (triángulo, rombo, hexágono) que se abren 0,35 ms después; iones por el poro; acetilcolinesterasa en «pacman»; proteína G que viaja al canal de K⁺ |
| Célula postsináptica | «Neurona postsináptica» (glu, GABA), «Fibra muscular» (nic), «Célula del corazón» (mus) |
| `sim_cfg` | `controles` (pa, tren, ca, recap, nt, rec), `nt`, `fondo`, `fondo_ach` |
| CHEQUEOS | `lib1`, `caOff`, `caOn`, `sinLib`, `tren`, `paPost`, `recapOff`, `largo`, `ntGaba`, `ntAch`, `recNic`, `recMus`, `ppsi`, `nic`, `trenNic`, `mus` (se evalúan al terminar de ver cada registro) |
| Pruebas | `caja.__sim.prueba`: `vel(x)`, `pa()`, `tren()`, `ir(ms)`, `poner({ca, recap, nt, rec})` |
| Exactitud | En «Para recordar» del caso a: en la sinapsis real los canales de Ca²⁺ están junto a las vesículas acopladas (aquí al costado para distinguirlos) |

## Actividad 17 · Casos clínicos

| Caso | Sitio | Imagen (Wikimedia) |
|---|---|---|
| ISRS · Camila, 34 | Botón presináptico (SERT) | Fluoxetina · Lanfear's Bane, CC BY-SA 3.0 |
| ACV · Jorge, 67 | Astrocito vecino (recaptación de glutamato) | TAC · Lucien Monfils, CC BY-SA 4.0 |
| Parkinson · Luis, 68 | Botón presináptico | Gowers 1886, dominio público |
| Miastenia · Ana, 29 | Receptor postsináptico | Ptosis y edrofonio · Kurukumbi y cols., CC BY 2.0 |
| Toxina botulínica · Patricia, 55 | Botón presináptico | Frasco · Pittigrilli, CC BY 4.0 |

Formato: ficha + foto; pasos Sitio (tarjeta) → Qué cambia → Qué se observa; cuadro de 5 filas. `cartas_mesa: true` en el nivel: las 4 tarjetas de sitio (`img/cartas/boton-presinaptico.png`, `hendidura-sinaptica.png`, `receptor-postsinaptico.png`, `astrocito-vecino.png`, de ChatGPT) se eligen **en la mesa bajo la ficha**; el panel solo muestra la pregunta. Opción «Astrocito» renombrada «Astrocito vecino».

## Circuito reflejo (actividad 9)

| Cambio | Detalle |
|---|---|
| Rótulos | «Extensor (cuádriceps)» rojo y «Flexor (isquiotibiales)» naranjo en `esquema-base.jpg` (niveles III–V y guía); «Extensor»/«Flexor» en las piezas del nivel II |
| Tendón | El ramo del nervio ya no se une al tendón del extensor (imagen, hueco del tablero y pieza). Coordenadas sin cambios |
| Nivel II | Sin `grupos`: las 7 piezas a la vez |
| Script | `docs/practico-4_reflejo-img.py <carpeta con originales>` |

## Decisiones con Fer

| Tema | Decisión |
|---|---|
| Orden de la ruta | Sinapsis → circuito → casos; sin quiz |
| Imágenes de casos | Reales con licencia abierta (no IA) |
| Astrocito con ACh | Se oculta (evita pensar que es parte de la placa motora) |
| Ca²⁺ | Canales al costado con Ca²⁺ visible afuera, para no confundirlo con el neurotransmisor |
| Ilustración | ChatGPT solo para el fondo fijo; lo que se mueve lo dibuja el código encima |

## Cómo trabajamos (nuevo en esta sesión)

| Regla | Detalle |
|---|---|
| Animaciones revisables | Si algo pasa rápido, que se pueda pausar, retroceder y ver lento; calcular cada cuadro desde el tiempo del registro (no partículas en tiempo real) |
| Nada aparece de la nada | Lo que se libera tiene que verse antes donde estaba (NT en la vesícula, Ca²⁺ afuera) |
| Fenómenos con su forma | El PA se ve como onda en la membrana, no como una bola por el centro |
| Imágenes de ChatGPT | Plantilla con las posiciones exactas + referencia de estilo + un solo prompt; superponer con la plantilla para revisar; recortar por código |
| Aclaraciones | Una sola vez, no repetirlas en cada caso |
| Git en la PC de Fer | Pedir permiso de borrado al inicio (si no, git deja `.lock`); commits con su autoría; ella hace el Push |

## Herramientas

| Archivo | Uso |
|---|---|
| `docs/practico-4_build.py` | Actividades 16 y 17 + ajuste del circuito en `data/seed.sql` (`python3 docs/practico-4_build.py`, luego `php admin/seed.php`) |
| `docs/practico-4_svg.py` | `img/sinapsis/guia-sinapsis-1/2.svg` (curvas del mismo modelo) |
| `docs/practico-4_fondo.py` | Recorta la ilustración y hace la versión sin astrocito |
| `docs/practico-4_reflejo-img.py` | Correcciones del esquema del circuito |
| `docs/practico-3_test.js` | Ahora también `simulador: "sinapsis"`, `cartas_mesa` y `RUTA=sinapsis-circuitos` (`RUTA=… GUIA=1 node docs/practico-3_test.js sinapsis-quimica 1 1366 660 a`) |

## Pendientes

1. Revisar en producción la actividad 16 (ritmo de la animación, barra en celular) y los casos con las tarjetas en la mesa.
2. Rediseño del circuito reflejo de 5 a 3 niveles (propuesta de la sesión: I arco + asta dorsal/ventral; II rotuliano y retirada con una pregunta de integración por sinapsis en vez de lupas; III ¿dónde se cortó? + sitio D placa motora/botulismo).
3. Las guías `guia-sinapsis-1/2.svg` usan un esquema simple: actualizarlas al estilo del fondo si Fer quiere.
4. De la sesión 13: quiz del práctico 3, alternativas de Fono (f1, f2, f4: la correcta sigue siendo la más larga).

## Prompt para la sesión siguiente

```
Retomo NeuroLab (C:\repo\neurolab). Lee completo docs/sesiones/sesion-14_practico-4-sinapsis-circuitos.md
(«Pendientes», «Cómo trabajamos», «Herramientas») y, si hace falta, «Cómo trabajamos» de la sesión 12.
Primero: [mis correcciones tras usar el práctico 4 en producción].
Después: el rediseño del circuito reflejo de 5 a 3 niveles (pendiente 2): propónmelo en una tabla y espera
mi confirmación antes de programar. Pide al inicio permiso de borrado en la carpeta del repo para que git
funcione. Usa docs/practico-4_build.py y docs/practico-3_test.js (PHP 8.3 + Playwright, 1366×660 y 390×844,
revisando capturas). Commits con mi autoría en main; al final la lista para FileZilla y
docs/sesiones/sesion-15_*.md.
```
