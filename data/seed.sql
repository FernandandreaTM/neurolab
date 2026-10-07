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
  (1, 6, 'lamina-neurona-piramidal', 'Lámina: neuronas reales',
       'Corte sagital de cerebro de rata en dos tinciones. Nivel I: oriéntate en el corte. Nivel II: con Golgi, encuentra una neurona piramidal y una célula de Purkinje, captúralas, recórtalas y etiquétalas. Nivel III: compara el cerebelo con Golgi y con cresil violeta.',
       'lamina', 1);
-- Recurso "tareas" con niveles: el nivel 1 usa el motor de identificación (labeling_parts de esta actividad);
-- los niveles de capturas los maneja js/lamina.js
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (1, 'tareas', '{"laminas": {"golgi": {"nombre": "Golgi (plata)", "url": "https://histologyguide.com/slideview/MHS-284-brain/06-slide-1.html?page=2", "caption": "Corte sagital de cerebro de rata — método de Golgi (histologyguide.com)"}, "cresil": {"nombre": "Cresil violeta (Nissl)", "url": "https://histologyguide.com/slideview/MHS-283-brain/06-slide-1.html", "caption": "Corte sagital de cerebro de rata — cresil violeta (histologyguide.com)"}}, "niveles": [{"n": 1, "tipo": "identificar", "titulo": "Orientación en el corte", "img": "img/corte-sagital-rata.jpg"}, {"n": 2, "tipo": "capturas", "titulo": "Piramidal y Purkinje con Golgi", "laminas": ["golgi"], "instrucciones": "Para cada neurona sigue los 4 pasos del panel: buscar y capturar, recortar, etiquetar y responder. <strong>Verde</strong>: correcto. <strong>Rojo</strong>: por repasar. <strong>Naranjo</strong>: lo que estás haciendo.", "capturas": [{"clave": "piramidal", "titulo": "Neurona piramidal", "lamina": "golgi", "busca": "En la corteza cerebral (bajo la superficie del hemisferio) busca un soma con forma de triángulo, una dendrita larga que sube hacia la superficie y dendritas más cortas en la base.", "etiquetas": ["Soma", "Dendrita apical", "Dendritas basales", "Axón"], "preguntas": [{"p": "¿En qué zona del encéfalo encontraste la neurona piramidal?", "ops": ["Corteza cerebral", "Corteza del cerebelo", "Tronco encefálico", "Bulbo olfatorio"], "ok": 0, "pista": "Busca bajo la superficie de los hemisferios, no en la estructura con folias.", "exp": "Las neuronas piramidales están en la corteza cerebral (capas III y V) y también en el hipocampo."}, {"p": "¿Qué rasgo de la neurona piramidal le permite recibir información de varias capas de la corteza?", "ops": ["Su dendrita apical larga, que atraviesa varias capas", "Su soma pequeño y redondo", "Que no tiene dendritas basales", "Su axón corto que no sale de la corteza"], "ok": 0, "pista": "Fíjate en la prolongación que sube hacia la superficie.", "exp": "La dendrita apical cruza varias capas corticales y recibe aferencias de distintos orígenes; las basales integran información local."}, {"p": "¿Cuál es la función principal de las neuronas piramidales de la corteza motora?", "ops": ["Iniciar el movimiento voluntario: su axón forma el tracto corticoespinal", "Coordinar y ajustar la precisión del movimiento", "Llevar el tacto desde la piel hasta la médula", "Formar la mielina de los axones"], "ok": 0, "pista": "Piensa en la neurona de proyección cuyo axón baja hasta la médula.", "exp": "Son neuronas de proyección excitatorias (glutamatérgicas): su axón largo sale de la corteza y, en la corteza motora, forma el tracto corticoespinal (motoneurona superior)."}]}, {"clave": "purkinje", "titulo": "Célula de Purkinje", "lamina": "golgi", "busca": "En el cerebelo (la estructura posterior con folias), busca somas grandes ordenados en una sola hilera, con un árbol dendrítico en abanico que sube hacia la superficie de la folia y un axón que baja hacia su centro.", "etiquetas": ["Soma", "Árbol dendrítico", "Axón", "Sustancia blanca"], "preguntas": [{"p": "¿Dónde quedan los somas de Purkinje dentro de la folia?", "ops": ["En una hilera entre la capa externa (molecular) y la capa interna (granular)", "En la superficie de la folia, justo bajo la piamadre que la recubre", "En el centro de la folia, junto a los axones que entran y salen de ella", "Repartidos sin orden en todo el espesor de la corteza del cerebelo"], "ok": 0, "pista": "Sigue el árbol dendrítico hacia la superficie y el axón hacia el centro: el soma queda entre ambos.", "exp": "Forman una sola hilera (capa de Purkinje): su árbol dendrítico ocupa la capa molecular, por fuera, y su axón cruza la capa granular, por dentro."}, {"p": "El centro de cada folia, hacia donde baja el axón de Purkinje, casi no tiene somas. ¿Qué es esa zona?", "ops": ["Sustancia blanca: axones que entran y salen de la corteza del cerebelo", "Sustancia gris: somas pequeños que la plata no alcanzó a impregnar", "Capa molecular: dendritas de Purkinje que todavía no se ramifican", "Un ventrículo: espacio con líquido cefalorraquídeo entre las folias"], "ok": 0, "pista": "Piensa en qué viaja por el axón de Purkinje una vez que sale de la corteza.", "exp": "Es la sustancia blanca del cerebelo: axones mielinizados, como los de Purkinje (la única salida de la corteza cerebelosa) y las fibras que llegan a ella."}, {"p": "Bajo la hilera de Purkinje hay una capa que con Golgi se ve casi vacía. ¿Qué crees que hay ahí?", "ops": ["Muchísimas neuronas pequeñas que la plata no impregnó", "Sólo axones mielinizados, como en la sustancia blanca", "Un espacio vacío que dejó el tejido al deshidratarse", "Las dendritas de Purkinje antes de salir hacia afuera"], "ok": 0, "pista": "La plata impregna sólo algunas neuronas al azar: que no las veas no significa que no estén.", "exp": "Es la capa granular, la más poblada de todo el encéfalo: miles de millones de células granulares que el Golgi casi no tiñe. Lo comprobarás en el nivel III con cresil violeta."}, {"p": "¿Cuál es la función principal de la célula de Purkinje?", "ops": ["Integrar la información del cerebelo para coordinar y ajustar el movimiento", "Iniciar el movimiento voluntario desde la corteza motora del cerebro", "Llevar la sensibilidad de la piel y los músculos hasta la médula espinal", "Formar recuerdos nuevos de hechos y lugares junto con el hipocampo"], "ok": 0, "pista": "El cerebelo no inicia el movimiento: lo corrige.", "exp": "Es la única salida de la corteza cerebelosa y es inhibitoria (GABAérgica): ajusta la precisión y la coordinación del movimiento."}]}]}, {"n": 3, "tipo": "capturas", "titulo": "Cerebelo con Golgi y cresil violeta", "laminas": ["golgi", "cresil"], "instrucciones": "Mira la <strong>misma zona del cerebelo</strong> con dos tinciones (botones sobre la lámina) y compara: ¿qué se ve con una que no se ve con la otra, y por qué? En cada captura etiqueta las capas y responde. <strong>Verde</strong>: correcto. <strong>Rojo</strong>: por repasar. <strong>Naranjo</strong>: lo que estás haciendo.", "capturas": [{"clave": "cerebelo-golgi", "titulo": "Cerebelo con Golgi", "lamina": "golgi", "busca": "Con Golgi, enfoca una folia del cerebelo donde se vean sus capas: la molecular (externa, clara), la hilera de células de Purkinje y la granular (interna).", "etiquetas": ["Capa molecular", "Capa de Purkinje", "Capa granular"], "preguntas": [{"p": "En tu captura con Golgi la capa molecular se ve llena de ramas, pero casi sin somas. ¿De dónde vienen esas ramas?", "ops": ["Del árbol dendrítico de las células de Purkinje que está bajo ella", "De axones de la sustancia blanca que suben hasta la superficie", "De la glía que forma una red de soporte en la superficie del cerebelo", "De dendritas de las neuronas granulares que viven en esa misma capa"], "ok": 0, "pista": "Sigue una rama hacia abajo: ¿en qué soma termina?", "exp": "La capa molecular la ocupan los árboles dendríticos de Purkinje (y los axones de las granulares, que la cruzan como fibras paralelas). Tiene pocos somas: por eso se ve clara con cresil."}, {"p": "Con Golgi, ¿qué te permite reconocer una célula de Purkinje aunque esté sola?", "ops": ["Soma grande en la hilera media y árbol dendrítico en abanico hacia afuera", "Soma pequeño en la capa interna y pocas dendritas cortas en forma de garra", "Soma triangular y una dendrita apical que baja hacia la sustancia blanca", "Soma grande en la capa externa y un axón muy ramificado hacia la superficie"], "ok": 0, "pista": "Ubica la hilera de somas entre la capa clara y la capa interna.", "exp": "Golgi muestra la forma completa: soma grande en la capa de Purkinje y un árbol dendrítico aplanado que llena la capa molecular. Su axón baja hacia la sustancia blanca."}]}, {"clave": "cerebelo-cresil", "titulo": "Cerebelo con cresil violeta", "lamina": "cresil", "busca": "Cambia a Cresil violeta y busca la misma zona del cerebelo. Ahora la capa granular se ve repleta de núcleos pequeños y los somas de Purkinje se ven grandes, en hilera.", "etiquetas": ["Capa molecular", "Capa de Purkinje", "Capa granular", "Sustancia blanca"], "preguntas": [{"p": "Con cresil violeta ves los somas de Purkinje, pero no su árbol dendrítico. ¿Por qué?", "ops": ["El cresil marca el ARN de los cuerpos de Nissl, abundantes en el soma", "El cresil marca sólo núcleos: el citoplasma y las dendritas no se tiñen", "El cresil marca sólo glía: esos somas grandes son astrocitos, no neuronas", "El cresil disuelve las membranas y con ellas se pierden las dendritas finas"], "ok": 0, "pista": "Es un colorante básico: recuerda qué organelo del soma tiene mucho ARN (nivel II de «Partes de la neurona»).", "exp": "Se une al ARN del retículo endoplásmico rugoso (cuerpos de Nissl), que está en el soma y en las dendritas más gruesas; las ramas finas y el axón casi no tienen Nissl."}, {"p": "Al comparar tus dos capturas, ¿qué explica que la capa granular cambie tanto?", "ops": ["Es la misma capa: Golgi marca pocas células completas y cresil, todos los somas", "Son capas distintas: con Golgi enfocaste la molecular y con cresil la granular", "Es la misma capa: el cresil tiñe también la glía y el Golgi sólo las neuronas", "Son cortes distintos: el de cresil es más grueso y por eso muestra más células"], "ok": 0, "pista": "Piensa en cuántas neuronas marca cada tinción y qué parte de cada neurona.", "exp": "Las células granulares son las neuronas más numerosas del encéfalo: con cresil se ven todos sus somas; con Golgi sólo se impregnan unas pocas."}, {"p": "Si necesitas (a) contar las neuronas de una capa y (b) describir la forma de sus dendritas, ¿qué tinción eliges?", "ops": ["(a) Cresil, porque marca todos los somas; (b) Golgi, porque muestra la célula entera", "(a) Golgi, porque marca todos los somas; (b) cresil, porque muestra la célula entera", "(a) Cresil, porque marca todos los somas; (b) cresil, porque también tiñe dendritas", "(a) Golgi, porque marca pocas células; (b) Golgi, porque muestra la célula entera"], "ok": 0, "pista": "Una tinción muestra todos los somas sin prolongaciones; la otra, pocas neuronas pero completas.", "exp": "Cresil (Nissl): todos los somas, ideal para contar y ver capas. Golgi: pocas neuronas completas, ideal para estudiar su morfología."}]}]}]}', 'Trabajo de la lámina', 1);
-- Nivel I (orientación): estructuras del esquema img/corte-sagital-rata.jpg
INSERT OR IGNORE INTO labeling_parts (actividad_id, nombre, x_pct, y_pct, descripcion, funcion, sinonimos, box_x_pct, box_y_pct, orden, forma) VALUES
  (1, 'Bulbo olfatorio', 10.0, 45.5,
      'Recibe los axones de las neuronas olfatorias, que son bipolares. En la rata es grande: el olfato es su sentido principal.',
      'Primera estación de la vía olfatoria: recibe y procesa la información de los olores.',
      'bulbo olfativo|bulbos olfatorios|bulbo', 6, 26, 1, 'elipse:13.7,47.0,7.9,8.4'),
  (1, 'Corteza cerebral', 37.3, 20.5,
      'En la rata es lisa, sin circunvoluciones. Aquí encontrarás las neuronas piramidales del nivel II.',
      'Funciones superiores: percepción, lenguaje, planificación y movimiento voluntario.',
      '+neocorteza|corteza|cortex|isocorteza|corteza del cerebro|cerebro', 30, 7, 2, NULL),
  (1, 'Hipocampo', 56.7, 34.3,
      'En el corte sagital se ve como una banda curva bajo la corteza, en forma de C. También tiene neuronas piramidales.',
      'Formación de nuevas memorias (memoria declarativa) y orientación espacial.',
      'hipocampos|formacion hipocampal|hippocampus', 60, 8, 3, NULL),
  (1, 'Cerebelo', 83.3, 47.0,
      'Sus pliegues se llaman folias; la sustancia blanca interna forma el «árbol de la vida». En su corteza están las células de Purkinje.',
      'Coordinar y ajustar la precisión del movimiento, la postura y el equilibrio.',
      'cerebelos|cerebellum', 92, 26, 4, 'elipse:81.0,47.5,12.0,17.5'),
  (1, 'Tronco encefálico', 76.7, 72.0,
      'Incluye mesencéfalo, puente y bulbo raquídeo; allí están los núcleos de los nervios craneales. Continúa con la médula espinal.',
      'Conecta el encéfalo con la médula espinal y controla funciones vitales como la respiración y la frecuencia cardíaca.',
      '+tronco cerebral|tronco|tallo cerebral|tronco del encefalo|troncoencefalo|tronco encefalico', 80, 90, 5, NULL);
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

