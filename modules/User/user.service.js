/** @format */

import { userModel } from "../../database/model/user.model.js";
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ message: "User banned successfully.", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true },
    );
    if (!user) return res.status(404).json({ message: "User not found." });
    return res
      .status(200)
      .json({ message: "User unbanned successfully.", user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
