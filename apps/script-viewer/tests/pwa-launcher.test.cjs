const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const net = require('node:net');

const repo = path.resolve(__dirname, '../../..');
const launcher = path.join(__dirname, '../tools/start-pwa.mjs');

function start(env) {
  return spawn(process.execPath, [launcher], { cwd: repo, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
}

function outputOf(child) {
  let output = '';
  child.stdout.setEncoding('utf8').on('data', value => { output += value; });
  child.stderr.setEncoding('utf8').on('data', value => { output += value; });
  return () => output;
}

async function waitFor(predicate, child, readOutput) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (predicate(readOutput())) return;
    if (child.exitCode !== null) throw new Error(`launcher exited early (${child.exitCode}): ${readOutput()}`);
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  throw new Error(`launcher did not become ready: ${readOutput()}`);
}

function exited(child) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve([child.exitCode, child.signalCode]);
  return once(child, 'exit');
}

function get(port, pathname) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path: pathname }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, type: response.headers['content-type'], body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

test('Make delegates to the foreground production PWA launcher', async () => {
  const makefile = await fs.readFile(path.join(repo, 'Makefile'), 'utf8');
  assert.match(makefile, /^\.PHONY:.*\bpwa-start\b/m);
  assert.match(makefile, /^pwa-start:\n\t@node apps\/script-viewer\/tools\/start-pwa\.mjs$/m);
});

test('launcher serves only generated app assets and stops its tunnel child on SIGINT', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'gombaflow-pwa-launcher-'));
  const config = path.join(temp, 'tunnel.yml');
  const argsFile = path.join(temp, 'args.json');
  const fake = path.join(temp, 'cloudflared');
  await fs.writeFile(config, 'tunnel: fixture\n');
  await fs.writeFile(fake, `#!/bin/sh\nif [ "$1" = "--version" ]; then exit 0; fi\nprintf '%s\\n' "$@" > "${argsFile}"\ntrap 'exit 0' TERM INT\nwhile :; do :; done\n`, { mode: 0o755 });
  const port = 8787;
  const child = start({ PATH: `${temp}:${process.env.PATH}`, PWA_HOSTNAME: 'pwa.example.test', PWA_TUNNEL: 'fixture-tunnel', PWA_TUNNEL_CONFIG: config });
  const readOutput = outputOf(child);
  try {
    await waitFor(value => value.includes('Local server ready') && value.includes('https://pwa.example.test'), child, readOutput);
    const args = (await fs.readFile(argsFile, 'utf8')).trim().split('\n');
    assert.deepEqual(args, ['tunnel', '--config', config, 'run', 'fixture-tunnel']);
    const index = await get(port, '/');
    assert.equal(index.status, 200);
    assert.match(index.type, /text\/html/);
    assert.match(index.body.toString(), /GombaFlow/);
    assert.equal((await get(port, '/sw.js')).status, 200);
    assert.equal((await get(port, '/../../Makefile')).status, 404);
    assert.equal((await get(port, '/secret.txt')).status, 404);
    child.kill('SIGINT');
    const [code, signal] = await exited(child);
    assert.equal(signal, null);
    assert.equal(code, 0);
  } finally {
    if (child.exitCode === null) child.kill('SIGTERM');
    await fs.rm(temp, { recursive: true, force: true });
  }
});

test('launcher rejects missing tunnel configuration or executable before binding', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'gombaflow-pwa-preflight-'));
  const child = start({ PWA_HOSTNAME: 'pwa.example.test', PWA_TUNNEL_CONFIG: path.join(temp, 'missing.yml') });
  const readOutput = outputOf(child);
  try {
    const [code] = await exited(child);
    assert.equal(code, 1);
    assert.match(readOutput(), /Tunnel config is missing/);
    const config = path.join(temp, 'tunnel.yml');
    await fs.writeFile(config, 'tunnel: fixture\n');
    const noTool = start({ PWA_HOSTNAME: 'pwa.example.test', PWA_TUNNEL_CONFIG: config, PWA_CLOUDFLARED: path.join(temp, 'absent') });
    const readNoTool = outputOf(noTool);
    const [noToolCode] = await exited(noTool);
    assert.equal(noToolCode, 1);
    assert.match(readNoTool(), /Required tunnel tool is unavailable/);
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
});