-- Actividad demo 3: TIPOS DE NEURONA (mesa de trabajo, 2 niveles: armar → cuadro comparativo)
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (3, 8, 'comparador-tipos-neurona', 'Tipos de neurona',
       'Relaciona la forma de cada tipo de neurona (bipolar, pseudounipolar, multipolar) con su función y su localización: primero arma cada neurona y luego completa el cuadro comparativo.',
       'comparador', 1);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (3, 1, 'En Fonoaudiología interesa especialmente la neurona bipolar coclear y vestibular, relevante en la vía auditiva.', 1),
  (3, 2, 'En TO interesa la motoneurona multipolar del asta ventral (vía final común hacia el músculo), las interneuronas de la médula espinal y la neurona pseudounipolar que trae la información somatosensorial y propioceptiva.', 2);

INSERT OR IGNORE INTO practica_niveles (id, actividad_id, numero, titulo, instrucciones, tipo, activo) VALUES
  (1, 3, 1, 'Armar las neuronas',
      '<strong>1. Arma</strong>: elige una pieza (toca su <strong>?</strong> para ver qué es) y ponla en un <strong>+</strong> alrededor del soma; luego presiona <strong>Revisar</strong>. <strong>2. Marca el sentido</strong>: toca por dónde <strong>entra</strong> y después por dónde <strong>sale</strong> la información.',
      'armar', 1),
  (2, 3, 2, 'Cuadro comparativo',
      'Lee la frase y toca la tarjeta del tipo de neurona que describe. Cada acierto escribe una celda del cuadro comparativo, fila por fila: morfología, función y localización. <strong>Rojo</strong>: esa tarjeta no era; prueba con otra.',
      'elegir', 1);

