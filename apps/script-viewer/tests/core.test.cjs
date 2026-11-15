const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { filterParts, navigateMatches, parseScript, ScriptFormatError } = require('../core.js');

const root = path.resolve(__dirname, '../../..');
const sample = fs.readFileSync(path.join(root, 'local-workflows/script-and-cut-workflows/gombaFlow/projects/2-unlimited-claude-code-for/3-script.md'), 'utf8');
const legacy = fs.readFileSync(path.join(root, 'local-workflows/script-and-cut-workflows/gombaFlow/projects/1-postgresql-hybrid-search-course/3-script.md'), 'utf8');
const fixture = fs.readFileSync(path.join(__dirname, 'fixtures/999-viewer-fixture.md'), 'utf8');

const byId = (parts, id) => parts.find(part => part.id === id);

test('parses all 16 parts and metadata from the current tagged script', () => {
  const parsed = parseScript(sample);
  assert.equal(parsed.topicId, '2-unlimited-claude-code-for');
  assert.equal(parsed.timeline, 'Claude Code limitbe futott? Próbáld helyi modellel');
  assert.equal(parsed.parts.length, 16);
  assert.deepEqual(parsed.parts.map(part => part.id), Array.from({ length: 16 }, (_, index) => index + 1));
  assert.ok(parsed.parts.every(part => part.spokenCue.includes(`script ${part.id} serpenyő`)));
  assert.deepEqual([...new Set(parsed.parts.map(part => part.clipType))].sort(), ['b-roll', 'talking head']);
  assert.deepEqual([...new Set(parsed.parts.map(part => part.location))].sort(), ['A', 'B', 'C']);
  assert.match(byId(parsed.parts, 8).screenAction, /ollama run gomba-gemma/);
  assert.match(byId(parsed.parts, 8).screenAction, /```text[\s\S]*PARAMETER num_ctx 32768[\s\S]*```/);
});

test('keeps chapter notes, nested code fences, required locations, and decodes XML entities once', () => {
  const parsed = parseScript(fixture);
  assert.equal(parsed.parts.length, 3);
  assert.equal(byId(parsed.parts, 401).chapter, 'A — Első fejezet');
  assert.deepEqual(byId(parsed.parts, 401).chapterNotes, ['A fejezet közös megjegyzése.']);
  assert.match(byId(parsed.parts, 401).screenAction, /````javascript[\s\S]*const greeting = "hello";[\s\S]*````/);
  assert.equal(byId(parsed.parts, 401).narration, 'Alma & <körte> a narrációban.');
  assert.equal(byId(parsed.parts, 402).location, 'B');
  assert.equal(byId(parsed.parts, 403).chapter, 'B — Második fejezet');
  assert.equal(byId(parsed.parts, 403).clipType, 'animation');
});

test('rejects duplicate IDs, mismatched spoken cues, malformed blocks, and unknown tags', () => {
  assert.throws(() => parseScript(fixture.replace('script-id="402"', 'script-id="401"')), ScriptFormatError);
  assert.throws(() => parseScript(fixture.replace('script 401 próba', 'script 999 próba')), /spoken-cue.*401/i);
  assert.throws(() => parseScript(fixture.replace('</screen-action>', '')), /screen-action/i);
  assert.throws(() => parseScript(fixture.replace('A második képernyőművelet.', '<unknown-tag>adat</unknown-tag>')), /unknown.*tag/i);
});

test('rejects clip types outside the recording dictionary', () => {
  assert.throws(() => parseScript(fixture.replace('clip-type="talking head"', 'clip-type="teleport"')), /clip-type.*teleport/i);
});

test('rejects missing or blank locations on a recordable part', () => {
  assert.throws(() => parseScript(fixture.replace(' location="B"', '')), /location.*(required|missing)/i);
  assert.throws(() => parseScript(fixture.replace('location="B"', 'location="  "')), /location.*(required|nonempty)/i);
});

test('rejects an unclosed production-note block with its part ID', () => {
  const malformed = fixture.replace('A rész saját gyártási megjegyzése.\n</production-note>', 'A rész saját gyártási megjegyzése.');
  assert.throws(() => parseScript(malformed), error => error instanceof ScriptFormatError && /part 401.*production-note/i.test(error.message));
});

test('rejects an unmatched structural closing tag with its part ID', () => {
  const malformed = fixture.replace('</narration>\n\n<screen-action>', '</narration>\n</narration>\n\n<screen-action>');
  assert.throws(() => parseScript(malformed), error => error instanceof ScriptFormatError && /part 401.*narration/i.test(error.message));
});

test('preserves a section-looking heading inside a nested code fence', () => {
  const withHeading = fixture.replace('const greeting = "hello";', '## Example code heading\nconst greeting = "hello";');
  const parsed = parseScript(withHeading);
  assert.deepEqual(parsed.parts.map(part => part.id), [401, 402, 403]);
  assert.match(byId(parsed.parts, 401).screenAction, /## Example code heading\nconst greeting/);
});

test('rejects the untouched legacy untagged script', () => {
  assert.throws(() => parseScript(legacy), error => error instanceof ScriptFormatError && /tagged|metadata|format/i.test(error.message));
});

test('combines chapter, clip, location, and status filters with narration-only search', () => {
  const parsed = parseScript(fixture);
  const recorded = new Set([401]);
  const matches = filterParts(parsed.parts, {
    chapter: 'A — Első fejezet', clipType: 'talking head', location: 'A', status: 'recorded', recorded,
  });
  assert.deepEqual(matches.map(part => part.id), [401]);
  assert.deepEqual(filterParts(parsed.parts, { search: 'SCREENONLY' }), []);
  assert.deepEqual(filterParts(parsed.parts, { search: 'második rész' }).map(part => part.id), [402]);
  assert.deepEqual(filterParts(parsed.parts, { location: 'B' }).map(part => part.id), [402]);
});

test('navigates in document order without wrapping at either boundary', () => {
  const parsed = parseScript(fixture);
  const matches = [byId(parsed.parts, 401), byId(parsed.parts, 403)];
  assert.equal(navigateMatches(matches, 401, 1).id, 403);
  assert.equal(navigateMatches(matches, 403, 1), null);
  assert.equal(navigateMatches(matches, 401, -1), null);
  assert.equal(navigateMatches(matches, 999, 1).id, 401);
});
