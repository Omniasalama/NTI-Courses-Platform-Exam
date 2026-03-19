/** @format */

import express from "express";
import {
  addSession,
  getCourseSessions,
  getSessionById,
  updateSession,
  deleteSession,
  streamVideo,
  servePDF,
} from "./session.service.js";

import { authenticate } from "../../middleware/auth.js";
import { upload } from "../../middleware/multer.js";

const router = express.Router();

router.post(
  "/courses/:courseId/sessions",
  authenticate,
  upload.single("file"),
  addSession,
);

router.put("/sessions/:id",authenticate, updateSession);

router.delete("/sessions/:id", authenticate, deleteSession);

router.get("/courses/:courseId/sessions", authenticate, getCourseSessions);

router.get("/sessions/:id", authenticate, getSessionById);

router.get("/sessions/:id/video", authenticate, streamVideo);

router.get("/sessions/:id/pdf", authenticate, servePDF);

export default router;
