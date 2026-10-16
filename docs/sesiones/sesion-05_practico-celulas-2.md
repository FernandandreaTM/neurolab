# Sesión 05: práctico Células nerviosas II (circuitos y glía)

**Fecha:** 2026-10-16 · **Asignatura:** ETMP097 Neurobiología · **Práctico:** Células nerviosas II (`practico.php?p=celulas-2`) · **Uso con estudiantes:** miércoles 21-10
**Estado:** ruta completa: 4 actividades y 9 secciones de la guía. Contenido basado en la clase «Células del sistema nervioso II 2026» y en las láminas y links de `docs/practico-2_donde-buscar.md` (tarea A de Kaira). Se probó con PHP 8.3 + Playwright en 1366×660 y 390×844, recorriendo todo como estudiante (con errores a propósito) y con «Completar todo el práctico» del modo docente: 9/9 secciones y sin errores de JS. El práctico I sigue completando sus 9/9.

---

## 1. Ruta

| # | Actividad (slug) | Nivel | Mecánica | Lámina |
|---|---|---|---|---|
| 1 | Circuito reflejo (`circuito-reflejo`) | I · Orientación en la médula | Capturar médula + ganglio, etiquetar (ganglio, asta dorsal, asta ventral, sustancia blanca, canal central) y 3 preguntas | MH-047 |
| | | II · Armar el circuito | **Nueva mecánica** sobre la captura del nivel I: 1) ubicar sensitiva, interneurona y motoneurona (se corrige con las etiquetas del estudiante); 2) tocarlas en el orden de la información → recorrido receptor → … → músculo con impulso animado; 3) 3 preguntas | — |
| 2 | Glía del SNC (`glia-snc`) | I · Cada célula, su función | Completar: escribir de memoria la célula de 10 frases | — |
| | | II · Canal central y sustancia blanca | 2 capturas, 5 preguntas (por qué con H&E solo se ven núcleos, oligodendrocitos en hilera, color de la sustancia blanca) | MHS-240 |
| | | III · Motoneurona y su glía | 1 captura con 6 etiquetas, 4 preguntas (soma grande, axón por el Nissl, glía perineuronal, neuropilo) | UCSF-163 |
| 3 | Glía del SNP (`glia-snp`) | I · SNC frente a SNP | Elegir: 12 frases → tarjetas (Schwann, oligodendrocito, satélite, astrocito) → cuadro «dónde está · qué envuelve · si falla» | — |
| | | II · Ganglio y células satélite | 1 captura, 3 preguntas (enlaza con la pseudounipolar del circuito) | MH-051 |
| | | III · Nervio periférico | 1 captura (epi-, peri-, endoneuro, fascículo, fibra), 3 preguntas | MH-052 |
| 4 | Quiz de cierre (`quiz-celulas-nerviosas-2`) | — | 15 preguntas por estudiante: 7 conceptos + 4 casos comunes + 4 de la carrera; 7 con tarjetas | — |

- Cada nivel tiene su «¿Para qué te sirve?» en versión TO y Fono (`data/practicos.php`).
- Las alternativas tienen largos parejos y la correcta no es la más larga.
- No se repiten preguntas del práctico I ni del banco AIKEN de la clase.

## 2. Cambios al motor

| Cambio | Archivos |
|---|---|
| Una lámina por niveles puede tener niveles `practica` (usa `practica_niveles` con `numero = n`) y `circuito`, además de `identificar` y `capturas` | `actividad.php`, `_partials/mesa.php` |
| Nivel `circuito`: lee la captura y las etiquetas del nivel base (`nl_lam_<slug>:<n>`). La zona de cada neurona y el orden **no van al navegador**: se revisan en `api/circuito_check.php` | `js/circuito.js`, `api/circuito_check.php`, `css/mesa.css` |
| Modo docente: autocompletar la práctica en mesa (`#nl-mprac`, que no estaba) y el circuito | `js/docente.js`, `api/autocompletar.php` |
| **Corrección:** al tocar «Siguiente nivel» justo al terminar una lámina, la sección podía no alcanzar a guardarse en la guía (las imágenes se arman en segundo plano). Ahora el enlace espera a que se guarde. **También afectaba al práctico I** | `js/lamina.js`, `js/circuito.js` |
| Captura con campo opcional `objeto` (texto «la zona» / «la neurona» de las instrucciones) | `js/lamina.js` |
| Íconos de glía opcionales: si existe `img/glia/<nombre>.png` aparece en las tarjetas de práctica y del quiz | `_partials/iconos_neurona.php`, `_partials/mesa.php`, `js/mesa-practica.js` |
| Tarjetas: el nombre largo ya no se corta mal al darse vuelta; cuadro comparativo legible en celular | `js/mesa-practica.js`, `css/mesa.css` |
| `practicos.php`: badge «ETMP097 Neurobiología» sin la carrera (pendiente de la sesión 03) | `data/practicos.php` |

