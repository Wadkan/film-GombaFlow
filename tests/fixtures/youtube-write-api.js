// Isolated API for native write-flow tests. No real credentials or YouTube calls.
const http=require('node:http'),fs=require('node:fs'),crypto=require('node:crypto');
const channel='UCTmNLnPDniFPocALLVSFoDg',videoId='-8QDeHKJNT8';
const states=new Map();
http.createServer((req,res)=>{
 let raw='';req.on('data',chunk=>raw+=chunk);req.on('end',()=>{
  const url=new URL(req.url,'http://localhost'),scenario=url.searchParams.get('_case')||'';
  const endpoint=url.pathname.split('/').pop();let body={};try{body=raw?JSON.parse(raw):{};}catch{}
  if(!states.has(scenario)) states.set(scenario,{videoReads:0,member:scenario==='member',updated:false});
  const state=states.get(scenario);
  let reservedBeforeWrite=false;
  if(req.method!=='GET') {try {const key=crypto.createHash('sha256').update(channel+':'+videoId).digest('hex');const reservation=JSON.parse(fs.readFileSync(process.env.YOUTUBE_META_STATE_DIR+'/'+key+'.json','utf8'));reservedBeforeWrite=reservation.status==='updating'&&reservation.pending.method===req.method;}catch{}}
  fs.appendFileSync('/tmp/youtube-write-api.log',JSON.stringify({method:req.method,endpoint,scenario,authorization:!!req.headers.authorization,
    videoId:body.id||body.snippet?.resourceId?.videoId,requestBody:body,reservedBeforeWrite,afterWrite:state.updated})+'\n');
  res.setHeader('Content-Type','application/json');
  const send=(value,status=200)=>{res.writeHead(status);res.end(JSON.stringify(value));};
  if(endpoint==='channels' && scenario==='expiring') {setTimeout(()=>send({items:[{id:channel}]}),1200);return;}
  if(endpoint==='channels') return send({items:[{id:scenario==='wrong-auth'?'other':channel}]});
  if(endpoint==='playlists') return send({items:[{id:'test-playlist',snippet:{channelId:channel}}]});
  if(endpoint==='playlistItems') {
   if(req.method==='POST') {state.member=true;return send({id:'test-playlist-item',snippet:body.snippet},201);}
   return send({items:state.member?[{id:'test-playlist-item',snippet:{playlistId:'test-playlist',resourceId:{videoId}}}]:[]});
  }
  if(endpoint==='videos') {
   if(req.method==='PUT') {
    if(scenario==='partial') return send({error:{code:403,message:'Test update rejected'}},403);
    if(scenario==='write-timeout') return;
    state.updated=true;state.video=body;return send(body);
   }
   state.videoReads++;
   const desired=state.video;
   const snippet=state.updated?{...desired.snippet,channelId:channel}:{channelId:scenario==='wrong-video-channel'?'other':channel,title:'Old title',description:'Old description',tags:[],categoryId:'19'};
   if(scenario==='verify-mismatch' && state.updated) snippet.title='Not propagated';
   if(scenario==='verify-tags-omitted' && state.updated) delete snippet.tags;
   const status=state.updated?desired.status:{privacyStatus:scenario==='public'||(scenario==='guard-public'&&state.videoReads>=2)?'public':'private',...(scenario==='scheduled'?{publishAt:'2099-01-01T15:00:00Z'}:{})};
   if(scenario==='expiring-partial' && state.member && state.videoReads>=3) {setTimeout(()=>send({items:[{id:videoId,snippet,status}]}),11000);return;}
   return send({items:[{id:videoId,snippet,status}]});
  }
  send({},404);
 });
}).listen(18766,'127.0.0.1');
