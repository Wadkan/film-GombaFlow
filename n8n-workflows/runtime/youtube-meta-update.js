// Durable planning/state only. Network and OAuth stay in native n8n HTTP Request.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {validate, safeCode, safeMessage} = require('./youtube-meta-preflight');
const stateDir = () => process.env.YOUTUBE_META_STATE_DIR || '/home/node/.n8n/youtube-meta-update';
const statePath = meta => path.join(stateDir(), crypto.createHash('sha256').update(`${meta.youtubeChannelId}:${meta.videoId}`).digest('hex')+'.json');
function persist(state) {
  const destination=statePath(state.meta);
  const temporary=destination+'.'+state.executionId+'.tmp';
  const fd=fs.openSync(temporary,'w',0o600);
  try {fs.writeFileSync(fd,JSON.stringify(state));fs.fsyncSync(fd);} finally {fs.closeSync(fd);}
  fs.renameSync(temporary,destination);
}
function allowed(meta) {
  const registry=JSON.parse(fs.readFileSync(process.env.YOUTUBE_META_CHANNELS_PATH || '/data/youtube-meta-config/channels.json','utf8'));
  const channel=registry.channels.find(item=>item.enabled && item.key===meta.channelKey && item.youtubeChannelId===meta.youtubeChannelId);
  return Array.isArray(channel?.allowedWriteVideoIds) && channel.allowedWriteVideoIds.includes(meta.videoId);
}
function finish(state,status,step,code,message,extra={}) {
  state.status=status;state.phase='finished';state.finishedAt=new Date().toISOString();
  const response={status,step,...(code?{code}:{}),message,videoId:state.meta.videoId,
    videoUrl:'https://youtu.be/'+state.meta.videoId,executionId:state.executionId,
    partialSuccess:status!=='updated' && state.confirmed.length>0,youtubeModified:state.confirmed.length>0?true:(state.uncertain?null:false),
    completedSteps:state.confirmed,...(state.uncertain?{uncertainStep:state.uncertain}:{}),...extra};
  state.response=response;persist(state);
  return {httpCode:status==='updated'?200:(status==='unknown'?502:(extra.httpCode||409)),response};
}
function issue(state,phase,method,endpoint,query,body) {
  const remaining=state.deadlineAt-Date.now();
  if(remaining<=500) return finish(state,state.confirmed.length||state.uncertain?'unknown':'error',phase,'PROCESSING_DEADLINE','A feldolgozási időkorlát lejárt; nem indult újrapróbálás.');
  const timeout=Math.max(100,Math.min(15000,remaining-300));
  if(method!=='GET') {
    if(!allowed(state.meta)) return finish(state,'error','write-allowlist','VIDEO_NOT_ALLOWED','Ehhez a videóhoz nincs módosítási engedély.');
    // Revalidate at the mutation boundary, not only when the request arrived.
    // The requested publishAt must outlive this whole HTTP call and dispatch.
    const publishAt=Date.parse(state.meta.youtube_scheduled_at);
    if(!Number.isFinite(publishAt) || publishAt<=Date.now()+timeout+1000) {
      return finish(state,'error','schedule','PUBLISH_TIME_TOO_CLOSE',
        'A kért publikálási idő túl közeli vagy már elmúlt; nincs elegendő idő az írás biztonságos befejezésére.');
    }
  }
  state.phase=phase;state.pending={phase,method,endpoint,createdAt:new Date().toISOString()};persist(state);
  return {httpCode:200,response:{status:'update-ready',executionId:state.executionId},
    action:{method,endpoint,query,body,timeout}};
}
const readVideo=(s,phase)=>issue(s,phase,'GET','videos',{part:'snippet,status',id:s.meta.videoId});
const membership=(s,phase)=>issue(s,phase,'GET','playlistItems',{part:'snippet',playlistId:s.meta.playlistId,videoId:s.meta.videoId,maxResults:'50'});
function start(meta,executionId) {
  if(!allowed(meta)) return {httpCode:403,response:{status:'error',step:'write-allowlist',code:'VIDEO_NOT_ALLOWED',message:'A mostani tesztben csak az engedélyezett tesztvideó módosítható.',partialSuccess:false,youtubeModified:false,executionId}};
  fs.mkdirSync(stateDir(),{recursive:true,mode:0o700});
  const state={meta,executionId:String(executionId),status:'updating',createdAt:new Date().toISOString(),deadlineAt:Date.now()+85000,confirmed:[],verifyRound:0};
  let fd;
  try {fd=fs.openSync(statePath(meta),'wx',0o600);} catch(error) {
    if(error.code==='EEXIST') return {httpCode:409,response:{status:'error',step:'duplicate-guard',code:'VIDEO_RESERVED',message:'Korábbi vagy folyamatban lévő kérés miatt új indítás tiltott.',partialSuccess:false,youtubeModified:false,executionId}};
    throw error;
  }
  try {fs.writeFileSync(fd,JSON.stringify(state));fs.fsyncSync(fd);} finally {fs.closeSync(fd);}
  return issue(state,'channel','GET','channels',{part:'id',mine:'true'});
}
function apiError(state,api) {
  const mutating=state.pending.method!=='GET';
  if(api.error) {
    const error=typeof api.error==='object'?api.error:{message:String(api.error)};
    const timeout=/timeout|timed.?out|ETIMEDOUT/i.test(error.message||'');
    if(mutating) state.uncertain=state.phase;
    return finish(state,mutating||state.confirmed.length?'unknown':'error',state.phase,'YOUTUBE_REQUEST_FAILED','A YouTube-kérés eredménye nem igazolható.',{youtubeError:{code:timeout?'TIMEOUT':safeCode(error.code,'REQUEST_FAILED'),message:safeMessage(error.message,'A natív YouTube-kérés hálózati vagy hitelesítési hibával leállt.')}});
  }
  if(!Number.isInteger(api.statusCode) || api.statusCode<200 || api.statusCode>=300 || api.body?.error) {
    const error=api.body?.error||{};
    const ambiguous=mutating && (!Number.isInteger(api.statusCode)||api.statusCode>=500);
    if(ambiguous) state.uncertain=state.phase;
    return finish(state,ambiguous || (state.confirmed.length>0 && state.phase.startsWith('verify-'))?'unknown':'error',state.phase,'YOUTUBE_API_ERROR','A YouTube API hibát adott vissza.',{youtubeError:{code:safeCode(error.code,api.statusCode||'INVALID_RESPONSE'),message:safeMessage(error.message,'Értelmezhetetlen YouTube API-válasz.')}});
  }
  return null;
}
function metadataMatches(video,meta,includeTags=true) {
  const snippet=video?.snippet||{},status=video?.status||{};
  return snippet.title===meta.title && snippet.description===meta.description &&
    (!includeTags || JSON.stringify([...(snippet.tags||[])].sort())===JSON.stringify([...meta.tags].sort())) &&
    String(snippet.categoryId)===meta.categoryId && status.privacyStatus==='private' &&
    Date.parse(status.publishAt)===Date.parse(meta.youtube_scheduled_at);
}
function containsVideo(items,meta) {
  return items.some(item=>item.snippet?.resourceId?.videoId===meta.videoId && (!item.snippet.playlistId || item.snippet.playlistId===meta.playlistId));
}
function advance(input) {
  const state=JSON.parse(fs.readFileSync(statePath(input.meta),'utf8'));
  if(state.executionId!==String(input.executionId) || state.status!=='updating' || !state.pending) throw new Error('Reservation ownership/state mismatch');
  const api=input.api||{};
  const error=apiError(state,api);if(error) return error;
  const body=api.body;
  const phase=state.phase;
  if(['channel','video','playlist','guard-playlist','guard-video'].includes(phase)) {
    const validation=validate({stage:phase.startsWith('guard-')?'video':phase,meta:state.meta,api,executionId:state.executionId});
    if(validation.response.status==='error') return finish(state,'error',validation.response.step,validation.response.code,validation.response.message,{httpCode:validation.httpCode,...(validation.response.youtubeError?{youtubeError:validation.response.youtubeError}:{})});
  }
  if(phase==='channel') return readVideo(state,'video');
  if(phase==='video') return issue(state,'playlist','GET','playlists',{part:'snippet',id:state.meta.playlistId});
  if(phase==='playlist') return membership(state,'membership');
  if(phase==='membership') {
    if(!Array.isArray(body?.items)) return finish(state,'error',phase,'YOUTUBE_INVALID_RESPONSE','Hibás playlist-tagsági válasz.');
    state.membershipPresent=containsVideo(body.items,state.meta);
    return readVideo(state,state.membershipPresent?'guard-video':'guard-playlist');
  }
  if(phase==='guard-playlist') return issue(state,'playlist-insert','POST','playlistItems',{part:'snippet'},
    {snippet:{playlistId:state.meta.playlistId,resourceId:{kind:'youtube#video',videoId:state.meta.videoId}}});
  if(phase==='playlist-insert') {
    if(!body?.id || body.snippet?.resourceId?.videoId!==state.meta.videoId) {
      state.uncertain=phase;return finish(state,'unknown',phase,'YOUTUBE_INVALID_RESPONSE','A playlistbe írás eredménye nem igazolható.');
    }
    state.confirmed.push('playlist-insert');state.playlistItemId=body.id;persist(state);
    return readVideo(state,'guard-video');
  }
  if(phase==='guard-video') {
    const video=body.items.find(item=>item.id===state.meta.videoId);
    if(metadataMatches(video,state.meta)) return readVideo(state,'verify-video');
    return issue(state,'video-update','PUT','videos',{part:'snippet,status'},
      {id:state.meta.videoId,snippet:{title:state.meta.title,description:state.meta.description,tags:state.meta.tags,categoryId:state.meta.categoryId},status:{privacyStatus:'private',publishAt:state.meta.youtube_scheduled_at}});
  }
  if(phase==='video-update') {
    if(body?.id!==state.meta.videoId) {state.uncertain=phase;return finish(state,'unknown',phase,'YOUTUBE_INVALID_RESPONSE','A videófrissítés eredménye nem igazolható.');}
    state.confirmed.push('video-update');persist(state);
    return readVideo(state,'verify-video');
  }
  if(phase==='verify-video') {
    state.verifyRound++;
    state.videoVerified=Array.isArray(body?.items) && metadataMatches(body.items.find(item=>item.id===state.meta.videoId && item.snippet?.channelId===state.meta.youtubeChannelId),state.meta,false);
    return membership(state,'verify-membership');
  }
  if(phase==='verify-membership') {
    const member=Array.isArray(body?.items) && containsVideo(body.items,state.meta);
    if(state.videoVerified && member) return finish(state,'updated','verification',null,'A metaadatok és a playlist-tagság visszaolvasással igazoltak.');
    if(state.verifyRound<3) return readVideo(state,'verify-video');
    return finish(state,'unknown','verification','VERIFICATION_FAILED','Három visszaellenőrzés után sem igazolható a teljes eredmény.');
  }
  throw new Error('Unexpected phase');
}
function unexpected(input) {
  try {
    const state=JSON.parse(fs.readFileSync(statePath(input.meta),'utf8'));
    if(state.executionId!==String(input.executionId)) throw new Error('Ownership mismatch');
    if(state.pending?.method!=='GET') state.uncertain=state.phase;
    return finish(state,'unknown','workflow','NODE_FAILURE','Belső n8n-hiba; a korábbi lépések ellenőrzése nélkül nem indítható újra.');
  } catch(error) {
    return {httpCode:500,response:{status:'unknown',step:'workflow',code:'NODE_FAILURE',message:'Belső n8n-hiba; a módosítás eredménye nem igazolható.',partialSuccess:false,youtubeModified:null,executionId:String(input.executionId||'')}};
  }
}
module.exports={start};
if(require.main===module) {
  let input;
  try {input=JSON.parse(Buffer.from(process.argv[2]||'','base64').toString('utf8'));console.log(JSON.stringify(input.unexpected?unexpected(input):advance(input)));}
  catch(error) {console.log(JSON.stringify(unexpected(input||{})));}
}
