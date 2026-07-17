# HospitalQ

School project - hospital queue app (MongoDB, Express, React, Node).

## Run it

```bash
npm run install-all
cd server && npm run seed && cd ..
npm run dev
```

Open http://localhost:5173

Need `server/.env` and `client/.env.local` (see the `.env.example` files).

## Logins

- reception@hospitalq.com / password123
- doctor@hospitalq.com / password123
- admin@hospitalq.com / password123

Privacy: public board only shows first name + last initial.

## Folders

```
client/src/   pages + components + api/hooks files mixed in
server/src/   routes, models, a few ctrl files, helpers.js
```
