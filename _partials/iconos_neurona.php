<?php
/**
 * NeuroLab — iconos_neurona.php
 * Ícono de cada tipo de neurona para los botones del nivel "elegir".
 * Si existe img/tipos/<clave>.png (asset ilustrado) se usa esa imagen;
 * si no, un dibujo SVG simple de respaldo.
 */

/** "Pseudounipolar" -> "pseudounipolar", "Célula de Purkinje" -> "celula-de-purkinje" */
function nl_clave_icono($nombre) {
    $map = ['á'=>'a','é'=>'e','í'=>'i','ó'=>'o','ú'=>'u','ü'=>'u','ñ'=>'n',
            'Á'=>'a','É'=>'e','Í'=>'i','Ó'=>'o','Ú'=>'u','Ü'=>'u','Ñ'=>'n'];
    $t = strtolower(strtr((string)$nombre, $map));
    return trim(preg_replace('/[^a-z0-9]+/', '-', $t), '-');
}

function nl_icono_neurona($nombre) {
    $clave = nl_clave_icono($nombre);
    $png = 'img/tipos/' . $clave . '.png';
    if (is_file(__DIR__ . '/../' . $png)) {
        return '<img class="nl-ico" src="' . $png . '?v=' . filemtime(__DIR__ . '/../' . $png) . '" alt="" loading="lazy">';
    }
    $d = 'stroke="#8B5CF6" stroke-width="2.2" fill="none" stroke-linecap="round"';
    $a = 'stroke="#EC4899" stroke-width="2.2" fill="none" stroke-linecap="round"';
    $soma = 'fill="#7C3AED" stroke="#C4B5FD" stroke-width="1.2"';
    $svg = [
        'bipolar' => "<path $d d='M24 30 H12 M16 30 L8 23 M16 30 L8 37 M12 30 L5 30'/>
                      <path $a d='M36 30 H54 M54 30 L58 26 M54 30 L58 34'/><rect x='40' y='28' width='5' height='4' rx='1.5' fill='#E0E7FF'/>
                      <ellipse cx='30' cy='30' rx='7' ry='5' $soma/>",
        'pseudounipolar' => "<path $a d='M30 21 V36 M6 36 H54 M6 36 L3 32 M6 36 L3 40 M54 36 L58 32 M54 36 L58 40'/>
                      <circle cx='30' cy='16' r='6.5' $soma/>",
        'multipolar' => "<path $d d='M24 25 L12 14 M15 17 L9 18 M24 33 L12 46 M15 43 L8 42 M28 23 L26 8 M27 15 L21 10 M29 37 L27 52 M27 45 L21 50 M33 24 L40 12'/>
                      <path $a d='M36 31 H55 M55 31 L58 27 M55 31 L58 35'/><rect x='41' y='29' width='5' height='4' rx='1.5' fill='#E0E7FF'/>
                      <circle cx='29' cy='30' r='7' $soma/>",
        'piramidal' => "<path $d d='M30 22 V6 M30 12 L24 6 M30 10 L36 4 M30 16 L37 12 M24 39 L13 46 M36 39 L47 46 M26 40 L22 52 M34 40 L38 52'/>
                      <path $a d='M30 41 V58'/>
                      <path d='M30 21 L39 39 H21 Z' $soma/>",
        'purkinje' => "<path $d d='M30 40 V30 M30 30 L14 18 M30 30 L46 18 M30 30 L22 12 M30 30 L38 12 M30 30 L30 6 M14 18 L8 10 M14 18 L6 20 M46 18 L52 10 M46 18 L54 20 M22 12 L18 4 M38 12 L42 4 M30 6 L26 2 M30 6 L34 2'/>
                      <path $a d='M30 52 V59'/>
                      <ellipse cx='30' cy='46' rx='6' ry='7' $soma/>",
        'motoneurona' => "<path $d d='M10 24 L3 16 M10 36 L3 44 M14 22 L12 10 M14 38 L12 50 M8 30 L2 30'/>
                      <path $a d='M20 30 H46'/><rect x='26' y='28' width='5' height='4' rx='1.5' fill='#E0E7FF'/><rect x='34' y='28' width='5' height='4' rx='1.5' fill='#E0E7FF'/>
                      <rect x='46' y='20' width='12' height='20' rx='3' fill='#FDA4AF' stroke='#E11D48' stroke-width='1.2'/>
                      <path d='M49 24 V36 M52 24 V36 M55 24 V36' stroke='#E11D48' stroke-width='.8'/>
                      <circle cx='14' cy='30' r='7' $soma/>",
    ];
    if (!isset($svg[$clave])) return '';
    return '<svg class="nl-ico" viewBox="0 0 60 60" aria-hidden="true">' . $svg[$clave] . '</svg>';
}
