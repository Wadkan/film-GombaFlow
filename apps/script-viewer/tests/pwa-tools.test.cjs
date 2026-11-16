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
    assert.deepEqual(files, ['app-icon-192.png', 'app-icon-512.png', 'app-icon.svg', 'apple-touch-icon.png', 'index.html', 'manifest.webmanifest', 'progress.js', 'pwa.js', 'storage.js', 'sw.js']);
    const html = await fs.readFile(path.join(outputDir, 'index.html'), 'utf8');
    assert.match(html, /<script src="\/storage\.js"><\/script>/);
    assert.match(html, /<script src="\/progress\.js"><\/script>/);
    assert.match(html, /<script src="\/pwa\.js"><\/script>/);
    assert.match(html, /rel="manifest" href="\/manifest\.webmanifest"/);
    assert.match(html, /rel="apple-touch-icon" href="\/apple-touch-icon\.png"/);
    assert.doesNotMatch(html, /\/\* CORE_SOURCE \*\//);
    assert.doesNotMatch(html, /2-unlimited-claude-code-for|Felvehető rész — 1/);
    assert.equal(await fs.readFile(path.join(outputDir, 'storage.js'), 'utf8'), await fs.readFile(path.join(__dirname, '../storage.js'), 'utf8'));
    assert.equal(await fs.readFile(path.join(outputDir, 'progress.js'), 'utf8'), await fs.readFile(path.join(__dirname, '../progress.js'), 'utf8'));
    const manifest = JSON.parse(await fs.readFile(path.join(outputDir, 'manifest.webmanifest'), 'utf8'));
    assert.equal(manifest.start_url, '/');
    assert.deepEqual(manifest.icons.map(icon => [icon.src, icon.sizes]), [['/app-icon-192.png', '192x192'], ['/app-icon-512.png', '512x512']]);
    for (const [file, size] of [['app-icon-192.png', 192], ['app-icon-512.png', 512], ['apple-touch-icon.png', 180]]) {
      const png = await fs.readFile(path.join(outputDir, file));
      assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a', `${file} is a PNG`);
      assert.equal(png.readUInt32BE(16), size, `${file} has ${size}px width`);
      assert.equal(png.readUInt32BE(20), size, `${file} has ${size}px height`);
    }
    const icon = await fs.readFile(path.join(outputDir, 'app-icon.svg'), 'utf8');
    const worker = await fs.readFile(path.join(outputDir, 'sw.js'), 'utf8');
    assert.match(worker, /addAll\(/);
    for (const asset of ['/', '/index.html', '/storage.js', '/progress.js', '/pwa.js', '/manifest.webmanifest', '/app-icon.svg', '/app-icon-192.png', '/app-icon-512.png', '/apple-touch-icon.png']) {
      assert.ok(worker.includes(`'${asset}'`), `offline cache includes ${asset}`);
    }
    assert.doesNotMatch(worker, /skipWaiting/, 'new workers must wait for existing clients');
    assert.match(worker, /clients\.claim\(\)/, 'the active worker controls the initial page after precaching');
    assert.match(worker, /CACHE_NAME = CACHE_PREFIX \+ '[a-f0-9]{16}'/);
    const secondDir = path.join(tempDir, 'site-second');
    await builderModule.buildPwa({ outputDir: secondDir });
    assert.equal(await fs.readFile(path.join(secondDir, 'sw.js'), 'utf8'), worker, 'same program produces the same worker');
    assert.equal(await fs.readFile(path.join(secondDir, 'app-icon.svg'), 'utf8'), icon);
    const changedDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gombaflow-pwa-changed-'));
    try {
      for (const name of ['viewer.html', 'core.js', 'storage.js', 'progress.js', 'pwa.js', 'manifest.webmanifest', 'app-icon.svg', 'app-icon-192.png', 'app-icon-512.png', 'apple-touch-icon.png', 'sw.js']) {
        await fs.copyFile(path.join(__dirname, '..', name), path.join(changedDir, name)).catch(error => { if (error.code !== 'ENOENT') throw error; });
      }
      await fs.copyFile(path.join(__dirname, '../tools/build-pwa.mjs'), path.join(changedDir, 'build-pwa.mjs'));
      await fs.appendFile(path.join(changedDir, 'pwa.js'), '\n// changed program build\n');
      const changedOutput = path.join(tempDir, 'site-changed');
      await builderModule.buildPwa({ appDir: changedDir, outputDir: changedOutput });
      const changedWorker = await fs.readFile(path.join(changedOutput, 'sw.js'), 'utf8');
      assert.notEqual(changedWorker, worker, 'changed program content changes the cache version');
    } finally {
      await fs.rm(changedDir, { recursive: true, force: true });
    }
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