-- Nivel 1: armar (orden: de lo conocido a lo nuevo). `respuesta` = tipo pedido; reglas en api/practica_check.php
INSERT OR IGNORE INTO practica_items (nivel_id, enunciado, respuesta, sinonimos, pista, explicacion, orden, fila, celda, nota) VALUES
  (1, 'Arma una neurona multipolar.', 'Multipolar', NULL, NULL,
      'Un único axón y múltiples dendritas que nacen de distintos puntos del soma: así integra información de miles de células a la vez.', 1, NULL, NULL,
      'Es la forma de la neurona que identificaste en «Partes de la neurona».'),
  (1, 'Arma una neurona bipolar.', 'Bipolar', NULL, NULL,
      'Dos neuritas que nacen de polos opuestos del soma: una dendrita que recibe y un axón que transmite.', 2, NULL, NULL,
      'Neurita = cualquier prolongación del soma (dendrita o axón) cuando no importa precisar cuál. En la bipolar y la pseudounipolar el tipo se define contando neuritas.'),
  (1, 'Arma una neurona pseudounipolar.', 'Pseudounipolar', NULL, NULL,
      'Una sola neurita que se bifurca en «T»: una rama va hacia la periferia y la otra entra al sistema nervioso central.', 3, NULL, NULL,
      'Se llama «pseudo» (falsa) unipolar: parece tener una sola prolongación, pero esta se divide en dos ramas.');

