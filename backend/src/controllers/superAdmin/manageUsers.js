const Users = require("../../models/users");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const addUser = async (req, res) => {
  try {
    const { name, email, password, organization_id } = req.body;
    const role = "admin";

    if (!name || !email || !password || !organization_id) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User already exists with this email",
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Users({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      organization_id,
    });
    await user.save();
    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      user,
    });
  } catch (error) {
    console.log("Error in addUser:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByIdAndDelete(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    console.log("Error in removeUser:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getOrganizationUsers = async (req, res) => {
  try {
    let { organization_id, page, limit, search } = req.body;

    const filter = { role: "admin" };

    if (organization_id && mongoose.Types.ObjectId.isValid(organization_id)) {
      filter.organization_id = new mongoose.Types.ObjectId(organization_id);
    }
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    limit = limit ? parseInt(limit) : 50;
    page = page ? parseInt(page) : 1;

    const users = await Users.find(filter)
      .populate("organization_id", "organization_name domain")
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await Users.countDocuments(filter);
    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      users,
      admins: users,
      totalPages,
    });
  } catch (error) {
    console.log("Error in getOrganizationUsers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, organization_id } = req.body;
    
    const updateData = { name, email, role, organization_id };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await Users.findByIdAndUpdate(id, updateData);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.log("Error in updateUser:", error);
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
    const user = await Users.findByIdAndUpdate(id, {
      password: hashedPassword,
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      user,
    });
  } catch (error) {
    console.log("Error in resetPassword:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  addUser,
  removeUser,
  getOrganizationUsers,
  updateUser,
  resetPassword,
};
