"""Práctico 4 · Actividad 17 (casos-sinapsis): agrega casos y ajusta el bloque en data/seed.sql.
Uso: python3 docs/practico-4_build.py  (luego php admin/seed.php)."""
import json, pathlib

SEED = pathlib.Path(__file__).resolve().parent.parent / 'data' / 'seed.sql'
SITIOS = ["Botón presináptico", "Hendidura sináptica", "Receptor postsináptico", "Astrocito vecino"]

def sitio(p, ok, pista):
    return {"tipo": "tarjeta", "nombre": "Sitio", "p": p, "ops": SITIOS, "ok": ok, "pista": pista}

def elegir(nombre, p, ops, pista):
    return {"tipo": "elegir", "nombre": nombre, "p": p, "ops": ops, "ok": 0, "pista": pista}

NUEVOS = [
    {"clave": "parkinson", "titulo": "Luis, 68 años", "corto": "Parkinson y L-dopa",
     "situacion": "Hace un año le tiembla la mano derecha cuando está en reposo. Camina con pasos cortos, se mueve lento y le cuesta abrochar botones. Su neurólogo le receta L-dopa.",
     "contexto": "Murió gran parte de las neuronas de la sustancia negra, que envían sus axones al estriado y ahí liberan dopamina. La dopamina no sirve como fármaco para esta enfermedad: se usa L-dopa, la molécula con la que las neuronas fabrican dopamina.",
     "pasos": [
        sitio("¿Dónde falla la sinapsis del estriado en el Parkinson?", 0,
              "Las neuronas que murieron, ¿son las que liberan la dopamina o las que la reciben?"),
        elegir("Qué cambia", "¿Qué pasa con la dopamina en el estriado?",
               ["Disminuye: se libera menos", "Aumenta: no se recapta", "Disminuye: se degrada más", "Aumenta: se libera más"],
               "Si faltan las neuronas que la liberan, ¿llega más o menos dopamina a la hendidura?"),
        elegir("Qué se observa", "¿Por qué funciona la L-dopa y no la dopamina?",
               ["Cruza la barrera y se convierte en dopamina", "No cruza la barrera y actúa desde la sangre",
                "Cruza la barrera y bloquea la recaptación", "No cruza la barrera y activa los músculos"],
               "Recuerda «¿Qué cruza la barrera?» del práctico 2: la L-dopa y la dopamina estaban en tarjetas distintas."),
     ],
     "exp": "En el Parkinson mueren las neuronas dopaminérgicas de la sustancia negra que liberan dopamina en el estriado. Sin dopamina se altera el circuito de los ganglios basales que facilita el movimiento: aparecen temblor de reposo, lentitud y rigidez. La dopamina no cruza la barrera hematoencefálica; la L-dopa sí, con un transportador, y las neuronas que quedan la convierten en dopamina. Como las neuronas siguen muriendo, con los años el efecto de cada dosis dura menos.",
     "fila": ["Botón presináptico (sustancia negra → estriado)", "Dopamina", "Menos dopamina en el estriado", "Temblor y lentitud; mejora con L-dopa"]},
    {"clave": "miastenia", "titulo": "Ana, 29 años", "corto": "Miastenia gravis",
     "situacion": "Al final del día se le cae el párpado derecho y ve doble. Si habla mucho rato la voz se le apaga, y le cuesta masticar al terminar de comer. Todo mejora después de descansar.",
     "contexto": "Es una enfermedad autoinmune: anticuerpos atacan una proteína de la placa motora. Los nervios conducen bien y liberan acetilcolina en cantidad normal. Se trata con piridostigmina, que inhibe la acetilcolinesterasa.",
     "pasos": [
        sitio("Si el nervio libera acetilcolina normal, ¿dónde está la proteína que atacan los anticuerpos?", 2,
              "El problema no está en quien envía la señal, sino en quien la recibe."),
        elegir("Qué cambia", "¿Qué hace la piridostigmina con la acetilcolina en la hendidura?",
               ["Aumenta: no se degrada", "Disminuye: se degrada más", "Aumenta: se libera más", "Disminuye: no se libera"],
               "La acetilcolinesterasa es la enzima que degrada la acetilcolina. Si está inhibida, ¿la acetilcolina dura más o menos?"),
        elegir("Qué se observa", "¿Por qué la debilidad de Ana aumenta con el uso?",
               ["Cada impulso libera menos ACh y no se alcanza el umbral", "Cada impulso libera más ACh y se bloquean los receptores",
                "Cada impulso gasta Ca²⁺ y el nervio deja de conducir", "Cada impulso daña la mielina del nervio motor"],
               "Con pocos receptores, el potencial de la placa queda justo. Del práctico 3: ¿qué pasa si una despolarización no llega al umbral?"),
     ],
     "exp": "En la miastenia gravis, anticuerpos destruyen los receptores nicotínicos de acetilcolina de la placa motora. Con menos receptores, el potencial de placa es más pequeño: en reposo alcanza el umbral, pero con el uso repetido cada impulso libera algo menos de acetilcolina y algunas fibras musculares no llegan al umbral. Por eso la debilidad aumenta con el uso y afecta sobre todo párpados, ojos, voz y deglución. La piridostigmina inhibe la acetilcolinesterasa: la acetilcolina dura más en la hendidura y activa los receptores que quedan.",
     "fila": ["Receptor postsináptico (nicotínico)", "Acetilcolina", "Menos receptores; la piridostigmina deja más ACh", "Debilidad que aumenta con el uso"]},
    {"clave": "botox", "titulo": "Patricia, 55 años", "corto": "Toxina botulínica en la espasticidad",
     "situacion": "Hace un año tuvo un ACV. Desde entonces la mano y el codo izquierdos están rígidos y flexionados, y le cuesta abrir la mano para vestirse. Antes de la terapia le inyectan toxina botulínica en los músculos flexores de los dedos.",
     "contexto": "La toxina botulínica corta una proteína (SNAP-25) que las vesículas necesitan para fusionarse con la membrana. Se inyecta en el músculo y actúa solo cerca del lugar de la inyección. Su efecto dura unos tres meses.",
     "pasos": [
        sitio("¿Dónde actúa la toxina botulínica?", 0,
              "¿Dónde están las vesículas que necesitan fusionarse para liberar el neurotransmisor?"),
        elegir("Qué cambia", "¿Qué pasa con la acetilcolina en la placa motora?",
               ["Disminuye: no se libera", "Aumenta: no se degrada", "Disminuye: se degrada más", "Aumenta: no se recapta"],
               "Si las vesículas no se fusionan, ¿sale su contenido a la hendidura?"),
        elegir("Qué se observa", "¿Por qué el efecto dura solo unos tres meses?",
               ["Brotan terminales nuevas que liberan ACh", "Se forman receptores nuevos en el músculo",
                "Se regenera la mielina del nervio motor", "Nacen motoneuronas nuevas en la médula"],
               "La toxina no mata a la neurona: ¿qué puede hacer su terminal para recuperar la sinapsis?"),
     ],
     "exp": "La toxina botulínica corta SNAP-25, una proteína del complejo que fusiona la vesícula con la membrana. Sin fusión no se libera acetilcolina y el músculo inyectado se relaja: es una parálisis local y reversible. En la espasticidad abre una ventana para estirar y entrenar en terapia; en Fono se usa, por ejemplo, en la disfonía espasmódica. El efecto dura unos tres meses porque brotan terminales nuevas y después se recupera la original. En el botulismo, la misma toxina llega a todo el cuerpo y causa una parálisis generalizada.",
     "fila": ["Botón presináptico (fusión de vesículas)", "Acetilcolina", "No se libera ACh", "El músculo se relaja por unos tres meses"]},
]

