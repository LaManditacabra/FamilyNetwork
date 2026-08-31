const { chromium } = require('playwright');
const base = 'file:///work/';
const pages = ['index.html','tienda.html','reglas.html','staff.html','requisitos.html','clientes.html','modos.html','rangos.html','protecciones.html','como-jugar.html','faq.html'];
const viewports = [
  {name:'desktop', w:1440, h:900},
  {name:'tablet', w:768, h:1024},
  {name:'mobile', w:390, h:844},
];
(async () => {
  const browser = await chromium.launch();
  let fails = [];
  const report = [];
  for (const vp of viewports) {
    for (const p of pages) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
      page.on('pageerror', e => errors.push('PAGEERR: '+e.message));
      page.on('requestfailed', r => { if (['image','stylesheet','script'].includes(r.resourceType())) errors.push('REQFAIL '+r.resourceType()+': '+r.url()); });
      await page.goto(base+p, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const r = await page.evaluate(() => ({
        overflowY: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        navVisible: !!document.querySelector('.navbar-custom'),
        links: document.querySelectorAll('a').length,
        imgs: [...document.images].filter(i=>!i.complete || i.naturalWidth===0).map(i=>i.currentSrc||i.src),
      }));
      if (r.overflowY) fails.push(`${p} [${vp.name}] OVERFLOW ${document.documentElement.scrollWidth}>${document.documentElement.clientWidth}`);
      if (errors.length) fails.push(`${p} [${vp.name}] ERRORS: ${errors.join(' | ')}`);
      if (r.imgs.length) fails.push(`${p} [${vp.name}] BROKEN IMG: ${r.imgs.join(', ')}`);
      report.push(`${p.padEnd(15)} ${vp.name.padEnd(8)} ovf=${r.overflowY} links=${r.links} errs=${errors.length}`);
      await ctx.close();
    }
  }
  await browser.close();
  console.log(report.join('\n'));
  console.log('\nRESULT', fails.length===0 ? 'ALL OK' : ('FAILURES:\n'+fails.join('\n')));
  process.exit(fails.length===0?0:1);
})();
