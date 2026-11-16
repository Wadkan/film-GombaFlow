async function runViewer(adapter) {
  try {
    if (adapter.readState) return await runOfflineViewer(adapter);
    const file = await adapter.pick();
    if (!file) return;
    const markdown = await adapter.read(file);
    core.parseScript(markdown);
    await adapter.render(markdown);
  } catch (error) {
    await adapter.showError('MD megnyitása: ' + String(error.message || error));
  }
}

async function runOfflineViewer(adapter) {
  const library = await createLibrary(adapter, core);
  if (library.needsPicker) {
    const file = await adapter.pick();
    if (file) {
      const markdown = await adapter.read(file);
      await library.openMarkdown(markdown);
    }
  }
  const current = library.current;
  const markdown = current ? await adapter.readScript(library.state.topics[current.topicId].md_file) : '';
  await adapter.render(markdown, snapshot(library), async message => {
    if (message.type === 'open-md') {
      const file = await adapter.pick();
      if (!file) return { ok: true, cancelled: true };
      const selected = await adapter.read(file);
      const opened = await library.openMarkdown(selected);
      if (adapter.replaceReader) await adapter.replaceReader(selected, snapshot(library));
      return { ok: true, opened: { topicId: opened.topicId, partId: opened.partId } };
    }
    if (message.type === 'open-topic') {
      const opened = await library.openTopic(message.topicId);
      const selected = await adapter.readScript(library.state.topics[message.topicId].md_file);
      if (adapter.replaceReader) await adapter.replaceReader(selected, snapshot(library));
      return { ok: true, opened: { topicId: opened.topicId, partId: opened.partId } };
    }
    if (message.type === 'delete' && !message.confirmed) {
      const confirmed = adapter.confirmDelete ? await adapter.confirmDelete(message.topicId) : false;
      if (!confirmed) return { ok: true, cancelled: true, state: snapshot(library) };
      message = { ...message, confirmed: true };
    }
    const previousTopic = library.current?.topicId;
    const updated = await library.update(message);
    if (message.type === 'delete' && updated?.deleted === previousTopic && adapter.replaceReader) await adapter.replaceReader('', snapshot(library));
    return { ok: true, current: updated, state: snapshot(library) };
  });
}

function snapshot(library) {
  const value = library.current;
  return { state: library.state, topicId: value?.topicId || null, partId: value?.partId || null,
    recorded: value?.recorded || {}, preferences: value?.preferences || clone(DEFAULT_PREFERENCES),
    topics: Object.keys(library.state.topics) };
}

const DEFAULT_PREFERENCES = {
  chapter: 'all', clip: 'all', location: 'all', status: 'not-recorded',
  types: { narration: true, screen: true, note: true }, search: '',
  topCollapsed: false, bottomCollapsed: false,
};

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function validateState(value) {
  if (!value || value.schema_version !== 1 || !value.topics || typeof value.topics !== 'object'
      || Array.isArray(value.topics) || !value.preferences || typeof value.preferences !== 'object'
      || (value.last_topic_id !== null && typeof value.last_topic_id !== 'string')) {
    throw new Error('Invalid or unsupported saved viewer state');
  }
  for (const [topicId, topic] of Object.entries(value.topics)) {
    if (!topic || typeof topic.md_file !== 'string' || !topic.md_file || typeof topic.recorded !== 'object'
        || !topic.recorded || Array.isArray(topic.recorded)
        || (topic.last_part_id !== null && typeof topic.last_part_id !== 'string')) {
      throw new Error(`Invalid saved topic state: ${topicId}`);
    }
    for (const [id, recorded] of Object.entries(topic.recorded)) {
      if (!/^[1-9]\d*$/.test(id) || typeof recorded !== 'boolean') throw new Error(`Invalid saved recording state: ${topicId}/${id}`);
    }
  }
  return value;
}

