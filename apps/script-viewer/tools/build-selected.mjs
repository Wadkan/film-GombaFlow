import { mkdir, readdir, readFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import core from '../core.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const projects = path.join(root, 'local-workflows/script-and-cut-workflows/gombaFlow/projects');

async function findScripts(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...await findScripts(full));
    else if (entry.name === '3-script.md') results.push(full);
  }
  return results;
}

const scripts = (await findScripts(projects)).sort();
if (!scripts.length) throw new Error('Nem található 3-script.md a projektek között.');
console.log('Parsolandó scriptek:');
scripts.forEach((file, index) => console.log(`${index + 1}. ${path.relative(projects, file)}`));
const answer = await new Promise(resolve => {
  process.stdout.write('Válassz sorszámot: ');
  process.stdin.setEncoding('utf8');
  process.stdin.once('data', value => { process.stdin.pause(); resolve(value.trim()); });
});
const selected = Number(answer);
if (!Number.isInteger(selected) || selected < 1 || selected > scripts.length) throw new Error('Érvénytelen sorszám.');
const script = scripts[selected - 1];
const outputDir = path.join(root, 'apps/script-viewer/output');
core.parseScript(await readFile(script, 'utf8'));
await mkdir(outputDir, { recursive: true });
const output = path.join(outputDir, 'GombaFlowViewer.js');
const build = spawnSync(process.execPath, [path.join(root, 'apps/script-viewer/tools/build.mjs'), '--output', output], { cwd: root, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status || 1);
const markdownOutput=path.join(outputDir, `${path.basename(path.dirname(script))}.md`);
await copyFile(script, markdownOutput);
console.log(`Program (egyszer telepítsd): ${path.relative(root, output)}`);
console.log(`MD (ezt küldd tartalomfrissítéskor): ${path.relative(root, markdownOutput)}`);
