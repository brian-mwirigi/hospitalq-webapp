# HospitalQ

Hospital queue management web app built with React, Node/Express, MongoDB and Socket.IO.

## Project Documentation
- [Team Charter](TEAM_CHARTER.md)
- [API Opportunity Analysis (Week 1 Deliverable)](API_OPPORTUNITY_ANALYSIS.md)
- [Contributors](CONTRIBUTORS.md)

## Getting Started

### 1. Install dependencies
```bash
npm run install-all
```

### 2. Configure environment variables
- `server/.env` (see `server/.env.example`)
- `client/.env.local` (see `client/.env.example`)

### 3. Seed database and run
```bash
cd server && npm run seed && cd ..
npm run dev
```

Open `http://localhost:5173` in your browser.

## Demo Accounts
- Receptionist: `reception@hospitalq.com` / `password123`
- Doctor: `doctor@hospitalq.com` / `password123`
- Admin: `admin@hospitalq.com` / `password123`

## API Overview

### Queue Endpoints (`/api/queue`)
- `POST /api/queue` - Check in patient & issue ticket
- `GET /api/queue/:deptId` - Get active queue for department (live updates via Socket.IO)
- `GET /api/queue/public/:deptId` - Public waiting room queue (first name + last initial)
- `PUT /api/queue/:id/call` - Doctor calls next patient into consult room
- `PUT /api/queue/:id/done` - Mark consultation as completed
- `PUT /api/queue/:id/status` - Update ticket status (skipped / no-show)
- `PUT /api/queue/:id/transfer` - Transfer patient to another department

### Department Endpoints (`/api/depts`)
- `GET /api/depts` - List all active hospital departments
- `POST /api/depts` - Create a department (Admin)
- `PUT /api/depts/:id` - Update department (Admin)

### Analytics Endpoints (`/api/analytics`)
- `GET /api/analytics/overview` - Daily patient counts, average wait time and consult duration

## Project Structure
```
client/src/   # React frontend (pages, components, context, socket client)
server/src/   # Express backend (routes, controllers, models, socket server)
```