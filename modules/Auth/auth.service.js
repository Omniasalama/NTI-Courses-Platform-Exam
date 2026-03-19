/** @format */

import { userModel } from "../../database/model/user.model.js";
import { generateTokens } from "../../config/generateTokens.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, cardNumber } = req.body;

    const existing = await userModel.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const user = await userModel.create({
      name,
      email,
      password,
      role,
      cardNumber,
    });

    const { accessToken, refreshToken } = generateTokens(user);

    return res
      .status(201)
      .json({
        message: "Registered successfully.",
        accessToken,
        refreshToken,
        user,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been banned." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    return res
      .status(200)
      .json({
        message: "Logged in successfully.",
        accessToken,
        refreshToken,
        user,
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
