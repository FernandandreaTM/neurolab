# Sesión 12 · Práctico 3: canales iónicos y potencial de acción · 27-10-2026

## Qué se hizo

La guía «Práctico 8 Neurotransmisión ETMP097 2025» (PhET Membrane Channels + PhET Neuron) pasa a NeuroLab como ruta `potencial-accion`: dos actividades por niveles con el simulador dentro de la actividad, más un quiz de cierre.

| Paso de la ruta | Actividad (id · slug) | Niveles |
|---|---|---|
| 1 | 2 · `canales-membrana` (antes la demo `simulador-canales-membrana`) | I Reposo y canales (simulador propio) · II ¿Qué abre los canales? |
| 2 | 15 · `potencial-accion-neurona` (nueva) | I Del potencial local al de acción · II Mide en el simulador · III Las fases · IV Los canales en cada fase · V El período refractario |
| 3 | 5 · `quiz-potencial-accion` (antes demo vacía) | 11 comunes + 4 TO + 4 Fono (15 por estudiante) |

## Guía 2025 → NeuroLab

| Guía | Dónde quedó |
|---|---|
| I.1 Características de la neurona | Repartida donde aparece: gradientes (I · Reposo), membrana excitable (I · Canal de Na⁺), forma polarizada (II · Nodos) y pregunta integradora (II · Cierre) |
| I.2 Potencial de membrana | Act. 2 · Nivel I · Potencial (aparece en el voltímetro al poner canales de fuga de K⁺) |
| II Distribución de Na⁺/K⁺ en reposo | Act. 2 · Nivel I · Reposo (se verifica en el simulador) |
| II Abrir canales + cuadro comparativo | Act. 2 · Nivel I · Canal de Na⁺ y Canal de K⁺ (cuadro Canal × 4 preguntas) |
| P5 Estímulos que abren canales (dendrita / axón) | Act. 2 · Nivel II (mecánico, ligando, voltaje; toca en la neurona) |
| I.3–4 Local frente a acción, umbral | Act. 15 · Nivel I (sumación animada) |
| P6 Voltajes | Act. 15 · Nivel II (pasos «numero») |
| P7 Fases del PA | Act. 15 · Nivel III (tocar en la curva) |
| P8 Cuadro de canales por fase | Act. 15 · Nivel IV |
| P9 Período refractario | Act. 15 · Nivel V |

## Valores del simulador Neuron (del código fuente de PhET, modelo de Hodgkin-Huxley modificado)

| Medida | Valor | Rango aceptado |
|---|---|---|
| Reposo | −65 mV | −72 a −58 |
| Umbral | no se ve nítido (estímulo siempre supraumbral); se pide ≈ −55 | −62 a −45 |
| Peak | +35 mV | +22 a +48 |
| Mínimo | ≈ −77 mV | −85 a −70 |
| Botón «Estimular» | bloqueado mientras dura el PA, hasta volver a ≈ −66 mV | se usa en el nivel V |

## Corrección del mismo día: simulador propio en «Canales de membrana»

Fer pidió dejar solo nuestro simulador (PhET Membrane Channels era Java, lento y sin voltaje), acortar la actividad y sacar «Antes de empezar».

| Cambio | Detalle |
|---|---|
| `js/sim-membrana.js` (nuevo) | Canvas: iones Na⁺/K⁺ con movimiento al azar, canales de Na⁺ y K⁺ con compuerta, bomba Na⁺/K⁺ (3 Na⁺ fuera, 2 K⁺ dentro cada 0,9 s), barras de concentración, voltímetro con electrodos y registro de 20 s. Potencial por Goldman (GHK): reposo ≈ −70, Na⁺ abierto ≈ +40, K⁺ abierto ≈ −83 mV |
| Paso «sim» | `checks: [{t, c}]` con nombres de `CHEQUEOS` (naAfuera, kAdentro, vNeg, vCero, bombaOff/On, compNa/K, cerradoNa/K, abiertoNa/K, vDespol, vHiper); la lista se marca en vivo y el botón se habilita al cumplirse |
| `simulador: "membrana"`, `reposo_tras` | El simulador ocupa la vista; «↺ Armar reposo» aparece después del caso indicado (aquí, la bomba) |
| Nivel I nuevo | Reposo · Potencial · Bomba (sin bomba el gradiente se disipa y vuelve con ella) · Canal de Na⁺ · Canal de K⁺ |
| Neurona (nivel II) | `neurona-canales.svg` rehecho: neurona sensitiva completa (terminación en la piel, soma en el ganglio, botón pequeño) y aumento de la sinapsis; los nombres se ocultan mientras hay que tocar |


