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
     "situacion": "Al final del día se le caen los párpados y ve doble. Si habla mucho rato la voz se le apaga, y le cuesta masticar al terminar de comer. Todo mejora después de descansar.",
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
N['casos'] += [c for c in NUEVOS if c['clave'] not in claves]
N['guia_pie'] = "Imágenes: Lanfear's Bane (CC BY-SA 3.0); Lucien Monfils (CC BY-SA 4.0)."
nuevo = json.dumps(d, ensure_ascii=False).replace("'", "''")
SEED.write_text(txt[:ini] + nuevo + txt[fin:], encoding='utf-8')
print('casos:', [c['clave'] for c in N['casos']])
