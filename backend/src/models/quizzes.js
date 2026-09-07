const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  option: { type: String, required: false },
  is_correct: { type: Boolean, default: false },
});

const questionSchema = new mongoose.Schema({
  dataset_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Datasets",
    required: true,
  },
  sheet_name: {
    type: String,
    required: false,
  },
  selectedRows: [
    {
      type: Number,
    },
  ],
  axisX: {
    type: String,
    default: "",
  },
  axisY: {
    type: String,
    default: "",
  },
  axisR: {
    type: String,
    default: "",
  },
  chartType: {
    type: String,
    default: "Bar",
  },
  groupBy: {
    type: String,
    default: "",
  },
  aggregation: {
    type: String,
    enum: ["Count", "Sum", "Average"],
    default: "Count",
  },
  allowedCharts: {
    type: [String],
    default: ["Bar", "HorizontalBar", "Line", "Area", "Pie", "Doughnut", "Radar", "PolarArea", "Scatter", "Bubble"]
  },
  question_text: {
    type: String,
    required: true,
  },
  question_type: {
    type: String,
    enum: ["mcq", "blank", "text", "choose_one"],
    required: true,
  },
  options: [optionSchema],
  correct_answers: [
    {
      type: String,
      required: false,
    },
  ],
});

const quizzesSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
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
    questions: [questionSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Quizzes", quizzesSchema);
