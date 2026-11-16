import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultAppDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const allowedSources = ['viewer.html', 'core.js', 'storage.js', 'progress.js', 'pwa.js'];

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

  const html = source['viewer.html']
    .replace('/* CORE_SOURCE */', () => source['core.js'])
    .replace('</body>', '<script src="/storage.js"></script><script src="/progress.js"></script><script src="/pwa.js"></script></body>');
  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(outputDir, 'index.html'), html),
    fs.writeFile(path.join(outputDir, 'storage.js'), source['storage.js']),
    fs.writeFile(path.join(outputDir, 'progress.js'), source['progress.js']),
    fs.writeFile(path.join(outputDir, 'pwa.js'), source['pwa.js']),
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
