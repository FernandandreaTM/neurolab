// Prueba de punta a punta de un nivel «escenas» (Playwright). Uso: node docs/practico-3_test.js <slug> <nivel> <ancho> <alto> <tag> [claveConError]
// Requiere php -S 127.0.0.1:8080 en la raíz; capturas en /tmp/shots/ (crear antes); GUIA=1 captura la guía en /tmp/guia.png.
const { chromium } = require('playwright');
const [,, slug, nivel, w, h, tag, errAt] = process.argv;
(async () => {
  // PERFIL=<carpeta>: perfil persistente, para encadenar actividades y ver la guía completa
  const nav = process.env.PERFIL ? null : await chromium.launch();
  const ctx = nav ? await nav.newContext({ viewport: { width: +w, height: +h } })
    : await chromium.launchPersistentContext(process.env.PERFIL, { viewport: { width: +w, height: +h } });
  const b = { close: () => nav ? nav.close() : ctx.close() };
  const p = ctx.pages()[0] || await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/phet|ERR_|403|Failed to load/.test(m.text())) errs.push(m.text()); });
  // desbloquear niveles previos
  await p.goto(`http://127.0.0.1:8080/actividad.php?slug=${slug}&nivel=${nivel}&ruta=${process.env.RUTA || "potencial-accion"}`);
  await p.evaluate(([slug, n]) => { const d = JSON.parse(localStorage.getItem('nl_progress') || '{}'); for (let i = 1; i < 6; i++) d[slug + ':' + i] = true; localStorage.setItem('nl_progress', JSON.stringify(d)); }, [slug, nivel]);
  await p.reload();
  await p.waitForTimeout(400);
  const N = await p.evaluate(() => JSON.parse(document.getElementById('nl-esc').dataset.nivel));
  const clave = await p.evaluate(() => document.getElementById('nl-esc').dataset.clave);
  let shot = 0, guard = 0, errores = 0;
  const snap = async (n) => { await p.waitForTimeout(n || 500); await p.screenshot({ path: `/tmp/shots/${tag}-${String(shot++).padStart(2, '0')}.png` }); };
  await snap();
  while (guard++ < 120) {
    const st = await p.evaluate(k => JSON.parse(localStorage.getItem('nl_esc_' + k) || 'null'), clave);
    const cs = N.casos.find(c => !st || !st.c[c.clave] || st.c[c.clave].paso < c.pasos.length);
    if (!cs) break;
    const e = st && st.c[cs.clave] ? st.c[cs.clave] : { paso: 0 };
    const ps = cs.pasos[e.paso];
    // ¿hay que pasar al caso siguiente?
    const sig = await p.$('.nl-sig'); if (sig && (!st.c[cs.clave] || st.c[cs.clave].paso === 0)) { await sig.click(); await p.waitForTimeout(200); continue; }
    const equivocar = errAt && cs.clave === errAt && !(e.r && e.r[e.paso] && ((e.r[e.paso].mal || []).length || (e.r[e.paso].qmal || []).length)) && ps.tipo !== 'mira' && ps.tipo !== 'predice';
    if (ps.tipo === 'mira') { await p.click('.nl-mira'); }
    else if (ps.tipo === 'sim') {
      const acc = { compNa: ['[data-can="compNa:1"]', 1], compK: ['[data-can="compK:1"]', 1], sinIones: ['[data-acc="vaciar"]', 1] };
      const poner = async (ion, fy) => { await p.click(`[data-sel="${ion}"]`); const bb = await (await p.$('.nl-msim__lienzo')).boundingBox(); for (let n = 0; n < 7; n++) await p.mouse.click(bb.x + bb.width * (0.1 + n * 0.07), bb.y + bb.height * fy); };
      const rep = await p.$('[data-acc="reposo"]:not([hidden])');
      const tog = { bombaOff: ['bomba', false], bombaOn: ['bomba', true], cerradoNa: ['abiertoNa', false], abiertoNa: ['abiertoNa', true], cerradoK: ['abiertoK', false], abiertoK: ['abiertoK', true] };
      const t0 = Date.now(); let hecho = {};
      if (N.simulador === 'pa') {   // simulador del potencial de acción: estímulos programados (ms del modelo) y cursor por fase
        const sim = 'document.querySelector(".nl-msim").__sim';
        await p.evaluate(`${sim}.prueba.vel(4)`);
        const serie = { nivelBajo: [[0, 1]], sub: [[0, 1]], pa: [[0, 3]], dosNiveles: [[0, 5]], pa3: [[0, 3]], pa45: [[0, 5]], nivel2: [[0, 2]], suma: [[0, 2], [2, 2]], nivelMax: [[0, 5]], refAbs: [[0, 5], [2.5, 5]], refRel: [[0, 5], [9, 5]] };
        const cur = { curDespol: 'despol', curRepol: 'repol', curHiper: 'hiper' };
        const par = { refAbs: [3, 5], relDebil: [9, 3], refRel: [9, 5] };   // nivel con pares de estímulos (sim_cfg.par)
        if (N.sim_cfg && N.sim_cfg.par) { for (const k in serie) delete serie[k]; }
        for (const [k, c] of ps.checks.entries()) {
          if (await p.$(`.nl-esc__checks li[data-k="${k}"].is-ok`)) continue;
          if (serie[c.c]) { await p.evaluate(`${sim}.prueba.serie(${JSON.stringify(serie[c.c])})`); await p.waitForTimeout(1200); await p.waitForFunction(`!${sim}.estado().corriendo`, null, { timeout: 30000 }); await p.waitForTimeout(400); }
          if (cur[c.c]) { await p.evaluate(`${sim}.prueba.cursor("${cur[c.c]}")`); await p.waitForTimeout(300); }
          if (N.sim_cfg && N.sim_cfg.par && par[c.c]) { await p.evaluate(`${sim}.prueba.par(${par[c.c][0]}, ${par[c.c][1]})`); await p.waitForTimeout(1200); await p.waitForFunction(`!${sim}.estado().corriendo`, null, { timeout: 30000 }); await p.waitForTimeout(400); }
          if (c.c === 'cur2do') { await p.evaluate(`${sim}.prueba.cursor2()`); await p.waitForTimeout(300); }
        }
        if (await p.$('.nl-esc__simq.is-bloq')) errs.push('sim sin completar: ' + cs.clave + ' ' + JSON.stringify(await p.evaluate(`${sim}.estado()`)));
      }
      if (N.simulador === 'sinapsis') {   // simulador de la sinapsis: botones reales de la interfaz
        const sim = 'document.querySelector(".nl-msim").__sim';
        await p.evaluate(`${sim}.prueba.vel(3)`);
        const sw = async (k, on) => { const v = await p.getAttribute(`[data-sw="${k}"]`, 'aria-pressed') === 'true'; if (v !== on) await p.click(`[data-sw="${k}"]`); };
        const correr = async sel => { await p.click(sel); await p.waitForTimeout(300); await p.waitForFunction(`!${sim}.estado().corriendo`, null, { timeout: 40000 }); await p.waitForTimeout(300); };
        let trenHecho = false;
        for (const c of ps.checks) {
          if (c.c === 'caOff') await sw('ca', false);
          if (c.c === 'caOn') await sw('ca', true);
          if (c.c === 'recapOff') await sw('recap', false);
          if (c.c === 'ntGaba') await p.click('[data-nt="gaba"]');
          if (c.c === 'ntAch') await p.click('[data-nt="ach"]');
          if (c.c === 'recNic') await p.click('[data-rec="nic"]');
          if (c.c === 'recMus') await p.click('[data-rec="mus"]');
          if (['lib1', 'sinLib', 'largo', 'ppsi', 'nic', 'mus'].includes(c.c)) await correr('[data-acc="pa"]');
          if (c.c === 'excito') await correr('[data-acc="tren"]');
          if ((c.c === 'tren' || c.c === 'paPost' || c.c === 'trenNic') && !trenHecho) { trenHecho = true; await correr('[data-acc="tren"]'); }
        }
        if (await p.$('.nl-esc__simq.is-bloq')) errs.push('sim sin completar: ' + cs.clave + ' ' + JSON.stringify(await p.evaluate(`${sim}.estado()`)));
      }
      if (N.simulador === 'reflejo') {   // simulador del reflejo: botones reales de la interfaz
        const sim = 'document.querySelector(".nl-msim").__sim';
        await p.evaluate(`${sim}.prueba.vel(4)`);
        const sw = async (k, on) => { const v = await p.getAttribute(`[data-sw="${k}"]`, 'aria-pressed') === 'true'; if (v !== on) await p.click(`[data-sw="${k}"]`); };
        const correr = async sel => { await p.click(sel); await p.waitForTimeout(300); await p.waitForFunction(`!${sim}.estado().corriendo`, null, { timeout: 60000 }); await p.waitForTimeout(300); };
        for (const c of ps.checks) {
          if (c.c === 'inhOff') await sw('inh', false);
          if (c.c === 'inhOn') await sw('inh', true);
          if (c.c === 'lesion') await sw('lesion', true);
          if (c.c === 'golpe' || c.c === 'golpeSinInh') await correr('[data-acc="golpe"]');
          if (['clavo', 'dolor', 'clavoLesion'].includes(c.c)) await correr('[data-acc="clavo"]');
        }
        if (await p.$('.nl-esc__simq.is-bloq')) errs.push('sim sin completar: ' + cs.clave + ' ' + JSON.stringify(await p.evaluate(`${sim}.estado()`)));
      }
      while (N.simulador !== 'pa' && N.simulador !== 'sinapsis' && N.simulador !== 'reflejo' && Date.now() - t0 < 120000) {
        if (!(await p.$('.nl-simok[disabled]')) && !(await p.$('.nl-esc__simq.is-bloq'))) break;
        for (const [k, c] of ps.checks.entries()) {
          if (await p.$(`.nl-esc__checks li[data-k="${k}"].is-ok`)) continue;
          const tocar = async (ion, n, k, fy) => { await p.click(`[data-sel="${ion}"]`); const bb = await (await p.$('.nl-msim__lienzo')).boundingBox(); for (let q = 0; q < n; q++) await p.mouse.click(bb.x + bb.width * (0.15 + q * 0.07), bb.y + bb.height * fy); };
          if (c.c === 'na150' && !hecho.a) { hecho.a = 1; await tocar('na', 6, 5, .2); }
          if (c.c === 'na25' && !hecho.b) { hecho.b = 1; await tocar('na', 1, 5, .8); }
          if (c.c === 'k150' && !hecho.c) { hecho.c = 1; await tocar('k', 6, 5, .8); }
          if (c.c === 'naAfuera' && !hecho.na) { hecho.na = 1; await poner('na', .2); }
          if (c.c === 'kAdentro' && !hecho.k) { hecho.k = 1; await poner('k', .8); }
          if (c.c === 'vNeg' && rep && !hecho.rep && !ps.checks.some(x => x.c === 'bombaOn')) { hecho.rep = 1; await rep.click(); }
          if (acc[c.c] && !hecho[c.c]) { for (let n = 0; n < acc[c.c][1]; n++) await p.click(acc[c.c][0]); hecho[c.c] = 1; }
          if (tog[c.c]) { const on = await p.getAttribute(`[data-tog="${tog[c.c][0]}"]`, 'aria-pressed') === 'true'; if (on !== tog[c.c][1]) await p.click(`[data-tog="${tog[c.c][0]}"]`); }
        }
        await p.waitForTimeout(500);
      }
      console.log('  sim', cs.clave, Math.round((Date.now() - t0) / 1000) + ' s');
      await snap(100);
      if (ps.q) {
        const txt = equivocar ? ps.q.ops[(ps.q.ok + 1) % ps.q.ops.length] : ps.q.ops[ps.q.ok];
        for (const bt of await p.$$('.nl-esc__simq [data-i]')) { const tx = (await bt.innerText()).replace(/^[A-D]\s+/, '').trim(); if (tx === txt.trim()) { await bt.click(); break; } }
        if (equivocar) { errores++; await snap(300); continue; }
      } else await p.click('.nl-simok');
    }
    else if (ps.tipo === 'numero') {
      await p.fill('.nl-esc__num input', String(equivocar ? ps.rango[1] + 40 : (ps.rango[0] + ps.rango[1]) / 2).replace('-', '−'));
      await p.click('.nl-esc__num button');
    } else if (ps.tipo === 'tocar' && ps.q && e.r && e.r[e.paso] && e.r[e.paso].tocado) {
      const txt = equivocar ? ps.q.ops[(ps.q.ok + 1) % ps.q.ops.length] : ps.q.ops[ps.q.ok];
      for (const bt of await p.$$('#nl-esc-trabajo [data-i]')) { const tx = (await bt.innerText()).replace(/^[A-D]\s+/, '').trim(); if (tx === txt.trim()) { await bt.click(); break; } }
    } else if (ps.tipo === 'tocar') {
      if (await p.$('.nl-esc__sim:not([hidden])')) await p.click('[data-ver="esquema"]');
      const z = N.zonas[ps.ok[0]];
      let x, y;
      if (equivocar) { x = 5; y = 5; }
      else if (z.e) { x = z.e[0]; y = z.e[1]; } else if (z.r) { x = z.r[0] + z.r[2] / 2; y = z.r[1] + z.r[3] / 2; } else { const l = z.l[0]; [x, y] = l[Math.floor(l.length / 2)]; }
      const box = await (await p.$('#nl-esc-lienzo img')).boundingBox();
      await p.mouse.click(box.x + x / N.vb[0] * box.width, box.y + y / N.vb[1] * box.height);
    } else {
      const txt = equivocar ? ps.ops[(ps.ok + 1) % ps.ops.length] : ps.ops[ps.ok];
      const btns = [...await p.$$('#nl-esc-trabajo [data-i]'), ...await p.$$('#nl-esc-vista [data-mc]:not([disabled]), .nl-esc__mcarta:not([disabled])')];
      let hit = false;
      for (const bt of btns) { const t = (await bt.innerText()).replace(/^[A-D]\s+/, '').trim(); if (t === txt.trim()) { await bt.click(); hit = true; break; } }
      if (!hit) { errs.push('sin botón: ' + txt); break; }
    }
    await p.waitForTimeout(250);
    if (equivocar) { errores++; await snap(300); }
    const st2 = await p.evaluate(k => JSON.parse(localStorage.getItem('nl_esc_' + k) || 'null'), clave);
    if (st2.c[cs.clave] && st2.c[cs.clave].paso >= cs.pasos.length) await snap(cs.anim ? 4600 : 500);
    else if (['mira'].includes(ps.tipo) || (cs.pasos[st2.c[cs.clave].paso] || {}).vista === 'sim') await snap(300);
    const s2 = await p.$('.nl-sig'); if (s2 && st2.c[cs.clave].paso >= cs.pasos.length) { await s2.click(); await p.waitForTimeout(300); }
  }
  const fin = await p.$('.nl-fin'); if (fin) { await fin.click(); }
  await snap(1500);
  if (process.env.GUIA) { await p.goto(`http://127.0.0.1:8080/guia.php?p=${process.env.RUTA || 'potencial-accion'}`); await p.waitForTimeout(1500); await p.screenshot({ path: '/tmp/guia.png', fullPage: true }); }
  const guia = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('nl_guia') || '{}')));
  console.log(tag, 'pasos', guard, 'errores JS:', errs, 'guia:', guia.length ? guia : 'ver clave');
  await b.close();
})();