FOTOS = {
    "parkinson": ("img/sinapsis/casos/parkinson.jpg",
                  "Dibujo de un paciente con enfermedad de Parkinson (1886): tronco encorvado, brazos flexionados pegados al cuerpo.",
                  "William R. Gowers · Dominio público · Wikimedia Commons"),
    "miastenia": ("img/sinapsis/casos/miastenia.jpg",
                  "a) Párpado derecho caído (ptosis). b) Minutos después de una dosis de edrofonio, un inhibidor de la acetilcolinesterasa de acción corta: la ptosis mejora.",
                  "Kurukumbi y cols., J Med Case Rep 2008 · CC BY 2.0 · Wikimedia Commons"),
    "botox": ("img/sinapsis/casos/botox.jpg",
              "Frasco de toxina botulínica, con una regla en centímetros para mostrar su tamaño.",
              "Pittigrilli · CC BY 4.0 · Wikimedia Commons"),
}
for c in NUEVOS:
    if c["clave"] in FOTOS:
        c["foto"], c["foto_t"], c["foto_pie"] = FOTOS[c["clave"]]

txt = SEED.read_text(encoding='utf-8')
ini = txt.index("  (17, 'tareas', '") + len("  (17, 'tareas', '")
fin = txt.index("', NULL, 1);", ini)
d = json.loads(txt[ini:fin].replace("''", "'"))
N = d['niveles'][0]
claves = [c['clave'] for c in N['casos']]
for c in N['casos']:
    for p in c['pasos']:
        if p['tipo'] == 'tarjeta':
            p['ops'] = SITIOS
