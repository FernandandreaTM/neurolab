/**
 * Quiz — motor navegable
 *
 * Uso:
 *   import Quiz from './quiz.js';
 *   const q = new Quiz(containerEl, preguntas, {
 *     shuffle: true,
 *     onComplete(score, total) {}
 *   });
 *   q.render();
 */
export default class Quiz {
    constructor(container, preguntas, opts = {}) {
        this.container  = container;
        this.original   = preguntas;          // orden original siempre guardado
        this.opts       = opts;
        this._reset();
    }

    // --- API pública ---

    render() {
        this.container.innerHTML = this._buildShell();
        this._showQuestion(this._current);
    }

    reset(reshuffle = false) {
        this._reset(reshuffle);
        this.render();
    }

    getScore() {
        const correct = this._answers.filter((a, i) => a !== null && a === this.preguntas[i].correcta).length;
        const total   = this.preguntas.length;
        return { correct, total, pct: total > 0 ? Math.round((correct / total) * 100) : 0 };
    }

    // --- Internals ---

    _reset(shuffle = this.opts.shuffle) {
        this.preguntas = shuffle ? this._shuffle([...this.original]) : [...this.original];
        this._current  = 0;
        this._answers  = new Array(this.preguntas.length).fill(null);
        this._uid      = Math.random().toString(36).slice(2, 7);
    }

    _shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    _buildShell() {
        return `
        <div class="quiz-shell" id="qs-${this._uid}">
            <div class="quiz-progress-bar">
                <div class="quiz-progress-bar__fill" id="qpb-${this._uid}"></div>
            </div>
            <div class="quiz-counter" id="qcounter-${this._uid}"></div>
            <div class="quiz-body"   id="qbody-${this._uid}"></div>
            <div class="quiz-nav"    id="qnav-${this._uid}"></div>
        </div>`;
    }

    _showQuestion(idx) {
        const total = this.preguntas.length;
        if (idx >= total) { this._showResults(); return; }

        const q        = this.preguntas[idx];
        const answered = this._answers[idx] !== null;

        // Progress bar
        document.getElementById(`qpb-${this._uid}`).style.width = `${Math.round(((idx) / total) * 100)}%`;

        // Counter
        document.getElementById(`qcounter-${this._uid}`).innerHTML =
            `<span class="quiz-counter__num">${idx + 1}</span><span class="quiz-counter__sep">/</span><span class="quiz-counter__total">${total}</span>`;

        // Body
        const body = document.getElementById(`qbody-${this._uid}`);
        body.innerHTML = `
            <div class="quiz-question__text">${q.pregunta}</div>
            <div class="quiz-options" id="qopts-${this._uid}">
                ${q.opciones.map((op, oi) => `
                <button class="quiz-option ${answered ? this._optClass(idx, oi) : ''}"
                    data-oi="${oi}" ${answered ? 'disabled' : ''}>
                    <span class="quiz-option__letter">${String.fromCharCode(65 + oi)}</span>
                    <span>${op}</span>
                </button>`).join('')}
            </div>
            <div class="quiz-feedback" id="qfb-${this._uid}" style="${answered ? '' : 'display:none'}">
                ${answered ? this._feedbackHTML(idx) : ''}
            </div>`;

        if (!answered) {
            body.querySelectorAll('.quiz-option').forEach(btn => {
                btn.addEventListener('click', () => this._answer(idx, +btn.dataset.oi));
            });
        }

        // Nav
        this._renderNav(idx);
    }

    _optClass(qIdx, oi) {
        const chosen  = this._answers[qIdx];
        const correct = this.preguntas[qIdx].correcta;
        if (oi === correct)                return 'correct';
        if (oi === chosen && chosen !== correct) return 'wrong';
        return 'disabled-opt';
    }

    _feedbackHTML(qIdx) {
        const q      = this.preguntas[qIdx];
        const chosen = this._answers[qIdx];
        const isOk   = chosen === q.correcta;
        const fb     = q.feedback || '';
        return `
        <div class="quiz-feedback-inner ${isOk ? 'ok' : 'err'}">
            <span class="quiz-feedback-icon">${isOk ? '✓' : '✗'}</span>
            <div>
                <strong>${isOk ? 'Correcto' : 'Incorrecto — respuesta: ' + String.fromCharCode(65 + q.correcta)}</strong>
                ${fb ? `<p>${fb}</p>` : ''}
            </div>
        </div>`;
    }

