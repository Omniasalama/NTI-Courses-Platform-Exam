/** @format */

import "dotenv/config";
import mongoose from "mongoose";
import { databaseConnection } from "../database/connection.js";
import { userModel } from "../database/model/user.model.js";

const seedAdmin = async () => {
  await databaseConnection();
  await mongoose.connection.collection("users").dropIndex("cardNumber_1");

  const existing = await userModel.findOne({ role: "admin" });
  if (existing) {
    console.log(` Admin already exists: ${existing.email}`);
    process.exit(0);
  }

  const admin = await userModel.create({
    name: "Omnia Admin",
    email: "admin@nti.com",
    password: "Admin@2509",
    role: "admin",
    isActive: true,
  });
  await mongoose.disconnect();
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
