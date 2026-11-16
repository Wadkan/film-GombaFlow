(function () {
  'use strict';

  let storage;
  let activeTopic = null;
  let fileInput;
  let actionQueue = Promise.resolve();

  function topicState(state, topicId) {
    const topic = state.topics[topicId];
    if (!topic) throw new Error('A kiválasztott script már nem található.');
    return {
      topicId,
      partId: topic.last_part_id,
      recorded: topic.recorded,
      preferences: state.preferences,
      topics: Object.keys(state.topics),
    };
  }

  async function openTopic(topicId) {
    const state = await storage.read();
    const topic = state.topics[topicId];
    if (!topic) throw new Error('A kiválasztott script már nem található.');
    core.parseScript(topic.markdown);
    activeTopic = topicId;
    window.viewerOpen(topic.markdown, topicState(state, topicId));
  }

  async function openLibrary() {
    const state = await storage.read();
    activeTopic = null;
    window.viewerShowLibrary({ topics: Object.keys(state.topics) });
  }

  async function handleFile(file) {
    const markdown = await file.text();
    const parsed = core.parseScript(markdown);
    await storage.saveTopic({
      topicId: parsed.topicId,
      markdown,
      partIds: parsed.parts.map(part => String(part.id)),
    });
    if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
    await openTopic(parsed.topicId);
  }

  function chooseFile() {
    fileInput.value = '';
    fileInput.click();
  }

  async function applyAction(action) {
    switch (action.type) {
      case 'open-md':
        chooseFile();
        return { ok: true };
      case 'record':
        await storage.setRecorded(action.topicId, String(action.id), action.value);
        break;
      case 'cursor':
        await storage.setLastPart(action.topicId, String(action.id));
        break;
      case 'preferences':
        await storage.savePreferences(action.value);
        break;
      case 'delete': {
        if (!window.confirm(`Törlöd a(z) ${action.topicId} scriptet és a hozzá tartozó pipákat?`)) return { ok: true };
        await storage.deleteTopic(action.topicId);
        await openLibrary();
        break;
      }
      case 'open-topic':
        await openTopic(action.topicId);
        break;
      default:
        throw new Error('Ismeretlen offline könyvtárművelet.');
    }
    return { ok: true, state: await storage.read() };
  }

  function send(action) {
    const pending = actionQueue.then(() => applyAction(action));
    actionQueue = pending.catch(() => {});
    return pending;
  }

  async function start() {
    storage = await window.GombaFlowStorage.open();
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.md,text/markdown,text/plain';
    fileInput.id = 'scriptFile';
    fileInput.style.position = 'fixed';
    fileInput.style.left = '-10000px';
    fileInput.style.width = '1px';
    fileInput.style.height = '1px';
    fileInput.style.opacity = '0';
    document.body.appendChild(fileInput);
    const showLibrary = window.viewerShowLibrary;
    window.viewerShowLibrary = view => {
      activeTopic = null;
      return showLibrary(view);
    };
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        const pending = actionQueue.then(() => handleFile(file));
        actionQueue = pending.catch(() => {});
        await pending;
      }
      catch (error) { window.viewerShowError(error); }
    });
    window.viewerHost = { send };
    window.addEventListener('focus', async () => {
      try {
        const state = await storage.read();
        if (activeTopic && state.topics[activeTopic]) window.viewerOpen(state.topics[activeTopic].markdown, topicState(state, activeTopic));
        else if (!activeTopic) window.viewerShowLibrary({ topics: Object.keys(state.topics) });
      } catch (error) { window.viewerShowError(error); }
    });
    const state = await storage.read();
    if (state.last_topic_id) await openTopic(state.last_topic_id);
    else await openLibrary();
  }

  start().catch(window.viewerShowError);
})();
