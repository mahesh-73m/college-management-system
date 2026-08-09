# College Management System

A full-stack College Management System with role-based access for **Admin**, **Teacher**, and **Student**, built with the MERN stack.

- **Frontend:** React (Vite) + Tailwind CSS + React Router + Recharts + jsPDF
- **Backend:** Node.js + Express.js (MVC architecture)
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt, role-based route protection (frontend & backend)

---

## ✨ Features

**Auth & Roles**
- Signup/Login, JWT auth, bcrypt password hashing
- Protected routes on both client (`ProtectedRoute`) and server (`protect` + `authorize` middleware)

**Admin**
- Dashboard with system-wide stats (students, teachers, courses, attendance %) and recent activity
- Create/deactivate students & teachers
- Manage courses & subjects, assign teachers to subjects
- Post/delete announcements

**Teacher**
- Dashboard with assigned classes and recent attendance logs
- Mark daily attendance (present/absent) per subject, with "mark all present" shortcut
- Upload/update marks (Midterm, Final, Quiz, Assignment) — bulk entry for a whole class
- View a student's attendance + marks analytics (with a chart)
- Filter students by subject/section/roll number

**Student**
- Dashboard: overall attendance %, recent marks, announcements
- Attendance view: subject-wise history + percentage, color-coded
- Marks view: subject-wise breakdown + **downloadable PDF report card**
- Profile view
- Announcements feed

---

## 🗂️ Project Structure

```
college-management-system/
├── server/                  # Express API (MVC)
│   ├── config/db.js
│   ├── models/              # User, Student, Teacher, Course, Subject, Attendance, Marks, Announcement
│   ├── controllers/
│   ├── routes/
│   ├── middleware/          # auth (JWT + role guard), error handler
│   ├── utils/                # generateToken, seed.js
│   └── server.js
├── client/                  # React (Vite) app
│   └── src/
│       ├── components/      # Sidebar, Navbar, DashboardLayout, ProtectedRoute, StatCard, Loader
│       ├── pages/
│       │   ├── admin/
│       │   ├── teacher/
│       │   └── student/
│       ├── context/AuthContext.jsx
│       └── services/api.js
└── docker-compose.yml
```

---

## 🚀 Getting Started (local development)

### Prerequisites
- Node.js 18+
- MongoDB running locally, **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Backend

```bash
cd server
cp .env.example .env
# edit .env: set MONGO_URI (Atlas or local) and a strong JWT_SECRET
npm install
npm run seed     # optional: creates demo admin/teacher/student + sample data
npm run dev       # starts on http://localhost:5000
```

Demo logins created by `npm run seed`:

| Role    | Email             | Password    |
|---------|-------------------|-------------|
| Admin   | admin@cms.edu     | Admin@123   |
| Teacher | teacher@cms.edu   | Teacher@123 |
| Student | student@cms.edu   | Student@123 |

### 2. Frontend

```bash
cd client
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev             # starts on http://localhost:5173
```

Open `http://localhost:5173`, log in with a demo account above (or sign up).

### 3. Docker (optional, runs everything together)

```bash
docker compose up --build
```
This spins up MongoDB, the API (port 5000) and the built frontend (port 5173). After the first run, exec into the server container and run `npm run seed` once, or call the `/api/auth/signup` endpoint directly.

---

## 🔌 API Overview

All protected routes require `Authorization: Bearer <token>`.

| Area          | Method & Route                              | Access          |
|---------------|----------------------------------------------|-----------------|
| Auth          | `POST /api/auth/signup`                       | Public          |
| Auth          | `POST /api/auth/login`                        | Public          |
| Auth          | `GET  /api/auth/me`                           | Any logged-in   |
| Users         | `POST /api/users/me/avatar`, `DELETE /api/users/me/avatar` | Any logged-in |
| Students      | `GET  /api/students/me` / `/me/attendance` / `/me/marks` | Student  |
| Students      | `GET  /api/students`, `GET/PUT /api/students/:id`        | Admin, Teacher |
| Students      | `GET  /api/students/:id/performance`          | Admin, Teacher  |
| Teachers      | `GET  /api/teachers/me`, `/me/students`, `/me/attendance-logs` | Teacher |
| Teachers      | `GET  /api/teachers`, `GET/PUT /api/teachers/:id`         | Admin          |
| Attendance    | `POST /api/attendance` (mark), `GET /api/attendance` (by date), `GET /api/attendance/history` | Teacher / Admin |
| Marks         | `POST /api/marks`, `POST /api/marks/bulk`, `GET /api/marks` | Teacher / Admin |
| Admin         | `POST /api/admin/users`, `DELETE /api/admin/users/:id`    | Admin |
| Admin         | `POST/GET/PUT/DELETE /api/admin/courses`                  | Admin (GET is open to all roles) |
| Admin         | `POST/GET /api/admin/subjects`, `PUT /api/admin/subjects/:id/assign` | Admin |
| Admin         | `GET  /api/admin/analytics`                   | Admin           |
| Announcements | `POST/GET/DELETE /api/announcements`          | Admin, Teacher post; everyone reads |

---

## 🌐 Deployment

- **Frontend:** deploy `client/` to Vercel or Netlify (build command `npm run build`, output `dist`). Set `VITE_API_URL` to your deployed backend URL.
- **Backend:** deploy `server/` to Render or Railway. Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` env vars.
- **Database:** use MongoDB Atlas — create a free cluster, whitelist `0.0.0.0/0` (or your host's IP), and use the connection string as `MONGO_URI`.

---

## 🛠️ Bonus features

All of the "bonus" items from the original brief are now implemented:

- **Profile image upload** — click any avatar (navbar or profile page) to upload/replace/remove a photo. Stored via `multer` under `server/uploads/avatars` and served statically at `/uploads/...`. `POST /api/users/me/avatar` and `DELETE /api/users/me/avatar`.
- **Email notifications** — posting an announcement emails everyone in its audience (all / students / teachers) via `nodemailer`. Configure `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` in `server/.env`; if left blank, emails are just logged to the console instead of sent, so the app runs fine without SMTP configured.
- **Dark mode toggle** — the ☀️/🌙 button in the top navbar flips Tailwind's `dark` class and persists the choice in `localStorage`.
- **Pagination** — `GET /api/students`, `GET /api/teachers`, and `GET /api/marks` all support `page`/`limit`; the Manage Students and Manage Teachers admin pages have a shared `Pagination` component with search boxes.

Every role also now has its own **Profile** page (with the photo uploader) in the sidebar.

---

## 📄 License

Free to use for learning, portfolio, and placement purposes.
