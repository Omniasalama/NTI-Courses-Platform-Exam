/** @format */

import { Router } from "express";
import {
  getSessionById,
  updateSession,
  deleteSession,
  streamVideo,
  servePDF,
} from "../Sessions/session.service.js";
import {
  addQuestion,
  getSessionQuestions,
  submitQuiz,
} from "../Questions/question.service.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import {
  validate,
  sessionUpdateSchema,
  questionSchema,
  quizSubmitSchema,
} from "../../validations/schemas.js";

const router = Router();

router.get("/:id", authenticate, getSessionById);

router.put(
  "/:id",
  authenticate,
  authorize("teacher"),
  validate(sessionUpdateSchema),
  updateSession,
);
router.delete("/:id", authenticate, authorize("teacher"), deleteSession);

router.get("/:id/stream", authenticate, authorize("student"), streamVideo);
router.get("/:id/pdf", authenticate, authorize("student"), servePDF);

router.post(
  "/:sessionId/questions",
  authenticate,
  authorize("teacher"),
  validate(questionSchema),
  addQuestion,
);
router.get(
  "/:sessionId/questions",
  authenticate,
  authorize("student"),
  getSessionQuestions,
);

router.post(
  "/:sessionId/submit",
  authenticate,
  authorize("student"),
  validate(quizSubmitSchema),
  submitQuiz,
);

export default router;
