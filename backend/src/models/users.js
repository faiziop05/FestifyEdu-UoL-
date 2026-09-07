const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["teacher", "admin", "super_admin"],
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organizations",
    required: true,
  },
  google_drive_email: {
    type: String,
    required: false,
    sparse: true,
  },
  google_drive_id: {
    type: String,
    required: false,
    sparse: true,
  },
  google_drive_refresh_token: {
    type: String,
    required: false,
    sparse: true,
  },
});

module.exports = mongoose.model("Users", usersSchema);
