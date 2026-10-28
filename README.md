# HospitalQ API

HospitalQ is the hospital queue API that KaziBuddy calls. It lists the open departments, shows who is waiting, predicts the wait, and checks a patient in. The people using it are the KaziBuddy app, not hospital staff. Staff screens live in this same repo, but they are not part of this contract.

The rendered docs are in `docs/index.html`. Open that file in a browser. You do not need to start the server to read it. It lists every contract route: login, departments, the queue, queue stats, check-in, and the overview. Each one shows the request body (when there is one) and the response body.

If the API is already running, the same spec is also at http://localhost:5000/docs.

## Run it locally

You need Node, and MongoDB already listening on `127.0.0.1:27017`. A fresh clone has no database of its own.

From the repo root, in PowerShell:

```
npm run install-all
Copy-Item server\.env.example server\.env
npm run seed
npm run dev --prefix server
```

Leave that window open. The API is http://localhost:5000.

`server/.env.example` already has a local `JWT_SECRET`. Login will fail if that line is empty. Do not commit `server/.env`.

Seed creates three departments (Dental, General OPD, Pediatrics) and three users. Password for all of them is `password123`.

- reception@hospitalq.com
- doctor@hospitalq.com
- admin@hospitalq.com

The website is optional. `npm run dev` from the repo root starts the API and the React app at http://localhost:5173.

On Windows PowerShell, `curl` is not curl. The commands below use `curl.exe`. If you are in Git Bash or on a Mac, use `curl` instead.

## Auth

Every `/api` call needs your own key in a header. There is no shared key. A missing or wrong key is **401**, and the handler does not run.

```
X-API-Key: <your-api-key>
```

No key:

```
curl.exe -i http://localhost:5000/api/departments
```

```json
{
  "success": false,
  "message": "Missing or invalid API key",
  "error": "INVALID_API_KEY"
}
```

A wrong key is the same 401. `GET /` is the only open route. It only says whether the process is up. It returns no queue data. `/docs` is the spec page, also with no records.

Each key can send **100 requests per minute**. The 101st is **429**. The response has a `Retry-After` header (seconds) and a JSON body:

```json
{
  "success": false,
  "message": "Too many requests",
  "error": "RATE_LIMITED",
  "retryAfter": 30
}
```

100 per minute is enough for KaziBuddy to list departments, check a queue, and check someone in, and it still stops a buggy loop. The count lives in this server's memory. It resets on restart, and it is not shared across copies.

Login is a second step, and it also needs the API key. It does not create a row. A good login is **200**, not 201. Copy `data.token` from the response. Send it on the two staff-locked routes as `Authorization: Bearer <token>`.

Those routes are `POST /api/queue` and `GET /api/analytics/overview`. The other GETs still need the API key. They do not need the staff token.

Token lasts 8 hours. When it dies, log in again. There is no refresh route.

On Windows, `curl.exe` deletes quotes in the body unless they have a backslash in front. Leave the backslashes in. If you take them out, login comes back 400 and the body is not JSON.

```
curl.exe -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -H "X-API-Key: <your-api-key>" -d '{\"email\":\"reception@hospitalq.com\",\"password\":\"password123\"}'
```

