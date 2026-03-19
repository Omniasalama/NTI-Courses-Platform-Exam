/** @format */

import { Router } from "express";
import {
  updateQuestion,
  deleteQuestion,
} from "./question.service.js";
import { authenticate, authorize } from "../../middleware/auth.js";
import { validate, questionSchema } from "../../validations/schemas.js"

const router = Router();

router.put(
  "/:id",
  authenticate,
  authorize("teacher"),
  validate(questionSchema),
  updateQuestion,
);
router.delete("/:id", authenticate, authorize("teacher"), deleteQuestion);

export default router;