## 3. Decisiones

| Tema | Decisión |
|---|---|
| Tareas B–H de los ayudantes | Las resolví para llegar al 21-10. Los ayudantes verán en qué colaborar en las próximas sesiones (revisión, casos del arco, actividades adicionales) |
| Imágenes e íconos | Los hace Fer con ChatGPT: prompts en `docs/prompts-imagenes.md` §4. Mientras tanto, las tarjetas van solo con texto |
| Circuito | Se arma sobre la **captura del estudiante** y se corrige con sus propias etiquetas del nivel I (no hay imagen fija) |
| Glía SNC nivel I | Completar (escribir de memoria) en vez de esquema, porque el esquema todavía no existe. Cuando esté, se puede pasar a identificación |
| LabiMed | Era LABIM3D: el pie ya enlazaba DigitalDuck y LABIM3D |

## 4. Para producción (Fer)

1. GitHub Desktop → `main` → **Push origin**.
2. FileZilla (misma subcarpeta en ambos paneles, reemplazando):
   `actividad.php _partials/mesa.php _partials/iconos_neurona.php api/autocompletar.php api/circuito_check.php css/mesa.css data/practicos.php data/seed.sql js/circuito.js js/docente.js js/lamina.js js/mesa-practica.js`
3. Abrir **`admin/seed.php`** (debe decir **actividades: 12**). No hace falta `migrate.php`.
4. Verificar en producción:
   - **Links de las láminas:** que cada uno abra en la zona y con el zoom correctos (los `x`, `y`, `z` de la tarea A). En el nivel III de Glía del SNP solo se pide el corte transversal del nervio.
   - **Circuito (Chrome/Edge):** hacer el nivel I con la lámina real (Capturar), luego el nivel II: las neuronas se corrigen según dónde quedaron tus etiquetas.
   - **Modo docente:** ruta → «⚡ Completar todo el práctico» → la guía debe mostrar 9/9 secciones.
   - **Práctico I:** sigue igual (también se probó completo).

## 5. Pendientes

1. Íconos de glía (6) e interneurona (opcional): prompts en `docs/prompts-imagenes.md` §4. Se suben a `img/glia/` y aparecen solos.
2. Revisar los textos con ojo docente, sobre todo las preguntas de lámina: se escribieron sin ver los campos reales (sin acceso a histologyguide desde aquí).
3. Ayudantes: actualizar `docs/practico-2_tareas.md` con lo que queda para ellos (p. ej. H «¿Dónde se cortó el arco?», «Mielina en el ganglio», «Una tinción, dos miradas» y revisar las láminas).
4. Si el esquema de glía SNC llega, pasar el nivel I de Glía del SNC a identificación.
5. De sesiones anteriores: igualar las alternativas de la lámina nivel II del práctico I; borrar `js/practica.js` y `js/tareas.js` (siguen en uso como respaldo en `actividad.php`: revisar antes de borrar).

---

## 6. Prompt para la sesión 06

```
Retomo NeuroLab (C:\repo\neurolab). Lee docs/sesiones/sesion-05_practico-celulas-2.md completo
(y la sesión 04 para el estilo de la guía y la mesa de trabajo).
Primero: revisa conmigo cómo funcionó el práctico Células nerviosas II con los estudiantes y en
producción (links de láminas, circuito sobre la captura, guía) y corrige lo que te reporte.
Luego: integra los íconos de glía que haya subido a img/glia/, revisa los pendientes de la
sección 5 y actualiza docs/practico-2_tareas.md con las tareas que quedan para los ayudantes.
Después: proponer el práctico de potencial de acción y sinapsis (ruta en tabla: actividades,
niveles, qué va a la guía) antes de programar. Implementa por partes, probando con PHP 8.3 +
Playwright en 1366×660 y celular; commits locales con mi autoría; dime exactamente qué subir.
Al cerrar, escribe docs/sesiones/sesion-06_*.md con reporte + prompt siguiente.
```
