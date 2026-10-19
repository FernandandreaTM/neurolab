# Prompts de imágenes para ChatGPT (NeuroLab)

Estilo de referencia: `img/neurona-partes.jpg` (adjúntala al pedir cada imagen).

## 1. Neurona · Nivel II (estructura específica) → `img/neurona-nivel2.png`

```
Adjunto una ilustración de referencia. Crea una NUEVA ilustración científica con
exactamente el mismo estilo: dibujo médico-educativo semi-realista y limpio, trazo suave,
neurona en tonos lila/violeta (#8B5CF6 a #C4B5FD), mielina en celeste translúcido,
mitocondrias naranjas, fondo blanco puro, sin sombras duras.

Formato horizontal 3:2 (1536 × 1024 px). SIN texto, SIN letras, SIN números, SIN flechas
con rótulos ni líneas de indicación: las etiquetas se agregarán después por encima.
Deja espacio blanco alrededor de las estructuras para poner etiquetas.

Composición: una neurona multipolar mielinizada, con el soma a la izquierda y el axón
hacia la derecha, más DOS RECUADROS DE AMPLIACIÓN (zoom) circulares unidos con líneas finas
grises a la zona que amplían. Deben verse con claridad estas estructuras:

Neurona completa:
- Dendritas con ESPINAS DENDRÍTICAS bien visibles (pequeñas protrusiones con cabeza
  redondeada) en al menos una rama, que se vea notoria.
- Soma con núcleo y NUCLÉOLO, CUERPOS DE NISSL (grumos violeta oscuro/azulados de retículo
  rugoso alrededor del núcleo), APARATO DE GOLGI (sáculos curvos apilados, celeste) y
  MITOCONDRIAS naranjas.
- Cono axónico y SEGMENTO INICIAL DEL AXÓN: tramo desnudo (sin mielina) más oscuro, justo
  antes del primer segmento de mielina.
- Axón con 3–4 segmentos de mielina y nódulos de Ranvier; sobre UN segmento de mielina, el
  núcleo alargado de una CÉLULA DE SCHWANN (aplanado sobre la vaina, color celeste más
  intenso con núcleo violeta).
- Una COLATERAL AXÓNICA: rama lateral que sale del axón en ángulo recto, entre dos nódulos.
- La colateral termina en un CONO DE CRECIMIENTO: extremo ensanchado en forma de mano con
  filopodios finos (dedos) y lamelipodio membranoso.
- Terminales del axón a la derecha, con botones terminales.

Recuadro de ampliación 1 (sobre el axón, arriba al centro): interior del axón en corte
longitudinal mostrando MICROTÚBULOS (tubos paralelos verdes azulados), NEUROFILAMENTOS
(filamentos más finos y ondulados, grises) y dos proteínas motoras sobre un microtúbulo:
una KINESINA (proteína con dos "pies", color rosado) llevando una vesícula hacia la derecha
(hacia el terminal) y una DINEÍNA (proteína más grande, color amarillo) llevando una
vesícula hacia la izquierda (hacia el soma). Cada proteína en un extremo distinto del
recuadro, bien separadas.

Recuadro de ampliación 2 (sobre un botón terminal, abajo a la derecha): corte de un botón
terminal con muchas VESÍCULAS SINÁPTICAS (esferas pequeñas con puntos) y 1–2 mitocondrias.
Sin mostrar la célula postsináptica en detalle (sólo una línea suave de membrana opuesta).

Cada estructura debe ocupar una zona propia y ser fácil de señalar con un punto.
```

Después de tenerla: subirla como `img/neurona-nivel2.png` y avísame para ubicar los 13 puntos
(o usa `actividad.php?slug=labeling-neurona-nivel-2&calibrar=1` con la actividad activa).

## 2. Íconos de tipos de neurona → `img/tipos/<nombre>.png`

Pedir **una imagen por ícono** (salen más consistentes), todas con este bloque común:

```
Adjunto una ilustración de referencia. Crea un ÍCONO cuadrado (1024 × 1024 px) con
exactamente el mismo estilo: ilustración médico-educativa semi-realista y limpia, neurona
en tonos lila/violeta (#8B5CF6 a #C4B5FD), mielina celeste translúcida, fondo blanco puro,
SIN texto, SIN letras, SIN números. La neurona centrada, ocupando ~80 % del cuadro, con
silueta muy reconocible a tamaño pequeño (se verá a 40–60 px): pocas ramas, trazo grueso,
el soma bien marcado. El axón termina en botones terminales pequeños.
Neurona: [DESCRIPCIÓN]
```

