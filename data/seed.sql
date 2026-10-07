-- NeuroLab — seed.sql
-- Datos mínimos para MVP: 2 carreras + 5 topics del tronco común + 1 actividad por tipo.
-- Idempotente: limpia tablas antes de poblar (manteniendo PK contadores).

-- Limpiar primero (orden importa por FK)
DELETE FROM practica_items;
DELETE FROM practica_niveles;
DELETE FROM actividad_carrera;
DELETE FROM labeling_parts;
DELETE FROM quices;
DELETE FROM actividad_recursos;
DELETE FROM actividades;
DELETE FROM topic_recursos;
DELETE FROM topics;
DELETE FROM carreras;
DELETE FROM sqlite_sequence WHERE name IN ('carreras','topics','actividades','actividad_recursos','actividad_carrera','labeling_parts','quices','topic_recursos','practica_niveles','practica_items');

-- Carreras
INSERT OR IGNORE INTO carreras (id, slug, nombre, asignatura_codigo, descripcion) VALUES
  (1, 'fonoaudiologia', 'Fonoaudiología', 'ETMP061', 'Estudio del sistema nervioso con énfasis en comunicación, lenguaje, audición y fonación.'),
  (2, 'terapia-ocupacional', 'Terapia Ocupacional', 'ETMP097', 'Estudio del sistema nervioso con énfasis en control motor, integración sensorial y ocupación.');

-- Topics: tronco común (5 temas raíz)
INSERT OR IGNORE INTO topics (id, slug, nombre, parent_id, icono, tipo, orden) VALUES
  (1,  'celulas-sn',          'Células del Sistema Nervioso',  NULL, '🧠', 'estructura', 1),
  (2,  'potencial-accion',    'Potencial de Acción',          NULL, '⚡', 'proceso',    2),
  (3,  'sinapsis',            'Sinapsis y Neurotransmisión',  NULL, '🔗', 'proceso',    3),
  (4,  'sn-sensitivo',        'Sistema Nervioso Sensitivo',   NULL, '👁️', 'sensitivo',  4),
  (5,  'sn-autonomo',         'Sistema Nervioso Autónomo',    NULL, '⚙️', 'motor',      5);

-- Sub-temas de ejemplo (hijos)
INSERT OR IGNORE INTO topics (id, slug, nombre, parent_id, icono, tipo, orden) VALUES
  (6,  'neurona',             'Neurona',                      1,    '🔬', 'estructura', 1),
  (7,  'glia',                'Células gliales',              1,    '🕸️', 'estructura', 2),
  (8,  'morfologia-neurona',  'Morfología neuronal',          6,    '🧬', 'estructura', 1),
  (9,  'canales-ionicos',     'Canales iónicos',              2,    '🧪', 'proceso',    1),
  (10, 'neurotransmisores',   'Neurotransmisores',            3,    '💊', 'proceso',    1);

-- Descripción de cada tema (se muestra arriba en tema.php)
UPDATE topics SET descripcion = 'Las células del sistema nervioso son de dos grandes familias: las neuronas, especializadas en generar y transmitir señales eléctricas, y la glía, que las sostiene, aísla y regula su entorno químico. Entender su morfología es el punto de partida para todo lo demás.' WHERE slug = 'celulas-sn';
UPDATE topics SET descripcion = 'El potencial de acción es la señal eléctrica con la que la neurona comunica información a distancia. Se produce por la apertura y cierre ordenados de canales de sodio y potasio, y viaja por el axón sin perder amplitud.' WHERE slug = 'potencial-accion';
UPDATE topics SET descripcion = 'La sinapsis es el punto de contacto donde una neurona transfiere información a otra célula. Aquí la señal eléctrica se convierte en química (neurotransmisores) y vuelve a ser eléctrica en la célula postsináptica.' WHERE slug = 'sinapsis';
UPDATE topics SET descripcion = 'El sistema nervioso sensitivo recoge información del cuerpo y del ambiente mediante receptores especializados, la codifica en potenciales de acción y la conduce hasta la corteza, donde se transforma en percepción.' WHERE slug = 'sn-sensitivo';
UPDATE topics SET descripcion = 'El sistema nervioso autónomo regula, sin control voluntario, las funciones viscerales: frecuencia cardíaca, respiración, digestión y secreciones. Sus dos divisiones, simpática y parasimpática, actúan de forma complementaria.' WHERE slug = 'sn-autonomo';
UPDATE topics SET descripcion = 'La neurona es la unidad funcional del sistema nervioso: recibe señales por sus dendritas, las integra en el soma y las propaga por el axón hacia sus botones terminales.' WHERE slug = 'neurona';
UPDATE topics SET descripcion = 'Las células gliales superan en número a las neuronas. Astrocitos, oligodendrocitos, células de Schwann, microglía y ependimarias sostienen, nutren, mielinizan y defienden el tejido nervioso.' WHERE slug = 'glia';
UPDATE topics SET descripcion = 'La forma de una neurona anticipa su función: el número de prolongaciones, la longitud del axón y la presencia de mielina determinan qué tan lejos y qué tan rápido puede enviar su señal.' WHERE slug = 'morfologia-neurona';
UPDATE topics SET descripcion = 'Los canales iónicos son proteínas de membrana que dejan pasar iones específicos. Su apertura dependiente de voltaje o de ligando es lo que hace posible el potencial de acción y la transmisión sináptica.' WHERE slug = 'canales-ionicos';
UPDATE topics SET descripcion = 'Los neurotransmisores son las moléculas que cruzan la hendidura sináptica. Según el receptor al que se unan, pueden excitar o inhibir a la célula postsináptica.' WHERE slug = 'neurotransmisores';

-- Actividad 1: LÁMINA virtual Golgi (piramidal y Purkinje)
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (1, 6, 'lamina-neurona-piramidal', 'Lámina Golgi: Neurona Piramidal y Célula de Purkinje',
       'Observa una lámina virtual de cerebro teñida con método de Golgi. Localiza una neurona piramidal (corteza cerebral) y una célula de Purkinje (cerebelo), reconoce su soma, dendritas y axón, y relaciona su forma con su función. Sigue la pestaña Cómo buscarlas y completa tu trabajo más abajo.',
       'lamina', 1);
