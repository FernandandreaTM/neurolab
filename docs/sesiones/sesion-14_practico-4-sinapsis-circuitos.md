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
| I · Del PA a la liberación (glutamato) | a 1 PA → Ca²⁺ → PPSE bajo el umbral · b tren → suma de PPSE → PA · c Ca²⁺ bloqueado → sin liberación · d sin recaptación → PPSE más grande y largo (+ tren → excitotoxicidad: entra Ca²⁺ en masa a la neurona, que se tiñe de rojo; check `excito`) | Prueba / En la hendidura / En la postsináptica |
| II · El receptor decide | a GABA → entra Cl⁻ (PPSI) · b ACh nicotínico → canal, Na⁺ (+ tren → PA en la fibra muscular, sin pregunta) · c ACh muscarínico → proteína G, sale K⁺, lento | NT y receptor / Tipo / Ion / Efecto |

### Simulador `js/sim-sinapsis.js`

| Aspecto | Detalle |
|---|---|
| Modelo (ms) | NT en la hendidura C (+1 por PA con Ca²⁺; τ 1 ms con recaptación, 3 sin ella; ACh 0,7 por la enzima), receptores r, célula postsináptica RC (τm 8 ms, umbral −55 con PA estilizado). Muscarínico: proteína G s → canal de K⁺ k. Glu: 1 PA ≈ +7,6 mV, tren de 5 (cada 4 ms) → PA, sin recaptación ≈ +12 mV sin PA. GABA ≈ −5 mV. Nic 1 PA ≈ +7,7 mV, tren → PA. Mus ≈ −10 mV, pico a ~55 ms |
| Reproducción | Cada registro se calcula entero al empezar (`simular` + `guion` con semilla): todo lo dibujado depende del instante `tp`. Barra bajo el lienzo: ⏮, ⏯, línea de tiempo arrastrable con ms, 0,25× · 0,5× · 1×; cabezal naranjo en el registro. Tiempo lento cerca de cada PA (0,6 s/ms; 0,28 en tren) y rápido el resto (0,03) |
| Dibujo | Fondo ilustrado `img/sinapsis/fondo.jpg` (ChatGPT; `fondo-sin-astrocito.jpg` con ACh) + encima lo animado: Ca²⁺ esperando afuera y 2 canales en el costado derecho del botón; PA como onda amarilla por la membrana (`CONTORNO`, ambos lados); vesículas con 5 moléculas que bajan, se abren y las sueltan; receptores con sitio de unión con la forma del NT (triángulo, rombo, hexágono) que se abren 0,35 ms después; iones por el poro; acetilcolinesterasa en «pacman»; proteína G que viaja al canal de K⁺ |
| Receptor NMDA | Solo con glutamato: violeta, con Mg²⁺ en el poro que sale con la despolarización (−56 → −40 mV). El Ca²⁺ entra solo por él: algo con un tren normal (se desvanece) y 28 con tren sin recaptación (se acumula; excitotoxicidad). Los AMPA (rosados) dejan pasar Na⁺ |
| Iones que esperan | Na⁺/Cl⁻ afuera en la hendidura y K⁺ adentro (según su gradiente); cada uno desaparece al pasar y vuelve después |
| Célula postsináptica | «Neurona postsináptica» (glu, GABA), «Fibra muscular» (nic), «Célula del corazón» (mus) |
| `sim_cfg` | `controles` (pa, tren, ca, recap, nt, rec), `nt`, `fondo`, `fondo_ach` |
| CHEQUEOS | `lib1`, `caOff`, `caOn`, `sinLib`, `tren`, `paPost`, `recapOff`, `largo`, `ntGaba`, `ntAch`, `recNic`, `recMus`, `ppsi`, `nic`, `trenNic`, `mus`, `excito` (se evalúan al terminar de ver cada registro) |
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

## Pendientes para la sesión 15 (pedidos de Fer, 04-11)