N['casos'] = [c for c in N['casos'] if c['clave'] not in {n['clave'] for n in NUEVOS}] + NUEVOS
N['guia_pie'] = "Imágenes: Lanfear's Bane (CC BY-SA 3.0); Lucien Monfils (CC BY-SA 4.0); W. R. Gowers (dominio público); Kurukumbi y cols. (CC BY 2.0); Pittigrilli (CC BY 4.0)."
nuevo = json.dumps(d, ensure_ascii=False).replace("'", "''")
SEED.write_text(txt[:ini] + nuevo + txt[fin:], encoding='utf-8')
print('casos:', [c['clave'] for c in N['casos']])

# Circuito reflejo (actividad 9), nivel II: todas las piezas a la vez (sin grupos)
txt = SEED.read_text(encoding='utf-8')
ini = txt.index("  (9, 'tareas', '") + len("  (9, 'tareas', '")
fin = txt.index("}'", ini) + 1
d = json.loads(txt[ini:fin].replace("''", "'"))
n2 = d['niveles'][1]
n2.pop('grupos', None)
for p in n2['piezas']:
    p.pop('grupo', None)
n2['instrucciones'] = ("La médula ya está. Completa los huecos punteados: toca un hueco y elige su pieza, o arrastra la pieza "
    "a cualquier parte de su hueco. Las piezas están en cualquier orden: fíjate qué trae la información (lado <strong>sensitivo</strong>) "
    "y qué la lleva al músculo (lado <strong>motor</strong>). <strong>Verde</strong>: correcto. <strong>Rojo</strong>: por repasar. "
    "<strong>Naranjo</strong>: lo que estás haciendo.")
nuevo = json.dumps(d, ensure_ascii=False, separators=(',', ':')).replace("'", "''")
SEED.write_text(txt[:ini] + nuevo + txt[fin:], encoding='utf-8')
print('circuito nivel II: sin grupos')

# ---------------------------------------------------------------------------
# Actividad 16: LA SINAPSIS QUÍMICA (simulador propio js/sim-sinapsis.js), 2 niveles, un paso por caso
def sim(clave, titulo, p, checks, q, ops, pista_sim, pista_q, exp, fila):
    return {"clave": clave, "titulo": titulo, "corto": titulo,
            "pasos": [{"tipo": "sim", "p": p, "checks": [{"t": t, "c": c} for t, c in checks], "pista": pista_sim,
                       "q": {"p": q, "ops": ops, "ok": 0, "pista": pista_q}}],
            "exp": exp, "fila": fila[1:]}   # la 1.ª columna del cuadro es el nombre del caso

