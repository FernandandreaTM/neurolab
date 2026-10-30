# Sesión 13 · Actividad 15 con simulador propio del potencial de acción · 28-10-2026

## Qué se hizo

La actividad 15 «El potencial de acción» (`potencial-accion-neurona`, ruta `potencial-accion`) deja PhET Neuron y pasa a un simulador propio, `js/sim-pa.js`. Baja de 5 niveles y ~45 pasos a **3 niveles y 9 pasos** (II y III corregidos a las 07:30), con un paso por caso.

| Nivel | Casos (acción + pregunta en el mismo paso) | Vista |
|---|---|---|
| I Del potencial local al potencial de acción | Débil (intensidad 1–2, sin PA) · Más fuerte (PA con 2 intensidades: misma altura) · Sumación (2 × intensidad 2 seguidos) | Simulador en vista «neurona» (ver corrección de las 01:30). Cuadro Estímulo / ¿Llega al umbral? / Resultado |
| II Las fases y sus canales | a Despolarización (retroalimentación positiva) · b Repolarización (inactivación del Na⁺) · c Hiperpolarización (el K⁺ cierra lento) | Simulador con cursor sobre el registro. Cuadro Fase × Na⁺ × K⁺ × ion (P8 de la guía 2025) |
| III El período refractario | Absoluto (2.º estímulo de intensidad 5 durante el PA) · Relativo (2.º PA más bajo en la hiperpolarización) · Un solo sentido (toca el nodo 2 + pregunta) | Simulador; el último caso en `axon-refractario.svg` |

## Simulador `js/sim-pa.js`

| Aspecto | Detalle |
|---|---|
| Modelo | Hodgkin y Huxley (1952), activación del Na⁺ corrida +4 mV y voltaje desplazado: reposo −70, umbral ≈ −55, peak ≈ +35, mínimo ≈ −81 mV. Se muestra a 0,4 s por ms; cada registro dura 20 ms (se alarga si hay un estímulo tardío) |
| Intensidades | 1–5 (pulso de 0,5 ms: 13, 29, 49, 81 y 130 µA/cm²). 1–2: potencial local; 3–5: PA (casi igual de alto). Dos de intensidad 2 separados ≤ 2 ms se suman. Con intensidad 5 hay un 2.º PA desde ≈ 6,5 ms después del primero (más bajo); con intensidad 3, desde ≈ 11 ms |
| Membrana | 1 canal de fuga de K⁺, 2 de Na⁺ (compuerta de activación afuera + bola de inactivación adentro), 2 de K⁺ (una compuerta). El dibujo sigue m³, h y n⁴ del modelo. Los iones que cruzan aparecen y se desvanecen (las concentraciones casi no cambian); no hay barras de concentración ni bomba |
| Interfaz | Izquierda: tarjeta del estímulo (− n + y barras) y «⚡ Estimular», «Borrar registro». Derecha (o abajo en pantallas < 620 px): voltímetro y registro (los 3 anteriores en gris, ▼ con la intensidad de cada estímulo). Al terminar un registro, el cursor se arrastra sobre la curva: voltímetro y canales muestran ese instante |
| CHEQUEOS | `nivelBajo`, `nivel1`, `nivel2`, `nivelMax`, `sub`, `pa`, `dosNiveles`, `suma`, `curDespol`, `curRepol`, `curHiper`, `refAbs`, `refRel` (se evalúan al terminar cada registro; son acumulativos en el nivel) |
| Para pruebas | `caja.__sim.prueba`: `vel(x)`, `nivel(n)`, `serie([[ms, nivel], …])`, `cursor('despol'|'repol'|'hiper')` |

## Motor `escenas`

| Cambio | Detalle |
|---|---|
| `simulador: "pa"` | Igual que `"membrana"`, con los CHEQUEOS de `sim-pa.js` |
| `esquema: true` (caso) | En un nivel con simulador, ese caso muestra el `fondo` del nivel (pasos `elegir`/`tocar`, animación) en vez del simulador |

