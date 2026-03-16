const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Strategy = require("../models/Strategy");
const auth = require("../middleware/auth");

const router = express.Router();

// All strategy routes require authentication
router.use(auth);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function buildPrompt(goal, category, timeframe, unit) {
  return `Act as a senior strategy consultant. Create a CONCISE roadmap for: "${goal}".
Category: ${category} | Timeframe: ${timeframe} ${unit}

STRICT FORMAT:
1. Overview: 1 sentence, max 20 words.
2. Tasks: Exactly 8 to 10 bullet points. NOT more than 10.
3. Each task: Starts with a dash (-), max 10 words, actionable verb first.
4. No intro, no outro, no headers. Just overview + bullets.
5. Keep it practical and time-bound.`;
}

function extractTasks(plan) {
  const tasks = [];
  const lines = plan.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Match lines that start with - or • or numbered lists
    if (
      (trimmed.startsWith("- ") || trimmed.startsWith("• ")) &&
      trimmed.length > 3
    ) {
      tasks.push({
        title: trimmed.replace(/^[-•]\s*/, "").trim(),
        completed: false,
      });
    }
  }
  return tasks;
}

// POST /api/strategy/generate
router.post("/generate", async (req, res) => {
  try {
    const { goal, category, timeframe, unit } = req.body;

    if (!goal || !category || !timeframe || !unit) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (timeframe < 1 || timeframe > 365) {
      return res
        .status(400)
        .json({ error: "Timeframe must be between 1 and 365." });
    }

    const validUnits = ["days", "weeks", "months"];
    if (!validUnits.includes(unit)) {
      return res.status(400).json({ error: "Unit must be days, weeks, or months." });
    }

    const prompt = buildPrompt(goal, category, timeframe, unit);

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent(prompt);
    const plan = result.response.text();

    const tasks = extractTasks(plan);

    res.json({ plan, tasks });
  } catch (error) {
    console.error("Generate strategy error:", error);
    res.status(500).json({ error: "Failed to generate strategy. Please try again." });
  }
});

// POST /api/strategy/save
router.post("/save", async (req, res) => {
  try {
    const { goal, category, timeframe, unit, plan, tasks } = req.body;

    if (!goal || !plan) {
      return res.status(400).json({ error: "Goal and plan are required." });
    }

    const strategy = await Strategy.create({
      userId: req.userId,
      goal,
      category: category || "other",
      timeframe: timeframe || 7,
      unit: unit || "days",
      plan,
      tasks: tasks || [],
    });

    res.status(201).json(strategy);
  } catch (error) {
    console.error("Save strategy error:", error);
    res.status(500).json({ error: "Failed to save strategy." });
  }
});

// GET /api/strategy/my-strategies
router.get("/my-strategies", async (req, res) => {
  try {
    const strategies = await Strategy.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(strategies);
  } catch (error) {
    console.error("Fetch strategies error:", error);
    res.status(500).json({ error: "Failed to fetch strategies." });
  }
});

// GET /api/strategy/:id
router.get("/:id", async (req, res) => {
  try {
    const strategy = await Strategy.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!strategy) {
      return res.status(404).json({ error: "Strategy not found." });
    }

    res.json(strategy);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch strategy." });
  }
});

// PATCH /api/strategy/:id/task/:taskIndex
router.patch("/:id/task/:taskIndex", async (req, res) => {
  try {
    const { completed } = req.body;
    const { id, taskIndex } = req.params;

    const strategy = await Strategy.findOne({ _id: id, userId: req.userId });
    if (!strategy) {
      return res.status(404).json({ error: "Strategy not found." });
    }

    const idx = parseInt(taskIndex);
    if (idx < 0 || idx >= strategy.tasks.length) {
      return res.status(400).json({ error: "Invalid task index." });
    }

    strategy.tasks[idx].completed = completed;
    await strategy.save();

    res.json(strategy);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task." });
  }
});

// DELETE /api/strategy/:id
router.delete("/:id", async (req, res) => {
  try {
    const strategy = await Strategy.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!strategy) {
      return res.status(404).json({ error: "Strategy not found." });
    }

    res.json({ message: "Strategy deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete strategy." });
  }
});

module.exports = router;
