/** @format */

import mongoose from "mongoose";
export const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

courseSchema.index({ title: "text", description: "text" });
courseSchema.index({ category: 1 });

export const courseModel = mongoose.model("Course", courseSchema);