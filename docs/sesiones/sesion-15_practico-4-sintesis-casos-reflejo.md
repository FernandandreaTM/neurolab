# Sesión 15 · Práctico 4: síntesis, casos clínicos y circuito reflejo nuevo · 04-11-2026

Fer dejó a Claude trabajando solo («avanza todo lo posible; después solo hacemos las imágenes y subimos»). Las decisiones de diseño las tomó Claude con los criterios de las sesiones 12–14; quedan marcadas abajo para revisarlas.

## Qué se hizo

| Parte | Resultado |
|---|---|
| 1 · Síntesis del práctico | Se quitaron las preguntas repetidas entre sinapsis, circuito y casos (tabla abajo). La sinapsis (act. 16) queda igual: es la base que las otras dos aplican |
| 2 · Casos clínicos (act. 17) | Cada pregunta dice si es **por la enfermedad** o **con el fármaco/tratamiento**. Tarjetas de sitio según el tipo de sinapsis: entre neuronas (ISRS, ACV, Parkinson) o placa motora (miastenia, toxina botulínica). 15 → 14 preguntas |
| 3 · Circuito reflejo (act. 9) | Rehecho como **simulador propio** `js/sim-reflejo.js` (estilo de la sinapsis): 5 niveles → 2, la pierna se anima. Esquema de referencia: Tortora, en «Clase 16 – Neurofisiología sensorial II» (ETMP097, 2024), diapositiva 7 |

## 1 · Síntesis aplicada

| Se repetía | Con | Quedó |
|---|---|---|
| Lupas de la placa motora y de las sinapsis excitatorias del circuito | Sinapsis II-b (ACh nicotínico) y I-a/b (glutamato, PPSE) | Fuera (el circuito ya no tiene lupas) |
| Lupas inhibitorias (rotuliano y retirada) | Sinapsis II-a (GABA; su «Para recordar» nombra la glicina del reflejo) | Una sola idea: caso b del circuito (sin interneurona inhibitoria) |
| «¿Monosináptico?» | Pendiente 3a | Fuera |
| Rotuliano P2 y Retirada P1 (para qué la interneurona) | Entre sí | Casos b y c del nivel I (inhibir al antagonista / excitar al flexor) |
| «Retiras el pie antes de sentir dolor» | — | Nivel II del circuito (vía ascendente) |
| Niveles I–II del circuito (partes de la médula, raíces, nervio mixto) y V (3 lesiones) | Anatomía previa; casos clínicos de la act. 17 | Fuera |
| ACV · «Qué cambia» (glutamato → Ca²⁺) | Sinapsis I-d (tren sin recaptación: excitotoxicidad) | Fuera |
| Toxina botulínica · «Qué cambia» (no se libera ACh) | Sinapsis I-c (Ca²⁺ bloqueado) | Reemplazada por «Enfermedad: ¿por qué los flexores están tensos?» (conecta con el circuito) |

## 2 · Actividad 17 · Casos clínicos

| Caso | Tarjetas | Pasos (nombre en el panel) |
|---|---|---|
| ISRS · Camila | Entre neuronas | Sitio (SERT) · Fármaco: serotonina en la hendidura · Se observa: semanas |
| ACV · Jorge | Entre neuronas | Sitio (astrocito vecino) · Tratamiento: destapar a las 2 h → penumbra |
| Parkinson · Luis | Entre neuronas | Sitio · Enfermedad: menos dopamina · Fármaco: L-dopa cruza la barrera |
| Miastenia · Ana | Placa motora | Sitio (receptor de la fibra) · Enfermedad: debilidad con el uso · Fármaco: piridostigmina |
| Toxina botulínica · Patricia | Placa motora | Sitio (terminal del axón motor) · Enfermedad: sin control desde el encéfalo (espasticidad) · Fármaco: dura 3 meses |

| Detalle | |
|---|---|
| Tarjetas de la placa motora | «Terminal del axón motor», «Hendidura de la placa», «Receptor de la fibra muscular», «Axón motor mielinizado» (ChatGPT, 2.ª versión; la 1.ª tenía una célula de Schwann terminal en casquete sobre el botón, que no se ve en clase). Respaldo SVG en `_partials/iconos_neurona.php` |
| Cuadro | Caso · Sitio · Neurotransmisor · Por la enfermedad · Con el tratamiento |
| Miastenia | «Para recordar» agrega: el nervio y su mielina están sanos (sensibilidad y conducción normales); en la placa no hay astrocitos: la acetilcolinesterasa está en la lámina basal |

## 3 · Actividad 9 · Circuito reflejo (simulador `js/sim-reflejo.js`)