## Imágenes (`docs/practico-3_svg2.py` → `img/potencial/`)

| Archivo | Uso |
|---|---|
| `decremento.svg` | Nivel I · Distancia: neurona con sinapsis A y B y 3 registros vacíos (dendrita, soma, cono); la animación dibuja 14 → 8 → 4 mV y A + B → PA. Coordenadas en `docs/practico-3_coords2.json` |
| `axon-refractario.svg` | Nivel III · Un solo sentido: soma, 5 nodos, PA en el nodo 3 (zonas `n1`–`n5`) |
| `guia-pa-1/2/3.svg` | Guía de cada nivel, con curvas calculadas con el mismo modelo |

No hizo falta usar ChatGPT.

## Pruebas

PHP 8.3 + Playwright, en 1366×660 y 390×844, con los 3 niveles completos, errores a propósito (pregunta del simulador, `tocar` fuera de zona), cuadros, guía y página de la ruta. Sin errores de JavaScript. Revisé las capturas y corregí rótulos que chocaban (decremento, axón en el teléfono, guías), la letra chica del lienzo y la disposición vertical en el teléfono.

## Corrección del nivel I (28-10, 01:30)

| Problema (Fer) | Cambio |
|---|---|
| «Empezar de nuevo» no limpiaba el simulador | `reiniciar()` en `sim-pa.js` y `sim-membrana.js`; `escenas.js` lo llama al reiniciar el nivel (borra registros, tareas, cursor y vuelve a intensidad 1) |
| Las preguntas del nivel I no usaban los iones ni los canales | `sim_cfg.vista: "neurona"`: el nivel I dibuja una neurona simple (dendritas, soma, cono, axón con mielina), sin canales ni iones. Electrodo «⚡ Estímulo» en el soma y «Registro» en el cono (uno adentro y otro afuera). El soma y el cono brillan poco con un potencial local y mucho con un PA; además, una onda recorre el axón |
| La barra de intensidad no se entendía | 5 botones numerados con «débil» y «fuerte» debajo (sin − + ni barras) |
| Varios clics seguidos daban trenes y PA deformes | Límite por registro (`sim_cfg`): nivel I con 2 estímulos como máximo, el 2.º ≤ 2 ms después del 1.º; nivel II con 1; nivel III con 2 en cualquier momento. Fuera de eso, «Estimular» queda gris hasta que termina el registro. Queda en gris solo el registro anterior. En «Para recordar» de «Más fuerte»: el todo o nada vale para un PA que parte del reposo |
| «Distancia» era demasiado | Se quitó: el nivel I tiene 3 pasos. `decremento.svg` queda sin uso (borrar) |

`refRel` ahora exige que el 2.º PA sea ≥ 3 mV más bajo. Prueba nueva: `node docs/practico-3_test-reset.js 1366 660 r` (8 clics seguidos → 2 estímulos; «Empezar de nuevo» limpia el estado).

## Corrección de los niveles II y III (28-10, 07:30)

| Nivel | Cambio |
|---|---|
| II | `sim_cfg: {max: 1, intensidad: 3}`: sin tarjeta de intensidad, solo «⚡ Estimular». **4 canales de Na⁺** que se abren uno tras otro (umbrales de m³ 0,003 · 0,012 · 0,05 · 0,2): con el cursor en la subida se ve «más voltaje → más canales». Con el cursor, cada canal abierto muestra su ion en el poro y una flecha (Na⁺ ↓, K⁺ ↑) del tamaño de la corriente; el K⁺ se muestra mientras su canal siga abierto, aunque en la hiperpolarización la corriente sea pequeña. Pistas: «arrastra sobre la curva del registro» |
| II y III | Electrodo de estímulo dibujado como pipeta «⚡ Estímulo» (antes, varilla con rayo) |
| III | `sim_cfg: {par: true}`: cada clic da un **par de estímulos**: el 1.º de intensidad 3 y el 2.º con el intervalo (3 · 6 · 9 · 12 · 15 ms) y la intensidad elegidos. **Absoluto:** 3 ms con intensidad 5, sin 2.º PA, y cursor en el 2.º estímulo (se ven las bolas de inactivación). **Relativo:** a los 9 ms, intensidad 3 no dispara e intensidad 5 da un 2.º PA más bajo. Pregunta: «¿Por qué con intensidad 3 no hubo 2.º PA a los 9 ms?». «Un solo sentido» sin cambios |
| CHEQUEOS | Nuevos `relDebil`, `cur2do`, `int3`, `int9`; `refRel` exige un 2.º PA ≥ 2,5 mV más bajo |
| Pruebas | `practico-3_test.js` usa `prueba.par(intervalo, intensidad)` y `prueba.cursor2()` en el nivel III |

