/** @format */

import fs from "fs";
import path from "path";
import { courseModel } from "../../database/model/course.model.js";
import { sessionModel } from "../../database/model/Session.js";
import { enrollmentModel } from "../../database/model/Enrollment.js";

const verifyTeacherOwnsSession = async (sessionId, teacherId) => {
  const session = await sessionModel.findById(sessionId).populate("course");

  if (!session) {
    return { session: null, error: "Session not found." };
  }

  if (session.course.teacher.toString() !== teacherId.toString()) {
    return { session: null, error: "You do not own this session." };
  }

  return { session, error: null };
};

const verifyEnrollment = async (sessionId, studentId) => {
  const session = await sessionModel.findById(sessionId);

  if (!session) {
    return { session: null, enrollment: null, error: "Session not found." };
  }

  const enrollment = await enrollmentModel.findOne({
    student: studentId,
    course: session.course,
  });

  if (!enrollment) {
    return {
      session: null,
      enrollment: null,
      error: "You are not enrolled in this course.",
    };
  }

  return { session, enrollment, error: null };
};

export const addSession = async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only add sessions to your own courses.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "A file (video or PDF) is required.",
      });
    }

    const { title, order, duration, passingScore } = req.body;

    const contentType =
      req.file.mimetype === "application/pdf" ? "pdf" : "video";

    const existing = await sessionModel.findOne({
      course: course._id,
      order: Number(order),
    });

    if (existing) {
      return res.status(409).json({
        message: `A session with order ${order} already exists in this course.`,
      });
    }

    const session = await sessionModel.create({
      course: course._id,
      title,
      order: Number(order),
      contentType,
      filePath: req.file.path,
      duration: duration ? Number(duration) : null,
      passingScore: passingScore ? Number(passingScore) : 0.7,
    });

    return res.status(201).json({
      message: "Session added.",
      session,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCourseSessions = async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    const user = req.user;

    const isTeacher =
      user.role === "teacher" &&
      course.teacher.toString() === user._id.toString();

    if (!isTeacher) {
      const enrollment = await enrollmentModel.findOne({
        student: user._id,
        course: course._id,
      });

      if (!enrollment) {
        return res.status(403).json({
          message: "You must be enrolled to view sessions.",
        });
      }
    }

    const sessions = await sessionModel
      .find({ course: course._id })
      .select("-filePath")
      .sort({ order: 1 });

    return res.status(200).json({ sessions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const session = await sessionModel
      .findById(req.params.id)
      .select("-filePath")
      .populate("course", "title teacher");

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    return res.status(200).json({ session });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSession = async (req, res) => {
  try {
    const { session, error } = await verifyTeacherOwnsSession(
      req.params.id,
      req.user._id,
    );

    if (error) {
      return res
        .status(error === "Session not found." ? 404 : 403)
        .json({ message: error });
    }

    const { title, order, duration, passingScore } = req.body;

    if (title) session.title = title;
    if (order) session.order = Number(order);
    if (duration !== undefined) session.duration = Number(duration);
    if (passingScore !== undefined) session.passingScore = Number(passingScore);

    await session.save();

    return res.status(200).json({
      message: "Session updated.",
      session,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const { session, error } = await verifyTeacherOwnsSession(
      req.params.id,
      req.user._id,
    );

    if (error) {
      return res
        .status(error === "Session not found." ? 404 : 403)
        .json({ message: error });
    }

    if (session.filePath && fs.existsSync(session.filePath)) {
      fs.unlinkSync(session.filePath);
    }

    await session.deleteOne();

    return res.status(200).json({
      message: "Session and file deleted.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const streamVideo = async (req, res) => {
  try {
    const { session, enrollment, error } = await verifyEnrollment(
      req.params.id,
      req.user._id,
    );

    if (error) {
      return res
        .status(error.includes("not found") ? 404 : 403)
        .json({ message: error });
    }

    if (session.contentType !== "video") {
      return res.status(400).json({
        message: "This session does not contain a video.",
      });
    }

    if (session.order > 1) {
      const previousSession = await sessionModel.findOne({
        course: session.course,
        order: session.order - 1,
      });

      if (previousSession) {
        const hasPassed = enrollment.completedSessions.some(
          (id) => id.toString() === previousSession._id.toString(),
        );

        if (!hasPassed) {
          return res.status(403).json({
            message: `You must pass the quiz for session ${session.order - 1} before accessing this session.`,
          });
        }
      }
    }

    const filePath = session.filePath;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "Video file not found on server.",
      });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const rangeHeader = req.headers.range;

    if (!rangeHeader) {
      return res.status(400).json({
        message: "Range header is required for video streaming.",
      });
    }

    const parts = rangeHeader.replace(/bytes=/, "").split("-");

    const start = parseInt(parts[0], 10);

    const end = parts[1]
      ? parseInt(parts[1], 10)
      : Math.min(start + 10 * 1024 * 1024, fileSize - 1);

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const servePDF = async (req, res) => {
  try {
    const { session, enrollment, error } = await verifyEnrollment(
      req.params.id,
      req.user._id,
    );

    if (error) {
      return res
        .status(error.includes("not found") ? 404 : 403)
        .json({ message: error });
    }

    if (session.contentType !== "pdf") {
      return res.status(400).json({
        message: "This session does not contain a PDF.",
      });
    }

    if (session.order > 1) {
      const previousSession = await sessionModel.findOne({
        course: session.course,
        order: session.order - 1,
      });

      if (previousSession) {
        const hasPassed = enrollment.completedSessions.some(
          (id) => id.toString() === previousSession._id.toString(),
        );

        if (!hasPassed) {
          return res.status(403).json({
            message: `You must pass the quiz for session ${session.order - 1} before accessing this PDF.`,
          });
        }
      }
    }

    const filePath = session.filePath;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "PDF file not found on server.",
      });
    }

    const filename = path.basename(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
