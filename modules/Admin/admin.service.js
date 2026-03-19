import {userModel} from '../../database/model/user.model.js';
import {courseModel} from '../../database/model/course.model.js';
import {transactionModel} from '../../database/model/Transaction.js';
import {enrollmentModel} from '../../database/model/Enrollment.js';

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      transactionAgg,
    ] = await Promise.all([
      userModel.countDocuments(),
      courseModel
      .countDocuments(),
      enrollmentModel.countDocuments(),
      transactionModel.aggregate([
        { $match: { status: 'success' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalTransactions: { $sum: 1 },
          },
        },
      ]),
    ]);

    const { totalRevenue = 0, totalTransactions = 0 } = transactionAgg[0] || {};

    return res.status(200).json({
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalTransactions,
        totalRevenue,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
