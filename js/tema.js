/**
 * NeuroLab — tema.js
 * Dibuja el mapa conceptual dentro de la página de un tema (tema.php).
 *
 * Reutiliza el mismo módulo mapa.js que usaba el atlas: acá el tema ya viene
 * decidido por la URL, así que sólo hay que cargar los datos y pintarlo.
 */
import { renderMapa } from './mapa.js';

const host    = document.getElementById('mapa-conceptual');
const topicId = host ? Number(host.dataset.topicId) : 0;

function mensaje(texto) {
    if (host) host.innerHTML = '<p class="nl-tema-vacia">' + texto + '</p>';
}

async function cargarMapa() {
    if (!host || !topicId) return;

    try {
        const [tRes, aRes] = await Promise.all([
            fetch('api/topics.php').then(r => r.json()),
            fetch('api/actividades.php').then(r => r.json()),
        ]);

        const topics = tRes.topics || [];
        if (!topics.length) { mensaje('Todavía no hay temas cargados en la base de datos.'); return; }

        renderMapa(host, {
            topics,
            actividades: aRes.actividades || [],
            topicId,
        });

        if (!host.querySelector('.nl-mapa')) {
            mensaje('No se pudo construir el mapa de este tema.');
        }
    } catch (err) {
        mensaje('No se pudo cargar el mapa conceptual.');
    }
}

cargarMapa();
