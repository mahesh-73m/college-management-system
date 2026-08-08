# 🎓 College Management System

A full-stack web application built using the MERN stack to manage student data, attendance, and academic records efficiently. The system supports role-based access for Admin, Teacher, and Students, ensuring secure and organized data management.

---

## 🚀 Features

* 🔐 User Authentication (JWT-based login system)
* 👨‍🎓 Student Management (add/view students)
* 📅 Attendance Tracking (daily records)
* 📊 Marks Management (subject-wise marks)
* 🧑‍🏫 Role-Based Access (Admin / Teacher / Student)
* 📡 RESTful API Integration
* 💻 Responsive and clean UI

---

## 🛠️ Tech Stack

**Frontend:**

* React.js
* Axios

**Backend:**

* Node.js
* Express.js

**Database:**

* MongoDB (Mongoose)

**Authentication:**

* JSON Web Token (JWT)
* Bcrypt

---

## 📁 Project Structure

```
college-management-system/
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── server.js
│
└── client/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── services/
    └── main.jsx
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```
git clone https://github.com/your-username/college-management-system.git
cd college-management-system
```

---

### 2️⃣ Setup Backend

```
cd server
npm install
```

Create `.env` file:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run backend:

```
node server.js
```

---

### 3️⃣ Setup Frontend

```
cd client
npm install
npm run dev
```

---

## 🌐 API Endpoints

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

### Students

* `GET /api/students`
* `POST /api/students`

### Attendance

* `POST /api/attendance`
* `GET /api/attendance/:studentId`

### Marks

* `POST /api/marks`
* `GET /api/marks/:studentId`

---

## 📸 Screenshots

*Add your project screenshots here*

---

## 🔗 Links

* GitHub Repo: https://github.com/your-username/college-management-system
* Live Demo: (Add if deployed)

---

## 🧠 Future Improvements

* Role-based dashboards (Admin/Teacher/Student)
* Data visualization (charts & analytics)
* File upload (profile images, documents)
* Email notifications
* Deployment with Docker

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repo and submit a pull request.

---

## 📜 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Mahesh Mahapatra
B.Tech CSE (Data Science)
