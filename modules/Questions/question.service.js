import {questionModel} from '../../database/model/Question.js';
import {sessionModel} from '../../database/model/Session.js';
import {enrollmentModel} from '../../database/model/Enrollment.js';

const verifyTeacherOwnsSession = async (sessionId, teacherId) => {
  const session = await sessionModel.findById(sessionId).populate('course');
  if (!session) return { session: null, error: 'Session not found.' };
  if (session.course.teacher.toString() !== teacherId.toString()) {
    return { session: null, error: 'You do not own this session.' };
  }
  return { session, error: null };
};

export const addQuestion = async (req, res) => {
  try {
    const { session, error } = await verifyTeacherOwnsSession(req.params.sessionId, req.user._id);
    if (error) return res.status(error === 'Session not found.' ? 404 : 403).json({ message: error });

    const { text, options, correctAnswerIndex } = req.body;

    if (correctAnswerIndex >= options.length) {
      return res.status(422).json({ message: 'correctAnswerIndex must be a valid index within options array.' });
    }

    const question = await questionModel.create({
      session: session._id,
      text,
      options,
      correctAnswerIndex,
    });

    return res.status(201).json({ message: 'Question added.', question });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSessionQuestions = async (req, res) => {
  try {
    const session = await sessionModel.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    const enrollment = await enrollmentModel.findOne({
      student: req.user._id,
      course: session.course,
    });
    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled to view questions.' });
    }

    const questions = await questionModel.find({ session: session._id }).select('-correctAnswerIndex');
    return res.status(200).json({ questions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const question = await questionModel.findById(req.params.id).populate({
      path: 'session',
      populate: { path: 'course' },
    });
    if (!question) return res.status(404).json({ message: 'Question not found.' });

    if (question.session.course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not own this question.' });
    }

    const { text, options, correctAnswerIndex } = req.body;
    if (text) question.text = text;
    if (options) {
      question.options = options;
      if (correctAnswerIndex !== undefined && correctAnswerIndex >= options.length) {
        return res.status(422).json({ message: 'correctAnswerIndex must be within options range.' });
      }
    }
    if (correctAnswerIndex !== undefined) question.correctAnswerIndex = correctAnswerIndex;

    await question.save();
    return res.status(200).json({ message: 'Question updated.', question });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const question = await questionModel.findById(req.params.id).populate({
      path: 'session',
      populate: { path: 'course' },
    });
    if (!question) return res.status(404).json({ message: 'Question not found.' });

    if (question.session.course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not own this question.' });
    }

    await question.deleteOne();
    return res.status(200).json({ message: 'Question deleted.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const session = await sessionModel.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    const enrollment = await enrollmentModel.findOne({
      student: req.user._id,
      course: session.course,
    });
    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled to submit the quiz.' });
    }

    const questions = await questionModel.find({ session: session._id });
    if (questions.length === 0) {
      return res.status(400).json({ message: 'This session has no questions yet.' });
    }

    const { answers } = req.body;

    let correct = 0;
    const results = questions.map((q) => {
      const studentAnswer = answers.find(
        (a) => a.questionId === q._id.toString()
      );
      const isCorrect =
        studentAnswer !== undefined &&
        studentAnswer.selectedIndex === q.correctAnswerIndex;
      if (isCorrect) correct++;
      return {
        questionId: q._id,
        isCorrect,
      };
    });

    const score = correct / questions.length;
    const passed = score >= session.passingScore;

    if (passed) {
      const alreadyCompleted = enrollment.completedSessions.some(
        (id) => id.toString() === session._id.toString()
      );
      if (!alreadyCompleted) {
        enrollment.completedSessions.push(session._id);
        await enrollment.save();
      }
    }

    return res.status(200).json({
      message: passed ? ' You passed! Next session unlocked.' : ' You did not pass. Try again.',
      passed,
      score: `${Math.round(score * 100)}%`,
      correct,
      total: questions.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
