// Prueba de «Empezar de nuevo» y del límite de estímulos (nivel I)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const [w, h, tag] = process.argv.slice(2);
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('dialog', d => d.accept());
  await p.goto('http://127.0.0.1:8080/actividad.php?slug=potencial-accion-neurona&nivel=1&ruta=potencial-accion');
  await p.waitForTimeout(500);
  const sim = 'document.querySelector(".nl-msim").__sim';
  await p.evaluate(`${sim}.prueba.vel(4)`);
  // muchos clics seguidos: solo deben entrar 2
  await p.click('[data-lvl="4"]');
  for (let i = 0; i < 8; i++) { await p.click('[data-acc="estimular"]', { force: true }).catch(() => {}); await p.waitForTimeout(60); }
  await p.waitForTimeout(300);
  console.log('boton gris durante el registro:', await p.$eval('[data-acc="estimular"]', e => e.disabled));
  await p.waitForFunction(`!${sim}.estado().corriendo`); await p.waitForTimeout(300);
  await p.screenshot({ path: `/tmp/shots/${tag}-tren.png` });
  await p.evaluate(`${sim}.prueba.serie([[0,1]])`); await p.waitForTimeout(800); await p.waitForFunction(`!${sim}.estado().corriendo`); await p.waitForTimeout(500);
  console.log('antes', JSON.stringify(await p.evaluate(`${sim}.estado()`)), await p.$$eval('.nl-esc__checks li.is-ok', l => l.length));
  await p.click('#nl-esc-reset'); await p.waitForTimeout(500);
  console.log('después', JSON.stringify(await p.evaluate(`${sim}.estado()`)), await p.$$eval('.nl-esc__checks li.is-ok', l => l.length));
  await p.screenshot({ path: `/tmp/shots/${tag}-reset.png` });
  console.log('errores', errs); await b.close();
})();
