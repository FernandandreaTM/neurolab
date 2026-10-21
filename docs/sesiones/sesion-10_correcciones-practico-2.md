# Sesión 10 · Correcciones del práctico 2 (glía) en producción · 21-10-2026

## Qué se hizo

| Actividad · nivel | Cambio | Archivos |
|---|---|---|
| La glía en acción I | Los 2 recorridos (glucosa, glutamato) se reemplazan por **¿Quién lo hace?**: 7 funciones, cada una se resuelve tocando la etiqueta de la estructura que la cumple (unión estrecha, endotelio/GLUT1, pericito, pie, astrocito/lactato, terminal, prolongación perisináptica). Muestra la última resuelta y en la guía queda la tabla Función · Quién lo hace | `seed.sql` (act. 13), `js/circuito.js` (`funciones`, `paso_vias`), `_partials/mesa.php`, `css/mesa.css` |
| La glía en acción II | Cartas en fila baja (data-n 3) y caja compacta; ícono opcional desde `img/cartas/` | `css/mesa.css`, `js/mesa-practica.js`, `_partials/iconos_neurona.php` |
| La glía en acción III | Sin la etiqueta «Asas paranodales» (8 etiquetas) | `seed.sql` |
| La glía en acción IV | El rompecabezas pasa a **práctica «elegir»** (nivel id 9): 10 hechos → solo SNP / solo SNC / en ambos, cuadro por etapa (tras el corte · días a semanas · resultado). Imagen nueva `lesion-comparacion.jpg` (las dos secuencias numeradas) en miniatura con visor. Aguayo y aplastamiento vs corte quedan como hechos | `seed.sql`, `img/glia-accion/lesion-comparacion.jpg` |
| La glía en acción V | Tarjetas 4 + 4 (celular: 2 columnas horizontales), nombres cortos (M1 (inflamatoria), A1 (tóxico)…), imágenes reales en **miniatura** que abren un visor con la imagen explicada (`mini`, `ctx` en `datos`) | `seed.sql`, `js/mesa-practica.js`, `css/mesa.css` |
| Moléculas | Paréntesis aclaratorio para 2.º año: TNF-α/IL-1β, IL-4/IL-10, BDNF, C3, C1q, GFAP, CSPG, NG2, GLUT1, Nogo/MAG, P0/PLP/MBP, ATP | `seed.sql` |
| La glía en el tejido I | Fuera los oligodendrocitos «en hilera» (en un corte transversal no se ven: las fibras vienen hacia ti). Nueva pregunta: punto = axón, anillo claro = mielina disuelta; etiquetas «Fibra cortada de través» y «Núcleo de glía». Ajustada la pregunta del nivel II que comparaba con las hileras | `seed.sql` (act. 11), `docs/practico-2_preguntas-laminas.md` |
| Glía con anticuerpos | Sale de la ruta: el nivel IV de «La glía en el tejido» pasa a la actividad propia `glia-anticuerpos` (id 14, nivel id 5), estado «en desarrollo», visible en el pool. La glía en el tejido queda con 3 niveles | `seed.sql`, `data/practicos.php` |
| Quiz de cierre | Fuera la pregunta c03 (marcador GFAP): 11 comunes + 4 de la carrera = 15 | `seed.sql`, `data/practicos.php` |
| Cajas de tarjetas | Toda caja blanca con tarjetas usa la proporción de «¿Quién es quién?» (682 × 506; celular 342 × 392) como alto mínimo; las tarjetas llenan el espacio y la caja crece solo si el contenido no cabe | `css/mesa.css` |
| Guía: SNC y SNP en su tejido | Sustancia gris/blanca y ganglio/nervio quedan en la guía como **zona coloreada** con su nombre al centro (no con punto). Quien ya completó esos niveles debe rehacerlos para regenerar la imagen | `js/circuito.js` |
| Prompts | §11 de `prompts-imagenes.md`: un prompt por set (barrera: 3 cuadros; estados: 4 × 2). Referencia de estilo `img/_fuentes/referencia-set-glia.png` | `docs/prompts-imagenes.md` |

## Rediseño de «La glía en acción» I y III (motor nuevo `js/escenas.js`)

| Nivel | Antes | Ahora |
|---|---|---|
| I · La unidad neurovascular en acción | Etiquetar + «¿Quién lo hace?» | 4 escenas sobre el mismo esquema: reposo, «mañana hay prueba» (acoplamiento neurovascular), ACV (excitotoxicidad) y meningitis (edema). **Predice** con una sola oportunidad → **mira** la animación (partículas por rutas, efectos y rótulos que aparecen en orden; leyenda de partículas) → explicación. «Nombres» muestra las estructuras |
| III · Cuando se ataca la mielina | Etiquetar mielina + 4 preguntas | 4 pacientes sobre un **mapa del cuerpo** (SVG propio, SNC lila / SNP amarillo): **dónde** (tocar; pista si se equivoca y dice qué tocó) → **célula** (tarjetas con íconos de glía) → **por qué**. Al resolver, la lesión se marca en el cuerpo, la célula real se abre en el visor y el caso suma una fila al cuadro (Dónde · Célula · Causa · Evolución). Cierre: comparar los cuatro (¿quién se recupera mejor?) |

