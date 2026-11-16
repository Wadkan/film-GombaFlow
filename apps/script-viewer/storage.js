(function (global) {
  'use strict';

  const databaseName = 'gombaflow-viewer';
  const databaseVersion = 1;
  const stateKey = 'state';

  function initialState() {
    return {
      schema_version: 1,
      topics: {},
      preferences: {
        chapter: 'all',
        clip: 'all',
        location: 'all',
        status: 'not-recorded',
        search: '',
        types: { narration: true, screen: true, note: true },
        topCollapsed: false,
        bottomCollapsed: false,
      },
      last_topic_id: null,
    };
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function validateState(state) {
    if (!isObject(state) || state.schema_version !== 1 || !isObject(state.topics) ||
        !isObject(state.preferences) || !(state.last_topic_id === null || typeof state.last_topic_id === 'string')) {
      throw new Error('Az offline könyvtár adatformátuma nem támogatott.');
    }
    const preferences = state.preferences;
    if (typeof preferences.chapter !== 'string' || typeof preferences.clip !== 'string' ||
        typeof preferences.location !== 'string' || !['all', 'recorded', 'not-recorded'].includes(preferences.status) ||
        typeof preferences.search !== 'string' || !isObject(preferences.types) ||
        ['narration', 'screen', 'note'].some(key => typeof preferences.types[key] !== 'boolean') ||
        typeof preferences.topCollapsed !== 'boolean' || typeof preferences.bottomCollapsed !== 'boolean') {
      throw new Error('Az offline könyvtár beállításai érvénytelenek.');
    }
    for (const [topicId, topic] of Object.entries(state.topics)) {
      if (!topicId || !isObject(topic) || typeof topic.markdown !== 'string' || !isObject(topic.recorded) ||
          !(topic.last_part_id === null || /^(?:[1-9]\d*)$/.test(topic.last_part_id)) ||
          Object.entries(topic.recorded).some(([id, value]) => !/^(?:[1-9]\d*)$/.test(id) || typeof value !== 'boolean')) {
        throw new Error('Az offline könyvtár egyik témája érvénytelen.');
      }
    }
    if (state.last_topic_id !== null && !Object.hasOwn(state.topics, state.last_topic_id)) {
      throw new Error('Az offline könyvtár utolsó témája hiányzik.');
    }
    return state;
  }

  function open() {
    return new Promise((resolve, reject) => {
      const request = global.indexedDB.open(databaseName, databaseVersion);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('library')) {
          request.result.createObjectStore('library');
        }
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Az offline könyvtár másik lapon van megnyitva.'));
      request.onsuccess = () => resolve(createStorage(request.result));
    });
  }

  function createStorage(database) {
    function transact(update) {
      return new Promise((resolve, reject) => {
        const transaction = database.transaction('library', 'readwrite');
        const store = transaction.objectStore('library');
        let result;
        const request = store.get(stateKey);
        request.onsuccess = () => {
          try {
            const state = request.result ? validateState(request.result) : initialState();
            result = update(state);
            store.put(state, stateKey);
          } catch (error) {
            transaction.abort();
            reject(error);
          }
        };
        request.onerror = () => transaction.abort();
        transaction.oncomplete = () => resolve(result);
        transaction.onabort = () => reject(transaction.error || new Error('Az offline mentés megszakadt.'));
        transaction.onerror = () => reject(transaction.error || new Error('Az offline mentés nem sikerült.'));
      });
    }

    return {
      read() {
        return new Promise((resolve, reject) => {
          const transaction = database.transaction('library', 'readonly');
          const request = transaction.objectStore('library').get(stateKey);
          let state;
          request.onsuccess = () => {
            try { state = request.result ? validateState(request.result) : initialState(); }
            catch (error) { reject(error); transaction.abort(); }
          };
          request.onerror = () => reject(request.error);
          transaction.oncomplete = () => resolve(state);
          transaction.onabort = () => reject(transaction.error || new Error('Az offline könyvtár nem olvasható.'));
        });
      },

      saveTopic({ topicId, markdown, partIds }) {
        return transact(state => {
          if (typeof topicId !== 'string' || !topicId || Object.hasOwn(Object.prototype, topicId) || topicId === 'prototype' ||
              typeof markdown !== 'string' || !Array.isArray(partIds) ||
              partIds.some(id => !/^(?:[1-9]\d*)$/.test(String(id))) || new Set(partIds.map(String)).size !== partIds.length) {
            throw new Error('A script adatai érvénytelenek.');
          }
          const previous = state.topics[topicId];
          const recorded = { ...(previous?.recorded || {}) };
          for (const id of partIds) {
            const key = String(id);
            if (!Object.hasOwn(recorded, key)) recorded[key] = false;
          }
          state.topics[topicId] = {
            markdown,
            recorded,
            last_part_id: previous?.last_part_id ?? null,
          };
          state.last_topic_id = topicId;
          return state;
        });
      },

      setRecorded(topicId, id, value) {
        return transact(state => {
          const topic = state.topics[topicId];
          if (!topic || !Object.hasOwn(topic.recorded, String(id)) || typeof value !== 'boolean') {
            throw new Error('A felvételi állapot nem menthető.');
          }
          topic.recorded[String(id)] = value;
          return state;
        });
      },

      mergeRecorded(topicId, incoming) {
        return transact(state => {
          const topic = state.topics[topicId];
          if (!topic || !isObject(incoming) || Object.entries(incoming).some(([id, value]) =>
            !Object.hasOwn(topic.recorded, id) || typeof value !== 'boolean')) {
            throw new Error('A pipák importálása nem sikerült.');
          }
          for (const [id, value] of Object.entries(incoming)) topic.recorded[id] = topic.recorded[id] === true || value === true;
          return state;
        });
      },

      setLastPart(topicId, id) {
        return transact(state => {
          const topic = state.topics[topicId];
          if (!topic || !Object.hasOwn(topic.recorded, String(id)) || !/^(?:[1-9]\d*)$/.test(String(id))) {
            throw new Error('A felvételi pozíció nem menthető.');
          }
          topic.last_part_id = String(id);
          return state;
        });
      },

      savePreferences(preferences) {
        return transact(state => {
          if (!isObject(preferences)) throw new Error('A beállítások érvénytelenek.');
          state.preferences = {
            ...state.preferences,
            ...preferences,
            types: { ...state.preferences.types, ...(preferences.types || {}) },
          };
          return state;
        });
      },

      deleteTopic(topicId) {
        return transact(state => {
          delete state.topics[topicId];
          if (state.last_topic_id === topicId) state.last_topic_id = null;
          return state;
        });
      },

      close() {
        database.close();
      },
    };
  }

  global.GombaFlowStorage = { open };
})(window);