S1 = {"n": 1, "tipo": "escenas", "modo": "casos", "simulador": "sinapsis", "dx": True,
      "titulo": "Del potencial de acción a la liberación", "subtitulo": "Ca²⁺, vesículas, sumación y recaptación",
      "fondo": "img/sinapsis/guia-sinapsis-1.svg", "vb": [1200, 750], "alt": "Sinapsis química y cuatro registros postsinápticos",
      "guia_src": "img/sinapsis/guia-sinapsis-1.svg", "guia_img": "Del potencial de acción a la liberación",
      "guia_pie": "Registros del simulador de NeuroLab: a 1 PA, b Ca²⁺ bloqueado, c tren de PA, d sin recaptación.",
      "sim_cfg": {"controles": ["pa", "tren", "ca", "recap"], "nt": "glu"},
      "nombres_paso": {"elegir": "Pregunta"},
      "instrucciones": "Una sinapsis química que usa <strong>glutamato</strong>. Usa los botones de la izquierda: <strong>⚡ 1 potencial de acción</strong>, el <strong>tren</strong>, los <strong>canales de Ca²⁺</strong> y la <strong>recaptación</strong> del astrocito. Mira qué pasa en el botón y en la hendidura, y el <strong>registro</strong> de la neurona postsináptica a la derecha. Cerca de cada potencial de acción el tiempo pasa más lento para que lo veas. En cada caso cumple la lista y responde. Cada caso llena una fila del <strong>cuadro</strong>.",
      "cuadro": ["Prueba", "En la hendidura", "En la neurona postsináptica"],
      "casos": [
        sim("lib", "a · Llega un potencial de acción", "Haz que llegue un potencial de acción al botón:",
            [("Da 1 potencial de acción y mira el registro", "lib1")],
            "¿Qué abrió los canales de Ca²⁺ del botón?",
            ["El voltaje del potencial de acción", "El glutamato liberado en la hendidura", "El Na⁺ que entra a la postsináptica", "La bomba Na⁺/K⁺ del botón"],
            "Presiona ⚡ 1 potencial de acción y mira el botón: qué llega primero, qué se abre después.",
            "Mira el orden: primero baja el potencial de acción por el axón y recién después se abren los canales.",
            "Los canales de Ca²⁺ del botón se abren por voltaje cuando llega el potencial de acción. Entra Ca²⁺ y eso hace que las vesículas acopladas se fusionen con la membrana y liberen glutamato. Un solo potencial de acción da un PPSE pequeño, que no llega al umbral.",
            ["1 potencial de acción", "Entra Ca²⁺ y se libera glutamato", "PPSE pequeño, bajo el umbral"]),
        sim("ca", "b · Sin Ca²⁺", "Bloquea los canales de Ca²⁺ y vuelve a probar:",
            [("Canales de Ca²⁺ bloqueados", "caOff"), ("Da 1 potencial de acción", "sinLib")],
            "¿Por qué no hubo PPSE?",
            ["No entró Ca²⁺ y no hubo fusión", "No llegó el PA al botón", "Los receptores estaban bloqueados", "Se agotaron las vesículas"],
            "Apaga el interruptor «Canales de Ca²⁺» y presiona ⚡ 1 potencial de acción.",
            "El potencial de acción sí llegó al botón. ¿Qué faltó para que las vesículas se fusionaran?",
            "Sin entrada de Ca²⁺ las vesículas no se fusionan, aunque el potencial de acción llegue al botón: no se libera neurotransmisor y la neurona postsináptica no se entera. Por eso los fármacos y toxinas que bloquean los canales de Ca²⁺ presinápticos (como algunos venenos de caracoles marinos) o el ingreso de Ca²⁺ cortan la transmisión.",
            ["Ca²⁺ bloqueado", "No entra Ca²⁺: no se libera glutamato", "Nada: sigue en reposo"]),
        sim("tren", "c · Un tren de potenciales", "Activa de nuevo los canales de Ca²⁺ y manda un tren:",
            [("Canales de Ca²⁺ activos", "caOn"), ("Da un tren de potenciales", "tren"), ("Potencial de acción en la neurona postsináptica", "paPost")],
            "¿Cómo se alcanzó el umbral?",
            ["Se sumaron los PPSE en el tiempo", "Un solo PPSE llegó al umbral", "Se liberó un neurotransmisor distinto", "Se abrieron canales de K⁺ en la dendrita"],
            "Enciende «Canales de Ca²⁺» y presiona ⚡⚡⚡ Tren de potenciales.",
            "Cada PPSE solo no llega al umbral. ¿Qué pasa si llega otro antes de que el anterior termine?",
            "Con un tren, cada nuevo PPSE llega antes de que el anterior se apague y se suman (sumación temporal, como en el práctico 3) hasta alcanzar el umbral: la neurona postsináptica dispara un potencial de acción. Así la frecuencia de potenciales de acción codifica la intensidad de la señal.",
            ["Tren de potenciales", "Se libera glutamato una y otra vez", "Los PPSE se suman: potencial de acción"]),
        sim("recap", "d · Sin recaptación", "Apaga la recaptación del astrocito y da un solo potencial de acción:",
            [("Recaptación apagada", "recapOff"), ("Da 1 potencial de acción", "largo")],
            "¿Por qué el PPSE fue más grande y más largo?",
            ["El glutamato quedó más tiempo en la hendidura", "Se liberaron más vesículas por cada PA", "Entró más Ca²⁺ al botón presináptico", "Los receptores se cerraron más tarde por el voltaje"],
            "Apaga el interruptor «Recaptación (astrocito)» y presiona ⚡ 1 potencial de acción. Compara con el registro gris anterior.",
            "Fíjate en la hendidura: ¿cuánto tiempo queda el glutamato después de liberarse?",
            "La señal termina cuando el neurotransmisor sale de la hendidura. El glutamato lo recaptan sobre todo los astrocitos, con transportadores que dependen del gradiente de Na⁺. Si fallan, el glutamato sigue activando los receptores: el PPSE crece y dura más. Si falla mucho tiempo (como en un ACV), la sobreactivación daña a la neurona (excitotoxicidad). Los ISRS hacen algo parecido a propósito, con la serotonina.",
            ["Sin recaptación", "El glutamato queda más tiempo", "PPSE más grande y largo"]),
      ]}