| # | Tema | Qué hacer |
|---|---|---|
| 1 | Casos clínicos (act. 17): preguntas ambiguas | En cada caso dejar explícito si se pregunta **qué cambia por la enfermedad** o **qué cambia por el fármaco** (p. ej. Parkinson: falta de dopamina vs. efecto de la L-dopa; miastenia: anticuerpos vs. piridostigmina). Revisar enunciados y alternativas de los 5 casos |
| 2 | Casos clínicos: tarjetas según el tipo de sinapsis | El astrocito no corresponde en la placa motora. Hacer tarjetas por tipo de sinapsis (central con astrocito; neuromuscular con fibra muscular y acetilcolinesterasa/lámina basal; etc.), con prompt de ChatGPT (un solo prompt para el set) y elegir el set por caso |
| 3 | Circuito reflejo (act. 9): rehacer más realista | Tomar como referencia el esquema típico del reflejo rotuliano de las clases de Fer **Sensorial I o II** (probablemente de Tortora), en `C:\Users\ferna\OneDrive - Universidad Austral de Chile\Docencia` (carpetas Neurobiología / ETMP097). Mixto: ilustración de ChatGPT (plantilla + prompt) + animación SVG: **la pierna se extiende** en el rotuliano y **se aleja de un clavo** en el de retirada |
| 3a | Criterios del circuito | Circuitos limpios, sin cruces de cables ni extensiones innecesarias, anatómicamente correctos. No centrarse en monosináptico/polisináptico: que entiendan el **rol de las interneuronas** y que el reflejo **se resuelve en la médula de forma automática** |
| 3b | Vía ascendente | En alguna etapa (no todo de una vez), mostrar que la señal de dolor **también sube por la vía ascendente hasta la corteza**: por eso el dolor se hace consciente aunque el reflejo ya ocurrió |
| 4 | Largo del práctico | Son 3 actividades y la 1 (sinapsis, 2 niveles) es intensa: buscar formas de **sintetizar** y eliminar preguntas repetidas entre actividades (sinapsis, circuito y casos) |
| 5 | Menores | Guías `guia-sinapsis-1/2.svg` al estilo del fondo (opcional); alternativas de Fono del quiz del práctico 3 (f1, f2, f4) |

## Prompt para la sesión siguiente

```
Retomo NeuroLab (C:\repo\neurolab). Lee completo docs/sesiones/sesion-14_practico-4-sinapsis-circuitos.md
(sobre todo «Pendientes para la sesión 15», «Cómo trabajamos» y «Herramientas»); si hace falta, «Cómo trabajamos»
de la sesión 12. Al inicio pide permiso de borrado en la carpeta del repo para que git funcione.
Trabajamos el práctico 4 (ruta sinapsis-circuitos), en este orden, proponiendo cada parte en una tabla y
esperando mi confirmación antes de programar:
1. Revisión de síntesis del práctico completo (pendiente 4): qué preguntas se repiten o sobran entre la sinapsis,
   el circuito y los casos, y cómo acortar.
2. Casos clínicos (actividad 17): preguntas claras sobre enfermedad vs. fármaco (pendiente 1) y tarjetas de sitio
   por tipo de sinapsis, con un solo prompt de ChatGPT para el set (pendiente 2).
3. Circuito reflejo (actividad 9) rehecho (pendientes 3, 3a, 3b): pídeme acceso a mi carpeta de Docencia en
   OneDrive para buscar el esquema del reflejo rotuliano en mis clases «Sensorial I» o «Sensorial II»; propón los
   niveles (rotuliano con la pierna que se extiende, retirada con el pie que se aleja del clavo, interneuronas,
   resolución medular automática y, en una etapa aparte, la vía ascendente hasta la corteza) y luego la plantilla
   + prompt de ChatGPT para la ilustración; la pierna se anima en SVG.
Usa docs/practico-4_build.py y docs/practico-3_test.js (PHP 8.3 + Playwright, 1366×660 y 390×844, revisando
capturas). Commits con mi autoría en main (yo hago el Push); entrega con carpeta de origen nueva y verifica md5.
Al final la lista para FileZilla y docs/sesiones/sesion-15_*.md.
```