## Quiz de cierre (actividad 5) y ajuste del nivel I (28-10, 07:50)

| Qué | Cambio |
|---|---|
| Nivel I · Más fuerte | Lista: «Potencial de acción con intensidad 3» (`pa3`) y «Otro con intensidad 4 o 5» (`pa45`) |
| Quiz · alternativas | Las 15 de TO (11 comunes + 4 TO) reescritas: breves, parejas, la correcta nunca es la única más larga; la explicación queda solo en el feedback |
| Quiz · nuevas | p07 fampridina (bloqueo de K⁺ → repolarización lenta), p08 sumación temporal en la piel, p09 benzodiazepinas (GABA, Cl⁻), p11 Pacini (canal mecanosensible), t1 FES a 1000 Hz (refractario). Salieron Ca²⁺ y tetania, grosor del axón, bloqueo según tipo de fibra, la segunda pregunta de lidocaína y la del peak (repetía el nivel II) |
| Quiz · Fono | f1–f4 sin cambios (la correcta sigue siendo la más larga en f1, f2 y f4: pendiente) |
| Herramientas | `docs/practico-3_quiz.py` ahora reemplaza el bloque directamente en `data/seed.sql`; prueba `docs/practico-3_test-quiz.js` |

## Ajustes finales del nivel III (28-10, 08:10)

| Qué | Cambio |
|---|---|
| Lista de pasos | Dice que la intensidad es la **del 2.º** («2.º a los 9 ms con intensidad 3: no dispara»); el 1.º queda fijo en 3 a propósito |
| Relativo · Para recordar | + «Sigue siendo todo o nada: un estímulo aún más fuerte no lo agranda, porque su altura depende de cuántos canales de Na⁺ están disponibles» (en el modelo, a los 9 ms: intensidad 4 → +25, 5 → +29, 2× → +31, 3× → +30 mV) |
| Un solo sentido | `axon-refractario.svg` con dendritas (soma más chico); la pregunta pasa de la consecuencia al **porqué**: «¿Por qué no puede pasar a ese nodo?» → «Sus canales de Na⁺ siguen inactivados»; la consecuencia queda en «Para recordar» |
| Copia a la PC | La copia reutiliza un archivo viejo si el origen tiene el mismo nombre: usar una carpeta de origen nueva en cada entrega y verificar con md5 |

## Ilustraciones de ChatGPT integradas (28-10, 08:40)

| Imagen | Uso |
|---|---|
| `img/_fuentes/neurona-simple-chatgpt.png` → `img/potencial/neurona-simple.jpg` (1024²) | Fondo del simulador del nivel I (`sim_cfg.fondo`). Posiciones medidas: soma (0,347; 0,518), r 0,124, fin del cono 0,55, axón 0,524 (`NEU_IMG` en `sim-pa.js`). Encima se dibujan los rótulos con halo, los electrodos, el brillo y la onda. Sin imagen, se usa el dibujo vectorial de antes |
| `img/_fuentes/axon-refractario-chatgpt.png` → `img/potencial/axon-refractario.jpg` (1536×1024, vb 1200×800) | Nivel III · Un solo sentido, con rótulos pegados. El primer tramo sin mielina es el **segmento inicial** (no es un nodo): los nodos son 1–4 y el PA está en el **nodo 2**; se toca el **nodo 1** (zona `n2`). Nodos medidos: 330, 498, 668, 839, 1009 |
| Script | `docs/practico-3_integrar.py` |
| Sin uso (borrar) | `img/potencial/axon-refractario.svg` |