-- Nivel 2: frases ordenadas por fila del cuadro (morfología → función → localización). {} marca el espacio.
INSERT OR IGNORE INTO practica_items (nivel_id, enunciado, respuesta, sinonimos, pista, explicacion, orden, fila, celda, nota) VALUES
  (2, 'Posee dos neuritas que nacen de polos opuestos del soma: una dendrita y un axón.', 'Bipolar', NULL,
      'Cuenta las neuritas: son exactamente dos.',
      'Su soma suele ser fusiforme (alargado) u ovoide.', 1, 'morfologia',
      '2 neuritas en polos opuestos (1 dendrita + 1 axón); soma fusiforme u ovoide', NULL),
  (2, 'Del soma sale una sola neurita, que luego se bifurca en «T».', 'Pseudounipolar', 'pseudo unipolar|seudounipolar',
      'Es una sola prolongación que después se divide.',
      'Parece unipolar, pero su neurita se divide: una rama va a la periferia y la otra entra al sistema nervioso central.', 2, 'morfologia',
      '1 neurita que se bifurca en T (rama periférica + rama central)', NULL),
  (2, 'Tiene un único axón y múltiples dendritas.', 'Multipolar', NULL,
      'Muchas prolongaciones que reciben y una sola que transmite.',
      'Sus dendritas nacen de distintos puntos del soma y le permiten integrar información de miles de neuronas.', 3, 'morfologia',
      '1 axón + muchas dendritas desde distintos puntos del soma', NULL),
  (2, 'Llevan la información de los sentidos especiales (visión, audición, equilibrio, olfato) hacia el SNC.', 'Bipolar', NULL,
      'Piensa en las neuronas de los órganos de los sentidos de la cabeza.',
      'Son sensitivas especiales y aferentes: la información viaja hacia el sistema nervioso central.', 4, 'funcion',
      'Sensitiva especial · aferente (hacia el SNC)', NULL),
  (2, 'Son las neuronas sensitivas primarias del cuerpo: tacto, dolor, temperatura y propiocepción.', 'Pseudounipolar', NULL,
      'Sensibilidad general de la piel, los músculos y las articulaciones.',
      'Son sensitivas generales y aferentes: llevan la información del cuerpo hacia el SNC.', 5, 'funcion',
      'Sensitiva general (tacto, dolor, temperatura, propiocepción) · aferente', NULL),
  (2, 'Su rama periférica nace en un receptor de la piel y su rama central entra a la médula por la raíz dorsal.', 'Pseudounipolar', NULL,
      'Es sensitiva y su neurita se divide en T.',
      'La señal viaja directo de la rama periférica a la central, sin pasar por el soma.', 6, 'funcion',
      'La señal no pasa por el soma', NULL),
  (2, 'La motoneurona del asta ventral de la médula espinal, que inerva el músculo esquelético, es {}.', 'Multipolar', NULL,
      'Es eferente: lleva la orden desde el SNC al músculo y recibe miles de contactos en sus dendritas.',
      'Su axón sale por la raíz ventral hasta el músculo: es la vía final común del movimiento. La verás en la médula en el práctico Células nerviosas II.', 7, 'funcion',
      'Motora · eferente (del SNC al músculo)', NULL),
  (2, 'Las interneuronas, que conectan neuronas dentro del SNC (neuronas de asociación), suelen ser {}.', 'Multipolar', NULL,
      'Integran información de muchas neuronas a la vez.',
      'Las neuronas de asociación integran la información dentro del SNC, por ejemplo en el arco reflejo.', 8, 'funcion',
      'De asociación (interneuronas) · dentro del SNC', NULL),
  (2, 'Se encuentran en la retina, entre los fotorreceptores y las células ganglionares.', 'Bipolar', NULL,
      'Son neuronas de un sentido especial.',
      'Reciben de los fotorreceptores y transmiten a las células ganglionares. También hay neuronas bipolares en el epitelio olfatorio.', 9, 'localizacion',
      'Retina · epitelio olfatorio', NULL),
  (2, 'Forman los ganglios coclear y vestibular del oído interno.', 'Bipolar', NULL,
      'Audición y equilibrio son sentidos especiales.',
      'Llevan la información auditiva y del equilibrio hacia el tronco encefálico.', 10, 'localizacion',
      'Ganglios coclear y vestibular', NULL),
  (2, 'Se localizan en los ganglios de las raíces dorsales de la médula espinal.', 'Pseudounipolar', NULL,
      'Sus somas, grandes y redondeados, se agrupan en racimos junto a la médula.',
      'Sus cuerpos celulares, grandes y redondeados, se agrupan en esos ganglios.', 11, 'localizacion',
      'Ganglios de la raíz dorsal', NULL),
  (2, 'Se localizan en los ganglios sensitivos de los nervios craneales.', 'Pseudounipolar', NULL,
      'Un ejemplo es el ganglio de Gasser del nervio trigémino.',
      'Por ejemplo, en el ganglio de Gasser del nervio trigémino.', 12, 'localizacion',
      'Ganglios sensitivos craneales (p. ej. trigémino)', NULL),
  (2, 'Son el tipo de neurona más abundante del sistema nervioso.', 'Multipolar', NULL,
      'Es la neurona «típica», con muchas dendritas y un solo axón.',
      'Es el tipo celular más común del sistema nervioso humano.', 13, 'localizacion',
      'El tipo más abundante: encéfalo y médula', NULL),
  (2, 'La neurona piramidal de la corteza cerebral y la célula de Purkinje del cerebelo son ejemplos de neuronas {}.', 'Multipolar', NULL,
      'Recuerda sus grandes árboles dendríticos.',
      'Junto con la motoneurona son tres ejemplos representativos, no los únicos: también son multipolares las células granulares del cerebelo y muchas interneuronas. Las verás reales en la lámina.', 14, 'localizacion',
      'Piramidal (corteza), Purkinje (cerebelo), motoneurona (asta ventral)', NULL);

-- Actividad demo 4: LABELING (escribir el nombre de cada parte sobre la imagen)
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (4, 6, 'labeling-partes-neurona', 'Partes de la neurona · Nivel I: estructura general',
       'Nivel I: estructura general. Escribe de memoria el nombre de cada estructura, compáralo con la respuesta correcta y luego elige su función entre alternativas. Al completar todas, súmala a tu guía.',
       'labeling', 1);
