const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {readVideoMetadata}=require('../scripts/load-meta-chat-context');
const main=require('../workflows/youtube-meta-folder-picker.json');
const writer=require('../workflows/youtube-meta-file-write-tool.json');
const reader=require('../workflows/youtube-meta-file-read-tool.json');
const messages=require('../channels/FreezWithMe/chat-messages.json');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function run(workflow,name,input,refs={},binary){
  const source=workflow.nodes.find(n=>n.name===name)?.parameters.jsCode;
  assert.ok(source,`Missing code node ${name}`);
  const fn=new AsyncFunction('$json','$input','$',source);
  const item={json:input};if(binary)item.binary={data:{}};
  return (await fn.call({helpers:{getBinaryDataBuffer:async()=>binary}},input,{first:()=>item},name=>({first:()=>({json:refs[name]})})))[0].json;
}
function fixture(t){const root=fs.mkdtempSync(path.join(os.tmpdir(),'meta-runtime-'));const folder='video';fs.mkdirSync(path.join(root,folder));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));return{root,folder};}
function context(f){return{channelKey:'freezwithme',youtubeChannelId:'channel-id',videoFolder:f.folder,chatMessages:messages,videoMetadata:readVideoMetadata(f.root,f.folder)};}
async function plan(f,action){const c=context(f);return run(main,'Mentési művelet ellenőrzése',{output:action},{'Forráskontextus előkészítése':c});}
async function persist(f,p,override){
  const request=await run(writer,'Útvonal ellenőrzése',p);
  const target=path.join(f.root,f.folder,request.fileName);
  fs.writeFileSync(target,request.content);
  const receipt=await run(writer,'Mentés tartalmának ellenőrzése',{}, {'Útvonal ellenőrzése':request}, override??fs.readFileSync(target));
  return run(main,'Ellenőrzött mentési visszajelzés',receipt,{'Mentési művelet ellenőrzése':p,'Forráskontextus előkészítése':context(f)});
}
const md=(title='Elfogadott cím')=>`# Title\n${title}\n\n# Description\nSaját leírás\n\n# Tags\ntag\n\n# Playlist\nOutdoor\n\n# Schedule\n2026-10-27T16:00:00+01:00\n`;
const meta=(title='Elfogadott cím')=>JSON.stringify({status:'ready',channelKey:'freezwithme',youtubeChannelId:'channel-id',title,description:'Saját leírás',tags:['tag'],playlistId:'playlist-id',youtube_scheduled_at:'2026-10-27T16:00:00+01:00'});

