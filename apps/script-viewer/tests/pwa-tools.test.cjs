const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const assert = require('node:assert/strict');

const builderPromise = import('../tools/build-pwa.mjs').catch(() => ({}));

test('builds a program-only browser app with runtime imports', async () => {
  const builderModule = await builderPromise;
  assert.equal(typeof builderModule.buildPwa, 'function', 'browser build tool exports buildPwa');
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gombaflow-pwa-build-'));
  try {
    const outputDir = path.join(tempDir, 'site');
    await builderModule.buildPwa({ outputDir });
    const files = (await fs.readdir(outputDir)).sort();
    assert.deepEqual(files, ['index.html', 'pwa.js', 'storage.js']);
    const html = await fs.readFile(path.join(outputDir, 'index.html'), 'utf8');
    assert.match(html, /<script src="\/storage\.js"><\/script>/);
    assert.match(html, /<script src="\/pwa\.js"><\/script>/);
    assert.doesNotMatch(html, /\/\* CORE_SOURCE \*\//);
    assert.doesNotMatch(html, /2-unlimited-claude-code-for|Felvehető rész — 1/);
    assert.equal(await fs.readFile(path.join(outputDir, 'storage.js'), 'utf8'), await fs.readFile(path.join(__dirname, '../storage.js'), 'utf8'));
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});

test('fails clearly when an allowlisted program input is missing', async () => {
  const builderModule = await builderPromise;
  assert.equal(typeof builderModule.buildPwa, 'function', 'browser build tool exports buildPwa');
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gombaflow-pwa-missing-'));
  try {
    await assert.rejects(
      builderModule.buildPwa({ appDir: tempDir, outputDir: path.join(tempDir, 'site') }),
      /Required PWA source is missing: viewer\.html/
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
