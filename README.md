# FestifyEdu

An interactive, data-driven quiz platform for classrooms — teachers build quizzes from real datasets and host live, Kahoot-style sessions with real-time scoring.

## Overview

FestifyEdu is a full-stack learning platform (MERN + Socket.IO) that lets teachers turn datasets (uploaded or imported from Google Drive) into interactive quizzes, host live sessions students join with a 6-digit room code, and track performance in real time. It has a full role-based access model — Super Admin, Admin, Teacher, and Student — so a single deployment can serve multiple organizations/schools with isolated data and permissions.

## Problem it solves

Generic quiz tools treat questions as static content disconnected from real data. FestifyEdu is built for data-literacy teaching: quizzes are generated from actual datasets (spreadsheets/Google Sheets), so students answer questions grounded in real numbers rather than pre-written trivia, while teachers get a multi-tenant admin structure (organizations → admins → teachers) instead of a single flat user list.

## Key features

- **Live, real-time quiz sessions** over Socket.IO: teachers start a session, students join via a 6-digit room code with no account required, and scores/state update live across all connected clients
- **Dataset-driven quiz building**: datasets can be uploaded directly (`xlsx`) or imported from a teacher's Google Drive via the Google Drive API/OAuth integration (`backend/src/routes` + `googleapis`)
- **Four-tier role-based access control**: Super Admin (manages organizations and global datasets), Admin (manages teachers and shares quizzes/datasets within an organization), Teacher (creates quizzes, runs live sessions, views grades), Student (join-only, no account)
- **Automatic stale-session cleanup**: a cron job (`backend/src/cron/sessionCleanup.js`) ends and archives any session left "active" for more than 3 hours, notifying connected clients over the socket room
- **Grade/performance tracking** with Chart.js dashboards on the frontend
- **Test coverage on both sides**: Jest + Supertest + `mongodb-memory-server` on the backend (including dedicated Socket.IO load tests), Vitest + Testing Library on the frontend

## What's unique about it

- Quizzes are generated from real datasets rather than static question banks — the core teaching use case is data literacy, not trivia.
- A three-level organizational hierarchy (Super Admin → Admin/organization → Teacher) with row-level data isolation, built for multi-school deployment rather than a single-tenant classroom tool.
- Includes purpose-built Socket.IO load tests (`backend/__tests__/load/`) to validate real-time session behavior under concurrent student connections.

## Tech stack

- **Frontend**: React 19 + Vite, Redux Toolkit + redux-persist, React Router v7, Chart.js/`react-chartjs-2`, `react-hook-form` + `zod` validation, Socket.IO client
- **Backend**: Node.js + Express 5, Socket.IO, Mongoose (MongoDB), JWT + bcryptjs auth, Google Drive API (`googleapis`) integration, `xlsx` for spreadsheet parsing, `node-cron`-style scheduled cleanup
- **Database**: MongoDB
- **Testing**: Jest + Supertest + mongodb-memory-server (backend), Vitest + Testing Library (frontend)

## Setup / running instructions

Prerequisites: Node.js, a MongoDB database (local or Atlas), and (optionally) Google Cloud OAuth credentials for the Drive import feature.

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5001/api/drive/callback
```

Optionally seed an initial Super Admin + organization:
```bash
node seed.js
```

Run the server:
```bash
npm run dev     # nodemon
# or
npm start
```

Backend runs on `http://localhost:5001`.

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

### Tests

```bash
cd backend && npm test          # Jest + coverage
cd backend && npm run test:load # Socket.IO load tests
cd frontend && npm test         # Vitest + coverage
```
