# Team Charter

## Team Name and Roles
Team Name: HospitalQ Team

- Brian Mwirigi (@brian-mwirigi): Docs / DevOps Lead
- Maxwell Mwangi (@MwangiMaxwell): API Lead
- Claire Warigi (@claire-warigi): QA / Integration Lead
- [4th Member Name] (@github_username): Backend Dev

## App Summary
HospitalQ is a hospital queue web app we made using React, Express, Node and MongoDB. It lets receptionists check patients in and hand out ticket numbers, doctors call patients in and mark visits done, and waiting rooms show a public board with ticket numbers and initials so patients know when it is their turn.

## App Audit

### Resources
- QueueEntry: stores patient name, phone, age, gender, ticket number, status (waiting, in-progress, done, no-show, skipped), priority (normal or urgent), notes, queue date, department and doctor IDs, plus calledAt and completedAt timestamps
- Department: stores department name, slug, description and active status
- User: stores staff name, email, password hash, role (receptionist, doctor, admin), department ID and active status
- DailyCounter: tracks daily counter number per department to generate sequential tickets
- SmsLog: logs SMS alerts sent when a ticket is created, called or completed

### Actions
- Queue:
  - Add patient to queue and issue ticket
  - Get active queue for a department
  - Get public waiting room display (first name + last initial only)
  - Doctor calls next patient into room
  - Doctor marks consultation complete
  - Mark patient as skipped or no-show
  - Update ticket priority to urgent
  - Transfer patient to another department
- Departments:
  - View all active departments
  - Add new department (Admin)
  - Edit or disable a department (Admin)
- Auth:
  - Staff login with email and password
  - Get current logged in user profile
- Analytics:
  - View stats for total patients, average wait times and average consult duration

## Ring Position
- Upstream Partner (API we consume): Team [Number/Name]
- Downstream Partner (team that consumes our API): Team [Number/Name]