### Segunda corrección (27-10, tarde)

| Cambio | Detalle |
|---|---|
| Panel derecho del lienzo | Concentraciones → voltímetro (número, escala −100 a +60 con aguja) → registro; cables de los electrodos por la derecha |
| Agregar iones | Paleta (Na⁺ verde / K⁺ azul) y se toca afuera o adentro: aparecen 5 iones donde se tocó |
| Canal de fuga | Eliminado como control: la permeabilidad de reposo (K⁺ 2, Na⁺ 0,1) está incluida en el cálculo del potencial |
| Herramientas | Columna izquierda con tarjetas dibujadas: canal de Na⁺ y de K⁺ (− n +, máx. 2; interruptor de compuerta; el dibujo cambia abierto/cerrado) y bomba (interruptor). La bomba parte encendida y está a la izquierda de la membrana |
| Nivel I | Reposo · Potencial (observar el voltímetro, «Vaciar» → 0 mV) · Canal de Na⁺ · Canal de K⁺ · Bomba (bomba apagada + Na⁺ abierto → el Na⁺ se iguala; cerrar + encender → vuelve). «Armar reposo» aparece tras el caso Potencial |
| CHEQUEOS | Sin `fugaK2`; nuevos `naIgual` (Na⁺ adentro ≥ 60 mM) y `sinIones` |

### Tercera corrección (27-10, tarde)

| Cambio | Detalle |
|---|---|
| Reposo con valores | Meta en mM: Na⁺ 150 afuera / 15 adentro, K⁺ 150 adentro / 5 afuera (cada ion = 5 mM; selector «Por toque ×1 / ×5»). Chequeos `na150`, `na15`, `k150`, `k5` (±10 mM; K⁺ afuera 5–10) |
| Menos texto | Sin «interior respecto de afuera», sin frase de estado bajo el voltímetro, sin rótulos bajo canales y bomba, sin aviso en el lienzo vacío; «Registro» a secas |
| Electrodos | Punta a cada lado de la membrana, en el mismo punto (el potencial es local) |
| Bomba | Parte apagada (no mueve iones mientras se arma el reposo); «Armar reposo» deja 150/15/150/5 y la enciende |
| Concentraciones a mano | Agregar o vaciar iones actualiza el voltímetro de inmediato; los flujos por canales lo cambian por permeabilidad |

### Cuarta corrección (27-10, tarde): menos pasos y canales de fuga de vuelta

| Cambio | Detalle |
|---|---|
| Iones | Cada toque agrega 5 iones (25 mM); sin selector. Metas: Na⁺ 150 afuera / 25 adentro, K⁺ 150 adentro / casi nada afuera (`na150`, `na25`, `k150`, `k0`) |
| Canales de fuga | Vuelven como parte fija de la membrana (2, sin control): K⁺ cruza siempre. El cálculo usa un piso de 5 mM de K⁺ afuera |
| Paso «sim» con `q` | Lista + pregunta en el mismo paso; la pregunta se habilita al completar la lista |
| Nivel I | 10 pasos (antes 23): Reposo 2 · Potencial 1 · Na⁺ 2 · K⁺ 2 · Bomba 3. Bomba encendida al inicio; canales con compuerta: máximo 1 de cada tipo |
| Valores | Reposo ≈ −70 · Na⁺ abierto ≈ +30 · K⁺ abierto ≈ −88 mV; sin bomba la fuga disipa el K⁺ lentamente |

