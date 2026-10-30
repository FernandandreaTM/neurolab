// Recorre el quiz de cierre (actividad 5) como TO respondiendo bien. Uso: python3 -c "import json;exec(open('docs/practico-3_quiz.py').read().split('def sql')[0]);json.dump(Q,open('/tmp/claude-0/q.json','w'),ensure_ascii=False)" y node docs/practico-3_test-quiz.js 1366 660 q
const { chromium } = require('playwright');
(async () => {
  const [w, h, tag] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:8080/index.php');
  await p.evaluate(() => { localStorage.setItem('nl_carrera', 'terapia-ocupacional'); const d = JSON.parse(localStorage.getItem('nl_progress') || '{}'); ['canales-membrana:1','canales-membrana:2','potencial-accion-neurona:1','potencial-accion-neurona:2','potencial-accion-neurona:3'].forEach(k => d[k] = true); localStorage.setItem('nl_progress', JSON.stringify(d)); });
  await p.goto('http://127.0.0.1:8080/actividad.php?slug=quiz-potencial-accion&ruta=potencial-accion'); await p.waitForTimeout(800);
  await p.screenshot({ path: `/tmp/shots/${tag}-q0.png` });
  const txt = await p.content();
  const Q = JSON.parse(require('fs').readFileSync('/tmp/claude-0/q.json'));
  let n = 0, vistos = new Set();
  for (let k = 0; k < 40; k++) {
    const ops = await p.$$('.nl-quiz__op:not([disabled])'); if (!ops.length) break;
    const enun = await p.evaluate(() => document.body.innerText);
    const q = Q.filter(x => !vistos.has(x.id)).find(x => enun.includes(x.pregunta.slice(0, 40))); if (!q) { console.log('sin match', enun.slice(0, 60)); break; }
    vistos.add(q.id);
    for (const o of ops) { if ((await o.innerText()).includes(q.opciones[q.correcta])) { await o.click(); break; } }
    n++; await p.waitForTimeout(250);
    if (n === 2) await p.screenshot({ path: `/tmp/shots/${tag}-q1.png` });
    const s = p.getByRole('button', { name: /Siguiente pregunta|Ver resultado|Terminar/ }); if (await s.count()) { await s.first().click(); await p.waitForTimeout(250); }
  }
  await p.waitForTimeout(500); await p.screenshot({ path: `/tmp/shots/${tag}-qfin.png`, fullPage: true });
  console.log(tag, 'respondidas', n, [...vistos].join(','), 'errores', errs); await b.close();
})();
