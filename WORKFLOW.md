# Workflow de Fernanda

Cuando un estudiante abre un Pull Request en este repo, yo (Fernanda) hago esto:

1. **Revisar el código en GitHub** (5-10 min) → click en el PR, leer archivos cambiados, comentar si algo está mal.

2. **Aprobar y hacer merge en GitHub** → botón verde "Merge pull request" → "Confirm merge".

3. **Bajar los cambios a mi PC** → en PowerShell:
   ```
   cd C:\repo\neurolab
   git pull
   ```

4. **Correr el script `que-subir.ps1`**:
   ```
   .\que-subir.ps1
   ```
   Me pregunta "cuántos commits atrás" → pongo `1` si sólo hice ese PR, o `3` si hice varios.

5. **El script me da 2 listas**:
   - **[FTP upload]** — archivos a subir.
   - **[FTP delete]** — archivos a borrar del hosting.

6. **Abrir FileZilla**, conectar al hosting, ir a `/ferlopezmoncada/neurolab/`.

7. **Subir los archivos del [FTP upload]** (arrastrar desde mi carpeta local).

8. **Borrar los archivos del [FTP delete]** (click derecho → Delete en el hosting).

9. **Si el script dijo "tocaste schema/seed"** → abrir en navegador:
   - `https://tmeduca.org/ferlopezmoncada/neurolab/admin/migrate.php`
   - `https://tmeduca.org/ferlopezmoncada/neurolab/admin/seed.php`

10. **Verificar en producción** → abrir `https://tmeduca.org/ferlopezmoncada/neurolab/` y revisar que el cambio se ve.

11. **Borrar la rama del estudiante en GitHub** → botón "Delete branch" (aparece después del merge).

Si algo falla, le digo al estudiante en el PR qué corregir y el ciclo vuelve a empezar.

## Reglas para los estudiantes

- Trabajan en su rama (`feat/<tarea>` o `fix/<bug>`).
- NUNCA tocan `data/neurolab.db` ni `admin/data/neurolab.db` (ya está en `.gitignore`).
- NUNCA commitean `data/docente.php` ni escriben la clave docente en PRs, issues o chats.
- Ponerse al día y empezar tareas: `docs/AYUDANTES.md`.
- NUNCA suben al hosting por su cuenta — siempre yo.
- Mensaje de commit en imperativo, < 60 caracteres.
- Antes de hacer push, corren `php -l` en sus archivos PHP modificados.

## Archivos que NO se suben al hosting

- `.gitignore`
- `README.md`, `PLAN.md`
- `que-subir.ps1`
- `data/neurolab.db`, `admin/data/neurolab.db`
- `docs/` completo
- Todo lo que esté listado en `.gitignore`
## Archivo que se sube a mano una sola vez

- `data/docente.php` (clave del modo docente): se crea en el servidor desde `data/docente.ejemplo.php`. No está en git.