### Quinta corrección (27-10, tarde): nivel II compacto

| Cambio | Detalle |
|---|---|
| Paso «tocar» con `q` | Al tocar la zona correcta, la pregunta aparece en el mismo paso (`r.tocado`, errores en `r.qmal`) |
| Nivel II | 6 pasos (antes 16): Presión, Glutamato, GABA, Cono axónico y Nodos (toca + pregunta combinada) y Cierre (las tres características) |

### Sexta corrección (27-10, noche): mínimo de pasos y preguntas reescritas

| Cambio | Detalle |
|---|---|
| Nivel I | 5 pasos (uno por caso, sin «predice»): Reposo · Potencial · Canal de Na⁺ · Canal de K⁺ · Bomba; cada uno = lista en el simulador + 1 pregunta |
| Nivel II | 6 pasos (sin cambios en estructura) |
| Preguntas | Enunciados directos y alternativas breves de largo parejo (p. ej. «Se despolarizó: entró Na⁺» / «Se hiperpolarizó: entró Na⁺» / …); el contenido que salió quedó en «Para recordar» |

### Séptima corrección (27-10, noche): animación del canal de Na⁺

| Cambio | Detalle |
|---|---|
| Entrada de Na⁺ | Sin «embudo» (amontonaba iones y los hacía entrar y salir): el Na⁺ de afuera que llega a ≤ 150 px del canal abierto se acerca a la boca y cruza en fila (uno cada 0,28 s por canal). Salir por el canal: probabilidad 0,05 (gradiente químico y eléctrico hacia adentro) |
| Bomba | Un ciclo cada 1,8 s (antes 1,2) para que la entrada de Na⁺ se note en las barras |

### Octava corrección (27-10, noche): esquema del nivel II

| Cambio | Detalle |
|---|---|
| Piel | Trozo periférico pequeño a la izquierda con la terminación libre (ya no ocupa todo el lado) |
| Aumentos | Sinapsis excitatoria más grande (hendidura angosta, vesícula que se fusiona, densidad postsináptica, 3 receptores-canal verdes) y aumento nuevo de la sinapsis inhibitoria (vesículas con GABA, 3 receptores-canal amarillos) |
| Leyenda | En el esquema: glutamato, GABA, Na⁺, Cl⁻, receptor-canal de glutamato y de GABA. Partícula nueva `gaba` en `escenas.js`; `nt` se llama «Glutamato» |
| Animaciones | Glutamato cruza la hendidura y queda en los receptores (se iluminan) → entra Na⁺ por ellos; GABA → entra Cl⁻; `escala` 1,15 en el nivel (partículas más chicas) |
| Prompt ChatGPT | §12 de `prompts-imagenes.md` rehecho; plantilla sin textos `img/_fuentes/plantilla-neurona-canales.png` |

### Novena corrección (27-10, noche): ilustración de ChatGPT en el nivel II

| Cambio | Detalle |
|---|---|
| Fondo | `img/potencial/neurona-canales.jpg` (1536×1024): ilustración de ChatGPT (`img/_fuentes/neurona-canales-chatgpt.png`, 2.ª versión: piel con epidermis a la izquierda, citoplasma postsináptico liso) + leyenda pegada abajo a la derecha |
| Coordenadas | La imagen es la plantilla ×1,28 → `vb` 1200×800 (mismas coordenadas del SVG). Ajustadas: piel, botón inhibitorio, cono axónico y nodos (910, 1018, 1126) |
| Nombres | Se suman Piel, Ganglio sensitivo, Axón inhibitorio e Hendidura sináptica (antes estaban escritos en el SVG) |
| SVG | `neurona-canales.svg` queda sin uso (plantilla y respaldo) |

### Décima corrección (27-10, noche)