Casos del nivel III: esclerosis múltiple (nervio óptico = SNC, MBP/PLP/MOG), Guillain-Barré (mimetismo molecular), neuromielitis óptica (acuaporina-4 del astrocito: daño de mielina secundario; conecta con el nivel I) y Charcot-Marie-Tooth 1A (genético, PMP22: contraste no autoinmune). No toca la conducción saltatoria (queda para potencial de acción).

| Motor `escenas` | Uso |
|---|---|
| `modo: "poe"` | Pasos `predice` (una oportunidad); al responder se ve `anim` |
| `modo: "casos"` | Pasos `tocar` (claves de `zonas`: e / r / l), `tarjeta` (íconos por nombre), `elegir` (con pista); `fila` + `cuadro`; `vista: "cuadro"` para el cierre |
| `anim` | `flujos` (partículas glu, lac, glut, gln, prot, agua, ca por una ruta SVG; `fin` para que se acumulen), `efectos` (zonas que aparecen, `pulso` o `crece`), `rotulos` (con retraso `s`) |
| Guía | Imagen (esquema rotulado o mapa con lesiones) + tabla de escenas o cuadro + explicaciones |
| Docente | «⚡ Autocompletar» incluido |

Ya no se usan: `img/glia-accion/mielina.jpg` y las «funciones» de `circuito.js` (quedan en el motor por si sirven en otra actividad).

## Motor (para reutilizar)

| Pieza | Uso |
|---|---|
| `circuito` + `"funciones": true` | Cada vía de una sola etiqueta = «lee la función y toca quién la cumple». `paso_vias` renombra el paso «Conectar» |
| `mesa-practica` · `datos.mini` + `datos.ctx` | Imagen chica junto a la frase; al tocarla, visor con la imagen y su explicación |
| `mesa-practica` · caja compacta | Ahora siempre; estilos por número de tarjetas `data-n` 3, 6 y 8 |
| `img/cartas/<nombre>.png` | Ícono de tarjeta por nombre (además de `img/tipos/` e `img/glia/`) |

## Commits de la sesión

| Commit | Qué |
|---|---|
| `6a520d5` | Glía en acción: funciones, lesión en cuadro, visor de imágenes, moléculas con paréntesis, sin hileras en la lámina |
| `290c5a4` | Anticuerpos al pool, quiz sin GFAP, cajas de tarjetas parejas, máscaras en la guía |
| `57ca5cf` | Tarjetas dibujadas de la barrera |
| `bb093af` | Glía en acción I y III: escenas animadas y casos de mielina dañada (motor `js/escenas.js`) |

## Estado al cierre

| Qué | Estado |
|---|---|
| Producción | Subir lo de `git diff --name-status 47c09dc HEAD` sin `docs/` (16 archivos) y correr `admin/seed.php` |
| Push | Pendiente (Fer, GitHub Desktop) |
| Tarjetas de «Glía que cambia» (nivel V) | Pendiente. La primera versión (`img/_fuentes/Pastel Neuroscience Glia Icon Grid.png`) se revisó: sirven 1, 2, 4 y 5; había que corregir 3 (M2 igual a la vigilante), 6 (bulbo de retracción dibujado como terminal sináptico), 7 (soma de la glía radial lejos del ventrículo) y 8 (el precursor NG2 ya formaba mielina). Fer está generando la versión corregida con un prompt único. Al recibirla: revisar, cortar en 8 PNG de 320 px en `img/cartas/` con los nombres de §11 de `prompts-imagenes.md` |
| Glía con anticuerpos (`glia-anticuerpos`) | Fuera de la ruta, en el pool como «en desarrollo»; Fer la arregla después (íconos chicos en las tarjetas) |
| Guías ya guardadas | Quien hizo antes Conoce la glía I–II o La glía en acción I y III debe rehacer esos niveles para tener la versión nueva en su guía |
| Sin uso (quedan en el repo) | `img/glia-accion/mielina.jpg`, `lesion-tablero.jpg`, `piezas/`; «funciones» de `circuito.js` |

## Prompt para la sesión siguiente

```
Retomo NeuroLab (C:\repo\neurolab). Lee docs/sesiones/sesion-10_correcciones-practico-2.md y docs/practico-2_tareas.md.
Seguimos con detalles del práctico 2 (glía), que te iré reportando de a uno. Primero: en img/_fuentes te dejo la
imagen corregida de las 8 tarjetas de «Glía que cambia»; revísala (validez científica de cada cuadro) y, si sirve,
córtala en img/cartas/ con los nombres de §11 de docs/prompts-imagenes.md.
Para cada corrección: dime qué archivo tocas, edítalo, pruébalo (PHP 8.3 + Playwright, 1366×660 y celular)
y dime qué subir. Edita data/seed.sql directamente (bloque de la actividad afectada).
Trabaja sobre main; al final un commit con mi autoría y la lista de archivos para FileZilla.
Al cerrar, escribe docs/sesiones/sesion-11_*.md.
```
