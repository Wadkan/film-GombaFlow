(function (root) {
  'use strict';

  function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function validateTopicId(topicId) {
    if (typeof topicId !== 'string' || !topicId.trim() || Object.hasOwn(Object.prototype, topicId) || topicId === 'prototype') {
      throw new Error('Az export témája érvénytelen.');
    }
  }

  function validatePartIds(partIds) {
    if (!Array.isArray(partIds) || partIds.some(id => !/^(?:[1-9]\d*)$/.test(String(id))) ||
        new Set(partIds.map(String)).size !== partIds.length) throw new Error('A script részazonosítói érvénytelenek.');
    return partIds.map(String);
  }

  function createExport({ topicId, partIds, recorded, now = () => new Date() }) {
    validateTopicId(topicId);
    const ids = validatePartIds(partIds);
    if (!isRecord(recorded) || typeof now !== 'function') throw new Error('Az export adatai érvénytelenek.');
    const date = now();
    if (!(date instanceof Date) || !Number.isFinite(date.getTime())) throw new Error('Az export dátuma érvénytelen.');
    const checks = {};
    for (const id of ids) checks[id] = recorded[id] === true;
    return { schema_version: 1, topic_id: topicId, exported_at: date.toISOString(), recorded: checks };
  }

  function validateImport(payload, { topicId, partIds }) {
    validateTopicId(topicId);
    const ids = validatePartIds(partIds);
    if (!isRecord(payload) || payload.schema_version !== 1 || !isRecord(payload.recorded)) {
      throw new Error('Az import séma nem támogatott.');
    }
    if (payload.topic_id !== topicId) throw new Error('Az import másik témához tartozik.');
    if (typeof payload.exported_at !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(payload.exported_at) ||
        !Number.isFinite(Date.parse(payload.exported_at)) || new Date(payload.exported_at).toISOString() !== payload.exported_at) {
      throw new Error('Az export dátuma érvénytelen.');
    }
    const allowed = new Set(ids);
    for (const [id, value] of Object.entries(payload.recorded)) {
      if (!allowed.has(id)) throw new Error(`Ismeretlen részazonosító: ${id}`);
      if (typeof value !== 'boolean') throw new Error('Minden felvételi érték csak boolean lehet.');
    }
    return { schema_version: 1, topic_id: topicId, exported_at: payload.exported_at, recorded: { ...payload.recorded } };
  }

  function mergeRecorded(local, incoming) {
    if (!isRecord(local) || !isRecord(incoming)) throw new Error('A felvételi állapot érvénytelen.');
    const merged = { ...local };
    for (const [id, value] of Object.entries(incoming)) merged[id] = local[id] === true || value === true;
    return merged;
  }

  const api = { createExport, validateImport, mergeRecorded };
  root.GombaFlowProgress = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis === 'undefined' ? this : globalThis);
