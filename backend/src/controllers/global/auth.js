const users = require("../../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const token = jwt.sign(
      { _id: user._id, role: user.role, email: user.email, organization_id: user.organization_id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      expiresIn: "7d",
      user,
    });
  } catch (error) {
    console.log("Error in login:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const updateData = { name };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await users.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = { login, updateProfile };
