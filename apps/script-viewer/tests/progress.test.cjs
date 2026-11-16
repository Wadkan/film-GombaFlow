const { test } = require('node:test');
const assert = require('node:assert/strict');

const progressPromise = import('../progress.js').then(module => module.default || module).catch(() => ({}));

test('checkmark import merges all four boolean combinations with logical OR', async () => {
  const progress = await progressPromise;
  assert.equal(typeof progress.mergeRecorded, 'function');
  assert.deepEqual(progress.mergeRecorded({ '1': false, '2': false, '3': true, '4': true }, { '1': false, '2': true, '3': false, '4': true }), {
    '1': false, '2': true, '3': true, '4': true,
  });
});

test('false and omitted imported values preserve local state and repeated imports are idempotent', async () => {
  const progress = await progressPromise;
  assert.deepEqual(progress.mergeRecorded({ '1': true, '2': false }, { '1': false }), { '1': true, '2': false });
  const once = progress.mergeRecorded({ '1': false }, { '1': true });
  assert.deepEqual(progress.mergeRecorded(once, { '1': true }), once);
});

test('exports every current part including false checks with an injected UTC timestamp', async () => {
  const progress = await progressPromise;
  const exported = progress.createExport({
    topicId: 'gomba', partIds: ['1', '2', '3'], recorded: { '1': true, '3': true },
    now: () => new Date('2026-11-16T12:34:56.000Z'),
  });
  assert.deepEqual(exported, {
    schema_version: 1, topic_id: 'gomba', exported_at: '2026-11-16T12:34:56.000Z',
    recorded: { '1': true, '2': false, '3': true },
  });
});

test('validates exchange identity, schema, timestamp and every supplied part value before merge', async () => {
  const progress = await progressPromise;
  assert.equal(typeof progress.validateImport, 'function');
  const valid = { schema_version: 1, topic_id: 'gomba', exported_at: '2026-11-16T12:34:56.000Z', recorded: { '1': false } };
  assert.deepEqual(progress.validateImport(valid, { topicId: 'gomba', partIds: ['1', '2'] }), valid);
  for (const [payload, expected] of [
    [{ ...valid, schema_version: 2 }, /séma/],
    [{ ...valid, topic_id: 'masik' }, /tém/],
    [{ ...valid, exported_at: 'yesterday' }, /dátum/],
    [{ ...valid, recorded: { '1': 1 } }, /boolean/],
    [{ ...valid, recorded: { '3': true } }, /azonosító/],
  ]) assert.throws(() => progress.validateImport(payload, { topicId: 'gomba', partIds: ['1', '2'] }), expected);
  assert.throws(() => progress.validateImport(valid, { topicId: 'other', partIds: ['1', '2'] }), /tém/);
});

test('rejects malformed export identifiers and non-UTC or non-canonical timestamps', async () => {
  const progress = await progressPromise;
  assert.throws(() => progress.createExport({ topicId: '', partIds: [], recorded: {} }), /tém/);
  const valid = { schema_version: 1, topic_id: 'gomba', exported_at: '2026-11-16T12:34:56Z', recorded: {} };
  assert.throws(() => progress.validateImport({ ...valid, exported_at: '2026-11-16T12:34:56+01:00' }, { topicId: 'gomba', partIds: [] }), /dátum/);
});
