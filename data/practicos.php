<?php
/**
 * NeuroLab — data/practicos.php
 * Rutas de práctico (practico.php?p=<clave>) y su guía de estudio (guia.php?p=<clave>).
 * Cada paso enlaza una actividad y declara qué secciones de "Mi guía" desbloquea:
 *   'guia' => [ '<clave de sección>' => 'Nombre de la sección' ]
 *   'conexion' => [ '<clave de sección>' => ['terapia-ocupacional' => '…', 'fonoaudiologia' => '…'] | null ]
 *       «¿Para qué te sirve?» propio de ese nivel (null = el nivel no lo muestra). Si un nivel no
 *       está aquí, se usa el texto de la actividad (panel admin).
 * Claves: slug de la actividad (identificación, quiz) o slug:número de nivel (práctica por niveles).
 * Editar aquí no requiere migrate.php ni seed.php: basta subir este archivo.
 */
return [
    'celulas-1' => [
        'titulo'     => 'Células nerviosas I: la neurona',
        'asignatura' => 'ETMP097 Neurobiología',
        'objetivo'   => 'Relacionar la morfología de la neurona con su función y su localización en el sistema nervioso.',
        'intro'      => 'Avanza a tu ritmo, en orden. Cada actividad se corrige sola: cuando la completes, súmala a tu guía de estudio. Al final descarga tu guía en PDF con todo lo que trabajaste.',
        'pasos' => [
            ['slug' => 'labeling-partes-neurona',
             'titulo' => 'Partes de la neurona (3 niveles)',
             'tarea' => 'De lo general a lo fino: estructura general, organelos y citoesqueleto. En cada número escribe de memoria el nombre y luego elige su función. Cada nivel desbloquea el siguiente y suma una sección a tu guía.',
             'guia' => ['labeling-partes-neurona'  => 'Nivel I: estructura general',
                        'labeling-neurona-nivel-2' => 'Nivel II: organelos y especializaciones',
                        'labeling-neurona-nivel-3' => 'Nivel III: citoesqueleto y transporte']],
            ['slug' => 'comparador-tipos-neurona',
             'titulo' => 'Tipos de neurona (2 niveles)',
             'tarea' => 'Primero arma cada tipo de neurona y marca el sentido de la información; luego lee frases y toca la tarjeta del tipo que describen, completando el cuadro comparativo fila por fila. Cada nivel suma una sección a tu guía.',
             'guia' => ['comparador-tipos-neurona:1' => 'Nivel I: dibujos de los tipos de neurona',
                        'comparador-tipos-neurona:2' => 'Nivel II: cuadro comparativo'],
             'conexion' => [
                'comparador-tipos-neurona:1' => [
                    'terapia-ocupacional' => 'Si sabes por dónde entra y sale la información, puedes razonar una lesión: un nervio periférico dañado interrumpe la salida motora (axón de la motoneurona) y la entrada sensitiva (rama periférica de la pseudounipolar); por eso fuerza y sensibilidad se evalúan por separado.',
                    'fonoaudiologia' => 'La audición entra por neuronas bipolares del ganglio espiral: su rama periférica recibe de las células ciliadas y la central lleva la señal al tronco encefálico. Un daño en la cóclea o en el nervio interrumpe esa vía de entrada (hipoacusia neurosensorial).'],
                'comparador-tipos-neurona:2' => [
                    'terapia-ocupacional' => 'La forma y la ubicación orientan la evaluación: pseudounipolares en el ganglio de la raíz dorsal (sensibilidad y propiocepción), multipolares en el asta ventral (fuerza) y en la corteza (control voluntario). Según dónde esté la lesión, sabrás qué función revisar.',
                    'fonoaudiologia' => 'Las bipolares están en vías sensoriales especiales (audición, equilibrio, olfato) y las multipolares en los núcleos motores de los nervios craneales que mueven labios, lengua y laringe: el tipo y el lugar orientan qué evaluar en habla, voz y deglución.'],
             ]],
            ['slug' => 'lamina-neurona-piramidal',
             'titulo' => 'Lámina: neuronas reales (3 niveles)',
             'tarea' => 'Corte sagital de cerebro de rata. Oriéntate en el corte; luego encuentra, captura, recorta y etiqueta una neurona piramidal y una célula de Purkinje (Golgi), y compara el cerebelo con Golgi y con cresil violeta. Cada nivel suma una sección a tu guía.',
             'guia' => ['lamina-neurona-piramidal:1' => 'Nivel I: orientación en el corte',
                        'lamina-neurona-piramidal:2' => 'Nivel II: piramidal y Purkinje con Golgi',
                        'lamina-neurona-piramidal:3' => 'Nivel III: cerebelo con Golgi y cresil violeta'],
             'conexion' => [
                'lamina-neurona-piramidal:1' => null,
                'lamina-neurona-piramidal:2' => [
                    'terapia-ocupacional' => 'Las piramidales de la corteza motora inician el movimiento voluntario (tracto corticoespinal) y las células de Purkinje lo coordinan y ajustan: su lesión produce cuadros distintos (debilidad y espasticidad o ataxia y dismetría) que alteran de forma distinta las actividades de la vida diaria.',
                    'fonoaudiologia' => 'Las piramidales de las áreas del lenguaje (Broca) y de la corteza motora orofacial programan el habla; las células de Purkinje coordinan la articulación. Su daño explica cuadros distintos: afasia o disartria espástica frente a disartria atáxica.'],
                'lamina-neurona-piramidal:3' => [
                    'terapia-ocupacional' => 'Con cresil se cuantifica la pérdida de neuronas (p. ej. motoneuronas en la ELA o células de Purkinje en las ataxias) y con Golgi se estudian los cambios de dendritas y espinas con la estimulación: es la evidencia celular de la plasticidad que buscas con la rehabilitación.',
                    'fonoaudiologia' => 'Con cresil se documenta la pérdida neuronal tras un ACV o en enfermedades degenerativas y con Golgi los cambios de dendritas y espinas con el entrenamiento: es la evidencia celular de la plasticidad que apoya la terapia del habla y el lenguaje.'],
             ]],
            ['slug' => 'quiz-celulas-nerviosas-1',
             'titulo' => 'Quiz de cierre',
             'tarea' => '18 preguntas, de lo general a los casos clínicos de tu carrera (elige TO o Fono arriba). Tu resultado y las explicaciones quedan en tu guía.',
             'guia' => ['quiz-celulas-nerviosas-1' => 'Quiz de cierre']],
        ],
    ],
    'celulas-2' => [
        'titulo'     => 'Células nerviosas II: la glía',
        'asignatura' => 'ETMP097 Neurobiología',
        'objetivo'   => 'Describir la morfología y la función de la glía del SNC y del SNP, reconocerla en esquemas y en cortes reales, y relacionar su falla con la clínica.',
        'intro'      => 'Avanza a tu ritmo, en orden. Cada actividad se corrige sola: cuando completes un nivel, se suma a tu guía de estudio. Al final descarga tu guía con todo lo que trabajaste.',
        'pasos' => [
            ['slug' => 'glia-conoce',
             'titulo' => 'Conoce la glía (4 niveles)',
             'tarea' => 'Identifica las células gliales del SNC en un esquema y luego en su tejido (vasos, sustancia gris y blanca, ventrículo), identifica las del SNP y al final arma el cuadro de las seis: dónde está cada una, qué hace y qué pasa si falla. Cada nivel suma una sección a tu guía.',
             'guia' => ['glia-conoce:1' => 'Nivel I: glía del SNC',
                        'glia-conoce:2' => 'Nivel II: la glía en su tejido',
                        'glia-conoce:3' => 'Nivel III: glía del SNP',
                        'glia-conoce:4' => 'Nivel IV: cada célula en su lugar'],
             'conexion' => [
                'glia-conoce:1' => [
                    'terapia-ocupacional' => 'La glía explica síntomas que verás en la práctica: la fatiga y la lentitud de la esclerosis múltiple (oligodendrocitos) o la cicatriz tras un ACV o un traumatismo (astrocitos), que hace que la recuperación dependa de la plasticidad y no de la regeneración.',
                    'fonoaudiologia' => 'Cuando se pierde la mielina de la vía auditiva central o de las vías motoras del habla, la señal se enlentece: cuesta comprender el habla rápida y se altera la coordinación de la articulación.'],
                'glia-conoce:2' => [
                    'terapia-ocupacional' => 'Cada glía trabaja en un lugar: en la sustancia gris cuida las sinapsis donde ocurre el aprendizaje motor; en la blanca sostiene la conducción rápida entre regiones. Por eso una lesión de sustancia blanca (EM, ACV subcortical) enlentece el movimiento y la respuesta aunque las neuronas sigan vivas.',
                    'fonoaudiologia' => 'Las vías del lenguaje (como el fascículo arqueado, entre las áreas de Broca y Wernicke) son sustancia blanca: si su mielina se daña, la persona puede comprender y producir palabras, pero repetir o procesar habla rápida se vuelve difícil.'],
                'glia-conoce:3' => [
                    'terapia-ocupacional' => 'Guillain-Barré (células de Schwann) y la esclerosis múltiple (oligodendrocitos) pueden dar una debilidad parecida, pero con pronóstico distinto: en el SNP la mielina y el axón pueden regenerar, y la rehabilitación apunta a recuperar funciones.',
                    'fonoaudiologia' => 'En Guillain-Barré puede haber debilidad facial y bulbar (voz débil, disfagia). Como el SNP regenera, la intervención acompaña una recuperación que suele tomar semanas a meses.'],
                'glia-conoce:4' => null,
             ]],
            ['slug' => 'glia-tejido',
             'titulo' => 'La glía en el tejido (4 niveles)',
             'tarea' => 'Encuentra la glía en cortes reales: el canal central y la sustancia blanca de la médula con H&E, la motoneurona y su glía con cresil violeta, las células satélite y las envolturas en el ganglio y el nervio periférico, y al final reconoce cada glía por el anticuerpo que la marca en imágenes de inmunofluorescencia. Cada nivel suma una sección a tu guía.',
             'guia' => ['glia-tejido:1' => 'Nivel I: canal central y sustancia blanca',
                        'glia-tejido:2' => 'Nivel II: motoneurona y su glía',
                        'glia-tejido:3' => 'Nivel III: ganglio y nervio periférico',
                        'glia-tejido:4' => 'Nivel IV: glía con anticuerpos'],
             'conexion' => [
                'glia-tejido:1' => [
                    'terapia-ocupacional' => 'Si el LCR no circula bien (hidrocefalia), sube la presión dentro del cráneo y pueden aparecer alteraciones de la marcha, la atención y el control de esfínteres que afectan el desempeño diario.',
                    'fonoaudiologia' => 'En la hidrocefalia infantil, la presión del LCR daña la sustancia blanca que rodea los ventrículos: puede retrasar el desarrollo del lenguaje y afectar la atención y el procesamiento auditivo.'],
                'glia-tejido:2' => [
                    'terapia-ocupacional' => 'En la ELA mueren las motoneuronas del asta ventral y la glía vecina participa (excitotoxicidad, inflamación): la debilidad avanza y la intervención adapta actividades y entorno para mantener la autonomía.',
                    'fonoaudiologia' => 'En la ELA de inicio bulbar mueren las motoneuronas del tronco que mueven lengua, labios y laringe: aparecen disartria y disfagia progresivas, y la intervención apoya la comunicación (incluso con sistemas alternativos) y una deglución segura.'],
                'glia-tejido:3' => [
                    'terapia-ocupacional' => 'El dolor neuropático (tras un herpes zóster o en la neuropatía diabética) limita el uso de la mano y altera el sueño; y tras una lesión de nervio el axón vuelve a crecer guiado por las células de Schwann, cerca de 1 mm al día, mientras se protege la piel insensible y se reeduca la sensibilidad.',
                    'fonoaudiologia' => 'En la neuralgia del trigémino (ganglio de Gasser) el dolor aparece al hablar o masticar; y tras una lesión del nervio facial o del laríngeo recurrente, el axón puede volver a crecer guiado por las células de Schwann mientras la terapia mantiene la musculatura.'],
                'glia-tejido:4' => [
                    'terapia-ocupacional' => 'Los mismos marcadores se usan en investigación y diagnóstico: GFAP sube en la sangre tras un traumatismo encefálico y los astrocitos GFAP+ rodean las placas en el Alzheimer; entender qué marca cada uno te permite leer la evidencia detrás de la rehabilitación.',
                    'fonoaudiologia' => 'Con estos marcadores se estudia la vía auditiva: S100 y MBP muestran la mielina de Schwann del nervio coclear y su paso a mielina de oligodendrocito cerca del tronco, la zona donde nacen los schwannomas vestibulares.'],
             ]],
            ['slug' => 'quiz-celulas-nerviosas-2',
             'titulo' => 'Quiz de cierre',
             'tarea' => '15 preguntas, de lo general a los casos clínicos de tu carrera (elige TO o Fono arriba). Tu resultado y las explicaciones quedan en tu guía.',
             'guia' => ['quiz-celulas-nerviosas-2' => 'Quiz de cierre']],
        ],
    ],
];
