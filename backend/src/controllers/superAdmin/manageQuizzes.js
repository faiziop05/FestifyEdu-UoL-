const Quizzes = require("../../models/quizzes");
const Users = require("../../models/users");
const mongoose = require("mongoose");

const assignQuizToOrganization = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { organization_id } = req.body;

    if (!organization_id) {
      return res
        .status(400)
        .json({ success: false, message: "organization_id is required" });
    }

    const originalQuiz = await Quizzes.findById(quizId);
    if (!originalQuiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }
    const targetAdmin = await Users.findOne({ organization_id, role: "admin" });
    if (!targetAdmin) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Target organization has no admin to assign the quiz to.",
        });
    }

    const clonedQuiz = new Quizzes({
      teacher_id: targetAdmin._id,
      name: originalQuiz.name + " (Assigned by Super Admin)",
      status: originalQuiz.status,
      questions: originalQuiz.questions.map((q) => {
        const questionObj = q.toObject();
        delete questionObj._id;
        return questionObj;
      }),
    });

    await clonedQuiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz assigned to organization successfully",
      quiz: clonedQuiz,
    });
  } catch (error) {
    console.error("Error in assignQuizToOrganization:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let query = { teacher_id: req.user._id, status: "published" };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const totalQuizzes = await Quizzes.countDocuments(query);
    const totalPages = Math.ceil(totalQuizzes / limitNum);

    const quizzes = await Quizzes.find(query)
      .populate("allowed_organizations", "organization_name")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      quizzes,
      totalPages,
      currentPage: pageNum,
      totalQuizzes,
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const updateQuizAccess = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { access_type, allowed_organizations } = req.body;

    const quiz = await Quizzes.findById(quizId);
    if (!quiz)
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });

    let teachersToKeep = quiz.allowed_teachers || [];
    if (allowed_organizations && allowed_organizations.length > 0) {
      const validTeachers = await Users.find({
        _id: { $in: quiz.allowed_teachers },
        organization_id: { $in: allowed_organizations },
      }).select("_id");
      teachersToKeep = validTeachers.map((t) => t._id);
    } else if (allowed_organizations && allowed_organizations.length === 0) {
      teachersToKeep = [];
    }

    const updatedQuiz = await Quizzes.findByIdAndUpdate(
      quizId,
      { access_type, allowed_organizations, allowed_teachers: teachersToKeep },
      { returnDocument: "after" },
    ).populate("allowed_organizations", "organization_name");

    return res
      .status(200)
      .json({
        success: true,
        quiz: updatedQuiz,
        message: "Quiz access updated successfully",
      });
  } catch (error) {
    console.error("Error updating quiz access:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = { assignQuizToOrganization, getQuizzes, updateQuizAccess };