| Nivel | Casos (simulador + pregunta en el mismo paso) | Cuadro |
|---|---|---|
| I · El reflejo se resuelve en la médula | a rotuliano: ¿dónde se conectó la sensitiva con la motoneurona? (médula, asta ventral) · b sin interneuronas inhibitorias: la pierna se extiende menos (el flexor no se relaja y se opone) · c retirada: ¿quién activa al flexor? (interneurona excitatoria) | Caso · Estímulo · Receptor · En la médula · Respuesta |
| II · El dolor también sube a la corteza | a primero el pie, después el dolor (el reflejo se cierra en la médula) · b médula cortada más arriba: retira el pie pero no siente dolor (+ espasticidad tras el shock medular) | Caso · Prueba · ¿Retira el pie? · ¿Siente el dolor? |

| Aspecto | Detalle |
|---|---|
| Escena | Persona sentada en el borde de una mesa: muslo (cuádriceps arriba, isquiotibiales abajo), pierna y pie que giran en la rodilla, nervio espinal con sus ramos, ganglio de la raíz dorsal, corte de la médula. Nivel II: recuadro con corteza y tálamo. Coordenadas de dibujo 760 × 720, escena a 0,85× corrida (110, 60) para que el pie no salga al extenderse |
| Neuronas | Rotuliano: sensitiva del huso (azul), motoneurona del extensor (rojo), interneurona inhibitoria (violeta) → motoneurona del flexor (naranjo). Retirada: sensitiva del dolor (celeste, terminación libre en la planta), interneurona excitatoria (verde) → flexor, interneurona inhibitoria (morado) → extensor. Nivel II: neurona que cruza y sube (dorado) → tálamo → corteza. Solo se dibuja el circuito del último estímulo |
| Modelo (ms) | Rotuliano: golpe 5 ms, 3 PA de la sensitiva, llegada ~18 ms, músculo ~29 ms, pico de la extensión ~30° a ~100 ms; tono de base en ambas motoneuronas. Sin interneurona: el flexor dispara (40, 50, 60 ms) y el pico baja a ~19°. Retirada: 6 PA del dolor (más lentos), flexión ~40° a ~170 ms; el extensor queda inhibido. Señal en la corteza ~120 ms; «siente el dolor» a 270 ms. Con lesión, el impulso ascendente se corta en la ✕ |
| Reproducción | Igual que la sinapsis: cada registro se calcula entero y todo depende de `tp`; ⏮ ⏯, línea de tiempo arrastrable, 0,25× · 0,5× · 1×; lento con impulsos viajando (0,06 s/ms), rápido el resto (0,011) |
| Registro | Derecha: rodilla en grados (se extiende / se flexiona / reposo); filas de espigas por neurona con la franja «inhibida»; fila de la corteza con «siente dolor»; curva del ángulo (las anteriores del mismo estímulo en gris). En el teléfono, rótulos ×1,5 |
| Pierna | Trazos SVG (`Path2D`) que giran en la rodilla, con el nervio de la pierna y la terminación libre. Con ilustración: `sim_cfg.fondo` y `sim_cfg.pierna` (la pierna se recorta con su silueta) |
| `sim_cfg` | `controles` (golpe, clavo, inh, lesion), `ascendente`, `fondo`, `pierna` |
| CHEQUEOS | `golpe`, `golpeSinInh`, `inhOff`, `inhOn`, `clavo`, `dolor`, `lesion`, `clavoLesion` |
| Pruebas | `caja.__sim.prueba`: `vel(x)`, `golpe()`, `clavo()`, `ir(ms)`, `poner({inh, lesion})`, `plantilla('fondo' | 'pierna')` |
| Guía | `img/reflejo/guia-reflejo-1/2.jpg`: capturas del simulador (rotuliano en su pico; retirada cuando se siente el dolor) |

## Decisiones (tomadas por Claude, para revisar)

| Tema | Decisión |
|---|---|
| Formato del circuito | Simulador propio en vez del armado por capas: misma interfaz que la sinapsis, un paso por caso |
| Niveles | 2: médula automática (rotuliano, interneurona, retirada) y, aparte, vía ascendente + lesión |
| Interneurona apagada | Interruptor didáctico (como «Ca²⁺ bloqueado»): muestra qué aporta la inhibición recíproca |
| Lesión medular | Explica también la espasticidad, que retoma el caso de la toxina botulínica |
| Nervios | Esquema de un solo nervio espinal con ramos (no se separan femoral y ciático) |

## Herramientas

| Archivo | Uso |
|---|---|
| `docs/practico-4_build.py` | Actividades 9, 16 y 17 en `data/seed.sql`; secciones «Sesión 15» al final (`python3 docs/practico-4_build.py`, luego `php admin/seed.php`) |
| `docs/practico-4_imagenes.py` | Integra las imágenes de ChatGPT (fondo y pierna del reflejo; tarjetas de la placa) |
| `docs/practico-3_test.js` | Ahora también `simulador: "reflejo"` (`RUTA=sinapsis-circuitos node docs/practico-3_test.js circuito-reflejo 1 1366 660 a inh`) |
| `docs/prompts-imagenes.md` | §14 fondo y pierna del reflejo (plantillas en `img/_fuentes/plantilla-reflejo-*.png`); §15 tarjetas de la placa motora |

