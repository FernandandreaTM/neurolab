# Sesión 11 · Tarjetas de «Glía que cambia» y casos de mielina con imágenes reales · 21-10-2026

## Qué se hizo

| # | Actividad · nivel | Cambio | Archivos |
|---|---|---|---|
| 1 | La glía en acción V · Glía que cambia | Revisión científica de la imagen corregida (`img/_fuentes/Biomedical Neuroscience Cell Montage.png`): sirven los 8 cuadros. Cortada en 8 PNG de 320 px con los nombres de §11b | `img/cartas/` (8 PNG), `docs/prompts-imagenes.md` |
| 2 | La glía en acción III · Cuando se ataca la mielina | El nombre de la enfermedad se ve desde el inicio (pestañas y título) y cada caso trae **«Sobre la enfermedad»** con el contexto para razonar sin saberla de memoria. El caso (ficha + imagen real) va en la **vista**, en lugar del mapa del cuerpo. El paso «tocar el cuerpo» pasa a **SNC o SNP** en el panel, como las otras preguntas. Pacientes ajustados a las imágenes | `data/seed.sql` (act. 13, nivel 3), `js/escenas.js`, `css/mesa.css`, `img/glia-accion/casos/` (4 JPG) |

## Revisión de las 8 tarjetas (nivel V)

| Tarjeta | Qué muestra | ¿Válida? |
|---|---|---|
| Microglía vigilante | Soma pequeño, ramas finas muy ramificadas | Sí |
| M1 (inflamatoria) | Ameboide, fagocita una bacteria, libera citoquinas (puntos rojos) | Sí |
| M2 (reparadora) | Ramas medias, factores (puntos menta) hacia una neurona sana | Sí (ya distinta de la vigilante) |
| A1 (tóxico) | Astrocito hinchado junto a una prolongación neuronal fragmentada | Sí |
| A2 (protector) | Astrocito que abraza el soma de una neurona sana, puntos dorados | Sí |
| Astrocito de la cicatriz | Pared de astrocitos entrelazados; axón con bulbo de retracción que no la cruza | Sí (el bulbo ya no parece terminal) |
| Glía radial | Soma junto al ventrículo, fibra hasta la superficie; neurona que trepa | Sí (soma en la zona ventricular) |
| Precursor NG2 | Célula pequeña que toca un tramo de axón sin mielina, entre dos internodos | Sí (el precursor ya no forma mielina; calza con «migran a la placa y remielinizan») |

## Nivel III rediseñado

| Pieza | Antes | Ahora |
|---|---|---|
| Vista | Mapa del cuerpo (`mapa-mielina.svg`), tocar dónde | Ficha del caso (enfermedad, paciente, «Sobre la enfermedad») + imagen real; tocarla abre el visor con explicación y licencia |
| Pasos | Dónde (tocar) → Célula → Por qué | **SNC o SNP** (2 botones con su definición) → Célula (tarjetas) → Por qué |
| Pestañas | Paciente (diagnóstico al resolver) | Nombre de la enfermedad desde el inicio (`"dx": true`) |
| Cuadro | Paciente · Dónde · Célula · Causa · Evolución | Enfermedad · SNC o SNP · Célula blanco · Causa · Evolución |
| Guía | Mapa con las lesiones | Cuadrícula con las 4 imágenes (créditos en el pie) + cuadro + explicaciones |

