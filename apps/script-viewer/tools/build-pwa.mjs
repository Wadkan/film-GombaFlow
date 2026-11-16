import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultAppDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowedSources = ['viewer.html', 'core.js', 'storage.js', 'progress.js', 'pwa.js'];
const staticAssets = ['manifest.webmanifest', 'app-icon.svg', 'app-icon-192.png', 'app-icon-512.png', 'apple-touch-icon.png', 'sw.js'];

export async function buildPwa({ appDir = defaultAppDir, outputDir } = {}) {
  if (!outputDir) throw new Error('Usage: node tools/build-pwa.mjs --output <directory>');
  const source = {};
  for (const name of allowedSources) {
    try {
      source[name] = await fs.readFile(path.join(appDir, name), 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') throw new Error(`Required PWA source is missing: ${name}`);
      throw error;
    }
  }

  const staticContent = {};
  for (const name of staticAssets) {
    try {
      staticContent[name] = await fs.readFile(path.join(appDir, name));
    } catch (error) {
      if (error.code === 'ENOENT') throw new Error(`Required PWA source is missing: ${name}`);
      throw error;
    }
  }

  const html = source['viewer.html']
    .replace('/* CORE_SOURCE */', () => source['core.js'])
    .replace('</head>', '<link rel="manifest" href="/manifest.webmanifest"><link rel="apple-touch-icon" href="/apple-touch-icon.png"></head>')
    .replace('</body>', '<script src="/storage.js"></script><script src="/progress.js"></script><script src="/pwa.js"></script></body>');
  const hash = crypto.createHash('sha256');
  for (const [name, content] of [...Object.entries(source), ...Object.entries(staticContent)]) {
    hash.update(name).update('\0').update(content);
  }
  const cacheVersion = hash.digest('hex').slice(0, 16);
  const worker = staticContent['sw.js'].toString('utf8').replaceAll('__PWA_CACHE_VERSION__', cacheVersion);
  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(outputDir, 'index.html'), html),
    fs.writeFile(path.join(outputDir, 'storage.js'), source['storage.js']),
    fs.writeFile(path.join(outputDir, 'progress.js'), source['progress.js']),
    fs.writeFile(path.join(outputDir, 'pwa.js'), source['pwa.js']),
    ...staticAssets.filter(name => name !== 'sw.js').map(name => fs.writeFile(path.join(outputDir, name), staticContent[name])),
    fs.writeFile(path.join(outputDir, 'sw.js'), worker),
  ]);
  return outputDir;
}

function parseOutput(args) {
  const index = args.indexOf('--output');
  return index < 0 ? null : args[index + 1];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await buildPwa({ outputDir: parseOutput(process.argv.slice(2)) });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