test('MD is actually written and verified; model summary is never the MD receipt',async t=>{
  const f=fixture(t);const p=await plan(f,{action:'write_md',content:md(),message:'NEM JELENHET MEG: összesítő és hamis mentési állítás',approved:false});
  assert.equal(p.save,true);assert.equal(p.fileName,'meta.md');
  const reply=await persist(f,p);
  assert.equal(fs.readFileSync(path.join(f.root,f.folder,'meta.md'),'utf8'),md());
  assert.equal(fs.existsSync(path.join(f.root,f.folder,'meta.json')),false);
  assert.equal(reply.output,`Elkészült: /data/videos/video/meta.md. Kérlek, nézd át.`);
});
test('JSON requires a prior MD and a semantic approval flag, never a user keyword',async t=>{
  const f=fixture(t);const action={action:'write_json',content:meta(),message:'Rövid összesítő',approved:true};
  assert.equal((await plan(f,action)).save,false);
  await persist(f,await plan(f,{action:'write_md',content:md(),message:'',approved:false}));
  assert.equal((await plan(f,{...action,approved:false})).save,false);
  const p=await plan(f,action);assert.equal(p.save,true);
  await persist(f,p);assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.root,f.folder,'meta.json'))),JSON.parse(meta()));
});
test('manual MD edits are loaded into the next context and remain the conversion source',async t=>{
  const f=fixture(t);await persist(f,await plan(f,{action:'write_md',content:md(),message:'',approved:false}));
  fs.writeFileSync(path.join(f.root,f.folder,'meta.md'),md('Kézzel javított cím'));
  const snapshot=context(f);assert.match(snapshot.videoMetadata.md.content,/Kézzel javított cím/);
  const approvedTitle=snapshot.videoMetadata.md.content.split('\n')[1];
  await persist(f,await plan(f,{action:'write_json',content:meta(approvedTitle),message:'',approved:true}));
  assert.equal(JSON.parse(fs.readFileSync(path.join(f.root,f.folder,'meta.json'))).title,'Kézzel javított cím');
});
test('missing, failed, mismatched and corrupt writer results cannot confirm a save',async t=>{
  const f=fixture(t);const p=await plan(f,{action:'write_md',content:md(),message:'',approved:false});
  for(const receipt of [{},{error:{message:'disk full'}},{ok:true,verified:true,fileName:'meta.md',targetPath:'/data/videos/other/meta.md'}]){
    const reply=await run(main,'Ellenőrzött mentési visszajelzés',receipt,{'Mentési művelet ellenőrzése':p,'Forráskontextus előkészítése':context(f)});
    assert.match(reply.output,/mentése nem sikerült/);assert.doesNotMatch(reply.output,/Elkészült:/);
  }
  await assert.rejects(()=>persist(f,p,Buffer.from('corrupt')),/nem egyezik/);
});
test('questions do not create files; invalid operations cannot bypass the dispatcher',async t=>{
  const f=fixture(t);const p=await plan(f,{action:'discuss',message:'Melyik címet választod?',content:'',approved:false});
  assert.equal(p.save,false);assert.deepEqual(fs.readdirSync(path.join(f.root,f.folder)),[]);
  for(const action of [{action:'write_md',message:'',content:md(),approved:true},{action:'write_md',message:'',content:'',approved:false},{action:'bogus',message:'',content:'',approved:false}])assert.equal((await plan(f,action)).save,false);
});
test('JSON validation rejects another channel and malformed or incomplete metadata',async t=>{
  const f=fixture(t);fs.writeFileSync(path.join(f.root,f.folder,'meta.md'),md());
  const original=JSON.parse(meta());
  for(const content of ['not json','{}',JSON.stringify({...original,channelKey:'other'}),JSON.stringify({...original,youtube_scheduled_at:'sometime'})]){
    assert.equal((await plan(f,{action:'write_json',message:'',content,approved:true})).save,false);
  }
});
test('metadata reads and writes reject outside paths, arbitrary file names and symlink escapes',async t=>{
  const f=fixture(t);
  for(const request of [{videoFolder:'../outside',fileName:'meta.md',content:'x'},{videoFolder:'video',fileName:'../meta.md',content:'x'},{videoFolder:'video',fileName:'other.txt',content:'x'}])await assert.rejects(()=>run(writer,'Útvonal ellenőrzése',request));
  assert.throws(()=>readVideoMetadata(f.root,'../outside'));
  const outside=fs.mkdtempSync(path.join(os.tmpdir(),'meta-outside-'));t.after(()=>fs.rmSync(outside,{recursive:true,force:true}));
  fs.symlinkSync(outside,path.join(f.root,'escape'));assert.throws(()=>readVideoMetadata(f.root,'escape'));
  fs.writeFileSync(path.join(outside,'secret'),'secret');fs.symlinkSync(path.join(outside,'secret'),path.join(f.root,f.folder,'meta.md'));assert.throws(()=>readVideoMetadata(f.root,f.folder));
});
test('exported workflow makes a selected save mandatory, awaits it, reads it back and confirms afterwards',()=>{
  const next=(w,n)=>w.connections[n]?.main?.flat().map(e=>e.node)??[];
  assert.deepEqual(next(main,'Metaadat Agent'),['Mentési művelet ellenőrzése']);
  assert.deepEqual(next(main,'Mentési művelet ellenőrzése'),['Fájlmentés szükséges?']);
  assert.equal(main.connections['Fájlmentés szükséges?'].main[0][0].node,'Metaadatfájl kötelező mentése');
  const call=main.nodes.find(n=>n.name==='Metaadatfájl kötelező mentése');assert.equal(call.parameters.options.waitForSubWorkflow,true);assert.equal(call.parameters.workflowId.value,writer.id);
  assert.deepEqual(next(main,call.name),['Ellenőrzött mentési visszajelzés']);
  assert.deepEqual(next(writer,'Read/Write Files - fájl mentése'),['Read/Write Files - mentés visszaolvasása']);
  assert.deepEqual(next(writer,'Read/Write Files - mentés visszaolvasása'),['Mentés tartalmának ellenőrzése']);
  assert.equal(main.nodes.filter(n=>n.type.includes('toolWorkflow')).length,1);
  assert.equal(main.nodes.find(n=>n.type.includes('toolWorkflow')).parameters.workflowId.value,reader.id);
  assert.equal(main.nodes.find(n=>n.name==='Metaadat Agent').parameters.hasOutputParser,true);
  assert.deepEqual(main.connections['Agent műveleti szerződés'].ai_outputParser[0][0].node,'Hibás Agent-formátum javítása');
  assert.deepEqual(main.connections['Hibás Agent-formátum javítása'].ai_outputParser[0][0].node,'Metaadat Agent');
  assert.equal(main.nodes.find(n=>n.name==='Hibás Agent-formátum javítása').type,'@n8n/n8n-nodes-langchain.outputParserAutofixing');
  assert.ok(!writer.nodes.find(n=>n.name==='AI eszköz bemenete').parameters.workflowInputs.values.some(f=>f.name==='userMessage'));
});
test('all exported node code compiles and every connection targets a declared node',()=>{
  for(const workflow of [main,writer,reader]){
    const names=new Set(workflow.nodes.map(n=>n.name));assert.equal(names.size,workflow.nodes.length);
    for(const node of workflow.nodes)if(node.parameters.jsCode)new AsyncFunction('$json','$input','$',node.parameters.jsCode);
    for(const [source,outputs]of Object.entries(workflow.connections)){assert.ok(names.has(source));for(const branches of Object.values(outputs))for(const branch of branches)for(const edge of branch)assert.ok(names.has(edge.node),edge.node);}
  }
});
test('the agent context contains actual current MD bytes and channel identity',async t=>{
  const f=fixture(t);fs.writeFileSync(path.join(f.root,f.folder,'meta.md'),md('Kézi változat'));
  const loaded={ok:true,channelKey:'freezwithme',youtubeChannelId:'channel-id',files:[{path:'/channel/style.md',content:'style'},{path:'/channel/chat-messages.json',content:JSON.stringify(messages)}],missingFiles:[],videoMetadata:readVideoMetadata(f.root,f.folder),chatMessages:messages};
  const result=await run(main,'Forráskontextus előkészítése',{stdout:JSON.stringify(loaded)},{'Metaadat-chat':{metadata:{channelKey:'freezwithme',videoFolder:f.folder},chatInput:'teszt',sessionId:'fixture'}});
  assert.equal(result.ok,true);assert.match(result.sourceContext,/Kézi változat/);assert.match(result.sourceContext,/channel-id/);assert.equal(result.videoMetadata.md.content,md('Kézi változat'));
});
test('the read tool returns file bytes and cannot select another path',async()=>{
  const request=await run(reader,'Olvasási útvonal ellenőrzése',{videoFolder:'video',fileName:'meta.md'});
  const output=await run(reader,'Olvasott metaadat',{}, {'Olvasási útvonal ellenőrzése':request},Buffer.from('manual content'));
  assert.equal(output.content,'manual content');assert.equal(output.exists,true);assert.equal(output.targetPath,'/data/videos/video/meta.md');
  const missing=await run(reader,'Olvasott metaadat',{error:{message:'ENOENT'}},{'Olvasási útvonal ellenőrzése':request});
  assert.deepEqual({ok:missing.ok,exists:missing.exists,content:missing.content},{ok:true,exists:false,content:''});
  assert.equal(reader.nodes.find(n=>n.name==='Read/Write Files - metaadat olvasása').onError,'continueRegularOutput');
  await assert.rejects(()=>run(reader,'Olvasási útvonal ellenőrzése',{videoFolder:'video',fileName:'../meta.md'}));
});
