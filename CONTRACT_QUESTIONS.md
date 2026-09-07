# Contract Questions

QuickFundi’s `openapi.yaml` had not arrived yet, so these three questions are about **our** HospitalQ contract (the handout fallback). We will swap them for QuickFundi-specific questions once Team 12 sends their spec.

## 1. POST `/api/queue` — how does KaziBuddy authenticate?

The body requires `patientName` and `department`, and the spec says this route needs a Bearer JWT from `POST /api/auth/login`. Login is a **staff** email/password (`reception@hospitalq.com`). There is no API-key or app-token scheme.

Question: is KaziBuddy expected to store a HospitalQ staff password, or did we forget to document a partner credential? The spec also has no `401` example, so it is unclear what they should do if the token expires mid-check-in.

## 2. GET `/api/queue/{deptId}` — how do they look up one ticket?

Need 4 was “notify the artisan when the doctor calls them.” This contract has no `GET /api/queue/ticket/{id}`. The only way to see status is to pull the whole department queue and search for a `ticketNumber`.

Question: is `_id` from the `201` create response the handle they should keep, and if so why is there no show-one-ticket route? Also the queue response includes full `patientName` with no auth, which does not match “only the person who made the ticket should look it up.”

## 3. GET `/api/analytics/overview` vs GET `/api/queue/{deptId}/stats` — which wait time is public?

Need 5 said average wait times do **not** need auth. In this spec, `/api/analytics/overview` is marked Bearer, and `/api/queue/{deptId}/stats` is public. Both return `predictedWaitMinutes`.

Question: should KaziBuddy call the public stats route only, and if `deptId` is wrong what do they get? Neither operation documents `404`. `busy` is also unexplained (the schema is a boolean with example `true`, but not when it flips).
