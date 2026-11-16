const fs = require('node:fs');
const fsp = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');


async function startPwaServer() {
  const { buildPwa } = await import('../../tools/build-pwa.mjs');
  const buildDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'gombaflow-pwa-http-'));
  await buildPwa({ outputDir: buildDir });
  const server = http.createServer((request, response) => {
    const pathName = new URL(request.url, 'http://127.0.0.1').pathname;
    const filename = pathName === '/' ? 'index.html' : pathName.slice(1);
    if (!['index.html', 'storage.js', 'pwa.js'].includes(filename)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }
    const file = path.join(buildDir, filename);
    response.writeHead(200, { 'content-type': filename.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/javascript; charset=utf-8' });
    response.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}/`,
    close: async () => {
      await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
      await fsp.rm(buildDir, { recursive: true, force: true });
    },
  };
}

module.exports = { startPwaServer };
