const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const core = require('../core.js');
const fixture = fs.readFileSync(path.join(__dirname, 'fixtures/999-viewer-fixture.md'), 'utf8');
function runtime() {
 const context = {module:{exports:{}},core};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../ScriptViewer.js'),'utf8'), context);
 return context.module.exports;
}
test('selects, reads and validates MD before opening the reader', async () => {
 const events=[];
 assert.equal(typeof runtime().runViewer,'function');
 await runtime().runViewer({pick:async()=>{events.push('pick');return '/input.md'},read:async()=>{events.push('read');return fixture},render:async markdown=>{events.push('render');assert.equal(markdown,fixture)},showError:async()=>assert.fail('valid input rejected')});
 assert.deepEqual(events,['pick','read','render']);
});
test('cancelled selection opens no reader and reads no file', async () => {
 await runtime().runViewer({pick:async()=>null,read:()=>assert.fail('read'),render:()=>assert.fail('render'),showError:()=>assert.fail('error')});
});
test('invalid legacy MD and file errors are visible before opening the reader', async () => {
 for(const failure of ['legacy','read']) {
  let message;
  await runtime().runViewer({pick:async()=>'/input.md',read:async()=>{if(failure==='read')throw Error('read failed');return 'legacy text'},render:()=>assert.fail('invalid input rendered'),showError:async error=>{message=error}});
  assert.match(message,failure==='read'?/read failed/:/metadata/);
 }
});

test('offline library restores the last script and cursor without opening the picker', async () => {
 const { createLibrary } = runtime();
 const files = new Map();
 const adapter = {
  readState: async () => files.get('state') || null,
  writeState: async value => { files.set('state', structuredClone(value)); },
  readScript: async name => files.get(name),
  writeScript: async (name, value) => { files.set(name, value); },
  deleteScript: async name => { files.delete(name); },
 };
 const library = await createLibrary(adapter, core);
 await library.openMarkdown(fixture);
 await library.update({type:'record', topicId:'999-viewer-fixture', id:'401', value:true});
 await library.update({type:'cursor', topicId:'999-viewer-fixture', id:'401'});
 const resumed = await createLibrary(adapter, core);
 assert.equal(resumed.current.topicId, '999-viewer-fixture');
 assert.equal(resumed.current.partId, '401');
 assert.equal(resumed.current.recorded['401'], true);
 assert.equal(resumed.needsPicker, false);
});

test('offline library serializes acknowledged writes and preserves state on failure', async () => {
 const { createLibrary } = runtime();
 let state=null, writing=false, calls=0, failState=false;
 const adapter = {
  readState: async () => state,
  writeState: async value => { assert.equal(writing,false); writing=true; await new Promise(r=>setTimeout(r,2)); if(failState) { writing=false; throw Error('disk full'); } state=structuredClone(value); writing=false; calls++; },
  readScript: async () => fixture,
  writeScript: async () => {},
  deleteScript: async () => {},
 };
 const library=await createLibrary(adapter,core);
 await library.openMarkdown(fixture);
 const results=await Promise.all([
  library.update({type:'record',topicId:'999-viewer-fixture',id:'401',value:true}),
  library.update({type:'preferences',value:{search:'gomba'}}),
 ]);
 assert.deepEqual(results.map(x=>x.ok),[true,true]);
 const committed=structuredClone(state);
 failState=true;
 await assert.rejects(library.update({type:'record',topicId:'999-viewer-fixture',id:'402',value:true}),/disk full/);
 assert.deepEqual(state,committed);
 assert.equal(library.current.recorded['402'],false);
 assert.equal(calls,3);
});

test('offline library rejects invalid saved state without overwriting it and deletes only the confirmed topic', async () => {
 const { createLibrary } = runtime();
 const original={schema_version:22,topics:{},preferences:{},last_topic_id:null};
 let state=structuredClone(original); const files=new Map();
 const adapter={readState:async()=>state,writeState:async value=>{state=structuredClone(value)},readScript:async name=>files.get(name),writeScript:async(name,value)=>files.set(name,value),deleteScript:async name=>files.delete(name)};
 await assert.rejects(createLibrary(adapter,core),/unsupported|invalid/i);
 assert.deepEqual(state,original);
 state=null;
 const library=await createLibrary(adapter,core);
 await library.openMarkdown(fixture);
 await library.update({type:'delete',topicId:'999-viewer-fixture',confirmed:false});
 assert.ok(files.has('topic-999-viewer-fixture.md'));
 await library.update({type:'delete',topicId:'999-viewer-fixture',confirmed:true});
 assert.equal(files.has('topic-999-viewer-fixture.md'),false);
 assert.equal(state.last_topic_id,null);
});
