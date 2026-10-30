# Genera los bloques de las actividades 2 y 15 del seed (práctico 3) y los reemplaza en data/seed.sql.
# Uso (desde la raíz del repo): python3 docs/practico-3_build.py  → luego admin/seed.php
# El archivo crece por capas: las correcciones posteriores se agregan al final (antes del bucle `for N_ in (L1, A3, ...)`) y pisan lo anterior.
import json, os, re
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = json.load(open(os.path.join(RAIZ, 'docs/practico-3_coords.json')))
SIM_MC = {'url': 'https://phet.colorado.edu/sims/cheerpj/membrane-channels/latest/membrane-channels.html?simulation=membrane-channels&locale=es',
          't': 'PhET · Canales de membrana',
          'pie': 'Simulador «Membrane Channels», PhET Interactive Simulations, Universidad de Colorado Boulder (CC BY 4.0). Corre en Java dentro del navegador: la primera vez puede tardar en cargar.'}
SIM_N = {'url': 'https://phet.colorado.edu/sims/html/neuron/latest/neuron_all.html?locale=es',
         't': 'PhET · Neurona',
         'pie': 'Simulador «Neuron», PhET Interactive Simulations, Universidad de Colorado Boulder (CC BY 4.0).'}
VB = [1200, 750]
P = 'img/potencial/'
def el(p, ops, ok=0, pista=None, **kw):
    d = {'tipo': 'elegir', 'p': p, 'ops': ops, 'ok': ok}
    if pista: d['pista'] = pista
    d.update(kw); return d
def pred(p, ops, ok=0, **kw):
    d = {'tipo': 'predice', 'p': p, 'ops': ops, 'ok': ok}; d.update(kw); return d
def mira(p, lista=None, boton='Listo →', sim=True, **kw):
    d = {'tipo': 'mira', 'p': p, 'boton': boton, 'anim': False}
    if lista: d['lista'] = lista
    if sim: d['vista'] = 'sim'; d['nombre'] = 'Simulador'
    d.update(kw); return d
def toca(p, ok, pista=None):
    d = {'tipo': 'tocar', 'p': p, 'ok': ok}
    if pista: d['pista'] = pista
    return d
def num(p, rango, ok_t, nombre, pista, exp=None):
    d = {'tipo': 'numero', 'p': p, 'rango': rango, 'unidad': 'mV', 'ok_t': ok_t, 'nombre': nombre, 'pista': pista, 'vista': 'sim'}
    if exp: d['exp'] = exp
    return d
def fl(d, f, n=4, dur=2.4, t=0, **kw):
    x = {'d': d, 'f': f, 'n': n, 'dur': dur, 't': t}; x.update(kw); return x
def caer(f, pts, x0, y0, t=0):
    return {'d': f'M{x0} {y0}', 'f': f, 'n': len(pts), 'dur': 1.1, 't': t, 'rep': False, 'paso': .09, 'fin': [list(p) for p in pts]}
def rot(x, y, t, s=0, i=0, c=None):
    r = {'x': x, 'y': y, 't': t, 's': s}
    if i: r['i'] = 1
    if c: r['c'] = c
    return r

# =====================================================================================
# ACTIVIDAD 2 · CANALES DE MEMBRANA
# =====================================================================================
A1 = {'n': 1, 'tipo': 'escenas', 'modo': 'casos', 'titulo': 'La membrana en reposo', 'subtitulo': 'Dónde está cada ion y quién lo mantiene ahí',
  'fondo': P + 'membrana.svg', 'vb': VB, 'alt': 'Membrana plasmática entre el medio extracelular y el citoplasma', 'sim': SIM_MC,
  'guia_src': P + 'membrana-reposo.svg', 'guia_img': 'La membrana en reposo', 'guia_pie': 'Na⁺ (verde) afuera, K⁺ (azul) adentro, interior negativo y la bomba Na⁺/K⁺ que mantiene los gradientes.',
  'instrucciones': 'Seis casos en orden. <strong>Predice</strong> dónde está cada ion (una sola oportunidad) y mira la animación; luego arma la misma membrana en el <strong>simulador</strong> (pestañas <strong>🖼 Esquema · 🧪 Simulador</strong> arriba de la imagen) y responde. Si te equivocas en una pregunta, aparece una pista. <strong>Verde</strong>: bien a la primera. <strong>Rojo</strong>: por repasar.',
  'casos': [
    {'clave': 'antes', 'titulo': 'Antes de empezar', 'corto': 'Antes de empezar',
     'situacion': 'Las neuronas se comunican con señales eléctricas rápidas que viajan por su membrana.',
     'pasos': [el('¿Qué tres características de la neurona explican que pueda transmitir impulsos nerviosos?',
        ['Membrana excitable con canales iónicos, iones repartidos de forma desigual a ambos lados y prolongaciones que reciben (dendritas) y conducen (axón)',
         'Núcleo grande, muchas mitocondrias y capacidad de dividirse para reemplazar a las neuronas dañadas',
         'Membrana impermeable a todos los iones, citoplasma rico en Na⁺ y un axón sin ramificaciones',
         'Abundante retículo endoplásmico, vesículas con hormonas y contacto directo con los capilares'],
        pista='Una señal eléctrica necesita cargas separadas (iones), puertas para que se muevan y un camino por donde viajar.')],
     'exp': 'Excitabilidad (canales que se abren ante un estímulo), gradientes de iones a ambos lados de la membrana (los mantiene la bomba Na⁺/K⁺) y una forma polarizada: dendritas y soma reciben, el axón conduce. Las neuronas maduras no se dividen.'},
    {'clave': 'na', 'titulo': 'El sodio en reposo', 'corto': 'Na⁺',
     'situacion': 'Una neurona en reposo, sin estímulos. Los puntos verdes son iones sodio (Na⁺).',
     'pasos': [pred('¿Dónde hay más Na⁺?', ['En el medio extracelular (afuera)', 'En el citoplasma (adentro)', 'La misma cantidad a ambos lados'], 0)],
     'anim': {'flujos': [caer('na', C['NA_AF'], 600, -20), caer('na', C['NA_AD'], 600, 770, 1.3)],
              'rotulos': [rot(600, 250, '≈ 145 mM afuera', 1.4), rot(600, 600, '≈ 15 mM adentro', 1.8)]},
     'exp': 'En reposo hay unas 10 veces más Na⁺ afuera que adentro (≈ 145 frente a ≈ 15 mM). Esa diferencia es su gradiente de concentración: si se abre un canal, el Na⁺ tiende a entrar.'},
    {'clave': 'k', 'titulo': 'El potasio en reposo', 'corto': 'K⁺',
     'situacion': 'La misma neurona. Los puntos azules son iones potasio (K⁺).',
     'pasos': [pred('¿Dónde hay más K⁺?', ['En el medio extracelular (afuera)', 'En el citoplasma (adentro)', 'La misma cantidad a ambos lados'], 1)],
     'anim': {'flujos': [caer('na', C['NA_AF'], 600, -20), caer('na', C['NA_AD'], 600, 770),
                         caer('k', C['K_AD'], 600, 770, 1), caer('k', C['K_AF'], 600, -20, 2.2)],
              'rotulos': [rot(600, 600, '≈ 140 mM adentro', 2.4), rot(600, 250, '≈ 5 mM afuera', 2.8)]},
     'exp': 'El K⁺ es el catión principal del citoplasma: hay unas 30 veces más adentro que afuera. Su gradiente lo empuja a salir.'},
    {'clave': 'sim', 'titulo': 'Ahora en el simulador', 'corto': 'Simulador',
     'pasos': [mira('Arma esta membrana en reposo en el simulador:',
        ['Abre la pestaña 🧪 Simulador (la primera vez puede tardar en cargar).',
         'Agrega muchos Na⁺ (verdes) afuera y pocos adentro.',
         'Agrega muchos K⁺ (azules) adentro y pocos afuera.',
         'Marca «Mostrar concentraciones» y mira el gráfico de barras.',
         'Todavía no pongas canales en la membrana.'], 'Listo, ya la armé →'),
        el('Sin canales en la membrana, ¿los iones cruzan de un lado al otro?',
         ['No: la bicapa lipídica no deja pasar iones; cada uno se queda en su lado',
          'Sí: los iones son pequeños y atraviesan la bicapa sin ayuda',
          'Solo cruza el Na⁺, porque está más concentrado',
          'Cruzan todos hasta igualar las concentraciones'], pista='Mira el simulador un rato: ¿algún ion pasa la membrana?', vista='sim')],
     'exp': 'El interior de la bicapa es hidrofóbico: un ion con carga no lo atraviesa. Por eso la membrana necesita proteínas (canales y transportadores) para que los iones crucen.'},
    {'clave': 'potencial', 'titulo': 'El potencial de membrana', 'corto': 'Potencial', 'fondo_ok': P + 'membrana-reposo.svg',
     'pasos': [el('¿Qué es el potencial de membrana?',
        ['La diferencia de carga eléctrica (voltaje) entre el interior y el exterior de la membrana',
         'La cantidad de iones que cruzan la membrana en un segundo',
         'La concentración total de Na⁺ y K⁺ dentro de la célula',
         'La energía que gasta la bomba Na⁺/K⁺ en cada ciclo'], pista='Se mide en milivoltios (mV), como con un voltímetro con un electrodo adentro y otro afuera.', vista='esquema'),
        el('En reposo, ¿cómo está el interior respecto del exterior?',
         ['Negativo: cerca de −70 mV', 'Positivo: cerca de +70 mV', 'Neutro: 0 mV, porque las cargas se compensan', 'Negativo solo cuando la neurona está activa'],
         pista='En reposo la membrana deja salir sobre todo K⁺ (carga positiva) por sus canales de fuga: ¿qué carga queda adentro?')],
     'exp': 'El potencial de reposo (≈ −70 mV) nace de los gradientes y de que, en reposo, la membrana deja pasar sobre todo K⁺ por canales de fuga: al salir K⁺ con su carga positiva, el interior queda negativo.'},
    {'clave': 'bomba', 'titulo': 'Quién mantiene las diferencias', 'corto': 'Bomba Na⁺/K⁺', 'fondo_ok': P + 'membrana-reposo.svg',
     'pasos': [el('¿Qué mantiene en el tiempo estas diferencias de concentración?',
        ['La bomba Na⁺/K⁺ ATPasa, que gasta ATP para sacar Na⁺ y meter K⁺',
         'Los canales de fuga, que devuelven cada ion a su lado',
         'La mielina, que impide que los iones se mezclen',
         'La difusión, que siempre lleva los iones hacia donde hay más'], pista='Mover iones en contra de su gradiente cuesta energía.'),
        el('¿Cuántos iones mueve la bomba en cada ciclo?', ['Saca 3 Na⁺ y mete 2 K⁺', 'Saca 2 Na⁺ y mete 3 K⁺', 'Saca 1 Na⁺ y mete 1 K⁺', 'Mete 3 Na⁺ y saca 2 K⁺'],
         pista='Saca más cargas positivas de las que mete.')],
     'anim': {'flujos': [fl('M1000 470 L1000 280', 'na', 3, 2.4), fl('M1000 280 L1000 470', 'k', 2, 2.4, 1.2)],
              'efectos': [{'e': [1000, 375, 70, 80], 'c': 'rgba(139,92,246,.25)', 's': '#6D28D9', 'a': 'pulso'}],
              'rotulos': [rot(1060, 520, 'ATP → ADP', .5)]},
     'exp': 'La bomba Na⁺/K⁺ ATPasa trabaja en contra de los gradientes y gasta gran parte del ATP del encéfalo. Como saca 3 cargas positivas y mete 2, aporta un poco al interior negativo. El simulador no la incluye: por eso, si dejas canales abiertos, los gradientes se pierden.'},
  ]}

CUADRO_C = ['Canal', '¿Dónde hay más de este ion en reposo?', '¿A favor o en contra del gradiente?', '¿Hacia dónde fluye?', 'Efecto sobre el potencial']
A2 = {'n': 2, 'tipo': 'escenas', 'modo': 'casos', 'titulo': 'Abre los canales', 'subtitulo': 'Na⁺ y K⁺: hacia dónde fluyen y qué le hacen al potencial',
  'fondo': P + 'canales.svg', 'vb': VB, 'alt': 'Membrana en reposo con un canal de Na⁺ y uno de K⁺ cerrados', 'sim': SIM_MC, 'cuadro': CUADRO_C,
  'guia_src': P + 'canal-na-abierto.svg', 'guia_img': 'Canal de Na⁺ abierto', 'guia_pie': 'Al abrirse, el Na⁺ entra a favor de su gradiente y despolariza; el K⁺ sale y repolariza.',
  'instrucciones': 'Abre en el <strong>simulador</strong> primero los canales de Na⁺ y después los de K⁺. Antes de abrir cada uno, <strong>predice</strong> hacia dónde irán los iones (una sola oportunidad); después de mirar, responde. Cada canal llena una fila del <strong>cuadro comparativo</strong>.',
  'casos': [
    {'clave': 'na', 'titulo': 'Canal de Na⁺', 'corto': 'Canal de Na⁺', 'fondo_ok': P + 'canal-na-abierto.svg',
     'pasos': [
        el('Antes de abrir nada: ¿dónde hay más Na⁺ en reposo?', ['En el medio extracelular', 'En el citoplasma'], 0, pista='Recuerda el nivel I.'),
        mira('En el simulador:', ['Deja la membrana en reposo como en el nivel I (mucho Na⁺ afuera, mucho K⁺ adentro).',
                                  'Pon varios canales controlados de Na⁺ en la membrana y déjalos cerrados.'], 'Listo →'),
        pred('Si abres los canales de Na⁺, ¿hacia dónde se moverá el Na⁺?', ['Hacia adentro (al citoplasma)', 'Hacia afuera (al medio extracelular)', 'No se moverá', 'Igual hacia ambos lados'], 0),
        mira('Ahora ábrelos unos 10 segundos y observa el flujo de iones y el gráfico de concentraciones.', boton='Ya lo vi →'),
        el('¿El Na⁺ se movió a favor o en contra de su gradiente de concentración?',
           ['A favor: de donde hay más a donde hay menos', 'En contra: de donde hay menos a donde hay más', 'Ninguno: un canal abierto no tiene dirección'], 0,
           pista='Fíjate de qué lado había más Na⁺ antes de abrir.'),
        el('Si entra Na⁺ (carga +) a una neurona en reposo (−70 mV), ¿qué le pasa al potencial de membrana?',
           ['Se vuelve menos negativo: se despolariza', 'Se vuelve más negativo: se hiperpolariza', 'No cambia: el Na⁺ no tiene carga', 'Se vuelve más negativo, porque queda menos Na⁺ afuera'], 0,
           pista='Entran cargas positivas a un interior negativo.', vista='esquema')],
     'fila': ['Extracelular', 'A favor del gradiente', 'Hacia el intracelular (entra)', 'Despolarización'],
     'anim': {'flujos': [fl('M400 200 L400 360 L400 600', 'na', 6, 2.6)], 'rotulos': [rot(460, 560, 'Na⁺ entra', .4)]},
     'exp': 'Al abrirse el canal, el Na⁺ entra por difusión: a favor de su gradiente químico y atraído por el interior negativo. Esa entrada de cargas positivas despolariza la membrana: es el motor de la subida del potencial de acción.'},
    {'clave': 'k', 'titulo': 'Canal de K⁺', 'corto': 'Canal de K⁺', 'fondo_ok': P + 'canal-k-abierto.svg',
     'pasos': [
        el('¿Dónde hay más K⁺ en reposo?', ['En el citoplasma', 'En el medio extracelular'], 0, pista='Recuerda el nivel I.'),
        mira('En el simulador:', ['Saca los canales de Na⁺ (o reinicia y vuelve a armar la membrana en reposo).',
                                  'Pon varios canales controlados de K⁺ en la membrana y déjalos cerrados.'], 'Listo →'),
        pred('Si abres los canales de K⁺, ¿hacia dónde se moverá el K⁺?', ['Hacia adentro (al citoplasma)', 'Hacia afuera (al medio extracelular)', 'No se moverá', 'Igual hacia ambos lados'], 1),
        mira('Ábrelos unos 10 segundos y observa el flujo y el gráfico de concentraciones.', boton='Ya lo vi →'),
        el('¿El K⁺ se movió a favor o en contra de su gradiente?',
           ['A favor: de donde hay más a donde hay menos', 'En contra: de donde hay menos a donde hay más', 'Ninguno: un canal abierto no tiene dirección'], 0,
           pista='¿De qué lado había más K⁺?'),
        el('Si sale K⁺ (carga +) de la neurona, ¿qué le pasa al potencial de membrana?',
           ['Se vuelve más negativo: se hiperpolariza (o vuelve hacia el reposo)', 'Se vuelve menos negativo: se despolariza', 'No cambia: el K⁺ ya estaba adentro', 'Se vuelve positivo, porque entra K⁺'], 0,
           pista='Salen cargas positivas del interior.', vista='esquema')],
     'fila': ['Intracelular', 'A favor del gradiente', 'Hacia el extracelular (sale)', 'Repolarización e hiperpolarización'],
     'anim': {'flujos': [fl('M800 600 L800 400 L800 200', 'k', 6, 2.6)], 'rotulos': [rot(860, 240, 'K⁺ sale', .4)]},
     'exp': 'El K⁺ sale a favor de su gradiente; al perder cargas positivas, el interior se vuelve más negativo. En el potencial de acción, esta salida repolariza la membrana y, si se prolonga, la hiperpolariza.'},
    {'clave': 'tiempo', 'titulo': 'Si los dejas abiertos', 'corto': 'Mucho rato abiertos',
     'pasos': [
        el('Deja los canales abiertos un buen rato en el simulador. ¿Qué pasa con las concentraciones?',
           ['Se van igualando a ambos lados, hasta que el flujo neto se detiene', 'Se invierten: queda más Na⁺ adentro que afuera', 'No cambian: los iones van y vuelven por el mismo canal', 'Aumentan a ambos lados'], 0,
           pista='Mira el gráfico de concentraciones después de un rato.', vista='sim'),
        el('En una neurona real esto no pasa. ¿Por qué?',
           ['Los canales se abren solo por milisegundos y la bomba Na⁺/K⁺ repone los gradientes', 'Los canales de una neurona real nunca se abren', 'La mielina tapa los canales después de cada impulso', 'El Na⁺ que entra se transforma en K⁺ dentro de la célula'], 0,
           pista='Recuerda el último caso del nivel I.')],
     'exp': 'Por difusión, el flujo neto sigue hasta que se igualan las concentraciones. En una neurona, cada potencial de acción mueve muy pocos iones durante muy poco tiempo, y la bomba Na⁺/K⁺ restablece los gradientes.'},
  ]}


