# Week 1 Lab Deliverable: API Opportunity Analysis

**Course:** API Development and Application Integration  
**Institution:** Strathmore University  
**Team Name:** HospitalQ Team  
**Members:** Brian Mwirigi, Maxwell Mwangi, Claire Warigi  

---

## 1. Public API Observation & Comparison Worksheet

### A & B. Public API Calls (JSONPlaceholder)

#### Call 1: Collection Endpoint
- **URL:** `https://jsonplaceholder.typicode.com/posts`
- **Method:** `GET`
- **Status Code:** `200 OK`
- **Response Format:** JSON (`application/json; charset=utf-8`)
- **Key Headers:** `Content-Type: application/json; charset=utf-8`, `Cache-Control: max-age=43200`
- **What it means:** Returns an array containing the full collection of post objects available in the system.

#### Call 2: Single Resource Endpoint
- **URL:** `https://jsonplaceholder.typicode.com/posts/1`
- **Method:** `GET`
- **Status Code:** `200 OK`
- **Response Format:** JSON (`application/json; charset=utf-8`)
- **Key Headers:** `Content-Type: application/json; charset=utf-8`
- **What it means:** Returns a single post object matching ID `1` containing `userId`, `id`, `title` and `body`.

### C. Resource Comparison
- **Collection (`/posts`):** Returns a list/array of multiple items. Used when a client needs to display an overview, feed or table.
- **Single Resource (`/posts/1`):** Uses an identifier in the path parameter to retrieve only one specific record with all its detailed fields.

---

## 2. API Opportunity Analysis (HospitalQ)

### 2.1 Application Name and Purpose
**HospitalQ** is a hospital queue and triage management web application built with React, Node/Express and MongoDB. The system reduces waiting room congestion and uncoordinated patient movements in outpatient clinics by generating daily queue tickets, notifying patients of their turn and giving medical staff tools to manage patient flow across departments.

### 2.2 Main Users and Database Entities

#### Target Users:
1. **Patients:** Receive ticket numbers, get automated SMS updates and view estimated wait times on waiting room screens.
2. **Receptionists:** Register incoming patients, select consultation departments, assign urgency levels and issue queue tickets.
3. **Doctors / Clinicians:** View department queues, call the next patient into the consultation room, record consult times and mark visits complete.
4. **Clinic Administrators:** Manage clinical departments, monitor daily volume and evaluate operational wait time metrics.

#### Database Entities:
- **`QueueEntry`:** Stores `ticketNumber`, `patientName`, `patientPhone`, `patientAge`, `gender`, `department`, `doctor`, `status` (`waiting`, `in-progress`, `done`, `no-show`, `skipped`), `priority` (`normal`/`urgent`), `notes`, `queueDate`, `calledAt` and `completedAt`.
- **`Department`:** Stores `name`, `slug`, `description` and `isActive`.
- **`User`:** Stores `name`, `email`, `password` (hash), `role` (`receptionist`, `doctor`, `admin`), `department` and `isActive`.
- **`DailyCounter`:** Tracks daily sequential integer counts per department for ticket issuance.
- **`SmsLog`:** Stores SMS notification logs (`phone`, `message`, `type`, `status`).

---

### 2.3 Exposed API Capabilities (At Least 5)

1. **`POST /api/queue` — Issue Queue Ticket (Patient Check-in)**
   - *Description:* Allows an external client to check a patient into a specific department, generates the daily ticket number and sends confirmation.
2. **`GET /api/queue/department/:deptId` — Fetch Active Queue**
   - *Description:* Returns real-time list of patients in `waiting` and `in-progress` states for a department, ordered by priority and check-in time.
3. **`GET /api/queue/public/:deptId` — Public Waiting Room Display**
   - *Description:* Returns privacy-compliant queue information (ticket number, first name and last initial only) for display on hallway monitors or kiosk tablets.
4. **`PUT /api/queue/:ticketId/call` — Call Patient for Consultation**
   - *Description:* Assigns a doctor to the ticket, changes state to `in-progress`, records the timestamp and triggers real-time socket events and SMS.
5. **`PUT /api/queue/:ticketId/done` — Complete Consultation**
   - *Description:* Sets visit state to `done`, logs consultation completion timestamp and frees doctor for next patient.
6. **`GET /api/analytics/wait-times` — Department Load & Wait Time Metrics**
   - *Description:* Exposes aggregated queue metrics such as average wait time, average consult duration and active queue depth.

---

### 2.4 Proposed External Consumer Application

**External Application:** *Hospital Mobile Patient Portal & Telemedicine App* (e.g. A hospital's mobile app or insurance partner app)

- **How it consumes our API:**
  - When a patient books an outpatient visit on their mobile app, the portal calls `POST /api/queue` to issue a virtual queue ticket before the patient even arrives on site.
  - The mobile app polls `GET /api/queue/public/:deptId` or receives push updates to display live "number of patients ahead of you" and estimated consultation start times.
  - When the doctor calls the patient via `PUT /api/queue/:ticketId/call`, the mobile app delivers a push notification ("Please proceed to Room 4B").

---

### 2.5 System Architecture Diagram

```
+-------------------------------------------------------------+
|               External Consumer Applications                |
|  (Hospital Mobile App / Self-Service Kiosks / Partner APIs) |
+-------------------------------------------------------------+
                              |
                              | HTTP / REST (JSON) + WebSockets
                              v
+-------------------------------------------------------------+
|                 HospitalQ REST API Server                   |
|                  (Node.js / Express.js)                     |
|                                                             |
|   +-------------------+  +-------------------------------+  |
|   |   Auth & Access   |  |   Queue Controller            |  |
|   |   Middleware      |  |   (/api/queue, /call, /done)  |  |
|   +-------------------+  +-------------------------------+  |
|   +-------------------+  +-------------------------------+  |
|   | Dept Management   |  |   Analytics Controller        |  |
|   | (/api/depts)      |  |   (/api/analytics)            |  |
|   +-------------------+  +-------------------------------+  |
+-------------------------------------------------------------+
          |                                       |
          v                                       v
+-----------------------+              +----------------------+
|    MongoDB Database   |              |  SMS / Notification  |
|  (Queue, Users, Dept) |              |  Gateway (Twilio)    |
+-----------------------+              +----------------------+
```