UPDATE actividades SET titulo = 'Lámina Golgi: Neurona Piramidal y Célula de Purkinje',
       descripcion = 'Observa una lámina virtual de cerebro teñida con método de Golgi. Localiza una neurona piramidal (corteza cerebral) y una célula de Purkinje (cerebelo), reconoce su soma, dendritas y axón, y relaciona su forma con su función. Sigue la pestaña Cómo buscarlas y completa tu trabajo más abajo.'
       WHERE slug = 'lamina-neurona-piramidal';
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (1, 'iframe_url', 'https://histologyguide.com/slideview/MHS-284-brain/06-slide-1.html?page=2',
      'Corte sagital de cerebro de rata — método de Golgi (histologyguide.com)', 1),
  (1, 'texto_html', '<div class="nl-guia"><p class="nl-guia__intro">Corte sagital de cerebro de rata, tinción de Golgi (plata): tiñe al azar unas pocas neuronas completas, con sus prolongaciones. La glía no se tiñe. Usa el zoom y el desplazamiento de la pestaña <strong>Lámina virtual</strong>.</p><h3>Cómo buscarlas</h3><ol class="nl-guia__tareas"><li><strong>Orienta la lámina:</strong> ubica la corteza cerebral (bajo la superficie del hemisferio) y el cerebelo (estructura posterior con pliegues, las folias).</li><li><strong>Neurona piramidal:</strong> en la corteza cerebral, busca un soma con forma de triángulo, una dendrita larga que sube hacia la superficie y dendritas más cortas en la base.</li><li><strong>Célula de Purkinje:</strong> en el cerebelo, busca somas grandes alineados en una sola hilera, entre una capa clara (externa) y una capa muy celular (interna), con un árbol dendrítico en abanico hacia la superficie.</li><li>En cada una, reconoce <strong>soma, dendritas y axón</strong>, haz zoom y toma una captura de pantalla.</li><li>Más abajo, en <strong>Tu trabajo</strong>, pega tus dos capturas y responde las preguntas. Cuando completes todo, súmalo a tu guía.</li></ol></div>', 'Cómo buscarlas', 2),
  (1, 'tareas', '{"titulo": "Neurona piramidal y célula de Purkinje", "intro": "Pega tus capturas de la lámina y responde las preguntas. Cada pregunta se corrige al instante: si te equivocas verás una pista y podrás intentar de nuevo.", "capturas": [{"clave": "piramidal", "titulo": "Neurona piramidal", "instruccion": "Captura una neurona piramidal de la corteza cerebral, con suficiente zoom para ver su forma.", "checks": ["Soma", "Dendrita apical", "Dendritas basales", "Axón"]}, {"clave": "purkinje", "titulo": "Célula de Purkinje", "instruccion": "Captura una célula de Purkinje del cerebelo, donde se vea su árbol dendrítico.", "checks": ["Soma", "Árbol dendrítico", "Axón"]}], "preguntas": [{"p": "¿En qué zona del encéfalo encontraste la neurona piramidal?", "ops": ["Corteza cerebral", "Corteza del cerebelo", "Médula espinal", "Ganglio de la raíz dorsal"], "ok": 0, "pista": "Busca bajo la superficie de los hemisferios, no en la estructura con folias.", "exp": "Las neuronas piramidales están en la corteza cerebral (capas III y V) y también en el hipocampo."}, {"p": "¿Dónde se ubican las células de Purkinje?", "ops": ["En la corteza del cerebelo, en una hilera entre la capa molecular y la granular", "En la corteza cerebral motora, capa V", "En el asta ventral de la médula espinal", "En los ganglios sensitivos"], "ok": 0, "pista": "Recuerda la estructura posterior con folias y su hilera de somas grandes.", "exp": "Forman la capa de Purkinje del cerebelo: una sola hilera de somas grandes entre la capa molecular (externa) y la granular (interna)."}, {"p": "Según su morfología, la neurona piramidal y la célula de Purkinje son:", "ops": ["Multipolares", "Bipolares", "Pseudounipolares", "Unipolares"], "ok": 0, "pista": "Cuenta cuántos axones y cuántas dendritas tiene cada una.", "exp": "Ambas son multipolares: un solo axón y muchas dendritas."}, {"p": "¿Qué rasgo de la neurona piramidal le permite recibir información de varias capas de la corteza?", "ops": ["Su dendrita apical larga, que atraviesa varias capas", "Su soma pequeño y redondo", "Que no tiene dendritas basales", "Su axón corto que no sale de la corteza"], "ok": 0, "pista": "Fíjate en la prolongación que sube hacia la superficie.", "exp": "La dendrita apical cruza varias capas corticales y recibe aferencias de distintos orígenes; las basales integran información local."}, {"p": "¿Cuál es la función principal de las neuronas piramidales de la corteza motora?", "ops": ["Iniciar el movimiento voluntario: su axón forma el tracto corticoespinal", "Coordinar y ajustar la precisión del movimiento", "Llevar el tacto desde la piel hasta la médula", "Formar la mielina de los axones"], "ok": 0, "pista": "Piensa en la neurona de proyección cuyo axón baja hasta la médula.", "exp": "Son neuronas de proyección excitatorias (glutamatérgicas): su axón largo sale de la corteza y, en la corteza motora, forma el tracto corticoespinal (motoneurona superior)."}, {"p": "¿Qué rasgo de la célula de Purkinje le permite recibir cientos de miles de sinapsis?", "ops": ["Su árbol dendrítico enorme y aplanado, en forma de abanico", "Su axón largo y mielinizado", "Su soma triangular", "Que tiene una sola dendrita sin ramas"], "ok": 0, "pista": "Mira la parte de la célula que se dirige hacia la superficie del cerebelo.", "exp": "Su árbol dendrítico, extendido en un solo plano, recibe hasta ~200 000 sinapsis de las fibras paralelas."}, {"p": "¿Cuál es la función principal de la célula de Purkinje?", "ops": ["Integrar la información del cerebelo para coordinar y ajustar el movimiento", "Iniciar el movimiento voluntario", "Recibir la luz en la retina", "Conducir el dolor hacia el SNC"], "ok": 0, "pista": "El cerebelo no inicia el movimiento: lo corrige.", "exp": "Es la única salida de la corteza cerebelosa y es inhibitoria (GABAérgica): ajusta la precisión y la coordinación del movimiento."}, {"p": "¿Por qué con el método de Golgi se ven neuronas completas y aisladas?", "ops": ["Porque la plata tiñe al azar unas pocas neuronas, pero cada una completa", "Porque tiñe todas las neuronas por igual", "Porque sólo tiñe los núcleos", "Porque tiñe la glía y deja las neuronas sin teñir"], "ok": 0, "pista": "Si se tiñeran todas, ¿podrías distinguir una de otra?", "exp": "La impregnación argéntica marca un pequeño porcentaje de neuronas al azar, pero cada una con todas sus prolongaciones."}]}', 'Trabajo de la lámina', 3);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (1, 1, 'En Fonoaudiología, las neuronas piramidales son relevantes por su rol en el área de Broca (producción del lenguaje) y el área de Wernicke (comprensión); el cerebelo coordina la articulación del habla.', 1),
  (1, 2, 'En Terapia Ocupacional, las piramidales de la corteza motora inician el movimiento voluntario (tracto corticoespinal) y las células de Purkinje lo coordinan y ajustan: su lesión altera la precisión de las actividades de la vida diaria.', 2);

