import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApp } from '../src/app.js';
import { searchWorkers } from '../src/quickfundiCtrl.js';

function listen(app) {
  return new Promise((resolve) => {
    const server = createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

function callSearch() {
  return new Promise((resolve, reject) => {
    const req = { query: { jobType: 'plumber', location: 'Nairobi' } };
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

test('a dead partner returns 502 and our own health route still answers', async () => {
  const previous = process.env.PARTNER_URL;
  process.env.PARTNER_URL = 'http://127.0.0.1:59999';
  const { server, url } = await listen(createApp(null));
  try {
    const workers = await callSearch();
    assert.equal(workers.status, 502);
    assert.equal(workers.body.message, 'QuickFundi is unavailable right now.');
    assert.equal(workers.body.error, 'PARTNER_UNAVAILABLE');

    const health = await fetch(`${url}/`);
    assert.equal(health.status, 200);
  } finally {
    if (previous === undefined) delete process.env.PARTNER_URL;
    else process.env.PARTNER_URL = previous;
    server.close();
  }
});
