const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const appDir = path.resolve(__dirname, '..');

async function serveStorage() {
  const server = http.createServer((request, response) => {
    if (request.url === '/storage.js' && fs.existsSync(path.join(appDir, 'storage.js'))) {
      response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
      response.end(fs.readFileSync(path.join(appDir, 'storage.js')));
      return;
    }
    if (request.url === '/storage.js') {
      response.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8' });
      response.end('');
      return;
    }
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><html><body><script src="/storage.js"></script></body></html>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return server;
}

test('stores topic content and acknowledged recorded values in IndexedDB', async ({ page }) => {
  const server = await serveStorage();
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await expect.poll(() => page.evaluate(() => typeof window.GombaFlowStorage)).toBe('object');
    const state = await page.evaluate(async () => {
      const storage = await window.GombaFlowStorage.open();
      await storage.saveTopic({ topicId: 'TOPIC-A', markdown: '# a', partIds: ['1'] });
      await storage.setRecorded('TOPIC-A', '1', true);
      await storage.setRecorded('TOPIC-A', '1', false);
      const saved = await storage.read();
      storage.close();
      return saved;
    });

    expect(state.schema_version).toBe(1);
    expect(state.topics['TOPIC-A']).toEqual({
      markdown: '# a',
      recorded: { '1': false },
      last_part_id: null,
    });
    expect(state.last_topic_id).toBe('TOPIC-A');
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('preserves current state on reimport and serializes writes across pages', async ({ page }) => {
  const server = await serveStorage();
  const secondPage = await page.context().newPage();
  try {
    const url = `http://127.0.0.1:${server.address().port}/`;
    await page.goto(url);
    await secondPage.goto(url);
    const state = await page.evaluate(async () => {
      const storage = await window.GombaFlowStorage.open();
      await storage.saveTopic({ topicId: 'TOPIC-A', markdown: '# original', partIds: ['1', '2'] });
      await storage.setRecorded('TOPIC-A', '1', true);
      await storage.setLastPart('TOPIC-A', '1');
      await storage.savePreferences({ search: 'first' });
      await storage.saveTopic({ topicId: 'TOPIC-A', markdown: '# updated', partIds: ['1', '3'] });
      return storage.read();
    });
    expect(state.topics['TOPIC-A']).toEqual({
      markdown: '# updated',
      recorded: { '1': true, '2': false, '3': false },
      last_part_id: '1',
    });
    expect(state.preferences.search).toBe('first');

    await Promise.all([
      page.evaluate(async () => {
        const storage = await window.GombaFlowStorage.open();
        await storage.setRecorded('TOPIC-A', '2', true);
        storage.close();
      }),
      secondPage.evaluate(async () => {
        const storage = await window.GombaFlowStorage.open();
        await storage.savePreferences({ search: 'second' });
        storage.close();
      }),
    ]);
    const latest = await page.evaluate(async () => {
      const storage = await window.GombaFlowStorage.open();
      const saved = await storage.read();
      storage.close();
      return saved;
    });
    expect(latest.topics['TOPIC-A'].recorded['2']).toBe(true);
    expect(latest.preferences.search).toBe('second');
  } finally {
    await secondPage.close();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('keeps preferences without a topic, deletes data together, and rejects invalid state', async ({ page }) => {
  const server = await serveStorage();
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const result = await page.evaluate(async () => {
      const storage = await window.GombaFlowStorage.open();
      await storage.savePreferences({ search: 'saved without topic' });
      await storage.saveTopic({ topicId: 'TOPIC-A', markdown: '# a', partIds: ['1'] });
      await storage.setRecorded('TOPIC-A', '1', true);
      await storage.deleteTopic('TOPIC-A');
      const afterDelete = await storage.read();
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('gombaflow-viewer', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      await new Promise((resolve, reject) => {
        const transaction = db.transaction('library', 'readwrite');
        transaction.objectStore('library').put({ schema_version: 99 }, 'state');
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
      db.close();
      let invalidStateError = null;
      try { await storage.read(); } catch (error) { invalidStateError = error.message; }
      storage.close();
      return { afterDelete, invalidStateError };
    });

    expect(result.afterDelete.topics).toEqual({});
    expect(result.afterDelete.last_topic_id).toBe(null);
    expect(result.afterDelete.preferences.search).toBe('saved without topic');
    expect(result.invalidStateError).toBeTruthy();
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('aborts an invalid topic write without changing the stored library', async ({ page }) => {
  const server = await serveStorage();
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const result = await page.evaluate(async () => {
      const storage = await window.GombaFlowStorage.open();
      await storage.saveTopic({ topicId: 'TOPIC-A', markdown: '# a', partIds: ['1'] });
      let failure = null;
      try { await storage.saveTopic({ topicId: 'TOPIC-B', markdown: '# b', partIds: null }); }
      catch (error) { failure = error.message; }
      const state = await storage.read();
      storage.close();
      return { failure, state };
    });

    expect(result.failure).toBeTruthy();
    expect(Object.keys(result.state.topics)).toEqual(['TOPIC-A']);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test('rejects a prototype key without changing the existing library', async ({ page }) => {
  const server = await serveStorage();
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    const result = await page.evaluate(async () => {
      const storage = await window.GombaFlowStorage.open();
      await storage.saveTopic({ topicId: 'existing-topic', markdown: '# existing', partIds: ['1'] });
      await storage.setRecorded('existing-topic', '1', true);
      await storage.savePreferences({ search: 'preserve me' });
      let saveError = null;
      try { await storage.saveTopic({ topicId: '__proto__', markdown: '# hostile', partIds: ['1'] }); }
      catch (error) { saveError = error.message; }
      let state = null;
      let readError = null;
      try { state = await storage.read(); }
      catch (error) { readError = error.message; }
      storage.close();
      return { saveError, readError, state };
    });

    expect(result.saveError).toBeTruthy();
    expect(result.readError).toBe(null);
    expect(result.state.topics).toEqual({
      'existing-topic': { markdown: '# existing', recorded: { '1': true }, last_part_id: null },
    });
    expect(result.state.preferences.search).toBe('preserve me');
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