| Cambio | Detalle |
|---|---|
| Marcas | Receptores y nodos medidos por color en la ilustración: receptores de glutamato x 314–347 (y 559, 607, 653), de GABA y 179–216 (x 885, 932, 978), nodos x 899, 1006, 1117 |
| Leyenda | Receptor-canal de GABA de pie |

### Undécima corrección (27-10, 23 h): esquema 1200×800 con aumento del cono axónico

| Cambio | Detalle |
|---|---|
| Esquema | `neurona-canales.svg` pasa a 1200×800 (= 1536×1024 ÷ 1,28, la proporción de ChatGPT). Axón inhibitorio y su aumento a la izquierda (botón arriba-izquierda del soma); aumento nuevo del cono axónico arriba a la derecha con 3 canales de Na⁺ de voltaje (sensor naranjo, compuerta), sin neurotransmisor |
| Fondo | El nivel II vuelve al SVG mientras llega la ilustración nueva; `neurona-canales.jpg` (versión anterior) queda sin uso |
| Mini-registro | Marco fijo en el esquema (grupo `superpuesto`: «Registro en el cono axónico», reposo, umbral; también la leyenda). La animación dibuja la curva: PPSE (Glutamato), PPSI (GABA) y potencial de acción (Cono: «Llega la despolarización» sin inhibición → «Abren por voltaje») |
| Receptores (versión intermedia del punto 2) | Cada molécula se posa en su receptor, el receptor se ilumina y luego pasan los iones |
| Zonas | Se agregan los aumentos: `zoomI` vale para GABA y `zoomC` para el cono |
| Prompt | §12 de `prompts-imagenes.md` rehecho (3 aumentos, zonas vacías abajo) y plantilla nueva |

### Duodécima corrección (27-10, 23 h): corpúsculo de Pacini

| Cambio | Detalle |
|---|---|
| Receptor de la piel | La terminación libre (sobre todo dolor y temperatura) pasa a corpúsculo de Pacini en la dermis profunda (presión y vibración), con su aumento arriba a la izquierda: capas concéntricas y terminal con 3 canales mecanosensibles (índigo) |
| Caso «Presión» | Texto, zonas (`pacini`, `zoomM`), fila del cuadro y «Para recordar» (PIEZO2; libres = dolor/temperatura; Meissner = tacto fino); animación: «⬇ Presión», capas y canales se iluminan, entra Na⁺ |
| Leyenda | + «Canal mecanosensible» |
| Prompt | §12 actualizado (4 aumentos) y plantilla nueva |

### Decimotercera corrección (27-10, 23:45): ilustración final del nivel II

| Cambio | Detalle |
|---|---|
| Fondo | `img/potencial/neurona-canales.jpg` = ilustración de ChatGPT (4 aumentos) + grupo `superpuesto` del SVG (leyenda y marco del registro) pegado a ×1,28 |
| Verificación | Receptores, canales y nodos medidos por color: coinciden con el SVG (± 3 px); zonas y efectos sin cambios |
| Pendiente opcional | El Pacini quedó junto a la epidermis (debería estar más profundo, hacia la derecha) y la piel es más alta que en la plantilla |

## Motor `escenas` (nuevo, compatible con lo anterior)

