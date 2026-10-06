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
       'Observa una lámina virtual de cerebro teñida con método de Golgi. Localiza una neurona piramidal (corteza cerebral) y una célula de Purkinje (cerebelo), reconoce su soma, dendritas y axón, y relaciona su forma con su función. Sigue las tareas de la pestaña Guía de observación.',
       'lamina', 1);
UPDATE actividades SET titulo = 'Lámina Golgi: Neurona Piramidal y Célula de Purkinje',
       descripcion = 'Observa una lámina virtual de cerebro teñida con método de Golgi. Localiza una neurona piramidal (corteza cerebral) y una célula de Purkinje (cerebelo), reconoce su soma, dendritas y axón, y relaciona su forma con su función. Sigue las tareas de la pestaña Guía de observación.'
       WHERE slug = 'lamina-neurona-piramidal';
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (1, 'iframe_url', 'https://histologyguide.com/slideview/MHS-284-brain/06-slide-1.html?page=2',
      'Corte sagital de cerebro de rata — método de Golgi (histologyguide.com)', 1),
  (1, 'texto_html', '<div class="nl-guia"><p class="nl-guia__intro">Corte sagital de cerebro de rata, tinción de Golgi (plata): tiñe al azar unas pocas neuronas completas, con sus prolongaciones. La glía no se tiñe. Usa el zoom de la lámina (pestaña <strong>Lámina virtual</strong>).</p><h3>Tareas</h3><ol class="nl-guia__tareas"><li><strong>Ubica la corteza cerebral</strong> (parte superior, bajo la superficie) y el <strong>cerebelo</strong> (estructura posterior con pliegues, las folias).</li><li>En la corteza cerebral, busca una <strong>neurona piramidal</strong>: soma triangular, una dendrita apical larga hacia la superficie y dendritas basales.</li><li>En el cerebelo, busca una <strong>célula de Purkinje</strong>: soma en una sola hilera entre la capa granular y la capa molecular, con un árbol dendrítico en abanico hacia la superficie.</li><li>En cada una, reconoce <strong>soma, dendritas y axón</strong>. Haz una captura o un dibujo y rotúlalo en tu guía.</li><li>Muéstrale tu captura a la docente antes de seguir.</li></ol><h3>Preguntas</h3><details class="nl-guia__q"><summary>1. ¿En qué zona del encéfalo está cada una?</summary><p>La <strong>piramidal</strong> en la corteza cerebral (capas III y V; también en el hipocampo). La <strong>célula de Purkinje</strong> en la corteza del cerebelo, en la capa de Purkinje (entre la capa molecular y la granular).</p></details><details class="nl-guia__q"><summary>2. ¿A qué tipo morfológico pertenecen ambas?</summary><p>Ambas son <strong>multipolares</strong>: un solo axón y muchas dendritas.</p></details><details class="nl-guia__q"><summary>3. ¿Cuál es la función de la neurona piramidal y cómo se relaciona con su forma?</summary><p>Es la principal neurona de proyección (excitatoria, glutamatérgica) de la corteza. Su dendrita apical recorre varias capas y recibe información de muchas fuentes; su axón largo sale de la corteza (p. ej. el tracto corticoespinal lleva la orden del movimiento voluntario a la médula).</p></details><details class="nl-guia__q"><summary>4. ¿Cuál es la función de la célula de Purkinje y cómo se relaciona con su forma?</summary><p>Integra la información que llega al cerebelo para coordinar y ajustar el movimiento. Su árbol dendrítico enorme y plano recibe cientos de miles de sinapsis; su axón es la única salida de la corteza cerebelosa y es inhibitorio (GABA).</p></details><details class="nl-guia__q"><summary>5. ¿Por qué con Golgi se ven neuronas completas y aisladas?</summary><p>Porque la plata tiñe al azar sólo un pequeño porcentaje de neuronas, pero cada una completa. Si se tiñeran todas, no se podría distinguir una de otra.</p></details></div>', 'Guía de observación', 2);
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
INSERT OR IGNORE INTO labeling_parts (actividad_id, nombre, x_pct, y_pct, descripcion, funcion, sinonimos, box_x_pct, box_y_pct, orden) VALUES
  (4, 'Dendritas', 23.0, 21.0,
      'Recepción: prolongaciones ramificadas que reciben señales de otras neuronas y las conducen hacia el soma. Sus espinas dendríticas aumentan la superficie de contacto sináptico.',
      'Reciben las señales de otras neuronas y las conducen hacia el cuerpo celular.',
      'dendrita|arbol dendritico|árbol dendrítico|dendritas', 23.0, 13.5, 1),
  (4, 'Núcleo', 24.3, 45.0,
      'Contiene el material genético y dirige la síntesis de proteínas. La neurona es postmitótica: no se divide ni se reemplaza.',
      'Contiene el material genético y dirige la síntesis de proteínas de la célula.',
      'nucleo|núcleo celular|nucleo celular', 24.3, 33.5, 2),
  (4, 'Soma', 32.0, 52.5,
      'Cuerpo celular o pericarion: "centro metabólico" que produce las macromoléculas de la neurona. Sus cuerpos de Nissl (RER) reflejan la alta síntesis proteica. También recibe señales.',
      'Centro metabólico: produce las macromoléculas y contiene la mayoría de los organelos.',
      'cuerpo celular|pericarion|pericarión|soma neuronal|cuerpo neuronal', 31.0, 66.0, 3),
  (4, 'Cono axónico', 38.3, 46.5,
      'Integración: zona donde nace el axón (montículo axonal). Es la zona gatillo, donde se genera el potencial de acción.',
      'Zona gatillo: integra las señales recibidas y allí se genera el potencial de acción.',
      'cono axonico|cono de implantacion|cono de implantación|monticulo axonal|montículo axonal|zona gatillo|segmento inicial', 36.0, 38.0, 4),
  (4, 'Axón', 41.8, 47.3,
      'Conducción: prolongación única que lleva el impulso desde el soma hasta los terminales (1 mm a 1 m). Por sus microtúbulos ocurre el transporte axonal anterógrado y retrógrado.',
      'Conduce el impulso nervioso desde el cuerpo celular hacia los terminales.',
      'axon|fibra nerviosa|cilindroeje', 44.0, 60.0, 5),
  (4, 'Vaina de mielina', 56.0, 50.5,
      'Envoltura aislante formada por glía: célula de Schwann en el SNP, oligodendrocito en el SNC. Aumenta la velocidad de conducción (conducción saltatoria).',
      'Aísla la prolongación y aumenta la velocidad de conducción del impulso.',
      'mielina|vaina mielinica|vaina mielínica|vaina de mielina|celula de schwann|célula de schwann|celulas de schwann', 56.0, 39.5, 6),
  (4, 'Nódulo de Ranvier', 71.4, 53.0,
      'Espacio sin mielina entre dos segmentos. Ahí se regenera el impulso, que "salta" de nódulo en nódulo.',
      'Interrupción del aislante donde se regenera el impulso, que salta de una a otra.',
      'nodulo de ranvier|nodo de ranvier|nódulo|nodulo|ranvier|nodulos de ranvier', 71.4, 64.0, 7),
  (4, 'Ramas terminales', 86.5, 58.0,
      'Telodendrón: ramificación final del axón que reparte la señal hacia varias células a la vez.',
      'Reparten la señal hacia varias células blanco a la vez.',
      'telodendron|telodendrón|arborizacion terminal|arborización terminal|terminal axonico|terminal axónico|ramas terminales', 80.0, 70.0, 8),
  (4, 'Botón terminal', 90.5, 31.0,
      'Transmisión: terminal sináptico con vesículas de neurotransmisor, que se liberan cuando llega el potencial de acción.',
      'Libera neurotransmisores hacia la siguiente célula.',
      'boton terminal|botones terminales|boton sinaptico|botón sináptico|terminal presinaptico|terminal presináptico|botones sinapticos|terminal sinaptico|terminal sináptico', 88.0, 20.0, 9);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (4, 1, 'Reconocer las partes es fundamental para entender los trastornos del lenguaje asociados a daño en áreas corticales específicas.', 1),
  (4, 2, 'Las lesiones en axón y mielina son la base de enfermedades desmielinizantes (p. ej. esclerosis múltiple) que afectan la función motora y sensorial. El neurofilamento ligero (NfL) en sangre se usa como marcador de daño axonal.', 2);

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