-- Texto vigente (actualiza también BD ya pobladas)
UPDATE actividades SET titulo = 'Partes de la neurona · Nivel I: estructura general', descripcion = 'Nivel I: estructura general. Escribe de memoria el nombre de cada estructura, compáralo con la respuesta correcta y luego elige su función entre alternativas. Al completar todas, súmala a tu guía.' WHERE slug = 'labeling-partes-neurona';
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (4, 'imagen', 'img/neurona-base.jpg', 'Neurona multipolar mielinizada', 1);
INSERT OR IGNORE INTO labeling_parts (actividad_id, nombre, x_pct, y_pct, descripcion, funcion, sinonimos, box_x_pct, box_y_pct, orden, forma) VALUES
  (4, 'Dendritas', 13.0, 18.5,
      'Etapa de recepción. Cuanto más ramificado es el árbol dendrítico, más contactos puede recibir la neurona.',
      'Reciben las señales de otras neuronas y las conducen hacia el cuerpo celular.',
      'dendrita|arbol dendritico|+árbol dendrítico|dendritas', 6, 8, 1, NULL),
  (4, 'Núcleo', 22.5, 40.0,
      'La neurona es postmitótica: no se divide. Por eso una neurona perdida no se reemplaza; el sistema nervioso se adapta por plasticidad.',
      'Contiene el material genético y dirige la síntesis de proteínas de la célula.',
      'nucleo|núcleo celular|nucleo celular', 12, 30, 2, 'elipse:22.5,43.5,3.8,6.0'),
  (4, 'Soma', 19.5, 53.0,
      'También se llama pericarion y además recibe señales. En el SNC los somas se agrupan en núcleos y en el SNP, en ganglios.',
      'Centro metabólico: produce las macromoléculas y contiene la mayoría de los organelos.',
      '+cuerpo celular|pericarion|pericarión|soma neuronal|cuerpo neuronal', 8, 64, 3, 'elipse:23.5,44.0,10.5,15.5'),
  (4, 'Axón', 37.4, 45.1,
      'Etapa de conducción. Hay uno solo por neurona y su longitud va de 1 mm a 1 m.',
      'Conduce el impulso nervioso desde el cuerpo celular hacia los terminales.',
      'axon|fibra nerviosa|cilindroeje', 40, 64, 4, 'corchete:38.5,51.5,81.0,55.5'),
  (4, 'Vaina de mielina', 53.5, 50.6,
      'La forman células gliales (las verás en Células nerviosas II). Gracias a ella el impulso salta entre los nódulos de Ranvier: conducción saltatoria.',
      'Aísla la prolongación y aumenta la velocidad de conducción del impulso.',
      'mielina|vaina mielinica|vaina mielínica|vaina de mielina', 50, 37, 5, 'elipse:53.5,50.6,4.9,3.6'),
  (4, 'Nódulo de Ranvier', 58.9, 51.0,
      'Es el espacio sin mielina entre dos segmentos de la vaina.',
      'Interrupción del aislante donde se regenera el impulso, que salta de una a otra.',
      'nodulo de ranvier|nodo de ranvier|nódulo|nodulo|ranvier|nodulos de ranvier', 62, 38, 6, NULL),
  (4, 'Ramas terminales', 86.6, 50.8,
      'También se llaman telodendrón: es la ramificación final del axón.',
      'Reparten la señal hacia varias células blanco a la vez.',
      'telodendron|telodendrón|arborizacion terminal|arborización terminal|terminal axonico|+terminal axónico|ramas terminales', 80, 66, 7, 'elipse:91.0,46.0,8.8,19.0'),
  (4, 'Botón terminal', 95.2, 32.5,
      'Etapa de transmisión: es el ensanchamiento del extremo de cada rama terminal.',
      'Libera neurotransmisores hacia la siguiente célula.',
      'boton terminal|botones terminales|boton sinaptico|+botón sináptico|terminal presinaptico|terminal presináptico|botones sinapticos|terminal sinaptico|terminal sináptico', 88, 18, 8, NULL);
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
       'Cierre del práctico: 22 preguntas, un pool común y casos de tu carrera (TO o Fono), algunos se responden con tarjetas. Una sola oportunidad por pregunta; cada respuesta muestra una explicación.',
       'quiz', 1);
