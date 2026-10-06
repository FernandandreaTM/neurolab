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
             'titulo' => 'Partes de la neurona · Nivel I',
             'tarea' => 'Escribe de memoria el nombre de cada estructura y luego elige su función. Lo que no recuerdes queda marcado para repasar.',
             'guia' => ['labeling-partes-neurona' => 'Estructuras de la neurona y su función']],
            ['slug' => 'labeling-neurona-nivel-2',
             'titulo' => 'Partes de la neurona · Nivel II',
             'tarea' => 'Un paso más fino: citoesqueleto, organelos, transporte axonal y crecimiento del axón.',
             'guia' => ['labeling-neurona-nivel-2' => 'Estructura específica de la neurona']],
            ['slug' => 'comparador-tipos-neurona',
             'titulo' => 'Tipos de neurona',
             'tarea' => 'Tres niveles: reconoce cada tipo por su descripción, arma las neuronas y distingue los subtipos multipolares. Cada nivel suma una sección a tu guía.',
             'guia' => ['comparador-tipos-neurona:1' => 'Tipos de neurona: forma, función y localización',
                        'comparador-tipos-neurona:2' => 'Dibujos de neuronas y cuadro comparativo',
                        'comparador-tipos-neurona:3' => 'Subtipos de neuronas multipolares']],
            ['slug' => 'lamina-neurona-piramidal',
             'titulo' => 'Lámina Golgi: piramidal y Purkinje',
             'tarea' => 'Observa neuronas reales: localiza una neurona piramidal y una célula de Purkinje, pega tus capturas y relaciona su forma con su función.',
             'guia' => ['lamina-neurona-piramidal' => 'Lámina Golgi: piramidal y Purkinje']],
            ['slug' => 'quiz-celulas-nerviosas-1',
             'titulo' => 'Quiz de cierre',
             'tarea' => 'Comprueba lo que aprendiste. Tu resultado y las explicaciones de cada pregunta quedan en tu guía.',
             'guia' => ['quiz-celulas-nerviosas-1' => 'Quiz de cierre']],
        ],
    ],
];