| Campo | Uso |
|---|---|
| `sim: {url, t, pie}` (nivel) | Barra «🖼 Esquema · 🧪 Simulador» + iframe persistente (no se recarga al repintar) + enlace «Abrir en otra pestaña» |
| `vista: "sim"/"esquema"` (paso) | Cambia la vista al empezar el paso; al resolver un caso con animación vuelve al esquema |
| Paso `mira` con `p`, `lista` | Instrucción con lista numerada; `anim: false` no dispara la animación del caso |
| Paso `numero` | `rango`, `unidad`, `ok_t`, `nombre`, `pista`; avisa si el signo está mal o si el valor es muy alto o bajo |
| `fondo` / `fondo_ok` (caso) | Imagen propia del caso / imagen al resolverlo (p. ej. canal abierto) |
| `capas: [{src, casos}]` (nivel) | Imágenes PNG/WebP con alfa sobre el fondo; aparecen con fundido al resolver alguno de esos casos y **quedan** (acumulativas). Se precargan al iniciar |
| `con` (en un nombre de `nombres`) | El rótulo solo se muestra si ese caso ya está resuelto |
| Paso `tocar` con `q` | Tocar la zona correcta destapa la pregunta en el mismo paso (`r.tocado`, errores en `r.qmal`); mientras se toca, los nombres se ocultan |
| Paso `sim` con `checks` + `q` | Lista que se marca sola desde el simulador propio; al completarla se habilita la pregunta |
| `simulador: "membrana"`, `reposo_tras` (nivel) | Simulador propio en la vista; botón «Armar reposo» desde el caso indicado |
| `escala` (nivel) | Tamaño de las partículas animadas |
| Animación `anim` (caso) | `efectos` (`e` elipse, `r` rect, `l` línea; `a`: pulso, crece, traza; `t` retardo; `dash`), `flujos` (`fl(d, partícula, n, dur, t)`; `rep:false`, `paso`), `rotulos` (`rot(x, y, texto, retardo, i=izquierda)`) |
| Efecto `a: "traza"` | Línea que se dibuja (`dur`); curvas de potencial |
| Partículas | `na`, `k`, `cl`, `nt` |
| `guia_src` (nivel) | Imagen ya rotulada para la guía |
| `nombres_paso` (nivel) | Nombre por tipo de paso (aquí `elegir` → «Pregunta») |

## Gráficos

`img/potencial/*.svg` (17), generados por `docs/practico-3_svg.py`; coordenadas en `docs/practico-3_coords.json`. El contenido de los niveles se genera con `docs/practico-3_build.py` (ver «Herramientas»).
Prompt opcional de ChatGPT para la neurona del nivel II (el prompt de §12 describe el esquema anterior: rehacerlo si se usa): `docs/prompts-imagenes.md` §12 (plantilla `img/_fuentes/plantilla-neurona-canales.png`).

## Pruebas

PHP 8.3 + Playwright, 1366×660 y 390×844: los 8 niveles completos (con errores a propósito, pistas, `numero` con valor fuera de rango, tocar fuera de zona), cuadros, cierre, ruta, quiz y guía. Sin errores de JavaScript. Los simuladores de PhET no se pudieron cargar en el entorno de prueba (red bloqueada): **revisar en el navegador que ambos se vean dentro del iframe**. El simulador de la neurona (PhET Neuron) tiene además el enlace «Abrir el simulador en otra pestaña».

## Qué subir (FileZilla), estado final

| Archivo | Nota |
|---|---|
| `js/escenas.js`, `js/sim-membrana.js`, `js/guia.js`, `css/mesa.css`, `css/guia.css`, `_partials/mesa.php` | Motor, simulador y guía |
| `data/seed.sql` | Después abrir `admin/seed.php` |
| `data/practicos.php` | Ruta `potencial-accion` |
| `img/potencial/` | SVG de la actividad 15 + `neurona-canales-base.jpg`, `neurona-canales.jpg` (guía) y `capa-{pacini,glu,gaba,cono,registro}.webp` |

En el pool, revisar que `canales-membrana`, `potencial-accion-neurona` y `quiz-potencial-accion` estén en «Funcionando».

## Estado al cierre (28-10-2026, 00:40)

| Qué | Estado |
|---|---|
| Actividad 2 · Canales de membrana | **Lista y revisada por Fer**: nivel I (simulador propio, 5 pasos) y nivel II (ilustración con revelado progresivo, 6 pasos) |
| Actividad 15 · El potencial de acción | **Sin revisar** (primera versión): 5 niveles, 21 casos, ~45 pasos con PhET Neuron en iframe, muchos «predice» y bloques de 3 «elegir». Hay que aplicarle todo lo de abajo |
| Quiz de cierre (actividad 5) | Sin revisar por Fer |
| Commit | Pendiente (Fer, GitHub Desktop; no incluir `js/lamina.js`, cambio anterior suyo) |
| Borrar a mano en el repo | `.tmpx/` y las imágenes sin uso: `img/potencial/neurona-canales-{pacini,glu,gaba,cono}.jpg`, `membrana.svg`, `canales.svg`, `canal-na-abierto.svg`, `canal-k-abierto.svg` (`neurona-canales.svg` queda como plantilla) |

