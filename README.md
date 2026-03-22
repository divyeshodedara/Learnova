# Learnova - eLearning Platform

Learnova is a full-stack eLearning platform built with React (frontend) and Node.js/Express (backend). It supports three user roles: Admin, Instructor, and Learner. Admins manage users and platform settings, Instructors create and publish courses with lessons, quizzes, and invitations, and Learners browse, enroll, and track their progress through courses.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [User Roles and Permissions](#user-roles-and-permissions)
- [Payment Integration](#payment-integration)
- [File Upload](#file-upload)
- [Email Notifications](#email-notifications)
- [Seeding the Database](#seeding-the-database)
- [Testing the API](#testing-the-api)

---

## Architecture Overview

```
+---------------------+        HTTP / REST API        +-------------------------+
|                     | <----------------------------> |                         |
|   React Frontend    |                               |   Node.js / Express     |
|   (Vite + Tailwind) |                               |   Backend API           |
|   Port: 5173        |                               |   Port: 5000            |
+---------------------+                               +----------+--------------+
                                                                  |
                          +---------------------------------------+---------------+
                          |                   |                   |               |
                   +------+------+   +--------+------+   +-------+------+  +-----+------+
                   |             |   |               |   |              |  |            |
                   | PostgreSQL  |   |  Cloudinary   |   |   PayPal     |  |  Nodemailer|
                   | Database    |   |  (File/Media  |   |  (Payments)  |  |  (Email)   |
                   | via Prisma  |   |   Storage)    |   |  Sandbox/    |  |            |
                   |             |   |               |   |  Production  |  |            |
                   +-------------+   +---------------+   +--------------+  +------------+
```

### Request Flow

```
Browser Request
      |
      v
Vite Dev Server (port 5173)
      |
      | /api/* proxy
      v
Express Server (port 5000)
      |
      +-- auth.middleware (JWT verification from cookie or Authorization header)
      |
      +-- authorize.middleware (role-based: ADMIN / INSTRUCTOR / LEARNER)
      |
      +-- Controller
      |        |
      |        +-- Prisma ORM
      |                |
      |                v
      |           PostgreSQL DB
      |
      +-- Response (JSON)
```

---

## Tech Stack

### Backend

| Layer              | Technology                          |
|--------------------|-------------------------------------|
| Runtime            | Node.js (>=20.19)                   |
| Framework          | Express 4                           |
| ORM                | Prisma 7 with pg adapter            |
| Database           | PostgreSQL                          |
| Authentication     | JSON Web Tokens (jsonwebtoken)      |
| Password Hashing   | bcrypt                              |
| File Uploads       | Multer + multer-storage-cloudinary  |
| Cloud Storage      | Cloudinary                          |
| Payments           | PayPal Checkout Server SDK          |
| Email              | Nodemailer (Gmail SMTP)             |
| Validation         | Zod                                 |
| Environment        | dotenv                              |
| Dev Server         | nodemon                             |

### Frontend

| Layer              | Technology                          |
|--------------------|-------------------------------------|
| Framework          | React 19 + Vite 8                   |
| Routing            | React Router DOM 7                  |
| Styling            | Tailwind CSS 4 + CSS Modules        |
| UI Components      | Radix UI + shadcn/ui primitives     |
| HTTP Client        | Axios                               |
| Animations         | Framer Motion                       |
| Icons              | Lucide React                        |
| Font               | Geist Variable                      |

---

## Features

### Authentication
- Learner self-registration via signup page with password strength validation
- Login with email and password; JWT stored in HttpOnly cookie and localStorage
- Role-based protected routes (Admin, Instructor, Learner)
- Optional authentication middleware for public routes with context-aware responses

### Admin
- Create Instructor and Admin accounts with auto-generated or custom passwords
- List, search, filter, and paginate all users
- Edit user roles and active status
- Soft-delete (deactivate) users; cannot deactivate own account or change own role

### Course Management (Admin / Instructor)
- Create courses with title, description, short description, cover image URL, tags, visibility, access rule, and price
- Auto-generate unique URL slugs from course titles
- Edit all course fields
- Toggle publish/unpublish status; websiteUrl is required to publish
- Delete courses (cascades to all related data)
- Tag system: create and assign multiple tags to courses

### Curriculum Builder
- Add lessons of types: VIDEO, DOCUMENT, IMAGE, QUIZ
- Upload lesson files (video, PDF, images, documents) directly to Cloudinary via multipart form
- Edit lesson metadata including title, type, order, duration, video URL, and download permission
- Delete lessons with automatic Cloudinary file cleanup
- Add file and link attachments to individual lessons
- Create quizzes linked to courses
- Add, edit, and delete quiz questions (multiple choice)
- Add, edit, and delete answer options with correct/incorrect marking
- Set per-attempt point rewards for quizzes (attempt 1 = N points, attempt 2 = M points, etc.)

### Learner Experience
- Browse published courses with search and filtering
- Course detail page shows curriculum outline, description, reviews, and enrollment status
- Three enrollment modes:
  - OPEN: free enrollment for any authenticated user
  - ON_INVITATION: requires a valid invitation token
  - ON_PAYMENT: requires successful PayPal payment
- My Courses page with progress tracking and resume functionality
- Course player with sidebar curriculum navigation
- Mark lessons as started or completed; time spent is tracked
- Course completion percentage is recalculated after each lesson completion
- Quiz player: start attempts, submit answers per question, complete attempts
- Points awarded on quiz completion based on attempt number tiers
- Badge levels assigned based on cumulative points (Newbie through Master)
- Add and update course reviews (one review per learner per course, upsert)
- View payment history

### Reporting (Admin / Instructor)
- Overview stats: total enrollments, in-progress count, completed count, not-started count
- Detailed learner progress table filterable by course ID and status
- Enrollment date, start date, time spent, completion percentage, and status per learner

### Invitations
- Instructors/Admins can invite learners to ON_INVITATION courses by email
- Invitation email sent via Nodemailer with an accept link containing a unique token
- Accepting an invitation auto-enrolls the user if their account exists
- Tokens expire after 7 days
- One invitation per email per course (duplicate check enforced)

---

## Project Structure

```
learnova/
├── backend/
│   ├── controllers/
│   │   ├── admin.controller.js        # User CRUD for admins
│   │   ├── auth.controller.js         # Signup, login, /me
│   │   ├── course.controller.js       # Course CRUD and publish toggle
│   │   ├── invitation.controller.js   # Invite, list, accept
│   │   ├── learner.controller.js      # Published courses, enrollment, reviews
│   │   ├── lesson.controller.js       # Lessons and attachments CRUD
│   │   ├── payment.controller.js      # PayPal order creation and capture
│   │   ├── player.controller.js       # Lesson progress, quiz attempts
│   │   ├── quiz.controller.js         # Quiz, question, option, reward CRUD
│   │   ├── reporting.controller.js    # Overview and learner progress data
│   │   └── tag.controller.js          # Tag list and creation
│   ├── lib/
│   │   ├── cloudinary.js              # Cloudinary SDK config
│   │   ├── paypal.js                  # PayPal HTTP client config
│   │   └── prisma.js                  # Prisma client with pg pool adapter
│   ├── middlewares/
│   │   ├── auth.js                    # JWT verify; sets req.user
│   │   ├── authorize.js               # Role guard factory
│   │   ├── errorHandler.js            # Central Express error handler
│   │   ├── optionalAuth.js            # Auth without 401 on missing token
│   │   ├── upload.js                  # Multer + Cloudinary storage engine
│   │   └── validate.js                # Zod schema middleware
│   ├── prisma/
│   │   ├── schema.prisma              # Full database schema
│   │   ├── seed.js                    # Seeds Admin and Instructor accounts
│   │   └── migrations/                # SQL migration files
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── attachment.routes.js
│   │   ├── auth.routes.js
│   │   ├── course.routes.js
│   │   ├── invitation.routes.js
│   │   ├── learner.routes.js
│   │   ├── lesson.routes.js
│   │   ├── payment.routes.js
│   │   ├── player.routes.js
│   │   ├── quiz.routes.js
│   │   ├── reporting.routes.js
│   │   └── tag.routes.js
│   ├── utils/
│   │   ├── badgeCalculator.js         # Points to badge level mapping
│   │   ├── email.js                   # Nodemailer send helper
│   │   ├── pointsAwarder.js           # Awards points and updates badge
│   │   ├── progressCalculator.js      # Recalculates enrollment completion %
│   │   └── slugify.js                 # URL slug generator
│   ├── generated/
│   │   └── prisma/                    # Auto-generated Prisma client
│   ├── index.js                       # Express app entry point
│   ├── package.json
│   └── .env                           # Environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── admin.js
│   │   │   ├── auth.js
│   │   │   ├── axios.js               # Axios instance with interceptors
│   │   │   ├── courses.js
│   │   │   ├── enrollments.js
│   │   │   ├── lessons.js
│   │   │   ├── payment.js
│   │   │   ├── player.js
│   │   │   ├── quizzes.js
│   │   │   └── reporting.js
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── layout.module.css
│   │   │   └── ui/
│   │   │       ├── Badge.jsx
│   │   │       ├── Button.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── Input.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Skeleton.jsx
│   │   │       └── Table.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js             # Auth state, token, role helpers
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── UserManagement.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Signup.jsx
│   │   │   │   └── auth.module.css
│   │   │   ├── learner/
│   │   │   │   ├── BrowseCourses.jsx
│   │   │   │   ├── CourseDetail.jsx
│   │   │   │   ├── CoursePlayer.jsx
│   │   │   │   ├── MyCourses.jsx
│   │   │   │   ├── PaymentHistory.jsx
│   │   │   │   └── QuizPlayer.jsx
│   │   │   └── management/
│   │   │       ├── CourseEditor.jsx
│   │   │       ├── CourseList.jsx
│   │   │       ├── CurriculumBuilder.jsx
│   │   │       └── Reporting.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env                           # Frontend environment variables
```

---

## Prerequisites

- Node.js 20.19 or higher
- npm 9 or higher
- PostgreSQL 14 or higher (running locally or remotely)
- A Cloudinary account (free tier is sufficient for development)
- A PayPal Developer account with a Sandbox application
- A Gmail account with an App Password enabled (for email sending)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/learnova.git
cd learnova
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Environment Variables

### Backend: `backend/.env`

Create a file at `backend/.env` using the template below. See `backend/.env.example` for reference.

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
PORT=5000
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_ENVIRONMENT=sandbox
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```

| Variable               | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| DATABASE_URL           | PostgreSQL connection string                                                |
| PORT                   | Port the Express server listens on (default 5000)                           |
| JWT_SECRET             | Secret key for signing JWTs; use a long random string in production         |
| JWT_EXPIRES_IN         | Token expiry duration (e.g. 7d, 24h)                                        |
| CLOUDINARY_CLOUD_NAME  | Your Cloudinary cloud name from the dashboard                               |
| CLOUDINARY_API_KEY     | Your Cloudinary API key                                                     |
| CLOUDINARY_API_SECRET  | Your Cloudinary API secret                                                  |
| PAYPAL_CLIENT_ID       | PayPal application client ID (use Sandbox for development)                  |
| PAYPAL_CLIENT_SECRET   | PayPal application client secret                                            |
| PAYPAL_ENVIRONMENT     | `sandbox` for development, `production` for live                            |
| FRONTEND_URL           | URL of the frontend app; used in invitation email links                     |
| EMAIL_USER             | Gmail address used to send invitation emails                                |
| EMAIL_PASS             | Gmail App Password (not your regular Gmail password)                        |

### Frontend: `frontend/.env`

Create a file at `frontend/.env` using the template below. See `frontend/.env.example` for reference.

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
```

| Variable               | Description                                                   |
|------------------------|---------------------------------------------------------------|
| VITE_API_BASE_URL      | Base URL of the backend API                                   |
| VITE_PAYPAL_CLIENT_ID  | PayPal client ID used by the PayPal Buttons JS SDK (frontend) |

---

## Database Setup

### 1. Create the database

Connect to your PostgreSQL instance and create the database:

```sql
CREATE DATABASE learnova;
```

### 2. Run migrations

From the `backend` directory:

```bash
npx prisma migrate deploy
```

This applies all migrations in `backend/prisma/migrations/` to your database.

### 3. Generate the Prisma client

```bash
npx prisma generate
```

This regenerates the typed Prisma client into `backend/generated/prisma/`.

### 4. Verify connection

```bash
npx prisma db pull
```

If the schema matches, the connection is working correctly.

---

## Running the Application

### Development mode

Open two terminal windows.

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

The API server starts at `http://localhost:5000`.

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

The React application starts at `http://localhost:5173`. All `/api/*` requests are proxied to the backend via the Vite dev server proxy configured in `vite.config.js`.

### Production build

Backend (runs directly with Node.js, no build step needed):
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

The `dist/` directory can be served by any static file server (Nginx, Vercel, Netlify, etc.). Ensure the `VITE_API_BASE_URL` is set to the production backend URL before building.

---

## API Reference

All API endpoints are prefixed with `/api`. Authentication uses Bearer tokens passed in the `Authorization` header or via the `token` HttpOnly cookie set at login.

### Authentication

| Method | Endpoint        | Auth | Description                          |
|--------|-----------------|------|--------------------------------------|
| POST   | /auth/signup    | No   | Register a new Learner account       |
| POST   | /auth/login     | No   | Login; returns JWT and user object   |
| GET    | /auth/me        | Yes  | Returns currently authenticated user |

### Admin - User Management

All endpoints require `ADMIN` role.

| Method | Endpoint           | Description                              |
|--------|--------------------|------------------------------------------|
| POST   | /admin/users       | Create an Instructor or Admin account    |
| GET    | /admin/users       | List users with optional role/search filter |
| PATCH  | /admin/users/:id   | Update user role or active status        |
| DELETE | /admin/users/:id   | Deactivate (soft delete) a user          |

### Tags

| Method | Endpoint   | Auth | Description         |
|--------|------------|------|---------------------|
| GET    | /tags      | Yes  | List all tags       |
| POST   | /tags      | Yes  | Create a new tag    |

### Courses (Management)

| Method | Endpoint                   | Auth | Description                          |
|--------|----------------------------|------|--------------------------------------|
| POST   | /courses                   | Yes  | Create a new course                  |
| GET    | /courses                   | Yes  | List all courses (admin/instructor)  |
| GET    | /courses/:id               | Yes  | Get course by ID with full details   |
| PATCH  | /courses/:id               | Yes  | Update course details                |
| PATCH  | /courses/:id/publish       | Yes  | Toggle published/draft status        |
| DELETE | /courses/:id               | Yes  | Delete course and all its data       |

### Lessons

| Method | Endpoint                          | Auth | Description                         |
|--------|-----------------------------------|------|-------------------------------------|
| POST   | /courses/:id/lessons              | Yes  | Add a lesson (multipart/form-data)  |
| GET    | /courses/:id/lessons              | Yes  | List lessons for a course           |
| PATCH  | /lessons/:id                      | Yes  | Edit a lesson                       |
| DELETE | /lessons/:id                      | Yes  | Delete a lesson                     |
| POST   | /lessons/:id/attachments          | Yes  | Add attachment to a lesson          |
| DELETE | /attachments/:id                  | Yes  | Delete an attachment                |

### Quizzes

| Method | Endpoint                               | Auth | Description                    |
|--------|----------------------------------------|------|--------------------------------|
| POST   | /quizzes/courses/:courseId/quizzes     | Yes  | Create a quiz for a course     |
| GET    | /quizzes/courses/:courseId/quizzes     | Yes  | List quizzes for a course      |
| PATCH  | /quizzes/quizzes/:id                   | Yes  | Update quiz title/description  |
| DELETE | /quizzes/quizzes/:id                   | Yes  | Delete a quiz                  |
| POST   | /quizzes/quizzes/:id/questions         | Yes  | Add a question to a quiz       |
| PATCH  | /quizzes/questions/:id                 | Yes  | Edit a question                |
| DELETE | /quizzes/questions/:id                 | Yes  | Delete a question              |
| POST   | /quizzes/questions/:id/options         | Yes  | Add an option to a question    |
| PATCH  | /quizzes/options/:id                   | Yes  | Edit an option                 |
| DELETE | /quizzes/options/:id                   | Yes  | Delete an option               |
| PUT    | /quizzes/quizzes/:id/rewards           | Yes  | Set reward tiers for a quiz    |

### Learner - Course Discovery and Enrollment

| Method | Endpoint                           | Auth     | Description                           |
|--------|------------------------------------|----------|---------------------------------------|
| GET    | /learners/courses/published        | Optional | Browse published courses              |
| GET    | /learners/courses/:id/detail       | Optional | Get course detail with enrollment info|
| GET    | /learners/courses/:id/reviews      | No       | List reviews for a course             |
| POST   | /learners/enrollments              | Yes      | Enroll in a course                    |
| GET    | /learners/enrollments/my           | Yes      | Get learner's enrolled courses        |
| GET    | /learners/enrollments/:id/progress | Yes      | Get progress for an enrollment        |
| POST   | /learners/courses/:id/reviews      | Yes      | Add or update a course review         |

### Player - Lesson Viewing and Progress

| Method | Endpoint                               | Auth | Description                              |
|--------|----------------------------------------|------|------------------------------------------|
| GET    | /players/player/:courseId/:lessonId    | Yes  | Load lesson data (validates enrollment)  |
| PATCH  | /players/progress/lesson/:id           | Yes  | Mark lesson started or completed         |
| POST   | /players/quizzes/:id/attempt           | Yes  | Start a new quiz attempt                 |
| POST   | /players/attempts/:id/answer           | Yes  | Submit one answer within an attempt      |
| POST   | /players/attempts/:id/complete         | Yes  | Complete an attempt and compute score    |

### Payments

| Method | Endpoint                 | Auth | Description                                  |
|--------|--------------------------|------|----------------------------------------------|
| POST   | /payments/create-order   | Yes  | Create a PayPal order for a paid course       |
| POST   | /payments/verify         | Yes  | Capture PayPal order and create enrollment    |
| GET    | /payments/my             | Yes  | List authenticated user's payment history     |

### Invitations

| Method | Endpoint                              | Auth | Description                         |
|--------|---------------------------------------|------|-------------------------------------|
| POST   | /invitations/courses/:id/invitations  | Yes  | Send invitation email for a course  |
| GET    | /invitations/courses/:id/invitations  | Yes  | List invitations for a course       |
| POST   | /invitations/invitations/accept/:token| No   | Accept invitation by token          |

### Reporting

| Method | Endpoint                  | Auth | Description                       |
|--------|---------------------------|------|-----------------------------------|
| GET    | /reporting/reporting      | Yes  | Get enrollment overview stats     |
| GET    | /reporting/reporting/users| Yes  | Get detailed learner progress data|

---

## User Roles and Permissions

| Action                          | ADMIN | INSTRUCTOR | LEARNER |
|---------------------------------|-------|------------|---------|
| Manage users                    | Yes   | No         | No      |
| Create / edit / delete courses  | Yes   | Yes        | No      |
| Publish / unpublish courses     | Yes   | Yes        | No      |
| Add / edit / delete lessons     | Yes   | Yes        | No      |
| Manage quizzes and questions    | Yes   | Yes        | No      |
| Send invitations                | Yes   | Yes        | No      |
| View reporting                  | Yes   | Yes        | No      |
| Browse published courses        | Yes   | Yes        | Yes     |
| Enroll in courses               | No    | No         | Yes     |
| Track lesson progress           | No    | No         | Yes     |
| Attempt quizzes                 | No    | No         | Yes     |
| Write reviews                   | No    | No         | Yes     |
| View payment history            | No    | No         | Yes     |

Admins and Instructors cannot enroll themselves in courses as learners. The enrollment endpoint is restricted by design.

---

## Payment Integration

Learnova uses PayPal Checkout for paid course enrollment. The flow is:

1. Learner clicks "Enroll Now" on a course with `accessRule = ON_PAYMENT`.
2. Frontend calls `POST /payments/create-order` with the `courseId`.
3. Backend creates a PayPal order via the server SDK and returns the `orderId`.
4. Frontend opens the PayPal Buttons SDK with the `orderId`.
5. After the learner approves payment in the PayPal popup, the frontend calls `POST /payments/verify` with the `paypal_order_id`.
6. Backend captures the PayPal order and, within a database transaction, creates the Enrollment record and marks the Payment as SUCCESS.

For sandbox testing, use PayPal's sandbox buyer accounts from the PayPal Developer Dashboard. Set `PAYPAL_ENVIRONMENT=sandbox` in the backend environment.

To switch to production, change `PAYPAL_ENVIRONMENT=production` and replace the client ID and secret with live credentials.

---

## File Upload

Lesson files and attachments are uploaded to Cloudinary using Multer. Supported formats are: `jpg`, `jpeg`, `png`, `pdf`, `mp4`, `docx`, `doc`, `webp`. Files are stored under the `learnova_uploads` folder in your Cloudinary account with `resource_type: auto` so both images and videos are handled.

When a lesson or attachment is deleted, the corresponding Cloudinary resource is destroyed using the stored `fileKey` (Cloudinary `public_id`).

To add a lesson with a file, send a `multipart/form-data` POST request to `/courses/:id/lessons` with the fields listed in the API reference section. All text fields should be form fields, and the file should be the `file` field.

---

## Email Notifications

Invitation emails are sent using Nodemailer with Gmail SMTP. To enable this:

1. Enable 2-Factor Authentication on your Gmail account.
2. Go to Google Account Settings > Security > App Passwords.
3. Generate an App Password for "Mail".
4. Set `EMAIL_USER` to your Gmail address and `EMAIL_PASS` to the generated App Password in `backend/.env`.

The invitation email contains a link in the format:
```
{FRONTEND_URL}/accept-invite/{token}
```

Tokens expire after 7 days. If a user with the invited email already exists, they are auto-enrolled when they visit the accept link.

---

## Seeding the Database

The seed script creates two accounts: a Super Admin and a default Instructor.

```bash
cd backend
npx prisma db seed
```

Default credentials after seeding:

| Role       | Email                     | Password         |
|------------|---------------------------|------------------|
| Admin      | admin@learnova.com        | Admin@1234       |
| Instructor | instructor@learnova.com   | Instructor@1234  |

These credentials are defined in `backend/prisma/seed.js`. Change them immediately in a production environment.

---

## Testing the API

Three `.http` files are included for use with the REST Client extension in VS Code (or any HTTP client that supports the `.http` format):

| File                             | Description                                   |
|----------------------------------|-----------------------------------------------|
| `backend/person1.http`           | Auth, course creation, lesson management      |
| `backend/person2.http`           | Quiz, question, option, reward, invitation, reporting |
| `backend/person3.http`           | Learner enrollment, progress, quiz attempts, reviews, payments |
| `backend/person2-end-to-end.http`| Full instructor workflow with seeded data     |
| `backend/person3-end-to-end.http`| Full learner workflow end-to-end              |

To use with VS Code:

1. Install the "REST Client" extension by Humao.
2. Open any `.http` file.
3. Click "Send Request" above any HTTP method line.
4. Copy the token from a login response and set the `@token` variable at the top of the file.

---

## Badge System

Learners earn points by completing quiz attempts. The number of points awarded depends on the attempt number and the `QuizReward` configuration set by the instructor. Points accumulate over time and unlock badge levels:

| Badge Level | Points Required |
|-------------|-----------------|
| NEWBIE      | 20              |
| EXPLORER    | 40              |
| ACHIEVER    | 60              |
| SPECIALIST  | 80              |
| EXPERT      | 100             |
| MASTER      | 120             |

Each point award is recorded in the `point_transactions` table for a full audit trail.

---

## Notes for Production Deployment

- Change `JWT_SECRET` to a cryptographically random string of at least 64 characters.
- Set `PAYPAL_ENVIRONMENT=production` and use live PayPal credentials.
- Set `sameSite: "strict"` and `secure: true` on the cookie in `auth.controller.js` when serving over HTTPS.
- Configure CORS in `index.js` to restrict `origin` to your actual frontend domain.
- Use a managed PostgreSQL service and set `DATABASE_URL` accordingly.
- Use environment variables from your hosting provider's secret management rather than a `.env` file.
- Run `npx prisma migrate deploy` (not `prisma migrate dev`) in production environments.
