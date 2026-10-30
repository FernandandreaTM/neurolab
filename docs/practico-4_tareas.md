# Práctico 4 · Sinapsis, neurotransmisores y circuitos

Ruta `sinapsis-circuitos` (04-11). Sin quiz: Fernanda hace uno formativo en papel.

| # | Actividad | Niveles | Quién |
|---|---|---|---|
| 1 | La sinapsis química (`sinapsis-quimica`, id 16) · simulador propio | 3 | Fernanda + Claude |
| 2 | El circuito reflejo (`circuito-reflejo`, id 9) · rediseño de 5 a 3 niveles | 3 | Fernanda + Claude |
| 3 | **Casos clínicos (`casos-sinapsis`, id 17)** | 1 · 5 casos | **Ayudantes** |

---

## Tarea N · Casos clínicos de sinapsis (actividad de cierre)

**Plazo:** Pull Request el **lunes 02-11** (Fernanda revisa antes del 04-11).
**Rama:** `feat/p4-casos-clinicos` (una sola rama para los dos; repártanse los casos y hagan **Pull origin** antes de trabajar cada vez).
**Qué se toca:** solo `data/seed.sql` (un bloque al **final** del archivo) e imágenes en `img/sinapsis/`. **Nada de JavaScript.**

### Qué es

Un nivel «escenas» en **modo casos**, igual a «Cuando se ataca la mielina» (actividad 13, nivel III, `glia-accion` en `data/seed.sql`): úsenlo de modelo. Cada caso muestra una ficha (paciente + contexto), y el estudiante responde 3 pasos en el panel. Al resolverlo suma una fila al cuadro comparativo, que va a la guía.

### Los 5 casos

| Caso (`clave`) | Dónde actúa | Qué integra |
|---|---|---|
| ISRS en la depresión (`isrs`) | Recaptación de serotonina (SERT) en el botón presináptico | Fin de la señal |
| ACV isquémico (`acv`) | Exceso de glutamato → entra Ca²⁺ → excitotoxicidad (penumbra) | Glía (práctico 2) y canales (práctico 3) |
| Parkinson y L-dopa (`parkinson`) | Dopamina de la sustancia negra; la L-dopa cruza la barrera, la dopamina no | Barrera hematoencefálica (práctico 2) |
| Miastenia gravis y piridostigmina (`miastenia`) | Anticuerpos contra el receptor nicotínico; el fármaco inhibe la acetilcolinesterasa | Placa motora |
| Toxina botulínica en la espasticidad (`botox`) | Bloquea la liberación de vesículas de ACh | Uso terapéutico en TO y Fono |

### Formato de cada caso

| Campo | Contenido |
|---|---|
| `titulo` | Paciente: «Nombre, edad» (el diagnóstico va en `corto` y se ve al resolver) |
| `situacion` | 2–3 oraciones: qué le pasa, qué se observa |
| `contexto` | Lo que se sabe de la enfermedad o del fármaco, sin dar la respuesta |
| `foto`, `foto_t`, `foto_pie` | Opcional: imagen con licencia abierta (Wikimedia, CC BY / CC BY-SA, dominio público) en `img/sinapsis/casos/`, < 300 KB, con autor y licencia en `foto_pie` |
| Paso 1 · `tarjeta` con `"nombre": "Sitio"` | ¿Dónde actúa? Opciones fijas: «Botón presináptico», «Hendidura sináptica», «Receptor postsináptico», «Astrocito» |
| Paso 2 · `elegir` con `"nombre": "Qué cambia"` | ¿Qué pasa con el neurotransmisor o el receptor? (más/menos NT en la hendidura, receptor bloqueado, etc.) |
| Paso 3 · `elegir` con `"nombre": "Qué se observa"` | Consecuencia en el paciente o efecto del tratamiento |
| `exp` | Explicación de 3–4 oraciones (va a la guía) |
| `fila` | Fila del cuadro: `["Caso", "Sitio", "Neurotransmisor", "Qué cambia", "Efecto"]` |

Cada paso lleva `p`, `ops` (4), `ok` (índice de la correcta) y `pista`.

Además:
- `actividades`: `(17, 10, 'casos-sinapsis', 'Casos clínicos: la sinapsis en la clínica', …)` (topic 10 = Neurotransmisores).
- `actividad_carrera`: una conexión para Fono (`carrera_id` 1) y otra para TO (2), como en la actividad 13.
- Fondo del nivel: por ahora usen `img/glia-accion/neurovascular.jpg` (tiene sinapsis, astrocito y capilar). Si quieren hacer una ilustración propia de una sinapsis, pídanle a Fernanda el prompt de ChatGPT (ella genera las imágenes).

### Reglas de las preguntas (obligatorias)

| Regla | Ejemplo / error que evita |
|---|---|
| Enunciado directo y corto | «¿Qué pasa con la serotonina en la hendidura?», no un párrafo |
| 4 alternativas del **mismo largo y estructura** | «Aumenta: no se recapta» / «Disminuye: no se libera» / … |
| La correcta **nunca** es la más larga ni la más detallada | Revisen alternativa por alternativa |
| Nada rebuscado ni trampas | Distractores plausibles, no absurdos |
| No preguntar lo que la ficha ya dice | Si el contexto dice «bloquea la recaptación», no preguntar dónde actúa |
| La explicación va en `exp` y en la `pista`, no en el enunciado | |
| Exactitud científica | Fuente: apuntes del curso y Purves / Kandel. Ante la duda, pregúntenle a Fernanda |

### Cómo probar

```bash
php admin/seed.php
php -S localhost:8000
```

Abran `http://localhost:8000/actividad.php?slug=casos-sinapsis`: resuelvan los 5 casos (con errores a propósito), revisen el cuadro y que la sección aparezca en **Mi guía**. Pruébenlo también en el celular o con la ventana angosta. Antes del PR, verifiquen que `admin/seed.php` corra sin errores.

### Prompt para Claude Desktop

```
Trabajo en NeuroLab (carpeta del repo), rama feat/p4-casos-clinicos.
Lee docs/practico-4_tareas.md (Tarea N) y, como modelo, el nivel III de la actividad 13
(glia-accion, modo «casos») en data/seed.sql y la cabecera de js/escenas.js.
Mi parte son los casos: <claves>. Primero propónme en una tabla cada caso
(situación, contexto, 3 pasos con alternativas y la correcta, fila del cuadro) y espera mi confirmación.
Después agrégalos al bloque de la actividad 17 al final de data/seed.sql, sin tocar otras actividades
ni archivos .js. Prueba con php admin/seed.php y php -S localhost:8000. Commits pequeños en imperativo.
```

### Sugerencia de reparto (ustedes deciden)

| Quién | Qué |
|---|---|
| Ayudante 1 | Crea el bloque de la actividad 17 (actividades + recursos + carrera) y los casos `isrs`, `acv`, `parkinson` |
| Ayudante 2 | Casos `miastenia` y `botox`, imágenes con licencia, conexiones TO/Fono y prueba en celular |