INSERT OR IGNORE INTO quices (actividad_id, titulo, datos_json, activo) VALUES
  (6, 'Células nerviosas I', '[{"id": "n01", "carrera": "comun", "pregunta": "¿Qué función cumple principalmente el soma de la neurona?", "opciones": ["Sintetiza proteínas y sostiene el metabolismo celular", "Genera el potencial de acción que viaja por el axón", "Libera el neurotransmisor hacia la neurona siguiente", "Aísla eléctricamente el axón para conducir más rápido"], "correcta": 0, "feedback": "El soma es el centro metabólico: sus cuerpos de Nissl (RER) reflejan la alta síntesis de proteínas."}, {"id": "n02", "carrera": "comun", "pregunta": "Los cuerpos de Nissl, que tiñen de violeta el soma con cresil violeta, son acúmulos de:", "opciones": ["Retículo endoplásmico rugoso y ribosomas libres", "Mitocondrias que aportan energía a la sinapsis", "Vesículas con neurotransmisor listas para salir", "Neurofilamentos que sostienen el citoesqueleto"], "correcta": 0, "feedback": "Son RER y polirribosomas: reflejan la gran síntesis de proteínas del soma. Por eso el cresil violeta (tinción de Nissl) marca todos los somas."}, {"id": "n03", "carrera": "comun", "pregunta": "¿Para qué sirven las espinas dendríticas?", "opciones": ["Aumentan la superficie para recibir sinapsis", "Aumentan la velocidad de conducción del impulso", "Almacenan neurotransmisor para liberarlo después", "Fijan la neurona a las células gliales vecinas"], "correcta": 0, "feedback": "Las espinas multiplican los puntos de contacto con otras neuronas."}, {"id": "n04", "carrera": "comun", "pregunta": "¿Dónde se inicia normalmente el potencial de acción?", "opciones": ["En el segmento inicial del axón (cono axónico)", "En las dendritas, donde llega la información", "En el botón terminal, junto a la sinapsis", "En el núcleo, que controla la actividad celular"], "correcta": 0, "feedback": "El cono axónico integra las señales y ahí se dispara el impulso."}, {"id": "n05", "carrera": "comun", "pregunta": "¿Cuál es el recorrido de la información dentro de una neurona multipolar?", "opciones": ["Dendritas → soma → cono axónico → axón → botón terminal", "Axón → cono axónico → soma → dendritas → botón terminal", "Botón terminal → axón → soma → cono axónico → dendritas", "Soma → dendritas → axón → cono axónico → botón terminal"], "correcta": 0, "feedback": "Recepción (dendritas y soma) → integración (cono axónico) → conducción (axón) → transmisión (botón terminal). Es la flecha que dibujaste en Tipos de neurona."}, {"id": "n06", "carrera": "comun", "pregunta": "El transporte axonal anterógrado y el retrógrado se diferencian en que:", "opciones": ["El anterógrado va del soma al terminal y el retrógrado vuelve al soma", "El anterógrado es eléctrico y el retrógrado mueve solo proteínas", "El anterógrado ocurre en dendritas y el retrógrado en el axón", "El anterógrado usa actina y el retrógrado usa neurofilamentos"], "correcta": 0, "feedback": "Ambos viajan por microtúbulos. Anterógrado (kinesina): del soma al terminal, p. ej. vesículas sinápticas. Retrógrado (dineína): del terminal al soma, p. ej. factores tróficos y material para reciclar."}, {"id": "n07", "carrera": "comun", "pregunta": "¿Qué combinación hace que un axón conduzca el impulso más rápido?", "opciones": ["Mayor diámetro y vaina de mielina con nódulos de Ranvier", "Menor diámetro y vaina de mielina continua sin nódulos", "Mayor diámetro y ausencia de mielina en todo su largo", "Menor diámetro y muchas ramas colaterales a lo largo"], "correcta": 0, "feedback": "A mayor diámetro, menor resistencia; la mielina aísla y el impulso salta de nódulo en nódulo (conducción saltatoria)."}, {"id": "n08", "carrera": "comun", "pregunta": "¿Cómo se llaman las agrupaciones de somas neuronales?", "opciones": ["Núcleos en el SNC y ganglios en el SNP", "Ganglios en el SNC y núcleos en el SNP", "Tractos en el SNC y nervios en el SNP", "Nervios en el SNC y tractos en el SNP"], "correcta": 0, "feedback": "Somas agrupados: núcleos (SNC) y ganglios (SNP). Axones agrupados: tractos (SNC) y nervios (SNP)."}, {"id": "n09", "carrera": "comun", "pregunta": "¿Qué diferencia a una neurona aferente de una eferente?", "opciones": ["La aferente lleva información hacia el SNC; la eferente, desde el SNC", "La aferente lleva información desde el SNC; la eferente, hacia el SNC", "La aferente siempre es multipolar; la eferente siempre es bipolar", "La aferente siempre tiene mielina; la eferente nunca la tiene"], "correcta": 0, "feedback": "Aferente = llega al SNC (sensitiva). Eferente = sale del SNC (motora). Es una clasificación por función, no por forma."}, {"id": "n10", "carrera": "comun", "pregunta": "¿Por qué una lesión de neuronas en el SNC suele dejar secuelas permanentes?", "opciones": ["Porque las neuronas maduras no se dividen y casi no se reemplazan", "Porque las neuronas maduras no tienen mielina que las proteja", "Porque la glía del SNC impide que la sangre llegue a la lesión", "Porque las neuronas maduras se dividen sin control tras el daño"], "correcta": 0, "feedback": "La neurona es postmitótica: el SN se adapta por plasticidad, no por reemplazo."}, {"id": "k1", "carrera": "comun", "pregunta": "Una persona con neuropatía diabética pierde la sensibilidad al tacto y a la temperatura en los pies. ¿Qué tipo de neurona está dañada?", "opciones": ["Bipolar", "Pseudounipolar", "Multipolar"], "tarjetas": true, "correcta": 1, "feedback": "La sensibilidad general del cuerpo la llevan neuronas pseudounipolares: su rama periférica nace en la piel y su soma está en el ganglio de la raíz dorsal."}, {"id": "k2", "carrera": "comun", "pregunta": "Reflejo rotuliano: ¿qué tipo de neurona lleva la señal desde el huso muscular del cuádriceps hasta la médula?", "opciones": ["Bipolar", "Pseudounipolar", "Multipolar"], "tarjetas": true, "correcta": 1, "feedback": "Es la neurona sensitiva (aferente) del reflejo: pseudounipolar, con su soma en el ganglio de la raíz dorsal."}, {"id": "k3", "carrera": "comun", "pregunta": "Reflejo rotuliano: ¿qué tipo de neurona ordena la contracción del cuádriceps?", "opciones": ["Bipolar", "Pseudounipolar", "Multipolar"], "tarjetas": true, "correcta": 2, "feedback": "La motoneurona del asta ventral es multipolar y eferente: recibe miles de contactos en sus dendritas y su axón llega al músculo."}, {"id": "k4", "carrera": "comun", "pregunta": "Tras un golpe en la cabeza, una persona pierde el olfato porque se cortan los axones que vienen del epitelio olfatorio. ¿De qué tipo son esas neuronas?", "opciones": ["Bipolar", "Pseudounipolar", "Multipolar"], "tarjetas": true, "correcta": 0, "feedback": "Las neuronas del epitelio olfatorio son bipolares, típicas de los sentidos especiales; sus axones llegan al bulbo olfatorio."}, {"id": "t1", "carrera": "terapia-ocupacional", "pregunta": "Después de un ACV en la corteza motora, una persona tiene debilidad del brazo del lado opuesto. ¿Qué neuronas se dañaron?", "opciones": ["Piramidal", "Purkinje", "Motoneurona"], "tarjetas": true, "correcta": 0, "feedback": "Las neuronas piramidales de la corteza motora forman el tracto corticoespinal (motoneurona superior); por eso la lesión afecta el lado opuesto del cuerpo."}, {"id": "t2", "carrera": "terapia-ocupacional", "pregunta": "En la esclerosis lateral amiotrófica (ELA) degeneran las neuronas del asta ventral de la médula. ¿Cuáles son?", "opciones": ["Piramidal", "Purkinje", "Motoneurona"], "tarjetas": true, "correcta": 2, "feedback": "Son las motoneuronas inferiores, la vía final común: si se pierden, el músculo se debilita y se atrofia aunque la corteza funcione."}, {"id": "t3", "carrera": "terapia-ocupacional", "pregunta": "Una persona tiene marcha inestable y movimientos imprecisos al alcanzar objetos (dismetría) por una lesión cerebelosa. ¿Qué neuronas, única salida de la corteza del cerebelo, se afectan?", "opciones": ["Piramidal", "Purkinje", "Motoneurona"], "tarjetas": true, "correcta": 1, "feedback": "Las células de Purkinje integran la información del cerebelo y ajustan la precisión del movimiento; su daño produce ataxia y dismetría."}, {"id": "t4", "carrera": "terapia-ocupacional", "pregunta": "Por una lesión de la raíz dorsal, una persona no sabe la posición de sus dedos y le cuesta abotonarse sin mirar. ¿Qué tipo de neurona lleva esa información propioceptiva?", "opciones": ["Bipolar", "Pseudounipolar", "Multipolar"], "tarjetas": true, "correcta": 1, "feedback": "La propiocepción la llevan neuronas pseudounipolares cuyo soma está en el ganglio de la raíz dorsal; sin ella, la persona depende de la vista para guiar la mano."}, {"id": "f1", "carrera": "fonoaudiologia", "pregunta": "Una persona tiene hipoacusia neurosensorial por daño del ganglio coclear (espiral). ¿Qué tipo de neurona forma ese ganglio?", "opciones": ["Bipolar", "Pseudounipolar", "Multipolar"], "tarjetas": true, "correcta": 0, "feedback": "Las neuronas del ganglio coclear son bipolares: reciben de las células ciliadas y llevan la información auditiva al tronco encefálico."}, {"id": "f2", "carrera": "fonoaudiologia", "pregunta": "Tras un ACV en el lóbulo frontal izquierdo, una persona entiende pero le cuesta producir el lenguaje (afasia de Broca). ¿Qué neuronas de la corteza se dañaron?", "opciones": ["Piramidal", "Purkinje", "Motoneurona"], "tarjetas": true, "correcta": 0, "feedback": "El área de Broca es corteza cerebral: sus neuronas de proyección son piramidales."}, {"id": "f3", "carrera": "fonoaudiologia", "pregunta": "Una lesión cerebelosa produce habla lenta, escandida y mal coordinada (disartria atáxica). ¿Qué neuronas ajustan la coordinación de los movimientos del habla?", "opciones": ["Piramidal", "Purkinje", "Motoneurona"], "tarjetas": true, "correcta": 1, "feedback": "Las células de Purkinje son la salida de la corteza cerebelosa y coordinan la precisión de los movimientos, también los articulatorios."}, {"id": "f4", "carrera": "fonoaudiologia", "pregunta": "Por daño del núcleo del nervio hipogloso en el tronco encefálico, la lengua se debilita y se atrofia. ¿Qué neuronas se perdieron?", "opciones": ["Piramidal", "Purkinje", "Motoneurona"], "tarjetas": true, "correcta": 2, "feedback": "El núcleo del hipogloso tiene motoneuronas (multipolares, eferentes) que inervan los músculos de la lengua: su pérdida produce debilidad y atrofia."}]', 1);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (6, 2, 'Responde solo/a, sin apuntes. Al terminar revisa el resumen: las preguntas falladas son las que conviene repasar antes de Células II.', 1);

