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

test('generated program selects the separate MD before presenting the reader without a live bridge', async () => {
 const fs=require('node:fs'),path=require('node:path');
 const events=[];let loaded='';
 const fixture=fs.readFileSync(path.join(__dirname,'fixtures/999-viewer-fixture.md'),'utf8');
 const WebView=class {
  async loadHTML(html){events.push('load');loaded=html;}
  async present(fullscreen){events.push('present:'+fullscreen);}
  async evaluateJavaScript(){events.push('evaluate');return JSON.stringify({ready:true});}
 };
 const output=buildViewer({htmlSource,coreSource:fs.readFileSync(path.join(__dirname,'../core.js'),'utf8'),hostSource:fs.readFileSync(path.join(__dirname,'../ScriptViewer.js'),'utf8')});
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 await new AsyncFunction('WebView','FileManager','DocumentPicker','Alert',output)(
  WebView,{local:()=>({documentsDirectory:()=>'/test',joinPath:(a,b)=>a+'/'+b,writeString:()=>{},readString:()=>{events.push('read');return fixture}})},
  {open:async()=>{events.push('pick');return ['/input.md']}},class { constructor(){assert.fail('unexpected native error')} }
 );
 assert.deepEqual(events,['pick','read','load','present:true']);
 assert.ok(loaded.includes('initialMarkdown'));
});
