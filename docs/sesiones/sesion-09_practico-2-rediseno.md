# Sesión 09 · Rediseño del práctico 2 (glía) · 20/21-10-2026

(La sesión 08 —práctico 2 solo glía, esquemas §8 de `prompts-imagenes.md`— no dejó reporte; su trabajo está en los commits `7a5fb9c` a `8a0eb63`.)

## Qué se hizo

| Tema | Resultado |
|---|---|
| Criterio | Act. 1 y 2 = estructura (qué es, cómo es, dónde está); act. 3 = función; quiz = repaso (12 comunes + 4 por carrera) |
| Conoce la glía (3 niveles) | I SNC en su tejido · II SNP del ganglio al nervio (esquema nuevo con plantilla anatómica) · III ¿Quién es quién? (6 tarjetas 3 + 3, forma y lugar) |
| La glía en el tejido (4) | Sin preguntas de tinción ni del Nissl; inmunofluorescencias por forma (marcador en el pie) |
| La glía en acción (5) | I etiquetas + 2 recorridos animados (glucosa → lactato, ciclo del glutamato) · II ¿qué cruza la BHE? · III mielina (P0/PLP/MBP, neurilema, fibras Aα–C) · IV rompecabezas mezclado y sin nombres · V estados (M0/M1/M2, A1/A2/cicatriz, glía radial, NG2) |
| Motor | `circuito.js`: vías tocando etiquetas, rótulo donde se toca · `rompecabezas.js`: `barajar`, `anonimas` · `mesa-practica.js`: tarjetas barajadas, caja compacta con 6 tarjetas |
| Esquema SNP | `img/glia-snp-tejido.jpg` hecho con ChatGPT desde `img/_fuentes/plantilla-snp-tejido.png` (anatomía en SVG, `plantilla-snp-tejido.py`) + `referencia-texturas-snp.png`; prompt en `prompts-imagenes.md` §10. Zonas calibradas sobre la imagen final |
| Ícono | `img/glia/oligodendrocito.png` nuevo (axones completos), 256 px |
| Git | `main` limpio: merge del PR #15 + commit `591f53f` (zonas del SNP). Sin ramas locales extra ni carpetas de respaldo |

## Estado al cierre

| Qué | Estado |
|---|---|
| Push de los commits locales | Pendiente (Fer, GitHub Desktop) |
| Producción | Subir los 9 archivos de `git diff --name-status 8a0eb63 HEAD` (sin docs) + `admin/seed.php` |
| Rama remota `feat/p2-rediseno` | Se puede borrar en GitHub |

## Prompt para la sesión siguiente

```
Retomo NeuroLab (C:\repo\neurolab). Lee docs/sesiones/sesion-09_practico-2-rediseno.md y docs/practico-2_tareas.md.
El práctico 2 (glía) ya está en producción. Vamos a corregir detalles que te iré reportando de a uno.
Para cada corrección: dime qué archivo tocas, edítalo, pruébalo (PHP 8.3 + Playwright, 1366×660 y celular)
y dime qué subir. Edita data/seed.sql directamente (bloque de la actividad afectada).
Trabaja sobre main; al final un commit con mi autoría y la lista de archivos para FileZilla.
Al cerrar, escribe docs/sesiones/sesion-10_*.md.
```
