import {courseModel} from '../../database/model/course.model.js';
import {enrollmentModel} from '../../database/model/Enrollment.js';
import {transactionModel} from '../../database/model/Transaction.js';

export const subscribeToCourse = async (req, res) => {
  try {
    const course = await courseModel.findById(req.params.id).populate('teacher');
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const studentId = req.user._id;

    const existing = await enrollmentModel.findOne({ student: studentId, course: course._id });
    if (existing) {
      return res.status(409).json({ message: 'You are already enrolled in this course.' });
    }

    const isFree = !course.price || course.price === 0;

    if (isFree) {
      const enrollment = await enrollmentModel.create({
        student: studentId,
        course: course._id,
      });
      return res.status(201).json({
        message: 'Enrolled successfully (free course).',
        enrollment,
      });
    }
    const { cardNumber } = req.body;
    if (!cardNumber) {
      return res.status(400).json({ message: 'cardNumber is required for paid courses.' });
    }
    if (!/^\d{16}$/.test(cardNumber)) {
      return res.status(422).json({ message: 'cardNumber must be exactly 16 digits.' });
    }

    const transaction = await transactionModel.create({
      student: studentId,
      teacher: course.teacher._id,
      course: course._id,
      amount: course.price,
      cardNumber,
      status: 'success',
    });
    const enrollment = await enrollmentModel.create({
      student: studentId,
      course: course._id,
    });

    return res.status(201).json({
      message: 'Payment successful. Enrolled in course.',
      transaction,
      enrollment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You are already enrolled in this course.' });
    }
    return res.status(500).json({ message: error.message });
  }
};
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await enrollmentModel.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'teacher', select: 'name email' },
      })
      .sort({ enrolledAt: -1 });

    return res.status(200).json({ enrollments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