    _renderNav(idx) {
        const total    = this.preguntas.length;
        const answered = this._answers[idx] !== null;
        const isLast   = idx === total - 1;
        const nav      = document.getElementById(`qnav-${this._uid}`);

        nav.innerHTML = `
        <div class="quiz-nav__inner">
            <button class="btn btn-ghost btn-sm" id="qprev-${this._uid}" ${idx === 0 ? 'disabled' : ''}>← Anterior</button>
            <div class="quiz-nav__dots">
                ${this.preguntas.map((_, i) => `
                <span class="quiz-dot ${i === idx ? 'active' : ''} ${this._answers[i] !== null ? (this._answers[i] === this.preguntas[i].correcta ? 'correct' : 'wrong') : ''}"
                    data-i="${i}"></span>`).join('')}
            </div>
            ${answered
                ? isLast
                    ? `<button class="btn btn-bio btn-sm" id="qfinish-${this._uid}">Ver resultados →</button>`
                    : `<button class="btn btn-primary btn-sm" id="qnext-${this._uid}">Siguiente →</button>`
                : `<button class="btn btn-ghost btn-sm" disabled>Responde para continuar</button>`
            }
        </div>`;

        document.getElementById(`qprev-${this._uid}`)?.addEventListener('click', () => {
            this._current--;
            this._showQuestion(this._current);
        });
        document.getElementById(`qnext-${this._uid}`)?.addEventListener('click', () => {
            this._current++;
            this._showQuestion(this._current);
        });
        document.getElementById(`qfinish-${this._uid}`)?.addEventListener('click', () => {
            this._showResults();
        });

        nav.querySelectorAll('.quiz-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                this._current = +dot.dataset.i;
                this._showQuestion(this._current);
            });
        });
    }

    _answer(qIdx, chosen) {
        this._answers[qIdx] = chosen;
        this._showQuestion(qIdx); // re-render con feedback

        if (typeof this.opts.onComplete === 'function' && this._answers.every(a => a !== null)) {
            this.opts.onComplete(this.getScore().correct, this.preguntas.length);
        }
    }

    _showResults() {
        const { correct, total, pct } = this.getScore();
        const grade = pct >= 90 ? '🏆 Excelente' : pct >= 70 ? '👍 Bien' : pct >= 50 ? '📚 Sigue practicando' : '💪 ¡Tú puedes!';

        document.getElementById(`qpb-${this._uid}`).style.width = '100%';

        const body = document.getElementById(`qbody-${this._uid}`);
        body.innerHTML = `
        <div class="quiz-results">
            <div class="quiz-results__score">
                <div class="quiz-results__num">${correct}<span>/${total}</span></div>
                <div class="quiz-results__pct">${pct}%</div>
                <div class="quiz-results__grade">${grade}</div>
            </div>
            <div class="quiz-results__summary">
                ${this.preguntas.map((q, i) => {
                    const chosen  = this._answers[i];
                    const isOk    = chosen === q.correcta;
                    const letter  = chosen !== null ? String.fromCharCode(65 + chosen) : '—';
                    return `
                    <div class="quiz-result-row ${isOk ? 'ok' : 'err'}">
                        <span class="quiz-result-row__icon">${isOk ? '✓' : '✗'}</span>
                        <span class="quiz-result-row__text">${i + 1}. ${q.pregunta}</span>
                        <span class="quiz-result-row__answer">${letter}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>`;

        const nav = document.getElementById(`qnav-${this._uid}`);
        nav.innerHTML = `
        <div class="quiz-nav__inner">
            <button class="btn btn-ghost btn-sm" id="qretry-${this._uid}">↺ Reintentar</button>
            <button class="btn btn-bio btn-sm"   id="qshuffle-${this._uid}">🔀 Nueva ronda</button>
        </div>`;

        document.getElementById(`qretry-${this._uid}`).addEventListener('click',   () => this.reset(false));
        document.getElementById(`qshuffle-${this._uid}`).addEventListener('click', () => this.reset(true));

        if (typeof this.opts.onComplete === 'function') {
            this.opts.onComplete(correct, total);
        }
    }
}