| Archivo | [DESCRIPCIÓN] |
|---|---|
| `bipolar.png` | Neurona BIPOLAR: soma fusiforme/ovalado horizontal; de un polo sale UNA dendrita corta ramificada (izquierda) y del polo opuesto UN axón (derecha). Sólo dos prolongaciones. |
| `pseudounipolar.png` | Neurona PSEUDOUNIPOLAR (ganglio de la raíz dorsal): soma redondo arriba; de él sale UNA sola prolongación corta hacia abajo que se divide en forma de «T»: una rama larga hacia la izquierda (periférica, terminando en terminaciones sensitivas finas) y otra hacia la derecha (central, con botones terminales). Ambas ramas con segmentos de mielina celeste. |
| `multipolar.png` | Neurona MULTIPOLAR: soma estrellado con 5–6 dendritas ramificadas en distintas direcciones y UN axón más largo hacia la derecha con mielina. |
| `piramidal.png` | Neurona PIRAMIDAL de la corteza: soma triangular con el vértice hacia arriba; UNA dendrita apical larga y recta hacia arriba que se ramifica en la punta; 3–4 dendritas basales cortas desde la base; axón hacia abajo. |
| `purkinje.png` | CÉLULA DE PURKINJE del cerebelo: soma grande en forma de pera abajo; árbol dendrítico enorme, muy ramificado y APLANADO en forma de abanico hacia arriba; axón corto hacia abajo. |
| `motoneurona.png` | MOTONEURONA espinal: soma multipolar grande a la izquierda con varias dendritas; axón largo mielinizado hacia la derecha que termina sobre una FIBRA MUSCULAR esquelética (cilindro rosado con estrías) formando una placa motora. |

Subirlos a `img/tipos/` con esos nombres exactos: la página los usa automáticamente en vez
de los dibujos provisorios (no hay que tocar código).

## 3. Set coherente (versión final, 2026-10-06)

Los tres niveles usan la MISMA neurona:
| Archivo | Origen | Nivel |
|---|---|---|
| `img/neurona-base.jpg` | `img/_fuentes/base-espinas.png` (ChatGPT: imagen 2 sin zooms + espinas en todas las dendritas) | I y II |
| `img/neurona-nivel3-zoom.jpg` | Composición: 4 zooms (A espina = `_fuentes/zoom-espina.png`, B axón, C cono y D botón = `_fuentes/neurona-nivel2-actina.png`) + miniatura de la base con líneas | III |

## 4. Esquemas de glía (práctico II) → `img/glia-snc.jpg`, `img/glia-snp.jpg`

Adjuntar `img/neurona-base.jpg` como referencia de estilo. Formato 1536 × 1024, optimizadas a JPG (< 300 KB).
Originales en `img/_fuentes/glia-snc.png` y `img/_fuentes/glia-snp.png`. Números: `data/seed.sql` (actividades 10 y 11, nivel I).

### Glía del SNC → `img/glia-snc.jpg`

```
Adjunto una ilustración de referencia. Crea una NUEVA ilustración científica con exactamente
el mismo estilo: dibujo médico-educativo semi-realista y limpio, trazo suave, fondo blanco puro,
sin sombras duras. Neuronas en lila/violeta (#8B5CF6 a #C4B5FD) y mielina celeste translúcida.

Formato horizontal 3:2 (1536 × 1024 px). SIN texto, SIN letras, SIN números, SIN flechas ni
líneas de indicación. Deja espacio blanco alrededor de cada célula para poner etiquetas.

Escena: un trozo de tejido del sistema nervioso central con cuatro tipos de glía, cada una en
una zona propia, bien separadas y fáciles de señalar con un punto. Evita verde, rojo y naranjo.
- Al centro, el soma de una neurona multipolar (violeta) con algunas dendritas.
- Arriba a la izquierda, un CAPILAR pequeño con 2–3 glóbulos rojos.
- ASTROCITO (rosado suave #F9A8D4): grande, en forma de estrella; una o dos prolongaciones
  terminan en pies ensanchados que abrazan el capilar y otra toca el soma de la neurona.
- OLIGODENDROCITO (azul #60A5FA): soma pequeño y redondo con 3–4 prolongaciones; cada una
  forma un segmento de mielina celeste en un axón DISTINTO (3–4 axones paralelos a la derecha).
- MICROGLÍA (gris azulado #94A3B8): la más pequeña, núcleo alargado y ramas muy finas.
- CÉLULAS EPENDIMARIAS (amarillo pálido #FDE68A): abajo, una hilera de 6–8 células cúbicas
  que revisten una cavidad celeste muy pálida, con cilios finos hacia la cavidad.
```

