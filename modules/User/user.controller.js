/** @format */

import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  banUser,
  unbanUser,
  deleteUser,
} from "./user.service.js";
import { authenticate, authorize } from "../../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id/ban", banUser);
router.patch("/:id/unban", unbanUser);
router.delete("/:id", deleteUser);

export default router;
