/** @format */

import "dotenv/config";
import express from "express";
import { databaseConnection } from "./database/connection.js";
import authRoutes from "./modules/Auth/auth.controller.js";
import userRoutes from "./modules/User/user.controller.js";
import courseRoutes from "./modules/Courses/courses.controller.js";
import adminRoutes from "./modules/Admin/admin.controller.js";
import sessionRoutes from "./modules/Sessions/session.controller.js";
import sessionExtraRoutes from "./modules/SessionsExtraRoute/sessionExtraRoutes.controller.js";
import enrollmentRoutes from "./modules/Enrollment/enrollment.controller.js";
import questionRoutes from "./modules/Questions/question.controller.js";
import { subscribeToCourse } from "./modules/Enrollment/enrollment.service.js";
import { authenticate, authorize } from "./middleware/auth.js";
import { validate, subscribeSchema } from "./validations/schemas.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirs = ["uploads/videos", "uploads/pdfs", "uploads/thumbnails"];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

export const bootstrap = () => {
  const app = express();
  const PORT = process.env.PORT || 3000;
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
  databaseConnection();
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/enrollments", enrollmentRoutes);
  app.use("/api/questions", questionRoutes);
  app.use("/api/courses/:courseId/sessions", sessionRoutes);
  app.post(
    "/api/courses/:id/subscribe",
    authenticate,
    authorize("student"),
    validate(subscribeSchema),
    subscribeToCourse,
  );
  app.use("/api/sessions", sessionExtraRoutes);
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "API is running" });
  });
  app.use((req, res) => {
    res
      .status(404)
      .json({ message: `Route ${req.method} ${req.path} not found.` });
  });
  app.use(errorHandler);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};
