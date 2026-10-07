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