test('launcher closes its listener when the tunnel child fails or the process receives SIGTERM', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'gombaflow-pwa-stop-'));
  const config = path.join(temp, 'tunnel.yml');
  const fake = path.join(temp, 'cloudflared');
  await fs.writeFile(config, 'tunnel: fixture\n');
  await fs.writeFile(fake, '#!/bin/sh\nif [ "$1" = "--version" ]; then exit 0; fi\nexit 7\n', { mode: 0o755 });
  const failed = start({ PATH: `${temp}:${process.env.PATH}`, PWA_HOSTNAME: 'pwa.example.test', PWA_TUNNEL_CONFIG: config });
  const readFailed = outputOf(failed);
  try {
    await waitFor(value => value.includes('Local server ready'), failed, readFailed);
    const [failedCode] = await exited(failed);
    assert.equal(failedCode, 7);
    await assert.rejects(get(8787, '/'), /ECONNREFUSED/);

    await fs.writeFile(fake, `#!/bin/sh\nif [ "$1" = "--version" ]; then exit 0; fi\ntrap 'exit 0' TERM INT\nwhile :; do :; done\n`, { mode: 0o755 });
    const terminated = start({ PATH: `${temp}:${process.env.PATH}`, PWA_HOSTNAME: 'pwa.example.test', PWA_TUNNEL_CONFIG: config });
    const readTerminated = outputOf(terminated);
    await waitFor(value => value.includes('Local server ready'), terminated, readTerminated);
    terminated.kill('SIGTERM');
    const [termCode, termSignal] = await exited(terminated);
    assert.equal(termCode, 0);
    assert.equal(termSignal, null);
    await assert.rejects(get(8787, '/'), /ECONNREFUSED/);
  } finally {
    if (failed.exitCode === null) failed.kill('SIGTERM');
    await fs.rm(temp, { recursive: true, force: true });
  }
});

test('occupied loopback port fails without taking over another listener', async () => {
  const blocker = http.createServer((_request, response) => response.end('unrelated listener'));
  await new Promise((resolve, reject) => blocker.once('error', reject).listen(8787, '127.0.0.1', resolve));
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'gombaflow-pwa-port-'));
  const config = path.join(temp, 'tunnel.yml');
  const fake = path.join(temp, 'cloudflared');
  await fs.writeFile(config, 'tunnel: fixture\n');
  await fs.writeFile(fake, '#!/bin/sh\nif [ "$1" = "--version" ]; then exit 0; fi\nexit 99\n', { mode: 0o755 });
  const child = start({ PWA_HOSTNAME: 'pwa.example.test', PWA_TUNNEL_CONFIG: config, PWA_CLOUDFLARED: fake });
  const readOutput = outputOf(child);
  try {
    const [code] = await exited(child);
    assert.equal(code, 1);
    assert.match(readOutput(), /EADDRINUSE/);
    const response = await get(8787, '/');
    assert.equal(response.body.toString(), 'unrelated listener');
  } finally {
    await new Promise(resolve => blocker.close(resolve));
    await fs.rm(temp, { recursive: true, force: true });
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  test(`launcher bounds shutdown with incomplete HTTP headers on ${signal}`, async () => {
    const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'gombaflow-pwa-incomplete-'));
    const config = path.join(temp, 'tunnel.yml');
    const fake = path.join(temp, 'cloudflared');
    await fs.writeFile(config, 'tunnel: fixture\n');
    await fs.writeFile(fake, '#!/bin/sh\nif [ "$1" = "--version" ]; then exit 0; fi\necho "Tunnel PID: $$"\ntrap "exit 0" TERM INT\nwhile :; do :; done\n', { mode: 0o755 });
    const child = start({ PWA_HOSTNAME: 'pwa.example.test', PWA_TUNNEL_CONFIG: config, PWA_CLOUDFLARED: fake });
    const readOutput = outputOf(child);
    let socket;
    let tunnelPid;
    let deadline;
    try {
      await waitFor(value => value.includes('Local server ready') && /Tunnel PID: \d+/.test(value), child, readOutput);
      tunnelPid = Number(readOutput().match(/Tunnel PID: (\d+)/)[1]);
      socket = net.createConnection({ host: '127.0.0.1', port: 8787 });
      await once(socket, 'connect');
      socket.write('GET / HTTP/1.1\r\nHost: localhost\r\n');
      // A second request confirms the server has accepted connections before shutdown.
      assert.equal((await get(8787, '/')).status, 200);
      const completion = exited(child);
      child.kill(signal);
      const [code, exitSignal] = await Promise.race([
        completion,
        new Promise((_, reject) => { deadline = setTimeout(() => reject(new Error('shutdown exceeded 2500 ms with incomplete HTTP headers')), 2500); }),
      ]);
      clearTimeout(deadline);
      assert.equal(code, 0);
      assert.equal(exitSignal, null);
      assert.throws(() => process.kill(tunnelPid, 0), { code: 'ESRCH' });
      await assert.rejects(get(8787, '/'), /ECONNREFUSED/);
    } finally {
      clearTimeout(deadline);
      socket?.destroy();
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
      await exited(child);
      if (tunnelPid) {
        try { process.kill(tunnelPid, 'SIGKILL'); } catch (error) { if (error.code !== 'ESRCH') throw error; }
      }
      await fs.rm(temp, { recursive: true, force: true });
    }
  });
}
