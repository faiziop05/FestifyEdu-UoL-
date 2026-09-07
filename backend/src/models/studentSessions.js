const mongoose = require("mongoose");

const studentSessionsSchema = new mongoose.Schema(
  {
    classroom_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Classrooms",
      required: true,
    },
    display_name: {
      type: String,
      required: true,
    },
    student_id: {
      type: String,
      required: true,
    },
    socket_id: {
      type: String, // To manage real-time connections
    },
    score: {
      type: Number,
      default: 0,
    },
    answers: [
      {
        question_id: {
          type: mongoose.Schema.Types.ObjectId,
        },
        answer: {
          type: mongoose.Schema.Types.Mixed,
        },
        is_correct: {
          type: Boolean,
        },
      },
    ],
    saved_progress: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    submitted_quizzes: [
      {
        quiz_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quizzes",
        },
        submitted_at: {
          type: Date,
          default: Date.now,
        },
        score: {
          type: Number,
          default: 0,
        },
        answers: [
          {
            question_id: String,
            answer: mongoose.Schema.Types.Mixed,
            is_correct: Boolean,
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ["connected", "disconnected"],
      default: "connected",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StudentSessions", studentSessionsSchema);
