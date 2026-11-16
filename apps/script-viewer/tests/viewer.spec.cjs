const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const root = path.resolve(__dirname, '../../..');
const html = fs.readFileSync(path.join(__dirname, '../viewer.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'local-workflows/script-and-cut-workflows/gombaFlow/projects/2-unlimited-claude-code-for/3-script.md'), 'utf8');
const core = fs.readFileSync(path.join(__dirname, '../core.js'), 'utf8');

test('filter and read a recording script', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(({ script, core }) => { window.__viewerHost = { script, core }; }, { script, core });
  await page.setContent(html.replace('/* CORE_SOURCE */', () => core));
  await page.evaluate(script => window.viewerOpen(script), script);
  await expect(page.locator('#content .title')).toBeVisible();
  await expect(page.locator('#content .title')).toContainText('Felvehető rész — 1');
  await page.getByLabel('Fejezet').selectOption({ label: 'C4 — Megvalósítás' });
  await page.getByLabel('Felvétel típusa').selectOption({ label: 'b-roll' });
  await page.getByLabel('Helyszín').selectOption({ label: 'Helyszín B' });
  await page.getByLabel('Felvételi állapot').selectOption({ label: 'Nincs felvéve' });
  await page.getByRole('button', { name: /Tartalomtípusok/ }).click();
  await page.getByLabel('Képernyő-akció').uncheck();
  await page.getByRole('button', { name: 'Bezárás' }).click();
  await page.getByLabel('Keresés a narrációban').fill('gomba-gemma');
  await expect(page.locator('#results .result')).toHaveCount(0);
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
  await page.evaluate(() => scrollTo(0,document.body.scrollHeight));
  expect((await page.locator('.top').boundingBox()).y).toBe(0);
  const footer=await page.locator('.bottom').boundingBox();
  expect(Math.round(footer.y+footer.height)).toBe(844);
  await expect(page.locator('#content')).not.toContainText('const greeting');
  for (const route of ['button', 'swipe', 'picker', 'record']) {
    await test.step('new part starts below pinned header: '+route, async () => {
      await page.getByLabel('Keresés a narrációban').fill('');
      await page.getByLabel('Felvételi állapot').selectOption(route==='record'?'no':'all');
      await page.getByLabel('Keresés a narrációban').focus();
      await page.locator('#results [data-id="7"]').click();
      await page.evaluate(() => scrollTo(0,document.body.scrollHeight));
      expect(await page.evaluate(() => scrollY)).toBeGreaterThan(300);
      expect((await page.locator('#content .title').boundingBox()).y).toBeLessThan(0);
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
      await expect(page.locator('#content .title')).toContainText('Felvehető rész — 8');
      const title=await page.locator('#content .title').boundingBox();
      const top=await page.locator('.top').boundingBox();
      const bottom=await page.locator('.bottom').boundingBox();
      expect(title.y).toBeGreaterThanOrEqual(top.y+top.height);
      expect(title.y+title.height).toBeLessThanOrEqual(bottom.y);
    });
  }

});

test('shows browser failures on screen for diagnosis', async ({page}) => {
  await page.setContent(html.replace('/* CORE_SOURCE */', () => core));
  await page.evaluate(() => window.dispatchEvent(new ErrorEvent('error', {message:'diagnostic test failure', filename:'viewer', lineno:42})));
  await expect(page.locator('#viewerDiagnostic')).toBeVisible();
  await expect(page.locator('#viewerDiagnostic')).toContainText('diagnostic test failure');
  await expect(page.locator('#viewerDiagnostic')).toContainText('42');
});


test('generated Scriptable program opens selected MD before presenting fullscreen', async ({page}) => {
  const {buildViewer}=await import('../tools/build.mjs');
  let close;
  const shown=new Promise(resolve=>{close=resolve});
  const nativeCalls=[];
  const WebView=class {
    async loadHTML(document){nativeCalls.push('load');await page.setContent(document);}
    present(fullscreen){nativeCalls.push('present');expect(fullscreen).toBe(true);return shown;}
    evaluateJavaScript(){throw Error('Unexpected native JavaScript bridge');}
  };
  const source=buildViewer({htmlSource:html,coreSource:core,hostSource:fs.readFileSync(path.join(__dirname,'../ScriptViewer.js'),'utf8')});
  const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
  const running=new AsyncFunction('WebView','DocumentPicker','FileManager','Alert',source)(
    WebView,
    {open:async()=>{nativeCalls.push('pick');return ['/local/input.md']}},
    {local:()=>({readString:()=>{nativeCalls.push('read');return script}})},
    class {constructor(){throw Error('Unexpected native error alert')}}
  );
  try {
    await expect(page.locator('#cue')).toContainText('script 1 serpenyő');
    await expect.poll(()=>nativeCalls).toEqual(['pick','read','load','present']);
    await page.getByLabel('Felvéve',{exact:true}).click();
    await expect(page.locator('#cue')).toContainText('script 2 serpenyő');
  } finally {close();await running;}
});
