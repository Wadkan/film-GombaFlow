const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { startPwaServer } = require('./helpers/pwa-server.cjs');

const root = path.resolve(__dirname, '../../..');
const html = fs.readFileSync(path.join(__dirname, '../viewer.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'local-workflows/script-and-cut-workflows/gombaFlow/projects/2-unlimited-claude-code-for/3-script.md'), 'utf8');
const core = fs.readFileSync(path.join(__dirname, '../core.js'), 'utf8');

test('filter and read a recording script', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(({ script, core }) => { window.__viewerHost = { script, core }; }, { script, core });
  await page.setContent(html.replace('/* CORE_SOURCE */', () => core));
  await page.evaluate(script => window.viewerOpen(script), script);
  await expect(page.locator('#partInfo')).toBeVisible();
  await expect(page.locator('#partInfo')).toHaveText(/^#1 - /);
  await page.getByLabel('Fejezet').selectOption({ label: 'C4 — Megvalósítás' });
  await page.getByLabel('Felvétel típusa').selectOption({ label: 'b-roll' });
  await page.getByLabel('Helyszín').selectOption({ label: 'Helyszín B' });
  await page.getByLabel('Felvételi állapot').selectOption({ label: 'Nincs felvéve' });
  await page.getByRole('button', { name: /Tartalomtípusok/ }).click();
  await page.getByLabel('Képernyő-akció').uncheck();
  await page.getByRole('button', { name: 'Bezárás' }).click();
  await page.getByLabel('Keresés a narrációban').fill('gomba-gemma');
  await expect(page.locator('#results .result')).toHaveCount(0);
  await expect(page.locator('#partInfo')).toBeHidden();
  await page.getByLabel('Keresés a narrációban').fill('modell');
  await expect(page.locator('#results .result').first()).toBeVisible();
  await page.locator('#results .result').first().click();
  await expect(page.locator('#cue')).toContainText('serpenyő timeline 2 script');
  await expect(page.locator('.bottom')).toBeVisible();
  await expect(page.locator('.top')).toBeVisible();
  await page.getByLabel('Fejezet').selectOption('all');
  await page.getByLabel('Felvétel típusa').selectOption('all');
  await page.getByLabel('Helyszín').selectOption('all');
  await page.getByLabel('Keresés a narrációban').fill('');
  await page.locator('#results .result').first().click();
  await page.evaluate(() => {
    const start=new Event('touchstart'), end=new Event('touchend');
    start.touches=[{clientX:300,clientY:350}];end.changedTouches=[{clientX:100,clientY:355}];
    document.getElementById('content').dispatchEvent(start);
    document.getElementById('content').dispatchEvent(end);
  });
  await expect(page.locator('#cue')).toContainText('script 2 serpenyő');
  await page.getByLabel('Felvéve', {exact:true}).click();
  await expect(page.locator('#cue')).toContainText('script 3 serpenyő');
  await page.getByLabel('Keresés a narrációban').fill('16 gigabájt');
  await page.locator('#results .result').last().click();
  await page.getByRole('button', {name:/Tartalomtípusok/}).click();
  await page.getByLabel('Képernyő-akció').check();
  await page.getByRole('button', {name:'Bezárás'}).click();
  await expect(page.locator('#content')).toContainText('PARAMETER num_ctx 32768');
  await expect(page.locator('#content script')).toHaveCount(0);
  const partInfo = page.locator('#partInfo');
  const partInfoBeforeScroll = await partInfo.boundingBox();
  await page.locator('#content').evaluate(el => { el.scrollTop=el.scrollHeight; });
  expect(await partInfo.boundingBox()).toEqual(partInfoBeforeScroll);
  const cueY= (await page.locator('.cuebar').boundingBox()).y;
  expect(await page.locator('#content').evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  expect((await page.locator('.cuebar').boundingBox()).y).toBe(cueY);
  expect((await page.locator('.top').boundingBox()).y).toBe(0);
  const footer=await page.locator('.bottom').boundingBox();
  expect(Math.round(footer.y+footer.height)).toBe(844);
  const readerBox = await page.locator('#content').boundingBox();
  expect(readerBox.y + readerBox.height).toBe(partInfoBeforeScroll.y);
  expect(partInfoBeforeScroll.y + partInfoBeforeScroll.height).toBe(footer.y);
  await expect(page.locator('#content')).not.toContainText('const greeting');
  for (const route of ['button', 'swipe', 'picker', 'record']) {
    await test.step('new part starts below pinned header: '+route, async () => {
      await page.getByLabel('Keresés a narrációban').fill('');
      await page.getByLabel('Felvételi állapot').selectOption(route==='record'?'no':'all');
      await page.getByLabel('Keresés a narrációban').focus();
      await page.locator('#results [data-id="7"]').click();
      await page.locator('#content').evaluate(el => { el.scrollTop=el.scrollHeight; });
      expect(await page.locator('#content').evaluate(el=>el.scrollTop)).toBeGreaterThan(300);
      const scrolledNarration=await page.getByRole('heading', {name:'Narráció'}).boundingBox();
      const contentBox=await page.locator('#content').boundingBox();
      expect(scrolledNarration.y).toBeLessThan(contentBox.y);
      const cueBox=await page.locator('.cuebar').boundingBox();
      expect(cueBox.y+cueBox.height).toBeLessThanOrEqual(contentBox.y);
      if(route==='button') await page.getByRole('button',{name:'Következő rész'}).click();
      if(route==='swipe') await page.evaluate(() => {
        const start=new Event('touchstart'),end=new Event('touchend');
        start.touches=[{clientX:300,clientY:350}];end.changedTouches=[{clientX:100,clientY:355}];
        document.getElementById('content').dispatchEvent(start);
        document.getElementById('content').dispatchEvent(end);
      });
      if(route==='picker') {
        await page.getByLabel('Keresés a narrációban').focus();
        await page.locator('#results [data-id="8"]').click();
      }
      if(route==='record') await page.getByLabel('Felvéve',{exact:true}).click();
      await expect(page.locator('#partInfo')).toHaveText(/^#8 - /);
      expect(await page.locator('#content').evaluate(el => el.scrollTop)).toBe(0);
      const narration=await page.getByRole('heading', {name:'Narráció'}).boundingBox();
      expect(narration.y).toBeGreaterThanOrEqual(cueBox.y+cueBox.height);
    });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.locator('#partInfo')).toBeVisible();
  await expect(page.getByLabel('Keresés a narrációban')).toBeVisible();
});

test('shows browser failures on screen for diagnosis', async ({page}) => {
  await page.setContent(html.replace('/* CORE_SOURCE */', () => core));
  await page.evaluate(() => window.dispatchEvent(new ErrorEvent('error', {message:'diagnostic test failure', filename:'viewer', lineno:42})));
  await expect(page.locator('#viewerDiagnostic')).toBeVisible();
  await expect(page.locator('#viewerDiagnostic')).toContainText('diagnostic test failure');
  await expect(page.locator('#viewerDiagnostic')).toContainText('42');
});


test('record parts and resume the offline library', async ({page}) => {
  const server=await startPwaServer();
  await page.setViewportSize({width:390,height:844});
  await page.goto(server.url);
  await expect(page.getByRole('heading',{name:'Scriptek'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Másik MD megnyitása…'})).toBeVisible();
  await page.setInputFiles('#scriptFile',{name:'claude.md',mimeType:'text/markdown',buffer:Buffer.from(script)});
  await expect(page.locator('#partInfo')).toHaveText(/^#1 - /);
  await page.getByLabel('Felvéve',{exact:true}).click();
  await expect(page.locator('#partInfo')).toHaveText(/^#2 - /);
  await page.getByRole('button',{name:/Tartalomtípusok/}).click();
  await page.getByLabel('Képernyő-akció').uncheck();
  await page.getByRole('button',{name:'Bezárás'}).click();
  await page.reload();
  await expect(page.locator('#partInfo')).toHaveText(/^#2 - /);
  const state=await page.evaluate(async()=>{const storage=await window.GombaFlowStorage.open();const value=await storage.read();storage.close();return value});
  expect(state.topics['2-unlimited-claude-code-for'].recorded['1']).toBe(true);
  expect(state.topics['2-unlimited-claude-code-for'].last_part_id).toBe('2');
  expect(state.preferences.types.screen).toBe(false);
  await server.close();
});

test('install, restart offline and update without losing local data', async ({browser}) => {
  const server = await startPwaServer();
  const context = await browser.newContext();
  let page = await context.newPage();
  try {
    const manifestResponse = await page.goto(server.url);
    expect(manifestResponse.status()).toBe(200);
    expect(await page.request.get(new URL('/manifest.webmanifest', server.url).href).then(response => response.status())).toBe(200);
    expect(await page.request.get(new URL('/app-icon.svg', server.url).href).then(response => response.status())).toBe(200);
    await expect(page.locator('#offlineStatus')).toHaveText('Program offline használatra kész');
    const firstCache = await page.evaluate(async () => (await caches.keys()).find(name => name.startsWith('gombaflow-pwa-')));

    await page.setInputFiles('#scriptFile', {name:'claude.md',mimeType:'text/markdown',buffer:Buffer.from(script)});
    await page.getByLabel('Felvéve',{exact:true}).click();
    await expect(page.locator('#partInfo')).toHaveText(/^#2 - /);
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#partInfo')).toHaveText(/^#2 - /);
    for (const icon of ['/app-icon-192.png', '/app-icon-512.png', '/apple-touch-icon.png']) {
      const iconResponse = await page.evaluate(async iconPath => {
        const response = await fetch(iconPath);
        return { ok: response.ok, signature: Array.from(new Uint8Array(await response.arrayBuffer()).slice(0, 8)) };
      }, icon);
      expect(iconResponse).toEqual({ok:true, signature:[137,80,78,71,13,10,26,10]});
    }
    await page.evaluate(async () => {
      const url = new URL('/index.html', location.href).href;
      const activeName = (await caches.keys()).find(name => name.startsWith('gombaflow-pwa-'));
      await (await caches.open(activeName)).delete(url);
      await (await caches.open('unrelated-cache')).put(url, new Response('<h1>Wrong cache</h1>', {headers:{'Content-Type':'text/html'}}));
    });
    await page.goto(new URL('/index.html', server.url).href);
    await expect(page.locator('#partInfo')).toHaveText(/^#2 - /);
    await page.evaluate(() => caches.delete('unrelated-cache'));
    await page.getByLabel('Felvéve',{exact:true}).click();
    await expect(page.locator('#partInfo')).toHaveText(/^#3 - /);
    const offlineDownload = page.waitForEvent('download');
    await page.getByRole('button',{name:'Pipák exportja'}).click();
    expect((await offlineDownload).suggestedFilename()).toMatch(/^2-unlimited-claude-code-for-/);

    await context.setOffline(false);
    await server.update({editSource: async sourceDir => {
      await fs.promises.appendFile(path.join(sourceDir, 'pwa.js'), '\n// build B\n');
    }});
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await expect.poll(() => page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting))).toBe(true);
    await page.close();

    page = await context.newPage();
    await page.goto(server.url);
    await expect(page.locator('#offlineStatus')).toHaveText('Program offline használatra kész');
    await expect(page.locator('#partInfo')).toHaveText(/^#3 - /);
    const secondCache = await page.evaluate(async () => (await caches.keys()).find(name => name.startsWith('gombaflow-pwa-')));
    expect(secondCache).not.toBe(firstCache);

    await server.update({editSource: async sourceDir => {
      await fs.promises.appendFile(path.join(sourceDir, 'pwa.js'), '\n// incomplete build C\n');
    }, failAsset: 'app-icon.svg'});
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await expect.poll(() => server.failedAssetRequests).toBeGreaterThan(0);
    await page.waitForTimeout(300);
    expect(await page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting))).toBe(false);
    expect(await page.evaluate(async () => (await caches.keys()).filter(name => name.startsWith('gombaflow-pwa-')))).toEqual([secondCache]);

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#offlineStatus')).toHaveText('Program offline használatra kész');
    await expect(page.locator('#partInfo')).toHaveText(/^#3 - /);
    await expect(page.getByRole('button',{name:'Pipák exportja'})).toBeEnabled();
  } finally {
    await context.close();
    await server.close();
  }
});

test('keeps separate topics, preserves progress on update, and rejects invalid MD', async ({page}) => {
  const server=await startPwaServer();
  const secondScript=script.replace('2-unlimited-claude-code-for','3-derived-topic').replaceAll('timeline 2 script','timeline 3 script');
  const thirdScript=script.replace('2-unlimited-claude-code-for','4-another-topic').replaceAll('timeline 2 script','timeline 4 script');
  const updatedScript=script.replace('Claude Code limitbe futott? Próbáld helyi modellel','Claude Code limitbe futott? Frissített script');
  try {
    await page.goto(server.url);
    await page.setInputFiles('#scriptFile',{name:'claude.md',mimeType:'text/markdown',buffer:Buffer.from(script)});
    await page.getByLabel('Felvéve',{exact:true}).click();
    await page.evaluate(()=>window.viewerShowLibrary({topics:['2-unlimited-claude-code-for']}));
    await page.locator('#scriptFile').evaluate(input=>{input.value='';input.dispatchEvent(new Event('change',{bubbles:true}))});
    await expect(page.locator('#content')).toContainText('2-unlimited-claude-code-for');
    await page.locator('#scriptFile').evaluate(input=>{input.value=''});
    await page.setInputFiles('#scriptFile',{name:'derived.md',mimeType:'text/markdown',buffer:Buffer.from(secondScript)});
    await expect(page.locator('#partInfo')).toHaveText(/^#1 - /);
    await page.getByRole('button',{name:'Scriptek'}).click();
    await expect(page.locator('#partInfo')).toBeHidden();
    await expect(page.locator('#content')).toContainText('2-unlimited-claude-code-for');
    await expect(page.locator('#content')).toContainText('3-derived-topic');
    await page.locator('#scriptFile').evaluate(input=>{input.value=''});
    await page.setInputFiles('#scriptFile',{name:'another.md',mimeType:'text/markdown',buffer:Buffer.from(thirdScript)});
    await page.getByRole('button',{name:'Scriptek'}).click();
    await expect(page.locator('#content')).toContainText('4-another-topic');
    await page.getByRole('button',{name:'Megnyitás'}).first().click();
    await expect(page.locator('#partInfo')).toHaveText(/^#2 - /);
    await page.getByRole('button',{name:'Scriptek'}).click();

    await page.locator('#scriptFile').evaluate(input=>{input.value=''});
    await page.setInputFiles('#scriptFile',{name:'claude-updated.md',mimeType:'text/markdown',buffer:Buffer.from(updatedScript)});
    await expect(page.locator('#partInfo')).toHaveText(/^#2 - /);
    const state=await page.evaluate(async()=>{const storage=await window.GombaFlowStorage.open();const value=await storage.read();storage.close();return value});
    expect(state.topics['2-unlimited-claude-code-for'].recorded['1']).toBe(true);
    expect(state.topics['2-unlimited-claude-code-for'].last_part_id).toBe('2');
    expect(state.topics['3-derived-topic'].recorded['1']).toBe(false);
    expect(state.topics['4-another-topic'].recorded['1']).toBe(false);

    await page.getByRole('button',{name:'Scriptek'}).click();
    page.once('dialog',dialog=>dialog.dismiss());
    await page.locator('[data-delete="3-derived-topic"]').click();
    await expect(page.locator('#content')).toContainText('3-derived-topic');
    page.once('dialog',dialog=>dialog.accept());
    await page.locator('[data-delete="3-derived-topic"]').click();
    await expect(page.locator('#content')).not.toContainText('3-derived-topic');

    await page.locator('#scriptFile').evaluate(input=>{input.value=''});
    await page.setInputFiles('#scriptFile',{name:'invalid.md',mimeType:'text/markdown',buffer:Buffer.from('# not a tagged script')});
    await expect(page.locator('#viewerDiagnostic')).toBeVisible();
    const finalState=await page.evaluate(async()=>{const storage=await window.GombaFlowStorage.open();const value=await storage.read();storage.close();return value});
    expect(finalState.topics['2-unlimited-claude-code-for'].recorded['1']).toBe(true);
    expect(Object.hasOwn(finalState.topics,'3-derived-topic')).toBe(false);
    expect(Object.hasOwn(finalState.topics,'4-another-topic')).toBe(true);

  } finally {
    await server.close();
  }
});

test('keeps the reader and last acknowledged state when an IndexedDB write fails', async ({page}) => {
  const server=await startPwaServer();
  try {
    await page.goto(server.url);
    await page.setInputFiles('#scriptFile',{name:'claude.md',mimeType:'text/markdown',buffer:Buffer.from(script)});
    await page.getByLabel('Felvéve',{exact:true}).click();
    await expect(page.locator('#partInfo')).toHaveText(/^#2 - /);
    await page.evaluate(()=>{
      const put=IDBObjectStore.prototype.put;
      window.restoreStorePut=()=>{IDBObjectStore.prototype.put=put};
      IDBObjectStore.prototype.put=function(...args){
        if(this.name==='library')throw new DOMException('Simulated storage failure','QuotaExceededError');
        return put.apply(this,args);
      };
    });
    await page.getByLabel('Felvéve',{exact:true}).check();
    await expect(page.locator('#viewerDiagnostic')).toBeVisible();
    await expect(page.getByLabel('Felvéve',{exact:true})).not.toBeChecked();
    const state=await page.evaluate(async()=>{window.restoreStorePut();const storage=await window.GombaFlowStorage.open();const value=await storage.read();storage.close();return value});
    expect(state.topics['2-unlimited-claude-code-for'].recorded['1']).toBe(true);
    expect(state.topics['2-unlimited-claude-code-for'].recorded['2']).toBe(false);
  } finally {
    await server.close();
  }
});

test('deleting the active topic returns to an empty library', async ({page}) => {
  const server=await startPwaServer();
  try {
    await page.goto(server.url);
    await page.setInputFiles('#scriptFile',{name:'claude.md',mimeType:'text/markdown',buffer:Buffer.from(script)});
    await page.getByRole('button',{name:'Scriptek'}).click();
    page.once('dialog',dialog=>dialog.accept());
    await page.locator('[data-delete="2-unlimited-claude-code-for"]').click();
    await expect(page.getByRole('heading',{name:'Scriptek'})).toBeVisible();
    await expect(page.locator('#content')).toContainText('Nincs mentett script');
    const state=await page.evaluate(async()=>{const storage=await window.GombaFlowStorage.open();const value=await storage.read();storage.close();return value});
    expect(state.topics).toEqual({});
    expect(state.last_topic_id).toBe(null);
  } finally {
    await server.close();
  }
});

test('restores collapsed bars and saves reopening them', async ({page}) => {
  const server=await startPwaServer();
  try {
  await page.setViewportSize({width:390,height:844});
  await page.goto(server.url);
  await page.setInputFiles('#scriptFile',{name:'claude.md',mimeType:'text/markdown',buffer:Buffer.from(script)});
  const next = page.getByRole('button', {name:'Következő rész'});
  for (const id of [2, 3, 4]) {
    await next.click();
    await expect(page.locator('#partInfo')).toHaveText(new RegExp('^#' + id + ' - '));
  }
  await expect(page.locator('#partInfo')).toHaveText('#4 - C2 — Előtte és utána · b-roll · Helyszín A OFFLINE · MENTETT');
  await expect(page.locator('#partInfo > #partDetails + .sample')).toBeVisible();
  await next.click();
  await expect(page.locator('#partInfo')).toHaveText(/^#5 - /);
  const part5Font=await page.locator('#partInfo').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  await page.getByRole('button',{name:'Következő rész'}).click();
  await expect(page.locator('#partInfo')).toHaveText(/^#6 - /);
  const part6Font=await page.locator('#partInfo').evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
  expect(part6Font).toBe(part5Font);
  expect(part6Font).toBe(15);
  await page.getByRole('button',{name:'Felső sáv váltása'}).click();
  await expect.poll(async()=>page.evaluate(async()=>{const storage=await window.GombaFlowStorage.open();const state=await storage.read();storage.close();return state.preferences.topCollapsed})).toBe(true);
  await page.getByRole('button',{name:'Alsó sáv váltása'}).click();
  await expect.poll(async()=>page.evaluate(async()=>{const storage=await window.GombaFlowStorage.open();const state=await storage.read();storage.close();return state.preferences.topCollapsed})).toBe(true);
  await expect.poll(async()=>page.evaluate(async()=>{const storage=await window.GombaFlowStorage.open();const state=await storage.read();storage.close();return state.preferences.bottomCollapsed})).toBe(true);
  await page.reload();
  await expect(page.locator('.top')).toBeHidden();
  await expect(page.locator('.bottom')).toBeHidden();
  await expect(page.locator('#partInfo')).toHaveText(/^#6 - /);
  await expect(page.locator('#partInfo')).toBeVisible();
  const partInfoBeforeScroll = await page.locator('#partInfo').boundingBox();
  await expect(page.locator('#cue')).toBeVisible();
  const cueAndReader=await page.evaluate(()=>{
    const cue=document.querySelector('.cuebar').getBoundingClientRect();
    const reader=document.querySelector('#content').getBoundingClientRect();
    return {cueBottom:cue.bottom,readerTop:reader.top,cueTop:cue.top};
  });
  expect(cueAndReader.cueBottom).toBeLessThanOrEqual(cueAndReader.readerTop);
  await page.locator('#content').evaluate(el=>{el.scrollTop=el.scrollHeight;});
  expect(await page.locator('#content').evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  expect((await page.locator('.cuebar').boundingBox()).y).toBe(cueAndReader.cueTop);
  expect(await page.locator('#partInfo').boundingBox()).toEqual(partInfoBeforeScroll);
  await page.getByRole('button',{name:'Felső sáv váltása'}).click();
  await expect.poll(async()=>page.evaluate(async()=>{const storage=await window.GombaFlowStorage.open();const state=await storage.read();storage.close();return state.preferences.topCollapsed})).toBe(false);
  const dashboardSizes=await page.evaluate(()=>[
    getComputedStyle(document.querySelector('.top')).fontSize,
    getComputedStyle(document.querySelector('.bottom')).fontSize,
    getComputedStyle(document.querySelector('.top button')).fontFamily,
    getComputedStyle(document.querySelector('.bottom input')).fontFamily,
  ]);
  expect(dashboardSizes[0]).toBe(dashboardSizes[1]);
  expect(dashboardSizes[2]).toBe(dashboardSizes[3]);
  expect(parseFloat(dashboardSizes[0])).toBeLessThan(16);
  const check=await page.locator('#record').boundingBox();
  const topToggle=await page.getByRole('button',{name:'Felső sáv váltása'}).boundingBox();
  expect(check.width).toBeLessThan(44);
  expect(check.x+check.width).toBeGreaterThan(360);
  expect(check.y+check.height).toBeLessThan(topToggle.y);
  await page.getByRole('button', { name: /Tartalomtípusok/ }).click();
  const typesStyle = await page.evaluate(() => ({
    fontSize: parseFloat(getComputedStyle(document.querySelector('.sheet')).fontSize),
    closeFontSize: parseFloat(getComputedStyle(document.getElementById('closeSheet')).fontSize),
    closeRightHit: (() => {
      const close = document.getElementById('closeSheet');
      const rect = close.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.right - 12, rect.bottom - 12);
      return hit === close || close.contains(hit);
    })(),
  }));
  expect(typesStyle.fontSize).toBeLessThan(16);
  expect(typesStyle.closeFontSize).toBeLessThan(16);
  expect(typesStyle.closeRightHit).toBe(true);
  await page.getByRole('button', { name: 'Bezárás' }).click();
  await page.getByRole('button',{name:'Alsó sáv váltása'}).click();
  await expect.poll(async()=>page.evaluate(async()=>{const storage=await window.GombaFlowStorage.open();const state=await storage.read();storage.close();return state.preferences.bottomCollapsed})).toBe(false);
  await page.reload();
  await expect(page.locator('.top')).toBeVisible();
  await expect(page.locator('.bottom')).toBeVisible();
  await expect(page.locator('#record')).toBeVisible();
  } finally {
    await server.close();
  }
});

test('exchange recording checkmarks through JSON files', async ({ page }) => {
  const server = await startPwaServer();
  try {
    await page.goto(server.url);
    await page.locator('#scriptFile').setInputFiles({ name: 'claude.md', mimeType: 'text/markdown', buffer: Buffer.from(script) });
    await expect(page.locator('#partInfo')).toHaveText(/^#1 - /);
    await page.locator('#scriptFile').evaluate(input => { input.value = ''; });
    const derived = script.replace('2-unlimited-claude-code-for', '3-derived-topic').replaceAll('timeline 2 script', 'timeline 3 script');
    await page.locator('#scriptFile').setInputFiles({ name: 'derived.md', mimeType: 'text/markdown', buffer: Buffer.from(derived) });
    await page.getByRole('button', { name: 'Scriptek' }).click();
    await page.locator('[data-open="2-unlimited-claude-code-for"]').click();
    const beforeImport = await page.evaluate(async () => {
      const storage = await window.GombaFlowStorage.open(); const state = await storage.read(); storage.close();
      return { preferences: state.preferences, topicIds: Object.keys(state.topics).sort() };
    });
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Pipák exportja' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^2-unlimited-claude-code-for-.*\.json$/);
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const exported = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    expect(exported).toMatchObject({ schema_version: 1, topic_id: '2-unlimited-claude-code-for' });
    expect(exported.exported_at).toMatch(/^\d{4}-\d\d-\d\dT.*\.\d{3}Z$/);
    expect(Object.keys(exported.recorded)).toHaveLength(16);
    expect(Object.values(exported.recorded)).toEqual(Array(16).fill(false));

    await page.getByLabel('Felvéve', { exact: true }).check();
    const incoming = { ...exported, recorded: { ...exported.recorded, '1': false, '2': true } };
    let accepted = false;
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain(exported.exported_at);
      if (accepted) await dialog.accept(); else await dialog.dismiss();
    });
    const file = { name: 'checks.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(incoming)) };
    await page.locator('#checkmarkFile').setInputFiles(file);
    await expect(page.getByLabel('Felvéve', { exact: true })).toBeChecked();
    accepted = true;
    await page.locator('#checkmarkFile').setInputFiles(file);
    const recordedChecks = () => page.evaluate(async () => {
      const storage = await window.GombaFlowStorage.open();
      const state = await storage.read(); storage.close();
      return { status: state.preferences.status, checks: state.topics['2-unlimited-claude-code-for'].recorded };
    });
    await expect.poll(async () => (await recordedChecks()).checks).toMatchObject({ '1': true, '2': true });
    expect(await page.evaluate(async () => {
      const storage = await window.GombaFlowStorage.open(); const state = await storage.read(); storage.close();
      return { preferences: state.preferences, topicIds: Object.keys(state.topics).sort() };
    })).toEqual(beforeImport);
    await page.locator('#status').selectOption('all');
    await expect.poll(async () => (await recordedChecks()).status).toBe('all');
    await page.reload();
    await expect(page.locator('#status')).toHaveValue('all');
    await expect.poll(async () => (await recordedChecks()).checks).toMatchObject({ '1': true, '2': true });
    await page.getByRole('button', { name: 'Pipák importja' }).click();
    await page.locator('#checkmarkFile').setInputFiles({
      name: 'invalid.json', mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ ...incoming, recorded: { '999': true } })),
    });
    await expect(page.locator('#viewerDiagnostic')).toBeVisible();
  } finally {
    await server.close();
  }
});
