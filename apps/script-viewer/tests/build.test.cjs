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
  assert.match(output, /present\(\)/);
  assert.doesNotThrow(() => new vm.Script(output));
});