## Actividad 15 hoy (para revisar) y lo que ya cubre la actividad 2

| Nivel actual | Casos y pasos | Qué ya se vio en la actividad 2 (no repetir: solo recordar en una línea o usarlo de partida) |
|---|---|---|
| I Del potencial local al de acción (`ejes-sumacion.svg`) | débil (predice) · fuerte (predice+elegir) · suma (predice+elegir) · inhib (predice) · compara (3 elegir) | Act. 2-II ya mostró PPSE, PPSI y el PA en el mini-registro del cono, y que el umbral abre canales de voltaje en el cono. Aquí lo nuevo es **sumación temporal/espacial, graduado vs todo o nada, decremento con la distancia** |
| II Mide en el simulador (PhET) | explora (mira+elegir) · reposo · peak · umbral · hiper (numero) | Act. 2-I ya midió el reposo (≈ −70) con nuestro voltímetro. Lo nuevo: **valores del PA** (peak, umbral, hiperpolarización) |
| III Las fases (`pa-curva.svg`) | despol, repol, hiper, umbral: tocar + elegir cada uno | Act. 2-I: entrar Na⁺ = despolariza, salir K⁺ = hiperpolariza. Lo nuevo: **orden temporal y nombre de cada fase en la curva** |
| IV Canales en cada fase (PhET) | 3 casos × (mira + 3 elegir) = 12 pasos | Lo nuevo: **estado de compuertas** (Na⁺: activación + inactivación; K⁺ lento) por fase — es el cuadro P8 de la guía 2025 |
| V Período refractario | doble (predice+mira+elegir) · abs (elegir+tocar+elegir) · rel (tocar+elegir) · para (elegir) | Lo nuevo: **absoluto vs relativo y su consecuencia** (unidireccionalidad, frecuencia máxima). Ya se vio salto de nodo en nodo |

Propuesta de partida (a confirmar con Fer): simulador propio del PA (reutilizar el estilo de `sim-membrana.js`: canvas 1200×720, voltímetro y registro a la derecha, herramientas a la izquierda) con estímulo de intensidad regulable y botón doble estímulo; canales de Na⁺ (2 compuertas) y K⁺ dibujados en la membrana que cambian de estado según el modelo; cursor sobre el registro para mirar una fase. Eso permite fusionar II + III + IV en pasos `sim` con `checks` + `q` (p. ej. `vPeak`, `faseRepol`, `naInactivo`) y V con doble estímulo. Valores de referencia: los de PhET (tabla de arriba) o Hodgkin-Huxley simplificado (reposo −70, umbral −55, peak +30/+40, mínimo −80).

## Cómo trabajamos (aprendido en esta sesión; aplicar desde el primer borrador)

### Contenido y preguntas