-- Actividad demo 2: SIMULADOR (canales iónicos, PhET)
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (2, 9, 'simulador-canales-membrana', 'Simulador: Canales de Membrana (PhET)',
       'Simula la apertura de canales de Na+ y K+ y observa cómo cambia el potencial de membrana. Completa el cuadro comparativo de la guía.',
       'simulador', 1);
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (2, 'iframe_url', 'https://phet.colorado.edu/sims/cheerpj/membrane-channels/latest/membrane-channels.html?simulation=membrane-channels&locale=es',
      'PhET — Membrane Channels', 1);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (2, 1, 'Aplica estos conceptos al procesamiento auditivo: cómo se codifica el estímulo sonoro en el nervio auditivo.', 1),
  (2, 2, 'Aplica estos conceptos a la integración sensorial: cómo el SNC traduce estímulos aferentes en respuesta motora.', 2);

-- Actividad demo 3: COMPARADOR (tipos de neurona)
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (3, 8, 'comparador-tipos-neurona', 'Comparador: Tipos de Neurona',
       'Relaciona la forma de cada tipo de neurona (bipolar, pseudounipolar, multipolar) con su función y su localización. Practica por niveles y al final compara con el cuadro resumen.',
       'comparador', 1);
UPDATE actividades SET descripcion = 'Relaciona la forma de cada tipo de neurona (bipolar, pseudounipolar, multipolar) con su función y su localización. Practica por niveles y al final compara con el cuadro resumen.' WHERE slug = 'comparador-tipos-neurona';
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (3, 'texto_html',
      '<div class="nl-comp-intro"><p><strong>¿Cómo se relaciona la forma de una neurona con su función y su ubicación?</strong></p><ol><li>Resuelve los <strong>niveles 1, 2 y 3</strong> de la práctica (más abajo).</li><li>Cuando termines, abre el cuadro resumen y compáralo con lo que respondiste.</li><li>En tu guía: dibuja cada tipo indicando soma, axón y dendritas, y marca con una flecha la dirección del impulso.</li></ol></div><details class="nl-comp-resumen"><summary>Ver cuadro resumen (ábrelo al terminar los niveles)</summary><table class="comparador-table"><thead><tr><th>Característica</th><th>Bipolar</th><th>Pseudounipolar</th><th>Multipolar</th></tr></thead><tbody><tr><td>Morfología</td><td>2 neuritas en polos opuestos: 1 dendrita y 1 axón; soma fusiforme u ovoide</td><td>1 sola neurita que se bifurca en «T» (rama periférica y rama central)</td><td>1 axón y múltiples dendritas que nacen de distintos puntos del soma</td></tr><tr><td>Función</td><td>Sensitiva especial</td><td>Sensitiva general (tacto, dolor, temperatura, propiocepción)</td><td>Motora y de asociación (interneuronas)</td></tr><tr><td>Dirección de la información</td><td>Aferente (hacia el SNC)</td><td>Aferente (hacia el SNC)</td><td>Eferente (motoras) o dentro del SNC (asociación)</td></tr><tr><td>Localización / ejemplo</td><td>Retina, epitelio olfatorio, ganglios coclear y vestibular</td><td>Ganglio de la raíz dorsal; ganglios sensitivos de nervios craneales (p. ej. trigémino)</td><td>Motoneurona del asta ventral, neurona piramidal (corteza), célula de Purkinje (cerebelo)</td></tr></tbody></table></details>',
      'Cuadro comparativo', 1);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (3, 1, 'En Fonoaudiología interesa especialmente la neurona bipolar coclear y vestibular, relevante en la vía auditiva.', 1),
  (3, 2, 'En TO interesa la motoneurona multipolar del asta ventral (vía final común hacia el músculo), las interneuronas de la médula espinal y la neurona pseudounipolar que trae la información somatosensorial y propioceptiva.', 2);

-- Práctica por niveles del comparador (actividad 3)
INSERT OR IGNORE INTO practica_niveles (id, actividad_id, numero, titulo, instrucciones, tipo, activo) VALUES
  (1, 3, 1, 'Frases',
      'Lee cada frase y toca el tipo de neurona que describe. Si te equivocas, verás una pista para volver a intentar.',
      'elegir', 1),
  (2, 3, 2, 'Dibujo de neuronas',
      'Arma cada neurona: elige una pieza (dendrita, axón o neurita en T) y toca un punto alrededor del soma para agregarla. Tocar de nuevo la quita. Cuando esté lista, presiona Revisar.',
      'armar', 1),
  (3, 3, 3, 'Subtipos de neuronas multipolares',
      'Toca el subtipo de neurona multipolar que se describe. Fíjate en la forma y en dónde se encuentra.',
      'elegir', 1);

