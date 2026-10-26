// Pure validation of native n8n HTTP Request output. No OAuth or network code here.
function result(httpCode, response, executionId) {
  return {httpCode, response: {...response, partialSuccess:false, youtubeModified:false, executionId}};
}

function safeCode(value, fallback) {
  return (Number.isInteger(value) ||
    (typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_.-]{0,63}$/.test(value))) ? value : fallback;
}

function safeMessage(value, fallback) {
  if (typeof value !== 'string') return fallback;
  // Keep the human summary, not appended request/debug objects or headers.
  const summary = value.split(/[\r\n;\[{]/, 1)[0];
  const sensitive = /\b(?:authorization|proxy-authorization|headers?|cookies?|set-cookie|token|(?:access|refresh|id)[_-]?token|client[_-]?secret|api[_-]?key|password|x-[\w-]+)["']?\s*[:=]|\b(?:bearer|basic)\s+\S+|https?:\/\/\S+/i;
  const boundary = summary.search(sensitive);
  const message = (boundary < 0 ? summary : summary.slice(0, boundary)).trim().slice(0, 400);
  return message || fallback;
}

function validate(input) {
  const {stage, meta, api, executionId} = input;
  const step = `youtube-${stage}`;
  const fail = (httpCode, code, message, extra = {}) => result(httpCode,
    {status:'error', step, code, message, ...extra}, executionId);
  if (!['channel', 'video', 'playlist'].includes(stage)) throw new Error('Invalid stage');
  if (api.error) {
    // Transport/authentication errors use the native HTTP node error output.
    const error = typeof api.error === 'object' ? api.error : {message:String(api.error)};
    const timedOut = /timeout|timed.?out|ETIMEDOUT/i.test(error.message || '');
    return fail(502, 'YOUTUBE_REQUEST_FAILED', 'A YouTube-kérés nem fejeződött be sikeresen.',
      {youtubeError:{code:timedOut ? 'TIMEOUT' : safeCode(error.code, 'REQUEST_FAILED'),
        message:timedOut ? 'A YouTube-kérés túllépte az időkorlátot.' :
          safeMessage(error.message, 'A natív n8n HTTP-kérés hálózati vagy hitelesítési hibával leállt.')}});
  }
  const body = api.body;
  if (api.statusCode !== 200 || body?.error) {
    const error = body?.error || {};
    return fail(502, 'YOUTUBE_API_ERROR', 'A YouTube API hibát adott vissza.',
      {youtubeError:{code:safeCode(error.code, api.statusCode || 'INVALID_RESPONSE'),
        message:safeMessage(error.message, 'Értelmezhetetlen YouTube API-válasz.'),
        reasons:Array.isArray(error.errors) ? error.errors.map(item => safeCode(item.reason, null)).filter(Boolean) : []}});
  }
  if (!body || !Array.isArray(body.items)) {
    return fail(502, 'YOUTUBE_INVALID_RESPONSE', 'A YouTube API-válasz nem tartalmaz érvényes találati listát.');
  }
  if (stage === 'channel') {
    if (!body.items.some(item => item.id === meta.youtubeChannelId)) {
      return fail(403, 'AUTH_CHANNEL_MISMATCH', 'A hitelesített YouTube-csatorna nem egyezik a regiszterrel.');
    }
  } else if (stage === 'video') {
    const video = body.items.find(item => item.id === meta.videoId);
    if (!video) return fail(404, 'VIDEO_NOT_FOUND', 'A videó nem létezik vagy nem érhető el ezzel a credentiallel.');
    if (video.snippet?.channelId !== meta.youtubeChannelId) {
      return fail(403, 'VIDEO_CHANNEL_MISMATCH', 'A videó nem a regiszter szerinti csatornához tartozik.');
    }
    if (video.status?.privacyStatus !== 'private') {
      return fail(409, 'VIDEO_NOT_PRIVATE', 'Csak jelenleg privát videó frissíthető.');
    }
    if (video.status.publishAt) {
      return fail(409, 'VIDEO_ALREADY_SCHEDULED', 'A videó már időzített; új módosítás nem engedélyezett.');
    }
  } else {
    const playlist = body.items.find(item => item.id === meta.playlistId);
    if (!playlist) return fail(404, 'PLAYLIST_NOT_FOUND', 'A megadott playlist nem létezik vagy nem érhető el.');
    if (playlist.snippet?.channelId !== meta.youtubeChannelId) {
      return fail(403, 'PLAYLIST_CHANNEL_MISMATCH', 'A playlist nem a kiválasztott csatornához tartozik.');
    }
    return result(200, {status:'validated',step:'youtube-preflight',videoId:meta.videoId,
      message:'A YouTube-előellenőrzés sikeres; nem történt módosítás.'}, executionId);
  }
  return result(200, {status:'preflight-ready',step}, executionId);
}

module.exports = {validate, safeCode, safeMessage};

if (require.main === module) {
let input;
try {
  input = JSON.parse(Buffer.from(process.argv[2] || '', 'base64').toString('utf8'));
  console.log(JSON.stringify(validate(input)));
} catch (error) {
  console.log(JSON.stringify(result(500, {status:'error',step:'youtube-preflight',code:'INTERNAL_ERROR',
    message:'Belső előellenőrzési hiba; ellenőrizd a hibás n8n-futást.'}, String(input?.executionId || ''))));
}

}
