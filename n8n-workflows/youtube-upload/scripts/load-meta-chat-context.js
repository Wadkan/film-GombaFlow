const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Read only the selected video's metadata. Canonical paths also reject symlink escapes.
function readVideoMetadata(root, folder) {
  if (!/^[A-Za-z0-9][A-Za-z0-9 _.-]{0,119}$/.test(folder) || folder.includes('..')) {
    throw new Error('A kiválasztott videómappa neve érvénytelen.');
  }
  const base = fs.realpathSync(root);
  const directory = fs.realpathSync(path.join(base, folder));
  if (path.dirname(directory) !== base || !fs.statSync(directory).isDirectory()) {
    throw new Error('A kiválasztott videómappa a megengedett gyökéren kívül van.');
  }
  const read = (name) => {
    const file = path.join(directory, name);
    try {
      if (fs.lstatSync(file).isSymbolicLink()) throw new Error('Metaadatfájl nem lehet szimbolikus link.');
      if (!fs.statSync(file).isFile()) throw new Error('A metaadat útvonala nem fájl.');
      return { exists: true, content: fs.readFileSync(file, 'utf8') };
    } catch (error) {
      if (error.code === 'ENOENT') return { exists: false, content: '' };
      throw error;
    }
  };
  return { md: read('meta.md'), json: read('meta.json') };
}

if (require.main === module) {
  try {
    const channelKey = process.argv[2] ?? '';
    const folder = process.argv[3] ?? '';
    const videoRoot = process.argv[4] ?? process.env.VIDEOS_ROOT ?? '/data/videos';
    const loaded = spawnSync(process.execPath, [path.join(__dirname, 'load-channel-context.js'), channelKey], { encoding: 'utf8' });
    if (loaded.status !== 0) throw new Error(loaded.stderr || 'A csatornaforrások betöltése sikertelen.');
    const result = JSON.parse(loaded.stdout);
    const registry = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/channels.json'), 'utf8'));
    const channel = registry.channels.find((entry) => entry.key === channelKey && entry.enabled);
    if (!channel) throw new Error('A kiválasztott csatorna nem aktív.');
    result.youtubeChannelId = channel.youtubeChannelId;
    result.videoMetadata = readVideoMetadata(videoRoot, folder);
    const messagesFile = result.files.find((file) => file.path.endsWith('/chat-messages.json'));
    if (!messagesFile) throw new Error('A csatornához nincs chat-messages.json.');
    result.chatMessages = JSON.parse(messagesFile.content);
    process.stdout.write(JSON.stringify(result));
  } catch (error) {
    process.stdout.write(JSON.stringify({ ok: false, error: { message: error.message } }));
    process.exitCode = 1;
  }
}

module.exports = { readVideoMetadata };
