class ScriptFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ScriptFormatError';
  }
}

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, code) => {
    const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    if (code[0] !== '#') return named[code.toLowerCase()];
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return Number.isInteger(point) && point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : entity;
  });
}

function tagBody(source, name, required = true) {
  const match = source.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}\\s*>`, 'i'));
  if (!match && required) throw new ScriptFormatError(`Missing or malformed <${name}> block`);
  return match ? decodeEntities(match[1].trim()) : '';
}

function parseAttributes(opening) {
  const attributes = {};
  const text = opening.replace(/^<agent-cue\b/i, '').replace(/>$/, '');
  const pattern = /([\w-]+)\s*=\s*(["'])(.*?)\2/g;
  let match;
  while ((match = pattern.exec(text))) {
    if (Object.hasOwn(attributes, match[1])) throw new ScriptFormatError(`Duplicate agent-cue attribute ${match[1]}`);
    attributes[match[1]] = decodeEntities(match[3]);
  }
  const residue = text.replace(pattern, '').trim();
  if (residue) throw new ScriptFormatError(`Malformed agent-cue attributes: ${residue}`);
  const unexpected = Object.keys(attributes).find(name => !['timeline', 'script-id', 'clip-type', 'location'].includes(name));
  if (unexpected) throw new ScriptFormatError(`Unknown agent-cue attribute ${unexpected}`);
  return attributes;
}

function validateStructuralTags(block, partId) {
  const supported = new Set(['agent-cue', 'spoken-cue', 'narration', 'screen-action', 'production-note']);
  const required = ['agent-cue', 'spoken-cue', 'narration', 'screen-action'];
  const counts = new Map();
  const stack = [];
  let codeFence = null;

  for (const line of block.split(/\r?\n/)) {
    const fence = line.match(/^\s*(`{3,}|~{3,})([^\n]*)$/);
    if (codeFence) {
      if (fence && fence[1][0] === codeFence.char && fence[1].length >= codeFence.size && !fence[2].trim()) codeFence = null;
      continue;
    }
    if (fence && stack.length > 0) {
      codeFence = { char: fence[1][0], size: fence[1].length };
      continue;
    }

    for (const match of line.matchAll(/<\s*(\/?)\s*([a-z][\w-]*)\b[^>]*>/gi)) {
      const [, closing, rawName] = match;
      const name = rawName.toLowerCase();
      if (!supported.has(name)) throw new ScriptFormatError(`Part ${partId}: unknown structural tag <${name}>`);
      if (closing) {
        if (stack.at(-1) !== name) throw new ScriptFormatError(`Part ${partId}: unexpected closing </${name}> tag`);
        stack.pop();
      } else {
        if (/\/\s*>$/.test(match[0])) throw new ScriptFormatError(`Part ${partId}: <${name}> must have a matching closing tag`);
        counts.set(name, (counts.get(name) || 0) + 1);
        stack.push(name);
      }
    }
  }

  if (codeFence) throw new ScriptFormatError(`Part ${partId}: unclosed Markdown code fence in a structural block`);
  if (stack.length) throw new ScriptFormatError(`Part ${partId}: unclosed <${stack.at(-1)}> tag`);
  for (const name of required) {
    if (counts.get(name) !== 1) throw new ScriptFormatError(`Part ${partId}: expected one paired <${name}> block`);
  }
}

