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

Week 6.

The yaml only has two writes. POST /api/auth/login and POST /api/queue. There is no PUT, PATCH or DELETE in the contract, so we left the staff queue buttons (done, no-show, skip, delete) alone. Those arent for KaziBuddy.

We check the body before we touch the database. If a field is missing, empty, the wrong type, or a value we cant use, we send 400 MISSING_FIELDS and stop. Nothing gets written and we dont burn a ticket number.

Login: email and password have to be text, not blank, and the email has to look like an email. A number in the email field is 400. A wrong password is still 401 INVALID_CREDENTIALS. We added those two responses to the yaml. The login user is _id, name, email, role, and department. Department wasnt in the week 4 user object. The doctor page needs it or it opens the wrong queue, so we put it on the yaml as optional. Reception has no department so that one comes back null. We stopped sending isActive, createdAt and updatedAt on login.

POST /api/queue: patientName and department are required text. An empty name is 400. A department id that isnt 24 hex characters is 400. A real-looking id that isnt a department is 404 DEPT_NOT_FOUND, same as the GET. priority has to be normal or urgent. patientAge has to be a whole number if they send it. gender has to be one of male, female, other, prefer-not-to-say. No token is 401. We added 400, 401 and 404 on that path in the yaml.

When the check-in works we send 201 and the same queue shape as the GET. notes, age, gender and __v stay in mongo, they dont come back in the json. Login stays 200, not 201, because the contract already said 200 and login doesnt create a row.

Posting the same patient twice makes two tickets. Thats a create, not a PUT. The handout's "same PUT twice" rule doesnt apply here because we dont have a PUT in the yaml.

We tried the bad bodies on the running server. Missing name, blank name, age as a string, priority HIGH, and a junk department id all came back 400 and the queue count stayed the same. A made-up but real-looking department id was 404. No token was 401. A good check-in was 201, then GET /api/queue/{deptId} showed that ticket. A second identical POST was another ticket, number 2.