S2 = {"n": 2, "tipo": "escenas", "modo": "casos", "simulador": "sinapsis", "dx": True,
      "titulo": "El receptor decide", "subtitulo": "GABA y acetilcolina en receptores distintos",
      "fondo": "img/sinapsis/guia-sinapsis-2.svg", "vb": [1200, 750], "alt": "Receptor ionotrópico y metabotrópico con sus registros",
      "guia_src": "img/sinapsis/guia-sinapsis-2.svg", "guia_img": "El receptor decide el efecto",
      "guia_pie": "Registros del simulador de NeuroLab: a GABA, b acetilcolina en receptor nicotínico, c acetilcolina en receptor muscarínico.",
      "sim_cfg": {"controles": ["pa", "nt", "rec"], "nt": "glu"},
      "nombres_paso": {"elegir": "Pregunta"},
      "instrucciones": "Ahora eliges el <strong>neurotransmisor</strong> y, con la acetilcolina, el <strong>receptor</strong>. Da un potencial de acción y mira qué ion pasa y cómo cambia el <strong>registro</strong> de la neurona postsináptica. En cada caso cumple la lista y responde. Cada caso llena una fila del <strong>cuadro</strong>.",
      "cuadro": ["Neurotransmisor y receptor", "Tipo de receptor", "Ion", "Efecto"],
      "casos": [
        sim("gaba", "a · GABA", "Prueba con GABA:",
            [("Elige GABA", "ntGaba"), ("Da 1 potencial de acción", "ppsi")],
            "¿Qué pasó en la neurona postsináptica?",
            ["Entró Cl⁻ y se hiperpolarizó", "Entró Cl⁻ y se despolarizó", "Entró Na⁺ y se hiperpolarizó", "Salió Na⁺ y se despolarizó"],
            "Elige GABA en «Neurotransmisor» y presiona ⚡ 1 potencial de acción.",
            "Mira de qué color son los iones que pasan por los receptores y hacia dónde se mueve la curva.",
            "El GABA abre receptores-canal de Cl⁻ (GABA-A). Entra Cl⁻ y el interior se vuelve más negativo: es un PPSI, que aleja a la neurona del umbral. Las benzodiazepinas aumentan este efecto. En la médula, la glicina hace lo mismo en las interneuronas inhibitorias del circuito reflejo.",
            ["GABA · receptor GABA-A", "Ionotrópico (canal)", "Entra Cl⁻", "PPSI rápido: inhibe"]),
        sim("nic", "b · Acetilcolina en un receptor nicotínico", "Prueba la acetilcolina con el receptor nicotínico:",
            [("Elige acetilcolina", "ntAch"), ("Receptor nicotínico", "recNic"), ("Da 1 potencial de acción", "nic")],
            "¿Qué es el receptor nicotínico?",
            ["Un canal que se abre con la ACh", "Una enzima que degrada la ACh", "Un transportador que recapta ACh", "Una proteína G que abre otro canal"],
            "Elige acetilcolina, luego «Nicotínico», y presiona ⚡ 1 potencial de acción.",
            "Mira el receptor cuando llega la acetilcolina: ¿qué pasa a través de él mismo?",
            "El receptor nicotínico es un receptor-canal (ionotrópico): al unir acetilcolina se abre y entra Na⁺, y el PPSE es rápido. Es el receptor de la placa motora. La señal termina porque la acetilcolinesterasa, una enzima de la hendidura, degrada la acetilcolina (no hay recaptación como con el glutamato).",
            ["Acetilcolina · nicotínico", "Ionotrópico (canal)", "Entra Na⁺", "PPSE rápido: excita"]),
        sim("mus", "c · Acetilcolina en un receptor muscarínico", "Cambia al receptor muscarínico:",
            [("Receptor muscarínico", "recMus"), ("Da 1 potencial de acción", "mus")],
            "La misma acetilcolina hiperpolarizó, y más lento. ¿Por qué?",
            ["Otro receptor: usa una proteína G", "Otro ion: la ACh entra a la célula", "Otra dosis: se liberó menos ACh", "Otra enzima: la degrada más rápido"],
            "Elige «Muscarínico» y presiona ⚡ 1 potencial de acción. Compara con el registro anterior.",
            "Mira qué hace el receptor al unir la acetilcolina: ¿pasa algún ion por él?",
            "El receptor muscarínico no es un canal: activa una proteína G que, después de un momento, abre canales de K⁺. Sale K⁺ y la neurona se hiperpolariza, más tarde y por más tiempo (en una célula real, de cientos de milisegundos a segundos). Así el nervio vago enlentece el corazón. El efecto lo decide el receptor, no el neurotransmisor.",
            ["Acetilcolina · muscarínico", "Metabotrópico (proteína G)", "Sale K⁺ (canal que abre la proteína G)", "Hiperpolarización lenta: inhibe"]),
      ]}

