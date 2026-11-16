const fs = require('node:fs');
const fsp = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');


async function startPwaServer() {
  const { buildPwa } = await import('../../tools/build-pwa.mjs');
  const buildDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'gombaflow-pwa-http-'));
  const sourceDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'gombaflow-pwa-source-'));
  const appDir = path.resolve(__dirname, '../..');
  const sourceNames = ['viewer.html', 'core.js', 'storage.js', 'progress.js', 'pwa.js', 'manifest.webmanifest', 'app-icon.svg', 'app-icon-192.png', 'app-icon-512.png', 'apple-touch-icon.png', 'sw.js'];
  for (const name of sourceNames) await fsp.copyFile(path.join(appDir, name), path.join(sourceDir, name));
  await buildPwa({ outputDir: buildDir });
  let failAsset = null;
  let failedAssetRequests = 0;
  const allowed = new Set(['index.html', 'storage.js', 'progress.js', 'pwa.js', 'manifest.webmanifest', 'app-icon.svg', 'app-icon-192.png', 'app-icon-512.png', 'apple-touch-icon.png', 'sw.js']);
  const server = http.createServer((request, response) => {
    const pathName = new URL(request.url, 'http://127.0.0.1').pathname;
    const filename = pathName === '/' ? 'index.html' : pathName.slice(1);
    if (filename === failAsset) {
      failedAssetRequests++;
      response.writeHead(503);
      response.end('Simulated incomplete update');
      return;
    }
    if (!allowed.has(filename)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    const file = path.join(buildDir, filename);
    const contentType = filename.endsWith('.html') ? 'text/html; charset=utf-8'
      : filename.endsWith('.webmanifest') ? 'application/manifest+json'
        : filename.endsWith('.svg') ? 'image/svg+xml'
          : filename.endsWith('.png') ? 'image/png'
          : filename.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'application/octet-stream';
    response.writeHead(200, { 'content-type': contentType });
    response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}/`,
    setFailAsset: name => { failAsset = name; },
    get failedAssetRequests() { return failedAssetRequests; },
    update: async ({ editSource, failAsset: failing } = {}) => {
      for (const name of sourceNames) await fsp.copyFile(path.join(appDir, name), path.join(sourceDir, name));
      if (editSource) await editSource(sourceDir);
      await buildPwa({ appDir: sourceDir, outputDir: buildDir });
      failAsset = failing || null;
    },
    close: async () => {
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
      await fsp.rm(buildDir, { recursive: true, force: true });
      await fsp.rm(sourceDir, { recursive: true, force: true });
    },
  };
}

module.exports = { startPwaServer };
