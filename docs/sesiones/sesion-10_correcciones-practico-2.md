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
| Prompts | §11 de `prompts-imagenes.md`: un prompt por set (barrera: 3 cuadros; estados: 4 × 2). Referencia de estilo `img/_fuentes/referencia-set-glia.png` | `docs/prompts-imagenes.md` |

## Motor (para reutilizar)

| Pieza | Uso |
|---|---|
| `circuito` + `"funciones": true` | Cada vía de una sola etiqueta = «lee la función y toca quién la cumple». `paso_vias` renombra el paso «Conectar» |
| `mesa-practica` · `datos.mini` + `datos.ctx` | Imagen chica junto a la frase; al tocarla, visor con la imagen y su explicación |
| `mesa-practica` · caja compacta | Ahora siempre; estilos por número de tarjetas `data-n` 3, 6 y 8 |
| `img/cartas/<nombre>.png` | Ícono de tarjeta por nombre (además de `img/tipos/` e `img/glia/`) |

## Estado al cierre

| Qué | Estado |
|---|---|
| Producción | Subir los archivos del commit de la sesión 10 (sin docs) y correr `admin/seed.php` |
| Tarjetas dibujadas (barrera y estados) | Pendientes: Fer genera las 2 imágenes con ChatGPT (§11) y Claude las corta en `img/cartas/` |
| Piezas del rompecabezas (`img/glia-accion/piezas/`, `lesion-tablero.jpg`) | Ya no se usan; quedan en el repo |
| Push | Pendiente (Fer, GitHub Desktop) |

## Prompt para la sesión siguiente

```
Retomo NeuroLab (C:\repo\neurolab). Lee docs/sesiones/sesion-10_correcciones-practico-2.md y docs/practico-2_tareas.md.
Te paso las imágenes de las tarjetas (barrera y glía que cambia, §11 de prompts-imagenes.md): córtalas en img/cartas/
y sigamos corrigiendo detalles del práctico 2 de a uno. Pruébalo (PHP 8.3 + Playwright, 1366×660 y celular),
edita data/seed.sql directamente, trabaja sobre main y al final un commit con mi autoría y la lista para FileZilla.
Al cerrar, escribe docs/sesiones/sesion-11_*.md.
```
