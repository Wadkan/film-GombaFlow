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
  const bridgeSource = '<script>window.__gombaQueue=[];window.__gombaPending={};window.__gombaNextAction=()=>JSON.stringify(window.__gombaQueue.shift()||null);window.__gombaResolve=(id,value)=>{const p=window.__gombaPending[id];if(!p)return;delete window.__gombaPending[id];p.resolve(value)};window.viewerHost={send:action=>new Promise((resolve,reject)=>{const id=String(Date.now())+"-"+(Math.random().toString(16).slice(2));window.__gombaPending[id]={resolve,reject};window.__gombaQueue.push({id,action})})};</script>';
  return `// Generated Scriptable reader with an offline library.
await (async () => {
 const startedAt = Date.now();
 const debugManager = FileManager.local();
 const debugPath = debugManager.joinPath(debugManager.documentsDirectory(), 'GombaFlowViewer-debug.txt');
 let debugText = 'Offline viewer N5 — N4 visszavonva — ' + new Date().toISOString();
 const debug = message => { debugText += '\\n[' + (Date.now()-startedAt) + ' ms] ' + message; debugManager.writeString(debugPath, debugText); };
 debug('Host indítása');
 const module = {exports:{}};
 eval(${safeLiteral(coreSource)});
 const core = module.exports;
 eval(${safeLiteral(hostSource)});
 debug('Core és host betöltve');
 const viewerHtml = ${html};
 const fm = FileManager.local();
 const docs = fm.documentsDirectory();
 const pathFor = name => fm.joinPath(docs, name);
 const statePath = pathFor('viewer-state.json');
 const readState = () => fm.fileExists(statePath) ? JSON.parse(fm.readString(statePath)) : null;
 const writeState = value => {
  const temporary = pathFor('viewer-state.json.tmp');
  fm.writeString(temporary, JSON.stringify(value));
  if (fm.fileExists(statePath)) fm.remove(statePath);
  fm.move(temporary, statePath);
 };
 let activeWebView = null;
 let activeDocument = null;
 let pending = [];
 let serial = 0;
 const hostBridge = ${safeLiteral(bridgeSource)};
 const documentFor = (markdown, view) => {
  const data = JSON.stringify({markdown, view}).replace(/</g, "\\\\u003c").replace(/\\u2028/g, "\\\\u2028").replace(/\\u2029/g, "\\\\u2029");
  return viewerHtml.replace('</body>', () => hostBridge + '<script id="initialViewerData" type="application/json">' + data + '<'+ '/script><script>const d=JSON.parse(document.getElementById("initialViewerData").textContent);d.markdown?window.viewerOpen(d.markdown,d.view):window.viewerShowLibrary(d.view);'+'<'+ '/script></body>');
 };
 const sendResult = async (id, value) => activeWebView.evaluateJavaScript('window.__gombaResolve('+JSON.stringify(id)+','+JSON.stringify(value)+')', false);
 const dispatch = async (message, handler) => {
  const envelope = JSON.parse(await activeWebView.evaluateJavaScript('window.__gombaNextAction()', false) || 'null');
  if (!envelope) return false;
  try { await sendResult(envelope.id, await handler(envelope.action)); }
  catch (error) { await sendResult(envelope.id, {ok:false,error:String(error && (error.message||error))}); }
  return true;
 };
 await module.exports.runViewer({
  pick: async () => { const paths = await DocumentPicker.open(["public.text"]); return paths && paths[0]; },
  read: async file => FileManager.local().readString(file),
  readState,
  writeState,
  readScript: async name => fm.readString(pathFor(name)),
  writeScript: async (name, content) => fm.writeString(pathFor(name), content),
  deleteScript: async name => { const file=pathFor(name); if(fm.fileExists(file)) fm.remove(file); },
  confirmDelete: async topicId => {
   const alert = new Alert(); alert.title = 'Script törlése'; alert.message = topicId + ' scriptje és pipái törlődnek.';
   alert.addAction('Törlés'); alert.addCancelAction('Mégse');
   return await alert.presentAlert() === 0;
  },
  render: async (markdown, view, onAction) => {
   debug('HTML betöltése');
   activeWebView = new WebView();
   const load = async (text, state) => { activeDocument={text,state}; await activeWebView.loadHTML(documentFor(text,state)); };
   await load(markdown,view);
   debug('HTML betöltve');
   const readerState = await activeWebView.evaluateJavaScript('JSON.stringify({diagnostic:window.viewerDiagnosticState,contentChildren:document.getElementById("content")?.childElementCount,cuePresent:!!document.getElementById("cue")?.textContent,viewport:[innerWidth,innerHeight],bodySize:[document.body.scrollWidth,document.body.scrollHeight]})',false);
   debug('Olvasó állapota: ' + readerState);
   activeWebView.shouldAllowRequest = request => { const allowed=request.url === 'about:blank'; if(!allowed) debug('Blokkolt WebView kérés: ' + request.url); return allowed; };
   let closed=false;
   debug('Néző megjelenítése');
   const presenting=activeWebView.present(true).finally(()=>{closed=true;debug('Néző bezárva')});
   debug('present meghívva; parancshíd indítása');
   let firstPoll = true;
   while(!closed) {
    if(firstPoll) debug('Első WebView lekérdezés');
    const handled = await dispatch(null,onAction);
    if(firstPoll) { debug('Első WebView lekérdezés kész'); firstPoll=false; }
    if(handled) continue;
    await new Promise(resolve=>Timer.schedule(120, false, resolve));
   }
   await presenting;
  },
  replaceReader: async (markdown, view) => {
   await activeWebView.loadHTML(documentFor(markdown,view));
  },
  showError: async message => {
   debug('HIBA: ' + message);
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