## Pruebas

PHP 8.3 + Playwright, 1366×660 y 390×844: actividad 9 (niveles I y II, con errores a propósito en `inh`, `ret` y `lesion`), actividad 17 (con errores en `miastenia` y `acv`), actividad 16 nivel II (regresión) y la página de la ruta. Sin errores de JavaScript; capturas revisadas (martillo en el tendón, pie dentro del cuadro al extenderse, circuito sin cruces, cuadros con columnas alineadas, teléfono).

## Para subir (FileZilla)

| Archivo | Nota |
|---|---|
| `js/sim-reflejo.js` | Nuevo |
| `js/escenas.js` | Monta el simulador del reflejo |
| `_partials/iconos_neurona.php` | Respaldo SVG de las tarjetas de la placa motora |
| `data/seed.sql` | Después abrir `admin/seed.php` |
| `data/practicos.php` | Ruta: circuito en 2 niveles, guía y conexiones; texto de los casos |
| `img/reflejo/guia-reflejo-1.jpg`, `img/reflejo/guia-reflejo-2.jpg` | Nuevas |
| Borrar en el servidor | `img/reflejo/esquema-base.jpg`, `huso-muscular.jpg`, `medula.jpg`, `placa-motora.jpg`, `sinapsis-excitatoria.jpg`, `sinapsis-inhibitoria.jpg`, `tablero-huecos.jpg` y la carpeta `img/reflejo/piezas/` |

## Pendientes para la sesión 16

| # | Tema | Qué hacer |
|---|---|---|
| 1 | Imágenes del reflejo | ChatGPT §14a (fondo) y §14b (pierna) → `img/_fuentes/reflejo-{fondo,pierna}-chatgpt.png` → `python3 docs/practico-4_imagenes.py` → agregar `fondo`/`pierna` a `sim_cfg` de los 2 niveles; revisar superposición con la plantilla y la pierna girando |
| 2 | Tarjetas de la placa motora | ChatGPT §15 → `img/_fuentes/sitios-placa-chatgpt.png` → mismo script |
| 3 | Revisión de Fer | Probar el circuito nuevo (ritmo de la animación, preguntas, decisiones de arriba) y los enunciados enfermedad/fármaco |
| 4 | Menores (de la sesión 14) | Guías `guia-sinapsis-1/2.svg` al estilo del fondo (opcional); alternativas de Fono del quiz del práctico 3 (f1, f2, f4) |

## Prompt para la sesión siguiente

```
Retomo NeuroLab (C:\repo\neurolab). Lee completo docs/sesiones/sesion-15_practico-4-sintesis-casos-reflejo.md
(sobre todo «Decisiones», «Pendientes para la sesión 16» y «Herramientas»); si hace falta, «Cómo trabajamos» de las
sesiones 12 y 14. Al inicio pide permiso de borrado en la carpeta del repo para que git funcione.
Hoy integramos las imágenes de ChatGPT del práctico 4 (las dejo en img/_fuentes/ con los nombres de
docs/prompts-imagenes.md §14-15): corre docs/practico-4_imagenes.py, revisa la superposición con las plantillas
y la pierna girando, y ajusta sim_cfg. Luego reviso el circuito y los casos y te digo cambios.
Usa docs/practico-4_build.py y docs/practico-3_test.js (PHP 8.3 + Playwright, 1366×660 y 390×844, revisando
capturas). Commits con mi autoría en main (yo hago el Push); entrega con carpeta de origen nueva y verifica md5.
Al final la lista para FileZilla y docs/sesiones/sesion-16_*.md.
```

## Anexo (04-11, 02:00–02:40): imágenes de ChatGPT integradas

| Imagen | Resultado |
|---|---|
| Fondo del reflejo (`img/reflejo/fondo.jpg`) | Calza con la plantilla; sin errores anatómicos. Blanco > 240 pasa a blanco puro (no se nota el borde) |
| Pierna (`img/reflejo/pierna.png`) | Salió 68 px más arriba: se alinea con la plantilla por código (borde de arriba y de atrás) y el blanco pasa a transparente; se dibuja sin recorte |
| Tarjetas de la placa motora (`img/cartas/terminal-del-axon-motor.png`, `hendidura-de-la-placa.png`, `receptor-de-la-fibra-muscular.png`, `axon-motor-mielinizado.png`) | 2.ª versión con el prompt corregido (§15): sin casquete, mielina que termina antes de la terminal, lámina basal pegada al músculo, receptores en las crestas |
| Guías `guia-reflejo-1/2.jpg` | Regeneradas con la ilustración |

Para subir, además de la lista de arriba: `img/reflejo/fondo.jpg`, `img/reflejo/pierna.png` y las 4 tarjetas de `img/cartas/`. Pendientes 1 y 2 de la sesión 16: hechos.
