const mongoose = require("mongoose");

const classroomsSchema = new mongoose.Schema(
  {
    room_code: {
      type: String,
      required: true,
      unique: true,
    },
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    name: {
      type: String,
      default: "Untitled Session",
    },
    started_at: {
      type: Date,
      default: null,
    },
    ended_at: {
      type: Date,
      default: null,
    },
    socket_id: {
      type: String,
    },
    dataset_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Datasets",
    },
    scheduled_for: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["waiting", "active", "ended", "scheduled"],
      default: "waiting",
    },
    quizzes: [
      {
        quiz_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quizzes",
          default: null,
        },
        status: {
          type: String,
          enum: ["waiting", "active", "ended"],
          default: "waiting",
        },
        time_limit: {
          type: Number, // duration in minutes
          default: null,
        },
        started_at: {
          type: Date,
          default: null,
        },
        reveal_answers: {
          type: Boolean,
          default: false,
        },
      },
    ],
    students: [
      {
        student_session_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StudentSessions",
        },
      },
    ],
    settings: {
      allow_student_download: { type: Boolean, default: false },
      show_leaderboard: { type: Boolean, default: true },
      is_public: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Classrooms", classroomsSchema);