function parseScript(markdown) {
  if (typeof markdown !== 'string') throw new ScriptFormatError('Script input must be text');
  const topicId = markdown.match(/^\s*-\s*Témaazonosító:\s*`?([^`\r\n]+?)`?\s*$/im)?.[1]?.trim();
  const magicWord = markdown.match(/^\s*-\s*Felvételi varázsszó:\s*`([^`]+)`\s*$/im)?.[1]?.trim();
  const timeline = markdown.match(/^\s*-\s*Alapértelmezett timeline:\s*`([^`]+)`\s*$/im)?.[1]?.trim();
  if (!topicId || !magicWord || !timeline) throw new ScriptFormatError('Missing tagged script header metadata (topic, magic word, or timeline)');
  const sectionStart = markdown.indexOf('## Script nézői sorrendben');
  if (sectionStart < 0) throw new ScriptFormatError('Missing Script nézői sorrendben section');
  const section = markdown.slice(sectionStart).replace(/^## Script nézői sorrendben[^\n]*\n/i, '');
  const ids = new Set();
  const parts = [];
  let chapter = '';
  let chapterNotes = [];
  let previousPartCount = 0;

  const lines = section.split(/\r?\n/);
  let currentFence = null;
  for (let i = 0; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) break;
    const heading = lines[i].match(/^(#{3,6})\s+(.+?)\s*#*\s*$/);
    if (heading && !currentFence) {
      if (heading[1].length === 3) {
        chapter = heading[2];
        chapterNotes = [];
        previousPartCount = parts.length;
      }
      continue;
    }
    const opening = lines[i].match(/^\s*(`{3,}|~{3,})([^\n]*)$/);
    if (!opening || currentFence) continue;
    currentFence = { char: opening[1][0], size: opening[1].length, body: [] };
    const openTags = [];
    let nestedFence = null;
    for (i++; i < lines.length; i++) {
      const fenceLine = lines[i].match(/^\s*(`{3,}|~{3,})([^\n]*)$/);
      const closesNested = Boolean(fenceLine && nestedFence && fenceLine[1][0] === nestedFence.char && fenceLine[1].length >= nestedFence.size && !fenceLine[2].trim());
      if (closesNested) nestedFence = null;
      else if (fenceLine && !nestedFence && openTags.length && fenceLine[2].trim()) nestedFence = { char: fenceLine[1][0], size: fenceLine[1].length };
      if (fenceLine && !closesNested && !nestedFence && fenceLine[1][0] === currentFence.char && (fenceLine[1].length === currentFence.size || openTags.length === 0) && !fenceLine[2].trim()) break;
      currentFence.body.push(lines[i]);
      for (const tag of lines[i].matchAll(/<\s*(\/?)\s*([\w-]+)\b[^>]*>/g)) {
        if (tag[1]) {
          const last = openTags.lastIndexOf(tag[2].toLowerCase());
          if (last >= 0) openTags.splice(last, 1);
        } else if (!/\/\s*>$/.test(tag[0])) openTags.push(tag[2].toLowerCase());
      }
    }
    if (i >= lines.length) {
      const partial = currentFence.body.join('\n');
      const partId = partial.match(/script-id=["'](\d+)/)?.[1];
      if (partId) validateStructuralTags(partial, partId);
      throw new ScriptFormatError('Unclosed Markdown code fence');
    }
    const block = currentFence.body.join('\n');
    currentFence = null;
    if (!/<agent-cue\b/i.test(block)) {
      const note = block.match(/<production-note\b[^>]*>([\s\S]*?)<\/production-note\s*>/i)?.[1];
      if (note && parts.length === previousPartCount) chapterNotes.push(decodeEntities(note.trim()));
      else if (note && parts.length > previousPartCount) parts[parts.length - 1].productionNotes.push(decodeEntities(note.trim()));
      continue;
    }
    const openingTag = block.match(/<agent-cue\b[^>]*>/i)?.[0];
    if (!openingTag) throw new ScriptFormatError('Malformed agent-cue block');
    const attrs = parseAttributes(openingTag);
    const idText = attrs['script-id'];
    if (!/^\d+$/.test(idText || '') || Number(idText) <= 0) throw new ScriptFormatError(`Invalid positive script-id: ${idText || '(missing)'}`);
    const id = Number(idText);
    validateStructuralTags(block, id);
    if (ids.has(id)) throw new ScriptFormatError(`Duplicate script-id ${id}`);
    ids.add(id);
    if (attrs.timeline !== timeline) throw new ScriptFormatError(`Part ${id}: timeline does not match header`);
    if (!['talking head', 'b-roll', 'animation'].includes(attrs['clip-type'])) throw new ScriptFormatError(`Part ${id}: invalid clip-type ${attrs['clip-type'] || '(missing)'}`);
    if (typeof attrs.location !== 'string' || !attrs.location.trim()) throw new ScriptFormatError(`Part ${id}: location is required and must be nonempty`);
    const cue = tagBody(block, 'spoken-cue');
    const topicNumber = topicId.match(/\d+/)?.[0];
    const cuePattern = new RegExp(`^${escapeRegExp(magicWord)}\\s+timeline\\s+${escapeRegExp(topicNumber || '')}\\s+script\\s+${id}\\s+${escapeRegExp(magicWord)}$`, 'i');
    if (!cuePattern.test(cue)) throw new ScriptFormatError(`Part ${id}: spoken-cue must identify topic and script ${id}`);
    const narration = tagBody(block, 'narration').trim();
    let screenAction;
    try { screenAction = tagBody(block, 'screen-action'); }
    catch { throw new ScriptFormatError(`Part ${id}: missing or malformed <screen-action> block`); }
    const notes = [...block.matchAll(/<production-note\b[^>]*>([\s\S]*?)<\/production-note\s*>/gi)].map(match => decodeEntities(match[1].trim()));
    parts.push({ id, chapter, chapterNotes: [...chapterNotes], timeline, clipType: attrs['clip-type'], location: attrs.location.trim(), spokenCue: cue, narration, screenAction, productionNotes: notes });
  }
  if (!parts.length) throw new ScriptFormatError('No tagged recordable parts found in Script nézői sorrendben');
  return { topicId, magicWord, timeline, parts };
}

function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function filterParts(parts, filters = {}) {
  const { chapter, clipType, location, status = 'all', recorded = new Set(), search = '' } = filters;
  const needle = String(search).toLocaleLowerCase();
  return parts.filter(part => {
    const isRecorded = recorded instanceof Set ? recorded.has(part.id) : Boolean(recorded?.[part.id]);
    return (chapter == null || chapter === 'all' || part.chapter === chapter)
      && (clipType == null || clipType === 'all' || part.clipType === clipType)
      && (location === undefined || location === 'all' || part.location === location)
      && (status === 'all' || (status === 'recorded' ? isRecorded : status === 'not-recorded' && !isRecorded))
      && (!needle || part.narration.toLocaleLowerCase().includes(needle));
  });
}

function navigateMatches(matches, currentId, direction) {
  if (!matches.length) return null;
  const index = matches.findIndex(part => part.id === Number(currentId));
  if (index < 0) return direction < 0 ? matches[matches.length - 1] : matches[0];
  return matches[index + (direction < 0 ? -1 : 1)] || null;
}

module.exports = { ScriptFormatError, filterParts, navigateMatches, parseScript };
