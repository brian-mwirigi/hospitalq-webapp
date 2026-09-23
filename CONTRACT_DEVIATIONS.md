# Contract deviations

Week 5, GET routes only. We did not touch POST.

## What changed in openapi.yaml

Week 4 only asked for the 200 body, so the errors were never written down.

1. `GET /api/queue/{deptId}` and `GET /api/queue/{deptId}/stats` now include a 404. A fake id, or a department that is turned off, returns:

```json
{ "success": false, "message": "Department not found.", "error": "DEPT_NOT_FOUND" }
```

Stats used to come back 200 with all zeros, which looks like an empty clinic. The queue route already 404'd. Both do 404 now.

2. `GET /api/analytics/overview` now includes a 401. The route was already locked (receptionist, doctor, admin). The yaml said Bearer but never showed the error. No token comes back `NO_TOKEN`.

We did not rename fields. The handout example uses `id` and `dueDate`. Our yaml says `_id`, so the response still uses `_id`.

## What changed in the code

Mongo was sending columns that are not in the contract. Those are gone from the GET JSON. They are still in the database.

- `GET /api/departments` no longer sends `createdAt`, `updatedAt`, or `__v`. It sends `_id`, `name`, `slug`, `description`, `isActive`. Inactive departments are not in the list.
- `GET /api/queue/{deptId}` no longer sends `notes`, `doctor`, `patientAge`, `gender`, `queueDate`, `completedAt`, or `updatedAt`. Notes are still saved when reception checks someone in. They just are not on this GET, because KaziBuddy's schema does not have them. `ticketNumber` is a number. `createdAt` is an ISO string like `2026-09-23T20:03:11.504Z`. `calledAt` is `null` until the patient is called. `department` is only `_id`, `name`, `slug`.
- `GET /api/analytics/overview` no longer sends `leastBusy`. Each department row no longer sends `inProgress`, `done`, `noShow`, or `walkOuts`. `totals` is only `waiting` and `done`. `busy` is still true when 5 or more people are waiting. The admin page was printing walk-outs and "least busy" off those extra fields, so that bit of the page was removed so it does not show zeros we are not actually returning.

Stats still sends `total`, `waiting`, `done`, `inProgress`, `noShow`, `walkOuts`, `avgWaitMinutes`, `predictedWaitMinutes`. Those are all in the yaml. `walkOuts` is the same number as `noShow`. If nobody has finished a visit today, `avgWaitMinutes` is 10.

## What I checked

The handout does not say MongoDB or MySQL. This app was already Mongo, so I ran Mongo on this laptop (`mongodb://127.0.0.1:27017/hospitalq`), seeded the three departments, and opened Swagger at `http://localhost:5000/docs`. The server dropdown is `http://localhost:5000`. I clicked Try it out on each GET and compared the response to the yaml.

`/docs` is just Swagger for us. It is not a new endpoint for KaziBuddy.

| Call | Status | Result |
|---|---|---|
| `GET /api/departments` | 200 | Dental, General OPD, Pediatrics. Keys `_id`, `name`, `slug`, `description`, `isActive`. No extras. |
| `GET /api/queue/{deptId}` | 200 | Mary Wanjiku, ticket 1. `ticketNumber` is a number. `createdAt` is `2026-09-23T20:10:41.411Z`. `calledAt` is null. Department keys are `_id`, `name`, `slug`. `notes` was saved on check-in and was not in this JSON. |
| `GET /api/queue/not-a-real-id` | 404 | `DEPT_NOT_FOUND` |
| `GET /api/queue/{inactiveId}` | 404 | `DEPT_NOT_FOUND` |
| `GET /api/queue/{deptId}/stats` | 200 | All eight count fields, all numbers. With one waiting patient and no finished visits: total 1, waiting 1, avgWaitMinutes 10, predictedWaitMinutes 10. |
| `GET /api/queue/not-a-real-id/stats` | 404 | `DEPT_NOT_FOUND` |
| `GET /api/analytics/overview` no token | 401 | `NO_TOKEN` |
| `GET /api/analytics/overview` with a receptionist token | 200 | `data` is only `departments` and `totals`. Row keys match the yaml. `busy` is a boolean (`false` when waiting is 1). `totals` is `waiting` and `done`. |
