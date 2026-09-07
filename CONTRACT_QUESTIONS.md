# Contract Questions

We sent our openapi.yaml to KaziBuddy. QuickFundi still hasnt sent theirs so we reviewed our own spec like the lab said.

## 1. Login for POST /api/queue

To create a ticket you need a Bearer token from POST /api/auth/login, and login is just a staff email and password like reception@hospitalq.com. We never made an api key for partner apps.

If KaziBuddy uses this, do they log in as our receptionist? We also didnt put a 401 response so they wont know what happens when the token dies.

## 2. No way to fetch one ticket

KaziBuddy wanted to ping a ticket when the doctor calls the artisan. We only have GET /api/queue/{deptId} which dumps the whole line. There is no GET for one ticket by id.

After POST /api/queue they get back an _id and a ticketNumber. Which one are they supposed to save? Also that queue endpoint is public and sends the full patientName. We told them names would be hidden.

## 3. Two different wait time endpoints

GET /api/queue/{deptId}/stats is public and has predictedWaitMinutes. GET /api/analytics/overview has the same kind of number but it needs a token. In week 2 we said wait times dont need auth.

Which one should they actually call? And if they pass a fake deptId, stats has no 404 in the spec. Also busy is just true/false with no note on what counts as busy.
