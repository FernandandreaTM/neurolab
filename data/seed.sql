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

-- Actividad demo 1: LÁMINA virtual (cells del SN)
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (1, 6, 'lamina-neurona-piramidal', 'Lámina: Neurona Piramidal (Golgi)',
       'Observa una lámina virtual de corteza cerebral teñida con método de Golgi. Identifica una neurona piramidal y reconoce su soma, dendritas apicales y axón.',
       'lamina', 1);
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (1, 'iframe_url', 'https://histologyguide.com/slideview/MHS-284-brain/06-slide-1.html?page=2',
      'Corte sagital de cerebro de rata — método de Golgi', 1);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (1, 1, 'En Fonoaudiología, las neuronas piramidales son relevantes por su rol en el área de Broca (producción del lenguaje) y el área de Wernicke (comprensión).', 1),
  (1, 2, 'En Terapia Ocupacional, las piramidales son la vía final común del control motor voluntario (tracto corticoespinal).', 2);

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
       'Compara las características morfológicas y funcionales de neuronas bipolares, pseudounipolares y multipolares lado a lado.',
       'comparador', 1);
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (3, 'texto_html',
      '<table class="comparador-table"><thead><tr><th>Característica</th><th>Bipolar</th><th>Pseudounipolar</th><th>Multipolar</th></tr></thead><tbody><tr><td>Morfología</td><td>2 prolongaciones (1 dendrita, 1 axón)</td><td>1 prolongación que se bifurca</td><td>Múltiples dendritas, 1 axón</td></tr><tr><td>Función</td><td>Sentidos especiales (retina, olfato)</td><td>Sensitiva (ganglio raquídeo)</td><td>Motora, asociación</td></tr><tr><td>Ejemplo clínico</td><td>Célula bipolar retinal</td><td>Neurona del ganglio de la raíz dorsal</td><td>Motoneurona espinal, piramidal</td></tr></tbody></table>',
      'Cuadro comparativo', 1);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (3, 1, 'En Fonoaudiología interesa especialmente la neurona bipolar coclear y vestibular, relevante en la vía auditiva.', 1),
  (3, 2, 'En TO interesa la motoneurona multipolar (asta ventral) y las interneuronas de la médula espinal.', 2);

-- Práctica por niveles del comparador (actividad 3)
INSERT OR IGNORE INTO practica_niveles (id, actividad_id, numero, titulo, instrucciones, tipo, activo) VALUES
  (1, 3, 1, 'Frases',
      'Completa cada frase con el tipo de neurona que describe: bipolar, pseudounipolar o multipolar. Escribe y presiona Enter.',
      'completar', 1),
  (2, 3, 2, 'Dibujo de neuronas',
      'Arma cada neurona: elige una pieza (dendrita, axón o neurita en T) y toca un punto alrededor del soma para agregarla. Tocar de nuevo la quita. Cuando esté lista, presiona Revisar.',
      'armar', 1),
  (3, 3, 3, 'Subtipos de neuronas multipolares',
      'Piramidales, de Purkinje, estrelladas o granulares y motoneuronas espinales.',
      'completar', 0);

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
      'Es el tipo celular más común y abundante del sistema nervioso humano.', 9);

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
  (4, 6, 'labeling-partes-neurona', 'Identificación: Partes de la Neurona',
       'Escribe el nombre de cada parte de la neurona. Luego verás el nombre correcto, otros nombres válidos y su función: compáralo con tu respuesta y marca si coincide. Lo que no coincida queda marcado para repasar.',
       'labeling', 1);
-- Texto vigente (actualiza también BD ya pobladas)
UPDATE actividades SET descripcion = 'Escribe el nombre de cada parte de la neurona. Luego verás el nombre correcto, otros nombres válidos y su función: compáralo con tu respuesta y marca si coincide. Lo que no coincida queda marcado para repasar.' WHERE slug = 'labeling-partes-neurona';
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (4, 'imagen', 'img/neurona-partes.jpg', 'Esquema de una neurona multipolar mielinizada', 1);
INSERT OR IGNORE INTO labeling_parts (actividad_id, nombre, x_pct, y_pct, descripcion, sinonimos, box_x_pct, box_y_pct, orden) VALUES
  (4, 'Dendritas', 23.0, 21.0,
      'Prolongaciones ramificadas que reciben las señales de otras neuronas y las llevan hacia el soma.',
      'dendrita|arbol dendritico|árbol dendrítico|dendritas', 23.0, 13.5, 1),
  (4, 'Núcleo', 24.3, 45.0,
      'Contiene el material genético y dirige la síntesis de proteínas de la neurona.',
      'nucleo|núcleo celular', 24.3, 33.5, 2),
  (4, 'Soma', 32.0, 52.5,
      'El cuerpo celular: integra las señales que llegan por las dendritas y contiene los organelos.',
      'cuerpo celular|pericarion|soma neuronal|cuerpo neuronal', 31.0, 66.0, 3),
  (4, 'Cono axónico', 38.3, 46.5,
      'Zona donde el soma se estrecha para dar origen al axón. Aquí se genera el potencial de acción.',
      'cono axonico|cono de implantacion|cono de implantación|segmento inicial', 36.0, 38.0, 4),
  (4, 'Axón', 41.8, 47.3,
      'Prolongación única que conduce el potencial de acción desde el soma hasta los terminales.',
      'axon|fibra nerviosa', 44.0, 60.0, 5),
  (4, 'Vaina de mielina', 56.0, 50.5,
      'Envoltura aislante formada por células gliales. Permite la conducción saltatoria y la acelera.',
      'mielina|vaina mielinica|vaina mielínica|vaina de mielina', 56.0, 39.5, 6),
  (4, 'Nódulo de Ranvier', 71.4, 53.0,
      'Espacio sin mielina entre dos segmentos. Ahí se regenera el impulso y salta al siguiente nódulo.',
      'nodulo de ranvier|nodo de ranvier|nódulo|nodulo|ranvier', 71.4, 64.0, 7),
  (4, 'Ramas terminales', 86.5, 58.0,
      'Ramificación final del axón, que reparte la señal hacia varias células a la vez.',
      'telodendron|telodendrón|arborizacion terminal|arborización terminal|terminal axonico|terminal axónico|ramas terminales', 80.0, 70.0, 8),
  (4, 'Botón terminal', 90.5, 31.0,
      'Ensanchamiento del extremo del axón que libera neurotransmisores hacia la siguiente célula.',
      'boton terminal|botones terminales|boton sinaptico|botón sináptico|terminal presinaptico|terminal presináptico|botones sinapticos', 88.0, 20.0, 9);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (4, 1, 'Reconocer las partes es fundamental para entender los trastornos del lenguaje asociados a daño en áreas corticales específicas.', 1),
  (4, 2, 'Las lesiones en axón y mielina son la base de enfermedades desmielinizantes que afectan la función motora y sensorial.', 2);

-- Actividad demo 5: QUIZ (potencial de acción)
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (5, 2, 'quiz-potencial-accion', 'Quiz: Potencial de Acción',
       'Pon a prueba tu comprensión del potencial de acción: fases, canales iónicos y periodo refractario. 20 preguntas con retroalimentación inmediata.',
       'quiz', 1);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (5, 1, 'Énfasis en cómo se codifica la frecuencia del estímulo (timbre, intensidad) en la frecuencia de PA.', 1),
  (5, 2, 'Énfasis en la integración sensoriomotora y el control de la fuerza muscular vía frecuencia de PA.', 2);