| Regla | Detalle / error que evita |
|---|---|
| Un paso por caso | Acción (simulador o tocar) + su pregunta en el **mismo** paso (`sim`+`q`, `tocar`+`q`). Fer rechazó dos veces versiones largas (23 → 10 → 5 pasos en el nivel I; 16 → 6 en el II) |
| Sin «predice» de relleno ni «Antes de empezar» | Las preguntas van donde la característica **emerge** en la actividad, no al inicio en abstracto |
| Preguntas cortas y parejas | Enunciado directo; 4 alternativas breves, del mismo largo y estructura (p. ej. «Se despolarizó: entró Na⁺ / Se hiperpolarizó: entró Na⁺ / …»). La correcta **no** puede ser la más larga ni la más detallada. Nada rebuscado |
| No preguntar lo que la imagen ya dice | Si la zona está marcada o ampliada, «¿dónde?» es trivial: mostrar el dibujo base y **destapar** el aumento al responder |
| «Para recordar» | Lo que sale de las preguntas va ahí (2–3 oraciones), no en el enunciado. No meter instrucciones de la interfaz (p. ej. «Desde ahora tienes Armar reposo») porque también va a la guía |
| Valores con unidades | Si se pide armar una condición, dar la meta en mM (150 / 25); aclarar que cada ion dibujado representa 5 mM (en una célula real son miles de millones) |
| Exactitud científica primero | Revisar cada animación: p. ej. la despolarización **no** viaja como flujo de Na⁺ por el soma (corriente local → onda, Na⁺ solo por los canales de voltaje); presión → corpúsculo de Pacini (dermis profunda), no terminación libre. Advertir a Fer antes de simplificar algo esencial (los canales de fuga se sacaron y hubo que volver a ponerlos) |

### Simulador propio

| Regla | Detalle |
|---|---|
| Interfaz mínima | Herramientas a la izquierda con esquemas (tarjetas dibujadas, interruptores); a la derecha concentraciones → voltímetro (número + escala con aguja) → registro. Nada de texto de estado sobre el lienzo |
| Una sola forma de hacer cada cosa | Sin selectores tipo ×1/×5: Fer pidió quitar opciones que complican |
| Animación natural | Iones que cruzan en fila por el canal abierto, sin amontonarse ni entrar y salir; bomba lenta (1,8 s) para que se note el efecto |
| Fenómeno local | Electrodos pegados a la membrana, a ambos lados del mismo punto |
| Física creíble | GHK con concentraciones suavizadas (EMA 0,12); pisos mínimos para evitar valores absurdos (−105 mV) |
| `CHEQUEOS` con nombre | Condiciones del estado que usan los pasos `sim`; API `crearSim…(caja)`, `estado()`, `alCambiar(fn)` |

### Imágenes

| Regla | Detalle |
|---|---|
| Flujo | Esquema SVG propio 1200×800 (= 1536×1024 de ChatGPT ÷ 1,28) → plantilla PNG sin textos → prompt en `docs/prompts-imagenes.md` → Fer guarda la imagen en `img/_fuentes/` → revisarla (errores anatómicos: pedir corrección a ChatGPT) |
| Composición | Leyenda y marcos (registro) se pegan desde el SVG (grupo `superpuesto`) a ×1,28; medir por color las posiciones reales (receptores, nodos) y ajustar zonas |
| Revelado progresivo | Base sin aumentos ni líneas punteadas (inpainting, `docs/practico-3_revelar.py`) + `capas` WebP con alfa por caso; la guía usa la imagen completa (`guia_src`) |
| Rótulos | Revisar que los nombres no choquen entre sí ni con los aumentos ya destapados (captura con «Nombres» activo en el cierre); rótulos de la animación cortos («PA») si no caben |
| Partículas | `na` verde, `k` azul, `cl` amarillo, `nt` «Glutamato» (triángulo rosado), `gaba` (rombo naranjo) |

### Proceso

| Regla | Detalle |
|---|---|
| Analizar → proponer en tabla → confirmar → ejecutar | Fer quiere ver la propuesta por nivel (pasos, preguntas, gráficos) antes del código; terminar con «¿Procedo con X o prefieres Y?» |
| Probar siempre | PHP 8.3 (`php -S 127.0.0.1:8080`) + Playwright, 1366×660 y 390×844, con errores a propósito; mirar las capturas (no solo «sin errores JS»): superposiciones, transiciones, guía |
| Imágenes que cambian por caso | Nunca cambiar el `src` del fondo (parpadea mientras carga): usar `capas` precargadas |
| Entrega | Lista de archivos para FileZilla + `admin/seed.php`; Fer hace el commit. En su PC no se pueden borrar archivos: avisarle qué borrar |

## Herramientas (en el repo)

