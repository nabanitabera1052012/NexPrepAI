const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    intention: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const skillGapSchema = new mongoose.Schema(
  {
    skill: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
  },
  { _id: false }
);

const prepDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    focus: { type: String, required: true },
    tasks: { type: [String], default: [] },
  },
  { _id: false }
);

const interviewReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Inputs (kept so we can re-generate resume PDF later)
    resume: { type: String, default: "" },
    selfDescription: { type: String, default: "" },
    jobDescription: { type: String, default: "" },

    // AI output
    title: { type: String, default: "" },
    matchScore: { type: Number, min: 0, max: 100, default: 0 },
    technicalQuestions: { type: [questionSchema], default: [] },
    behavioralQuestions: { type: [questionSchema], default: [] },
    skillGaps: { type: [skillGapSchema], default: [] },
    preparationPlan: { type: [prepDaySchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewReport", interviewReportSchema);

