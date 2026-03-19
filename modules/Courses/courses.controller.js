/** @format */

import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  getMyCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "./courses.service.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { uploadThumbnail } from "../../middleware/multer.js";
import { validate, courseSchema } from "../../validations/schemas.js";

const router = Router();

router.get("/", getAllCourses);

router.get("/my", authenticate, authorize("teacher"), getMyCourses);

router.get("/:id", getCourseById);

router.post(
  "/",
  authenticate,
  authorize("teacher"),
  uploadThumbnail,
  validate(courseSchema),
  createCourse,
);

router.put(
  "/:id",
  authenticate,
  authorize("teacher"),
  uploadThumbnail,
  validate(courseSchema),
  updateCourse,
);

router.delete("/:id", authenticate, authorize("teacher"), deleteCourse);

export default router;
