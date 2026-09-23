# Contract deviations

Week 5.

## Yaml

Week 4 asked for the 200 body.

GET /api/queue/{deptId} and GET /api/queue/{deptId}/stats now have a 404. If the id is fake or the department is turned off, we send success false, message "Department not found.", error DEPT_NOT_FOUND

GET /api/analytics/overview now has a 401. The route was already locked to receptionist, doctor and admin. The yaml said bearer but never showed what the error looks like. No token comes back NO_TOKEN.

Our yaml says _id so we kept _id.

## Code

Mongo was sending extra columns that arent in the contract. We took those off the GET json.

GET /api/departments used to send createdAt, updatedAt and __v. Now its just _id, name, slug, description and isActive.

GET /api/queue/{deptId} used to send notes, doctor, age, gender, queueDate, completedAt and updatedAt. KaziBuddy's schema doesnt have those so we dont send them. Notes are still saved when reception checks someone in, they dont come back on this GET. ticketNumber is a number. createdAt is a date string like 2026-09-23T20:10:41.411Z. calledAt is null until the patient is called. department is only _id, name and slug.

GET /api/analytics/overview used to send leastBusy, and each department had inProgress, done, noShow and walkOuts. totals had walkOuts too. The yaml only has departmentId, name, slug, waiting, avgConsultMinutes, predictedWaitMinutes, busy, and totals.waiting plus totals.done. Thats what we send now. busy is true when 5 or more people are waiting. The admin page was showing walk-outs and least busy from those extra fields, so we took that off the page. Otherwise it would just print zeros.

Stats still sends total, waiting, done, inProgress, noShow, walkOuts, avgWaitMinutes and predictedWaitMinutes because those are in the yaml. walkOuts is the same number as noShow. If nobody has finished a visit today, avgWaitMinutes is 10.

## What we checked

The handout doesnt say mongo or mysql. The app was already mongo so we ran it on the laptop, seeded Dental, General OPD and Pediatrics, and opened swagger at http://localhost:5000/docs. The server in the dropdown is http://localhost:5000. We clicked try it out on each GET.

/docs is just swagger for us. KaziBuddy doesnt call it.

GET /api/departments was 200. Dental, General OPD, Pediatrics. Only the five fields above.

GET /api/queue for General OPD was 200. Mary Wanjiku, ticket 1, calledAt null. We had saved notes on check-in and they were not in this json.

GET /api/queue/not-a-real-id was 404 DEPT_NOT_FOUND. Same thing on the stats url.

GET /api/queue/{deptId}/stats for General OPD was 200. total 1, waiting 1, avgWaitMinutes 10, predictedWaitMinutes 10. All numbers.

GET /api/analytics/overview with no token was 401 NO_TOKEN. With the receptionist login it was 200. data only has departments and totals. busy was false because only 1 person was waiting.
