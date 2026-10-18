# Práctico II · Células nerviosas II: circuitos y glía

Ruta `celulas-2`. Cada nivel se corrige solo y suma una sección a la guía. Breve: la anatomía de la médula ya la vieron; aquí va lo biológico-funcional.

## Láminas (histologyguide)

| Código | Tejido · tinción | Link |
|---|---|---|
| MH-047 | Médula de roedor + ganglio de la raíz dorsal · H&E | https://histologyguide.com/slideview/MH-047-spinal-cord/06-slide-2.html |
| MHS-240 | Médula de conejo · H&E | https://histologyguide.com/slideview/MHS-240-spinal-cord/06-slide-1.html |
| UCSF-163 | Médula de gato · cresil violeta | https://histologyguide.com/slideview/UCSF-163-spinal-cord/06-slide-1.html |
| MH-051 | Ganglio de la raíz dorsal · Azan | https://histologyguide.com/slideview/MH-051-dorsal-root-ganglion/06-slide-1.html |
| MHS-285/286 | Ganglio espinal · toluidina / Weigert | https://histologyguide.com/slideview/MHS-285-286-spinal-ganglion/06-slide-1.html |
| MH-052 | Nervio periférico · H&E | https://histologyguide.com/slideview/MH-052-peripheral-nerve/06-slide-1.html |

## Ruta

| # | Actividad | Nivel | Qué hacen | Lámina |
|---|---|---|---|---|
| 1 | Circuito reflejo (un solo esquema, por capas) | I · La médula | Ubican 7 partes sobre la médula sola | Esquema |
| | | II · Los extremos | Completan los huecos: piel, extensor con huso, nervio, ganglio, raíz dorsal → raíz ventral, flexor | Esquema |
| | | III · Reflejo rotuliano | Ubican 4 neuronas (aparecen dibujadas), conectan la vía directa y la de inhibición recíproca, 4 lupas (huso, excitatoria, inhibitoria, placa motora) | Esquema |
| | | IV · Reflejo de retirada | Ubican la sensitiva y 2 interneuronas, conectan 2 vías, 2 lupas | Esquema |
| | | V · ¿Dónde se cortó? | Emparejan 3 casos (hernia L4, atrofia muscular espinal, nervio femoral) con 3 sitios | Esquema |
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
| Más casos del arco | — | Banco de casos TO y Fono para variar el nivel V (mismo formato: caso → sitio → por qué) |
| Mielina en el ganglio | MHS-286 | Weigert: mielinizadas vs no mielinizadas y velocidad de conducción |
| Una tinción, dos miradas | MH-051 vs MHS-285 | Misma estructura con Azan y toluidina: qué tiñe cada una |

## Tareas para ayudantes

Cada tarea se trabaja **directo en los archivos del sitio**, en tu propia rama. Fernanda revisa, mergea y sube al servidor. Lo técnico nuevo (arrastrar neuronas sobre la captura y corregir por zonas) lo hace Fernanda.

Las tareas A–H de la sesión 05 ya están en el sitio. Quedan estas:

| Tarea | Qué queda en el sitio | Rama |
|---|---|---|
| I. Casos del arco | 4–6 casos más (mitad TO, mitad Fono) para el nivel V del circuito, con sitio (nervio, raíz dorsal o asta ventral), pista y «para recordar». En `data/seed.sql`, actividad 9, nivel 5 (`cortes.casos`) | `feat/p2-casos-arco` |
| J. Revisar las lupas | Leer las preguntas de las 6 lupas (niveles III y IV) mirando cada imagen de `img/reflejo/`; proponer cambios si algo no se ve en la imagen | `feat/p2-lupas` |
| K. Revisar láminas de glía | Recorrer Glía del SNC III–IV y Glía del SNP II–IV en histologyguide: que los links abran en el campo correcto y las preguntas se respondan con lo que se ve | `feat/p2-revision-glia` |
| L. Mielina en el ganglio | Actividad adicional con MHS-286 (Weigert): mielinizadas frente a no mielinizadas y velocidad de conducción | `feat/p2-mielina-ganglio` |

