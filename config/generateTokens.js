/** @format */

import jwt from "jsonwebtoken";
export const JWT_SECRET = process.env.JWT_SECRET;

export const generateTokens = (user) => {
  const payload = { _id: user._id, role: user.role };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1y" });

  return { accessToken, refreshToken };
};
