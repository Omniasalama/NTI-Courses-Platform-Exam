# NTI Courses Platform — Backend API

A backend REST API for a video courses platform with 3 roles: **Admin**, **Teacher**, and **Student**.

**Stack:** Node.js · Express · MongoDB · Mongoose · JWT · Bcrypt · Joi · Multer

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
PORT=3000
MONGO_URI=mongodb://localhost:27017/CoursesPlatform
JWT_SECRET=your_secret_key

# 4. Start server
npm run start
```

---

## API Routes

| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/users` | Admin |
| PATCH | `/api/users/:id/ban` | Admin |
| POST | `/api/courses` | Teacher |
| GET | `/api/courses` | Public |
| PUT | `/api/courses/:id` | Teacher |
| DELETE | `/api/courses/:id` | Teacher |
| POST | `/api/courses/:id/subscribe` | Student |
| POST | `/api/courses/:courseId/sessions` | Teacher |
| GET | `/api/sessions/:id/stream` | Student |
| GET | `/api/sessions/:id/pdf` | Student |
| POST | `/api/sessions/:id/questions` | Teacher |
| POST | `/api/sessions/:id/submit` | Student |
| GET | `/api/enrollments/my` | Student |
| GET | `/api/admin/stats` | Admin |