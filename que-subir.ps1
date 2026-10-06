# que-subir.ps1
# Te dice QUÉ archivos concretos subir por FTP al hosting después de hacer merge.
# Uso: desde la carpeta neurolab/, ejecuta: powershell -File .\que-subir.ps1
#      o simplemente: .\que-subir.ps1

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "=== ESTADO DE NEUROLAB ===" -ForegroundColor Magenta
Write-Host ""

# 1) Confirmar que estamos en main y al dia
$ramaActual = git rev-parse --abbrev-ref HEAD
if ($ramaActual -ne "main") {
    Write-Host "[!] No estas en main. Estas en: $ramaActual" -ForegroundColor Red
    Write-Host "    Cambio a main y traigo lo ultimo..." -ForegroundColor Yellow
    git checkout main
    git pull origin main
} else {
    Write-Host "[OK] Estas en main." -ForegroundColor Green
    $behind = git rev-list --count HEAD..origin/main
    if ($behind -gt 0) {
        Write-Host "[!] Tienes $behind commits sin bajar. git pull..." -ForegroundColor Yellow
        git pull origin main
    } else {
        Write-Host "[OK] main esta al dia con origin/main." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== BRANCHES REMOTOS (lo que subieron los estudiantes) ===" -ForegroundColor Magenta
git branch -r

Write-Host ""
Write-Host "=== BRANCHES PENDIENTES DE MERGE ===" -ForegroundColor Magenta
$noMerged = git branch -r --no-merged main
if (-not $noMerged) {
    Write-Host "(ninguna - todo mergeado)" -ForegroundColor Green
} else {
    Write-Host $noMerged -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== BRANCHES REMOTAS YA Y MERGEADAS (candidatas a borrar) ===" -ForegroundColor Magenta
$merged = git branch -r --merged main | Where-Object { $_ -notmatch "main" -and $_ -notmatch "HEAD" }
if (-not $merged) {
    Write-Host "(ninguna)" -ForegroundColor Green
} else {
    Write-Host "Estas branches ya estan en main." -ForegroundColor Yellow
    $merged | ForEach-Object {
        $nombre = ($_ -replace "^\s*origin/", "").Trim()
        Write-Host "  [-] origin/$nombre" -ForegroundColor DarkYellow
    }
    $resp = Read-Host "Borrar las branches remotas ya mergeadas? (s/n)"
    if ($resp -eq "s" -or $resp -eq "S") {
        $merged | ForEach-Object {
            $nombre = ($_ -replace "^\s*origin/", "").Trim()
            git push origin --delete $nombre
        }
    } else {
        Write-Host "(puedes borrarlas despues desde GitHub con el boton Delete branch)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "=== ULTIMOS 10 COMMITS EN main ===" -ForegroundColor Magenta
git log --oneline -10

Write-Host ""
Write-Host "=== ARCHIVOS CAMBIADOS EN LOS ULTIMOS N COMMITS ===" -ForegroundColor Magenta
$N = Read-Host "Cuantos commits atras quieres revisar? (ej: 1, 3, 5)"
if (-not $N) { $N = 3 }

Write-Host ""
Write-Host "Archivos tocados en los ultimos $N commits:" -ForegroundColor Cyan
$archivos = git diff HEAD~$N..HEAD --name-status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] No hay suficientes commits. Prueba con N=1 o N=2." -ForegroundColor Yellow
    $archivos = git diff HEAD~$N..HEAD --name-status
}
$archivos | ForEach-Object { Write-Host "  -> $_" -ForegroundColor White }

Write-Host ""
Write-Host "=== HAY ARCHIVOS SENSIBLES QUE NO DEBEN SUBIR? ===" -ForegroundColor Magenta
$peligrosos = $archivos | Where-Object { $_ -match "\.db$" -or $_ -match "\.env" -or $_ -match "node_modules" }
if ($peligrosos) {
    Write-Host "[!] PELIGRO - estos archivos NO deben subirse por FTP:" -ForegroundColor Red
    $peligrosos | ForEach-Object { Write-Host "  X $_" -ForegroundColor Red }
} else {
    Write-Host "[OK] Ningun archivo sensible en los cambios." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== ARCHIVOS QUE NO SE SUBEN POR FTP (solo para tu Git local) ===" -ForegroundColor Magenta
$noSubir = $archivos | Where-Object { $_ -match "^\.gitignore$" -or $_ -match "que-subir\.ps1$" -or $_ -match "README\.md$" -or $_ -match "PLAN\.md$" -or $_ -match "\.ps1$" -or $_ -match "^docs/" -or $_ -match "WORKFLOW\.md$" }
if ($noSubir) {
    Write-Host "Estos viven en tu repo pero NO se suben al hosting:" -ForegroundColor Yellow
    $noSubir | ForEach-Object { Write-Host "  [-] $_" -ForegroundColor DarkGray }
}

Write-Host ""
Write-Host "=== HAY CAMBIOS SIN COMMITEAR EN TU WORKING DIR? ===" -ForegroundColor Magenta
$porCommit = git status --porcelain
if ($porCommit) {
    Write-Host "[!] Tienes cambios sin commitear. Subelos ANTES de subir por FTP:" -ForegroundColor Yellow
    $porCommit | ForEach-Object { Write-Host "  ? $_" -ForegroundColor Yellow }
} else {
    Write-Host "[OK] Working dir limpio." -ForegroundColor Green
}

Write-Host ""
Write-Host "=== RESUMEN PARA SUBIR POR FTP ===" -ForegroundColor Magenta
Write-Host "Cambios separados por accion:" -ForegroundColor Cyan
Write-Host ""

$subir = @()
$borrar = @()
foreach ($linea in $archivos) {
    # formato de git diff --name-status: "M\tarchivo" o "A\tarchivo" o "D\tarchivo"
    $partes = $linea -split "`t", 2
    if ($partes.Count -lt 2) { continue }
    $status = $partes[0]
    $file = $partes[1]
    # Filtrar archivos que no se suben
    if ($file -match "\.db$|\.env$|\.gitignore$|que-subir\.ps1$|README\.md$|PLAN\.md$|WORKFLOW\.md$|^docs/|\.ps1$") { continue }
    if ($status -eq "D") {
        $borrar += $file
    } else {
        $subir += $file
    }
}

if ($subir.Count -gt 0) {
    Write-Host "  [+] SUBIR estos archivos al hosting:" -ForegroundColor Green
    $subir | ForEach-Object { Write-Host "      [FTP upload] $_" -ForegroundColor Green }
}
if ($borrar.Count -gt 0) {
    Write-Host ""
    Write-Host "  [-] BORRAR estos archivos del hosting (ya no estan en tu repo):" -ForegroundColor Yellow
    $borrar | ForEach-Object { Write-Host "      [FTP delete] $_" -ForegroundColor Yellow }
}
if ($subir.Count -eq 0 -and $borrar.Count -eq 0) {
    Write-Host "  (no hay cambios que afecten al hosting)" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== TOCASTE SCHEMA O SEED? ===" -ForegroundColor Magenta
$tocoSchema = $archivos | Where-Object { $_ -match "schema\.sql$|seed\.sql$|admin/migrate\.php$|admin/seed\.php$" }
if ($tocoSchema) {
    Write-Host "[!] SI - despues de subir por FTP, regenera la BD:" -ForegroundColor Yellow
    Write-Host "  -> Visita https://tmeduca.org/ferlopezmoncada/neurolab/admin/migrate.php" -ForegroundColor White
    Write-Host "  -> Luego https://tmeduca.org/ferlopezmoncada/neurolab/admin/seed.php" -ForegroundColor White
} else {
    Write-Host "[OK] No tocaste schema/seed. No hace falta correr migrate." -ForegroundColor Green
}

Write-Host ""