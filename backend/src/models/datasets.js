const mongoose = require("mongoose");

const datasetsSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    google_drive_file_id: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "parsed", "error"],
      default: "pending",
    },
    access_type: {
      type: String,
      enum: ["all", "selected"],
      default: "selected",
    },
    allowed_organizations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organizations",
      },
    ],
    allowed_teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    headers: [
      {
        type: String,
      },
    ],
    parsed_data: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Datasets", datasetsSchema);