### Glía del SNP → `img/glia-snp.jpg`

```
Adjunto una ilustración de referencia. Crea una NUEVA ilustración científica con exactamente
el mismo estilo: dibujo médico-educativo semi-realista y limpio, trazo suave, fondo blanco puro,
sin sombras duras. Neuronas en lila/violeta (#8B5CF6 a #C4B5FD) y mielina celeste translúcida.

Formato horizontal 3:2 (1536 × 1024 px). SIN texto, SIN letras, SIN números, SIN flechas ni
líneas de indicación. Deja espacio blanco alrededor de cada célula para poner etiquetas.

Escena: sistema nervioso periférico. Evita verde, rojo y naranjo.
- A la izquierda, el soma grande y redondo de una neurona pseudounipolar (violeta) con su
  prolongación en «T». Alrededor del soma, un anillo continuo de 8–10 CÉLULAS SATÉLITE
  aplanadas (color arena #E7D7C1) con núcleo pequeño.
- La rama periférica va hacia la derecha con 3 segmentos de mielina celeste separados por
  nódulos. Cada segmento es una CÉLULA DE SCHWANN (celeste intenso #38BDF8) con su núcleo
  alargado por fuera, sobre la mielina.
- Abajo a la derecha, un RECUADRO DE AMPLIACIÓN circular (corte transversal), unido con una
  línea gris fina a la rama periférica: (a) un axón mielinizado con anillos de mielina y el
  núcleo de Schwann por fuera; (b) una sola CÉLULA DE SCHWANN NO MIELINIZANTE que envuelve
  5–6 axones delgados violeta, cada uno hundido en un surco, sin mielina.
- Arriba a la derecha, un recuadro circular más pequeño con un OLIGODENDROCITO (azul #60A5FA)
  mielinizando 3 axones, para comparar.
```

**Ojo:** ChatGPT dibujó la neurona con dos prolongaciones separadas (forma bipolar) aunque se le pidió la T.
Se corrigió a mano: tallo único que llega al medio de una fibra continua (T en un nódulo de Ranvier),
mielina a ambos lados de la T y terminaciones periféricas libres (sin botones). Después se pidió a ChatGPT
sólo un retoque de estilo, con este prompt y la imagen corregida adjunta:

```
Adjunto un esquema científico. Quiero que lo PULAS para que todo se vea con el mismo
acabado de ilustración médico-educativa semi-realista, pero SIN CAMBIAR la composición
ni la anatomía. Es un retoque, no un dibujo nuevo.
[…] La neurona es PSEUDOUNIPOLAR: del soma sale UNA SOLA prolongación corta (el tallo),
que llega al medio de una fibra continua formando una «T». No agregues ni quites
prolongaciones al soma. […] Formato 3:2 (1536 × 1024 px), fondo blanco puro, SIN texto.
```
## 5. Práctico II · Íconos de glía → `img/glia/<nombre>.png`

Se usan solos en las tarjetas (Glía del SNP nivel I y quiz de cierre) apenas se suben con el nombre exacto:
no hay que tocar código (`_partials/iconos_neurona.php` busca en `img/tipos/` y `img/glia/`).
Adjunta `img/tipos/multipolar.png` como referencia de estilo y usa este bloque común:

```
Adjunto un ícono de referencia. Crea un ÍCONO cuadrado (1024 × 1024 px) con exactamente el
mismo estilo: ilustración médico-educativa semi-realista y limpia, trazo grueso, fondo blanco
puro, SIN texto, SIN letras, SIN números. La célula centrada, ocupando ~80 % del cuadro, con
silueta muy reconocible a tamaño pequeño (se verá a 40–60 px). La célula glial en verde
azulado (#14B8A6 a #99F6E4); si aparece una neurona o un axón, en lila (#8B5CF6 a #C4B5FD)
y la mielina en celeste translúcido.
Célula: [DESCRIPCIÓN]
```

