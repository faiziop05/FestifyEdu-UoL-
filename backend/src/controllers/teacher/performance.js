const Classrooms = require("../../models/classrooms");
const StudentSessions = require("../../models/studentSessions");
const mongoose = require("mongoose");

const getStudentPerformance = async (req, res) => {
  try {
    const teacherId = req.user._id;

    const classrooms = await Classrooms.find({ teacher_id: teacherId }).select(
      "_id",
    );
    const classroomIds = classrooms.map((c) => c._id);

    if (classroomIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const performanceData = await StudentSessions.aggregate([
      {
        $match: {
          classroom_id: { $in: classroomIds },
        },
      },
      {
        $group: {
          _id: "$student_id",
          latestName: { $last: "$display_name" },
          sessionsAttended: { $sum: 1 },
          totalScore: { $sum: "$score" },
          totalPossibleScore: {
            $sum: { $multiply: [{ $size: { $ifNull: ["$answers", []] } }, 10] },
          },
          quizzesTaken: {
            $sum: { $size: { $ifNull: ["$submitted_quizzes", []] } },
          },
        },
      },
      {
        $project: {
          _id: 0,
          rollNumber: "$_id",
          name: "$latestName",
          sessionsAttended: 1,
          totalScore: 1,
          averageScore: {
            $cond: [
              { $gt: ["$totalPossibleScore", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$totalScore", "$totalPossibleScore"] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },
          quizzesTaken: 1,
        },
      },
      {
        $sort: { rollNumber: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    console.error("Error in getStudentPerformance:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getStudentPerformanceDetail = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { studentId } = req.params;

    const classrooms = await Classrooms.find({ teacher_id: teacherId }).select(
      "_id",
    );
    const classroomIds = classrooms.map((c) => c._id);

    if (classroomIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const sessions = await StudentSessions.find({
      student_id: studentId,
      classroom_id: { $in: classroomIds },
    })
      .populate("classroom_id", "name started_at ended_at status")
      .populate({
        path: "submitted_quizzes.quiz_id",
        select: "title description questions",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Error in getStudentPerformanceDetail:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getStudentPerformance,
  getStudentPerformanceDetail,
};