def simp(p, checks, pista=None, boton=None, q=None):
    d = {'tipo': 'sim', 'p': p, 'checks': [{'t': a, 'c': b} for a, b in checks]}
    if pista: d['pista'] = pista
    if boton: d['boton'] = boton
    if q: d['q'] = q
    return d
def qq(p, ops, ok=0, pista=None):
    d = {'p': p, 'ops': ops, 'ok': ok}
    if pista: d['pista'] = pista
    return d
L1 = {'n': 1, 'tipo': 'escenas', 'modo': 'casos', 'simulador': 'membrana', 'reposo_tras': 'potencial',
  'titulo': 'Reposo y canales', 'subtitulo': 'Arma la membrana, mide su potencial y abre canales',
  'fondo': P + 'membrana-reposo.svg', 'vb': VB, 'cuadro': CUADRO_C,
  'guia_src': P + 'membrana-reposo.svg', 'guia_img': 'La membrana en reposo', 'guia_pie': 'Na⁺ (verde) afuera, K⁺ (azul) adentro, interior negativo y la bomba Na⁺/K⁺ que mantiene los gradientes.',
  'instrucciones': 'Trabajas en el <strong>simulador de la membrana</strong>: elige un ion y toca afuera o adentro para agregarlo; en las tarjetas pon canales, abre sus compuertas y enciende o apaga la bomba. En los pasos 🧪 la lista se marca sola cuando lo logras y, al completarla, se habilita la pregunta. <strong>Predice</strong> antes de probar (una sola oportunidad). Cada canal llena una fila del <strong>cuadro comparativo</strong>. Cada ion dibujado representa 5 mM; en una célula real son miles de millones de iones.',
  'casos': [
    {'clave': 'reposo', 'titulo': 'Arma la membrana en reposo', 'corto': 'Reposo',
     'situacion': 'Una neurona sin estímulos. Los iones sodio (Na⁺) son verdes y los de potasio (K⁺), azules.',
     'pasos': [pred('En una neurona en reposo, ¿dónde hay más de cada ion?', ['Na⁺ afuera y K⁺ adentro', 'Na⁺ adentro y K⁺ afuera', 'Los dos afuera', 'Los dos adentro'], 0),
        simp('Arma estas concentraciones (cada toque agrega 25 mM):', [('Na⁺ afuera: 150 mM', 'na150'), ('Na⁺ adentro: 25 mM', 'na25'), ('K⁺ adentro: 150 mM', 'k150'), ('K⁺ afuera: casi nada (≈ 5 mM, menos que un toque)', 'k0')],
             'Elige el ion (verde Na⁺, azul K⁺) y toca afuera o adentro de la membrana. Si te pasas, «Vaciar» borra todo.',
             q=qq('Mira los iones un momento. Estas diferencias de concentración se llaman gradientes: ¿por qué permiten que la neurona transmita impulsos?',
                  ['Son energía guardada: cuando se abre un canal, los iones fluyen a favor de su gradiente y generan una corriente', 'Hacen que la membrana sea impermeable a todo', 'Permiten que la neurona se divida', 'Llevan nutrientes por el axón'], 0,
                  'Piensa en una represa: el agua acumulada a un lado.'))],
     'exp': 'En reposo hay ≈ 10 veces más Na⁺ afuera (≈ 145 frente a ≈ 15 mM) y ≈ 30 veces más K⁺ adentro (≈ 140 frente a ≈ 5 mM); en el simulador los redondeamos. La bicapa lipídica no deja pasar iones: solo cruzan por canales y transportadores. Los gradientes son energía guardada, la primera característica que hace posible la señal eléctrica.'},
    {'clave': 'potencial', 'titulo': 'El potencial de membrana', 'corto': 'Potencial',
     'situacion': 'El voltímetro mide la diferencia de carga (voltaje) entre los dos lados de la membrana: un electrodo afuera y otro adentro, pegados a ella. Mira los dos canales de fuga: están siempre abiertos y solo dejan pasar K⁺.',
     'pasos': [simp('Observa la membrana en reposo:', [('Gradientes de reposo armados', 'naAfuera'), ('K⁺ mayoritario adentro', 'kAdentro'), ('Voltímetro bajo −60 mV', 'vNeg')],
             'Si ves algún K⁺ cruzar, fíjate por dónde pasa y hacia dónde va.',
             q=qq('¿Por qué el interior queda negativo (≈ −70 mV)?', ['Por los canales de fuga sale K⁺ (carga +) a favor de su gradiente, y el interior queda con menos cargas positivas', 'Entra Cl⁻ desde afuera', 'La bicapa fabrica cargas negativas', 'Entra Na⁺ y se vuelve negativo'], 0,
                  '¿Qué ion cruza por los canales de fuga y hacia dónde?'))],
     'exp': 'El potencial de membrana es la diferencia de voltaje entre el interior y el exterior. En reposo (≈ −70 mV) se debe a los canales de fuga de K⁺: sale K⁺ con su carga positiva y el interior queda negativo. Basta que crucen muy pocos iones, justo en la membrana: por eso el potencial es local. Desde ahora tienes el botón «Armar reposo».'},
    {'clave': 'na', 'titulo': 'Canal de Na⁺', 'corto': 'Canal de Na⁺',
     'pasos': [pred('Si pones un canal de Na⁺ y abres su compuerta, ¿qué pasará con el voltímetro?', ['Subirá: entra Na⁺ y el interior se vuelve menos negativo (despolarización)', 'Bajará: sale Na⁺ y el interior se vuelve más negativo', 'No cambiará', 'Bajará a −90 mV'], 0),
        simp('Pruébalo:', [('Un canal de Na⁺ en la membrana', 'compNa'), ('Compuerta de Na⁺ abierta', 'abiertoNa'), ('El voltímetro sube sobre −30 mV', 'vDespol')],
             'Agrega el canal en su tarjeta (izquierda) y activa su compuerta. Si las barras ya no muestran el reposo, presiona «Armar reposo».',
             q=qq('Cambiaste el voltaje con solo abrir un canal: entró Na⁺ a favor de su gradiente. ¿Qué característica de la neurona muestra esto?', ['Su membrana es excitable: tiene canales que, al abrirse, cambian el potencial', 'Su membrana es impermeable a los iones', 'Su núcleo controla el voltaje', 'Su citoplasma fabrica Na⁺'], 0,
                  'Es la segunda característica que hace posible el impulso nervioso.'))],
     'fila': ['Extracelular', 'A favor del gradiente', 'Hacia el intracelular (entra)', 'Despolarización'],
     'exp': 'Al abrirse el canal, el Na⁺ entra a favor de su gradiente y atraído por el interior negativo. La entrada de cargas positivas despolariza: es el motor de la subida del potencial de acción. Una membrana con canales que cambian el potencial es una membrana excitable.'},
    {'clave': 'k', 'titulo': 'Canal de K⁺', 'corto': 'Canal de K⁺',
     'pasos': [pred('Si cierras el Na⁺, pones un canal de K⁺ y abres su compuerta, ¿qué pasará con el voltímetro?', ['Bajará: sale más K⁺ y el interior se vuelve más negativo (hiperpolarización)', 'Subirá: entra K⁺ (despolarización)', 'No cambiará', 'Subirá a +40 mV'], 0),
        simp('Pruébalo:', [('Compuerta de Na⁺ cerrada', 'cerradoNa'), ('Un canal de K⁺ en la membrana', 'compK'), ('Compuerta de K⁺ abierta', 'abiertoK'), ('El voltímetro baja de −75 mV', 'vHiper')],
             'Si no baja, presiona «Armar reposo» y vuelve a abrir la compuerta de K⁺.',
             q=qq('¿El K⁺ se movió a favor o en contra de su gradiente?', ['A favor: de donde hay más (adentro) a donde hay menos (afuera)', 'En contra: de donde hay menos a donde hay más', 'Ninguno: un canal abierto no tiene dirección'], 0, 'Mira las barras de K⁺.'))],
     'fila': ['Intracelular', 'A favor del gradiente', 'Hacia el extracelular (sale)', 'Repolarización e hiperpolarización'],
     'exp': 'Con la compuerta abierta sale mucho más K⁺ que por la fuga: el interior se vuelve más negativo que en reposo. En el potencial de acción, esta salida repolariza la membrana y, si se prolonga, la hiperpolariza.'},
    {'clave': 'bomba', 'titulo': 'Quién mantiene los gradientes', 'corto': 'Bomba Na⁺/K⁺',
     'pasos': [pred('Si apagas la bomba y dejas abierta la compuerta de Na⁺, ¿qué pasará con el Na⁺?', ['Seguirá entrando hasta que las concentraciones se parezcan a ambos lados', 'Nada: los gradientes son permanentes', 'Saldrá todo el Na⁺ de la célula', 'Entrará un poco y volverá a salir solo'], 0),
        simp('Pruébalo y mira las barras de Na⁺:', [('Bomba apagada', 'bombaOff'), ('Compuerta de Na⁺ abierta', 'abiertoNa'), ('Na⁺ adentro sube a 60 mM o más', 'naIgual')], 'Puede tardar unos 15 segundos.',
             q=qq('¿Qué hace la bomba Na⁺/K⁺ que apagaste?', ['Gasta ATP para sacar 3 Na⁺ y meter 2 K⁺, en contra de sus gradientes', 'Deja pasar Na⁺ y K⁺ a favor de sus gradientes', 'Saca 2 Na⁺ y mete 3 K⁺ sin gastar energía', 'Abre las compuertas de los canales'], 0,
                  'Mover iones en contra de su gradiente cuesta energía.')),
        simp('Ahora cierra la compuerta, enciende la bomba y espera:', [('Compuerta de Na⁺ cerrada', 'cerradoNa'), ('Bomba encendida', 'bombaOn'), ('El potencial vuelve bajo −60 mV', 'vNeg')], 'La bomba saca el Na⁺ poco a poco.',
             q=qq('En una neurona real los gradientes no se pierden con cada impulso. ¿Por qué?', ['Los canales se abren solo por milisegundos y la bomba repone continuamente lo que entra y sale', 'Los canales de una neurona real nunca se abren', 'La mielina tapa los canales después de cada impulso', 'El Na⁺ que entra se transforma en K⁺'], 0,
                  'Compara cuánto tiempo dejaste abierta la compuerta aquí.'))],
     'exp': 'Si los canales quedan abiertos, el flujo sigue hasta igualar las concentraciones y el potencial se pierde. La bomba Na⁺/K⁺ ATPasa gasta ATP para sacar 3 Na⁺ y meter 2 K⁺ y mantiene los gradientes; en la neurona, cada impulso mueve muy pocos iones durante muy poco tiempo.'},
  ]}

# Nivel III · neurona: zonas
Z3 = {'piel': {'e': [160, 420, 90, 110], 'nombre': 'la terminación sensitiva de la piel'},
      'sinapsis': {'e': [582, 430, 42, 40], 'nombre': 'la sinapsis sobre la dendrita'},
      'zoom': {'e': [560, 625, 102, 102], 'nombre': 'el aumento de la sinapsis'},
      'dendrita': {'l': [[[610, 430], [725, 430]]], 'w': 20, 'nombre': 'la dendrita'},
      'inhib': {'e': [784, 354, 30, 26], 'nombre': 'la sinapsis del axón inhibitorio'},
      'cono': {'e': [912, 430, 40, 32], 'nombre': 'el cono axónico'},
      'soma': {'e': [800, 450, 80, 60], 'nombre': 'el soma de la segunda neurona'},
      'somas': {'e': [360, 225, 52, 52], 'nombre': 'el soma de la neurona sensitiva (en el ganglio)'},
      'nodo': {'l': [[[x, 408], [x, 452]] for x, _ in C['NODOS']], 'w': 22, 'nombre': 'un nodo de Ranvier'},
      'mielina': {'r': [980, 405, 220, 50], 'nombre': 'la vaina de mielina'},
      'axs': {'r': [240, 414, 320, 32], 'nombre': 'el axón de la neurona sensitiva'}}
A3 = {'n': 2, 'tipo': 'escenas', 'modo': 'casos', 'titulo': '¿Qué abre los canales?', 'subtitulo': 'Estímulos, lugares y tipos de canal',
  'fondo': P + 'neurona-canales.svg', 'vb': VB, 'alt': 'Neurona sensitiva en la piel que hace sinapsis con una segunda neurona', 'donde': 'la neurona', 'zonas': Z3,
  'cuadro': ['Caso', 'Estímulo', 'Dónde', 'Qué abre el canal', 'Efecto'],
  'nombres': [rot(150, 330, 'Terminación nerviosa libre'), rot(406, 225, 'Soma sensitivo'), rot(360, 470, 'Axón sensitivo'), rot(588, 392, 'Botón presináptico', i=1),
              rot(660, 470, 'Dendrita'), rot(820, 520, 'Soma'), rot(800, 340, 'Sinapsis inhibitoria'), rot(930, 470, 'Cono axónico'),
              rot(1070, 480, 'Nodo de Ranvier', i=1), rot(664, 700, 'Sinapsis (aumento)')],
  'guia_img': 'Dónde y por qué se abren los canales', 'guia_pie': 'Mecánicos en la piel, por ligando en las sinapsis y por voltaje en el cono axónico y los nodos de Ranvier.',
  'instrucciones': 'En la vida real nadie abre los canales con un botón: los abren estímulos distintos en lugares distintos. En cada caso <strong>toca en la neurona</strong> dónde se abren los canales y responde qué los abre y qué efecto tienen. Con «Nombres» ves cada estructura. Cada caso llena una fila del <strong>cuadro</strong>.',
  'casos': [
    {'clave': 'tacto', 'titulo': 'Una presión en la piel', 'corto': 'Presión',
     'situacion': 'Alguien te toca la yema del dedo. La neurona sensitiva tiene canales que se abren cuando su membrana se deforma.',
     'pasos': [toca('¿Dónde se abren esos canales?', ['piel'], 'Busca la parte de la neurona sensitiva que está dentro de la piel.'),
        el('¿Qué tipo de estímulo abre estos canales?', ['Mecánico: la presión estira la membrana y abre el canal', 'Químico: un neurotransmisor se une al canal', 'Eléctrico: un cambio de voltaje abre el canal', 'Térmico: el calor de la mano abre el canal'], 0,
           pista='¿Qué le hace el toque a la membrana?'),
        el('¿Qué genera la entrada de Na⁺ en ese lugar?', ['Un potencial local (receptor) que crece con la presión', 'Un potencial de acción inmediato y siempre del mismo tamaño', 'Una hiperpolarización que inhibe a la neurona', 'Nada: el Na⁺ no puede entrar en la piel'], 0,
           pista='Un toque suave y uno fuerte no producen la misma respuesta.')],
     'fila': ['Tacto (presión)', 'Terminación sensitiva en la piel', 'Deformación de la membrana (mecánico)', 'Potencial receptor (despolariza)'],
     'anim': {'efectos': [{'e': [150, 420, 80, 95], 'c': 'rgba(245,158,11,.28)', 's': '#F59E0B', 'a': 'pulso'}],
              'flujos': [fl('M90 330 L140 390', 'na', 3, 1.8), fl('M70 520 L115 480', 'na', 3, 1.8, .6)],
              'rotulos': [rot(120, 560, 'Entra Na⁺: potencial receptor', .8)]},
     'exp': 'Los mecanorreceptores tienen canales que se abren al deformarse la membrana (canales mecanosensibles, como PIEZO2). La entrada de cationes produce un potencial receptor graduado: más presión, más despolarización. Otros estímulos que abren canales en terminaciones sensitivas: calor y frío (canales TRP), luz (fotorreceptores) y sonido (células ciliadas).'},
    {'clave': 'glu', 'titulo': 'Glutamato en la sinapsis', 'corto': 'Glutamato',
     'situacion': 'La neurona sensitiva libera glutamato sobre una dendrita de la neurona siguiente.',
     'pasos': [toca('¿Dónde se abren los canales que responden al glutamato?', ['sinapsis', 'zoom', 'dendrita'], 'Busca el botón donde termina el axón sensitivo y lo que toca (o su aumento).'),
        el('¿Qué abre estos canales?', ['Un ligando: el glutamato se une al receptor, que es el mismo canal', 'Un cambio de voltaje en la dendrita', 'La presión del botón sobre la dendrita', 'El ATP que llega junto al neurotransmisor'], 0,
           pista='La señal que cruza la sinapsis es química.'),
        el('¿Qué efecto tiene sobre la neurona que lo recibe?', ['Entra Na⁺ y la despolariza: potencial postsináptico excitatorio (PPSE)', 'Entra Cl⁻ y la hiperpolariza: potencial postsináptico inhibitorio', 'Sale K⁺ y dispara de inmediato un potencial de acción', 'Ninguno hasta que la señal llega al axón'], 0,
           pista='El glutamato es el principal neurotransmisor excitatorio.')],
     'fila': ['Neurotransmisor excitatorio', 'Sinapsis sobre la dendrita', 'Neurotransmisor (ligando)', 'PPSE (despolariza)'],
     'anim': {'flujos': [fl('M540 600 L578 610', 'nt', 5, 1.2), fl('M560 560 L600 590', 'na', 3, 1.6, .6)],
              'efectos': [{'e': [582, 430, 34, 30], 'c': 'rgba(34,197,94,.3)', 's': '#16A34A', 'a': 'pulso', 't': .4}],
              'rotulos': [rot(640, 520, 'PPSE', 1)]},
     'exp': 'Los receptores ionotrópicos de glutamato (como AMPA) son canales que se abren cuando el neurotransmisor se une a ellos: canales controlados por ligando. Dejan entrar Na⁺ y producen un PPSE, un potencial local que se suma con otros.'},
    {'clave': 'gaba', 'titulo': 'GABA sobre el soma', 'corto': 'GABA',
     'situacion': 'Una interneurona inhibitoria libera GABA sobre el soma de la misma neurona. El receptor de GABA también es un canal.',
     'pasos': [toca('¿Dónde actúa el GABA?', ['inhib'], 'Busca el botón del axón que llega desde arriba.'),
        el('¿Qué ion entra y qué efecto tiene?', ['Entra Cl⁻ y el interior se vuelve más negativo: hiperpolariza (PPSI)', 'Entra Na⁺ y despolariza: PPSE', 'Sale Cl⁻ y despolariza', 'Entra Ca²⁺ y dispara un potencial de acción'], 0,
           pista='El GABA es el principal neurotransmisor inhibitorio.'),
        el('¿Para qué sirve esta inhibición?', ['Aleja al soma del umbral: hace menos probable que la neurona dispare', 'Acelera la conducción por el axón', 'Recarga los gradientes de Na⁺ y K⁺', 'Abre los canales de Na⁺ del axón'], 0,
           pista='Un interior más negativo queda más lejos de −55 mV.')],
     'fila': ['Neurotransmisor inhibitorio', 'Sinapsis sobre el soma', 'Neurotransmisor (ligando)', 'PPSI (hiperpolariza)'],
     'anim': {'flujos': [fl('M784 330 L800 400', 'cl', 4, 1.6)], 'efectos': [{'e': [784, 354, 30, 26], 'c': 'rgba(236,72,153,.3)', 's': '#BE185D', 'a': 'pulso'}],
              'rotulos': [rot(820, 300, 'Entra Cl⁻: PPSI', .6)]},
     'exp': 'El receptor GABA-A es un canal de Cl⁻ controlado por ligando. La entrada de Cl⁻ hiperpolariza (PPSI) y resta a los PPSE: así la neurona integra excitación e inhibición antes de decidir si dispara.'},
    {'clave': 'cono', 'titulo': 'Nace el potencial de acción', 'corto': 'Cono axónico',
     'situacion': 'Los potenciales locales de dendritas y soma se suman y la despolarización llega a la zona gatillo.',
     'pasos': [toca('¿Dónde está la zona gatillo, con muchos canales de Na⁺ controlados por voltaje?', ['cono'], 'Está entre el soma y el comienzo del axón.'),
        el('¿Qué abre estos canales de Na⁺?', ['Un cambio de voltaje: se abren cuando la membrana llega al umbral (≈ −55 mV)', 'El glutamato que llega desde la dendrita', 'La presión del soma sobre el axón', 'La bomba Na⁺/K⁺ cuando se queda sin ATP'], 0,
           pista='Aquí no hay sinapsis ni piel: lo único que llega es la despolarización.')],
     'fila': ['Suma de potenciales locales', 'Cono axónico (zona gatillo)', 'Voltaje (umbral)', 'Potencial de acción'],
     'anim': {'efectos': [{'e': [912, 430, 36, 30], 'c': 'rgba(124,58,237,.35)', 's': '#6D28D9', 'a': 'pulso'}],
              'flujos': [fl('M912 370 L912 430', 'na', 4, 1.4)], 'rotulos': [rot(930, 520, 'Umbral → potencial de acción', .5)]},
     'exp': 'En el cono axónico (segmento inicial) está la mayor densidad de canales de Na⁺ controlados por voltaje: por eso ahí se alcanza primero el umbral y nace el potencial de acción.'},
    {'clave': 'nodo', 'titulo': 'El impulso viaja por el axón', 'corto': 'Nodos',
     'situacion': 'El potencial de acción avanza por el axón mielinizado hacia el siguiente botón terminal.',
     'pasos': [toca('¿Dónde se abren los canales de Na⁺ a lo largo de un axón mielinizado?', ['nodo'], 'La mielina aísla; los canales quedan en los espacios entre vainas.'),
        el('¿Qué los abre?', ['La despolarización que llega desde el nodo anterior (voltaje)', 'El neurotransmisor que viaja dentro del axón', 'La presión de la vaina de mielina', 'Un estímulo nuevo en la piel para cada nodo'], 0,
           pista='Es el mismo tipo de canal que en el cono axónico.'),
        el('Recorriste la neurona de la dendrita al axón. ¿Qué característica de su forma muestra esto?', ['Es polarizada: dendritas y soma reciben e integran, el axón conduce y entrega la señal', 'Todas sus prolongaciones reciben y conducen por igual', 'El axón recibe y las dendritas conducen', 'La información viaja del axón hacia las dendritas'], 0,
           pista='¿Por dónde entró la información y por dónde salió?')],
     'fila': ['Potencial de acción que avanza', 'Nodos de Ranvier', 'Voltaje', 'Conducción saltatoria'],
     'anim': {'efectos': [{'e': [x, 430, 22, 28], 'c': 'rgba(124,58,237,.4)', 's': '#6D28D9', 'a': 'pulso', 't': i * .5} for i, (x, _) in enumerate(C['NODOS'])],
              'rotulos': [rot(1150, 370, 'Salta de nodo en nodo', 1.2, i=1)]},
     'exp': 'Bajo la mielina casi no hay canales; se concentran en los nodos de Ranvier. Dendritas y soma reciben, el cono axónico decide y el axón conduce: es la tercera característica que permite transmitir impulsos. La despolarización de un nodo abre los canales del siguiente (conducción saltatoria): el impulso avanza más rápido y con menos gasto.'},
    {'clave': 'cierre', 'titulo': 'Para cerrar', 'corto': 'Cierre',
     'pasos': [el('Juntando todo el práctico: ¿qué tres características de la neurona explican que pueda transmitir impulsos nerviosos?', ['Gradientes de iones a ambos lados de la membrana, membrana excitable con canales y una forma polarizada que recibe y conduce', 'Núcleo grande, muchas mitocondrias y capacidad de dividirse', 'Membrana impermeable a todos los iones, citoplasma rico en Na⁺ y un axón sin ramificaciones', 'Abundante retículo endoplásmico, vesículas con hormonas y contacto con capilares'], 0,
           pista='Una la viste al armar el reposo, otra al abrir un canal y otra al recorrer la neurona.'),
        el('Un toque en la piel termina en un potencial de acción en el axón de la segunda neurona. ¿En qué orden se abren los canales?', ['Mecánicos en la piel → por ligando (glutamato) en la dendrita → por voltaje en el cono axónico y los nodos', 'Por voltaje en la piel → mecánicos en la dendrita → por ligando en el axón', 'Por ligando en la piel → por voltaje en la dendrita → mecánicos en el axón', 'Todos se abren al mismo tiempo'], 0,
           pista='Sigue el camino de la información desde la piel.')],
     'exp': 'Gradientes (energía guardada), membrana excitable (canales que cambian el potencial) y forma polarizada (recibe en dendritas y soma, conduce por el axón). Cada estímulo abre su tipo de canal donde corresponde: mecánico, por ligando y por voltaje.'},
  ]}