-- Nivel 1: frases. {} marca el espacio; sin {} el espacio va al inicio.
INSERT OR IGNORE INTO practica_items (nivel_id, enunciado, respuesta, sinonimos, pista, explicacion, orden) VALUES
  (1, 'Tiene una neurita que se bifurca.',
      'Pseudounipolar', 'pseudo unipolar|seudounipolar|pseudomonopolar|falsa unipolar|falsas unipolares',
      'Del soma sale una sola prolongación, que luego se divide en forma de «T».',
      'Parece unipolar, pero su única neurita se bifurca: una rama va a la periferia y la otra entra al sistema nervioso central.', 1),
  (1, 'Son las neuronas sensoriales primarias del cuerpo.',
      'Pseudounipolar', 'pseudo unipolar|seudounipolar|pseudomonopolar|falsa unipolar|falsas unipolares',
      'Transmiten tacto, dolor, presión y temperatura.',
      'Llevan el tacto, el dolor, la presión y la temperatura hacia el sistema nervioso central.', 2),
  (1, 'Se localizan en los ganglios sensitivos de los nervios craneales.',
      'Pseudounipolar', 'pseudo unipolar|seudounipolar|pseudomonopolar|falsa unipolar|falsas unipolares',
      'Un ejemplo es el ganglio de Gasser del nervio trigémino.',
      'Por ejemplo, en el ganglio de Gasser del nervio trigémino.', 3),
  (1, 'Se localizan en los ganglios de las raíces dorsales de la médula espinal.',
      'Pseudounipolar', 'pseudo unipolar|seudounipolar|pseudomonopolar|falsa unipolar|falsas unipolares',
      'Sus somas, grandes y redondeados, se agrupan en racimos junto a la médula.',
      'Sus cuerpos celulares, grandes y redondeados, se agrupan en esos ganglios.', 4),
  (1, 'Posee dos neuritas que nacen de polos opuestos del soma.',
      'Bipolar', NULL,
      'Cuenta las neuritas: son exactamente dos.',
      'Sus somas suelen ser fusiformes (alargados) u ovoides.', 5),
  (1, 'A partir de un extremo emerge una dendrita y en el otro un axón.',
      'Bipolar', NULL,
      'Una prolongación recibe y la otra transmite, cada una en un polo del soma.',
      'Se encuentran en la retina, el epitelio olfatorio y los ganglios vestibular y coclear del oído interno.', 6),
  (1, 'Tiene 1 único axón y múltiples dendritas.',
      'Multipolar', NULL,
      'Sus muchas dendritas le permiten integrar información de miles de células a la vez.',
      'Las dendritas nacen de distintos puntos del cuerpo celular.', 7),
  (1, 'Las neuronas de Golgi I y II pertenecen al tipo de neuronas {}.',
      'Multipolar', NULL,
      'Golgi I (axón largo) y Golgi II (axón corto) son familias de la neurona con muchas dendritas.',
      'Golgi I: axón largo (motoneuronas, piramidales). Golgi II: axón corto (interneuronas de la corteza).', 8),
  (1, 'Son el tipo de neuronas más frecuente en mamíferos.',
      'Multipolar', NULL,
      'Es la que tiene muchas dendritas y un solo axón.',
      'Es el tipo celular más común y abundante del sistema nervioso humano.', 9),
  (1, 'Se encuentran en la retina, entre los fotorreceptores y las células ganglionares.',
      'Bipolar', NULL,
      'Son neuronas de los sentidos especiales.',
      'Las bipolares de la retina reciben de los fotorreceptores y transmiten a las células ganglionares.', 10),
  (1, 'Forman los ganglios coclear y vestibular del oído interno.',
      'Bipolar', NULL,
      'Audición y equilibrio son sentidos especiales.',
      'Llevan la información auditiva y del equilibrio hacia el tronco encefálico.', 11),
  (1, 'La motoneurona del asta ventral de la médula espinal, que inerva el músculo esquelético, es {}.',
      'Multipolar', NULL,
      'Es eferente: lleva la orden desde el SNC al músculo y recibe miles de contactos en sus dendritas.',
      'Su axón sale por la raíz ventral hasta el músculo: es la vía final común del movimiento.', 12),
  (1, 'Las interneuronas, que conectan neuronas dentro del SNC (neuronas de asociación), suelen ser {}.',
      'Multipolar', NULL,
      'Integran información de muchas neuronas a la vez.',
      'Las neuronas de asociación integran la información dentro del SNC, por ejemplo en el arco reflejo.', 13),
  (1, 'Su axón periférico nace en un receptor de la piel y su rama central entra a la médula por la raíz dorsal.',
      'Pseudounipolar', 'pseudo unipolar|seudounipolar|pseudomonopolar|falsa unipolar|falsas unipolares',
      'Es sensitiva (aferente) y su neurita se divide en T.',
      'La señal no pasa por el soma: va directo de la rama periférica a la rama central.', 14);

-- Nivel 3: subtipos de neuronas multipolares (morfología ↔ función ↔ localización)
INSERT OR IGNORE INTO practica_items (nivel_id, enunciado, respuesta, sinonimos, pista, explicacion, orden) VALUES
  (3, 'Su soma tiene forma triangular, con una gran dendrita apical dirigida hacia la superficie de la corteza cerebral.',
      'Piramidal', 'piramidales|neurona piramidal|celula piramidal|célula piramidal|celulas piramidales',
      'Su nombre viene de la forma de su soma.',
      'Neurona piramidal: soma triangular, dendrita apical larga y dendritas basales; está en la corteza cerebral (capas III y V).', 1),
  (3, 'Su axón largo forma el tracto corticoespinal y lleva la orden del movimiento voluntario hacia la médula.',
      'Piramidal', 'piramidales|neurona piramidal|celula piramidal|célula piramidal|celulas piramidales',
      'Está en la corteza motora y es la "primera motoneurona".',
      'Las piramidales de la corteza motora (de Betz) son la motoneurona superior: su axón baja hasta la médula.', 2),
  (3, 'Tiene un árbol dendrítico enorme y aplanado, como un abanico, en la corteza del cerebelo.',
      'Purkinje', 'purkinje|celula de purkinje|célula de purkinje|celulas de purkinje|células de purkinje|neurona de purkinje',
      'Está en el cerebelo y lleva el nombre de un fisiólogo checo.',
      'Célula de Purkinje: soma grande en forma de pera y dendritas en un solo plano, en la corteza del cerebelo.', 3),
  (3, 'Recibe hasta ~200 000 sinapsis en sus dendritas e integra esa información para coordinar y ajustar el movimiento.',
      'Purkinje', 'purkinje|celula de purkinje|célula de purkinje|celulas de purkinje|células de purkinje|neurona de purkinje',
      'Su enorme árbol dendrítico le permite recibir muchísimos contactos.',
      'Es la única salida de la corteza cerebelosa y es inhibitoria (GABAérgica): ajusta la precisión del movimiento.', 4),
  (3, 'Su soma está en el asta ventral de la médula espinal y su axón sale por la raíz ventral hasta el músculo esquelético.',
      'Motoneurona', 'motoneuronas|motoneurona alfa|motoneurona inferior|neurona motora|neuronas motoras|motoneurona espinal',
      'Es eferente: lleva la orden al músculo.',
      'Motoneurona inferior (alfa): multipolar grande, en el asta ventral; es colinérgica.', 5),
  (3, 'Es la "vía final común": toda orden de movimiento debe pasar por ella para llegar al músculo.',
      'Motoneurona', 'motoneuronas|motoneurona alfa|motoneurona inferior|neurona motora|neuronas motoras|motoneurona espinal',
      'Su lesión produce parálisis flácida del músculo que inerva.',
      'Si se daña, el músculo pierde su inervación aunque la corteza y el cerebelo funcionen bien.', 6);

