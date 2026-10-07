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
        'asignatura' => 'ETMP097 Neurobiología · Terapia Ocupacional',
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
];