| Archivo | [DESCRIPCIÓN] |
|---|---|
| `astrocito.png` | ASTROCITO: soma pequeño con muchas prolongaciones en forma de estrella; una de ellas termina en un «pie» ensanchado que abraza un capilar (tubo rojo corto). |
| `oligodendrocito.png` | OLIGODENDROCITO: soma redondo pequeño con 4 prolongaciones; cada una se enrolla como vaina de mielina alrededor de un axón distinto (4 axones lila paralelos). |
| `microglia.png` | MICROGLÍA: soma pequeño y alargado con prolongaciones finas, cortas y muy ramificadas, como un arbusto; junto a ella un pequeño resto celular que está fagocitando. |
| `celula-ependimaria.png` | CÉLULAS EPENDIMARIAS: 3 células cúbicas en fila, una al lado de la otra, con cilios finos en su borde superior (hacia una cavidad celeste clara que representa el LCR). |
| `celula-de-schwann.png` | CÉLULA DE SCHWANN: un segmento de axón lila horizontal envuelto por UNA sola vaina de mielina celeste en espiral, con el núcleo aplanado de la célula sobre la vaina; a cada lado, un nodo de Ranvier (axón desnudo). |
| `celula-satelite.png` | CÉLULAS SATÉLITE: un soma neuronal grande y redondo (lila) rodeado por un anillo de 6–8 células pequeñas y aplanadas, como una cápsula. |

Opcional, para el circuito reflejo: `img/tipos/interneurona.png` (neurona MULTIPOLAR pequeña con
pocas dendritas cortas y un axón corto que no sale del dibujo). Si la subes, avísame para usarla
en lugar del ícono multipolar.

## 6. (Obsoleta) Rompecabezas del arco reflejo

Reemplazada por la §7 (circuito por capas, sesión 06). La imagen `img/reflejo/arco.png` ya no se usa.

## 7. Circuito reflejo por capas (rediseño, sesión 06) → `img/reflejo/`

> **Resultado (2026-10-18):** se usó un prompt único de 7 imágenes (ver reporte de la sesión 06, §4b).
> Sirvieron `esquema-base.png` y las 4 lupas; los circuitos se descartaron y las neuronas se dibujan en SVG.
> Lo que sigue quedó como referencia.

Reemplaza a §6. Cada imagen se corta en capas: la médula, cada pieza periférica y **cada neurona por su
color** (por eso los colores puros y distintos). Adjunta siempre `img/_fuentes/reflejo-arco.png` como
referencia de **composición** (misma ubicación de médula, raíces, ganglio, nervio, piel y músculo) y
`img/tipos/multipolar.png` como referencia de estilo.

Bloque común (va al inicio de cada prompt):

```
Adjunto dos imágenes: la primera es la referencia de COMPOSICIÓN (mantén exactamente la misma ubicación,
tamaño y forma de la médula, las raíces, el ganglio, el nervio, la piel y el músculo); la segunda es la
referencia de ESTILO: ilustración médico-educativa semi-realista y limpia, trazo grueso, fondo blanco puro.
Formato horizontal 1536 × 1024 px. SIN texto, SIN letras, SIN números, SIN flechas.
Las neuronas van dibujadas ENCIMA del esquema, cada una en UN color plano y puro (sin degradados que se
mezclen con el fondo), con morfología realista: soma, núcleo, dendritas y axón bien diferenciados.
Donde una neurona contacta a otra o al músculo, dibuja un botón terminal (pequeño engrosamiento redondo)
tocando claramente a la célula que recibe.
```

