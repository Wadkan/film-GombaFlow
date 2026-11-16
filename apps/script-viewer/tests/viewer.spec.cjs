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


test('generated Scriptable program restores its offline library before presenting fullscreen', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  const {buildViewer}=await import('../tools/build.mjs');
  let close;
  const shown=new Promise(resolve=>{close=resolve});
  const nativeCalls=[],nativeAlerts=[];
  const WebView=class {
    async loadHTML(document){nativeCalls.push('load');await page.setContent(document);}
    present(fullscreen){nativeCalls.push('present');expect(fullscreen).toBe(true);return shown;}
    async evaluateJavaScript(source,useCallback){
      if(useCallback)throw Error('Native presentation must not wait on a browser callback');
      if(source.includes('__gombaNextAction')){nativeCalls.push('poll');return page.evaluate(()=>JSON.stringify(window.__gombaQueue.shift()||null));}
      if(source.includes('__gombaResolve')){nativeCalls.push('resolve');const args=source.slice(source.indexOf('(')+1,source.lastIndexOf(')'));const split=args.indexOf(',');const id=JSON.parse(args.slice(0,split)),value=JSON.parse(args.slice(split+1));return page.evaluate(({id,value})=>window.__gombaResolve(id,value),{id,value});}
      if(source.startsWith('JSON.stringify({diagnostic:'))return page.evaluate(code=>(0,eval)(code),source);
      throw Error('Unexpected bridge call: '+source);
    }
  };
  const source=buildViewer({htmlSource:html,coreSource:core,hostSource:fs.readFileSync(path.join(__dirname,'../ScriptViewer.js'),'utf8')});
  const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
  const Timer={schedule:(ms,repeats,callback)=>{const handle=setTimeout(callback,ms);return {invalidate:()=>clearTimeout(handle)}}};
  const running=new AsyncFunction('WebView','DocumentPicker','FileManager','Alert','Timer',source)(
    WebView,
    {open:async()=>{nativeCalls.push('pick');return ['/local/input.md']}},
    {local:()=>({documentsDirectory:()=>'/local',joinPath:(a,b)=>a+'/'+b,fileExists:()=>false,readString:()=>{nativeCalls.push('read');return script},writeString:p=>{if(!p.endsWith('GombaFlowViewer-debug.txt'))nativeCalls.push('write')},remove:()=>{},move:()=>{}})},
    class {constructor(){this.message='';nativeAlerts.push(this)}addAction(){}addCancelAction(){}async presentAlert(){return 1}},
    Timer
  );
  try {
    await expect(page.locator('#cue')).toContainText('script 1 serpenyő');
    expect(nativeAlerts).toHaveLength(0);
    await expect.poll(()=>nativeCalls.slice(0,5)).toEqual(['pick','read','write','write','read']);
    await expect.poll(()=>nativeCalls).toContain('present');
    await expect.poll(()=>nativeCalls).toContain('poll');
    await page.getByLabel('Felvéve',{exact:true}).click();
    await expect(page.locator('#cue')).toContainText('script 2 serpenyő');
  } finally {close();await running;}
});

test('record parts and resume the offline library', async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  const fixture=fs.readFileSync(path.join(__dirname,'fixtures/999-viewer-fixture.md'),'utf8');
  const parsed=require('../core.js').parseScript(fixture);
  let state={schema_version:1,topics:{[parsed.topicId]:{md_file:'fixture.md',recorded:Object.fromEntries(parsed.parts.map(p=>[String(p.id),false])),last_part_id:'401'}},preferences:{chapter:'all',clip:'all',location:'all',status:'not-recorded',types:{narration:true,screen:true,note:true},search:''},last_topic_id:parsed.topicId};
  const open=async()=>{
    await page.setContent(html.replace('/* CORE_SOURCE */',()=>core));
    await page.evaluate(({script,state})=>{
      window.__sharedLibrary={state};
      window.viewerHost={send:async action=>{
        const saved=window.__sharedLibrary.state;
        if(action.type==='record') saved.topics[action.topicId].recorded[action.id]=action.value;
        if(action.type==='cursor') saved.topics[action.topicId].last_part_id=String(action.id);
        if(action.type==='preferences') saved.preferences={...saved.preferences,...action.value};
        return {ok:true,state:saved};
      }};
      const saved=state.topics[state.last_topic_id];
      window.viewerOpen(script,{topicId:state.last_topic_id,partId:saved.last_part_id,recorded:saved.recorded,preferences:state.preferences});
    },{script:fixture,state});
  };
  await open();
  await expect(page.locator('#content .title')).toContainText('Felvehető rész — 401');
  await page.getByLabel('Felvéve',{exact:true}).click();
  await expect(page.locator('#cue')).toContainText('#402');
  state=await page.evaluate(()=>window.__sharedLibrary.state);
  expect(state.topics[parsed.topicId].recorded['401']).toBe(true);
  await open();
  await expect(page.locator('#content .title')).toContainText('Felvehető rész — 402');
  state=await page.evaluate(()=>window.__sharedLibrary.state);
  expect(state.topics[parsed.topicId].last_part_id).toBe('402');
});

test('restores collapsed bars and saves reopening them', async ({page}) => {
  let preferences={chapter:'all',clip:'all',location:'all',status:'all',search:'',types:{narration:true,screen:true,note:true}};
  await page.exposeFunction('persistBars', action=>{preferences={...preferences,...action.value};return {ok:true};});
  const launch=async()=>{
    await page.goto('about:blank');
    await page.setContent(html.replace('/* CORE_SOURCE */',()=>core));
    await page.evaluate(({script,preferences})=>{window.viewerHost={send:window.persistBars};window.viewerOpen(script,{preferences});},{script,preferences});
  };
  await launch();
  await page.getByRole('button',{name:'Felső sáv elrejtése'}).click();
  await page.getByRole('button',{name:'Alsó sáv elrejtése'}).click();
  await expect.poll(()=>preferences.topCollapsed).toBe(true);
  await expect.poll(()=>preferences.bottomCollapsed).toBe(true);
  await launch();
  await expect(page.locator('.top')).toBeHidden();
  await expect(page.locator('.bottom')).toBeHidden();
  await page.getByRole('button',{name:'Felső sáv megjelenítése'}).click();
  await page.getByRole('button',{name:'Alsó sáv megjelenítése'}).click();
  await expect.poll(()=>preferences.topCollapsed).toBe(false);
  await expect.poll(()=>preferences.bottomCollapsed).toBe(false);
  await launch();
  await expect(page.locator('.top')).toBeVisible();
  await expect(page.locator('.bottom')).toBeVisible();
});