-- Actividad 7: LABELING nivel II (organelos y especializaciones). Imagen img/neurona-base.jpg (1536×1024), la misma de los niveles I y III
-- (img/_fuentes/base-espinas.png).
-- Ajustar coordenadas con actividad.php?slug=labeling-neurona-nivel-2&calibrar=1
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (7, 6, 'labeling-neurona-nivel-2', 'Partes de la neurona · Nivel II: organelos y especializaciones',
       'Nivel II: organelos y especializaciones. Escribe de memoria el nombre de cada estructura, compáralo con la respuesta correcta y elige su función. Se desbloquea al completar el nivel I.', 'labeling', 1);
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (7, 'imagen', 'img/neurona-base.jpg', 'Neurona: organelos y especializaciones', 1);
INSERT OR IGNORE INTO labeling_parts (actividad_id, nombre, x_pct, y_pct, descripcion, funcion, sinonimos, box_x_pct, box_y_pct, orden, forma) VALUES
  (7, 'Cuerpos de Nissl', 17.1, 43.5,
      'Acúmulos de retículo endoplásmico rugoso y polirribosomas. Dan el aspecto basófilo al soma y reflejan su alta síntesis proteica; no entran al axón.',
      'Fabrican en gran cantidad las proteínas que la neurona necesita.',
      'sustancia de nissl|grumos de nissl|nissl|retículo endoplásmico rugoso|reticulo endoplasmico rugoso|rer', 10, 36, 1, NULL),
  (7, 'Aparato de Golgi', 24.7, 36.1,
      'Trabaja junto a los cuerpos de Nissl: recibe lo que ellos fabrican y lo envía hacia las dendritas y el axón.',
      'Modifica, empaqueta y distribuye las proteínas en vesículas.',
      'golgi|+complejo de golgi', 22, 8, 2, NULL),
  (7, 'Mitocondria', 30.6, 40.0,
      'Abundan en el soma, a lo largo del axón y en los terminales, donde la demanda de energía es mayor.',
      'Produce el ATP que la neurona necesita, sobre todo para mantener sus gradientes iónicos.',
      'mitocondrias', 41, 30, 3, NULL),
  (7, 'Segmento inicial del axón', 37.8, 45.4,
      'Es el tramo sin mielina donde el soma se estrecha (cono axónico o montículo axonal) y nace el axón.',
      'Zona gatillo: integra las señales recibidas y, gracias a su alta densidad de canales de sodio, allí se dispara el potencial de acción.',
      'segmento inicial|+zona gatillo|cono axonico|+cono axónico|monticulo axonal|montículo axonal|cono de implantacion', 43, 54, 4, NULL),
  (7, 'Colateral axónica', 60.6, 61.8,
      'Un axón puede formar muchas colaterales (hasta 200 o más) y comunicarse así con varios blancos a la vez.',
      'Rama lateral del axón que lleva la misma señal hacia otra célula.',
      'colateral|rama colateral|colaterales', 53, 58.5, 5, 'corchete:58.3,55.0,62.8,68.5'),
  (7, 'Cono de crecimiento', 67.2, 71.0,
      'Extremo ensanchado del axón en crecimiento, con prolongaciones finas (filopodios) que exploran el entorno. Dirige el crecimiento durante el desarrollo y la regeneración; su citoesqueleto lo verás en el nivel III.',
      'Extremo móvil de un axón en crecimiento que explora el entorno y guía su avance.',
      'cono de crecimiento axonal', 66, 88, 6, 'elipse:67.2,72.0,4.2,6.8');
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (7, 2, 'Cuando un axón periférico se lesiona (por ejemplo, en una lesión de nervio de la mano), los cuerpos de Nissl se dispersan (cromatólisis) y el extremo del axón forma un nuevo cono de crecimiento para volver a crecer: por eso la recuperación funcional toma semanas a meses.', 1),
  (7, 1, 'En una lesión del nervio facial o hipogloso, la neurona muestra cromatólisis mientras intenta regenerar su axón, que avanza guiado por su cono de crecimiento.', 2);

