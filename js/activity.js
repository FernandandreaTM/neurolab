/**
 * NeuroLab — activity.js
 * - Tabs de recursos (imagen / 3D / iframe)
 * - Actividad de identificación (labeling.js)
 * - Botón "marcar completada"
 * - Inicia quiz al click
 */
import { markDone, isDone } from './progress.js';
import Quiz from './quiz.js';
import './labeling.js';
import { botonGuia } from './guia.js';   // actividad de identificación (se activa sola si hay #nl-lab)

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

// Pestañas del panel de la mesa de trabajo (lámina: guía / tu trabajo)
function abrirPestana(id) {
    document.querySelectorAll('.nl-mesa__tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
    document.querySelectorAll('.nl-mesa__pane').forEach(p => { p.hidden = p.dataset.pane !== id; });
    document.querySelector('.nl-mesa__panel')?.scrollTo({ top: 0 });
}
document.querySelectorAll('.nl-mesa__tab').forEach(t => t.addEventListener('click', () => abrirPestana(t.dataset.tab)));
document.querySelectorAll('.nl-mesa__ir').forEach(b => b.addEventListener('click', () => abrirPestana(b.dataset.ir)));

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
        let guiaBox = box.querySelector('.nl-guia-box');
        if (!guiaBox) { guiaBox = document.createElement('div'); guiaBox.className = 'nl-guia-box'; box.appendChild(guiaBox); }
        guiaBox.hidden = true;
        const quiz = new Quiz(body, preguntas, { shuffle: true, onComplete: () => {
            // Al responder todas las preguntas, la actividad queda completada y se puede sumar a la guía
            if (slug) { markDone(slug); if (btnComplete) btnComplete.textContent = '✓ Completada'; }
            guiaBox.hidden = false;
            botonGuia(guiaBox, slug, () => seccionQuiz(quiz, box.dataset.titulo || 'Quiz'));
        } });
        quiz.render();
    });
});

/** Sección de "Mi guía" con el resultado del quiz: cada pregunta, su respuesta correcta y la explicación. */
function seccionQuiz(quiz, titulo) {
    const { correct, total, pct } = quiz.getScore();
    const limpio = t => { const d = document.createElement('div'); d.innerHTML = t; return d.textContent; };
    return {
        titulo: 'Quiz: ' + titulo,
        subtitulo: `Puntaje: ${correct} / ${total} (${pct}%)`,
        nota: (total - correct) ? `${total - correct} preguntas para repasar (marcadas con ✗)` : 'Todas correctas',
        bloques: [{
            t: 'tabla',
            cab: ['', 'Pregunta', 'Respuesta correcta', 'Explicación'],
            filas: quiz.preguntas.map((q, i) => {
                const ok = quiz._answers[i] === q.correcta;
                return [ok ? '✓' : '✗', limpio(q.pregunta),
                        limpio(q.opciones[q.correcta]), limpio(q.feedback || '')];
            }),
        }],
    };
}