| Archivo | Qué agregar al bloque común |
|---|---|
| `rotuliano.png` | Músculo de abajo = cuádriceps, con un **huso muscular** visible (cápsula fusiforme dentro del músculo) y una **placa motora** sobre una fibra. NEURONA SENSITIVA en AZUL (#2563EB): pseudounipolar, soma redondo DENTRO del ganglio y prolongación en T; su rama periférica va por el nervio y se enrolla en espiral alrededor del huso; su rama central entra por la raíz dorsal, cruza la sustancia gris y termina con botones sobre el soma de la motoneurona. MOTONEURONA en ROJO (#DC2626): soma multipolar grande en el asta ventral, con dendritas; su axón (más grueso) sale por la raíz ventral, sigue por el nervio y termina en la placa motora. Sin interneurona. La piel se dibuja sin neuronas. |
| `retirada.png` | Músculo de abajo = músculo flexor (isquiotibiales), con una **placa motora**. En la piel, una terminación nerviosa libre (nociceptor). NEURONA SENSITIVA en CELESTE (#0891B2): pseudounipolar, soma en el ganglio; rama periférica hasta la terminación libre de la piel; rama central entra por la raíz dorsal y termina con botones sobre una INTERNEURONA en VERDE (#16A34A): pequeña, multipolar, en la sustancia gris entre el asta dorsal y la ventral; su axón corto termina con botones sobre la MOTONEURONA en ROJO (#DC2626) del asta ventral, cuyo axón sale por la raíz ventral hasta la placa motora del flexor. |
| `sinapsis-central.png` (cuadrada 1024 × 1024, sin la referencia de composición) | Vista ampliada dentro de un CÍRCULO (como lupa): un botón terminal AZUL de la neurona sensitiva sobre el soma ROJO de la motoneurona. Dentro del botón, vesículas sinápticas redondas; entre ambas células, la hendidura sináptica; en la membrana de la motoneurona, receptores; algunas vesículas liberando su contenido (puntos) en la hendidura. |
| `placa-motora.png` (cuadrada 1024 × 1024, sin la referencia de composición) | Vista ampliada dentro de un CÍRCULO: el terminal ROJO del axón de la motoneurona, ramificado en botones, sobre una fibra muscular estriada (rojo-rosado con estrías transversales), con los pliegues de la membrana muscular bajo cada botón y vesículas dentro de los botones. |

Guárdalas en `img/reflejo/` con esos nombres.


## 8. Práctico 2 (solo glía) · sesión 08 → `img/glia-snc-tejido.jpg` y `img/glia-accion/`

Adjuntar `img/glia-snc.jpg` (esquema de Kaira) como referencia de estilo. 1536 × 1024, sin texto.
Originales en `img/_fuentes/` (`glia-snc-tejido-original.jpg`, `glia-accion/*.png`).

**Lecciones:** ChatGPT inventa elementos (vesículas sueltas), corta axones o los hace nacer de vasos y fusiona prolongaciones.
Por eso todos los prompts llevan el bloque de reglas biológicas. Después de la primera imagen, corregir **solo con selección de zona**,
nunca «rehazla» (cada regeneración rompe otra cosa y obliga a recalibrar etiquetas).
`glia-snc-tejido.jpg`: el capilar terminaba en punta y un tallo rosado tocaba la mielina; se retocó a mano (sale del plano).

```
REGLAS BIOLÓGICAS (obligatorias):
- Cada axón nace de un soma (cono axónico) o entra y sale por el borde de la imagen; ninguno empieza ni termina en medio.
- Cada prolongación pertenece visiblemente a su célula; las de glía nunca se fusionan con axones ni con vasos.
- Los vasos entran y salen por los bordes o se difuminan hacia el fondo; nunca terminan en punta.
- Neuronas completamente violeta (soma, dendritas, cono y axón).
- No agregues nada que no pida: ni vesículas, ni puntos, ni partículas sueltas.
```

| Archivo | Uso | Contenido pedido |
|---|---|---|
| `glia-snc-tejido.jpg` | Conoce la glía · nivel II | Sustancia gris (2 neuronas, astrocito protoplasmático, microglía, capilar con pies) → transición gradual → sustancia blanca (axones mielinizados, oligodendrocito con cada prolongación a un axón distinto, astrocito fibroso en un nodo) y ventrículo con epéndimo continuo abajo |
| `glia-accion/neurovascular.jpg` | La glía en acción · I | Capilar transversal (endotelio con uniones, glóbulo rojo, lámina basal, pericito, pies astrocitarios) — soma de UN astrocito — sinapsis ampliada envuelta por el mismo astrocito |
| `glia-accion/mielina.jpg` | La glía en acción · II | Arriba SNC (oligodendrocito con 2 internodos en un axón y 1 en otro; astrocito fibroso tocando el nodo); abajo SNP (2 Schwann con lámina basal); recuadro del nodo (asas paranodales, canales) |
| `glia-accion/lesion-snp.jpg` | La glía en acción · III (piezas) | 4 viñetas: sano → corte y degeneración walleriana → macrófagos y tubo de Schwann → regeneración con internodos más cortos |
| `glia-accion/lesion-snc.jpg` | La glía en acción · III (piezas) | 4 viñetas: sano → corte sin limpieza → microglía activada y astrocitos hipertróficos → cicatriz glial y bulbo de retracción |

El tablero `lesion-tablero.jpg` y las piezas `piezas/*.webp` se generan recortando las dos tiras (no son de ChatGPT).
Se probó también Gemini (Nano Banana) con un prompt único para las 5 imágenes: pendiente de comparar.