function createLibrary(adapter, core) {
  let state;
  let parsedByTopic = new Map();
  let queue = Promise.resolve();
  const fileFor = topicId => `topic-${encodeURIComponent(topicId)}.md`;
  const persist = async next => {
    await adapter.writeState(clone(next));
    state = next;
  };
  const current = () => {
    const topicId = state?.last_topic_id;
    if (!topicId || !state.topics[topicId]) return null;
    const topic = state.topics[topicId];
    return { topicId, parsed: parsedByTopic.get(topicId) || null, partId: topic.last_part_id,
      recorded: topic.recorded, preferences: state.preferences };
  };
  const transact = action => {
    const result = queue.then(async () => {
      const previous = clone(state);
      const next = clone(state);
      const response = await action(next);
      try {
        if (response?.persist !== false) await persist(next);
        if (response?.afterCommit) await response.afterCommit();
      } catch (error) {
        try { await response?.rollback?.(); } finally {
          await adapter.writeState(previous);
          state = previous;
        }
        throw error;
      }
      return response?.value;
    });
    queue = result.catch(() => {});
    return result;
  };
  const library = {
    get current() { return current(); },
    get state() { return clone(state); },
    get needsPicker() { return !state.last_topic_id; },
    async openMarkdown(markdown) {
      const parsed = core.parseScript(markdown);
      return transact(async next => {
        const old = next.topics[parsed.topicId];
        const name = old?.md_file || fileFor(parsed.topicId);
        const previousMarkdown = old ? await adapter.readScript(name) : null;
        await adapter.writeScript(name, markdown);
        const recorded = { ...(old?.recorded || {}) };
        for (const part of parsed.parts) if (recorded[part.id] === undefined) recorded[part.id] = false;
        next.topics[parsed.topicId] = { md_file: name, recorded, last_part_id: old?.last_part_id ?? String(parsed.parts[0].id) };
        next.preferences = next.preferences || clone(DEFAULT_PREFERENCES);
        next.last_topic_id = parsed.topicId;
        const previousParsed = parsedByTopic.get(parsed.topicId);
        parsedByTopic.set(parsed.topicId, parsed);
        return {
          value: { topicId: parsed.topicId, parsed, partId: next.topics[parsed.topicId].last_part_id },
          rollback: async () => {
            if (old) await adapter.writeScript(name, previousMarkdown);
            else await adapter.deleteScript(name);
            if (previousParsed) parsedByTopic.set(parsed.topicId, previousParsed);
            else parsedByTopic.delete(parsed.topicId);
          },
        };
      });
    },
    async openTopic(topicId) {
      return transact(async next => {
        const entry = next.topics[topicId];
        if (!entry) throw new Error(`Unknown saved topic: ${topicId}`);
        const markdown = await adapter.readScript(entry.md_file);
        const parsed = core.parseScript(markdown);
        if (parsed.topicId !== topicId) throw new Error(`Saved MD identity mismatch: ${topicId}`);
        parsedByTopic.set(topicId, parsed);
        next.last_topic_id = topicId;
        return { value: { topicId, parsed, partId: entry.last_part_id } };
      });
    },
    update(message) {
      return transact(async next => {
        const topicId = message.topicId || next.last_topic_id;
        const topic = next.topics[topicId];
        if (message.type === 'delete') {
          if (!message.confirmed) return { persist: false, value: { ok: true, cancelled: true } };
          if (topic) delete next.topics[topicId];
          if (next.last_topic_id === topicId) next.last_topic_id = null;
          return { value: { ok: true, deleted: topicId }, afterCommit: async () => { if (topic) await adapter.deleteScript(topic.md_file); } };
        }
        if (!topic) throw new Error(`Unknown saved topic: ${topicId}`);
        if (message.type === 'record') {
          const id = String(message.id);
          if (!/^[1-9]\d*$/.test(id) || !parsedByTopic.get(topicId)?.parts.some(part => part.id === Number(id))) throw new Error(`Unknown part: ${topicId}/${id}`);
          if (typeof message.value !== 'boolean') throw new Error('Recorded value must be boolean');
          topic.recorded[id] = message.value;
        } else if (message.type === 'cursor') {
          const id = String(message.id);
          if (!parsedByTopic.get(topicId)?.parts.some(part => part.id === Number(id))) throw new Error(`Unknown part: ${topicId}/${id}`);
          topic.last_part_id = id;
        } else if (message.type === 'preferences') {
          next.preferences = { ...next.preferences, ...message.value,
            types: { ...next.preferences.types, ...(message.value?.types || {}) } };
        } else throw new Error(`Unknown library action: ${message.type}`);
        next.last_topic_id = topicId;
        return { value: { ok: true, current: { topicId, partId: topic.last_part_id, recorded: topic.recorded, preferences: next.preferences } } };
      });
    },
  };
  return (async () => {
    const saved = await adapter.readState();
    if (saved == null) {
      state = { schema_version: 1, topics: {}, preferences: clone(DEFAULT_PREFERENCES), last_topic_id: null };
    } else {
      state = validateState(clone(saved));
      state.preferences = { ...clone(DEFAULT_PREFERENCES), ...state.preferences,
        types: { ...DEFAULT_PREFERENCES.types, ...(state.preferences.types || {}) } };
      for (const [topicId, topic] of Object.entries(state.topics)) {
        const markdown = await adapter.readScript(topic.md_file);
        if (typeof markdown !== 'string') throw new Error(`Saved script is missing: ${topicId}`);
        const parsed = core.parseScript(markdown);
        if (parsed.topicId !== topicId) throw new Error(`Saved MD identity mismatch: ${topicId}`);
        parsedByTopic.set(topicId, parsed);
      }
      if (state.last_topic_id && !state.topics[state.last_topic_id]) throw new Error('Last topic is missing from saved library');
    }
    return library;
  })();
}

module.exports = { createLibrary, runViewer };