# =====================================================================================
# ACTIVIDAD 15 · EL POTENCIAL DE ACCIÓN
# =====================================================================================
S = C['SUMAS']
def traza(pts, col, t=0, dur=3, w=7):
    return {'l': [pts], 'w': w, 'c': col, 'a': 'traza', 't': t, 'dur': dur}
YS = C['YS']
B1 = {'n': 1, 'tipo': 'escenas', 'modo': 'casos', 'titulo': 'Del potencial local al potencial de acción', 'subtitulo': 'Estímulos, sumación y umbral',
  'fondo': P + 'ejes-sumacion.svg', 'vb': VB, 'alt': 'Gráfico del potencial de membrana en el cono axónico, con el reposo y el umbral marcados',
  'cuadro': ['Estímulo', '¿Llega al umbral?', 'Resultado'],
  'guia_src': P + 'sumacion-guia.svg', 'guia_img': 'Potenciales locales y sumación', 'guia_pie': 'Solo la suma que alcanza el umbral (−55 mV) dispara un potencial de acción.',
  'instrucciones': 'Registras el potencial en el <strong>cono axónico</strong> de una neurona. En cada caso llega un estímulo distinto: <strong>predice</strong> qué pasará (una sola oportunidad) y mira la curva que se dibuja. Al final compara el potencial local con el de acción.',
  'casos': [
    {'clave': 'debil', 'titulo': 'Un estímulo débil', 'corto': 'Débil',
     'situacion': 'Una sinapsis excitatoria libera poco neurotransmisor sobre una dendrita (en el segundo 3 del registro).',
     'pasos': [pred('¿Qué pasará con el potencial en el cono axónico?', ['Sube unos pocos mV y vuelve al reposo sin llegar al umbral', 'Dispara un potencial de acción pequeño', 'Baja y se queda más negativo', 'No cambia nada'], 0)],
     'fila': ['No', 'Potencial local que se apaga'],
     'anim': {'efectos': [traza(S['debil'], '#64748B')], 'rotulos': [rot(300, 640, 'Estímulo', 1.2), rot(360, 540, 'PPSE', 1.6)]},
     'exp': 'Es un potencial local (PPSE): graduado, decrece con la distancia y con el tiempo. Si no alcanza el umbral en el cono axónico, no hay potencial de acción.'},
    {'clave': 'fuerte', 'titulo': 'Un estímulo más fuerte', 'corto': 'Más fuerte',
     'situacion': 'Ahora la sinapsis libera mucho más neurotransmisor.',
     'pasos': [pred('¿Cómo será la respuesta, comparada con la anterior?', ['Más grande: el potencial local crece con el estímulo', 'Igual: los potenciales locales siempre miden lo mismo', 'Un potencial de acción el doble de grande', 'Más pequeña, porque la neurona se cansa'], 0),
        el('¿Llegó al umbral?', ['No: subió más, pero quedó bajo −55 mV', 'Sí: cualquier estímulo más fuerte lo alcanza'], 0, pista='Compara la curva con la línea roja.')],
     'fila': ['No (casi)', 'Potencial local más grande'],
     'anim': {'efectos': [traza(S['debil'], 'rgba(100,116,139,.5)', 0, .01, 5), traza(S['fuerte'], '#7C3AED')], 'rotulos': [rot(400, 480, 'Más grande, pero bajo el umbral', 1.6)]},
     'exp': 'Los potenciales locales son graduados: su tamaño depende de la intensidad del estímulo. Aun así, uno solo puede quedarse bajo el umbral.'},
    {'clave': 'suma', 'titulo': 'Dos estímulos seguidos', 'corto': 'Sumación',
     'situacion': 'Llegan dos PPSE, el segundo 2 ms después del primero, antes de que el primero se apague.',
     'pasos': [pred('¿Qué crees que pasará?', ['Se suman, llegan al umbral y se dispara un potencial de acción', 'Cada uno sube y baja por separado, sin sumarse', 'Se anulan entre sí', 'Se dispara un potencial de acción por cada estímulo'], 0),
        el('Entonces, ¿qué debe ocurrir para que los potenciales locales generen un potencial de acción?', ['Que su suma despolarice el cono axónico hasta el umbral', 'Que uno solo llegue a 0 mV', 'Que lleguen al final del axón sin sumarse', 'Que se hiperpolarice la membrana del soma'], 0,
           pista='Mira dónde cruzó la curva la línea roja.')],
     'fila': ['Sí', 'Potencial de acción (sumación temporal)'],
     'anim': {'efectos': [traza(S['suma'] if 'suma' in S else S['temporal'], '#16A34A', 0, 3.5)], 'rotulos': [rot(300, 640, '1º', .9), rot(400, 640, '2º', 1.4), rot(440, 500, 'Umbral alcanzado', 1.9, i=1), rot(470, 160, 'Potencial de acción', 2.2)]},
     'exp': 'Sumación temporal: un segundo PPSE llega antes de que el primero se apague. También hay sumación espacial (PPSE de distintas sinapsis al mismo tiempo). Al llegar al umbral se abren en cadena los canales de Na⁺ controlados por voltaje.'},
    {'clave': 'inhib', 'titulo': 'Excitación e inhibición juntas', 'corto': 'Con PPSI',
     'situacion': 'Llega un PPSE grande y, casi al mismo tiempo, un PPSI (GABA) sobre el soma.',
     'pasos': [pred('¿Qué pasará?', ['El PPSI resta: la suma no llega al umbral', 'El PPSI suma y ayuda a llegar al umbral', 'Se dispara un potencial de acción más pequeño', 'El PPSI no influye, porque actúa en otro lugar'], 0)],
     'fila': ['No', 'La inhibición impide el disparo'],
     'anim': {'efectos': [traza(S['fuerte'], 'rgba(124,58,237,.45)', 0, .01, 5), traza(S['ipsp'], '#DC2626')], 'rotulos': [rot(420, 620, 'El PPSI resta', 1.6)]},
     'exp': 'La neurona suma algebraicamente: los PPSE suben y los PPSI bajan el potencial. Si la inhibición pesa más, el cono axónico no llega al umbral.'},
    {'clave': 'compara', 'titulo': 'Local frente a acción', 'corto': 'Compara',
     'pasos': [el('¿Cuál es «todo o nada»?', ['El potencial de acción: si se alcanza el umbral, siempre tiene la misma forma y amplitud', 'El potencial local: o aparece entero o no aparece', 'Ambos: los dos tienen siempre el mismo tamaño', 'Ninguno: los dos crecen con el estímulo'], 0, pista='¿Cuál crecía con el estímulo?'),
        el('¿Cuál se propaga por el axón sin perder tamaño?', ['El potencial de acción', 'El potencial local', 'Ninguno de los dos'], 0, pista='El local se apagaba con el tiempo y la distancia.'),
        el('¿Dónde se genera cada uno?', ['Los locales en dendritas y soma; el de acción en el cono axónico', 'Ambos solo en el axón', 'Los locales en el axón; el de acción en las dendritas', 'Ambos en los botones terminales'], 0, pista='Recuerda el nivel III de «Canales de membrana».')],
     'fondo_ok': P + 'sumacion-guia.svg',
     'exp': 'Potencial local: graduado, se suma, decrece con la distancia y puede despolarizar (PPSE) o hiperpolarizar (PPSI). Potencial de acción: todo o nada, nace en el cono axónico al llegar al umbral, se propaga sin decremento y tiene período refractario.'},
  ]}
if 'temporal' in S: pass

YM = C['YM']
def linea(v, col, t=0):
    return {'l': [[[150, YM[str(v)]], [1150, YM[str(v)]]]], 'w': 4, 'c': col, 'a': 'traza', 't': t, 'dur': 1.2, 'dash': None}
B2 = {'n': 2, 'tipo': 'escenas', 'modo': 'casos', 'titulo': 'Mide en el simulador', 'subtitulo': 'Reposo, umbral, peak e hiperpolarización',
  'fondo': P + 'ejes-medida.svg', 'vb': VB, 'alt': 'Ejes vacíos para anotar el registro del simulador', 'sim': SIM_N,
  'cuadro': ['Medida', 'Valor en el simulador', 'Qué significa'],
  'guia_src': P + 'pa-medidas.svg', 'guia_img': 'El potencial de acción del simulador', 'guia_pie': 'Valores de la neurona del simulador PhET (modelo de Hodgkin y Huxley).',
  'instrucciones': 'Trabajas con el <strong>simulador de la neurona</strong> (pestaña 🧪). Lee los valores en su gráfico y escríbelos con su signo (por ejemplo −40). Se aceptan lecturas aproximadas. Cada valor que aciertes queda marcado en tu registro (pestaña 🖼).',
  'casos': [
    {'clave': 'explora', 'titulo': 'Explora el simulador', 'corto': 'Explora',
     'pasos': [mira('Conoce la neurona del simulador:', ['Marca «Mostrar todos los iones», «Mostrar concentraciones» y «Mostrar gráfico de potencial».',
                                                     'Acerca la vista (lupa +) a la membrana del corte del axón.', 'Todavía no estimules.'], 'Listo →'),
        el('¿Qué canales ves en la membrana?', ['Canales de fuga (siempre abiertos) y canales controlados de Na⁺ y de K⁺', 'Solo canales de Na⁺, porque el K⁺ no cruza la membrana', 'Solo la bomba Na⁺/K⁺', 'Ningún canal: los iones cruzan la bicapa'], 0,
           pista='Mira la leyenda del simulador.', vista='sim')],
     'exp': 'Los canales de fuga están siempre abiertos y explican el potencial de reposo; los controlados por voltaje se abren con el estímulo y producen el potencial de acción. El simulador no muestra la bomba Na⁺/K⁺.'},
    {'clave': 'reposo', 'titulo': 'Potencial de reposo', 'corto': 'Reposo',
     'pasos': [num('Antes de estimular, lee el gráfico: ¿cuál es el potencial de reposo de esta neurona?', [-72, -58], '−65 mV', 'Reposo',
                   'Es la línea plana antes de estimular: léela en el eje vertical.', 'Este simulador usa el modelo de Hodgkin y Huxley (axón de calamar). En neuronas de mamífero el reposo suele estar cerca de −70 mV.')],
     'fila': ['−65 mV', 'Membrana sin estimular: interior negativo'],
     'anim': {'efectos': [linea(-65, '#475569')], 'rotulos': [rot(1140, YM['-65'] - 22, 'Reposo −65 mV', .8, i=1)]},
     'exp': 'El reposo depende sobre todo de los canales de fuga de K⁺ y de los gradientes.'},
    {'clave': 'peak', 'titulo': 'Estimula: el peak', 'corto': 'Peak',
     'pasos': [mira('Presiona «Estimular neurona» y deja correr la simulación unos 10 segundos (si va muy rápido, usa la velocidad lenta).', boton='Ya estimulé →'),
        num('¿Cuál es el voltaje máximo (peak) del potencial de acción?', [22, 48], '+35 mV', 'Peak', 'Es el punto más alto de la curva.')],
     'fila': ['+35 mV', 'El interior se vuelve positivo un instante'],
     'anim': {'efectos': [linea(-65, 'rgba(71,85,105,.5)'), traza(C['PA'], '#7C3AED', .2, 2.5), linea(35, '#16A34A', 2.4)],
              'rotulos': [rot(330, 120, 'Peak +35 mV', 2.6)]},
     'exp': 'En el peak el interior queda positivo: entró tanto Na⁺ que la carga se invirtió. No llega al potencial de equilibrio del Na⁺ (≈ +60 mV) porque los canales de Na⁺ se inactivan y se abren los de K⁺.'},
    {'clave': 'umbral', 'titulo': 'El umbral', 'corto': 'Umbral',
     'pasos': [num('Mira el comienzo de la subida: ¿desde qué voltaje la curva se dispara hacia arriba (umbral)?', [-62, -45], '≈ −55 mV', 'Umbral',
                   'Busca dónde la curva deja de subir lento y se vuelve casi vertical: un poco más arriba que el reposo.')],
     'fila': ['≈ −55 mV', 'Se abren en cadena los canales de Na⁺ controlados por voltaje'],
     'anim': {'efectos': [linea(-65, 'rgba(71,85,105,.5)'), traza(C['PA'], 'rgba(124,58,237,.6)', 0, .01, 6), linea(-55, '#DC2626', .3)],
              'rotulos': [rot(1140, YM['-55'] - 22, 'Umbral ≈ −55 mV', .8, i=1)]},
     'exp': 'El estímulo del simulador siempre es supraumbral, así que el umbral no se ve como un quiebre nítido. En una neurona real está unos 15 mV por sobre el reposo: ≈ −55 mV.'},
    {'clave': 'hiper', 'titulo': 'El punto más bajo', 'corto': 'Hiperpolarización',
     'pasos': [num('Después del potencial de acción, ¿cuál es el voltaje más bajo que alcanza la curva?', [-85, -70], '≈ −77 mV', 'Mínimo',
                   'Después de bajar, la curva queda un rato por debajo del reposo.')],
     'fila': ['≈ −77 mV', 'Más negativo que el reposo; vuelve lento'],
     'anim': {'efectos': [traza(C['PA'], 'rgba(124,58,237,.6)', 0, .01, 6), linea(-77, '#D97706', .3)],
              'rotulos': [rot(700, YM['-77'] + 26, 'Mínimo ≈ −77 mV', .8)]},
     'exp': 'La hiperpolarización se debe a que los canales de K⁺ se cierran lentamente: sigue saliendo K⁺ un rato después de volver al reposo.'},
  ]}