## Qué subir (FileZilla)

| Archivo | Nota |
|---|---|
| `js/sim-pa.js` (nuevo), `js/sim-membrana.js`, `js/escenas.js`, `css/mesa.css` | Simuladores, motor y estilos |
| `data/seed.sql` | Después abrir `admin/seed.php` |
| `data/practicos.php` | Ruta: «3 niveles», guía y conexiones por nivel |
| `img/potencial/axon-refractario.svg`, `guia-pa-1.svg`, `guia-pa-2.svg`, `guia-pa-3.svg` | Nuevas |

Los archivos de `docs/` (`practico-3_build.py`, `practico-3_test.js`, `practico-3_svg2.py`, `practico-3_coords2.json`) solo van al repositorio.

## Estado al cierre

| Qué | Estado |
|---|---|
| Actividad 2 · Canales de membrana | Lista (sesión 12) |
| Actividad 15 · El potencial de acción | **Primera versión con simulador propio, sin revisar por Fer** |
| Quiz de cierre (actividad 5) | Sin revisar por Fer (no menciona valores de PhET) |
| Commit | Pendiente (Fer, GitHub Desktop; no incluir `js/lamina.js`) |
| Borrar a mano | `.tmpx/` y las imágenes sin uso: `img/potencial/decremento.svg`, `ejes-sumacion.svg`, `ejes-medida.svg`, `pa-curva.svg`, `pa-fases.svg`, `pa-canales.svg`, `pa-canales-{despol,repol,hiper}.svg`, `pa-medidas.svg`, `pa-refractario.svg`, `sumacion-guia.svg`, más las de la sesión 12 (`neurona-canales-{pacini,glu,gaba,cono}.jpg`, `membrana.svg`, `canales.svg`, `canal-{na,k}-abierto.svg`). `docs/practico-3_svg.py` todavía las genera |
| Puntos para revisar | Ritmo del simulador (0,4 s/ms: registro de 8 s); ventana para la sumación (~0,8 s entre clics) y para el relativo (2.º clic ≈ 3–3,9 s después del primero); el absoluto del modelo dura ≈ 6 ms (calamar a 6,3 °C) y se aclara en «Para recordar» |

## Herramientas

| Archivo | Uso |
|---|---|
| `docs/practico-3_build.py` | B1–B3 nuevos al final, en la sección «versión con simulador propio (28-10)», que pisa los antiguos. `python3 docs/practico-3_build.py` y luego `php admin/seed.php` |
| `docs/practico-3_svg2.py` | Esquemas y guías de la actividad 15 + `practico-3_coords2.json` (correrlo antes del build si cambian) |
| `docs/practico-3_test.js` | Para `simulador: "pa"` usa `__sim.prueba` (velocidad ×4): `node docs/practico-3_test.js potencial-accion-neurona 1 1366 660 a [claveConError]` |

## Prompt para la sesión siguiente

```
Retomo NeuroLab (C:\repo\neurolab). Lee completo docs/sesiones/sesion-13_simulador-potencial-accion.md
(«Estado al cierre», «Simulador», «Herramientas») y, si hace falta, «Cómo trabajamos» de la sesión 12.
Revisé la actividad 15 «El potencial de acción» (simulador propio js/sim-pa.js, 3 niveles): [mis correcciones].
Aplícalas con las mismas reglas (un paso por caso, preguntas cortas y parejas, nada que la imagen responda,
exactitud científica), propónme primero en una tabla y espera mi confirmación. Usa docs/practico-3_build.py y
docs/practico-3_test.js (PHP 8.3 + Playwright, 1366×660 y 390×844, revisando capturas). Trabaja sobre main;
al final la lista para FileZilla y docs/sesiones/sesion-14_*.md.
```
