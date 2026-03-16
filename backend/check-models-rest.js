require("dotenv").config();
const axios = require("axios");

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const response = await axios.get(url);
    console.log("Available Models:");
    response.data.models.forEach(m => {
      console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods})`);
    });
  } catch (error) {
    console.error("Error listing models:", error.response?.data || error.message);
  }
}

listModels();
