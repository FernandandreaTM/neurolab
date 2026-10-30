import json
def q(id, car, p, ops, fb, ok=0): return {'id': id, 'carrera': car, 'pregunta': p, 'opciones': ops, 'correcta': ok, 'feedback': fb}
Q = [
 # Comunes (11). Alternativas breves y parejas: la explicación va en el feedback, no en la correcta.
 q('p01', 'comun', 'En la hiperkalemia sube el K⁺ del medio extracelular. ¿Qué le pasa al potencial de reposo?',
   ['Se despolariza: sale menos K⁺', 'Se hiperpolariza: sale más K⁺', 'Se despolariza: entra más Na⁺', 'Se hiperpolariza: entra más K⁺'],
   'Con más K⁺ afuera se reduce el gradiente que hace salir K⁺ por los canales de fuga, y el interior queda menos negativo. En el corazón puede causar arritmias.'),
 q('p02', 'comun', 'La tetrodotoxina (del pez globo) bloquea los canales de Na⁺ controlados por voltaje. ¿Qué ocurre?',
   ['Desaparecen los potenciales de acción', 'Los potenciales de acción salen más altos', 'Desaparece el potencial de reposo', 'Los potenciales de acción no se repolarizan'],
   'Sin canales de Na⁺ de voltaje no hay despolarización rápida ni potencial de acción: nervios y músculos dejan de conducir (hormigueo, debilidad, parálisis). El reposo depende de los canales de fuga de K⁺ y no cambia.'),
 q('p03', 'comun', 'En una isquemia cerebral la neurona se queda sin ATP. ¿Qué pasa con sus gradientes de Na⁺ y K⁺?',
   ['Se pierden: la bomba se detiene', 'Se mantienen: los repone la fuga', 'Aumentan: la bomba se acelera', 'Se invierten: el K⁺ entra solo'],
   'La bomba Na⁺/K⁺ gasta ATP. Sin ella, los iones siguen pasando a favor de sus gradientes, que se disipan de a poco: la neurona se despolariza y deja de funcionar.'),
 q('p04', 'comun', 'Al apretar más fuerte la piel, ¿cómo codifica el axón sensitivo esa mayor intensidad?',
   ['Con más frecuencia de disparo', 'Con potenciales de mayor altura', 'Con potenciales más duraderos', 'Con potenciales más lentos'],
   'El potencial de acción es todo o nada: su altura no cambia. La intensidad se codifica en cuántos potenciales de acción por segundo envía cada fibra (y en cuántas fibras se activan).'),
 q('p05', 'comun', 'Una neurona en reposo (−70 mV; umbral −55 mV) recibe al mismo tiempo tres PPSE de +5 mV y un PPSI de −8 mV. ¿Dispara?',
   ['No: llega a −63 mV', 'Sí: llega a −55 mV', 'Sí: llega a −47 mV', 'No: llega a −78 mV'],
   '−70 + 15 − 8 = −63 mV. La neurona suma excitación e inhibición; aquí no alcanza el umbral.'),
 q('p06', 'comun', '¿Por qué un axón mielinizado conduce más rápido que uno sin mielina del mismo grosor?',
   ['El PA se regenera solo en los nodos', 'La mielina le aporta Na⁺ extra al axón', 'La mielina hace más alto el PA', 'La mielina acorta el período refractario'],
   'La mielina aísla y los canales de Na⁺ se concentran en los nodos de Ranvier: el potencial de acción avanza a saltos (conducción saltatoria), más rápido y con menos gasto de energía.'),
 q('p07', 'comun', 'La fampridina, usada en la esclerosis múltiple, bloquea canales de K⁺ controlados por voltaje. ¿Qué cambia en el potencial de acción?',
   ['Se enlentece la repolarización', 'Se acelera la repolarización', 'Se enlentece la despolarización', 'Desaparece la despolarización'],
   'La repolarización depende de la salida de K⁺ por sus canales de voltaje. Al bloquearlos, el potencial de acción dura más; en axones desmielinizados eso ayuda a que la señal alcance a pasar.'),
 q('p08', 'comun', 'Un estímulo eléctrico débil en la piel no se siente, pero si se repite muy rápido, sí. ¿Por qué?',
   ['Se suman hasta alcanzar el umbral', 'Cada PA sale más alto que el anterior', 'El primero abre los canales de K⁺', 'La bomba Na⁺/K⁺ se acelera'],
   'Sumación temporal: cada estímulo débil produce un potencial local que no alcanza el umbral; si el siguiente llega antes de que el anterior se apague, se suman y disparan el potencial de acción.'),
 q('p09', 'comun', 'Las benzodiazepinas potencian los receptores de GABA (canales de Cl⁻). ¿Por qué reducen las crisis epilépticas?',
   ['Alejan a las neuronas del umbral', 'Acercan a las neuronas al umbral', 'Bloquean los canales de K⁺', 'Aceleran la bomba Na⁺/K⁺'],
   'El GABA abre canales de Cl⁻: entra Cl⁻ y se produce un PPSI que aleja la membrana del umbral. Si la inhibición pesa más, las neuronas disparan menos.'),
 q('p10', 'comun', 'Algunos fármacos contra la epilepsia (como la carbamazepina) prolongan la inactivación de los canales de Na⁺. ¿Qué logran?',
   ['Limitan el disparo rápido y repetido', 'Aumentan la altura de cada disparo', 'Aceleran la conducción por el axón', 'Hacen desaparecer el potencial de reposo'],
   'Si los canales de Na⁺ tardan más en recuperarse de la inactivación, el período refractario se alarga y baja la frecuencia máxima de disparo.'),
 q('p11', 'comun', 'El corpúsculo de Pacini responde a la vibración. ¿Qué canal abre primero ese estímulo?',
   ['Mecanosensible, en su terminal', 'Por ligando, en su botón sináptico', 'Por voltaje, en la epidermis', 'De fuga, en el soma sensitivo'],
   'La deformación de las capas del corpúsculo abre canales mecanosensibles (PIEZO2) en la terminal del axón: entra Na⁺ y se genera un potencial local que, si alcanza el umbral, dispara potenciales de acción.'),
 # Terapia Ocupacional (4)
 q('t1', 'terapia-ocupacional', 'En la estimulación eléctrica funcional (FES), pasar de 50 a 1000 pulsos por segundo no da 20 veces más potenciales de acción en el axón motor. ¿Por qué?',
   ['Muchos pulsos caen en el refractario', 'Los potenciales salen el doble de altos', 'La bomba Na⁺/K⁺ deja de funcionar', 'La mielina bloquea los pulsos rápidos'],
   'Tras cada potencial de acción el axón queda refractario: un pulso que llega en el período absoluto no dispara. Por eso la FES se programa a frecuencias moderadas (≈ 20–50 Hz).'),
 q('t2', 'terapia-ocupacional', 'Para que la FES contraiga un músculo debilitado, ¿qué debe lograr cada pulso en el axón motor?',
   ['Llevarlo hasta el umbral', 'Hiperpolarizarlo bajo el reposo', 'Liberar acetilcolina del electrodo', 'Detener su bomba Na⁺/K⁺'],
   'La corriente despolariza el axón motor; si llega al umbral, se abren los canales de Na⁺ de voltaje y se dispara el potencial de acción. Más intensidad activa más axones; más frecuencia sostiene la contracción.'),
 q('t3', 'terapia-ocupacional', 'Una paciente con hipokalemia (K⁺ bajo en la sangre) refiere debilidad muscular. ¿Qué explica su debilidad?',
   ['Reposo más negativo, lejos del umbral', 'Reposo menos negativo, cerca del umbral', 'Reposo más negativo, PA más altos', 'Reposo igual, sin canales de Na⁺'],
   'Con menos K⁺ afuera sale más K⁺ por los canales de fuga y el reposo se vuelve más negativo: hace falta más estímulo para llegar al umbral.'),
 q('t4', 'terapia-ocupacional', 'En el síndrome de Guillain-Barré se daña la mielina de los nervios periféricos. ¿Por qué aparece debilidad?',
   ['La conducción falla donde falta mielina', 'Los axones pierden su potencial de reposo', 'El músculo pierde sus canales de K⁺', 'La médula deja de liberar glutamato'],
   'Bajo la mielina hay pocos canales de Na⁺: al perderla, la corriente se disipa antes de llegar al siguiente nodo y la conducción se enlentece o se bloquea.'),
 # Fonoaudiología
 q('f1', 'fonoaudiologia', 'Después de una anestesia dental con lidocaína, el labio queda «dormido» y cuesta articular. ¿Por qué?',
   ['La lidocaína bloquea los canales de Na⁺ de las fibras sensitivas del trigémino y falta información sensitiva de la boca', 'La lidocaína paraliza la corteza motora del habla', 'La lidocaína destruye los receptores del gusto', 'La lidocaína hiperpolariza las neuronas de Broca'],
   'Sin potenciales de acción sensitivos, el SNC no recibe la información de la boca que usa para ajustar los movimientos del habla.'),
 q('f2', 'fonoaudiologia', 'Un sonido más intenso, ¿cómo se codifica en el nervio auditivo?',
   ['Más potenciales de acción por segundo en cada fibra y más fibras activas', 'Potenciales de acción más altos', 'Potenciales de acción más lentos', 'Un solo potencial de acción más largo'],
   'Todo o nada: la intensidad se codifica por frecuencia de disparo y por reclutamiento de fibras.'),
 q('f3', 'fonoaudiologia', 'Una fibra del nervio auditivo no puede disparar más de unos cientos de potenciales de acción por segundo. ¿Qué lo limita?',
   ['El período refractario', 'La bomba Na⁺/K⁺', 'El grosor de la mielina', 'La cantidad de K⁺ intracelular'],
   'Tras cada disparo la fibra queda refractaria. Para seguir sonidos de frecuencia alta, varias fibras se turnan (principio de la andanada).'),
 q('f4', 'fonoaudiologia', 'Un implante coclear permite oír sin células ciliadas. ¿Qué hace?',
   ['Estimula eléctricamente las neuronas del ganglio espiral hasta el umbral, generando potenciales de acción', 'Amplifica el sonido para que las células ciliadas respondan', 'Libera glutamato en la cóclea', 'Reemplaza la corteza auditiva'],
   'El electrodo despolariza directamente las neuronas del nervio auditivo: reemplaza la apertura de canales mecánicos de las células ciliadas.'),
]
def sql(s): return s.replace("'", "''")
blk = f"""-- Actividad 5: QUIZ de cierre Canales y potencial de acción (práctico 3): 11 comunes + 4 de cada carrera, sin repetir las preguntas de las actividades
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (5, 2, 'quiz-potencial-accion', 'Quiz: Canales y potencial de acción',
       '{sql("Cierre del práctico: preguntas de un pool común y casos de tu carrera (TO o Fono). Una sola oportunidad por pregunta; cada respuesta muestra una explicación.")}',
       'quiz', 1);
INSERT OR IGNORE INTO quices (actividad_id, titulo, datos_json, activo) VALUES
  (5, 'Canales y potencial de acción', '{sql(json.dumps(Q, ensure_ascii=False))}', 1);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (5, 2, '{sql("Responde solo/a, sin apuntes. Al terminar revisa el resumen: las preguntas falladas son las que conviene repasar.")}', 1);
"""
import os
_ruta = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'seed.sql')
_s = open(_ruta, encoding='utf-8').read()
_a = _s.index('-- Actividad 5: QUIZ'); _b = _s.index('\n-- Actividad', _a + 1)
open(_ruta, 'w', encoding='utf-8').write(_s[:_a] + blk.strip() + '\n' + _s[_b:])   # reemplaza el bloque en data/seed.sql
print(len(Q))
