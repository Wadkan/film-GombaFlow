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
