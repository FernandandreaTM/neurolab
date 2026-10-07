<?php
/**
 * NeuroLab — data/practicos.php
 * Rutas de práctico (practico.php?p=<clave>) y su guía de estudio (guia.php?p=<clave>).
 * Cada paso enlaza una actividad y declara qué secciones de "Mi guía" desbloquea:
 *   'guia' => [ '<clave de sección>' => 'Nombre de la sección' ]
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
             'tarea' => 'Primero arma cada tipo de neurona; luego lee frases y toca la tarjeta del tipo que describen, completando el cuadro comparativo fila por fila. Cada nivel suma una sección a tu guía.',
             'guia' => ['comparador-tipos-neurona:1' => 'Nivel I: dibujos de los tipos de neurona',
                        'comparador-tipos-neurona:2' => 'Nivel II: cuadro comparativo']],
            ['slug' => 'lamina-neurona-piramidal',
             'titulo' => 'Lámina: neuronas reales (3 niveles)',
             'tarea' => 'Corte sagital de cerebro de rata. Oriéntate en el corte; luego encuentra, captura, recorta y etiqueta una neurona piramidal y una célula de Purkinje (Golgi), y compara el cerebelo con Golgi y con cresil violeta. Cada nivel suma una sección a tu guía.',
             'guia' => ['lamina-neurona-piramidal:1' => 'Nivel I: orientación en el corte',
                        'lamina-neurona-piramidal:2' => 'Nivel II: piramidal y Purkinje con Golgi',
                        'lamina-neurona-piramidal:3' => 'Nivel III: cerebelo con Golgi y cresil violeta']],
            ['slug' => 'quiz-celulas-nerviosas-1',
             'titulo' => 'Quiz de cierre',
             'tarea' => 'Comprueba lo que aprendiste. Tu resultado y las explicaciones de cada pregunta quedan en tu guía.',
             'guia' => ['quiz-celulas-nerviosas-1' => 'Quiz de cierre']],
        ],
    ],
];
