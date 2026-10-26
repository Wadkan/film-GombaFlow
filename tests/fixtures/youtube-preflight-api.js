// Isolated test API. The test workflow has no OAuth credential.
const http = require('node:http');
const fs = require('node:fs');
const channel = 'UCTmNLnPDniFPocALLVSFoDg';
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const scenario = url.searchParams.get('_case') || '';
  fs.appendFileSync('/tmp/youtube-preflight-api.log', JSON.stringify({method:req.method, path:url.pathname,
    scenario, authorization: Boolean(req.headers.authorization)}) + '\n');
  if (scenario === 'timeout' && url.pathname.endsWith('/channels')) return;
  res.setHeader('Content-Type', 'application/json');
  if (scenario === 'native-auth-error' && url.pathname.endsWith('/channels')) {
    res.end(JSON.stringify({nativeError:{code:'invalid_grant',
      message:'Refresh token revoked; Authorization: Bearer fake-bearer-secret; access_token=fake-access-secret; refresh_token=fake-refresh-secret',
      request:{headers:{Authorization:'Bearer fake-header-secret','X-Dummy-Token':'fake-custom-header-secret'}},
      access_token:'fake-object-secret'}})); return;
  }
  if (scenario === 'api-error' && url.pathname.endsWith('/channels')) {
    res.writeHead(403); res.end(JSON.stringify({error:{code:403,message:'Test quota exceeded',errors:[{reason:'quotaExceeded'}]}})); return;
  }
  let items;
  if (url.pathname.endsWith('/channels')) items = [{id:scenario === 'wrong-auth' ? 'other-channel' : channel}];
  else if (url.pathname.endsWith('/videos')) {
    items = scenario === 'missing-video' ? [] : [{id:scenario,
      snippet:{channelId:scenario === 'wrong-video-channel' ? 'other-channel' : channel},
      status:{privacyStatus:scenario === 'public' ? 'public' : 'private',
        ...(scenario === 'scheduled' ? {publishAt:'2099-01-01T12:00:00Z'} : {})}}];
  } else if (url.pathname.endsWith('/playlists')) {
    items = scenario === 'missing-playlist' ? [] : [{id:'test-playlist',snippet:{channelId:channel}}];
  } else {res.writeHead(404);res.end('{}');return;}
  res.end(JSON.stringify({items}));
}).listen(18765, '127.0.0.1');
