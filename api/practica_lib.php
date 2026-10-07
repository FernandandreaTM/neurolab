<?php
/**
 * NeuroLab — api/practica_lib.php
 * Funciones compartidas del nivel «armar» (las usan practica_check.php y autocompletar.php).
 */

/** Neurona de ejemplo de cada tipo (8 posiciones alrededor del soma) y su sentido de la información. */
function nl_prac_modelo($tipo) {
    $m = [
        'multipolar'     => [['dendrita', 'dendrita', 'axon', 'dendrita', 'dendrita', 'dendrita', null, 'dendrita'],
                             ['entra' => ['i' => 0, 'rama' => ''], 'sale' => ['i' => 2, 'rama' => '']]],
        'bipolar'        => [['axon', null, null, null, 'dendrita', null, null, null],
                             ['entra' => ['i' => 4, 'rama' => ''], 'sale' => ['i' => 0, 'rama' => '']]],
        'pseudounipolar' => [[null, null, null, null, 't', null, null, null],
                             ['entra' => ['i' => 4, 'rama' => 'periferica'], 'sale' => ['i' => 4, 'rama' => 'central']]],
    ];
    return $m[$tipo] ?? null;
}

/** Sentido de la información en una neurona ya armada: entra por una prolongación y sale por otra. */
function nl_prac_evalua_flecha($tipo, $piezas, $f) {
    $pieza = function ($k) use ($piezas, $f) {
        $i = isset($f[$k]['i']) ? (int)$f[$k]['i'] : -1;
        $p = $piezas[$i] ?? null;
        $rama = isset($f[$k]['rama']) ? (string)$f[$k]['rama'] : '';
        return $p === 't' ? 't-' . ($rama === 'central' ? 'central' : 'periferica') : $p;
    };
    $entra = $pieza('entra');
    $sale  = $pieza('sale');
    if (!$entra || !$sale) return [false, 'Toca dos prolongaciones del dibujo: primero por donde entra y luego por donde sale.'];
    if ($tipo === 'pseudounipolar') {
        if ($entra === 't-periferica' && $sale === 't-central') {
            return [true, 'La información viene de los receptores por la rama periférica y sigue directo por la rama central hacia la médula o el tronco: no necesita pasar por el soma.'];
        }
        if ($entra === 't-central' && $sale === 't-periferica') return [false, 'Al revés: la rama con los botones terminales es la que entrega la información en el SNC.'];
        return [false, 'Fíjate en los extremos de la T: una rama termina en receptores (periferia) y la otra en botones terminales (SNC).'];
    }
    if ($entra === 'dendrita' && $sale === 'axon') {
        return [true, 'Entra por las dendritas, se integra en el soma y el cono axónico, y sale por el axón hasta los botones terminales.'];
    }
    if ($entra === 'axon' && $sale === 'dendrita') return [false, 'Al revés: el axón es la prolongación que lleva la información hacia afuera, hasta sus botones terminales.'];
    if ($entra === 'axon') return [false, 'El axón no recibe: es la salida de la neurona.'];
    if ($sale === 'dendrita') return [false, 'Las dendritas reciben información; ¿por dónde sale hacia la neurona siguiente?'];
    return [false, 'Busca la prolongación que recibe y la que transmite.'];
}
