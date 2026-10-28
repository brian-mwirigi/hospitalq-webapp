import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { fetchWithRetry } from '../src/resilientFetch.js';
import { searchWorkers } from '../src/quickfundiCtrl.js';

function listen(handler) {
  return new Promise((resolve) => {
    const server = createServer(handler);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

function callSearch(jobType, location) {
  return new Promise((resolve, reject) => {
    const req = { query: { jobType, location } };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        resolve({ status: this.statusCode, body });
      },
    };
    searchWorkers(req, res, reject);
  });
}

test('a 404 is returned once and a 500 is tried three times', async () => {
  let hits = 0;
  const { server, url } = await listen((req, res) => {
    hits += 1;
    if (req.url.startsWith('/missing')) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'nope' }));
      return;
    }
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Internal error' }));
  });
  try {
    const missing = await fetchWithRetry(`${url}/missing`, {}, { timeoutMs: 1500, retries: 2, delayMs: 10 });
    assert.equal(missing.status, 404);
    assert.equal(hits, 1);

    const started = hits;
    const failed = await fetchWithRetry(`${url}/boom`, {}, { timeoutMs: 1500, retries: 2, delayMs: 10 });
    assert.equal(failed.status, 500);
    assert.equal(hits - started, 3);
  } finally {
    server.close();
  }
});

test('a POST is not retried', async () => {
  let hits = 0;
  const { server, url } = await listen((req, res) => {
    hits += 1;
    res.writeHead(503);
    res.end('no');
  });
  try {
    const res = await fetchWithRetry(
      url,
      { method: 'POST' },
      { timeoutMs: 1500, retries: 2, delayMs: 10 }
    );
    assert.equal(res.status, 503);
    assert.equal(hits, 1);
  } finally {
    server.close();
  }
});

test('a slow partner is cut off and a later search can show the saved list', async () => {
  let hang = false;
  const { server, port } = await new Promise((resolve) => {
    const server = createServer((req, res) => {
      if (hang) return;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify([
          {
            id: 'wk_1',
            name: 'Ada',
            jobType: 'plumber',
            location: 'Lab',
            rating: 5,
            ratePerHour: 100,
          },
        ])
      );
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });

  const previous = process.env.PARTNER_URL;
  process.env.PARTNER_URL = `http://127.0.0.1:${port}`;
  try {
    const live = await callSearch('plumber', 'Lab-resilience');
    assert.equal(live.status, 200);
    assert.equal(live.body.stale, false);
    assert.equal(live.body.data[0].name, 'Ada');

    hang = true;
    const started = Date.now();
    const saved = await callSearch('plumber', 'Lab-resilience');
    const elapsed = Date.now() - started;
    assert.equal(saved.body.stale, true);
    assert.equal(saved.body.data[0].name, 'Ada');
    assert.ok(elapsed < 9000, `waited ${elapsed}ms`);
  } finally {
    if (previous === undefined) delete process.env.PARTNER_URL;
    else process.env.PARTNER_URL = previous;
    server.close();
  }
});
