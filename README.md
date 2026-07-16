# HospitalQ (class project)

 hospital queue web app (MERN).

## What it does
- Reception adds patients to a department queue
- Doctor calls next / marks done / no-show
- Patient board at `/queue/<dept-slug>` updates live
- Wait estimate = waiting people × average of last visits
- If a department is busy, suggests a quieter one
- Optional phone = **mock SMS** (saved in DB, not really sent)
- Admin page shows today stats + SMS log

## Run
1. Put MongoDB URI in `server/.env`
2. From project root:
```bash
npm run install-all
cd server && npm run seed && cd ..
npm run dev
```
3. Open http://localhost:5173

## Demo logins
- reception@hospitalq.com / password123
- doctor@hospitalq.com / password123
- admin@hospitalq.com / password123

## Privacy (simple)
Public patient board shows first name + last initial only.

## Not real (future)
- Real Twilio SMS
- Real ML model
- HIS hospital system integration