| Caso | Paciente | Imagen (`img/glia-accion/casos/`) | Fuente y licencia | Pregunta «por qué» (aplicar) |
|---|---|---|---|---|
| Esclerosis múltiple | Valentina, 28 | `em.jpg`: RM T2 del encéfalo, flecha en una placa | James Heilman, MD · CC BY-SA 4.0 · Wikimedia Commons (`MSMRIMark.png`) | Una placa deja sin mielina a muchos axones: el oligodendrocito mieliniza varios |
| Guillain-Barré | Jorge, 45 | `gb.jpg`: *Campylobacter jejuni* al microscopio electrónico | CDC / P. Fields y C. Fitzgerald (PHIL 5781) · Dominio público · Wikimedia Commons | Mimetismo molecular |
| Neuromielitis óptica | **Matías, 29** (antes Camila, 35) | `nmo.jpg`: RM T2 sagital, lesión larga C5–T10 (flechas) | Saied Z. y cols., *J Med Case Rep* 2021;15:391 · CC BY 4.0 (fig. 1a, recortada y sin la letra «a») | Sin astrocito, el oligodendrocito pierde apoyo: mielina perdida por arrastre |
| Charcot-Marie-Tooth 1A | **Tomás, 24** (antes 16) | `cmt.jpg`: pie cavo con dedos en garra | Benefros · CC BY-SA 3.0 · Wikimedia Commons | No es autoinmune: gen PMP22 |

Las imágenes en alta resolución quedaron en `img/_fuentes/casos-mielina/` (fuera de git).

## Motor `escenas` (modo «casos»)

| Campo | Uso |
|---|---|
| `"dx": true` (nivel) | Nombre de la enfermedad (`corto`) visible desde el inicio |
| `foto`, `foto_t`, `foto_pie` (caso) | Imagen real en la vista, su explicación y la fuente; abre el visor |
| `contexto` (caso) | Recuadro «Sobre la enfermedad» de la ficha |
| Paso `"tipo": "sistema"` | `ops: ["SNC", "SNP"]` en orden fijo, botones lila/amarillo con definición |
| Guía | Si los casos traen `foto`, la imagen es una cuadrícula de las fotos |

Sigue funcionando el modo anterior (fondo + zonas + `tocar`). El autocompletar docente sirve igual.

## Pruebas

PHP 8.3 + Playwright, 1366×660 y 390×844: recorrido completo del nivel III (un error a propósito con pista), visor de la foto, cierre, guía de `celulas-2` con la cuadrícula y el cuadro; niveles I (escenas «poe») y V (tarjetas nuevas) sin cambios de funcionamiento. Sin errores de JavaScript.

## Qué subir (FileZilla)

| Archivo | Nota |
|---|---|
| `js/escenas.js` | |
| `css/mesa.css` | |
| `data/seed.sql` | Después abrir `admin/seed.php` |
| `img/glia-accion/casos/em.jpg`, `gb.jpg`, `nmo.jpg`, `cmt.jpg` | Carpeta nueva |
| `img/cartas/microglia-vigilante.png`, `microglia-m1-inflamatoria.png`, `microglia-m2-reparadora.png`, `astrocito-a1-toxico.png`, `astrocito-a2-protector.png`, `astrocito-de-la-cicatriz.png`, `glia-radial.png`, `precursor-ng2.png` | |

Quien ya había empezado el nivel III conserva su avance; quien lo terminó con la versión anterior debe rehacerlo para tener la guía nueva.

## Estado al cierre

| Qué | Estado |
|---|---|
| Push | Pendiente (Fer, GitHub Desktop) |
| Sin uso (quedan en el repo) | `img/glia-accion/mapa-mielina.svg` (además de los de la sesión 10) |
| Glía con anticuerpos | Sigue en el pool, en desarrollo |

## Prompt para la sesión siguiente

```
Retomo NeuroLab (C:\repo\neurolab). Lee docs/sesiones/sesion-11_glia-que-cambia-y-casos-mielina.md y docs/practico-2_tareas.md.
Seguimos con detalles del práctico 2 (glía), que te iré reportando de a uno.
Para cada corrección: dime qué archivo tocas, edítalo, pruébalo (PHP 8.3 + Playwright, 1366×660 y celular)
y dime qué subir. Edita data/seed.sql directamente (bloque de la actividad afectada).
Trabaja sobre main; al final un commit con mi autoría y la lista de archivos para FileZilla.
Al cerrar, escribe docs/sesiones/sesion-12_*.md.
```