-- Actividad 7: LABELING nivel II (ultraestructura). Imagen img/neurona-nivel2.jpg (1536×1024).
-- Ajustar coordenadas con actividad.php?slug=labeling-neurona-nivel-2&calibrar=1
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (7, 6, 'labeling-neurona-nivel-2', 'Partes de la neurona · Nivel II: estructura específica',
       'Nivel II: estructura específica. Reconoce estructuras finas de la neurona (citoesqueleto, organelos, transporte axonal, crecimiento) y su función. Desbloquéalo completando el nivel I.', 'labeling', 1);
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (7, 'imagen', 'img/neurona-nivel2.jpg', 'Neurona: ultraestructura, transporte axonal y cono de crecimiento', 1);
INSERT OR IGNORE INTO labeling_parts (actividad_id, nombre, x_pct, y_pct, descripcion, funcion, sinonimos, box_x_pct, box_y_pct, orden) VALUES
  (7, 'Espinas dendríticas', 32.6, 20.0,
      'Protrusiones de la dendrita sostenidas por actina. Reciben la mayoría de las sinapsis excitatorias y cambian de forma y número con la experiencia (plasticidad).',
      'Pequeñas protrusiones que aumentan la superficie de contacto sináptico y cambian con el aprendizaje.',
      'espina dendritica|espinas|espina', 40, 6, 1),
  (7, 'Cuerpos de Nissl', 17.1, 43.5,
      'Acúmulos de retículo endoplásmico rugoso y polirribosomas. Dan el aspecto basófilo al soma y reflejan su alta síntesis proteica; no entran al axón.',
      'Fabrican en gran cantidad las proteínas que la neurona necesita.',
      'sustancia de nissl|grumos de nissl|nissl|retículo endoplásmico rugoso|reticulo endoplasmico rugoso|rer', 10, 36, 2),
  (7, 'Aparato de Golgi', 24.7, 36.1,
      'Recibe las proteínas del RER, las modifica y las empaqueta en vesículas que viajan hacia las dendritas y el axón.',
      'Modifica, empaqueta y distribuye las proteínas en vesículas.',
      'golgi|complejo de golgi', 22, 8, 3),
  (7, 'Mitocondria', 30.6, 40.0,
      'Abundan en el soma, a lo largo del axón y en los terminales, donde la demanda de energía es mayor.',
      'Produce el ATP que consumen las bombas iónicas y el transporte axonal.',
      'mitocondrias', 41, 30, 4),
  (7, 'Segmento inicial del axón', 37.8, 45.4,
      'Tramo sin mielina que sigue al cono axónico. Su alta densidad de canales de Na⁺ dependientes de voltaje lo convierte en la zona gatillo.',
      'Primer tramo del axón, rico en canales de sodio: allí se dispara el potencial de acción.',
      'segmento inicial|zona gatillo', 46, 62, 5),
  (7, 'Microtúbulos', 61.8, 27.8,
      'Polímeros de tubulina orientados a lo largo del axón. Las proteínas motoras caminan sobre ellos gastando ATP.',
      'Forman los rieles por los que se mueve el transporte axonal.',
      'microtubulo|microtúbulo|tubulina', 47, 41, 6),
  (7, 'Neurofilamentos', 65.1, 32.2,
      'Filamentos intermedios propios de la neurona. A mayor calibre, mayor velocidad de conducción. Su cadena ligera (NfL) en sangre es marcador de daño axonal (EM, ELA).',
      'Dan soporte estructural y determinan el calibre (diámetro) del axón.',
      'neurofilamento|filamentos intermedios', 80, 30, 7),
  (7, 'Kinesina', 70.5, 21.5,
      'Transporte anterógrado: lleva vesículas, mitocondrias y proteínas nuevas hacia los terminales, caminando sobre los microtúbulos.',
      'Proteína motora que lleva carga desde el soma hacia el terminal.',
      'kinesinas|cinesina|transporte anterogrado|transporte anterógrado', 84, 12, 8),
  (7, 'Dineína', 55.9, 24.2,
      'Transporte retrógrado: devuelve membranas para reciclar, mitocondrias viejas y material endocitado (incluidos factores tróficos y algunos virus).',
      'Proteína motora que lleva material desde el terminal hacia el soma.',
      'dineinas|dineína|transporte retrogrado|transporte retrógrado', 44, 18, 9),
  (7, 'Colateral axónica', 60.2, 54.7,
      'Un axón puede formar muchas colaterales (hasta 200 o más) y comunicarse así con varios blancos a la vez.',
      'Rama lateral del axón que lleva la misma señal hacia otra célula.',
      'colateral|rama colateral|colaterales', 52, 74, 10),
  (7, 'Célula de Schwann', 64.8, 52.0,
      'Cada célula de Schwann envuelve un solo internodo; en el SNC esta función la cumple el oligodendrocito. También favorece la regeneración del axón periférico.',
      'Forma la mielina alrededor de un tramo del axón en el sistema nervioso periférico.',
      'celula de schwann|schwann|neurolemocito', 72, 62, 11),
  (7, 'Cono de crecimiento', 67.0, 70.3,
      'Rico en actina, con filopodios y lamelipodios. Dirige el crecimiento del axón durante el desarrollo y en la regeneración.',
      'Extremo móvil de un axón en crecimiento que explora el entorno y guía su avance.',
      'cono de crecimiento axonal', 66, 88, 12),
  (7, 'Vesículas sinápticas', 82.7, 78.1,
      'Están en el botón terminal y liberan su contenido por exocitosis cuando llega el impulso (lo verás en detalle en Sinapsis).',
      'Almacenan el neurotransmisor hasta que llega el potencial de acción.',
      'vesiculas|vesícula sináptica|vesiculas sinapticas', 73, 96, 13);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (7, 2, 'El transporte axonal y el citoesqueleto explican por qué un axón largo (como el de una motoneurona) es vulnerable: si el transporte falla, el extremo distal se daña primero (neuropatías periféricas).', 1);
