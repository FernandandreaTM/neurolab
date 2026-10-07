# Práctico II · Células nerviosas II: circuitos y glía

Ruta `celulas-2`. Cada nivel se corrige solo y suma una sección a la guía. Breve: la anatomía de la médula ya la vieron; aquí va lo biológico-funcional.

## Láminas (histologyguide)

| Código | Tejido · tinción | Link |
|---|---|---|
| MH-047 | Médula de ratón + ganglio de la raíz dorsal · H&E | https://histologyguide.com/slideview/MH-047-spinal-cord/06-slide-2.html |
| MHS-240 | Médula de conejo · H&E | https://histologyguide.com/slideview/MHS-240-spinal-cord/06-slide-1.html |
| UCSF-163 | Médula de gato · cresil violeta | https://histologyguide.com/slideview/UCSF-163-spinal-cord/06-slide-1.html |
| MH-051 | Ganglio de la raíz dorsal · Azan | https://histologyguide.com/slideview/MH-051-dorsal-root-ganglion/06-slide-1.html |
| MHS-285/286 | Ganglio espinal · toluidina / Weigert | https://histologyguide.com/slideview/MHS-285-286-spinal-ganglion/06-slide-1.html |
| MH-052 | Nervio periférico · H&E | https://histologyguide.com/slideview/MH-052-peripheral-nerve/06-slide-1.html |

## Ruta

| # | Actividad | Nivel | Qué hacen | Lámina |
|---|---|---|---|---|
| 1 | Circuito reflejo | I · Orientación | Capturan el campo y ubican: ganglio, asta dorsal, asta ventral, sustancia blanca, canal central | MH-047 |
| | | II · Armar el circuito | Sobre su captura arrastran pseudounipolar → ganglio, interneurona → asta dorsal, motoneurona → asta ventral; conectan y marcan el sentido | MH-047 |
| 2 | Glía del SNC | I · Esquema | Identifican astrocito, oligodendrocito, microglía, ependimaria y eligen su función | Esquema |
| | | II · En el corte | Canal central (ependimarias) y sustancia blanca (núcleos de oligodendrocitos). ¿Por qué con H&E solo se ven núcleos? | MHS-240 |
| | | III · Motoneurona y su glía | Motoneurona del asta ventral, núcleos de glía alrededor, axón vs dendrita por el Nissl | UCSF-163 |
| 3 | Glía del SNP | I · Esquema y tarjetas | Schwann mielinizante, Schwann no mielinizante, satélite vs oligodendrocito → cuadro SNC/SNP | Esquema |
| | | II · Ganglio | Neurona del ganglio + células satélite; es la pseudounipolar del circuito | MH-051 |
| | | III · Nervio | Epi-, peri- y endoneuro, Schwann, mielina; nodo de Ranvier en el longitudinal | MH-052 |
| 4 | Quiz de cierre | — | Alternativas con íconos de neuronas y glía, sin repetir el práctico I | — |

## Actividades adicionales del atlas (fuera de la ruta)

| Actividad | Lámina | Idea |
|---|---|---|
| ¿Dónde se cortó el arco? | MH-047 | Casos TO y Fono: tocan el tramo lesionado del circuito |
| Mielina en el ganglio | MHS-286 | Weigert: mielinizadas vs no mielinizadas y velocidad de conducción |
| Una tinción, dos miradas | MH-051 vs MHS-285 | Misma estructura con Azan y toluidina: qué tiñe cada una |

## Tareas para ayudantes

Elige una tarea, escribe tu nombre en **Tomada por** en tu primer commit y trabaja en la rama indicada. Una tarea a la vez. Lo técnico nuevo (arrastrar neuronas sobre la captura y corregir por zonas) lo hace Fernanda.

| Tarea | Qué entregar | Rama | Programar | Tomada por |
|---|---|---|---|---|
| A. Dónde buscar | Por cada nivel con lámina: link de histologyguide con `x`, `y`, `z` del campo exacto + pista corta (1 línea) | `feat/p2-donde-buscar` | No | |
| B. Esquemas de glía | Esquema SNC y esquema SNP (imagen < 300 KB con números) + por célula: nombre, función, «para recordar» | `feat/p2-esquemas-glia` | Poco | |
| C. Preguntas de láminas | 2–3 preguntas por nivel (comparar e interpretar), 4 alternativas de largo parejo, explicación de la correcta | `feat/p2-preguntas-laminas` | No | |
| D. Tarjetas SNC/SNP | 8–10 frases que llevan a una célula + filas del cuadro comparativo | `feat/p2-tarjetas-glia` | Poco | |
| E. Íconos de glía | PNG transparente por célula, mismo estilo que `img/tipos/` | `feat/p2-iconos-glia` | No | |
| F. ¿Para qué te sirve? | 1 texto por nivel en versión TO y Fono (2–3 líneas, situación clínica concreta) | `feat/p2-para-que-sirve` | No | |
| G. Quiz de cierre | 15–18 preguntas: conceptos → casos comunes → casos de la carrera; sin repetir el práctico I | `feat/p2-quiz` | Poco | |
| H. ¿Dónde se cortó el arco? | 6–8 casos (mitad TO, mitad Fono): síntoma → tramo lesionado → explicación | `feat/p2-casos-arco` | No | |

### Formato de entrega

- Textos: un `.md` en `docs/p2/<tarea>.md` (ej. `docs/p2/C-preguntas-laminas.md`) con tablas. Fernanda los pasa a `seed.sql`.
- Imágenes: `img/p2/`, optimizadas, nombre en minúsculas con guiones.
- Fuentes: si usas un libro o paper, cítalo al final del `.md`.
- Al terminar: Pull Request a `main`, asignado a FernandandreaTM.

### Criterios

- Nada que ya se pregunte en el práctico I (revisa `data/seed.sql` y la guía del práctico I).
- Frases cortas, lenguaje de estudiante de 2.º año.
- Cada pregunta debe obligar a **mirar** la lámina o **razonar**, no solo recordar una definición.