-- Nivel 2: armar la neurona. `respuesta` es el tipo pedido; las reglas de cada
-- tipo están en api/practica_check.php (nl_prac_evalua_armado).
INSERT OR IGNORE INTO practica_items (nivel_id, enunciado, respuesta, sinonimos, pista, explicacion, orden) VALUES
  (2, 'Arma una neurona bipolar.', 'Bipolar', NULL, NULL,
      'Dos neuritas que nacen de polos opuestos del soma: una dendrita que recibe y un axón que transmite. Su soma suele ser fusiforme u ovoide.', 1),
  (2, 'Arma una neurona pseudounipolar.', 'Pseudounipolar', NULL, NULL,
      'Una sola neurita que se bifurca en «T»: una rama va hacia la periferia y la otra entra al sistema nervioso central.', 2),
  (2, 'Arma una neurona multipolar.', 'Multipolar', NULL, NULL,
      'Un único axón y múltiples dendritas que nacen de distintos puntos del soma: así integra información de miles de células a la vez.', 3);

-- Actividad demo 4: LABELING (escribir el nombre de cada parte sobre la imagen)
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (4, 6, 'labeling-partes-neurona', 'Partes de la neurona · Nivel I: estructura general',
       'Nivel I: estructura general. Escribe de memoria el nombre de cada estructura, compáralo con la respuesta correcta y luego elige su función entre alternativas. Al completar todas, súmala a tu guía.',
       'labeling', 1);
-- Texto vigente (actualiza también BD ya pobladas)
UPDATE actividades SET titulo = 'Partes de la neurona · Nivel I: estructura general', descripcion = 'Nivel I: estructura general. Escribe de memoria el nombre de cada estructura, compáralo con la respuesta correcta y luego elige su función entre alternativas. Al completar todas, súmala a tu guía.' WHERE slug = 'labeling-partes-neurona';
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (4, 'imagen', 'img/neurona-partes.jpg', 'Esquema de una neurona multipolar mielinizada', 1);
INSERT OR IGNORE INTO labeling_parts (actividad_id, nombre, x_pct, y_pct, descripcion, funcion, sinonimos, box_x_pct, box_y_pct, orden, forma) VALUES
  (4, 'Dendritas', 23.0, 21.0,
      'Etapa de recepción. Cuanto más ramificado es el árbol dendrítico, más contactos puede recibir la neurona.',
      'Reciben las señales de otras neuronas y las conducen hacia el cuerpo celular.',
      'dendrita|arbol dendritico|árbol dendrítico|dendritas', 15, 8, 1, NULL),
  (4, 'Núcleo', 23.6, 41.0,
      'La neurona es postmitótica: no se divide. Por eso una neurona perdida no se reemplaza; el sistema nervioso se adapta por plasticidad.',
      'Contiene el material genético y dirige la síntesis de proteínas de la célula.',
      'nucleo|núcleo celular|nucleo celular', 12, 30, 2, 'elipse:23.6,45.4,3.2,5.8'),
  (4, 'Soma', 28.0, 54.0,
      'También se llama pericarion y además recibe señales. En el SNC los somas se agrupan en núcleos y en el SNP, en ganglios.',
      'Centro metabólico: produce las macromoléculas y contiene la mayoría de los organelos.',
      'cuerpo celular|pericarion|pericarión|soma neuronal|cuerpo neuronal', 31, 68, 3, 'elipse:25.0,46.5,12.5,16.5'),
  (4, 'Axón', 42.8, 46.9,
      'Etapa de conducción. Hay uno solo por neurona y su longitud va de 1 mm a 1 m.',
      'Conduce el impulso nervioso desde el cuerpo celular hacia los terminales.',
      'axon|fibra nerviosa|cilindroeje', 45, 64, 4, 'corchete:40.0,52.5,81.0,58.5'),
  (4, 'Vaina de mielina', 56.3, 50.5,
      'La forman células gliales (las verás en Células nerviosas II). Gracias a ella el impulso salta entre los nódulos de Ranvier: conducción saltatoria.',
      'Aísla la prolongación y aumenta la velocidad de conducción del impulso.',
      'mielina|vaina mielinica|vaina mielínica|vaina de mielina', 56, 38, 5, 'elipse:55.6,49.6,4.0,3.4'),
  (4, 'Nódulo de Ranvier', 71.4, 53.0,
      'Es el espacio sin mielina entre dos segmentos de la vaina.',
      'Interrupción del aislante donde se regenera el impulso, que salta de una a otra.',
      'nodulo de ranvier|nodo de ranvier|nódulo|nodulo|ranvier|nodulos de ranvier', 71.4, 64.0, 6, NULL),
  (4, 'Ramas terminales', 89.0, 58.0,
      'También se llaman telodendrón: es la ramificación final del axón.',
      'Reparten la señal hacia varias células blanco a la vez.',
      'telodendron|telodendrón|arborizacion terminal|arborización terminal|terminal axonico|terminal axónico|ramas terminales', 80, 70, 7, 'elipse:90.0,51.0,8.8,19.5'),
  (4, 'Botón terminal', 90.5, 31.0,
      'Etapa de transmisión: es el ensanchamiento del extremo de cada rama terminal.',
      'Libera neurotransmisores hacia la siguiente célula.',
      'boton terminal|botones terminales|boton sinaptico|botón sináptico|terminal presinaptico|terminal presináptico|botones sinapticos|terminal sinaptico|terminal sináptico', 88.0, 20.0, 8, NULL);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (4, 2, 'En la esclerosis múltiple se daña la vaina de mielina: el impulso se enlentece o se bloquea y aparecen debilidad, fatiga y alteraciones de la sensibilidad que dificultan las actividades de la vida diaria. Saber qué hace cada parte permite entender qué síntoma aparece cuando falla.', 1),
  (4, 1, 'Cuando se daña la mielina de la vía auditiva o de los nervios que mueven la boca y la lengua, la conducción se enlentece: se altera la percepción del habla y la articulación.', 2);

