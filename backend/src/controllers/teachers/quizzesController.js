const Quiz = require("../../models/quizzes");

const createQuiz = async (req, res) => {
  try {
    const { teacher_id, name, questions, status } = req.body;

    if (!teacher_id || !name || !questions || !Array.isArray(questions)) {
      return res
        .status(400)
        .json({
          message: "teacher_id, name, and an array of questions are required.",
        });
    }

    const newQuiz = await Quiz.create({
      teacher_id,
      name,
      questions,
      status: status || "draft",
    });

    res.status(201).json({
      message: "Quiz created successfully",
      quiz: newQuiz,
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res
      .status(500)
      .json({ message: "Server error creating quiz", error: error.message });
  }
};

const getQuizzesByTeacher = async (req, res) => {
  try {
    const { teacher_id } = req.params;
    const { page, limit, search, type } = req.query;
    
    const orgId = req.user?.organization_id;
    let query = {};
    
    const activeTeacherId = req.user?._id || teacher_id;
    let baseTeacherQuery;
    if (req.user?.role === "super_admin") {
      baseTeacherQuery = { teacher_id: req.user._id };
    } else {
      const roleConditions = [];
      if (req.user?.role === "admin" && orgId) {
        roleConditions.push({ allowed_organizations: orgId });
      }
      roleConditions.push({ allowed_teachers: activeTeacherId });

      baseTeacherQuery = {
        $or: [
          { teacher_id: activeTeacherId },
          { access_type: "all" },
          ...roleConditions
        ]
      };
    }

    if (type === "draft") {
      query = { $and: [baseTeacherQuery, { teacher_id: teacher_id, status: "draft" }] };
    } else if (type === "published") {
      query = { $and: [baseTeacherQuery, { teacher_id: teacher_id, status: "published" }] };
    } else if (type === "shared") {
      query = { $and: [baseTeacherQuery, { teacher_id: { $ne: teacher_id }, status: "published" }] };
    } else {
      query = baseTeacherQuery;
    }

    if (search) {
      query.name = new RegExp(search, "i");
    }

    if (page && limit) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const quizzes = await Quiz.find(query)
        .populate("questions.dataset_id")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort({ createdAt: -1 });
      const count = await Quiz.countDocuments(query);
      return res.status(200).json({
        quizzes,
        totalPages: Math.ceil(count / limitNum) || 1,
        totalQuizzes: count
      });
    }

    const quizzes = await Quiz.find(query).populate("questions.dataset_id").sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res
      .status(500)
      .json({ message: "Server error fetching quizzes", error: error.message });
  }
};

const getAllPublishedQuizzes = async (req, res) => {
  try {
    const orgId = req.user?.organization_id;
    let query;
    
    if (req.user?.role === "super_admin") {
      query = { status: "published" };
    } else {
      const activeTeacherId = req.user?._id;
      const roleConditions = [];
      if (req.user?.role === "admin" && orgId) {
        roleConditions.push({ allowed_organizations: orgId });
      }
      roleConditions.push({ allowed_teachers: activeTeacherId });

      query = {
        status: "published",
        $or: [
          { teacher_id: activeTeacherId },
          { access_type: "all" },
          ...roleConditions
        ]
      };
    }
    
    const quizzes = await Quiz.find(query).populate(
      "questions.dataset_id",
    ).populate("teacher_id", "name email");
    res.status(200).json(quizzes);
  } catch (error) {
    console.error("Error fetching all published quizzes:", error);
    res
      .status(500)
      .json({ message: "Server error fetching quizzes", error: error.message });
  }
};

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id).populate("questions.dataset_id");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ message: "Server error fetching quiz", error: error.message });
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, questions, status } = req.body;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      { name, questions, status: status || "draft" },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ message: "Server error updating quiz", error: error.message });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuiz = await Quiz.findByIdAndDelete(id);
    
    if (!deletedQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ message: "Server error deleting quiz", error: error.message });
  }
};

module.exports = {
  createQuiz,
  getQuizzesByTeacher,
  getAllPublishedQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
};
