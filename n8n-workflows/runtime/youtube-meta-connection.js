// Executed in the n8n container, never in the external task runners.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const fail = (httpCode, step, code, message) => ({
  httpCode,
  response: {status: 'error', step, code, message, partialSuccess: false, youtubeModified: false},
});

function isFutureTimestamp(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/.exec(value);
  if (!match) return false;
  const [, year, month, day, hour, minute, second, zone, offsetHour, offsetMinute] = match;
  const days = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
  return Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= days &&
    Number(hour) <= 23 && Number(minute) <= 59 && Number(second) <= 59 &&
    (zone === 'Z' || (Number(offsetHour) <= 23 && Number(offsetMinute) <= 59)) &&
    Number.isFinite(Date.parse(value)) && Date.parse(value) > Date.now();
}

function run(input) {
  const meta = input.body;
  if (!['check', 'preflight', 'update'].includes(input.operation)) {
    return fail(400, 'input', 'INVALID_OPERATION', 'A művelet check, preflight vagy update legyen.');
  }
  if (!meta || typeof meta !== 'object' || Array.isArray(meta) || meta.status !== 'ready') {
    return fail(400, 'input', 'INVALID_META', 'Ready állapotú meta JSON objektum szükséges.');
  }
  const strings = ['channelKey', 'youtubeChannelId', 'videoId', 'title', 'description', 'categoryId',
    'playlistId', 'privacyStatus', 'youtube_scheduled_at'];
  if (strings.some(key => typeof meta[key] !== 'string' || !meta[key].trim()) ||
      !Array.isArray(meta.tags) || meta.tags.some(tag => typeof tag !== 'string' || !tag.trim()) ||
      Array.from(meta.title).length > 100 || meta.privacyStatus !== 'private' ||
      !isFutureTimestamp(meta.youtube_scheduled_at)) {
    return fail(400, 'input', 'INVALID_FIELDS', 'Hiányos vagy hibás metaadat, láthatóság vagy jövőbeli időzítés.');
  }
  const channelsPath = process.env.YOUTUBE_META_CHANNELS_PATH || '/data/youtube-meta-config/channels.json';
  const registry = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
  const channel = registry.channels.find(item => item.enabled && item.key === meta.channelKey);
  if (!channel || channel.youtubeChannelId !== meta.youtubeChannelId ||
      String(channel.youtubeCategory.categoryId) !== meta.categoryId) {
    return fail(400, 'channel-registry', 'CHANNEL_MISMATCH', 'A csatorna vagy kategória nem egyezik a regiszterrel.');
  }
  if (input.operation === 'check') {
    return {httpCode: 200, response: {status: 'validated', step: 'connection',
      videoId: meta.videoId, youtubeModified: false,
      message: 'A védett kapcsolat és a bemenet ellenőrzése sikeres. YouTube-ellenőrzés még nem történt.'}};
  }
  if (input.operation === 'preflight') {
    if (!channel.youtubeCredential || channel.youtubeCredential.type !== 'youTubeOAuth2Api' ||
        channel.youtubeCredential.id !== input.credentialId) {
      return fail(500, 'channel-registry', 'CREDENTIAL_CONFIG_MISMATCH',
        'A csatorna credential-hivatkozása nem egyezik a telepített workflow-val; telepítsd újra a workflow-t.');
    }
    return {httpCode: 200, response: {status: 'preflight-ready', youtubeModified: false},
      preflight: {meta, credentialId: channel.youtubeCredential.id}};
  }
  const stateDir = process.env.YOUTUBE_META_STATE_DIR || '/home/node/.n8n/youtube-meta-update';
  fs.mkdirSync(stateDir, {recursive: true, mode: 0o700});
  const key = crypto.createHash('sha256').update(`${meta.youtubeChannelId}:${meta.videoId}`).digest('hex');
  let descriptor;
  try {
    descriptor = fs.openSync(path.join(stateDir, `${key}.json`), 'wx', 0o600);
  } catch (error) {
    if (error.code === 'EEXIST') {
      return fail(409, 'duplicate-guard', 'VIDEO_RESERVED',
        'Ehhez a videóhoz korábbi vagy folyamatban lévő kérés tartozik; ellenőrzés nélkül nem indítható újra.');
    }
    throw error;
  }
  try {
    fs.writeFileSync(descriptor, JSON.stringify({videoId: meta.videoId, youtubeChannelId: meta.youtubeChannelId,
      executionId: String(input.executionId || ''), createdAt: new Date().toISOString(),
      state: 'error', code: 'UPDATE_NOT_IMPLEMENTED'}));
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
  return fail(501, 'youtube-update', 'UPDATE_NOT_IMPLEMENTED',
    'A YouTube-frissítés még nincs megvalósítva; nem történt YouTube-módosítás.');
}

let input;
try {
  input = JSON.parse(Buffer.from(process.argv[2] || '', 'base64').toString('utf8'));
  const result = run(input);
  result.response.executionId = String(input.executionId || '');
  console.log(JSON.stringify(result));
} catch (error) {
  const result = fail(500, 'connection-handler', 'INTERNAL_ERROR',
    'Belső feldolgozási hiba; ellenőrizd az n8n futást és a helyi konfigurációt.');
  result.response.executionId = String(input?.executionId || '');
  console.log(JSON.stringify(result));
}
