# Team Charter

## Team Name & Roles
Team Name: HospitalQ Team

- Brian Mwirigi (@brian-mwirigi) - Repo Owner / DevOps Lead
- Maxwell Mwangi (@MwangiMaxwell) - API Lead
- [Teammate 3 Name] (@github_username) - Backend Dev
- [Teammate 4 Name] (@github_username) - Integration / QA Lead

## App Summary
HospitalQ is a hospital queue management app built with React, Node/Express, and MongoDB. It helps clinics manage patient flow across different departments. Receptionists check patients in and assign queue tickets, doctors call patients into consult rooms and mark visits complete, and waiting-room screens display an active, privacy-safe queue showing ticket numbers and patient initials.

## App Audit

### Resources
- **Queue Entry**: A patient's spot in line. Stores ticket number, patient name, phone number, age, gender, department ID, assigned doctor ID, status (`waiting`, `in-progress`, `done`, `no-show`, `skipped`), priority (`normal` vs `urgent`), notes, queue date, and timestamps (`calledAt`, `completedAt`).
- **Department**: A clinic department/unit. Stores name, slug, description, and active status.
- **User**: Staff accounts. Stores name, email, password hash, role (`receptionist`, `doctor`, `admin`), assigned department, and active status.
- **Daily Counter**: Department-specific daily sequence counter to generate ticket numbers (resets each day).
- **SMS Log**: History of automated SMS notifications sent when a ticket is created, called, or finished.

### Actions
- **Queue**:
  - Add patient to queue (generates next daily ticket number, sends SMS confirmation)
  - View current queue by department
  - View privacy-safe public queue board (first name + last initial only)
  - Call next patient (changes status to `in-progress`, assigns doctor, timestamps `calledAt`)
  - Mark visit done (changes status to `done`, timestamps `completedAt`)
  - Mark patient no-show or skipped
  - Change patient priority to urgent
  - Transfer patient to another department
- **Departments**:
  - List all active departments
  - Add a new department (Admin)
  - Edit department details or deactivate (Admin)
- **Auth**:
  - Log in with email and password
  - Get current logged-in user profile
- **Analytics**:
  - View daily patient counts, average wait time, and average consultation length

## Ring Position
- Upstream Partner (we call their API): Team [Number/Name]
- Downstream Partner (they call our API): Team [Number/Name]
