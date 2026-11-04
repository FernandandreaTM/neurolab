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
             'titulo' => 'Conoce la glía (3 niveles)',
             'tarea' => 'Cómo es y dónde está cada glía. Etiqueta la glía del SNC en su tejido y la del SNP, del ganglio al nervio; luego reconoce cada célula por su forma y su lugar y arma el cuadro. Cada nivel suma una sección a tu guía.',
             'guia' => ['glia-conoce:1' => 'Nivel I: la glía del SNC en su tejido',
                        'glia-conoce:2' => 'Nivel II: la glía del SNP, del ganglio al nervio',
                        'glia-conoce:3' => 'Nivel III: quién es quién (forma y lugar)'],
             'conexion' => [
                'glia-conoce:1' => [
                    'terapia-ocupacional' => 'Cada glía trabaja en un lugar: en la sustancia gris rodea somas y sinapsis, donde ocurre el aprendizaje motor; en la blanca acompaña a los axones que conectan regiones. Saber dónde está cada una te ayuda a entender por qué una lesión de sustancia blanca enlentece el movimiento aunque las neuronas sigan vivas.',
                    'fonoaudiologia' => 'Las vías del lenguaje (como el fascículo arqueado, entre las áreas de Broca y Wernicke) son sustancia blanca: ahí viven los oligodendrocitos que las mielinizan. Ubicar cada glía te permite relacionar el lugar de una lesión con lo que se altera.'],
                'glia-conoce:2' => [
                    'terapia-ocupacional' => 'La sensibilidad de la mano entra por neuronas cuyos somas están en el ganglio de la raíz dorsal, rodeados de células satélite, y viaja por nervios envueltos por células de Schwann: es la glía que verás comprometida en neuropatías y lesiones de nervio.',
                    'fonoaudiologia' => 'Los nervios craneales que mueven labios, lengua y laringe (facial, hipogloso, vago) son SNP: sus axones van envueltos por células de Schwann, y los ganglios sensitivos (como el del trigémino) tienen células satélite.'],
                'glia-conoce:3' => null,
             ]],
            ['slug' => 'glia-tejido',
             'titulo' => 'La glía en el tejido (3 niveles)',
             'tarea' => 'Encuentra la glía en cortes reales: el epéndimo y los oligodendrocitos de la médula, la glía alrededor de la motoneurona, las células satélite del ganglio y las envolturas del nervio. Cada nivel suma una sección a tu guía.',
             'guia' => ['glia-tejido:1' => 'Nivel I: canal central y sustancia blanca',
                        'glia-tejido:2' => 'Nivel II: motoneurona y su glía',
                        'glia-tejido:3' => 'Nivel III: ganglio y nervio periférico'],
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
             ]],
            ['slug' => 'glia-accion',
             'titulo' => 'La glía en acción (5 niveles)',
             'tarea' => 'Qué hace la glía y cómo responde: predice qué pasa en la unidad neurovascular en cuatro situaciones (reposo, actividad, ACV y barrera abierta), decide qué cruza la barrera hematoencefálica, resuelve cuatro casos de mielina dañada, compara qué pasa tras cortar un axón en el SNP y en el SNC, y reconoce los estados de la glía en casos e imágenes reales. Cada nivel suma una sección a tu guía.',
             'guia' => ['glia-accion:1' => 'Nivel I: la unidad neurovascular en acción',
                        'glia-accion:2' => 'Nivel II: ¿qué cruza la barrera?',
                        'glia-accion:3' => 'Nivel III: cuando se ataca la mielina',
                        'glia-accion:4' => 'Nivel IV: tras la lesión, SNP frente a SNC',
                        'glia-accion:5' => 'Nivel V: glía que cambia'],
             'conexion' => [
                'glia-accion:1' => [
                    'terapia-ocupacional' => 'La unidad neurovascular explica por qué un ACV o un traumatismo dañan más allá del vaso: si se rompe la barrera entra líquido (edema) y si los astrocitos dejan de recaptar glutamato, la excitotoxicidad mata neuronas vecinas. Ese daño secundario es parte de lo que verás en la evaluación funcional.',
                    'fonoaudiologia' => 'En la sinapsis tripartita de la vía auditiva los astrocitos retiran el glutamato muy rápido: así la señal sigue el ritmo del habla. Si fallan (envejecimiento, ruido intenso), la transmisión se altera y cuesta discriminar sonidos.'],
                'glia-accion:2' => [
                    'terapia-ocupacional' => 'La barrera explica por qué muchos fármacos no llegan al encéfalo y por qué el Parkinson se trata con L-dopa: conocer el tratamiento y sus horarios (fluctuaciones «on-off») te ayuda a planificar las sesiones en los momentos de mejor desempeño.',
                    'fonoaudiologia' => 'En el Parkinson, la voz y el habla responden en parte a la L-dopa, que cruza la barrera por un transportador: conviene evaluar y entrenar en el mismo momento del ciclo del fármaco para comparar el desempeño.'],
                'glia-accion:3' => [
                    'terapia-ocupacional' => 'Esclerosis múltiple, Guillain-Barré y Charcot-Marie-Tooth son diagnósticos frecuentes en rehabilitación. Saber si el daño está en el SNC o en el SNP, y si es autoinmune o genético, te dice si esperar recuperación, brotes o un avance lento, y orienta la intervención: conservar energía, órtesis, prevención de caídas.',
                    'fonoaudiologia' => 'En Guillain-Barré pueden afectarse los nervios craneales (debilidad facial, disfagia, voz débil) y en la esclerosis múltiple y la neuromielitis óptica aparecen disartria y alteraciones de la deglución: ubicar el daño y su causa orienta qué esperar y cómo intervenir.'],
                'glia-accion:4' => [
                    'terapia-ocupacional' => 'Tras una lesión de nervio periférico esperas recuperación (Schwann guía el axón, ~1 mm/día): la intervención mantiene y reeduca. Tras una lesión medular el axón no vuelve: la intervención apunta a compensar y aprovechar la plasticidad.',
                    'fonoaudiologia' => 'Una lesión del nervio facial o del laríngeo recurrente (SNP) puede recuperarse en meses; un daño en el tronco encefálico o en la corteza (SNC), no por regeneración sino por plasticidad: eso cambia los objetivos de la terapia.'],
                'glia-accion:5' => [
                    'terapia-ocupacional' => 'La glía participa en la plasticidad que buscas con la práctica repetida: astrocitos que forman sinapsis y microglía que poda las que no se usan. La inflamación crónica, en cambio, la entorpece.',
                    'fonoaudiologia' => 'El aprendizaje del lenguaje y la terapia moldean sinapsis con ayuda de la glía (formación y poda). En las enfermedades neurodegenerativas, la glía reactiva contribuye al deterioro de la comunicación.'],
             ]],
            ['slug' => 'quiz-celulas-nerviosas-2',
             'titulo' => 'Quiz de cierre',
             'tarea' => '15 preguntas para repasar todo el práctico, de lo general a los casos clínicos de tu carrera (elige TO o Fono arriba). Tu resultado y las explicaciones quedan en tu guía.',
             'guia' => ['quiz-celulas-nerviosas-2' => 'Quiz de cierre']],
        ],
    ],
    'potencial-accion' => [
        'titulo'     => 'Canales iónicos y potencial de acción',
        'asignatura' => 'ETMP097 Neurobiología',
        'objetivo'   => 'Explicar cómo los gradientes de iones y los canales de membrana generan el potencial de reposo, los potenciales locales y el potencial de acción, usando simuladores.',
        'intro'      => 'Avanza a tu ritmo, en orden. Trabajarás con dos simuladores de NeuroLab: el de la membrana y el del potencial de acción. Cada nivel se corrige solo y suma una sección a tu guía de estudio; al final descárgala en PDF.',
        'pasos' => [
            ['slug' => 'canales-membrana',
             'titulo' => 'Canales de membrana (2 niveles)',
             'tarea' => 'Con el simulador de la membrana: arma el reposo, mide el potencial, prueba la bomba Na⁺/K⁺ y abre canales de Na⁺ y de K⁺ (cuadro comparativo); luego descubre qué estímulo abre los canales en cada parte de la neurona. Cada nivel suma una sección a tu guía.',
             'guia' => ['canales-membrana:1' => 'Nivel I: reposo y canales',
                        'canales-membrana:2' => 'Nivel II: ¿qué abre los canales?'],
             'conexion' => [
                'canales-membrana:1' => [
                    'terapia-ocupacional' => 'Los gradientes de Na⁺ y K⁺ son la batería de nervios y músculos. Por eso las alteraciones del K⁺ en la sangre (por diuréticos, vómitos o insuficiencia renal) causan debilidad o calambres que cambian lo que el paciente puede hacer en la sesión; y los anestésicos locales actúan bloqueando canales de Na⁺.',
                    'fonoaudiologia' => 'Los gradientes iónicos también son la batería del oído: la endolinfa de la cóclea es rica en K⁺, y al abrirse los canales de las células ciliadas entra K⁺ a favor de su gradiente: así responden al sonido.'],
                'canales-membrana:2' => [
                    'terapia-ocupacional' => 'Cada receptor de la mano (tacto, presión, temperatura) abre canales distintos: es lo que exploras al evaluar la sensibilidad y lo que buscas estimular en la reeducación sensitiva.',
                    'fonoaudiologia' => 'Las células ciliadas abren canales mecánicos cuando se inclinan con el sonido, y el glutamato que liberan abre canales por ligando en el nervio auditivo: así empieza la audición.'],
             ]],
            ['slug' => 'potencial-accion-neurona',
             'titulo' => 'El potencial de acción (3 niveles)',
             'tarea' => 'Con el simulador del potencial de acción: del potencial local al de acción (umbral, todo o nada y sumación), las fases y qué hacen los canales en cada una, y el período refractario. Cada nivel suma una sección a tu guía.',
             'guia' => ['potencial-accion-neurona:1' => 'Nivel I: del potencial local al de acción',
                        'potencial-accion-neurona:2' => 'Nivel II: las fases y sus canales',
                        'potencial-accion-neurona:3' => 'Nivel III: el período refractario'],
             'conexion' => [
                'potencial-accion-neurona:1' => [
                    'terapia-ocupacional' => 'La motoneurona suma miles de entradas excitatorias e inhibitorias antes de disparar. En la espasticidad se pierde parte de la inhibición que baja desde el encéfalo: la motoneurona llega al umbral con facilidad y el músculo responde de más.',
                    'fonoaudiologia' => 'Las neuronas de la vía auditiva suman entradas de ambos oídos y comparan cuándo llega cada una: así localizas de dónde viene un sonido.'],
                'potencial-accion-neurona:2' => [
                    'terapia-ocupacional' => 'Los anestésicos locales y algunos antiepilépticos actúan sobre los canales de Na⁺; los fármacos que alteran el K⁺ cambian la repolarización. Conocerlos te ayuda a entender la fatiga o la debilidad de un paciente en tratamiento.',
                    'fonoaudiologia' => 'La anestesia dental bloquea los canales de Na⁺ de las fibras del trigémino: por eso, mientras dura, cambian la sensibilidad y la articulación del habla.'],
                'potencial-accion-neurona:3' => [
                    'terapia-ocupacional' => 'El período refractario limita cuántos potenciales de acción por segundo puede enviar una motoneurona; la fuerza se gradúa con esa frecuencia y con cuántas motoneuronas se activan. Por eso la FES se programa con una frecuencia determinada.',
                    'fonoaudiologia' => 'Una fibra auditiva no puede disparar con cada ciclo de un sonido agudo por su período refractario: varias fibras se turnan para seguirlo.'],
             ]],
            ['slug' => 'quiz-potencial-accion',
             'titulo' => 'Quiz de cierre',
             'tarea' => '15 preguntas para repasar todo el práctico, de lo general a los casos clínicos de tu carrera (elige TO o Fono arriba). Tu resultado y las explicaciones quedan en tu guía.',
             'guia' => ['quiz-potencial-accion' => 'Quiz de cierre']],
        ],
    ],
    'sinapsis-circuitos' => [
        'titulo'     => 'Sinapsis, neurotransmisores y circuitos',
        'asignatura' => 'ETMP097 Neurobiología',
        'objetivo'   => 'Integrar lo trabajado en los prácticos anteriores: cómo se transmite la señal en la sinapsis química, cómo las sinapsis excitatorias e inhibitorias forman un circuito y qué pasa cuando una enfermedad o un fármaco actúa sobre ellas.',
        'intro'      => 'Último práctico de la serie: integra neuronas, glía, canales y potencial de acción. Avanza a tu ritmo, en orden. Cada nivel se corrige solo y suma una sección a tu guía de estudio; al final descárgala en PDF.',
        'pasos' => [
            ['slug' => 'sinapsis-quimica',
             'titulo' => 'La sinapsis química (2 niveles)',
             'tarea' => 'Con el simulador de la sinapsis: del potencial de acción a la liberación (Ca²⁺, vesículas, sumación de PPSE y recaptación) y cómo el receptor decide el efecto (GABA y acetilcolina en receptores nicotínicos y muscarínicos). Cada nivel suma una sección a tu guía.',
             'guia' => ['sinapsis-quimica:1' => 'Nivel I: del potencial de acción a la liberación',
                        'sinapsis-quimica:2' => 'Nivel II: el receptor decide']],
            ['slug' => 'circuito-reflejo',
             'titulo' => 'Circuito reflejo (2 niveles)',
             'tarea' => 'Con el simulador del reflejo: golpea el tendón rotuliano y pon un clavo bajo el pie, sigue los impulsos por cada neurona y mira cómo se mueve la pierna. Descubre el papel de las interneuronas, que el reflejo se resuelve en la médula de forma automática y por qué el dolor se siente después. Cada nivel suma una sección a tu guía.',
             'guia' => ['circuito-reflejo:1' => 'Nivel I: el reflejo se resuelve en la médula',
                        'circuito-reflejo:2' => 'Nivel II: el dolor también sube a la corteza'],
             'conexion' => [
                'circuito-reflejo:1' => [
                    'terapia-ocupacional' => 'Los reflejos osteotendíneos (rotuliano, bicipital, aquíleo) evalúan el circuito: disminuidos indican falla en el arco (nervio, raíz o motoneurona); exaltados, falta del control que baja del encéfalo, como tras un ACV. La inhibición recíproca explica por qué un movimiento es fluido: cuando falla, aparecen la cocontracción y la espasticidad que dificultan alcanzar, agarrar o caminar.',
                    'fonoaudiologia' => 'Los reflejos orofaríngeos (nauseoso, deglutorio, tusígeno) siguen la misma lógica: vía sensitiva, interneuronas y vía motora, con el centro en el tronco encefálico. La deglución y la tos coordinan músculos que se activan mientras otros se inhiben; evaluarlos en la disfagia orienta qué tramo del circuito falla.'],
                'circuito-reflejo:2' => [
                    'terapia-ocupacional' => 'Tras una lesión medular, los reflejos bajo la lesión se mantienen (y luego se exageran) aunque la persona no sienta: un movimiento reflejo no indica sensibilidad ni control voluntario. Por eso la protección de la piel sin sensibilidad y el manejo de la espasticidad son parte de la intervención.',
                    'fonoaudiologia' => 'En la deglución, parte de la respuesta es refleja (tronco encefálico) y parte llega a la corteza, que la hace consciente. Evaluar por separado la sensibilidad y los reflejos orofaríngeos orienta qué tramo falla, por ejemplo cuando el paciente no percibe lo que entra a la vía aérea (aspiración silente).'],
             ]],
            ['slug' => 'casos-sinapsis',
             'titulo' => 'Casos clínicos: la sinapsis en la clínica',
             'tarea' => 'Cinco pacientes cuya enfermedad o tratamiento actúa en la sinapsis (ISRS, ACV, Parkinson, miastenia gravis y toxina botulínica). En cada uno eliges dónde actúa, con tarjetas según el tipo de sinapsis (entre neuronas o placa motora), y respondes qué cambia por la enfermedad y qué cambia con el fármaco; al final tienes un cuadro comparativo en tu guía.',
             'guia' => ['casos-sinapsis:1' => 'Casos clínicos: cuadro comparativo']],
        ],
    ],
];
