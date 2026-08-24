# API Needs Statements

## Ring Position
- Team 13 (HospitalQ)
- Downstream (consumes our API): Team 1 (KaziBuddy)
- Upstream (we consume their API): Team 12 (QuickFundi)

## Part B Notes: Interview with KaziBuddy (Downstream)
KaziBuddy is a Jua Kali app that connects clients with artisans like plumbers and electricians. We sat down with their team and asked what they would actually use from our hospital queue system. They said they want to build a safety feature where if an artisan gets injured on site they can check into a hospital queue directly from KaziBuddy. They also said it would help to see how long the wait is at different departments so the artisan can decide if they should go now or later. They only want to read data and create tickets. They have no use for calling patients or managing departments.

## Part C Notes: Interview with QuickFundi (Upstream)
QuickFundi has worker profiles with things like skills, experience, hourly rates and reviews from clients. They said we can read all of that but we cannot create or edit anything on their end. Account passwords and suspension status are off limits. The data is updated whenever a worker changes their profile so it should be mostly current.

---

## Needs Statements

### 1
KaziBuddy needs to create a queue ticket in a hospital department in order to let an injured artisan join the hospital line from inside the KaziBuddy app.

- Freshness: immediate, the ticket should show up in the queue right away
- Volume: low, this only happens when someone actually gets hurt
- Auth: yes, we need some kind of key or token so random people cant spam tickets

### 2
KaziBuddy needs to read which hospital departments are active in order to let the artisan pick the right department when checking in.

- Freshness: does not matter much, departments barely ever change
- Volume: low, loaded once when the screen opens
- Auth: not needed, department names are not sensitive

### 3
KaziBuddy needs to read how many people are waiting in a department queue in order to show the artisan an estimated wait time before they decide to go.

- Freshness: should be close to real-time, within a minute or so
- Volume: moderate, gets checked whenever someone opens the hospital section
- Auth: not needed, our public board already hides full names

### 4
KaziBuddy needs to check the status of a specific ticket in order to notify the artisan when the doctor calls them so they are not stuck waiting without knowing.

- Freshness: real-time, the whole point is instant notification
- Volume: one check per active ticket, not heavy
- Auth: yes, only the person who made the ticket should be able to look it up

### 5
KaziBuddy needs to read average wait times per department in order to show which departments are busy before the artisan picks one.

- Freshness: does not need to be instant, hourly is fine
- Volume: low, pulled once when picking a department
- Auth: not needed, its just general stats

---

## Audit Sanity Check
- Statement 1 maps to creating a queue entry (POST /api/queue). Already in our Week 1 audit.
- Statement 2 maps to listing departments (GET /api/departments). Already there.
- Statement 3 maps to public queue display (GET /api/queue/public/:deptId). Already there.
- Statement 4 maps to queue ticket status and the socket event we already have. Already there.
- Statement 5 maps to analytics overview (GET /api/analytics/overview). Already there.

Everything checks out. No gaps.

---

## Reflection
Talking to KaziBuddy saved us a lot of unnecessary work. We assumed they would need full CRUD access like editing tickets, doctor schedules and managing patients, but they really just need to book a ticket and check wait times for injured workers. This keeps our API scope pretty small and straightforward. On the QuickFundi side, we found out they only allow read access to worker profiles and no booking actions, so we will just focus on pulling basic profile data instead of trying to build a full maintenance booking flow.
