const assert = require('node:assert/strict');
const test = require('node:test');
const vm = require('node:vm');
const { buildViewer } = require('../tools/build.mjs');

const htmlSource = '<!doctype html><html><head></head><body><script>window.viewer = true;</script></body></html>';
const coreSource = 'globalThis.Core = { ready: true };';

test('build output is deterministic for the same inputs', () => {
  assert.equal(buildViewer({ htmlSource, coreSource }), buildViewer({ htmlSource, coreSource }));
});

test('escapes script-end text before embedding HTML and core source', () => {
  const output = buildViewer({
    htmlSource: `${htmlSource}<p>user text: </script><script>throw new Error("injected")</script></p>`,
    coreSource: 'globalThis.value = "</script><script>bad()</script>";',
  });
  assert.doesNotMatch(output, /<\/script/i);
  assert.match(output, /\\u003c\/script>/);
});

test('emits syntactically valid standalone JavaScript with the minimal Scriptable shell', () => {
  const output = buildViewer({ htmlSource, coreSource });
  assert.match(output, /new WebView\(\)/);
  assert.match(output, /loadHTML/);
  assert.match(output, /present\(true\)/);
  assert.doesNotThrow(() => new (Object.getPrototypeOf(async function(){}).constructor)(output));
});

test('generated program restores offline state through a Scriptable bridge', async () => {
 const fs=require('node:fs'),path=require('node:path');
 const events=[],files=new Map();let loaded='';
 const fixture=fs.readFileSync(path.join(__dirname,'fixtures/999-viewer-fixture.md'),'utf8');
 const WebView=class {
  async loadHTML(html){events.push('load');loaded=html;}
  async present(fullscreen){events.push('present:'+fullscreen);}
  async evaluateJavaScript(source,useCallback){events.push('evaluate');return useCallback?JSON.stringify({viewport:[390,844]}):'null';}
 };
 const fm={documentsDirectory:()=>'/test',joinPath:(a,b)=>a+'/'+b,fileExists:p=>files.has(p),writeString:(p,v)=>{if(!p.endsWith('GombaFlowViewer-debug.txt'))events.push(p.endsWith('.md')?'write-md':'write-state');files.set(p,v)},readString:p=>{events.push('read');return p==='/input.md'?fixture:files.get(p)},remove:p=>files.delete(p),move:(a,b)=>{files.set(b,files.get(a));files.delete(a)}};
 const output=buildViewer({htmlSource,coreSource:fs.readFileSync(path.join(__dirname,'../core.js'),'utf8'),hostSource:fs.readFileSync(path.join(__dirname,'../ScriptViewer.js'),'utf8')});
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 await new AsyncFunction('WebView','FileManager','DocumentPicker','Alert','Timer',output)(WebView,{local:()=>fm},{open:async()=>{events.push('pick');return ['/input.md']}},class { constructor(){assert.fail('unexpected native error')} },{schedule:(ms,repeats,callback)=>{const handle=setTimeout(callback,ms);return {invalidate:()=>clearTimeout(handle)}}});
 assert.deepEqual(events,['pick','read','write-md','write-state','read','load','evaluate','present:true','evaluate']);
 assert.ok(loaded.includes('initialViewerData'));
 assert.ok(loaded.includes('viewerHost'));
 const log=files.get('/test/GombaFlowViewer-debug.txt');
 assert.ok(log && log.includes('Offline viewer N5'), 'startup replaces stale debugger output');
 assert.match(log,/HTML betöltve/);
 assert.match(log,/\[\d+ ms\] Host indítása/);
 assert.match(log,/\[\d+ ms\] Core és host betöltve/);
 assert.match(log,/Olvasó állapota:/);
 assert.match(log,/Néző bezárva/);
});

test('uses the Scriptable Timer API for bridge waits without requiring setTimeout', () => {
 const output=buildViewer({htmlSource,coreSource,hostSource:''});
 assert.match(output,/Timer\.schedule\(120, false/);
 assert.doesNotMatch(output,/setTimeout\(resolve,\s*120\)/);
});