What we got back, 200:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhY2ZkODZhZjEwN2M5M2Y3YWQzNmFkYyIsImlhdCI6MTc5MjAwNjI3MCwiZXhwIjoxNzkyMDM1MDcwfQ.cu3smvG9GEp7s599lELoD3F9p50JJkngDU8BueX7NZU",
    "user": {
      "_id": "6acfd86af107c93f7ad36adc",
      "name": "Reception Desk",
      "email": "reception@hospitalq.com",
      "role": "receptionist",
      "department": null
    }
  },
  "message": "Login successful"
}
```

Use the token from your own login. The one above is from our database and will not work on yours. `_id` values below are the same story. Names and status codes are what you should match.

## One command to try first

This one needs no token and no id. Run it after seed.

```
curl.exe http://localhost:5000/api/departments -H "X-API-Key: <your-api-key>"
```

200:

```json
{
  "success": true,
  "data": [
    {
      "_id": "6acfd86af107c93f7ad36ad8",
      "name": "Dental",
      "slug": "dental",
      "description": "Dental clinic",
      "isActive": true
    },
    {
      "_id": "6acfd86af107c93f7ad36ad2",
      "name": "General OPD",
      "slug": "general-opd",
      "description": "General outpatient department",
      "isActive": true
    },
    {
      "_id": "6acfd86af107c93f7ad36ad5",
      "name": "Pediatrics",
      "slug": "pediatrics",
      "description": "Children and infant care",
      "isActive": true
    }
  ]
}
```

Copy the `_id` for General OPD. The next commands call that value `DEPT_ID`. Ours was `6acfd86af107c93f7ad36ad2`. Yours will be different. If you paste ours, you get 404.

## GET /api/queue/DEPT_ID

Today's tickets for that department. API key, no staff token.

```
curl.exe http://localhost:5000/api/queue/DEPT_ID -H "X-API-Key: <your-api-key>"
```

200 after one check-in. An empty day is `"data": []`, which is still a 200.

```json
{
  "success": true,
  "data": [
    {
      "_id": "6acfd87ebd054bd929956976",
      "ticketNumber": 1,
      "patientName": "Mary Wanjiku",
      "patientPhone": "0712345678",
      "status": "waiting",
      "priority": "urgent",
      "department": {
        "_id": "6acfd86af107c93f7ad36ad2",
        "name": "General OPD",
        "slug": "general-opd"
      },
      "createdAt": "2026-10-14T19:31:10.615Z",
      "calledAt": null
    }
  ]
}
```

`ticketNumber` is a number. `calledAt` is null until someone is called. Notes are saved on check-in but they are not in this JSON.

## GET /api/queue/DEPT_ID/stats

```
curl.exe http://localhost:5000/api/queue/DEPT_ID/stats -H "X-API-Key: <your-api-key>"
```

200:

```json
{
  "success": true,
  "data": {
    "total": 1,
    "waiting": 1,
    "done": 0,
    "inProgress": 0,
    "noShow": 0,
    "walkOuts": 0,
    "avgWaitMinutes": 10,
    "predictedWaitMinutes": 10
  }
}
```

If nobody has finished a visit today, `avgWaitMinutes` is 10. `walkOuts` is the same number as `noShow`.

## POST /api/queue

Needs the bearer token. `patientName` and `department` are required. `priority` is `normal` or `urgent`.

```
curl.exe -s -X POST http://localhost:5000/api/queue -H "Content-Type: application/json" -H "X-API-Key: <your-api-key>" -H "Authorization: Bearer TOKEN" -d '{\"patientName\":\"Mary Wanjiku\",\"department\":\"DEPT_ID\",\"priority\":\"urgent\",\"patientPhone\":\"0712345678\"}'
```

201. Replace `TOKEN` and `DEPT_ID` before you run it. Posting the same body again creates a second ticket. That is a create, not an update.

```json
{
  "success": true,
  "data": {
    "_id": "6acfd87ebd054bd929956976",
    "ticketNumber": 1,
    "patientName": "Mary Wanjiku",
    "patientPhone": "0712345678",
    "status": "waiting",
    "priority": "urgent",
    "department": {
      "_id": "6acfd86af107c93f7ad36ad2",
      "name": "General OPD",
      "slug": "general-opd"
    },
    "createdAt": "2026-10-14T19:31:10.615Z",
    "calledAt": null
  },
  "message": "Patient added to queue (mock SMS saved)"
}
```

The message says mock SMS when `patientPhone` is sent. Without a phone it says `Patient added to queue`.

## GET /api/analytics/overview

Needs the bearer token.

```
curl.exe http://localhost:5000/api/analytics/overview -H "X-API-Key: <your-api-key>" -H "Authorization: Bearer TOKEN"
```

200:

```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "departmentId": "6acfd86af107c93f7ad36ad2",
        "name": "General OPD",
        "slug": "general-opd",
        "waiting": 1,
        "avgConsultMinutes": 10,
        "predictedWaitMinutes": 10,
        "busy": false
      }
    ],
    "totals": {
      "waiting": 1,
      "done": 0
    }
  }
}
```

`busy` is true when 5 or more people are waiting in that department. Dental and Pediatrics are in the same list. We cut them out of the sample above so it fits. Your response will have all three.

## Errors

A failed call is still JSON. `success` is false. Read `error`, not the HTTP status alone.

No token on a locked route, 401:

```
curl.exe http://localhost:5000/api/analytics/overview -H "X-API-Key: <your-api-key>"
```

```json
{
  "success": false,
  "message": "Not authorized. Please log in.",
  "error": "NO_TOKEN"
}
```

Wrong password, 401. This command works as written.

```
curl.exe -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -H "X-API-Key: <your-api-key>" -d '{\"email\":\"reception@hospitalq.com\",\"password\":\"wrong\"}'
```

```json
{
  "success": false,
  "message": "Invalid email or password.",
  "error": "INVALID_CREDENTIALS"
}
```

Department id that is not a real id, 404. This command works as written.

```
curl.exe http://localhost:5000/api/queue/not-a-real-id -H "X-API-Key: <your-api-key>"
```

```json
{
  "success": false,
  "message": "Department not found.",
  "error": "DEPT_NOT_FOUND"
}
```

Check-in with the name missing, 400. Nothing is written.

```json
{
  "success": false,
  "message": "Patient name and department are required.",
  "error": "MISSING_FIELDS"
}
```

Empty email, a number where a string belongs, or a priority that is not `normal` or `urgent` is also 400 with `MISSING_FIELDS`.

## Other notes in this repo

- [Team Charter](TEAM_CHARTER.md)
- [API Opportunity Analysis](API_OPPORTUNITY_ANALYSIS.md)
- [Contributors](CONTRIBUTORS.md)