| Archivo | Uso |
|---|---|
| `docs/practico-3_build.py` | Genera los bloques JSON de las actividades 2 y 15 y los reemplaza en `data/seed.sql` (`python3 docs/practico-3_build.py`, luego `php admin/seed.php`). Está por capas: cada corrección se agrega al final, antes del bucle `for N_ in (L1, A3, B1, …)`. Para la actividad 15 conviene reescribir B1–B5 limpios en vez de seguir apilando |
| `docs/practico-3_quiz.py` | Genera el bloque del quiz (actividad 5) |
| `docs/practico-3_test.js` | Recorre un nivel completo: `node docs/practico-3_test.js potencial-accion-neurona 1 1366 660 a` (capturas en `/tmp/shots/`; `GUIA=1` captura la guía) |
| `docs/practico-3_svg.py` + `docs/practico-3_coords.json` | Esquemas SVG de `img/potencial/` y coordenadas de curvas |
| `docs/practico-3_revelar.py` | Base sin aumentos y capas del nivel II de la actividad 2 |

## Prompt para la sesión siguiente

```
Retomo NeuroLab (C:\repo\neurolab). Lee completo docs/sesiones/sesion-12_practico-3-canales-potencial.md:
sobre todo «Estado al cierre», «Actividad 15 hoy», «Cómo trabajamos» y «Herramientas».
Trabajamos la actividad 15 «El potencial de acción» (slug potencial-accion-neurona, práctico 3, ruta potencial-accion).
Hoy es la primera versión (5 niveles, ~45 pasos, PhET Neuron en iframe, muchos «predice» y bloques de 3 preguntas).
Aplícale desde el primer borrador todo lo aprendido en la actividad 2: un paso por caso (acción + pregunta en el
mismo paso), preguntas cortas con alternativas parejas, nada que la imagen ya responda, «Para recordar» sin
instrucciones de la interfaz, exactitud científica revisada en cada animación y no repetir lo que ya cubre la actividad 2.
Primero propónme en una tabla cómo quedaría cada nivel (pasos, preguntas, gráficos/animaciones) y si hacemos un
simulador propio del potencial de acción (estilo sim-membrana.js) en vez de PhET; espera mi confirmación antes de programar.
Usa docs/practico-3_build.py para generar el seed y docs/practico-3_test.js para probar (PHP 8.3 + Playwright,
1366×660 y 390×844, revisando las capturas). Si hace falta una imagen, dame la plantilla y el prompt de ChatGPT.
Trabaja sobre main; al final la lista de archivos para FileZilla. Al cerrar, escribe docs/sesiones/sesion-13_*.md.
```

## Anexo (27-10, noche → 28-10): revelado progresivo en el nivel II
- Fondo base `img/potencial/neurona-canales-base.jpg` (dibujo + leyenda). Capas acumulativas `img/potencial/capa-{pacini,glu,gaba,cono,registro}.webp` (`capas` del nivel en escenas.js): al resolver cada caso su aumento aparece con fundido y queda; el registro aparece con glu, gaba o cono. Precargadas al iniciar. La guía usa la imagen completa (`guia_src`). PA del mini-registro más bajo, rótulo «PA» a la derecha del peak.
- Zonas de los aumentos eliminadas: solo se acepta tocar la estructura.
- Cono: se quitó el flujo de Na⁺ por el interior del soma (incorrecto: la despolarización llega por corriente local); ahora una onda (traza) soma→cono y el Na⁺ entra solo por los canales de voltaje del aumento.
- Imágenes generadas con `docs/practico-3_revelar.py` (inpainting de la ilustración de ChatGPT + capa superpuesta).
- 28-10: nombres del nivel II reubicados sin choques con los aumentos; `con` en un nombre lo muestra solo con ese caso resuelto (Hendidura sináptica → glu). Guía: quitada la frase «Desde ahora tienes «Armar reposo»»; tablas «Caso / Pregunta» de escenas ahora se dibujan como lista con píldora del caso (antes caían en el formato de quiz y el nombre no cabía en el círculo) — js/guia.js + css/guia.css.
