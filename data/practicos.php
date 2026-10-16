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
        'titulo'     => 'Células nerviosas II: circuitos y glía',
        'asignatura' => 'ETMP097 Neurobiología',
        'objetivo'   => 'Relacionar la organización de la médula espinal con el circuito reflejo y describir la morfología y la función de la glía del SNC y del SNP en cortes reales.',
        'intro'      => 'Avanza a tu ritmo, en orden. Cada actividad se corrige sola: cuando completes un nivel, se suma a tu guía de estudio. Al final descarga tu guía con todo lo que trabajaste.',
        'pasos' => [
            ['slug' => 'circuito-reflejo',
             'titulo' => 'Circuito reflejo (2 niveles)',
             'tarea' => 'Oriéntate en un corte de médula con su ganglio: captúralo y etiqueta sus partes. Luego arma sobre tu captura el circuito reflejo y marca por dónde viaja la información. Cada nivel suma una sección a tu guía.',
             'guia' => ['circuito-reflejo:1' => 'Nivel I: orientación en la médula',
                        'circuito-reflejo:2' => 'Nivel II: el circuito reflejo'],
             'conexion' => [
                'circuito-reflejo:1' => [
                    'terapia-ocupacional' => 'Saber dónde están las astas y las raíces permite entender por qué una lesión medular afecta la fuerza y la sensibilidad por segmentos: el nivel de la lesión anticipa qué funciones y qué actividades se verán comprometidas.',
                    'fonoaudiologia' => 'La misma organización (núcleos sensitivos que reciben y núcleos motores que envían) se repite en el tronco encefálico, donde están los núcleos de los nervios craneales que controlan el habla, la voz y la deglución.'],
                'circuito-reflejo:2' => [
                    'terapia-ocupacional' => 'Los reflejos osteotendíneos (rotuliano, bicipital, aquíleo) evalúan el circuito: disminuidos indican falla en el arco (nervio, raíz o motoneurona); exaltados, falla del control que baja desde el encéfalo, como tras un ACV.',
                    'fonoaudiologia' => 'Los reflejos orofaríngeos (nauseoso, deglutorio, tusígeno) siguen la misma lógica: vía sensitiva, centro en el tronco encefálico y vía motora. Evaluarlos en la disfagia orienta qué tramo del circuito está fallando.'],
             ]],
            ['slug' => 'glia-snc',
             'titulo' => 'Glía del SNC (3 niveles)',
             'tarea' => 'Primero reconoce cada célula glial del SNC por su función; luego encuéntrala en cortes reales de médula: el canal central y la sustancia blanca con H&E, y la motoneurona con su glía con cresil violeta. Cada nivel suma una sección a tu guía.',
             'guia' => ['glia-snc:1' => 'Nivel I: cada célula, su función',
                        'glia-snc:2' => 'Nivel II: canal central y sustancia blanca',
                        'glia-snc:3' => 'Nivel III: motoneurona y su glía'],
             'conexion' => [
                'glia-snc:1' => [
                    'terapia-ocupacional' => 'La glía explica síntomas que verás en la práctica: la fatiga y la lentitud de la esclerosis múltiple (oligodendrocitos) o la cicatriz tras un ACV o un traumatismo (astrocitos), que hace que la recuperación dependa de la plasticidad y no de la regeneración.',
                    'fonoaudiologia' => 'Cuando se pierde la mielina de la vía auditiva central o de las vías motoras del habla, la señal se enlentece: cuesta comprender el habla rápida y se altera la coordinación de la articulación.'],
                'glia-snc:2' => [
                    'terapia-ocupacional' => 'Si el LCR no circula bien (hidrocefalia), sube la presión dentro del cráneo y pueden aparecer alteraciones de la marcha, la atención y el control de esfínteres que afectan el desempeño diario.',
                    'fonoaudiologia' => 'En la hidrocefalia infantil, la presión del LCR daña la sustancia blanca que rodea los ventrículos: puede retrasar el desarrollo del lenguaje y afectar la atención y el procesamiento auditivo.'],
                'glia-snc:3' => [
                    'terapia-ocupacional' => 'En la ELA mueren las motoneuronas del asta ventral y la glía vecina participa (excitotoxicidad, inflamación): la debilidad avanza y la intervención adapta actividades y entorno para mantener la autonomía.',
                    'fonoaudiologia' => 'En la ELA de inicio bulbar mueren las motoneuronas del tronco que mueven lengua, labios y laringe: aparecen disartria y disfagia progresivas, y la intervención apoya la comunicación (incluso con sistemas alternativos) y una deglución segura.'],
             ]],
            ['slug' => 'glia-snp',
             'titulo' => 'Glía del SNP (3 niveles)',
             'tarea' => 'Compara la glía del SNP con la del SNC armando un cuadro; luego reconoce las células satélite en un ganglio y las envolturas y fibras de un nervio periférico. Cada nivel suma una sección a tu guía.',
             'guia' => ['glia-snp:1' => 'Nivel I: SNC frente a SNP',
                        'glia-snp:2' => 'Nivel II: ganglio y células satélite',
                        'glia-snp:3' => 'Nivel III: nervio periférico'],
             'conexion' => [
                'glia-snp:1' => [
                    'terapia-ocupacional' => 'Guillain-Barré (células de Schwann) y la esclerosis múltiple (oligodendrocitos) pueden dar una debilidad parecida, pero con pronóstico distinto: en el SNP la mielina y el axón pueden regenerar, y la rehabilitación apunta a recuperar funciones.',
                    'fonoaudiologia' => 'En Guillain-Barré puede haber debilidad facial y bulbar (voz débil, disfagia). Como el SNP regenera, la intervención acompaña una recuperación que suele tomar semanas a meses.'],
                'glia-snp:2' => [
                    'terapia-ocupacional' => 'El dolor neuropático (tras un herpes zóster o en la neuropatía diabética) limita el uso de la mano y altera el sueño: el manejo del dolor y la desensibilización son parte de la intervención.',
                    'fonoaudiologia' => 'En la neuralgia del trigémino, cuyas neuronas sensitivas están en el ganglio de Gasser, el dolor aparece al hablar, masticar o tocarse la cara, e interfiere con la comunicación y la alimentación.'],
                'glia-snp:3' => [
                    'terapia-ocupacional' => 'Tras una lesión de nervio de la mano (mediano, cubital) el axón vuelve a crecer guiado por las células de Schwann, cerca de 1 mm al día: mientras tanto se mantiene la movilidad, se protege la piel insensible y se reeduca la sensibilidad.',
                    'fonoaudiologia' => 'Tras una lesión del nervio facial o del laríngeo recurrente, el axón puede volver a crecer guiado por las células de Schwann: la terapia mantiene la musculatura y acompaña la recuperación de la expresión facial o de la voz.'],
             ]],
            ['slug' => 'quiz-celulas-nerviosas-2',
             'titulo' => 'Quiz de cierre',
             'tarea' => '15 preguntas, de lo general a los casos clínicos de tu carrera (elige TO o Fono arriba). Tu resultado y las explicaciones quedan en tu guía.',
             'guia' => ['quiz-celulas-nerviosas-2' => 'Quiz de cierre']],
        ],
    ],
];
