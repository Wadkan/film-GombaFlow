const fs=require('node:fs');
const path=require('node:path');
const base=require('../workflows/youtube-meta-file-write-tool.json');
const [directory,folder]=process.argv.slice(2);
if(!directory||!/^MetaRuntimeTest\.[A-Za-z0-9-]+$/.test(folder))throw Error('Invalid fixture arguments');
for(const [kind,fileName,content] of [['md','meta.md','# Title\nIzolált n8n fájlírás\n'],['json','meta.json','{"status":"draft","title":"Izolált teszt"}\n'],['outside','../'+folder+'-outside.json','must-not-be-written']]){
 const w=structuredClone(base);w.id=`metadata-regression-${kind}`;w.active=false;w.name=`Isolated metadata ${kind}`;
 const trigger=w.nodes.find(n=>n.name==='AI eszköz bemenete');trigger.type='n8n-nodes-base.manualTrigger';trigger.typeVersion=1;trigger.parameters={};
 const input={videoFolder:folder,fileName,content};
 const seed={id:'fixture-input',name:'Fixture input',type:'n8n-nodes-base.code',typeVersion:2,position:[120,0],parameters:{jsCode:`return [{json:${JSON.stringify(input)}}];`}};
 w.nodes.push(seed);w.connections[trigger.name]={main:[[{node:seed.name,type:'main',index:0}]]};w.connections[seed.name]={main:[[{node:'Útvonal ellenőrzése',type:'main',index:0}]]};
 fs.writeFileSync(path.join(directory,`${kind}.json`),JSON.stringify(w));
}

// Exercise the actual parent routing with deterministic model outputs, not a live LLM.
const main=require('../workflows/youtube-meta-folder-picker.json');
const messages=require('../channels/FreezWithMe/chat-messages.json');
const metadata={status:'ready',channelKey:'freezwithme',youtubeChannelId:'fixture-channel',title:'Izolált teszt',description:'Tesztleírás',tags:['test'],playlistId:'fixture-playlist',youtube_scheduled_at:'2026-10-27T16:00:00+01:00'};
const context={videoFolder:folder,channelKey:'freezwithme',youtubeChannelId:'fixture-channel',chatMessages:messages,videoMetadata:{md:{exists:true,content:'# Title\nIzolált n8n fájlírás\n'},json:{exists:false,content:''}}};
const child=structuredClone(base);child.active=false;fs.writeFileSync(path.join(directory,'writer.json'),JSON.stringify(child));
for(const [kind,action] of [
 ['turn-md',{action:'write_md',message:'THIS SUMMARY MUST NOT REACH THE CHAT',content:context.videoMetadata.md.content,approved:false}],
 ['turn-denied',{action:'write_json',message:'',content:JSON.stringify(metadata),approved:false}],
 ['turn-json',{action:'write_json',message:'Cím: Izolált teszt',content:JSON.stringify(metadata),approved:true}]
]){
 const w={id:`metadata-${kind}`,name:`Isolated ${kind}`,active:false,nodes:[],connections:{},settings:{executionOrder:'v1'}};
 w.nodes.push({id:'manual',name:'Fixture start',type:'n8n-nodes-base.manualTrigger',typeVersion:1,parameters:{},position:[0,0]});
 const snapshot=structuredClone(context);if(kind==='turn-md')snapshot.videoMetadata.md={exists:false,content:''};
 w.nodes.push({id:'context',name:'Forráskontextus előkészítése',type:'n8n-nodes-base.code',typeVersion:2,parameters:{jsCode:`return [{json:${JSON.stringify(snapshot)}}];`},position:[200,0]});
 w.nodes.push({id:'model',name:'Metaadat Agent',type:'n8n-nodes-base.code',typeVersion:2,parameters:{jsCode:`return [{json:{output:${JSON.stringify(action)}}}];`},position:[400,0]});
 const names=['Mentési művelet ellenőrzése','Fájlmentés szükséges?','Metaadatfájl kötelező mentése','Ellenőrzött mentési visszajelzés','Chat-válasz ellenőrzése'];
 w.nodes.push(...main.nodes.filter(n=>names.includes(n.name)).map(n=>structuredClone(n)));
 // Inline the child only in the disposable test: no publication-service startup or editor database is needed.
 const call=w.nodes.find(n=>n.name==='Metaadatfájl kötelező mentése');call.typeVersion=1;call.parameters={source:'parameter',workflowJson:JSON.stringify(child),mode:'once',options:{waitForSubWorkflow:true}};
 for(const name of ['Metaadat Agent',...names])if(main.connections[name])w.connections[name]=structuredClone(main.connections[name]);
 w.connections['Fixture start']={main:[[{node:'Forráskontextus előkészítése',type:'main',index:0}]]};
 w.connections['Forráskontextus előkészítése']={main:[[{node:'Metaadat Agent',type:'main',index:0}]]};
 fs.writeFileSync(path.join(directory,`${kind}.json`),JSON.stringify(w));
}
