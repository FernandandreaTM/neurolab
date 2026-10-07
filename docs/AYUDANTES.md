# Ayudantes: ponerse al día con NeuroLab

Para Kaira y Marcelo. Hubo muchos cambios: `main` es ahora la única rama oficial y las ramas viejas se borraron. Sigue los pasos **en orden**.

---

## 1. Rescatar lo tuyo (si tenías algo sin subir)

1. Abre **GitHub Desktop** → *Current repository*: `neurolab`.
2. Mira la pestaña **Changes** (izquierda).
   - **Vacía** → pasa al paso 2.
   - **Con archivos** y quieres conservarlos → abajo escribe un resumen (ej. `wip: mis cambios antes de actualizar`) → **Commit to <tu rama>** → **Push origin**. Avísale a Fernanda.
   - **Con archivos** que no te importan → clic derecho en la lista → **Discard all changes**.

## 2. Pasarte a `main` actualizado

1. Arriba, **Current branch** → elige **`main`**.
2. Clic en **Fetch origin** y luego en **Pull origin** (el mismo botón cambia de nombre).
3. Si aparece *"Your branch has diverged"* o un conflicto: **no fuerces nada**, toma captura y avísale a Fernanda.

## 3. Borrar tus ramas viejas

En **Current branch** verás ramas que ya no existen en GitHub (ej. `feat/atlas-por-area`, `pr/7`, `integracion`).

1. Asegúrate de estar en `main`.
2. **Branch → Delete…** sobre cada rama vieja (si pregunta, marca también borrar la remota).
3. Si una tiene trabajo tuyo **no** mergeado, no la borres: avísale a Fernanda.

## 4. Revisar que funciona en tu PC

En la terminal (o pídeselo a Claude Desktop), dentro de la carpeta del repo:

```bash
php admin/migrate.php
php admin/seed.php
php -S localhost:8000
```

Abre http://localhost:8000 → **Práctico Células nerviosas I** → haz al menos el nivel I de *Partes de la neurona* y revisa que aparezca en **Mi guía**.

> El modo docente (autocompletar) necesita `data/docente.php`, que **no está en GitHub** a propósito. No lo pidas por chat ni lo crees con la clave real. Si quieres probarlo en local, copia `data/docente.ejemplo.php` como `data/docente.php` con una clave inventada.

## 5. Leer antes de programar

| Archivo | Para qué |
|---|---|
| `README.md` | Qué es el proyecto ahora y dónde está cada cosa |
| `docs/sesiones/sesion-04_*.md` | Último estado y decisiones de diseño |
| `docs/sesiones/sesion-02_*.md` | Principios de la mesa de trabajo (cómo se arma una actividad) |
| `data/practicos.php` | Cómo se define una ruta de práctico |
| `docs/practico-2_tareas.md` | **Tareas disponibles del práctico II** |

## 6. Empezar una tarea nueva

1. Desde `main` actualizado: **Current branch → New branch** → nombre `feat/<tarea>` (ej. `feat/lamina-medula`).
2. **Publish branch**.
3. Trabaja con Claude Desktop. Al iniciar el chat, pásale:
   ```
   Trabajo en NeuroLab (carpeta del repo). Lee README.md y docs/sesiones/sesion-04_*.md.
   Mi tarea es: <tarea asignada>. Antes de programar, propónme el plan en una tabla.
   No toques data/docente.php ni data/neurolab.db. Commits pequeños, mensajes en imperativo.
   ```
4. Commits chicos y frecuentes → **Push origin**.
5. Al terminar: **Create Pull Request** (GitHub Desktop abre GitHub) → base `main` → describe qué hiciste y cómo probarlo → asigna a **FernandandreaTM**.

## Reglas

| ✅ Sí | ❌ No |
|---|---|
| Trabajar siempre en tu rama `feat/…` | Commitear directo a `main` |
| Hacer **Pull origin** en `main` antes de crear una rama nueva | Subir archivos al hosting (solo Fernanda) |
| `php -l archivo.php` antes de hacer push | Commitear `data/docente.php`, `data/neurolab.db` o `img/_fuentes/` |
| Imágenes optimizadas (< 300 KB) en `img/` | Escribir la clave docente en PRs, issues o chats |
| Preguntar si algo se ve raro | Forzar push o resolver conflictos "a ciegas" |