-- Actividad demo 5: QUIZ (potencial de acción)
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (5, 2, 'quiz-potencial-accion', 'Quiz: Potencial de Acción',
       'Pon a prueba tu comprensión del potencial de acción: fases, canales iónicos y periodo refractario. 20 preguntas con retroalimentación inmediata.',
       'quiz', 1);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (5, 1, 'Énfasis en cómo se codifica la frecuencia del estímulo (timbre, intensidad) en la frecuencia de PA.', 1),
  (5, 2, 'Énfasis en la integración sensoriomotora y el control de la fuerza muscular vía frecuencia de PA.', 2);

-- Actividad 6: QUIZ de cierre Células nerviosas I (neurona). Base: banco Moodle 2025 + morfología/función/localización.
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (6, 6, 'quiz-celulas-nerviosas-1', 'Quiz: Células nerviosas I (neuronas)',
       'Cierre del práctico: 23 preguntas sobre la organización de la neurona, sus tipos morfológicos y funcionales, y la relación entre forma, función y localización. Cada respuesta muestra una explicación.',
       'quiz', 1);
INSERT OR IGNORE INTO quices (actividad_id, titulo, datos_json, activo) VALUES
  (6, 'Células nerviosas I', '[{"pregunta": "¿Cuál es la función principal del soma neuronal?", "opciones": ["Producir macromoléculas y contener los organelos (centro metabólico)", "Formar la vaina de mielina del axón", "Recibir información de otras neuronas exclusivamente", "Transmitir impulsos eléctricos hacia otras células"], "correcta": 0, "feedback": "El soma es el centro metabólico: sus cuerpos de Nissl (RER) reflejan la alta síntesis de proteínas."}, {"pregunta": "Los cuerpos de Nissl, que dan el aspecto basófilo al soma, corresponden a:", "opciones": ["Mitocondrias agrupadas", "Neurofilamentos", "Vesículas sinápticas", "Retículo endoplásmico rugoso y polirribosomas"], "correcta": 3, "feedback": "Son RER y polirribosomas: reflejan la intensa síntesis proteica de la neurona."}, {"pregunta": "¿Cuál es la función de las espinas dendríticas?", "opciones": ["Aumentar la velocidad de conducción", "Producir neurotransmisores", "Aumentar la superficie de contacto sináptico", "Formar la barrera hematoencefálica"], "correcta": 2, "feedback": "Las espinas multiplican los puntos de contacto con otras neuronas."}, {"pregunta": "¿Dónde se genera el potencial de acción (zona gatillo)?", "opciones": ["En el botón terminal", "En el cono axónico (montículo axonal)", "En las dendritas", "En el núcleo"], "correcta": 1, "feedback": "El cono axónico integra las señales y ahí se dispara el impulso."}, {"pregunta": "Ordena el flujo de información en la neurona:", "opciones": ["Integración → recepción → conducción → transmisión", "Transmisión → conducción → integración → recepción", "Recepción (dendritas y soma) → integración (cono axónico) → conducción (axón) → transmisión (terminal)", "Conducción → recepción → transmisión → integración"], "correcta": 2, "feedback": "El flujo es unidireccional: recepción, integración, conducción y transmisión."}, {"pregunta": "¿Qué tipo de transporte axonal lleva vesículas sinápticas desde el soma hacia las terminaciones?", "opciones": ["Pasivo", "Anterógrado", "Retrógrado", "Lateral"], "correcta": 1, "feedback": "Anterógrado: del soma a los terminales, sobre microtúbulos, con gasto de ATP."}, {"pregunta": "¿Cuál es la dirección del transporte axonal que lleva materiales desde las terminaciones hacia el soma?", "opciones": ["Lateral", "Retrógrado", "Anterógrado", "Bidireccional"], "correcta": 1, "feedback": "Retrógrado: recicla membranas y lleva material endocitado al soma."}, {"pregunta": "¿Cuál es la relación entre diámetro axonal y velocidad de conducción?", "opciones": ["A menor diámetro, mayor velocidad", "Sólo importa la longitud", "No existe relación", "A mayor diámetro, mayor velocidad"], "correcta": 3, "feedback": "Los neurofilamentos determinan el calibre: mayor calibre, mayor velocidad."}, {"pregunta": "La vaina de mielina tiene como función principal:", "opciones": ["Aumentar la velocidad de conducción", "Nutrir al axón", "Producir neurotransmisores", "Filtrar sustancias tóxicas"], "correcta": 0, "feedback": "Aísla el axón y permite la conducción saltatoria entre nódulos de Ranvier."}, {"pregunta": "En el sistema nervioso central, los cuerpos celulares neuronales se agrupan en:", "opciones": ["Tractos", "Núcleos", "Ganglios", "Fascículos"], "correcta": 1, "feedback": "En el SNC forman núcleos; en el SNP, ganglios."}, {"pregunta": "¿Cuál es la característica morfológica de las neuronas pseudounipolares?", "opciones": ["Dos axones paralelos", "Múltiples dendritas desde el soma", "Una dendrita y un axón en polos opuestos", "Una prolongación que se divide en T"], "correcta": 3, "feedback": "Una sola neurita que se bifurca: rama periférica y rama central."}, {"pregunta": "Las neuronas multipolares se caracterizan por tener:", "opciones": ["Dos axones principales", "Una prolongación dividida", "Una dendrita principal y un axón", "Un axón y múltiples dendritas"], "correcta": 3, "feedback": "Un único axón y muchas dendritas: integran información de muchas células."}, {"pregunta": "¿Qué función cumplen principalmente las neuronas bipolares?", "opciones": ["Motoras voluntarias", "Control autónomo", "Integración en la corteza", "Sensoriales especiales (retina, cóclea, olfato)"], "correcta": 3, "feedback": "Están en la retina, el epitelio olfatorio y los ganglios coclear y vestibular."}, {"pregunta": "¿Dónde se encuentran los somas de las neuronas pseudounipolares que llevan el tacto del cuerpo?", "opciones": ["Retina", "Corteza cerebelosa", "Ganglio de la raíz dorsal", "Asta ventral de la médula"], "correcta": 2, "feedback": "En los ganglios de la raíz dorsal (y en ganglios sensitivos de nervios craneales)."}, {"pregunta": "¿Qué tipo de neurona conduce información desde los receptores hacia el SNC?", "opciones": ["De asociación", "Interneuronas", "Sensoriales (aferentes)", "Motoras"], "correcta": 2, "feedback": "Aferente = hacia el SNC."}, {"pregunta": "¿Cuál es la diferencia funcional entre neuronas aferentes y eferentes?", "opciones": ["Las aferentes son motoras y las eferentes sensitivas", "Las aferentes conducen hacia el SNC y las eferentes desde el SNC", "Las aferentes son mielinizadas y las eferentes no", "Las aferentes son multipolares y las eferentes bipolares"], "correcta": 1, "feedback": "Aferente llega al SNC; eferente sale del SNC hacia músculos o glándulas."}, {"pregunta": "Una motoneurona del asta ventral de la médula es:", "opciones": ["Bipolar y aferente", "Pseudounipolar y aferente", "Multipolar y eferente", "Multipolar y de asociación"], "correcta": 2, "feedback": "Multipolar; su axón sale por la raíz ventral hacia el músculo esquelético."}, {"pregunta": "¿Qué tipo de neurona es más común en la corteza cerebral?", "opciones": ["Pseudounipolar", "Unipolar", "Multipolar", "Bipolar"], "correcta": 2, "feedback": "La gran mayoría son multipolares (piramidales y otras)."}, {"pregunta": "Una neurona con soma triangular y una larga dendrita apical hacia la superficie de la corteza es una:", "opciones": ["Motoneurona espinal", "Neurona bipolar", "Célula de Purkinje", "Neurona piramidal"], "correcta": 3, "feedback": "La piramidal: principal neurona de proyección de la corteza cerebral."}, {"pregunta": "Las células de Purkinje se localizan en:", "opciones": ["La corteza del cerebelo", "La corteza cerebral motora", "El asta ventral de la médula", "Los ganglios de la raíz dorsal"], "correcta": 0, "feedback": "Forman una hilera entre la capa molecular y la granular del cerebelo."}, {"pregunta": "¿Qué relación hay entre la forma de la célula de Purkinje y su función?", "opciones": ["Su enorme árbol dendrítico recibe muchísimas sinapsis para integrar y coordinar el movimiento", "No tiene dendritas, por eso sólo transmite", "Su axón corto le permite conducir muy rápido", "Su soma pequeño le permite dividirse"], "correcta": 0, "feedback": "Recibe cientos de miles de sinapsis y es la única salida de la corteza cerebelosa."}, {"pregunta": "Una neurona dopaminérgica se clasifica según:", "opciones": ["Su morfología", "Su función", "Su neurotransmisor", "Su ubicación"], "correcta": 2, "feedback": "Se nombra por el neurotransmisor que libera (dopamina)."}, {"pregunta": "¿Por qué una lesión neuronal en el SNC suele dejar secuelas permanentes?", "opciones": ["Porque las neuronas son postmitóticas y no se reemplazan", "Porque la glía no existe en el SNC", "Porque los axones no tienen mielina", "Porque las neuronas se dividen demasiado"], "correcta": 0, "feedback": "La neurona es postmitótica: el SN se adapta por plasticidad, no por reemplazo."}]', 1);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (6, 2, 'Responde solo/a, sin apuntes. Al terminar revisa el resumen: las preguntas falladas son las que conviene repasar antes de Células II.', 1);

