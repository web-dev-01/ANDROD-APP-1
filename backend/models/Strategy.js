const mongoose = require("mongoose");

const strategySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    goal: {
      type: String,
      required: [true, "Goal is required"],
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      enum: ["project", "exam", "interview", "business", "study", "fitness", "personal", "other"],
    },
    timeframe: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    unit: {
      type: String,
      required: true,
      enum: ["days", "weeks", "months"],
    },
    plan: {
      type: String,
      required: true,
    },
    tasks: [
      {
        title: String,
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Strategy", strategySchema);
