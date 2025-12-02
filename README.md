# CloudBase Voting Backend

This folder contains a minimal Node.js + Express backend scaffold using MongoDB (Mongoose). It's intended as a starting point for the admin panel and user panel API.

Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies: `npm install`
3. Start in development: `npm run dev` (requires `nodemon`) or `npm start`

API endpoints (basic)

- POST /api/auth/register { name, email, password } -> { token }
- POST /api/auth/login { email, password } -> { token }

- Admin (require Authorization: Bearer <token> and admin role)
  - POST /api/admin/elections -> create
  - GET /api/admin/elections -> list
  - PUT /api/admin/elections/:id -> update
  - DELETE /api/admin/elections/:id -> delete

- User (require Authorization)
  - GET /api/user/elections -> list public elections
  - POST /api/user/vote { electionId, candidateId }
  - GET /api/user/me -> profile

Notes

- This is a minimal scaffold. Add validation, input sanitization, rate limiting, tests, logging, and production configuration before deploying.