-- Actividad 7: LABELING nivel II (organelos y especializaciones). Imagen img/neurona-nivel2-organelos.jpg (1536×1024),
-- derivada de la ilustración con zooms (img/_fuentes/neurona-nivel2-actina.png) quitando los círculos.
-- Ajustar coordenadas con actividad.php?slug=labeling-neurona-nivel-2&calibrar=1
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (7, 6, 'labeling-neurona-nivel-2', 'Partes de la neurona · Nivel II: organelos y especializaciones',
       'Nivel II: organelos y especializaciones. Escribe de memoria el nombre de cada estructura, compáralo con la respuesta correcta y elige su función. Se desbloquea al completar el nivel I.', 'labeling', 1);
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (7, 'imagen', 'img/neurona-nivel2-organelos.jpg', 'Neurona: organelos y especializaciones', 1);
INSERT OR IGNORE INTO labeling_parts (actividad_id, nombre, x_pct, y_pct, descripcion, funcion, sinonimos, box_x_pct, box_y_pct, orden, forma) VALUES
  (7, 'Espinas dendríticas', 32.6, 20.0,
      'Protrusiones de la dendrita que reciben la mayoría de las sinapsis excitatorias. Cambian de forma y número con la experiencia (plasticidad): son la base celular del aprendizaje.',
      'Pequeñas protrusiones que aumentan la superficie de contacto sináptico y cambian con el aprendizaje.',
      'espina dendritica|espinas|espina', 40, 6, 1, NULL),
  (7, 'Cuerpos de Nissl', 17.1, 43.5,
      'Acúmulos de retículo endoplásmico rugoso y polirribosomas. Dan el aspecto basófilo al soma y reflejan su alta síntesis proteica; no entran al axón.',
      'Fabrican en gran cantidad las proteínas que la neurona necesita.',
      'sustancia de nissl|grumos de nissl|nissl|retículo endoplásmico rugoso|reticulo endoplasmico rugoso|rer', 10, 36, 2, NULL),
  (7, 'Aparato de Golgi', 24.7, 36.1,
      'Trabaja junto a los cuerpos de Nissl: recibe lo que ellos fabrican y lo envía hacia las dendritas y el axón.',
      'Modifica, empaqueta y distribuye las proteínas en vesículas.',
      'golgi|complejo de golgi', 22, 8, 3, NULL),
  (7, 'Mitocondria', 30.6, 40.0,
      'Abundan en el soma, a lo largo del axón y en los terminales, donde la demanda de energía es mayor.',
      'Produce el ATP que la neurona necesita, sobre todo para mantener sus gradientes iónicos.',
      'mitocondrias', 41, 30, 4, NULL),
  (7, 'Segmento inicial del axón', 37.8, 45.4,
      'Es el tramo sin mielina donde el soma se estrecha (cono axónico o montículo axonal) y nace el axón.',
      'Zona gatillo: integra las señales recibidas y, gracias a su alta densidad de canales de sodio, allí se dispara el potencial de acción.',
      'segmento inicial|zona gatillo|cono axonico|cono axónico|monticulo axonal|montículo axonal|cono de implantacion', 43, 54, 5, NULL),
  (7, 'Colateral axónica', 60.6, 61.8,
      'Un axón puede formar muchas colaterales (hasta 200 o más) y comunicarse así con varios blancos a la vez.',
      'Rama lateral del axón que lleva la misma señal hacia otra célula.',
      'colateral|rama colateral|colaterales', 53, 58.5, 6, 'corchete:58.3,55.0,62.8,68.5'),
  (7, 'Cono de crecimiento', 67.2, 71.0,
      'Extremo ensanchado del axón en crecimiento, con prolongaciones finas (filopodios) que exploran el entorno. Dirige el crecimiento durante el desarrollo y la regeneración; su citoesqueleto lo verás en el nivel III.',
      'Extremo móvil de un axón en crecimiento que explora el entorno y guía su avance.',
      'cono de crecimiento axonal', 66, 88, 7, 'elipse:67.2,72.0,4.2,6.8');
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (7, 2, 'Cuando un axón periférico se lesiona (por ejemplo, en una lesión de nervio de la mano), los cuerpos de Nissl se dispersan (cromatólisis) y el extremo del axón forma un nuevo cono de crecimiento para volver a crecer: por eso la recuperación funcional toma semanas a meses.', 1),
  (7, 1, 'En una lesión del nervio facial o hipogloso, la neurona muestra cromatólisis mientras intenta regenerar su axón, que avanza guiado por su cono de crecimiento.', 2);

