-- NeuroLab — seed.sql
-- Datos mínimos para MVP: 2 carreras + 5 topics del tronco común + 1 actividad por tipo.
-- Idempotente: limpia tablas antes de poblar (manteniendo PK contadores).

-- Limpiar primero (orden importa por FK)
DELETE FROM actividad_carrera;
DELETE FROM labeling_parts;
DELETE FROM quices;
DELETE FROM actividad_recursos;
DELETE FROM actividades;
DELETE FROM topic_recursos;
DELETE FROM topics;
DELETE FROM carreras;
DELETE FROM sqlite_sequence WHERE name IN ('carreras','topics','actividades','actividad_recursos','actividad_carrera','labeling_parts','quices','topic_recursos');

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

-- Actividad demo 4: LABELING (imagen con hotspots)
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (4, 6, 'labeling-partes-neurona', 'Identificación: Partes de la Neurona',
       'Haz clic en cada parte señalada de la neurona y selecciona el nombre correcto. Inmediato retroalimentación.',
       'labeling', 1);
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (4, 'imagen', 'img/neurona-labeling.svg', 'Esquema de neurona típica', 1);
INSERT OR IGNORE INTO labeling_parts (actividad_id, nombre, x_pct, y_pct, descripcion, orden) VALUES
  (4, 'Dendritas',  35, 25, 'Prolongaciones que reciben señales de otras neuronas.', 1),
  (4, 'Soma',       50, 50, 'Cuerpo celular que contiene el núcleo.', 2),
  (4, 'Axón',       78, 50, 'Prolongación que conduce el potencial de acción.', 3),
  (4, 'Botones terminales', 88, 70, 'Liberan neurotransmisores en la sinapsis.', 4),
  (4, 'Vaina de mielina',   68, 35, 'Aísla el axón y acelera la conducción.', 5);
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