-- Actividad 8: LABELING nivel III (citoesqueleto y transporte). Imagen img/neurona-nivel3-zoom.jpg (1536×1024):
-- cuatro ampliaciones (A espina dendrítica, B axón, C cono de crecimiento, D botón terminal) + miniatura de la neurona base.
INSERT OR IGNORE INTO actividades (id, topic_id, slug, titulo, descripcion, tipo, activo) VALUES
  (8, 6, 'labeling-neurona-nivel-3', 'Partes de la neurona · Nivel III: citoesqueleto y transporte',
       'Nivel III: citoesqueleto y transporte. Los círculos A, B, C y D son ampliaciones de los lugares marcados en la neurona de abajo. Reconoce cada estructura y su función. Se desbloquea al completar el nivel II.', 'labeling', 1);
INSERT OR IGNORE INTO actividad_recursos (actividad_id, tipo, url, caption, orden) VALUES
  (8, 'imagen', 'img/neurona-nivel3-zoom.jpg', 'Ampliaciones: espina dendrítica (A), interior del axón (B), cono de crecimiento (C) y botón terminal (D)', 1);
INSERT OR IGNORE INTO labeling_parts (actividad_id, nombre, x_pct, y_pct, descripcion, funcion, sinonimos, box_x_pct, box_y_pct, orden, forma) VALUES
  (8, 'Espinas dendríticas', 12.8, 11.7,
      'Protrusiones de la dendrita que reciben la mayoría de las sinapsis excitatorias. A diferencia del tronco de la dendrita (sostenido por microtúbulos), las espinas se sostienen con actina: por eso cambian de forma y número con la experiencia (plasticidad), la base celular del aprendizaje.',
      'Pequeñas protrusiones que aumentan la superficie de contacto sináptico y cambian con el aprendizaje.',
      'espina dendritica|espinas|espina', 13, 2.5, 1, NULL),
  (8, 'Microtúbulos', 38.7, 26.5,
      'Polímeros de tubulina orientados a lo largo del axón. Las proteínas motoras caminan sobre ellos gastando ATP.',
      'Forman los rieles por los que se mueve el transporte axonal.',
      'microtubulo|microtúbulo|tubulina', 41.5, 2.5, 2, NULL),
  (8, 'Neurofilamentos', 36.2, 17.9,
      'Filamentos intermedios propios de la neurona. A mayor calibre, mayor velocidad de conducción. Su cadena ligera (NfL) en sangre es marcador de daño axonal (EM, ELA).',
      'Dan soporte estructural y determinan el calibre (diámetro) del axón.',
      'neurofilamento|filamentos intermedios', 32.5, 2.5, 3, NULL),
  (8, 'Proteínas motoras', 30.3, 23.7,
      'Kinesina: transporte anterógrado (del soma al terminal: vesículas, mitocondrias, proteínas nuevas). Dineína: transporte retrógrado (del terminal al soma: membranas para reciclar, material endocitado, factores tróficos). Ambas caminan sobre los microtúbulos gastando ATP.',
      'Transportan carga a lo largo del axón caminando sobre los microtúbulos, en ambos sentidos.',
      '+kinesina|+dineína|kinesina y dineina|motores moleculares|proteinas motoras', 37, 2.5, 4, 'puntos:43.8,21.4'),
  (8, 'Filamentos de actina', 58.4, 23.7,
      'Polímeros de actina, los filamentos más delgados del citoesqueleto (microfilamentos). Se concentran en el cono de crecimiento (filopodios y lamelipodio) y en las espinas dendríticas; su armado y desarmado rápido permite que el axón avance y que las espinas cambien con la plasticidad.',
      'Forman los filopodios del cono de crecimiento y sostienen las espinas dendríticas: permiten cambios rápidos de forma.',
      'actina|filamento de actina|+microfilamentos|microfilamento|f-actina', 50, 2.5, 5, 'puntos:13.0,15.9'),
  (8, 'Vesículas sinápticas', 84.9, 21.1,
      'Están en el botón terminal y liberan su contenido por exocitosis cuando llega el impulso (lo verás en detalle en Sinapsis).',
      'Almacenan el neurotransmisor hasta que llega el potencial de acción.',
      'vesiculas|vesícula sináptica|vesiculas sinapticas', 85, 2.5, 6, NULL);
INSERT OR IGNORE INTO actividad_carrera (actividad_id, carrera_id, descripcion, orden) VALUES
  (8, 2, 'El transporte axonal depende del citoesqueleto: en los axones más largos (como los que llegan a los pies y las manos) falla primero, y por eso las neuropatías periféricas empiezan con hormigueo y torpeza distal.', 1),
  (8, 1, 'Las espinas dendríticas y su actina cambian con la práctica: es la base celular del aprendizaje, por ejemplo al adquirir o rehabilitar habilidades del habla.', 2);
