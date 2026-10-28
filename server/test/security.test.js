import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import express from 'express';
import { createApp } from '../src/app.js';
import { requireApiKey, rateLimit } from '../src/security.js';

process.env.API_KEYS = 'good-key,demo-key';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX = '100';

function listen(app) {
  return new Promise((resolve) => {
    const server = createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

test('a request with no API key gets 401', async () => {
  const { server, url } = await listen(createApp(null));
  try {
    const res = await fetch(`${url}/api/departments`);
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.error, 'INVALID_API_KEY');
    assert.equal(body.message, 'Missing or invalid API key');
  } finally {
    server.close();
  }
});

test('a request with the wrong API key gets 401', async () => {
  const { server, url } = await listen(createApp(null));
  try {
    const res = await fetch(`${url}/api/departments`, {
      headers: { 'X-API-Key': 'wrong' },
    });
    assert.equal(res.status, 401);
  } finally {
    server.close();
  }
});

test('a request with a valid API key gets 200', async () => {
  const app = express();
  app.use(requireApiKey);
  app.get('/tasks', (req, res) => {
    res.json({ ok: true });
  });
  const { server, url } = await listen(app);
  try {
    const res = await fetch(`${url}/tasks`, {
      headers: { 'X-API-Key': 'good-key' },
    });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
  } finally {
    server.close();
  }
});

test('five calls at a limit of 3 return 200 200 200 429 429', async () => {
  process.env.RATE_LIMIT_MAX = '3';
  const app = express();
  app.use(requireApiKey);
  app.use(rateLimit);
  app.get('/tasks', (req, res) => {
    res.json({ ok: true });
  });
  const { server, url } = await listen(app);
  const codes = [];
  try {
    for (let i = 0; i < 5; i += 1) {
      const res = await fetch(`${url}/tasks`, {
        headers: { 'X-API-Key': 'demo-key' },
      });
      codes.push(res.status);
      if (res.status === 429) {
        assert.ok(Number(res.headers.get('retry-after')) >= 1);
        const body = await res.json();
        assert.equal(body.message, 'Too many requests');
        assert.equal(body.error, 'RATE_LIMITED');
        assert.ok(body.retryAfter >= 1);
      }
    }
    console.log(codes.join(' '));
    assert.deepEqual(codes, [200, 200, 200, 429, 429]);
  } finally {
    process.env.RATE_LIMIT_MAX = '100';
    server.close();
  }
});