A16 = {"laminas": {}, "niveles": [S1, S2]}
CARRERA16 = [
    (1, "En Fonoaudiología: la audición depende de sinapsis muy rápidas entre las células ciliadas y el nervio auditivo (glutamato), y la deglución y el habla, de la placa motora (acetilcolina en receptores nicotínicos). Fármacos que actúan en la sinapsis, como la toxina botulínica en la disfonía espasmódica, cambian lo que evalúas."),
    (2, "En Terapia Ocupacional: la fuerza depende de la placa motora (acetilcolina en receptores nicotínicos) y de la sumación de impulsos en las motoneuronas. Muchos fármacos de tus usuarios actúan en la sinapsis (antiespásticos, antidepresivos, benzodiazepinas) y cambian su energía, su tono muscular y su desempeño."),
]
q = lambda t: t.replace("'", "''")
bloque16 = (
    "-- Actividad 16: LA SINAPSIS QUÍMICA (práctico 4) · «escenas» modo «casos» con el simulador propio js/sim-sinapsis.js\n"
    "-- I del potencial de acción a la liberación (Ca²⁺, sumación, recaptación); II el receptor decide (GABA, nicotínico, muscarínico)\n"
    "INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo, objetivo, mecanica, fuente) VALUES\n"
    "  (16, 10, 'sinapsis-quimica', 'La sinapsis química',\n"
    "       '" + q("Cómo se transmite la señal de una neurona a otra, con el simulador de NeuroLab. Nivel I: del potencial de acción a la liberación (Ca²⁺, vesículas, sumación y recaptación). Nivel II: el receptor decide el efecto (GABA, acetilcolina en receptores nicotínicos y muscarínicos).") + "',\n"
    "       'lamina', 1, '" + q("Explicar la secuencia de la transmisión sináptica química (potencial de acción, entrada de Ca²⁺, liberación, unión al receptor y término de la señal) y relacionar el tipo de receptor con el ion que pasa y el efecto en la neurona postsináptica.") + "',\n"
    "       '" + q("Usar el simulador de la sinapsis (potencial de acción, tren, canales de Ca²⁺, recaptación, neurotransmisor y receptor), mirar el registro postsináptico y responder en cada caso; completar dos cuadros.") + "',\n"
    "       '" + q("Apuntes del curso ETMP097 · Purves, Neurociencia · Kandel, Principios de neurociencia · simulador y esquemas de NeuroLab") + "');\n"
    "INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES\n"
    "  (16, 'tareas', '" + q(json.dumps(A16, ensure_ascii=False)) + "', NULL, 1);\n"
    "INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES\n"
    + ",\n".join(f"  (16, {cid}, '{q(t)}', {cid})" for cid, t in CARRERA16) + ";\n\n")
txt = SEED.read_text(encoding='utf-8')
m17 = txt.index("-- Actividad 17:")
if "-- Actividad 16: LA SINAPSIS" in txt:
    ini = txt.index("-- Actividad 16: LA SINAPSIS")
    txt = txt[:ini] + bloque16 + txt[m17:]
else:
    txt = txt[:m17] + bloque16 + txt[m17:]
SEED.write_text(txt, encoding='utf-8')
print('actividad 16:', [c['clave'] for n in A16['niveles'] for c in n['casos']])
