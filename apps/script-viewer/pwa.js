(function () {
  'use strict';

  let storage;
  let activeTopic = null;
  let fileInput;
  let exchangeInput;
  let actionQueue = Promise.resolve();
  let updateInProgress = false;
  let updateRegistration = null;
  let updateReloadRequested = false;

  function setSaveStatus(message) {
    document.getElementById('saveStatus').textContent = message;
  }

  async function saveLocally(write) {
    setSaveStatus('Mentés…');
    try {
      await write();
      setSaveStatus('Mentve');
    } catch (error) {
      setSaveStatus('Mentési hiba');
      throw error;
    }
  }

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
    setSaveStatus('Mentve');
    window.viewerOpen(topic.markdown, topicState(state, topicId));
    document.getElementById('exportChecksBtn').disabled = false;
    document.getElementById('importChecksBtn').disabled = false;
  }

  async function openLibrary() {
    const state = await storage.read();
    activeTopic = null;
    window.viewerShowLibrary({ topics: Object.keys(state.topics) });
    document.getElementById('exportChecksBtn').disabled = true;
    document.getElementById('importChecksBtn').disabled = true;
  }

  async function handleFile(file) {
    const markdown = await file.text();
    const parsed = core.parseScript(markdown);
    await saveLocally(() => storage.saveTopic({
      topicId: parsed.topicId,
      markdown,
      partIds: parsed.parts.map(part => String(part.id)),
    }));
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
        await saveLocally(() => storage.setRecorded(action.topicId, String(action.id), action.value));
        break;
      case 'import-recorded':
        await saveLocally(() => storage.mergeRecorded(action.topicId, action.recorded));
        break;
      case 'cursor':
        await saveLocally(() => storage.setLastPart(action.topicId, String(action.id)));
        break;
      case 'preferences':
        await saveLocally(() => storage.savePreferences(action.value));
        break;
      case 'delete': {
        if (!window.confirm(`Törlöd a(z) ${action.topicId} scriptet és a hozzá tartozó pipákat?`)) return { ok: true };
        await saveLocally(() => storage.deleteTopic(action.topicId));
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

  function prepareOfflineProgram() {
    const offlineStatus = document.getElementById('offlineStatus');
    const updateStatus = document.getElementById('updateStatus');
    const updateBtn = document.getElementById('updateBtn');
    const worker = navigator.serviceWorker;
    if (!worker || !window.isSecureContext) {
      offlineStatus.textContent = 'Nincs offline mód';
      updateStatus.textContent = 'Frissítés nem érhető el';
      updateBtn.disabled = true;
      return;
    }

    const preparationTimeout = setTimeout(() => finishPreparation(), 15000);
    function finishPreparation() {
      clearTimeout(preparationTimeout);
      offlineStatus.textContent = worker.controller
        ? 'Offline kész'
        : 'Offline hiba';
    }

    worker.addEventListener('controllerchange', finishPreparation);
    if (worker.controller) finishPreparation();
    worker.register('/sw.js').then(registration => {
      updateRegistration = registration;
      const watchInstallation = () => {
        const installing = registration.installing;
        if (!installing || worker.controller) return;
        const checkInstallation = () => {
          if (installing.state === 'redundant') finishPreparation();
        };
        installing.addEventListener('statechange', checkInstallation);
        checkInstallation();
      };
      registration.addEventListener('updatefound', watchInstallation);
      watchInstallation();
    }).catch(finishPreparation);
  }

  async function requestUpdate() {
    if (updateInProgress) return;
    const updateBtn = document.getElementById('updateBtn');
    const updateStatus = document.getElementById('updateStatus');
    if (!updateRegistration) {
      updateStatus.textContent = 'Frissítési hiba';
      return;
    }
    updateInProgress = true;
    updateBtn.disabled = true;
    updateStatus.textContent = 'Frissítés ellenőrzése…';

    try {
      await actionQueue;
      if (updateRegistration.waiting) {
        await activateWaitingWorker(updateRegistration, updateStatus);
        return;
      }

      await updateRegistration.update();
      if (updateRegistration.waiting) {
        await activateWaitingWorker(updateRegistration, updateStatus);
        return;
      }

      const installing = updateRegistration.installing;
      if (!installing) {
        updateStatus.textContent = 'Aktuális verzió';
        updateInProgress = false;
        updateBtn.disabled = false;
        return;
      }

      await new Promise((resolve, reject) => {
        const onStateChange = () => {
          if (installing.state === 'installed') resolve();
          else if (installing.state === 'redundant') reject(new Error('A frissítés telepítése sikertelen.'));
        };
        installing.addEventListener('statechange', onStateChange);
        onStateChange();
      });
      await activateWaitingWorker(updateRegistration, updateStatus);
    } catch (error) {
      updateStatus.textContent = 'Frissítési hiba';
      updateInProgress = false;
      updateBtn.disabled = false;
    }
  }

  async function activateWaitingWorker(registration, updateStatus) {
    await actionQueue;
    updateStatus.textContent = 'Frissítés telepítése…';
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!updateInProgress || updateReloadRequested) return;
      updateReloadRequested = true;
      window.location.reload();
    }, { once: true });
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  async function start() {
    prepareOfflineProgram();
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
    exchangeInput = document.createElement('input');
    exchangeInput.type = 'file';
    exchangeInput.accept = 'application/json,.json';
    exchangeInput.id = 'checkmarkFile';
    exchangeInput.style.position = 'fixed';
    exchangeInput.style.left = '-10000px';
    document.body.appendChild(exchangeInput);
    const showLibrary = window.viewerShowLibrary;
    window.viewerShowLibrary = view => {
      activeTopic = null;
      document.getElementById('exportChecksBtn').disabled = true;
      document.getElementById('importChecksBtn').disabled = true;
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
    exchangeInput.addEventListener('change', async () => {
      const file = exchangeInput.files?.[0];
      exchangeInput.value = '';
      if (!file || !activeTopic) return;
      try {
        const state = await storage.read();
        const topic = state.topics[activeTopic];
        if (!topic) throw new Error('A kiválasztott script már nem található.');
        const parsed = core.parseScript(topic.markdown);
        const payload = window.GombaFlowProgress.validateImport(JSON.parse(await file.text()), {
          topicId: activeTopic, partIds: parsed.parts.map(part => String(part.id)),
        });
        if (!window.confirm(`Az export készült: ${payload.exported_at}. Hozzáadod a pipákat? A már felvett részek pipája nem törlődik.`)) return;
        await send({ type: 'import-recorded', topicId: activeTopic, recorded: payload.recorded });
        await openTopic(activeTopic);
      } catch (error) { window.viewerShowError(error); }
    });
    window.viewerHost = { send };
    document.getElementById('updateBtn').onclick = requestUpdate;
    document.getElementById('exportChecksBtn').onclick = async () => {
      if (!activeTopic) return;
      try {
        const state = await storage.read();
        const topic = state.topics[activeTopic];
        if (!topic) throw new Error('A kiválasztott script már nem található.');
        const parsed = core.parseScript(topic.markdown);
        const payload = window.GombaFlowProgress.createExport({
          topicId: activeTopic, partIds: parsed.parts.map(part => String(part.id)), recorded: topic.recorded,
        });
        const blob = new Blob([JSON.stringify(payload, null, 2) + '\n'], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeTopic}-${payload.exported_at.replace(/[:.]/g, '-')}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (error) { window.viewerShowError(error); }
    };
    document.getElementById('importChecksBtn').onclick = () => { if (activeTopic) exchangeInput.click(); };
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