**¿Quién tiene qué tarea?** La que tenga un Pull Request abierto en GitHub (pestaña *Pull requests*). Antes de elegir, revisa ahí que nadie la haya tomado. Una tarea a la vez.

## Cómo trabajar una tarea

| Paso | Dónde | Qué haces |
|---|---|---|
| 1. Actualizar | GitHub Desktop | Rama `main` → **Fetch origin** → **Pull origin** |
| 2. Crear la rama | GitHub Desktop | **Current branch → New branch** → nombre de la tabla (ej. `feat/p2-quiz`), basada en `main` → **Publish branch** |
| 3. Tomar la tarea | GitHub Desktop + GitHub | Haz un primer commit pequeño (ej. el borrador de tu primera pregunta), **Push origin** → **Create Pull Request** → en GitHub elige **Create draft pull request**. Así queda tomada |
| 4. Trabajar | Claude Desktop | Abre la carpeta del repo y pega el prompt de abajo. Claude busca y edita los archivos; tú revisas y decides |
| 5. Probar | Navegador | Pídele a Claude que levante el sitio en local y revisa tu actividad en http://localhost:8000 |
| 6. Guardar avance | GitHub Desktop | Revisa en **Changes** qué archivos cambió Claude → escribe el mensaje → **Commit to feat/…** → **Push origin**. Commits chicos, cada vez que algo funcione |
| 7. Entregar | GitHub | En tu PR: **Ready for review** y avísale a Fernanda |

- **Ramas, commits y push: siempre en GitHub Desktop.** Es más fácil ver qué se cambió. No se lo pidas a Claude ni lo hagas en la página de GitHub.
- **Mensaje de commit:** en imperativo, describe lo que se ve en el sitio (ej. `Agrega preguntas del nivel II de glía SNC`).
- Si GitHub Desktop muestra conflicto o *diverged*: no fuerces nada; toma una captura y avísale a Fernanda.

## Prompt para Claude Desktop

Cópialo, reemplaza lo que está entre `< >` y pégalo al iniciar un chat nuevo con la carpeta del repo abierta.

```
Vamos a trabajar en NeuroLab, en la rama <feat/p2-...> (ya creada; yo hago los commits en GitHub Desktop).

Antes de cambiar nada, lee:
- README.md (qué es el proyecto y dónde está cada cosa)
- docs/practico-2_tareas.md (ruta del práctico II y mi tarea)
- docs/sesiones/sesion-02_*.md y sesion-04_*.md (cómo se arman las actividades en la mesa de trabajo y las decisiones de estilo)

Mi tarea es la <letra y nombre>: <descripción de la tabla>.

Quiero replicar exactamente la forma de trabajo del práctico I: mismas mecánicas de mesa de
trabajo, mismo tono y largo de los textos, textos para TO y Fono cuando corresponda, y que lo
que hagan los estudiantes quede en su guía. No repitas preguntas o contenidos del práctico I.

Trabajemos así:
1. Dime qué archivos vas a tocar y por qué, y propónme el contenido en una tabla. No edites todavía.
2. Cuando lo apruebe, edita los archivos directamente.
3. Levanta el sitio en local y dime exactamente dónde mirar para probarlo.
4. Al terminar cada parte, dame un mensaje de commit corto en imperativo.

No toques data/docente.php ni data/neurolab.db, no cambies el funcionamiento de las
actividades existentes y no hagas commits ni push.
```

**Si la tarea tiene imágenes (B y E)**, agrega al prompt:

```
Para las imágenes, dame el prompt para ChatGPT siguiendo el estilo de docs/prompts-imagenes.md
(qué imagen de referencia adjuntar, formato, colores, sin texto ni números). Cuando te pase la
imagen generada, optimízala (< 300 KB), guárdala con el nombre correcto, agrega su prompt a
docs/prompts-imagenes.md y ubica los números sobre ella como en las actividades del práctico I.
```

## Criterios

- Nada que ya se pregunte en el práctico I.
- Frases cortas, lenguaje de estudiante de 2.º año.
- Cada pregunta debe obligar a **mirar** la lámina o **razonar**, no solo recordar una definición.
- Si usas un libro o paper, cítalo en la descripción del Pull Request.
