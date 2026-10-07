# NeuroLab

Prácticos autoguiados de Neurobiología con actividades autocorregibles y guía de estudio descargable.

**TecMedHUB · Escuela de Tecnología Médica · Universidad Austral de Chile, Sede Puerto Montt**
Dra. Fernanda López-Moncada · fernanda.lopez@uach.cl
Ayudantes: Kaira Santos ([@kamarisss](https://github.com/kamarisss)) · Marcelo Rojas ([@mikaelroxas-glitch](https://github.com/mikaelroxas-glitch))

Producción: https://tmeduca.org/ferlopezmoncada/neurolab/

---

## Qué es

Los estudiantes avanzan **a su ritmo** (solos o en grupo) por una ruta de actividades. Cada actividad se corrige sola y presenta un desafío; al completar cada nivel se suma una sección a **Mi guía**, que al final se descarga en HTML o PDF.

| Asignatura | Carrera | Estado |
|---|---|---|
| ETMP097 Neurobiología | Terapia Ocupacional | En uso |
| ETMP061 Fisiología de Sistemas | Fonoaudiología | Textos por carrera ya activos (switch TO / Fono) |

## Prácticos

| Clave | Práctico | Estado |
|---|---|---|
| `celulas-1` | Células nerviosas I: la neurona | **En uso con estudiantes** |
| `celulas-2` | Células nerviosas II: circuitos y glía | En desarrollo |
| — | Potencial de acción · Sinapsis | Planificados |

### Ruta de `celulas-1`

| # | Actividad | Niveles | Mecánica | Va a la guía |
|---|---|---|---|---|
| 1 | Partes de la neurona | 3 (estructura · organelos · citoesqueleto) | Identificación: escribir el nombre de memoria y elegir la función | Imagen rotulada + lista |
| 2 | Tipos de neurona | 2 | I: armar multipolar/bipolar/pseudounipolar y marcar entrada/salida · II: frases → tarjetas → cuadro comparativo | Dibujos con flecha + cuadro |
| 3 | Lámina: neuronas reales | 3 | Corte sagital de rata: orientarse, **Capturar** y etiquetar piramidal y Purkinje (Golgi), comparar con cresil violeta | Capturas + preguntas |
| 4 | Quiz de cierre | 1 | 18 preguntas, conceptos → casos de la carrera activa | Resultado + explicaciones |

Cada nivel puede tener un recuadro **«¿Para qué te sirve?»** propio de TO o Fono.

## Cómo está armado

| Capa | Tecnología |
|---|---|
| Frontend | HTML + CSS + JavaScript (ES Modules), sin bundler ni npm |
| Backend | PHP 7.4+ sin frameworks |
| Datos | SQLite (`data/neurolab.db`, generada) + `data/practicos.php` |
| Avance del estudiante | `localStorage` (texto) + IndexedDB (imágenes de la guía); nada se guarda en el servidor |

### Dónde vive cada cosa

| Quiero cambiar… | Archivo |
|---|---|
| Ruta del práctico, secciones de la guía, «¿Para qué te sirve?» | `data/practicos.php` (no requiere seed) |
| Contenido de actividades, preguntas, coordenadas de números | `data/seed.sql` → luego `admin/seed.php` |
| Estructura de tablas | `data/schema.sql` → luego `admin/migrate.php` |
| Página de la ruta / guía | `practico.php`, `guia.php`, `js/guia.js`, `css/guia.css` |
| Mesa de trabajo (contenedor de actividades) | `_partials/mesa.php`, `css/mesa.css` |
| Identificación de partes | `js/labeling.js`, `api/labeling_check.php` |
| Armar neuronas / tarjetas / cuadro | `js/tipos.js`, `js/armar-neurona.js`, `_partials/iconos_neurona.php` |
| Lámina virtual y Capturar | `js/lamina.js` |
| Quiz | `js/quiz-mesa.js` |
| Switch de carrera | `_partials/barra.php`, `js/carrera.js` |
| Inicio, menú, pie (recursos, equipo) | `index.php`, `_partials/nav.php`, `_partials/footer.php` |
| Modo docente | `docente.php`, `_partials/docente.php`, `api/autocompletar.php`, `js/docente.js` |

Heredado de la versión inicial (atlas por temas): `atlas.php`, `tema.php`, `actividad.php`, `admin/index.php`.

## Modo docente

Permite autocompletar niveles o el práctico completo para revisar la guía o hacer demostraciones.

- La clave vive en `data/docente.php`, que **no está en git** (ver `.gitignore`).
- Plantilla: `data/docente.ejemplo.php` → copiar como `data/docente.php` y cambiar la clave.
- Se activa una vez por navegador con `docente.php?clave=<clave>`; se quita con `docente.php?salir=1`.
- Sin la cookie, `api/autocompletar.php` responde 403.

**Nunca** commitear `data/docente.php` ni escribir la clave en issues, PRs, commits o chats.

## Correr en local

```bash
php admin/migrate.php     # crea data/neurolab.db
php admin/seed.php        # carga contenido
php -S localhost:8000     # abrir http://localhost:8000
```

Para probar el modo docente en local: copiar `data/docente.ejemplo.php` a `data/docente.php` con cualquier clave.

## Colaboración

- Cada ayudante trabaja en su rama (`feat/<tarea>` o `fix/<bug>`) y abre un Pull Request a `main`.
- Solo Fernanda mergea y sube a producción (FileZilla + `que-subir.ps1`). Ver `WORKFLOW.md`.
- Ayudantes nuevos o que vuelven: `docs/AYUDANTES.md`.
- Bitácora de desarrollo: `docs/sesiones/` (reporte + prompt de la sesión siguiente).
