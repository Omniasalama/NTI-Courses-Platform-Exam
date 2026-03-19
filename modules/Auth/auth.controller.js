/** @format */

import { Router } from "express";
import { register, login } from "./auth.service.js";
import {
  validate,
  registerSchema,
  loginSchema,
} from "../../validations/schemas.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
