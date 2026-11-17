import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildPwa } from './build-pwa.mjs';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tunnelName = process.env.PWA_TUNNEL || 'gombaflow-pwa';
const tunnelConfig = process.env.PWA_TUNNEL_CONFIG || path.join(os.homedir(), '.cloudflared', 'gombaflow-pwa.yml');
const hostname = process.env.PWA_HOSTNAME;
const port = 8787;
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'], ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
]);
const siteFiles = new Set(['index.html', 'storage.js', 'progress.js', 'pwa.js', 'sw.js', 'manifest.webmanifest', 'app-icon.svg', 'app-icon-192.png', 'app-icon-512.png', 'apple-touch-icon.png']);

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

async function stopChild(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill('SIGTERM');
  const stopped = await Promise.race([
    new Promise(resolve => child.once('exit', () => resolve(true))),
    new Promise(resolve => setTimeout(() => resolve(false), 1500)),
  ]);
  if (!stopped && child.exitCode === null && child.signalCode === null) {
    child.kill('SIGKILL');
    await Promise.race([new Promise(resolve => child.once('exit', resolve)), new Promise(resolve => setTimeout(resolve, 1000))]);
  }
}

async function main() {
  if (!hostname) throw new Error('Set PWA_HOSTNAME to the fixed public HTTPS hostname.');
  if (!await fs.stat(tunnelConfig).then(stat => stat.isFile()).catch(() => false)) throw new Error(`Tunnel config is missing: ${tunnelConfig}`);
  const executable = process.env.PWA_CLOUDFLARED || 'cloudflared';
  const check = spawnSync(executable, ['--version'], { stdio: 'ignore' });
  if (check.error || check.status !== 0) throw new Error(`Required tunnel tool is unavailable: ${executable}`);
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gombaflow-pwa-live-'));
  let server;
  const sockets = new Set();
  let child;
  let stopping = false;
  let resolveStop;
  const stopPromise = new Promise(resolve => { resolveStop = resolve; });
  const cleanup = async code => {
    if (stopping) return stopPromise;
    stopping = true;
    const closed = server ? new Promise(resolve => server.close(resolve)) : Promise.resolve();
    for (const socket of sockets) socket.destroy();
    await Promise.all([closed, stopChild(child)]);
    await fs.rm(outputDir, { recursive: true, force: true });
    process.exitCode = code;
    resolveStop();
  };
  try { await buildPwa({ appDir, outputDir }); }
  catch (error) { await fs.rm(outputDir, { recursive: true, force: true }); throw error; }
  server = http.createServer(async (request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname); }
    catch { response.writeHead(400).end(); return; }
    if (pathname === '/') pathname = '/index.html';
    const name = pathname.slice(1);
    if (!siteFiles.has(name)) { response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found'); return; }
    try {
      const body = await fs.readFile(path.join(outputDir, name));
      response.writeHead(200, { 'content-type': contentTypes.get(path.extname(name)) || 'application/octet-stream', 'x-content-type-options': 'nosniff' });
      response.end(body);
    } catch { response.writeHead(404).end(); }
  });
  server.on('connection', socket => {
    sockets.add(socket);
    socket.once('close', () => sockets.delete(socket));
  });
  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', resolve);
    });
  } catch (error) {
    await fs.rm(outputDir, { recursive: true, force: true });
    throw error;
  }
  child = spawn(executable, ['tunnel', '--config', tunnelConfig, 'run', tunnelName], { stdio: 'inherit' });
  child.once('error', error => { console.error(`Tunnel failed to start: ${error.message}`); void cleanup(1); });
  child.once('exit', (code, signal) => {
    if (!stopping) { console.error(`Tunnel exited unexpectedly (${signal || code}).`); void cleanup(code === 0 ? 1 : (code || 1)); }
  });
  process.once('SIGINT', () => { void cleanup(0); });
  process.once('SIGTERM', () => { void cleanup(0); });
  console.log(`PWA available at https://${hostname}`);
  console.log(`Local server ready at http://127.0.0.1:${port}`);
  await stopPromise;
}

main().catch(error => fail(error.message));
