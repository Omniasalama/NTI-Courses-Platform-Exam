/** @format */

import {courseModel} from "../../database/model/course.model.js";
import {sessionModel} from "../../database/model/Session.js";
import {enrollmentModel} from "../../database/model/Enrollment.js";

export const createCourse = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const thumbnail = req.file ? req.file.path : null;

    const course = await courseModel.create({
      title,
      description,
      price: price ?? 0,
      category,
      thumbnail,
      teacher: req.user._id,
    });

    return res
      .status(201)
      .json({ message: "Course created successfully.", course });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const { q, category, isFree, page = 1, limit = 10 } = req.query;
    const filter = {};
    const andClauses = [];
    if (q) {
      andClauses.push({
        $or: [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      });
    }

    if (category) {
      andClauses.push({ category: { $regex: category, $options: "i" } });
    }

    if (isFree === "true") {
      andClauses.push({ $or: [{ price: 0 }, { price: null }] });
    } else if (isFree === "false") {
      andClauses.push({ price: { $gt: 0 } });
    }

    if (andClauses.length > 0) {
      filter.$and = andClauses;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [courses, total] = await Promise.all([
      courseModel.find(filter)
        .populate("teacher", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      courseModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      courses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const courses = await courseModel.find({ teacher: req.user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ courses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.id).populate(
      "teacher",
      "name email",
    );
    if (!course) return res.status(404).json({ message: "Course not found." });

    const sessions = await sessionModel.find({ course: courseModel._id })
      .select("-filePath")
      .sort({ order: 1 });

    return res.status(200).json({ course, sessions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found." });
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only edit your own courses." });
    }

    const { title, description, price, category } = req.body;
    if (title) course.title = title;
    if (description !== undefined) course.description = description;
    if (price !== undefined) course.price = price;
    if (category !== undefined) course.category = category;
    if (req.file) course.thumbnail = req.file.path;

    await course.save();
    return res.status(200).json({ message: "Course updated.", course });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found." });
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own courses." });
    }
    await sessionModel.deleteMany({ course: course._id });
    await enrollmentModel.deleteMany({ course: course._id });

    await course.deleteOne();

    return res
      .status(200)
      .json({ message: "Course and related data deleted." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
