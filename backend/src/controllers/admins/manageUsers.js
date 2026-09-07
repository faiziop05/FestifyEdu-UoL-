const users = require("../../models/users");
const Organizations = require("../../models/organizations");
const bcrypt = require("bcryptjs");

const addUsers = async (req, res) => {
  try {
    const { name, email, password, role, organization_id, status } = req.body;
    if (!name || !email || !password || !role || !organization_id) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (role !== "teacher") {
      return res
        .status(403)
        .json({ success: false, message: "Admins can only create teachers" });
    }

    const org = await Organizations.findById(organization_id);
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });
    }

    const emailDomain = email.split("@")[1];
    if (emailDomain !== org.domain) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Teacher email must match organization domain (@${org.domain})`,
        });
    }

    const user = await users.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new users({
      name,
      email,
      password: hashedPassword,
      role,
      organization_id,
      status: status || "active",
    });
    await newUser.save();
    return res
      .status(201)
      .json({ success: true, message: "Teacher added successfully" });
  } catch (error) {
    console.log("Error in addUsers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await users.findByIdAndDelete(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "User removed successfully" });
  } catch (error) {
    console.log("Error in removeUser:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, organization_id, status } = req.body;

    const updateData = { name, email, role, organization_id };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (status) updateData.status = status;

    const user = await users.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.log("Error in updateUser:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getOrganizationUsers = async (req, res) => {
  try {
    const { organization_id } = req.params;
    let { page, limit, search } = req.query;

    let pageNum = page ? parseInt(page) : 1;
    let limitNum = limit ? parseInt(limit) : 20;

    let query = { organization_id, role: "teacher" };
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ name: regex }, { email: regex }, { username: regex }];
    }

    const fetchedUsers = await users
      .find(query)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const totalCount = await users.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users: fetchedUsers,
      totalPages,
    });
  } catch (error) {
    console.log("Error in getOrganizationUsers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await users.findByIdAndUpdate(id, {
      password: hashedPassword,
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log("Error in resetPassword:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  addUsers,
  removeUser,
  updateUser,
  getOrganizationUsers,
  resetPassword,
};
