# Security audit

Week 9. HospitalQ. Consumers are Team 1 (KaziBuddy / Juakali) and our own staff app. Each has its own key. The keys are in `API_KEYS` on the server, not in this file.

## What we checked

Sensitive fields. Login and `GET /api/auth/me` were returning the user document fields the screen does not need (`isActive`, `createdAt`, `updatedAt`). The password field is `select: false` on the User model and was not in those JSON bodies. Queue GETs already use an explicit field list (`shapeQueueEntry`). Department list already used `shapeDepartment`. `GET /api/departments/:slug`, create, update, and deactivate were still sending the raw Mongo document, including `__v` and timestamps. The analytics redirect was spreading the whole department document into `quieterDepartment`. SMS logs were returning the raw documents.

Other people's data. Queue and stats take a department id. Any caller with a valid key can read any department's queue. That is the contract: KaziBuddy is supposed to see the waiting list and the wait time. There is no per-patient private account. Tickets are not hidden behind another user's id. Changing the id returns that department, or 404 if it is not a department. Staff actions (done, skip, delete, create department) still need a staff JWT and a role. A key alone cannot do those.

Error messages. The error handler was sending `err.message` on every failure. A Mongoose cast or validation error can include a path and a model name. 500s could also echo an internal message. Stack traces were not sent. Morgan's dev format does not log the `X-API-Key` header. Startup logs the count of keys loaded, not the keys.

Write endpoints. `POST /api/queue` copies `patientName`, `department`, `priority`, `notes`, `patientPhone`, `patientAge`, and `gender`. An extra `isAdmin` or `id` on the body is ignored. Department create only reads `name`, `slug`, and `description`. Department update only reads `name`, `slug`, `description`, and `isActive`, and only an admin JWT can call it. Login does not write user fields from the body except email and password, and it only uses them to look the user up.

Keys in the wrong place. `.gitignore` already ignores `server/.env`, `.env`, and `client/.env.local`. `server/.env.example` and this audit use placeholders. The README uses `<your-api-key>`. The staff app has to send a key from the browser, so `VITE_API_KEY` is baked into the frontend bundle. That value is the staff app's own key. The Team 1 key is not in the client and not in git.

## What we found, and what we fixed

- `GET /api/auth/me` now returns the same user fields as login: `_id`, `name`, `email`, `role`, `department`.
- Department slug, create, update, and deactivate responses go through `shapeDepartment`.
- Redirect suggestion returns `_id`, `name`, `slug`, and `waiting` for the quieter department.
- SMS log rows return `_id`, `to`, `message`, `status`, `createdAt`, and the department name and slug. The phone number stays because the admin screen shows who the mock SMS was for. That route still needs an admin or receptionist JWT plus the API key.
- Cast, validation, and 500 errors no longer send the raw exception text.
- Every `/api` route checks `X-API-Key` before the handler. `GET /` stays open. It only reports the process name and whether Mongo is connected. `/docs` stays open because it is the spec page and it returns no records.

Nothing else in the contract responses was a password hash, a staff token, or another hospital's data.

## Rate limit

100 requests per key per minute. KaziBuddy's normal use is a handful of calls per check-in (departments, queue, stats, maybe one POST). 100 leaves room for a refresh loop and still cuts off a runaway script inside a minute. The limiter is the in-memory one from the handout. It resets when the process restarts, and on Vercel it is per instance, not global.

We proved it with the limit temporarily set to 3 and five calls in a row. Then we set it back to 100.

```
200 200 200 429 429
```

The 429 body is `{ "success": false, "message": "Too many requests", "error": "RATE_LIMITED", "retryAfter": <seconds> }` and the response has a `Retry-After` header. `server/test/security.test.js` covers the no-key 401, the wrong-key 401, a valid key returning 200, and this 429.

There was no Week 7 test suite in the repo. This file is the suite.
