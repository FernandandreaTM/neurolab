<?php
/**
 * NeuroLab — data/practicos.php
 * Rutas de práctico que muestra practico.php?p=<clave>.
 * Cada paso: modo 'solo' (actividad en NeuroLab, con enlace) o 'docente' (se ve en sala).
 * Editar aquí no requiere migrate.php ni seed.php: basta subir este archivo.
 */
return [
    'celulas-1' => [
        'titulo'     => 'Práctico: Células nerviosas I',
        'asignatura' => 'ETMP097 Neurobiología · Terapia Ocupacional',
        'objetivo'   => 'Relacionar la morfología de la neurona con su función y su localización en el sistema nervioso.',
        'intro'      => 'Sigue los pasos en orden. Los pasos "En NeuroLab" los haces a tu ritmo; en los pasos "Con la docente" detente y espera la puesta en común. Al terminar cada actividad presiona "Marcar actividad como completada" y vuelve a esta página.',
        'pasos' => [
            ['modo' => 'docente', 'min' => 5,  'titulo' => 'Encuadre',
             'tarea' => 'Objetivo del práctico, cómo se usa NeuroLab y qué registrar en la guía.'],
            ['modo' => 'solo', 'min' => 15, 'slug' => 'labeling-partes-neurona',
             'titulo' => 'Partes de la neurona y su función',
             'tarea' => 'Identifica las 9 estructuras y anota en tu guía (parte I) el nombre y la función de cada una.'],
            ['modo' => 'docente', 'min' => 5,  'titulo' => 'Flujo de información',
             'tarea' => 'Recepción (dendritas y soma) → integración (cono axónico) → conducción (axón) → transmisión (terminal).'],
            ['modo' => 'solo', 'min' => 20, 'slug' => 'comparador-tipos-neurona',
             'titulo' => 'Tipos de neurona: niveles 1 y 2',
             'tarea' => 'Resuelve las frases (nivel 1) y arma las tres neuronas (nivel 2). Luego abre el cuadro resumen y completa el cuadro de la guía (parte II): dibujo con flecha de dirección del impulso, morfología, función y ejemplo.'],
            ['modo' => 'solo', 'min' => 10, 'slug' => 'comparador-tipos-neurona',
             'titulo' => 'Subtipos multipolares: nivel 3',
             'tarea' => 'En la misma actividad, resuelve el nivel 3: neurona piramidal, célula de Purkinje y motoneurona.'],
            ['modo' => 'solo', 'min' => 25, 'slug' => 'lamina-neurona-piramidal',
             'titulo' => 'Lámina Golgi: piramidal y Purkinje',
             'tarea' => 'Sigue la Guía de observación: localiza una neurona piramidal y una célula de Purkinje, reconoce soma, dendritas y axón, y responde las preguntas (guía, parte III-1). Muéstrale tu captura a la docente.'],
            ['modo' => 'docente', 'min' => 10, 'titulo' => 'Morfología ↔ función ↔ localización',
             'tarea' => 'Puesta en común: ¿por qué cada tipo tiene la forma que tiene y por qué está donde está?'],
            ['modo' => 'solo', 'min' => 15, 'slug' => 'quiz-celulas-nerviosas-1',
             'titulo' => 'Quiz de cierre',
             'tarea' => 'Responde sin apuntes. Revisa el resumen final y anota las preguntas falladas.'],
            ['modo' => 'docente', 'min' => 10, 'titulo' => 'Cierre y dudas',
             'tarea' => 'Revisión de las preguntas más falladas. Próximo práctico: Células nerviosas II (circuitos y glía).'],
        ],
    ],
];