T = C['tramos']
Z_PA = {'despol': {'l': [T['despol']], 'w': 26, 'nombre': 'la subida (despolarización)'},
        'repol': {'l': [T['repol']], 'w': 26, 'nombre': 'la bajada (repolarización)'},
        'hiper': {'l': [T['hiper']], 'w': 26, 'nombre': 'la hiperpolarización'},
        'umbral': {'e': C['XY']['umbral'] + [34, 30], 'nombre': 'el umbral'},
        'reposo': {'l': [[[150, 558], [245, 558]]], 'w': 22, 'nombre': 'el reposo'}}
COLF = {'despol': '#16A34A', 'repol': '#2563EB', 'hiper': '#D97706'}
B3 = {'n': 3, 'tipo': 'escenas', 'modo': 'casos', 'titulo': 'Las fases del potencial de acción', 'subtitulo': 'Despolarización, repolarización e hiperpolarización',
  'fondo': P + 'pa-curva.svg', 'vb': VB, 'alt': 'Curva del potencial de acción del simulador', 'donde': 'la curva', 'zonas': Z_PA,
  'cuadro': ['Fase', 'Qué pasa con el potencial', 'Ion responsable'],
  'guia_src': P + 'pa-fases.svg', 'guia_img': 'Las fases del potencial de acción', 'guia_pie': 'a despolarización · b repolarización · c hiperpolarización.',
  'instrucciones': 'Es la curva que registraste en el simulador. En cada caso <strong>toca en la curva</strong> la fase que se pide y responde qué la produce. Al terminar, la curva queda marcada con a, b y c, como en la guía de papel.',
  'casos': [
    {'clave': 'despol', 'titulo': 'a · Despolarización', 'corto': 'a · Despolarización',
     'pasos': [toca('Toca la fase de despolarización: la subida rápida.', ['despol'], 'Busca el tramo donde el potencial sube de golpe hasta el peak.'),
        el('¿Qué la produce?', ['La entrada rápida de Na⁺ por canales controlados por voltaje', 'La salida de K⁺ por canales de fuga', 'La bomba Na⁺/K⁺ trabajando más rápido', 'La entrada de Cl⁻ por canales de GABA'], 0, pista='Recuerda qué pasó al abrir los canales de Na⁺.')],
     'fila': ['Sube desde el umbral hasta ≈ +35 mV', 'Na⁺ entra'],
     'anim': {'efectos': [traza(T['despol'], COLF['despol'], 0, 1.2, 14)], 'rotulos': [rot(T['despol'][len(T['despol']) // 2][0] - 14, T['despol'][len(T['despol']) // 2][1], 'a · Despolarización', 1, i=1, c='verde')]},
     'exp': 'Al llegar al umbral se abren los canales de Na⁺ controlados por voltaje; entra Na⁺, eso despolariza más y abre más canales (retroalimentación positiva). Por eso la subida es tan rápida.'},
    {'clave': 'repol', 'titulo': 'b · Repolarización', 'corto': 'b · Repolarización',
     'pasos': [toca('Toca la fase de repolarización: la bajada desde el peak.', ['repol'], 'Busca el tramo que baja desde el punto más alto.'),
        el('¿Qué la produce?', ['Los canales de Na⁺ se inactivan y se abren los de K⁺: sale K⁺', 'Se abren más canales de Na⁺ y entra más Na⁺', 'La bomba Na⁺/K⁺ saca todo el Na⁺ que entró', 'Entra K⁺ desde el medio extracelular'], 0, pista='Recuerda qué pasó al abrir los canales de K⁺.')],
     'fila': ['Baja desde el peak hacia el reposo', 'K⁺ sale (Na⁺ inactivado)'],
     'anim': {'efectos': [traza(T['repol'], COLF['repol'], 0, 1.2, 14)], 'rotulos': [rot(T['repol'][len(T['repol']) // 2][0] + 14, T['repol'][len(T['repol']) // 2][1], 'b · Repolarización', 1)]},
     'exp': 'Poco después de abrirse, los canales de Na⁺ se inactivan; mientras tanto se abren los canales de K⁺ controlados por voltaje, más lentos. La salida de K⁺ devuelve el interior a valores negativos.'},
    {'clave': 'hiper', 'titulo': 'c · Hiperpolarización', 'corto': 'c · Hiperpolarización',
     'pasos': [toca('Toca la hiperpolarización: cuando la curva queda por debajo del reposo.', ['hiper'], 'Busca el tramo después de la bajada, bajo la altura inicial.'),
        el('¿Por qué el potencial baja más que el reposo?', ['Los canales de K⁺ controlados por voltaje se cierran lento y sigue saliendo K⁺', 'Entra Na⁺ en exceso al final', 'La bomba se detiene y se pierde el gradiente', 'Se abren canales de Cl⁻ que sacan cargas negativas'], 0, pista='¿Qué canal seguía abierto al final?')],
     'fila': ['Queda bajo el reposo (≈ −77 mV) y vuelve lento', 'K⁺ sigue saliendo'],
     'anim': {'efectos': [traza(T['hiper'], COLF['hiper'], 0, 1.6, 14)], 'rotulos': [rot(700, 640, 'c · Hiperpolarización', 1)]},
     'exp': 'Los canales de K⁺ controlados por voltaje tardan en cerrarse: mientras sigan abiertos, sale K⁺ y el interior queda más negativo que en reposo.'},
    {'clave': 'umbral', 'titulo': 'Todo o nada', 'corto': 'Todo o nada',
     'pasos': [toca('Toca el punto donde la curva alcanza el umbral.', ['umbral'], 'Busca dónde la curva cruza la línea roja al subir.'),
        el('Si estimulas con el doble de intensidad, ¿cómo será el potencial de acción?', ['Igual: es todo o nada; un estímulo más intenso aumenta la frecuencia de disparo, no la altura', 'El doble de alto', 'Más ancho y más alto', 'No habrá potencial de acción'], 0, pista='Una vez alcanzado el umbral, ¿depende la forma del estímulo?')],
     'fila': ['Se cruza ≈ −55 mV: se dispara', 'Na⁺ (se abren los canales de voltaje)'],
     'anim': {'efectos': [{'e': C['XY']['umbral'] + [22, 22], 'c': 'rgba(220,38,38,.35)', 's': '#DC2626', 'a': 'pulso'}], 'rotulos': [rot(C['XY']['umbral'][0] - 14, C['XY']['umbral'][1] + 30, 'Umbral', .4, i=1)]},
     'exp': 'El potencial de acción es todo o nada: si se alcanza el umbral, su amplitud y su forma no dependen del estímulo. La intensidad se codifica en la frecuencia de potenciales de acción y en cuántas neuronas disparan.'},
  ]}

def canalcase(k, titulo, sim_txt, na_ok, k_ok, mov_ok, fila, flujo, exp, pistas):
    NAO = ['Abiertos', 'Cerrados', 'Inactivados (tapados: no pueden abrirse)']
    KO = ['Abiertos', 'Cerrados']
    MOV = ['Na⁺ entra', 'K⁺ sale', 'Na⁺ sale', 'K⁺ entra']
    return {'clave': k, 'titulo': titulo, 'corto': titulo, 'fondo_ok': P + f'pa-canales-{k}.svg',
            'pasos': [mira(sim_txt, boton='Ya lo vi →'),
                      el(f'En la {titulo.lower()}, ¿cómo están los canales de Na⁺ controlados por voltaje?', NAO, na_ok, pista=pistas[0], vista='esquema'),
                      el('¿Y los canales de K⁺ controlados por voltaje?', KO, k_ok, pista=pistas[1]),
                      el('¿Qué ion se mueve y hacia dónde?', MOV, mov_ok, pista=pistas[2])],
            'fila': fila[1:], 'anim': {'flujos': [flujo]}, 'exp': exp}
B4 = {'n': 4, 'tipo': 'escenas', 'modo': 'casos', 'titulo': 'Los canales en cada fase', 'subtitulo': 'Estado de los canales y movimiento de iones',
  'fondo': P + 'pa-canales.svg', 'vb': VB, 'alt': 'Curva del potencial de acción y membrana con un canal de Na⁺ y uno de K⁺', 'sim': SIM_N,
  'cuadro': ['Fase', 'Canales de Na⁺', 'Canales de K⁺', 'Movimiento de iones'],
  'guia_src': P + 'pa-canales-repol.svg', 'guia_img': 'Los canales durante la repolarización', 'guia_pie': 'El canal de Na⁺ inactivado (compuerta roja) y el de K⁺ abierto.',
  'instrucciones': 'Para cada fase, mira primero los canales en el <strong>simulador</strong>: estimula, pausa y arrastra el cursor del gráfico hasta esa fase. Después responde cómo están los canales y qué ion se mueve. Cada fase llena una fila del <strong>cuadro</strong>, como en la guía de papel.',
  'casos': [
    canalcase('despol', 'Despolarización', 'En el simulador: estimula la neurona, pausa durante la subida y mira los canales controlados (arrastra el cursor del gráfico para volver a ese momento).',
              0, 1, 0, ['a · Despolarización', 'Abiertos', 'Cerrados (empiezan a abrirse, lentos)', 'Na⁺ entra'], fl('M400 450 L400 700', 'na', 5, 1.8),
              'Al llegar al umbral se abre la compuerta de activación de los canales de Na⁺; los de K⁺ también responden al voltaje, pero son más lentos. Entra Na⁺.',
              ['Es la fase en que el potencial sube.', 'Los canales de K⁺ responden tarde.', 'Recuerda qué ion despolariza.']),
    canalcase('repol', 'Repolarización', 'En el simulador: arrastra el cursor del gráfico hasta la bajada (repolarización) y mira los canales.',
              2, 0, 1, ['b · Repolarización', 'Inactivados', 'Abiertos', 'K⁺ sale'], fl('M800 700 L800 440', 'k', 5, 1.8),
              'El canal de Na⁺ tiene una segunda compuerta (de inactivación) que lo tapa poco después de abrirse: ya no entra Na⁺. Los canales de K⁺ están abiertos y sale K⁺.',
              ['El canal de Na⁺ tiene una segunda compuerta que lo tapa poco después de abrirse.', 'Es la fase en que sale K⁺.', '¿Qué ion vuelve negativo el interior?']),
    canalcase('hiper', 'Hiperpolarización', 'En el simulador: arrastra el cursor hasta el tramo bajo el reposo y mira los canales.',
              1, 0, 1, ['c · Hiperpolarización', 'Cerrados (recuperados de la inactivación)', 'Abiertos (se cierran lentamente)', 'K⁺ sigue saliendo'], fl('M800 700 L800 440', 'k', 3, 2.4),
              'Los canales de Na⁺ ya volvieron a su estado cerrado (listos para abrirse otra vez); los de K⁺ se cierran lentamente, así que sigue saliendo K⁺ y el interior queda más negativo que en reposo.',
              ['Ya pasó la inactivación: el canal vuelve a su estado de reposo.', 'Se cierran lentamente.', 'Es el mismo ion que en la repolarización.']),
  ]}

ARP, RRP = C['ARP'], C['RRP']
Z_R = {'abs': {'r': [ARP[0], 90, ARP[1] - ARP[0], 570], 'nombre': 'el potencial de acción'},
       'rel': {'r': [RRP[0], 90, RRP[1] - RRP[0], 570], 'nombre': 'la hiperpolarización'},
       'reposo': {'r': [RRP[1], 90, 1150 - RRP[1], 570], 'nombre': 'el reposo'}}
B5 = {'n': 5, 'tipo': 'escenas', 'modo': 'casos', 'titulo': 'El período refractario', 'subtitulo': 'Absoluto y relativo',
  'fondo': P + 'pa-curva.svg', 'vb': VB, 'alt': 'Curva del potencial de acción del simulador', 'sim': SIM_N, 'donde': 'la curva', 'zonas': Z_R,
  'guia_src': P + 'pa-refractario.svg', 'guia_img': 'Períodos refractarios', 'guia_pie': 'Rojo: período refractario absoluto. Amarillo: relativo.',
  'instrucciones': '¿Se puede disparar un potencial de acción encima de otro? <strong>Predice</strong> (una sola oportunidad), pruébalo en el <strong>simulador</strong> y ubica los períodos refractarios en la curva.',
  'casos': [
    {'clave': 'doble', 'titulo': 'Estimular otra vez', 'corto': 'Dos estímulos',
     'pasos': [pred('Si presionas «Estimular» de nuevo mientras ocurre un potencial de acción, ¿qué pasará?', ['No se genera otro potencial de acción hasta que la membrana se recupere', 'Se genera un segundo potencial de acción encima del primero, más alto', 'Los dos se suman en uno el doble de grande', 'El primero se detiene y empieza otro'], 0),
        mira('Pruébalo: estimula la neurona y, de inmediato, intenta estimular otra vez. Mira el botón «Estimular neurona».', boton='Ya lo probé →'),
        el('¿Qué pasó con el botón mientras ocurría el potencial de acción?', ['Se desactivó: no se podía estimular de nuevo', 'Generó un segundo potencial de acción', 'Cortó el potencial de acción', 'Nada distinto: siempre está activo'], 0, pista='Fíjate si el botón se ve gris.', vista='sim')],
     'anim': {'efectos': [{'r': [ARP[0], 90, ARP[1] - ARP[0], 570], 'c': 'rgba(248,113,113,.35)', 'a': 'crece'}], 'rotulos': [rot((ARP[0] + ARP[1]) // 2, 120, 'Sin segundo disparo', .4)]},
     'exp': 'El simulador desactiva el botón mientras dura el potencial de acción y la membrana no vuelve al reposo (lo simplifica). En la neurona real, un segundo estímulo no dispara nada durante el período refractario absoluto, y dispara solo si es más fuerte durante el relativo.'},
    {'clave': 'abs', 'titulo': 'Período refractario absoluto', 'corto': 'Absoluto',
     'pasos': [el('¿A qué hace referencia el período refractario absoluto?', ['Al tiempo en que ningún estímulo, por intenso que sea, genera otro potencial de acción', 'Al tiempo en que solo un estímulo más intenso que lo normal genera otro', 'Al tiempo que tarda la bomba Na⁺/K⁺ en reponer los gradientes', 'Al tiempo que tarda el impulso en llegar al final del axón'], 0, pista='Absoluto: no hay excepción.', vista='esquema'),
        toca('¿En qué parte de la curva ocurre? Tócala.', ['abs'], 'Ocurre mientras los canales de Na⁺ están abiertos o inactivados.'),
        el('¿Por qué ocurre?', ['Los canales de Na⁺ están abiertos o inactivados y no pueden volver a abrirse', 'Se acabó el Na⁺ del medio extracelular', 'Los canales de K⁺ están cerrados', 'La mielina bloquea el axón'], 0, pista='Recuerda la compuerta de inactivación.')],
     'anim': {'efectos': [{'r': [ARP[0], 90, ARP[1] - ARP[0], 570], 'c': 'rgba(248,113,113,.4)'}], 'rotulos': [rot((ARP[0] + ARP[1]) // 2, 630, 'Absoluto', .3, c=None)]},
     'exp': 'Durante la despolarización y casi toda la repolarización, los canales de Na⁺ están abiertos o inactivados: no hay estímulo capaz de abrirlos de nuevo. En una neurona real dura ≈ 1–2 ms.'},
    {'clave': 'rel', 'titulo': 'Período refractario relativo', 'corto': 'Relativo',
     'pasos': [toca('Toca el tramo en que un estímulo más fuerte que lo normal sí podría disparar otro potencial de acción.', ['rel'], 'Algunos canales de Na⁺ ya se recuperaron, pero la membrana está más negativa que en reposo.'),
        el('¿Por qué hace falta un estímulo más fuerte?', ['Algunos canales de Na⁺ ya se recuperaron, pero los de K⁺ siguen abiertos y alejan la membrana del umbral', 'Todos los canales de Na⁺ siguen inactivados', 'La membrana está despolarizada y más cerca del umbral', 'El axón perdió su mielina durante el potencial de acción'], 0, pista='¿Qué tan lejos del umbral está la membrana hiperpolarizada?')],
     'anim': {'efectos': [{'r': [ARP[0], 90, ARP[1] - ARP[0], 570], 'c': 'rgba(248,113,113,.3)'}, {'r': [RRP[0], 90, RRP[1] - RRP[0], 570], 'c': 'rgba(252,211,77,.45)'}],
              'rotulos': [rot((RRP[0] + RRP[1]) // 2, 630, 'Relativo', .3)]},
     'exp': 'Durante la hiperpolarización hay canales de Na⁺ disponibles otra vez, pero el interior está más negativo y los canales de K⁺ siguen abiertos: se necesita un estímulo mayor para llegar al umbral.'},
    {'clave': 'para', 'titulo': '¿Para qué sirve?', 'corto': 'Para qué sirve',
     'pasos': [el('¿Qué consecuencia tiene el período refractario?', ['El impulso viaja en un solo sentido y hay un límite de potenciales de acción por segundo', 'Permite que dos potenciales de acción se sumen y sean más grandes', 'Hace que el impulso viaje hacia atrás, al soma', 'Evita que la neurona gaste ATP'], 0, pista='El tramo que acaba de disparar no puede volver a disparar de inmediato.')],
     'fondo_ok': P + 'pa-refractario.svg',
     'exp': 'El tramo de axón que acaba de disparar queda refractario, así que el impulso no puede volver atrás: avanza en un solo sentido. Además, el período refractario pone un techo a la frecuencia de disparo (cientos por segundo).'},
  ]}


# Nivel II compacto: cada «toca dónde» trae su pregunta en el mismo paso
def tq(p, ok, pista, q):
    d = toca(p, ok, pista); d['q'] = q; return d
_c = {c['clave']: c for c in A3['casos']}
_c['tacto']['pasos'] = [tq('¿Dónde se abren esos canales?', ['piel'], 'Busca la parte de la neurona sensitiva que está dentro de la piel.',
    qq('¿Qué abre estos canales y qué producen?', ['La presión deforma la membrana (estímulo mecánico): entra Na⁺ y se genera un potencial receptor que crece con la presión', 'Un neurotransmisor (ligando): genera de inmediato un potencial de acción', 'Un cambio de voltaje: genera una hiperpolarización', 'El calor de la mano: no genera ningún cambio'], 0,
       'Un toque suave y uno fuerte no producen la misma respuesta.'))]
_c['glu']['pasos'] = [tq('¿Dónde se abren los canales que responden al glutamato?', ['sinapsis', 'zoom', 'dendrita'], 'Busca el botón donde termina el axón sensitivo y lo que toca (o su aumento).',
    qq('¿Qué abre estos canales y qué efecto tienen?', ['Un ligando: el glutamato se une al receptor-canal, entra Na⁺ y se produce un PPSE (despolariza)', 'Un cambio de voltaje: sale K⁺ y se dispara un potencial de acción', 'La presión del botón: entra Cl⁻ e hiperpolariza', 'El ATP del botón: no cambia el potencial'], 0,
       'La señal que cruza la sinapsis es química.'))]
_c['gaba']['pasos'] = [tq('¿Dónde actúa el GABA?', ['inhib'], 'Busca el botón del axón que llega desde arriba.',
    qq('¿Qué ion entra y para qué sirve?', ['Entra Cl⁻: el interior se vuelve más negativo (PPSI) y el soma se aleja del umbral', 'Entra Na⁺: despolariza (PPSE) y acerca al umbral', 'Sale Cl⁻: despolariza y acelera la conducción', 'Entra Ca²⁺: dispara un potencial de acción'], 0,
       'El GABA es el principal neurotransmisor inhibitorio.'))]
_c['cono']['pasos'] = [tq('¿Dónde está la zona gatillo, con muchos canales de Na⁺ controlados por voltaje?', ['cono'], 'Está entre el soma y el comienzo del axón.',
    qq('¿Qué abre estos canales de Na⁺?', ['Un cambio de voltaje: se abren cuando la suma de potenciales locales lleva la membrana al umbral (≈ −55 mV)', 'El glutamato que llega desde la dendrita', 'La presión del soma sobre el axón', 'La bomba Na⁺/K⁺ cuando se queda sin ATP'], 0,
       'Aquí no hay sinapsis ni piel: lo único que llega es la despolarización.'))]
_c['nodo']['pasos'] = [tq('¿Dónde se abren los canales de Na⁺ a lo largo de un axón mielinizado?', ['nodo'], 'La mielina aísla; los canales quedan en los espacios entre vainas.',
    qq('¿Qué los abre?', ['La despolarización que llega desde el nodo anterior (voltaje): el impulso avanza a saltos', 'El neurotransmisor que viaja dentro del axón', 'La presión de la vaina de mielina', 'Un estímulo nuevo en la piel para cada nodo'], 0,
       'Es el mismo tipo de canal que en el cono axónico.'))]
_c['cierre']['pasos'] = [el('Juntando todo: un toque en la piel termina en un potencial de acción en el axón de la segunda neurona. ¿Qué tres características de la neurona lo hicieron posible?', ['Gradientes de iones, membrana excitable con canales (mecánicos, por ligando y por voltaje) y una forma polarizada: dendritas y soma reciben, el axón conduce', 'Núcleo grande, muchas mitocondrias y capacidad de dividirse', 'Membrana impermeable a los iones, citoplasma rico en Na⁺ y axón sin ramificaciones', 'Retículo endoplásmico abundante, vesículas con hormonas y contacto con capilares'], 0,
    pista='Una la viste al armar el reposo, otra al abrir un canal y otra al recorrer esta neurona.')]
_c['cierre']['exp'] = 'Gradientes (energía guardada), membrana excitable (canales que cambian el potencial: mecánicos en la piel, por ligando en las sinapsis, por voltaje en el cono axónico y los nodos) y forma polarizada (recibe en dendritas y soma, conduce por el axón).'
A3['instrucciones'] = 'En la vida real los canales los abren estímulos distintos en lugares distintos. En cada caso <strong>toca en la neurona</strong> dónde se abren y, en el mismo paso, responde qué los abre. Con «Nombres» ves cada estructura (se ocultan mientras tocas). Cada caso llena una fila del <strong>cuadro</strong>.'

# ---- Versión mínima (27-10, noche): un paso por caso, preguntas breves con alternativas parejas ----
_l = {c['clave']: c for c in L1['casos']}
_l['reposo']['pasos'] = [simp('Arma una neurona en reposo:', [('Na⁺ afuera: 150 mM', 'na150'), ('Na⁺ adentro: 25 mM', 'na25'), ('K⁺ adentro: 150 mM', 'k150'), ('K⁺ afuera: casi nada', 'k0')],
    'Elige el ion y toca afuera o adentro (cada toque = 25 mM). «Vaciar» borra todo.',
    q=qq('Si se abriera un canal, ¿qué ion tendería a entrar a la célula?', ['Na⁺', 'K⁺', 'Ambos', 'Ninguno'], 0, 'Los iones van de donde hay más a donde hay menos.'))]
_l['reposo']['situacion'] = 'Los iones Na⁺ son verdes y los K⁺, azules.'
_l['potencial']['pasos'] = [simp('Observa la membrana en reposo:', [('Reposo armado', 'naAfuera'), ('K⁺ adentro', 'kAdentro'), ('Voltímetro bajo −60 mV', 'vNeg')],
    'Mira qué ion cruza por los canales de fuga.',
    q=qq('¿Por qué el interior queda negativo?', ['Sale K⁺ por los canales de fuga', 'Entra Na⁺ por los canales de fuga', 'Entra Cl⁻ desde afuera', 'La bomba saca cargas negativas'], 0, '¿Qué carga se lleva el ion que sale?'))]
_l['potencial']['situacion'] = 'El voltímetro mide el potencial de membrana: la diferencia de voltaje entre ambos lados. Los dos canales de fuga están siempre abiertos y solo dejan pasar K⁺.'
_l['na']['pasos'] = [simp('Pon un canal de Na⁺ y ábrelo:', [('Canal de Na⁺ en la membrana', 'compNa'), ('Compuerta abierta', 'abiertoNa'), ('Voltímetro sobre −30 mV', 'vDespol')],
    'Usa la tarjeta del canal de Na⁺. Si perdiste el reposo, presiona «Armar reposo».',
    q=qq('¿Qué pasó con el potencial?', ['Se despolarizó: entró Na⁺', 'Se hiperpolarizó: entró Na⁺', 'Se despolarizó: salió Na⁺', 'Se hiperpolarizó: salió Na⁺'], 0, 'Mira hacia dónde cruzan los iones verdes.'))]
_l['k']['pasos'] = [simp('Cierra el Na⁺, pon un canal de K⁺ y ábrelo:', [('Compuerta de Na⁺ cerrada', 'cerradoNa'), ('Canal de K⁺ en la membrana', 'compK'), ('Compuerta abierta', 'abiertoK'), ('Voltímetro bajo −75 mV', 'vHiper')],
    'Si no baja, presiona «Armar reposo» y vuelve a abrirla.',
    q=qq('¿Qué pasó con el potencial?', ['Se hiperpolarizó: salió K⁺', 'Se despolarizó: salió K⁺', 'Se hiperpolarizó: entró K⁺', 'Se despolarizó: entró K⁺'], 0, 'Mira hacia dónde cruzan los iones azules.'))]
_l['bomba']['pasos'] = [simp('Apaga la bomba y abre el canal de Na⁺:', [('Bomba apagada', 'bombaOff'), ('Compuerta de Na⁺ abierta', 'abiertoNa'), ('Na⁺ adentro sobre 60 mM', 'naIgual')],
    'Espera mirando las barras de Na⁺ (unos 15 s).',
    q=qq('¿Qué hace la bomba Na⁺/K⁺ que apagaste?', ['Saca Na⁺ y mete K⁺, gastando ATP', 'Mete Na⁺ y saca K⁺, gastando ATP', 'Saca Na⁺ y mete K⁺, sin gastar ATP', 'Deja pasar Na⁺ y K⁺ libremente'], 0, 'Sin ella, el Na⁺ se acumula adentro.'))]
_l['bomba']['situacion'] = ''
_l['reposo']['exp'] = 'En reposo hay ≈ 10 veces más Na⁺ afuera y ≈ 30 veces más K⁺ adentro (reales: ≈ 145/15 y 140/5 mM). Estos gradientes son energía guardada: al abrirse un canal, el Na⁺ tiende a entrar y el K⁺ a salir. La bicapa sola no deja pasar iones.'
_l['potencial']['exp'] = 'El potencial de membrana es la diferencia de voltaje entre el interior y el exterior. En reposo (≈ −70 mV) sale K⁺ por los canales de fuga y el interior queda con menos cargas positivas. Basta que crucen muy pocos iones, justo en la membrana. Desde ahora tienes «Armar reposo».'
_l['na']['exp'] = 'El Na⁺ entra a favor de su gradiente y el interior se vuelve menos negativo: despolarización. Una membrana con canales que cambian el potencial es excitable.'
_l['k']['exp'] = 'El K⁺ sale a favor de su gradiente y el interior se vuelve más negativo: hiperpolarización. En el potencial de acción, esta salida repolariza la membrana.'
_l['bomba']['exp'] = 'Sin bomba, el Na⁺ sigue entrando hasta igualar las concentraciones y el gradiente se pierde. La bomba Na⁺/K⁺ gasta ATP para sacar 3 Na⁺ y meter 2 K⁺. En la neurona los canales se abren solo milisegundos, así que la bomba alcanza a reponer los gradientes.'
L1['instrucciones'] = 'En cada caso haz lo que pide la lista en el <strong>simulador</strong>: se marca sola y, al completarla, se habilita la pregunta. Elige un ion y toca afuera o adentro para agregarlo; en las tarjetas pon canales, abre sus compuertas y apaga o enciende la bomba. Cada ion dibujado representa 5 mM; en una célula real son miles de millones de iones.'

_c = {c['clave']: c for c in A3['casos']}
def _q(k, p, ops, pista): _c[k]['pasos'][0]['q'] = qq(p, ops, 0, pista)
_q('tacto', '¿Qué abre este canal?', ['La presión (mecánico)', 'Un neurotransmisor (ligando)', 'Un cambio de voltaje', 'El ATP de la célula'], '¿Qué le hace el toque a la membrana?')
_q('glu', '¿Qué abre el canal y qué efecto tiene?', ['Ligando · despolariza (PPSE)', 'Ligando · hiperpolariza (PPSI)', 'Voltaje · despolariza (PPSE)', 'Voltaje · hiperpolariza (PPSI)'], 'La señal que cruza la sinapsis es química.')
_q('gaba', '¿Qué ion entra y qué efecto tiene?', ['Cl⁻ · hiperpolariza (PPSI)', 'Na⁺ · despolariza (PPSE)', 'Cl⁻ · despolariza (PPSE)', 'K⁺ · despolariza (PPSE)'], 'El GABA es inhibitorio.')
_q('cono', '¿Qué abre los canales de Na⁺ en esta zona?', ['Un cambio de voltaje (umbral)', 'Un neurotransmisor (ligando)', 'La presión del soma (mecánico)', 'La bomba Na⁺/K⁺ (transporte)'], 'Aquí solo llega la despolarización sumada.')
_q('nodo', '¿Por qué el impulso salta de nodo en nodo?', ['Bajo la mielina casi no hay canales', 'La mielina tiene sus propios canales', 'Los nodos liberan neurotransmisor', 'La mielina acelera a los iones'], '¿Dónde se concentran los canales de Na⁺?')
_c['cierre']['pasos'] = [el('¿Qué tres características permiten a la neurona transmitir impulsos?', ['Gradientes iónicos, canales y forma polarizada', 'Núcleo grande, mitocondrias y división celular', 'Mielina, glía y capilares cercanos', 'Vesículas, retículo y aparato de Golgi'], 0,
    pista='Una la viste al armar el reposo, otra al abrir canales y otra al recorrer esta neurona.')]

# ---- Neurona rediseñada (27-10, noche): piel periférica, aumentos de ambas sinapsis, leyenda ----
A3['zonas'] = {'piel': {'e': [60, 430, 62, 95], 'nombre': 'la terminación sensitiva de la piel'},
      'sinapsis': {'e': [438, 430, 32, 30], 'nombre': 'la sinapsis sobre la dendrita'},
      'zoomE': {'e': [305, 610, 132, 132], 'nombre': 'el aumento de la sinapsis excitatoria'},
      'dendrita': {'l': [[[462, 432], [590, 432]]], 'w': 18, 'nombre': 'la dendrita'},
      'inhib': {'e': [627, 358, 28, 24], 'nombre': 'la sinapsis inhibitoria'},
      'zoomI': {'e': [930, 182, 128, 128], 'nombre': 'el aumento de la sinapsis inhibitoria'},
      'cono': {'e': [752, 437, 36, 28], 'nombre': 'el cono axónico'},
      'soma': {'e': [640, 452, 76, 58], 'nombre': 'el soma de la segunda neurona'},
      'somas': {'e': [240, 250, 42, 42], 'nombre': 'el soma de la neurona sensitiva (en el ganglio)'},
      'nodo': {'l': [[[x, 412], [x, 456]] for x in (895, 1005, 1115)], 'w': 22, 'nombre': 'un nodo de Ranvier'},
      'mielina': {'r': [800, 414, 400, 40], 'nombre': 'la vaina de mielina'},
      'axs': {'r': [118, 416, 300, 28], 'nombre': 'el axón de la neurona sensitiva'}}
A3['nombres'] = [rot(30, 585, 'Terminación nerviosa libre'), rot(280, 250, 'Soma sensitivo'), rot(170, 395, 'Axón sensitivo'), rot(430, 395, 'Botón presináptico', i=1),
                 rot(520, 468, 'Dendrita'), rot(640, 538, 'Soma'), rot(655, 345, 'Sinapsis inhibitoria'), rot(762, 400, 'Cono axónico'), rot(1005, 474, 'Nodo de Ranvier', i=1)]
_c['tacto']['pasos'][0]['ok'] = ['piel']
_c['glu']['pasos'][0]['ok'] = ['sinapsis', 'zoomE', 'dendrita']
_c['glu']['pasos'][0]['pista'] = 'Busca el botón donde termina el axón sensitivo (o su aumento).'
_c['gaba']['pasos'][0]['ok'] = ['inhib', 'zoomI']
_c['gaba']['pasos'][0]['pista'] = 'Busca el botón del axón que baja desde arriba (o su aumento).'
_c['tacto']['anim'] = {'efectos': [{'e': [60, 430, 52, 80], 'c': 'rgba(245,158,11,.28)', 's': '#F59E0B', 'a': 'pulso'}],
    'flujos': [fl('M18 372 L48 400', 'na', 3, 1.6), fl('M16 492 L44 462', 'na', 3, 1.6, .5), fl('M90 360 L70 395', 'na', 2, 1.6, .9)],
    'rotulos': [rot(126, 478, 'Entra Na⁺: potencial receptor', .8)]}
_E = [(562, 0), (610, .3), (658, .6)]
_c['glu']['anim'] = {'efectos': [{'r': [303, y - 16, 34, 32], 'c': 'rgba(34,197,94,.35)', 's': '#16A34A', 'sw': 3, 'a': 'pulso', 't': .9 + d} for y, d in _E],
    'flujos': [fl(f'M283 610 Q296 {610 + (y - 610) * .6} 304 {y}', 'nt', 2, 1.1, d, rep=False, paso=.4) for y, d in _E]
            + [fl(f'M306 {y - 40} L306 {y} L380 {y + (y - 610) * .3}', 'na', 3, 1.8, 1.2 + d) for y, d in _E],
    'rotulos': [rot(395, 520, 'Entra Na⁺: PPSE', 1.6), rot(176, 655, 'Libera glutamato', .2, i=1)]}
_I = [(884, 0), (930, .3), (976, .6)]
_c['gaba']['anim'] = {'efectos': [{'r': [x - 18, 184, 36, 34], 'c': 'rgba(250,204,21,.4)', 's': '#A16207', 'sw': 3, 'a': 'pulso', 't': .9 + d} for x, d in _I],
    'flujos': [fl(f'M930 160 Q{930 + (x - 930) * .6} 172 {x} 186', 'gaba', 2, 1.1, d, rep=False, paso=.4) for x, d in _I]
            + [fl(f'M{x - 30} 176 L{x} 186 L{x + (x - 930) * .3} 260', 'cl', 3, 1.8, 1.2 + d) for x, d in _I],
    'rotulos': [rot(930, 285, 'Entra Cl⁻: PPSI', 1.6), rot(1052, 52, 'Libera GABA', .2, i=1)]}
_c['cono']['anim'] = {'efectos': [{'e': [752, 437, 32, 24], 'c': 'rgba(124,58,237,.35)', 's': '#6D28D9', 'a': 'pulso'}],
    'flujos': [fl('M752 378 L752 437', 'na', 4, 1.4)], 'rotulos': [rot(760, 500, 'Umbral → potencial de acción', .5)]}
_c['nodo']['anim'] = {'efectos': [{'e': [x, 434, 20, 26], 'c': 'rgba(124,58,237,.4)', 's': '#6D28D9', 'a': 'pulso', 't': k * .5} for k, x in enumerate((895, 1005, 1115))],
    'rotulos': [rot(1150, 380, 'Salta de nodo en nodo', 1.2, i=1)]}
A3['escala'] = 1.15
A3['guia_pie'] = 'Canales mecánicos en la piel, por ligando en las sinapsis (glutamato: Na⁺; GABA: Cl⁻) y por voltaje en el cono axónico y los nodos de Ranvier.'

# ---- Imagen de ChatGPT (27-10, noche): img/potencial/neurona-canales.jpg, 1536×1024 = plantilla ×1,28 → vb 1200×800 ----
A3['fondo'] = P + 'neurona-canales.jpg'
A3['vb'] = [1200, 800]
A3['zonas']['piel'] = {'e': [78, 400, 46, 120], 'nombre': 'la terminación sensitiva de la piel'}
A3['zonas']['inhib'] = {'e': [639, 354, 28, 24], 'nombre': 'la sinapsis inhibitoria'}
A3['zonas']['cono'] = {'e': [762, 434, 34, 26], 'nombre': 'el cono axónico'}
A3['nombres'] = [rot(30, 590, 'Terminación nerviosa libre'), rot(10, 250, 'Piel'), rot(300, 250, 'Soma sensitivo'), rot(240, 175, 'Ganglio sensitivo'), rot(170, 395, 'Axón sensitivo'),
                 rot(432, 395, 'Botón presináptico', i=1), rot(520, 468, 'Dendrita'), rot(650, 540, 'Soma'), rot(668, 350, 'Sinapsis inhibitoria'), rot(600, 40, 'Axón inhibitorio'),
                 rot(772, 400, 'Cono axónico'), rot(1005, 474, 'Nodo de Ranvier', i=1), rot(305, 470, 'Hendidura sináptica', i=1)]
_c['tacto']['anim']['efectos'] = [{'e': [78, 400, 40, 100], 'c': 'rgba(245,158,11,.28)', 's': '#F59E0B', 'a': 'pulso'}]
_c['tacto']['anim']['flujos'] = [fl('M50 330 L72 360', 'na', 3, 1.6), fl('M48 470 L72 440', 'na', 3, 1.6, .5), fl('M110 300 L92 340', 'na', 2, 1.6, .9)]
_c['tacto']['anim']['rotulos'] = [rot(130, 490, 'Entra Na⁺: potencial receptor', .8)]
_c['gaba']['anim']['efectos'] = [{'e': [639, 354, 26, 22], 'c': 'rgba(236,72,153,.3)', 's': '#BE185D', 'a': 'pulso'}] + _c['gaba']['anim']['efectos']
_c['cono']['anim']['efectos'] = [{'e': [762, 434, 30, 22], 'c': 'rgba(124,58,237,.35)', 's': '#6D28D9', 'a': 'pulso'}]
_c['cono']['anim']['flujos'] = [fl('M762 376 L762 434', 'na', 4, 1.4)]
A3['alt'] = 'Ilustración: terminación nerviosa en la piel, neurona sensitiva y segunda neurona con sus sinapsis excitatoria e inhibitoria aumentadas'

A3['zonas']['nodo'] = {'l': [[[x, 412], [x, 456]] for x in (910, 1018, 1126)], 'w': 22, 'nombre': 'un nodo de Ranvier'}
_c['nodo']['anim']['efectos'] = [{'e': [x, 434, 20, 26], 'c': 'rgba(124,58,237,.4)', 's': '#6D28D9', 'a': 'pulso', 't': k * .5} for k, x in enumerate((910, 1018, 1126))]
for r_ in A3['nombres']:
    if r_['t'] == 'Nodo de Ranvier': r_['x'] = 1018

# ---- Posiciones medidas en la ilustración (por color): receptores y nodos ----
_RE = [(559, 0), (607, .3), (653, .6)]          # receptores de glutamato: x 314–347
_RI = [(885, 0), (932, .3), (978, .6)]          # receptores de GABA: y 179–216
_NOD = (899, 1006, 1117)
_c['glu']['anim']['efectos'] = [{'r': [314, y - 16, 33, 32], 'c': 'rgba(34,197,94,.35)', 's': '#16A34A', 'sw': 3, 'a': 'pulso', 't': .9 + d} for y, d in _RE]
_c['glu']['anim']['flujos'] = ([fl(f'M290 610 Q302 {610 + (y - 610) * .6} 314 {y}', 'nt', 1, 1.1, d, rep=False, paso=.4) for y, d in _RE]
    + [fl(f'M302 {y - 40} L316 {y} L390 {y + (y - 607) * .3}', 'na', 3, 1.8, 1.2 + d) for y, d in _RE])
_c['gaba']['anim']['efectos'] = [{'e': [639, 354, 26, 22], 'c': 'rgba(236,72,153,.3)', 's': '#BE185D', 'a': 'pulso'}] + \
    [{'r': [x - 17, 180, 34, 36], 'c': 'rgba(250,204,21,.4)', 's': '#A16207', 'sw': 3, 'a': 'pulso', 't': .9 + d} for x, d in _RI]
_c['gaba']['anim']['flujos'] = ([fl(f'M932 160 Q{932 + (x - 932) * .6} 170 {x} 180', 'gaba', 1, 1.1, d, rep=False, paso=.4) for x, d in _RI]
    + [fl(f'M{x - 28} 172 L{x} 182 L{x + (x - 932) * .3} 262', 'cl', 3, 1.8, 1.2 + d) for x, d in _RI])
A3['zonas']['nodo'] = {'l': [[[x, 412], [x, 456]] for x in _NOD], 'w': 22, 'nombre': 'un nodo de Ranvier'}
_c['nodo']['anim']['efectos'] = [{'e': [x, 434, 20, 26], 'c': 'rgba(124,58,237,.4)', 's': '#6D28D9', 'a': 'pulso', 't': k * .5} for k, x in enumerate(_NOD)]
for r_ in A3['nombres']:
    if r_['t'] == 'Nodo de Ranvier': r_['x'] = 1006

# ==== Esquema 1200×800 (27-10, 23 h): inhibitoria a la izquierda, aumento del cono con canales de voltaje, mini-registro ====
A3['fondo'] = P + 'neurona-canales.svg'
A3['vb'] = [1200, 800]
A3['zonas'] = {'piel': {'e': [70, 420, 46, 110], 'nombre': 'la terminación sensitiva de la piel'},
      'somas': {'e': [240, 290, 38, 38], 'nombre': 'el soma de la neurona sensitiva (en el ganglio)'},
      'axs': {'r': [118, 416, 300, 28], 'nombre': 'el axón de la neurona sensitiva'},
      'sinapsis': {'e': [438, 430, 32, 30], 'nombre': 'la sinapsis sobre la dendrita'},
      'zoomE': {'e': [305, 625, 132, 132], 'nombre': 'el aumento de la sinapsis excitatoria'},
      'dendrita': {'l': [[[462, 432], [590, 432]]], 'w': 18, 'nombre': 'la dendrita'},
      'inhib': {'e': [598, 368, 26, 22], 'nombre': 'la sinapsis inhibitoria'},
      'zoomI': {'e': [450, 138, 110, 110], 'nombre': 'el aumento de la sinapsis inhibitoria'},
      'soma': {'e': [640, 452, 76, 58], 'nombre': 'el soma de la segunda neurona'},
      'cono': {'e': [750, 437, 34, 26], 'nombre': 'el cono axónico'},
      'zoomC': {'e': [935, 200, 125, 125], 'nombre': 'el aumento del cono axónico'},
      'nodo': {'l': [[[x, 412], [x, 456]] for x in (895, 1005, 1115)], 'w': 22, 'nombre': 'un nodo de Ranvier'},
      'mielina': {'r': [800, 414, 400, 40], 'nombre': 'la vaina de mielina'}}
A3['nombres'] = [rot(10, 285, 'Piel'), rot(30, 585, 'Terminación nerviosa libre'), rot(276, 290, 'Soma sensitivo'), rot(150, 232, 'Ganglio sensitivo'),
                 rot(170, 395, 'Axón sensitivo'), rot(430, 395, 'Botón presináptico', i=1), rot(520, 468, 'Dendrita'), rot(650, 540, 'Soma'),
                 rot(570, 368, 'Sinapsis inhibitoria', i=1), rot(598, 30, 'Axón inhibitorio'), rot(762, 476, 'Cono axónico'), rot(1005, 474, 'Nodo de Ranvier', i=1),
                 rot(300, 482, 'Hendidura sináptica', i=1)]
_c['tacto']['pasos'][0]['ok'] = ['piel']
_c['glu']['pasos'][0]['ok'] = ['sinapsis', 'zoomE', 'dendrita']
_c['gaba']['pasos'][0]['ok'] = ['inhib', 'zoomI']
_c['cono']['pasos'][0]['ok'] = ['cono', 'zoomC']
_c['cono']['pasos'][0]['pista'] = 'Está entre el soma y el comienzo del axón (o su aumento, arriba a la derecha).'

def registro(pts, etq, xe, ye, t0=1.4, extra=()):
    """Mini-registro del potencial en el cono axónico (recuadro abajo al centro)."""
    return ([{'r': [470, 662, 340, 120], 'c': 'rgba(255,255,255,.96)', 's': '#CBD5E1', 'sw': 2, 't': 0},
             {'l': [[[488, 742], [792, 742]]], 'w': 2, 'c': '#94A3B8', 'dash': '6 5', 't': 0},
             {'l': [[[488, 706], [792, 706]]], 'w': 2, 'c': '#DC2626', 'dash': '6 5', 't': 0},
             {'l': [pts], 'w': 4, 'c': '#7C3AED', 'a': 'traza', 't': t0, 'dur': 2}] + list(extra),
            [rot(478, 680, 'Registro en el cono axónico'), rot(794, 742, 'Reposo', i=1), rot(794, 706, 'Umbral', i=1), rot(xe, ye, etq, t0 + 1.2)])
_ppse = [[488, 742], [560, 742], [585, 728], [610, 718], [640, 724], [690, 736], [792, 742]]
_ppsi = [[488, 742], [560, 742], [585, 754], [610, 762], [640, 758], [690, 748], [792, 742]]
_pa = [[488, 742], [560, 742], [590, 722], [612, 706], [622, 672], [632, 666], [642, 690], [652, 760], [672, 766], [720, 752], [792, 744]]

_RE = [(577, 0), (625, .3), (673, .6)]
_ef, _ro = registro(_ppse, 'PPSE', 640, 708)
_c['glu']['anim'] = {'efectos': _ef + [{'r': [310, y - 17, 30, 34], 'c': 'rgba(34,197,94,.4)', 's': '#16A34A', 'sw': 3, 'a': 'pulso', 't': .9 + d} for y, d in _RE],
    'flujos': [fl(f'M287 625 Q300 {625 + (y - 625) * .6} 311 {y}', 'nt', 1, 1, d, rep=False, paso=.4) for y, d in _RE]
            + [fl(f'M302 {y - 38} L314 {y} L392 {y + (y - 625) * .3}', 'na', 3, 1.8, 1.3 + d) for y, d in _RE],
    'rotulos': _ro + [rot(392, 545, 'Entra Na⁺', 1.6)]}
_RI = [(408, 0), (450, .3), (492, .6)]
_ef, _ro = registro(_ppsi, 'PPSI', 640, 776)
_c['gaba']['anim'] = {'efectos': _ef + [{'e': [598, 368, 24, 20], 'c': 'rgba(236,72,153,.3)', 's': '#BE185D', 'a': 'pulso'}]
            + [{'r': [x - 9, 134, 33, 32], 'c': 'rgba(250,204,21,.45)', 's': '#A16207', 'sw': 3, 'a': 'pulso', 't': .9 + d} for x, d in _RI],
    'flujos': [fl(f'M450 108 Q{450 + (x - 450) * .6} 122 {x + 7} 136', 'gaba', 1, 1, d, rep=False, paso=.4) for x, d in _RI]
            + [fl(f'M{x - 18} 140 L{x + 7} 150 L{x + 7 + (x - 450) * .3} 222', 'cl', 3, 1.8, 1.3 + d) for x, d in _RI],
    'rotulos': _ro + [rot(450, 232, 'Entra Cl⁻', 1.6)]}
_RC = [(880, 0), (942, .25), (1004, .5)]
_ef, _ro = registro(_pa, 'Potencial de acción', 650, 668, t0=.6)
_c['cono']['anim'] = {'efectos': _ef + [{'e': [750, 437, 30, 22], 'c': 'rgba(124,58,237,.35)', 's': '#6D28D9', 'a': 'pulso'}]
            + [{'r': [x - 34, 175, 60, 60], 'c': 'rgba(94,234,212,.35)', 's': '#0F766E', 'sw': 3, 'a': 'pulso', 't': 1 + d} for x, d in _RC],
    'flujos': [fl('M600 440 L700 438 L740 437', 'na', 3, 1.2, 0), ]
            + [fl(f'M{x} 120 L{x} 205 L{x + (x - 942) * .2} 290', 'na', 3, 1.5, 1.2 + d) for x, d in _RC],
    'rotulos': _ro + [rot(935, 112, 'Se abren por voltaje: no hay neurotransmisor', 1.4), rot(560, 400, 'Llega la despolarización (sin inhibición)', .2, i=1)]}
_c['cono']['situacion'] = 'Los PPSE de las dendritas se suman y la inhibición está apagada: la despolarización llega a la zona gatillo. Mira su aumento, arriba a la derecha.'
_c['tacto']['anim'] = {'efectos': [{'e': [70, 420, 40, 95], 'c': 'rgba(245,158,11,.28)', 's': '#F59E0B', 'a': 'pulso'}],
    'flujos': [fl('M40 350 L60 380', 'na', 3, 1.6), fl('M40 490 L62 460', 'na', 3, 1.6, .5), fl('M100 330 L84 362', 'na', 2, 1.6, .9)],
    'rotulos': [rot(130, 490, 'Entra Na⁺: potencial receptor', .8)]}
_c['nodo']['anim'] = {'efectos': [{'e': [x, 434, 20, 26], 'c': 'rgba(124,58,237,.4)', 's': '#6D28D9', 'a': 'pulso', 't': k * .5} for k, x in enumerate((895, 1005, 1115))],
    'rotulos': [rot(1150, 380, 'Salta de nodo en nodo', 1.2, i=1)]}
A3['alt'] = 'Neurona sensitiva y segunda neurona con los aumentos de la sinapsis excitatoria, la sinapsis inhibitoria y el cono axónico'
A3['guia_pie'] = 'Canales mecánicos en la piel, por ligando en las sinapsis (glutamato: Na⁺; GABA: Cl⁻) y por voltaje en el cono axónico y los nodos de Ranvier.'

# mini-registro: el marco está en el esquema; la animación dibuja solo la curva y su etiqueta
def registro(pts, etq, xe, ye, t0=1.4, extra=()):
    return ([{'l': [pts], 'w': 4, 'c': '#7C3AED', 'a': 'traza', 't': t0, 'dur': 2}] + list(extra), [rot(xe, ye, etq, t0 + 1.2)])
_ppse = [[484, 750], [560, 750], [585, 736], [610, 727], [640, 732], [690, 745], [760, 750]]
_ppsi = [[484, 750], [560, 750], [585, 760], [610, 768], [640, 765], [690, 755], [760, 750]]
_pa = [[484, 750], [550, 750], [585, 728], [606, 712], [616, 668], [626, 662], [636, 690], [646, 768], [666, 774], [712, 760], [760, 752]]
for k_, pts_, etq_, xe_, ye_, t_ in (('glu', _ppse, 'PPSE', 650, 724, 1.4), ('gaba', _ppsi, 'PPSI', 650, 775, 1.4), ('cono', _pa, 'Potencial de acción', 640, 666, .6)):
    a_ = _c[k_]['anim']
    a_['efectos'] = [e for e in a_['efectos'] if not (e.get('r') == [470, 662, 340, 120] or (e.get('l') and e['l'][0][0][0] == 488))]
    a_['efectos'] = registro(pts_, etq_, xe_, ye_, t_)[0] + a_['efectos']
    a_['rotulos'] = [r for r in a_['rotulos'] if r['t'] not in ('Registro en el cono axónico', 'Reposo', 'Umbral', 'PPSE', 'PPSI', 'Potencial de acción')] + registro(pts_, etq_, xe_, ye_, t_)[1]
for r in _c['cono']['anim']['rotulos']:
    if r['t'].startswith('Se abren por voltaje'): r.update({'t': 'Abren por voltaje', 'x': 870, 'y': 350})
    if r['t'].startswith('Llega la despolarización'): r.update({'t': 'Llega la despolarización', 'x': 760, 'y': 384, 'i': 0})
    r.pop('i', None) if r.get('i') == 0 else None

for r in _c['cono']['anim']['rotulos']:
    if r['t'] == 'Abren por voltaje': r.update({'x': 1062, 'y': 340, 'i': 1})
    if r['t'] == 'Llega la despolarización': r.update({'x': 760, 'y': 394})
    if r['t'] == 'Potencial de acción': r.update({'x': 664, 'y': 692})

# ==== Corpúsculo de Pacini (presión) con su aumento arriba a la izquierda ====
A3['zonas'].pop('piel', None)
A3['zonas']['pacini'] = {'e': [72, 430, 40, 28], 'nombre': 'el corpúsculo de Pacini'}
A3['zonas']['zoomM'] = {'e': [135, 118, 100, 100], 'nombre': 'el aumento del corpúsculo de Pacini'}
A3['nombres'] = [r for r in A3['nombres'] if r['t'] != 'Terminación nerviosa libre'] + [rot(40, 470, 'Corpúsculo de Pacini')]
for r in A3['nombres']:
    if r['t'] == 'Piel': r.update({'x': 6, 'y': 300})
_ct = _c['tacto']
_ct['situacion'] = 'Alguien presiona la yema de tu dedo. En la dermis profunda, un corpúsculo de Pacini (una terminación nerviosa envuelta en capas, como una cebolla) tiene canales que se abren cuando la presión deforma su membrana.'
_ct['pasos'][0]['p'] = '¿Dónde se abren esos canales?'
_ct['pasos'][0]['ok'] = ['pacini', 'zoomM']
_ct['pasos'][0]['pista'] = 'Busca el corpúsculo en capas dentro de la piel (o su aumento, arriba a la izquierda).'
_ct['fila'] = ['Presión', 'Corpúsculo de Pacini (dermis profunda)', 'Deformación de la membrana (mecánico)', 'Potencial receptor (despolariza)']
_ct['exp'] = 'La presión comprime las capas del corpúsculo de Pacini y estira la membrana del terminal: se abren canales mecanosensibles (como PIEZO2), entra Na⁺ y se genera un potencial receptor graduado (más presión, más despolarización). Las terminaciones libres responden sobre todo a dolor y temperatura; el tacto fino de la yema lo detectan los corpúsculos de Meissner.'
_RM = [(110, 0), (145, .25), (180, .5)]
_ct['anim'] = {'efectos': [{'e': [135, 118, 80, 60], 'c': 'rgba(245,158,11,.18)', 's': '#E7A57E', 'sw': 4, 'a': 'pulso'},
                           {'e': [72, 430, 34, 22], 'c': 'rgba(245,158,11,.3)', 's': '#F59E0B', 'a': 'pulso'}]
            + [{'r': [x - 9, 95, 18, 46], 'c': 'rgba(129,140,248,.4)', 's': '#3730A3', 'sw': 3, 'a': 'pulso', 't': .8 + d} for x, d in _RM],
    'flujos': [fl(f'M{x} 60 L{x} 108 L{x + 4} 118', 'na', 2, 1.5, 1 + d) for x, d in _RM],
    'rotulos': [rot(135, 30, '⬇ Presión', 0), rot(40, 238, 'Entra Na⁺: potencial receptor', 1.4)]}

# ==== Ilustración de ChatGPT con los 4 aumentos (27-10, 23:40): misma escala ×1,28 que el SVG 1200×800 ====
A3['fondo'] = P + 'neurona-canales.jpg'

# ==== Revelado progresivo (27-10, noche): base sin aumentos ni marcas; al resolver cada caso aparece su aumento ====
A3['fondo'] = P + 'neurona-canales-base.jpg'
A3['guia_src'] = P + 'neurona-canales.jpg'
for k_, f_ in (('tacto', 'pacini'), ('glu', 'glu'), ('gaba', 'gaba'), ('cono', 'cono')):
    _c[k_]['fondo_ok'] = P + f'neurona-canales-{f_}.jpg'
for z_ in ('zoomM', 'zoomE', 'zoomI', 'zoomC'): A3['zonas'].pop(z_, None)
_c['tacto']['pasos'][0]['ok'] = ['pacini']
_c['glu']['pasos'][0]['ok'] = ['sinapsis', 'dendrita']
_c['gaba']['pasos'][0]['ok'] = ['inhib']
_c['cono']['pasos'][0]['ok'] = ['cono']
_c['tacto']['pasos'][0]['pista'] = 'Busca el corpúsculo en capas dentro de la piel.'
_c['glu']['pasos'][0]['pista'] = 'Busca el botón donde termina el axón sensitivo.'
_c['gaba']['pasos'][0]['pista'] = 'Busca el botón del axón que baja desde arriba.'
_c['cono']['pasos'][0]['pista'] = 'Está entre el soma y el comienzo del axón.'
_c['cono']['situacion'] = 'Los PPSE de las dendritas se suman y la inhibición está apagada: la despolarización llega a la zona gatillo.'
A3['alt'] = 'Neurona sensitiva con su corpúsculo de Pacini y segunda neurona con sus sinapsis excitatoria e inhibitoria; al resolver cada caso aparece su aumento'
# cono: la despolarización llega por corriente local (onda, sin iones); el Na⁺ entra solo por los canales de voltaje del aumento
_a = _c['cono']['anim']
_a['flujos'] = [f for f in _a['flujos'] if not f.get('d', '').startswith('M600 440')]
_a['efectos'] = [{'l': [[[640, 440], [748, 437]]], 'w': 8, 'c': 'rgba(124,58,237,.55)', 'a': 'traza', 't': 0, 'dur': .8}] + _a['efectos']

# ==== Capas acumulativas (28-10): cada aumento queda visible al resolverse; registro con glu, gaba o cono ====
for k_ in ('tacto', 'glu', 'gaba', 'cono'): _c[k_].pop('fondo_ok', None)
A3['capas'] = [{'src': P + 'capa-pacini.webp', 'casos': ['tacto']}, {'src': P + 'capa-glu.webp', 'casos': ['glu']},
               {'src': P + 'capa-gaba.webp', 'casos': ['gaba']}, {'src': P + 'capa-cono.webp', 'casos': ['cono']},
               {'src': P + 'capa-registro.webp', 'casos': ['glu', 'gaba', 'cono']}]
# PA más bajo (no tapa el título del registro) y rótulo corto junto al peak
_pa2 = [[484, 750], [550, 750], [585, 730], [604, 714], [614, 692], [624, 688], [634, 706], [646, 768], [666, 774], [712, 760], [760, 752]]
_a = _c['cono']['anim']
for e_ in _a['efectos']:
    if e_.get('a') == 'traza' and e_.get('c') == '#7C3AED': e_['l'] = [_pa2]
for r_ in _a['rotulos']:
    if r_['t'] == 'Potencial de acción': r_.update({'t': 'PA', 'x': 664, 'y': 730})

# ==== Nombres sin choques con los aumentos (28-10); «Hendidura sináptica» solo con su aumento ====
_l['potencial']['exp'] = _l['potencial']['exp'].replace(' Desde ahora tienes «Armar reposo».', '')
A3['nombres'] = [rot(6, 300, 'Piel'), rot(84, 392, 'Corpúsculo de Pacini'), rot(150, 232, 'Ganglio sensitivo'), rot(276, 290, 'Soma sensitivo'),
                 rot(150, 458, 'Axón sensitivo'), rot(444, 452, 'Botón presináptico'), rot(500, 412, 'Dendrita'), rot(650, 540, 'Soma'),
                 rot(600, 352, 'Sinapsis inhibitoria'), rot(598, 30, 'Axón inhibitorio'), rot(752, 410, 'Cono axónico'), rot(895, 458, 'Nodo de Ranvier'),
                 dict(rot(307, 752, 'Hendidura sináptica', i=1), con='glu')]
# =====================================================================================
# ACTIVIDAD 15 · versión con simulador propio (28-10): js/sim-pa.js, 3 niveles, un paso por caso.
# Reemplaza B1–B5 (PhET Neuron). Esquemas y guías: docs/practico-3_svg2.py (coordenadas en docs/practico-3_coords2.json).
# =====================================================================================
C2 = json.load(open(os.path.join(RAIZ, 'docs/practico-3_coords2.json')))
TZ = C2['trazas']
def tr(k, col, t, dur=1.1, w=6): return {'l': [TZ[k]], 'w': w, 'c': col, 'a': 'traza', 't': t, 'dur': dur}
def pulso(x, y, r, col, t, s=None): return {'e': [x, y, r, r], 'c': col, 's': s or 'none', 'a': 'pulso', 't': t}

B1 = {'n': 1, 'tipo': 'escenas', 'modo': 'casos', 'simulador': 'pa',
  'titulo': 'Del potencial local al potencial de acción', 'subtitulo': 'Umbral, todo o nada y sumación',
  'fondo': P + 'decremento.svg', 'vb': VB, 'alt': 'Neurona con dos sinapsis (A y B) y tres registros: en la dendrita, en el soma y en el cono axónico',
  'cuadro': ['Estímulo', '¿Llega al umbral?', 'Resultado'],
  'guia_src': P + 'guia-pa-1.svg', 'guia_img': 'Potencial local y potencial de acción', 'guia_pie': 'Los potenciales locales crecen con el estímulo y se suman; el potencial de acción es todo o nada. Curvas del simulador.',
  'instrucciones': 'En cada caso haz lo que pide la lista en el <strong>simulador</strong>: se marca sola cuando termina el registro y, al completarla, se habilita la pregunta. Elige la intensidad con <strong>− +</strong> y presiona <strong>⚡ Estimular</strong>: el electrodo inyecta corriente en la membrana, como una sinapsis excitatoria. Cada registro dura 20 ms (el simulador va 400 veces más lento) y el anterior queda en gris para comparar.',
  'casos': [
    {'clave': 'debil', 'titulo': 'Un estímulo débil', 'corto': 'Débil',
     'situacion': 'Registras la membrana del cono axónico en reposo (−70 mV).',
     'pasos': [simp('Estimula con intensidad 1 o 2:', [('Intensidad 1 o 2', 'nivelBajo'), ('Registro sin potencial de acción', 'sub')],
        'Presiona ⚡ Estimular y espera que termine el registro.',
        q=qq('¿Qué ocurrió?', ['Potencial local: no llegó al umbral', 'Potencial local: superó el umbral', 'Potencial de acción: no llegó al umbral', 'Potencial de acción: superó el umbral'], 0,
             'Compara el punto más alto de la curva con la línea roja.'))],
     'fila': ['No', 'Potencial local que se apaga'],
     'exp': 'Un estímulo débil produce un potencial local: pequeño, graduado (crece con el estímulo) y que se apaga en pocos milisegundos. Si no alcanza el umbral (≈ −55 mV), no hay potencial de acción.'},
    {'clave': 'fuerte', 'titulo': 'Estímulos más fuertes', 'corto': 'Más fuerte',
     'pasos': [simp('Dispara potenciales de acción con dos intensidades distintas:', [('Un potencial de acción', 'pa'), ('Otro con otra intensidad (3, 4 o 5)', 'dosNiveles')],
        'Un estímulo por registro.',
        q=qq('Al subir la intensidad, el potencial de acción…', ['Mantuvo su altura', 'Aumentó su altura', 'Disminuyó su altura', 'Duró el doble'], 0,
             'Compara el peak de la curva morada con el de la gris.'))],
     'fila': ['Sí', 'Potencial de acción de igual altura'],
     'exp': 'El potencial de acción es «todo o nada»: si se alcanza el umbral, su forma y su altura (peak ≈ +35 mV) no dependen del estímulo. La intensidad de un estímulo se codifica en la frecuencia de potenciales de acción y en cuántas neuronas disparan.'},
    {'clave': 'suma', 'titulo': 'Dos estímulos débiles seguidos', 'corto': 'Sumación',
     'pasos': [simp('Con intensidad 2, estimula dos veces seguidas:', [('Intensidad 2', 'nivel2'), ('Potencial de acción con dos estímulos de intensidad 2', 'suma')],
        'Presiona ⚡ Estimular dos veces rápido, antes de que baje la primera curva.',
        q=qq('¿Por qué apareció el potencial de acción?', ['Se sumaron y llegaron al umbral', 'Se restaron y bajaron del umbral', 'El segundo fue más intenso', 'El primero abrió los canales de K⁺'], 0,
             'Uno solo de intensidad 2 no lo lograba.'))],
     'fila': ['Sí, sumados', 'Potencial de acción por sumación temporal'],
     'exp': 'Sumación temporal: un segundo potencial local llega antes de que el primero se apague y la suma alcanza el umbral. Ahí se abren en cadena los canales de Na⁺ controlados por voltaje.'},
    {'clave': 'distancia', 'titulo': 'Una sinapsis lejana', 'corto': 'Distancia', 'esquema': True,
     'situacion': 'La sinapsis A está en la punta de una dendrita. En ese punto produce un PPSE de 14 mV.',
     'pasos': [el('¿Cómo llega ese PPSE al cono axónico?', ['Más pequeño', 'Más grande', 'Igual de grande', 'Invertido'], 0,
                  pista='La corriente se va perdiendo por la membrana en el camino.')],
     'fila': ['Solo A + B', 'A sola: PPSE pequeño en el cono; A + B: potencial de acción (sumación espacial)'],
     'anim': {'efectos': [pulso(94, 600, 30, 'rgba(236,72,153,.35)', 0, '#BE185D'), tr('A0', '#7C3AED', .3), tr('A1', '#7C3AED', 1.0), tr('A2', '#7C3AED', 1.7),
                          pulso(94, 600, 30, 'rgba(236,72,153,.35)', 3.0, '#BE185D'), pulso(250, 432, 30, 'rgba(236,72,153,.35)', 3.0, '#BE185D'), tr('AB2', '#16A34A', 3.4, 1.4)],
              'rotulos': [rot(150, 288, 'PPSE 14 mV', .9), rot(560, 288, '8 mV', 1.6), rot(868, 288, '4 mV', 2.3), rot(1010, 288, 'A + B: PA', 4.6)]},
     'exp': 'El potencial local decrece con la distancia: la corriente se pierde por la membrana en el camino, y una sinapsis lejana sola no alcanza el umbral en el cono axónico. Si A y B se activan a la vez, sus potenciales se suman (sumación espacial) y pueden disparar el potencial de acción. Los PPSI restan.'},
  ]}

B2 = {'n': 2, 'tipo': 'escenas', 'modo': 'casos', 'simulador': 'pa',
  'titulo': 'Las fases y sus canales', 'subtitulo': 'Despolarización, repolarización e hiperpolarización',
  'fondo': P + 'guia-pa-2.svg', 'vb': VB, 'alt': 'Potencial de acción con sus tres fases',
  'cuadro': ['Fase', 'Canales de Na⁺', 'Canales de K⁺', 'Ion que se mueve'],
  'guia_src': P + 'guia-pa-2.svg', 'guia_img': 'Las fases del potencial de acción', 'guia_pie': 'a despolarización (entra Na⁺) · b repolarización (Na⁺ inactivado, sale K⁺) · c hiperpolarización (el K⁺ cierra lento). Valores del simulador.',
  'instrucciones': 'Dispara un potencial de acción y, cuando termine el registro, <strong>arrastra el cursor</strong> sobre la curva: el voltímetro y los canales de la membrana muestran ese instante. En cada caso lleva el cursor a la fase que se pide y responde. Los canales de Na⁺ tienen dos compuertas: la de activación (afuera) y la de inactivación (la bola roja, adentro); los de K⁺, una sola. Cada fase llena una fila del <strong>cuadro</strong>.',
  'casos': [
    {'clave': 'despol', 'titulo': 'a · Despolarización', 'corto': 'a · Despolarización',
     'pasos': [simp('Dispara un potencial de acción y lleva el cursor a la subida:', [('Potencial de acción en el registro', 'pa'), ('Cursor en la subida', 'curDespol')],
        'Intensidad 3 o más; cuando termine el registro, arrastra sobre la curva.',
        q=qq('¿Por qué la subida es tan rápida?', ['El Na⁺ que entra abre más canales de Na⁺', 'El K⁺ que sale abre más canales de Na⁺', 'El Na⁺ que entra cierra los canales de K⁺', 'El Cl⁻ que entra abre más canales de Na⁺'], 0,
             'Los canales de Na⁺ se abren con la despolarización.'))],
     'fila': ['Abiertos', 'Cerrados (se abren tarde)', 'Na⁺ entra'],
     'exp': 'Al llegar al umbral se abre la compuerta de activación de los canales de Na⁺: entra Na⁺, el interior se despolariza más y eso abre más canales (retroalimentación positiva). El interior llega a ≈ +35 mV. Los canales de K⁺ también responden al voltaje, pero más lento.'},
    {'clave': 'repol', 'titulo': 'b · Repolarización', 'corto': 'b · Repolarización',
     'pasos': [simp('Lleva el cursor a la bajada, desde el peak:', [('Cursor en la bajada', 'curRepol')],
        'Es el tramo que baja desde el punto más alto hasta el reposo.',
        q=qq('¿Qué detiene la entrada de Na⁺ en el peak?', ['Se cierra su compuerta de inactivación', 'Se cierra su compuerta de activación', 'Se acaba el Na⁺ del medio extracelular', 'La bomba saca el Na⁺ que entró'], 0,
             'Mira la bola roja de los canales de Na⁺.'))],
     'fila': ['Inactivados', 'Abiertos', 'K⁺ sale'],
     'exp': 'Poco después de abrirse, la compuerta de inactivación tapa los canales de Na⁺ y deja de entrar Na⁺, aunque la membrana siga despolarizada. Mientras, se abren los canales de K⁺: sale K⁺ y el interior vuelve a ser negativo. La bomba Na⁺/K⁺ no participa: es demasiado lenta.'},
    {'clave': 'hiper', 'titulo': 'c · Hiperpolarización', 'corto': 'c · Hiperpolarización',
     'pasos': [simp('Lleva el cursor al tramo bajo el reposo:', [('Cursor en la hiperpolarización', 'curHiper')],
        'Después de bajar, la curva queda un rato bajo la línea del reposo.',
        q=qq('¿Por qué baja de −70 mV?', ['El K⁺ sigue saliendo: su canal cierra lento', 'El Na⁺ sigue entrando: su canal cierra lento', 'La bomba Na⁺/K⁺ se acelera al final', 'Entra Cl⁻ por canales que abren al final'], 0,
             '¿Qué compuerta tarda en cerrarse?'))],
     'fila': ['Cerrados (se recuperan)', 'Abiertos (cierran lento)', 'K⁺ sigue saliendo'],
     'exp': 'Los canales de K⁺ se cierran lentamente: sale más K⁺ que en reposo y el interior baja a ≈ −81 mV, cerca del potencial de equilibrio del K⁺. Mientras, los canales de Na⁺ se recuperan de la inactivación y quedan cerrados, listos para abrirse otra vez. El simulador usa el modelo de Hodgkin y Huxley (axón de calamar); en una neurona de mamífero el potencial de acción dura ≈ 1–2 ms.'},
  ]}

Z_N = {f'n{i + 1}': {'e': [x, 380, 46, 46], 'nombre': f'el nodo {i + 1}'} for i, x in enumerate(C2['nodos'])}
NX = C2['nodos']
B3 = {'n': 3, 'tipo': 'escenas', 'modo': 'casos', 'simulador': 'pa',
  'titulo': 'El período refractario', 'subtitulo': 'Absoluto, relativo y para qué sirve',
  'fondo': P + 'axon-refractario.svg', 'vb': VB, 'alt': 'Axón mielinizado con cinco nodos de Ranvier; el potencial de acción está en el nodo 3',
  'donde': 'el axón', 'zonas': Z_N,
  'guia_src': P + 'guia-pa-3.svg', 'guia_img': 'Períodos refractarios', 'guia_pie': 'Rojo: absoluto (ningún estímulo dispara). Amarillo: relativo (solo uno más intenso, y el potencial de acción sale más bajo). Curva del simulador.',
  'instrucciones': 'Ahora estimulas dos veces en el mismo registro: la segunda, durante el primer potencial de acción o poco después. La lista se marca sola cuando termina el registro. En el último caso, toca en el axón.',
  'casos': [
    {'clave': 'abs', 'titulo': 'Durante el potencial de acción', 'corto': 'Absoluto',
     'pasos': [simp('Con intensidad 5, estimula otra vez durante el potencial de acción:', [('Intensidad 5', 'nivelMax'), ('Segundo estímulo sin segundo potencial de acción', 'refAbs')],
        'Presiona ⚡ Estimular dos veces seguidas: la segunda, mientras la curva está arriba.',
        q=qq('¿Por qué no hubo un segundo potencial de acción?', ['Los canales de Na⁺ están inactivados', 'Los canales de K⁺ están inactivados', 'Se acabó el Na⁺ del medio extracelular', 'La bomba Na⁺/K⁺ está apagada'], 0,
             'Mira la bola roja de los canales de Na⁺.'))],
     'exp': 'Período refractario absoluto: mientras los canales de Na⁺ están abiertos o inactivados, ningún estímulo, por intenso que sea, dispara otro potencial de acción. Dura hasta que se recuperan suficientes canales de la inactivación (en el simulador ≈ 6 ms; en una neurona de mamífero ≈ 1 ms).'},
    {'clave': 'rel', 'titulo': 'Durante la hiperpolarización', 'corto': 'Relativo',
     'pasos': [simp('Estimula con intensidad 5 y otra vez durante la hiperpolarización:', [('Segundo potencial de acción, más bajo, en el mismo registro', 'refRel')],
        'Cuando la curva lleve un momento bajo el reposo (unos 3 segundos), vuelve a estimular.',
        q=qq('¿Por qué el segundo potencial de acción fue más bajo?', ['Aún hay canales de Na⁺ inactivados', 'Aún hay canales de K⁺ inactivados', 'Ya no queda Na⁺ en el medio extracelular', 'La bomba Na⁺/K⁺ aún está apagada'], 0,
             'No todos los canales de Na⁺ se han recuperado.'))],
     'exp': 'Período refractario relativo: algunos canales de Na⁺ ya se recuperaron, pero otros siguen inactivados y los de K⁺ siguen abiertos. Solo un estímulo más intenso que lo normal dispara, y el potencial de acción sale más bajo.'},
    {'clave': 'sentido', 'titulo': 'En el axón', 'corto': 'Un solo sentido', 'esquema': True,
     'situacion': 'El potencial de acción viene desde el soma y ahora está en el nodo 3.',
     'pasos': [tq('¿A qué nodo vecino no puede pasar ahora? Tócalo.', ['n2'], 'Piensa por dónde pasó hace un instante.',
                  qq('Por eso, el impulso en el axón…', ['Avanza en un solo sentido', 'Avanza en ambos sentidos', 'Se detiene en cada nodo', 'Vuelve hacia el soma'], 0, 'El nodo de atrás está refractario.'))],
     'anim': {'efectos': [{'e': [NX[1], 380, 40, 40], 'c': 'rgba(248,113,113,.45)', 's': '#DC2626', 'a': 'crece', 't': 0},
                          pulso(NX[3], 380, 36, 'rgba(245,158,11,.4)', .8, '#F59E0B'),
                          {'e': [NX[2], 380, 40, 40], 'c': 'rgba(248,113,113,.45)', 's': '#DC2626', 'a': 'crece', 't': 1.4},
                          pulso(NX[4], 380, 36, 'rgba(245,158,11,.4)', 2.0, '#F59E0B'),
                          {'e': [NX[3], 380, 40, 40], 'c': 'rgba(248,113,113,.45)', 's': '#DC2626', 'a': 'crece', 't': 2.6}],
              'rotulos': [rot(NX[1], 500, 'Refractario', .3), rot(NX[4] + 40, 300, 'Avanza →', 2.0, i=1)]},
     'exp': 'El nodo que acaba de disparar queda refractario: la corriente local no puede volver a excitarlo, así que el impulso avanza en un solo sentido, del soma hacia los botones terminales. El período refractario también pone un techo a la frecuencia de disparo (cientos de potenciales de acción por segundo).'},
  ]}

# ---- Nivel I más simple (28-10, 01:30): neurona sin canales, botones de intensidad, máx. 2 estímulos seguidos; sin «Distancia» ----
B1['casos'] = [c for c in B1['casos'] if c['clave'] != 'distancia']
B1['sim_cfg'] = {'vista': 'neurona', 'max': 2, 'ventana': 2}
B2['sim_cfg'] = {'max': 1}
B3['sim_cfg'] = {'max': 2}
B1['fondo'] = P + 'guia-pa-1.svg'
B1['alt'] = 'Potenciales locales y potencial de acción'
B1['instrucciones'] = ('En cada caso haz lo que pide la lista en el <strong>simulador</strong>: se marca sola cuando termina el registro y, al completarla, se habilita la pregunta. '
    'Elige la intensidad (1 débil … 5 fuerte) y presiona <strong>⚡ Estimular</strong>: el electrodo inyecta corriente en el soma y el otro registra el potencial en el cono axónico. '
    'Cada registro dura 20 ms (el simulador va 400 veces más lento) y el anterior queda en gris para comparar. En un registro caben dos estímulos, el segundo justo después del primero.')
_b1 = {c['clave']: c for c in B1['casos']}
_b1['debil']['situacion'] = 'La neurona está en reposo (−70 mV).'
_b1['debil']['pasos'][0]['q']['pista'] = 'Mira si el cono axónico se encendió y compara la curva con la línea roja.'
_b1['fuerte']['pasos'][0]['pista'] = 'Un estímulo por registro; espera que termine antes del siguiente.'
_b1['fuerte']['exp'] += ' «Todo o nada» vale para un potencial de acción que parte del reposo: justo después, la membrana es refractaria (nivel III).'
_b1['suma']['pasos'][0]['pista'] = 'Presiona ⚡ Estimular dos veces rápido; después el botón queda gris hasta que termine el registro.'

# ---- Niveles II y III (28-10, 07:30): intensidad fija en II, 4 canales de Na⁺ que se abren en cadena, flechas con el cursor; pares de estímulos en III ----
B2['sim_cfg'] = {'max': 1, 'intensidad': 3}
B2['instrucciones'] = ('Presiona <strong>⚡ Estimular</strong> para disparar un potencial de acción y, cuando termine el registro, <strong>arrastra el cursor</strong> sobre la curva: '
    'el voltímetro y los canales de la membrana muestran ese instante, con una flecha en cada canal por donde pasa un ion. En cada caso lleva el cursor a la fase que se pide y responde. '
    'Los canales de Na⁺ tienen dos compuertas: la de activación (afuera) y la de inactivación (la bola roja, adentro); los de K⁺, una sola. Cada fase llena una fila del <strong>cuadro</strong>.')
_b2 = {c['clave']: c for c in B2['casos']}
_b2['despol']['pasos'][0]['pista'] = 'Presiona ⚡ Estimular; cuando termine el registro, arrastra sobre la curva del registro hasta la subida.'
_b2['despol']['pasos'][0]['q']['pista'] = 'Mira cuántos canales de Na⁺ están abiertos al comienzo y al final de la subida.'
_b2['repol']['pasos'][0]['pista'] = 'Arrastra sobre la curva del registro hasta el tramo que baja desde el punto más alto.'
_b2['hiper']['pasos'][0]['pista'] = 'Arrastra sobre la curva del registro hasta el tramo que queda bajo la línea del reposo.'
_b2['hiper']['pasos'][0]['q']['pista'] = 'Mira qué canales tienen flecha en este tramo.'
_b2['despol']['exp'] = 'Al llegar al umbral se abre la compuerta de activación de los canales de Na⁺: entra Na⁺, el interior se despolariza más y eso abre más canales (retroalimentación positiva). Por eso la subida es casi vertical y llega a ≈ +35 mV. Los canales de K⁺ también responden al voltaje, pero más lento.'

B3['sim_cfg'] = {'par': True}
B3['instrucciones'] = ('Ahora cada <strong>⚡ Estimular</strong> da un par de estímulos: el 1.º de intensidad 3 y el 2.º con el <strong>intervalo</strong> y la <strong>intensidad</strong> que elijas. '
    'La lista se marca sola cuando termina el registro; con el cursor sobre la curva ves los canales en ese instante. En el último caso, toca en el axón.')
_b3 = {c['clave']: c for c in B3['casos']}
_b3['abs']['pasos'] = [simp('Prueba un 2.º estímulo muy cercano y míralo con el cursor:', [('3 ms, intensidad 5: sin 2.º potencial de acción', 'refAbs'), ('Cursor en el 2.º estímulo', 'cur2do')],
    'Elige 3 ms e intensidad 5, presiona ⚡ Estimular y arrastra el cursor hasta la marca ▼ del 2.º estímulo.',
    q=qq('¿Por qué no hubo un segundo potencial de acción?', ['Los canales de Na⁺ están inactivados', 'Los canales de K⁺ están inactivados', 'Se acabó el Na⁺ del medio extracelular', 'La bomba Na⁺/K⁺ está apagada'], 0,
         'Mira la bola roja de los canales de Na⁺.'))]
_b3['rel']['pasos'] = [simp('A los 9 ms, compara dos intensidades del 2.º estímulo:', [('9 ms, intensidad 3: sin 2.º potencial de acción', 'relDebil'), ('9 ms, intensidad 5: 2.º potencial de acción', 'refRel')],
    'Elige 9 ms; prueba primero con intensidad 3 y luego con 5.',
    q=qq('¿Por qué con intensidad 3 no hubo 2.º potencial de acción a los 9 ms?', ['Aún hay canales de Na⁺ inactivados', 'Aún hay canales de K⁺ inactivados', 'Ya no queda Na⁺ en el medio extracelular', 'La bomba Na⁺/K⁺ aún está apagada'], 0,
         'Mira las bolas rojas con el cursor en el 2.º estímulo.'))]
_b3['rel']['exp'] = ('Período refractario relativo: algunos canales de Na⁺ ya se recuperaron, pero otros siguen inactivados y los de K⁺ siguen abiertos. '
    'Solo un estímulo más intenso que lo normal dispara, y el potencial de acción sale más bajo. Con más tiempo (12–15 ms) basta la intensidad normal.')

_b1['fuerte']['pasos'][0]['p'] = 'Dispara un potencial de acción con intensidad 3 y luego otro más intenso:'
_b1['fuerte']['pasos'][0]['checks'] = [{'t': 'Potencial de acción con intensidad 3', 'c': 'pa3'}, {'t': 'Otro con intensidad 4 o 5', 'c': 'pa45'}]
# ---- Nivel III (28-10, 08:00): la lista dice explícitamente que la intensidad es la del 2.º estímulo ----
_b3['abs']['pasos'][0]['checks'] = [{'t': '2.º a los 3 ms con intensidad 5: no dispara', 'c': 'refAbs'}, {'t': 'Cursor sobre la marca ▼ del 2.º estímulo', 'c': 'cur2do'}]
_b3['abs']['pasos'][0]['pista'] = 'Arriba elige 3 ms y, en «Intensidad del 2.º», 5. Presiona ⚡ Estimular (da los dos estímulos) y arrastra el cursor hasta la marca ▼ del 2.º.'
_b3['rel']['pasos'][0]['p'] = 'A los 9 ms, prueba el 2.º estímulo con dos intensidades:'
_b3['rel']['pasos'][0]['checks'] = [{'t': '2.º a los 9 ms con intensidad 3: no dispara', 'c': 'relDebil'}, {'t': '2.º a los 9 ms con intensidad 5: dispara un PA más bajo', 'c': 'refRel'}]
_b3['rel']['pasos'][0]['pista'] = 'Elige 9 ms. En «Intensidad del 2.º» prueba primero 3 y estimula; luego 5 y estimula otra vez. El 1.º siempre es de intensidad 3.'
# ---- Nivel III (28-10, 08:10): relativo sigue siendo todo o nada; «Un solo sentido» pregunta por qué ----
_b3['rel']['exp'] += ' Sigue siendo todo o nada: un estímulo aún más fuerte no lo agranda, porque su altura depende de cuántos canales de Na⁺ están disponibles.'
_b3['sentido']['pasos'][0]['q'] = qq('¿Por qué no puede pasar a ese nodo?', ['Sus canales de Na⁺ siguen inactivados', 'Sus canales de K⁺ siguen inactivados', 'Ya no le queda Na⁺ en el exterior', 'La mielina lo aísla del resto'], 0,
    'Ese nodo acaba de disparar: recuerda el período refractario absoluto.')
_b3['sentido']['exp'] = ('El nodo que acaba de disparar tiene sus canales de Na⁺ inactivados (período refractario absoluto): la corriente local no puede volver a excitarlo. '
    'Por eso el impulso avanza en un solo sentido, del soma hacia los botones terminales. El período refractario también pone un techo a la frecuencia de disparo (cientos de potenciales de acción por segundo).')
# ---- Ilustraciones de ChatGPT (28-10, 08:40): fondo del simulador del nivel I y axón del nivel III (docs/practico-3_integrar.py) ----
B1['sim_cfg']['fondo'] = P + 'neurona-simple.jpg'
B3['fondo'] = P + 'axon-refractario.jpg'
B3['vb'] = [1200, 800]
B3['alt'] = 'Neurona con axón mielinizado: segmento inicial y cuatro nodos de Ranvier; el potencial de acción está en el nodo 2'
B3['zonas'] = {k: dict(v, nombre=n) for (k, v), n in zip(Z_N.items(), ['el segmento inicial', 'el nodo 1', 'el nodo 2', 'el nodo 3', 'el nodo 4'])}
_b3['sentido']['situacion'] = 'El potencial de acción viene desde el soma y ahora está en el nodo 2.'
_b3['sentido']['pasos'][0]['pista'] = 'Piensa por qué nodo pasó hace un instante.'
for N_ in (L1, A3, B1, B2, B3):
    N_['dx'] = True
    N_['nombres_paso'] = {'elegir': 'Pregunta'}
def sql(s): return s.replace("'", "''")
def jdump(o): return json.dumps(o, ensure_ascii=False)

blk2 = f"""-- Actividad 2: CANALES DE MEMBRANA (práctico 3) · simulador propio js/sim-membrana.js (pasos «sim» con chequeos) + esquemas SVG (img/potencial/, docs/practico-3_svg.py).
-- I reposo y canales (reposo, potencial con fuga de K⁺, bomba, canales de Na⁺ y K⁺ → cuadro comparativo de la guía 2025);
-- II ¿qué abre los canales? (toca en la neurona: mecánico, ligando, voltaje; cierre con las tres características de la neurona)
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo, objetivo, mecanica, fuente) VALUES
  (2, 9, 'canales-membrana', 'Canales de membrana',
       '{sql("Cómo se reparten los iones y qué pasa cuando se abre un canal. Nivel I: en el simulador, arma la membrana en reposo, mide su potencial, prueba la bomba Na⁺/K⁺ y abre canales de Na⁺ y de K⁺ (cuadro comparativo). Nivel II: qué estímulo abre los canales en cada parte de la neurona.")}',
       'lamina', 1, '{sql("Explicar la distribución de Na⁺ y K⁺ en reposo, el potencial de membrana y el efecto de abrir canales de Na⁺ y de K⁺, y relacionar cada tipo de canal (mecánico, por ligando, por voltaje) con su lugar en la neurona.")}',
       '{sql("Predecir antes de mirar; armar la membrana, poner y abrir canales en el simulador de NeuroLab (con voltímetro); completar el cuadro comparativo; tocar en la neurona dónde se abre cada canal.")}',
       '{sql("Guía de laboratorio Neurotransmisión ETMP097 2025 · PhET Interactive Simulations (CC BY 4.0) · esquemas de NeuroLab")}');
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (2, 'tareas', '{sql(jdump({'laminas': {}, 'niveles': [L1, A3]}))}', NULL, 1);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (2, 1, '{sql("En Fonoaudiología: las células ciliadas de la cóclea abren canales mecánicos con el sonido; el glutamato que liberan abre canales por ligando en el nervio auditivo.")}', 1),
  (2, 2, '{sql("En Terapia Ocupacional: los receptores de la mano abren canales mecánicos al tacto y a la presión; de ellos depende la información sensitiva que guía el movimiento.")}', 2);
"""

blk15 = f"""
-- Actividad 15: EL POTENCIAL DE ACCIÓN (práctico 3) · simulador propio js/sim-pa.js (Hodgkin y Huxley; reposo −70, umbral ≈ −55, peak ≈ +35, mínimo ≈ −81 mV)
-- + esquemas SVG (img/potencial/, docs/practico-3_svg2.py). I local frente a acción (umbral, todo o nada, sumación temporal; decremento y sumación espacial en esquema);
-- II fases y canales (cursor sobre el registro; cuadro de la guía 2025); III período refractario (absoluto, relativo; un solo sentido en el axón)
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo, objetivo, mecanica, fuente) VALUES
  (15, 2, 'potencial-accion-neurona', 'El potencial de acción',
       '{sql("De los potenciales locales al potencial de acción, con el simulador de NeuroLab. Nivel I: umbral, todo o nada y sumación temporal. Nivel II: las fases y el estado de los canales en cada una. Nivel III: el período refractario.")}',
       'lamina', 1, '{sql("Diferenciar potencial local y potencial de acción, identificar las fases del potencial de acción y explicarlas por el estado de los canales de Na⁺ y K⁺, y reconocer los períodos refractarios.")}',
       '{sql("Estimular en el simulador con distinta intensidad y frecuencia; recorrer el registro con el cursor para ver los canales en cada fase; completar el cuadro de canales por fase; tocar en el axón.")}',
       '{sql("Guía de laboratorio Neurotransmisión ETMP097 2025 · modelo de Hodgkin y Huxley (1952) · simulador y esquemas de NeuroLab")}');
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (15, 'tareas', '{sql(jdump({'laminas': {}, 'niveles': [B1, B2, B3]}))}', NULL, 1);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (15, 1, '{sql("En Fonoaudiología: la intensidad de un sonido se codifica en la frecuencia de potenciales de acción del nervio auditivo, y el período refractario pone un límite a esa frecuencia.")}', 1),
  (15, 2, '{sql("En Terapia Ocupacional: la fuerza de una contracción depende de la frecuencia de potenciales de acción de las motoneuronas y de cuántas se activan.")}', 2);
"""
def reemplazar(seed, inicio, fin, bloque):
    a = seed.index(inicio); b = seed.index(fin, a + 1)
    return seed[:a] + bloque.strip() + '\n\n' + seed[b:]
_ruta = os.path.join(RAIZ, 'data/seed.sql')
_s = open(_ruta, encoding='utf-8').read()
_s = reemplazar(_s, '-- Actividad 2: CANALES', '-- Actividad demo 3', blk2)
_s = reemplazar(_s, '-- Actividad 15: EL POTENCIAL', '\n-- Actividad', blk15) if _s.count('-- Actividad 15: EL POTENCIAL') and re.search(r'-- Actividad 15: EL POTENCIAL[\s\S]*?\n-- Actividad', _s) else _s.replace(_s[_s.index('-- Actividad 15: EL POTENCIAL'):], blk15.strip() + '\n')
open(_ruta, 'w', encoding='utf-8').write(_s)
print(len(blk2), len(blk15), list(S.keys()))
