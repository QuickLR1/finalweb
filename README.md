Notely — Notes CRUD Web App (Final Project)

A full-stack Notes web application with JWT authentication, MongoDB, role-based access control (RBAC), and SMTP email integration.

Live Demo: PASTE_YOUR_RENDER_URL_HERE
GitHub Repo: https://github.com/QuickLR1/finalweb

Project Overview

Notely allows users to register, login, and manage personal notes (CRUD).
Each note belongs to a specific user. The system supports different roles:

user / premium — manage only own notes

admin / moderator — can view all notes and delete any note (admin endpoints)

The project is built using a modular backend structure (routes, controllers, models, middleware, config) and a simple frontend in client/.

Features

✅ Register / Login (JWT)

✅ Password hashing with bcrypt

✅ Notes CRUD (Create, Read, Update, Delete)

✅ Search notes (frontend)

✅ Profile page (GET/PUT profile)

✅ RBAC roles: admin, moderator, user, premium

✅ SMTP Email integration with Nodemailer + SendGrid (welcome email on register)

✅ Deployment on Render

✅ Environment variables for secrets

Tech Stack

Backend: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Nodemailer
Frontend: HTML, CSS, Vanilla JS (Fetch API)
Deployment: Render
Database: MongoDB Atlas

Project Structure
client/
  index.html
  styles.css
  app.js

server/
  src/
    config/
      db.js
    controllers/
      adminController.js
      authController.js
      notesController.js
      usersController.js
    middleware/
      auth.js
      role.js
      validate.js
      notFound.js
      errorHandler.js
    models/
      User.js
      Note.js
    routes/
      adminRoutes.js
      authRoutes.js
      noteRoutes.js
      usersRoutes.js
    utils/
      asyncHandler.js
      email.js
    app.js
    server.js
  package.json
  package-lock.json
  .env (local only, not committed)

Setup Instructions (Local)
1) Clone the repository
git clone https://github.com/QuickLR1/finalweb.git
cd finalweb

2) Install backend dependencies
cd server
npm install

3) Create .env file inside server/

Create: server/.env

Example:

PORT=5000
MONGO_URI=YOUR_MONGODB_ATLAS_URI
JWT_SECRET=YOUR_JWT_SECRET

# CORS (optional)
CORS_ORIGIN=http://localhost:5500

# SMTP (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
MAIL_FROM="Notely <bekaisain68@gmail.com>"

4) Run the backend
npm run dev


Backend runs at:

http://localhost:5000

5) Run the frontend

Open client/index.html using VS Code Live Server (recommended).

Example URL:

http://127.0.0.1:5500/client/index.html

Setup Instructions (Production / Render)
Render Web Service

Root Directory: server

Build Command: npm install

Start Command: npm start

Render Environment Variables

Add these in Render → Environment:

MONGO_URI

JWT_SECRET

CORS_ORIGIN (optional, can be *)

⚠️ Do not set PORT on Render — Render provides it automatically.

API Documentation

Base URL (local): http://localhost:5000
Base URL (prod): YOUR_RENDER_URL

Auth (Public)
Register

POST /api/auth/register

Body:

{
  "username": "beka",
  "email": "beka@example.com",
  "password": "123456"
}


Response:

{
  "token": "JWT_TOKEN",
  "user": { "id": "...", "username": "...", "email": "...", "role": "user" }
}

Login

POST /api/auth/login

Body:

{
  "email": "beka@example.com",
  "password": "123456"
}


Response:

{ "token": "JWT_TOKEN" }

Users (Private)

Requires header:

Authorization: Bearer JWT_TOKEN

Get profile

GET /api/users/profile

Response:

{
  "_id": "...",
  "username": "beka",
  "email": "beka@example.com",
  "role": "user"
}

Update profile

PUT /api/users/profile

Body example:

{
  "username": "newName",
  "email": "newEmail@example.com"
}

Notes (Private) — Resource CRUD

Notes belong to the logged-in user.

Create note

POST /api/notes

Body:

{
  "title": "My note",
  "content": "Text...",
  "tags": ["study", "work"],
  "pinned": false
}

Get my notes

GET /api/notes

Get note by id

GET /api/notes/:id

Update note

PUT /api/notes/:id

Body example:

{
  "title": "Updated title",
  "content": "Updated text",
  "pinned": true
}

Delete note

DELETE /api/notes/:id

Admin (RBAC) — Private

Only roles: admin, moderator

Get all notes

GET /api/admin/notes

Returns all notes in database (with owner info).

Delete any note

DELETE /api/admin/notes/:id

Validation & Error Handling

Input validation is implemented using middleware (middleware/validate.js)

Standard HTTP codes are used:

400 Bad request / validation

401 Unauthorized (missing/invalid token)

403 Forbidden (role not allowed)

404 Not found

500 Internal server error

Global error handler: middleware/errorHandler.js

SMTP Email Integration (Advanced Feature)

Welcome email is sent after successful registration using:

Nodemailer

SendGrid SMTP

Implementation file:

server/src/utils/email.js

Note: SendGrid trial accounts require Sender Verification and may be under review; email delivery depends on SendGrid account status.

Screenshots (Web App Features)

Create a folder in the repo root:

screenshots/


Add these images (example names) and update the links below:

1) Login / Sign Up page

Description: Authentication page with Sign In / Sign Up tabs.

2) Notes Dashboard (Empty state)

Description: User dashboard showing empty notes state and “New Note” button.

3) Notes Dashboard (With notes)

Description: Notes list/grid with search, pinned notes, and CRUD actions.

4) Profile Drawer

Description: Profile panel where user can update username/email and sign out.

5) Admin View (All notes)

Description: Admin/Moderator can switch to “All notes” view and delete any note.

Submission Links

✅ GitHub Repository: https://github.com/QuickLR1/finalweb

✅ Deployed URL: PASTE_YOUR_RENDER_URL_HERE

✅ ZIP Codebase: uploaded to LMS

Author

Isain Bexultan — SE 2402
