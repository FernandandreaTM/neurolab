# Práctico II · Células nerviosas II: la glía

Ruta `celulas-2` (desde la sesión 08 el práctico 2 es **solo glía**; el circuito reflejo pasa al práctico 4, «Sinapsis, neurotransmisores y circuitos»). Cada nivel se corrige solo y suma una sección a la guía.

| Práctico | Fecha | Contenido |
|---|---|---|
| 1 | 07-10 | Células I: la neurona |
| 2 | 21-10 | Células II: la glía |
| 3 | 28-10 | Potencial de acción y canales iónicos |
| 4 | 04-11 | Sinapsis, neurotransmisores y circuitos (aquí va el circuito reflejo) |

## Láminas (histologyguide)

| Código | Tejido · tinción | Link |
|---|---|---|
| MHS-240 | Médula de conejo · H&E | https://histologyguide.com/slideview/MHS-240-spinal-cord/06-slide-1.html |
| UCSF-163 | Médula de gato · cresil violeta | https://histologyguide.com/slideview/UCSF-163-spinal-cord/06-slide-1.html |
| MH-051 | Ganglio de la raíz dorsal · Azan | https://histologyguide.com/slideview/MH-051-dorsal-root-ganglion/06-slide-1.html |
| MHS-285/286 | Ganglio espinal · toluidina / Weigert | https://histologyguide.com/slideview/MHS-285-286-spinal-ganglion/06-slide-1.html |
| MH-052 | Nervio periférico · H&E | https://histologyguide.com/slideview/MH-052-peripheral-nerve/06-slide-1.html |

## Ruta (rediseño 20-10-2026)

Criterio: **actividades 1 y 2 = estructura** (qué es, cómo es, dónde está), **actividad 3 = función** (qué hace, cómo responde, qué pasa si falla). El quiz repasa todo.

| # | Actividad (slug) | Nivel | Qué hacen | Mecánica | Imagen |
|---|---|---|---|---|---|
| 1 | Conoce la glía (`glia-conoce`) | I · Glía del SNC en su tejido | Ubican sustancia gris/blanca y etiquetan 7 estructuras; 4 preguntas de forma y lugar | Etiquetar (nombre → clic) | `glia-snc-tejido.jpg` |
| | | II · Glía del SNP en su tejido | Ganglio/nervio y 8 estructuras (soma, satélite, axón, Schwann mielinizante y no mielinizante, nodo, capilar, conectivo); 3 preguntas | Etiquetar | `glia-snp-tejido.jpg` (nuevo, de Fer) |
| | | III · ¿Quién es quién? | 12 descripciones de forma y lugar → tarjeta → cuadro Forma / Dónde está | Tarjetas con ícono (barajadas) | Íconos `img/glia/` |
| 2 | La glía en el tejido (`glia-tejido`) | I · Canal central y sustancia blanca | Epéndimo y oligodendrocitos en hileras | Capturas MHS-240 | histologyguide |
| | | II · Motoneurona y su glía | Glía perineuronal, comparación con la sustancia blanca, neuropilo | Capturas UCSF-163 | histologyguide |
| | | III · Ganglio y nervio | Satélites frente a glía del SNC; somas redondos; Schwann/fibroblasto; envolturas | Capturas MH-051 y MH-052 | histologyguide |
| | | IV · Glía con anticuerpos | 7 imágenes: reconocer por **forma y lugar** (el marcador va en el pie) | Tarjetas | `img/glia-if/` |
| 3 | La glía en acción (`glia-accion`) | I · El astrocito entre el vaso y la sinapsis | 10 etiquetas + **2 recorridos animados** (glucosa → lactato; ciclo del glutamato) + 4 preguntas (BHE, sincicio, lactato, excitotoxicidad) | Etiquetar + conectar en orden | `glia-accion/neurovascular.jpg` |
| | | II · ¿Qué cruza la barrera? | 11 sustancias → pasa libre / con transportador / no pasa (incluye L-dopa, dopamina, órganos circunventriculares) | Tarjetas → cuadro | — |
| | | III · Mielina y conducción | 9 etiquetas (incluye neurilema) + 4 preguntas (saltatoria, P0/PLP/MBP, neurilema, fibras Aα–C) | Etiquetar | `glia-accion/mielina.jpg` |
| | | IV · Tras la lesión | 8 piezas **mezcladas y sin nombre**: decidir SNP o SNC y etapa; 4 preguntas (por qué regenera, aplastamiento vs corte, Aguayo, cicatriz) | Rompecabezas | `glia-accion/lesion-tablero.jpg` |
| | | V · Glía que cambia | 9 casos → estado (M0, M1, M2, A1, A2, cicatriz, glía radial, NG2) | Tarjetas | 3 imágenes de `img/glia-if/` |
| 4 | Quiz de cierre | — | 12 comunes + 4 de la carrera = 16 | Quiz | — |

Respaldo de la versión anterior (18/19-10): carpeta `_respaldo_p2_2026-10-20/` en la raíz del repo (fuera de git) y commit base en `COMMIT_BASE.txt`.

## Actividades adicionales del atlas (fuera de la ruta)

| Actividad | Lámina | Idea |
|---|---|---|
| Circuito reflejo (5 niveles) | Esquema | Queda en el atlas; vuelve como integración del práctico 4 |
| Mielina en el ganglio | MHS-286 | Weigert: mielinizadas vs no mielinizadas y velocidad de conducción |
| Una tinción, dos miradas | MH-051 vs MHS-285 | Misma estructura con Azan y toluidina: qué tiñe cada una |

## Tareas para ayudantes

Cada tarea se trabaja **directo en los archivos del sitio**, en tu propia rama. Fernanda revisa, mergea y sube al servidor.

| Tarea | Qué queda en el sitio | Rama |
|---|---|---|
| K. Revisar láminas de glía | Recorrer La glía en el tejido I–III en histologyguide: que los links abran en el campo correcto y las preguntas se respondan con lo que se ve | `feat/p2-revision-glia` |
| L. Mielina en el ganglio | Actividad adicional con MHS-286 (Weigert): mielinizadas frente a no mielinizadas y velocidad de conducción | `feat/p2-mielina-ganglio` |
| M. Probar el práctico 2 en celular | Recorrer las 3 actividades en el teléfono (sobre todo el rompecabezas de la lesión y los anticuerpos) y anotar en el PR qué se ve mal o cuesta tocar | `fix/p2-celular` |
| N. Revisar «La glía en acción» | Recorrer los 5 niveles con la clase de Células II y Neuroplasticidad III: etiquetas, recorridos, sustancias de la barrera y los 9 casos del nivel V; proponer cambios si algo no calza con la imagen o con la clase | `feat/p2-glia-accion` |
| I y J (práctico 4) | Casos del arco y revisión de lupas: quedan para cuando el circuito vuelva en el práctico 4 | — |

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
