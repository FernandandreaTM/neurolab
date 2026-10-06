/**
 * NeuroLab — activity.js
 * - Tabs de recursos (imagen / 3D / iframe)
 * - Actividad de identificación (labeling.js)
 * - Botón "marcar completada"
 * - Inicia quiz al click
 */
import { markDone, isDone } from './progress.js';
import Quiz from './quiz.js';
import './labeling.js';   // actividad de identificación (se activa sola si hay #nl-lab)

// Tabs de recursos
document.querySelectorAll('#recursos-tabs .nl-act-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const i = tab.dataset.i;
        document.querySelectorAll('#recursos-tabs .nl-act-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#recursos-container .nl-act-recurso-pane').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.querySelector(`#recursos-container .nl-act-recurso-pane[data-i="${i}"]`)?.classList.add('active');
    });
});

// Marcar como completada
const slug = new URLSearchParams(location.search).get('slug');
const btnComplete = document.getElementById('nl-act-complete');
if (btnComplete && slug) {
    if (isDone(slug)) btnComplete.textContent = '✓ Completada';
    btnComplete.addEventListener('click', () => {
        markDone(slug);
        btnComplete.textContent = '✓ Completada';
    });
}

// Iniciar quiz
document.querySelectorAll('.nl-act-quiz').forEach(box => {
    const btnStart = box.querySelector('.nl-act-quiz-start');
    const body    = box.querySelector('.nl-act-quiz-body');
    btnStart?.addEventListener('click', () => {
        let preguntas = [];
        try { preguntas = JSON.parse(box.dataset.preguntas || '[]'); } catch {}
        if (!Array.isArray(preguntas) || !preguntas.length) {
            body.innerHTML = '<p class="text-muted text-sm">Aún no hay preguntas en este quiz.</p>';
            body.style.display = 'block';
            btnStart.style.display = 'none';
            return;
        }
        btnStart.style.display = 'none';
        body.style.display = 'block';
        new Quiz(body, preguntas, { shuffle: true, onComplete: () => {
            // Al responder todas las preguntas, la actividad queda completada
            if (slug) { markDone(slug); if (btnComplete) btnComplete.textContent = '✓ Completada'; }
        } }).render();
    });
});