-- Actividad 8: LABELING nivel III (citoesqueleto y transporte). Imagen img/neurona-nivel3-zoom.jpg (1536×1024):
-- tres ampliaciones (A axón, B cono de crecimiento, C botón terminal) + miniatura de la neurona.
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (8, 6, 'labeling-neurona-nivel-3', 'Partes de la neurona · Nivel III: citoesqueleto y transporte',
       'Nivel III: citoesqueleto y transporte. Los círculos A, B y C son ampliaciones de los lugares marcados en la neurona de abajo (B es el interior del cono de crecimiento). Reconoce cada estructura y su función. Se desbloquea al completar el nivel II.', 'labeling', 1);
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (8, 'imagen', 'img/neurona-nivel3-zoom.jpg', 'Ampliaciones: interior del axón (A), cono de crecimiento (B) y botón terminal (C)', 1);
INSERT OR IGNORE INTO labeling_parts (actividad_id, nombre, x_pct, y_pct, descripcion, funcion, sinonimos, box_x_pct, box_y_pct, orden, forma) VALUES
  (8, 'Microtúbulos', 19.5, 35.9,
      'Polímeros de tubulina orientados a lo largo del axón. Las proteínas motoras caminan sobre ellos gastando ATP.',
      'Forman los rieles por los que se mueve el transporte axonal.',
      'microtubulo|microtúbulo|tubulina', 14, 57, 1, NULL),
  (8, 'Neurofilamentos', 16.3, 24.6,
      'Filamentos intermedios propios de la neurona. A mayor calibre, mayor velocidad de conducción. Su cadena ligera (NfL) en sangre es marcador de daño axonal (EM, ELA).',
      'Dan soporte estructural y determinan el calibre (diámetro) del axón.',
      'neurofilamento|filamentos intermedios', 20, 3.5, 2, NULL),
  (8, 'Proteínas motoras', 8.5, 32.2,
      'Kinesina: transporte anterógrado (del soma al terminal: vesículas, mitocondrias, proteínas nuevas). Dineína: transporte retrógrado (del terminal al soma: membranas para reciclar, material endocitado, factores tróficos). Ambas caminan sobre los microtúbulos gastando ATP.',
      'Transportan carga a lo largo del axón caminando sobre los microtúbulos, en ambos sentidos.',
      'kinesina|dineína|kinesina y dineina|motores moleculares|proteinas motoras', 7, 66, 3, 'puntos:26.2,29.3'),
  (8, 'Filamentos de actina', 45.6, 32.2,
      'Polímeros de actina, los filamentos más delgados del citoesqueleto (microfilamentos). Se concentran en el cono de crecimiento (filopodios y lamelipodio) y en las espinas dendríticas; su armado y desarmado rápido permite que el axón avance y que las espinas cambien con la plasticidad.',
      'Forman los filopodios del cono de crecimiento y sostienen las espinas dendríticas: permiten cambios rápidos de forma.',
      'actina|filamento de actina|microfilamentos|microfilamento|f-actina', 50, 56, 4, NULL),
  (8, 'Vesículas sinápticas', 80.7, 28.8,
      'Están en el botón terminal y liberan su contenido por exocitosis cuando llega el impulso (lo verás en detalle en Sinapsis).',
      'Almacenan el neurotransmisor hasta que llega el potencial de acción.',
      'vesiculas|vesícula sináptica|vesiculas sinapticas', 86, 57, 5, NULL);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (8, 2, 'El transporte axonal depende del citoesqueleto: en los axones más largos (como los que llegan a los pies y las manos) falla primero, y por eso las neuropatías periféricas empiezan con hormigueo y torpeza distal.', 1),
  (8, 1, 'Las espinas dendríticas y su actina cambian con la práctica: es la base celular del aprendizaje, por ejemplo al adquirir o rehabilitar habilidades del habla.', 2);
