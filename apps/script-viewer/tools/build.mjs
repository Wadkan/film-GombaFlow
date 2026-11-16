import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function safeLiteral(source) {
  return JSON.stringify(source)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function buildViewer({ htmlSource, coreSource, hostSource = "" }) {
  const html = safeLiteral(htmlSource.replace("/* CORE_SOURCE */", () => coreSource));
  return `// Generated Scriptable reader: select a local MD, then display it.
// Reader S1 — no background command bridge.
await (async () => {
 const module = {exports:{}};
 eval(${safeLiteral(coreSource)});
 const core = module.exports;
 eval(${safeLiteral(hostSource)});
 const viewerHtml = ${html};
 await module.exports.runViewer({
  pick: async () => { const paths = await DocumentPicker.open(["public.text"]); return paths && paths[0]; },
  read: async file => FileManager.local().readString(file),
  render: async markdown => {
   const data = JSON.stringify(markdown).replace(/</g, "\\\\u003c").replace(/\\u2028/g, "\\\\u2028").replace(/\\u2029/g, "\\\\u2029");
   const documentHtml = viewerHtml.replace("</body>", () => ${safeLiteral('<script id="initialMarkdown" type="application/json">')} + data + ${safeLiteral('</script><script>window.viewerOpen(JSON.parse(document.getElementById("initialMarkdown").textContent));</script></body>')});
   const webView = new WebView();
   await webView.loadHTML(documentHtml);
   await webView.present(true);
  },
  showError: async message => {
   const alert = new Alert(); alert.title = "GombaFlow S1"; alert.message = message;
   alert.addAction("OK"); await alert.presentAlert();
  }
 });
})();
`;
}

async function main(args) {
  const outputIndex = args.indexOf('--output');
  const outputPath = outputIndex >= 0 ? args[outputIndex + 1] : null;
  if (!outputPath) throw new Error('Usage: node apps/script-viewer/tools/build.mjs --output <path>');
  const [htmlSource, coreSource, hostSource] = await Promise.all([
    readFile(path.join(appDir, 'viewer.html'), 'utf8'),
    readFile(path.join(appDir, 'core.js'), 'utf8'),
    readFile(path.join(appDir, 'ScriptViewer.js'), 'utf8'),
  ]);
  await writeFile(path.resolve(outputPath), buildViewer({ htmlSource, coreSource, hostSource }), 'utf8');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
