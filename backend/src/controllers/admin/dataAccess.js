const Dataset = require("../../models/datasets");
const Quizzes = require("../../models/quizzes");
const User = require("../../models/users");

const getAdminDatasets = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const user = await User.findById(req.user._id);
    const orgId = user?.organization_id || req.user.organization_id;

    let query = orgId
      ? {
          $or: [
            { teacher_id: req.user._id },
            { access_type: "all" },
            { allowed_organizations: orgId },
          ],
        }
      : { teacher_id: req.user._id };

    if (search) {
      query = {
        $and: [query, { title: { $regex: search, $options: "i" } }],
      };
    }

    const datasets = await Dataset.find(query)
      .populate("allowed_teachers", "name email")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Dataset.countDocuments(query);

    res.status(200).json({
      datasets,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error in getAdminDatasets:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAdminQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const user = await User.findById(req.user._id);
    const orgId = user?.organization_id || req.user.organization_id;

    let baseQuery = orgId
      ? {
          status: "published",
          $or: [
            { teacher_id: req.user._id },
            { access_type: "all" },
            { allowed_organizations: orgId },
          ],
        }
      : { teacher_id: req.user._id, status: "published" };

    let query = baseQuery;
    if (search) {
      query = {
        $and: [baseQuery, { name: { $regex: search, $options: "i" } }],
      };
    }

    const quizzes = await Quizzes.find(query)
      .populate("allowed_teachers", "name email")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Quizzes.countDocuments(query);

    res.status(200).json({
      quizzes,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error in getAdminQuizzes:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateAdminDatasetAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { access_type, allowed_teachers } = req.body;

    const user = await User.findById(req.user._id);
    const orgId = user?.organization_id || req.user.organization_id;

    const findQuery = orgId
      ? {
          _id: id,
          $or: [
            { teacher_id: req.user._id },
            { access_type: "all" },
            { allowed_organizations: orgId },
          ],
        }
      : { _id: id, teacher_id: req.user._id };

    const dataset = await Dataset.findOneAndUpdate(
      findQuery,
      { access_type, allowed_teachers },
      { returnDocument: "after" },
    ).populate("allowed_teachers", "name email");

    if (!dataset) {
      return res
        .status(404)
        .json({ message: "Dataset not found or unauthorized" });
    }

    res.status(200).json({ message: "Access updated successfully", dataset });
  } catch (error) {
    console.error("Error updating dataset access:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateAdminQuizAccess = async (req, res) => {
  try {
    const { id } = req.params;
    const { access_type, allowed_teachers } = req.body;

    const user = await User.findById(req.user._id);
    const orgId = user?.organization_id || req.user.organization_id;

    const findQuery = orgId
      ? {
          _id: id,
          $or: [
            { teacher_id: req.user._id },
            { access_type: "all" },
            { allowed_organizations: orgId },
          ],
        }
      : { _id: id, teacher_id: req.user._id };

    const quiz = await Quizzes.findOneAndUpdate(
      findQuery,
      { access_type, allowed_teachers },
      { returnDocument: "after" },
    ).populate("allowed_teachers", "name email");

    if (!quiz) {
      return res
        .status(404)
        .json({ message: "Quiz not found or unauthorized" });
    }

    res.status(200).json({ message: "Access updated successfully", quiz });
  } catch (error) {
    console.error("Error updating quiz access:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getOrganizationTeachers = async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    console.log("[DEBUG] getOrganizationTeachers called by User:", req.user._id, "OrgID:", orgId);
    
    // In case orgId is missing from token, try to fetch it from DB
    let effectiveOrgId = orgId;
    if (!effectiveOrgId) {
      const dbUser = await User.findById(req.user._id);
      effectiveOrgId = dbUser?.organization_id;
      console.log("[DEBUG] Fallback to DB OrgID:", effectiveOrgId);
    }
    
    const teachers = await User.find({
      organization_id: effectiveOrgId,
      role: "teacher",
    }).select("name email _id");
    
    console.log("[DEBUG] Found teachers:", teachers);
    res.status(200).json(teachers);
  } catch (error) {
    console.error("Error fetching organization teachers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAdminDatasets,
  getAdminQuizzes,
  updateAdminDatasetAccess,
  updateAdminQuizAccess,
  getOrganizationTeachers,
};
