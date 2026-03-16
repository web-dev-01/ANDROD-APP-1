require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash-exp", "gemini-1.0-pro"];
  
  for (const modelName of models) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'OK'");
      console.log(`✅ ${modelName} works: ${result.response.text()}`);
      return modelName;
    } catch (e) {
      console.log(`❌ ${modelName} error: ${e.message}`);
    }
  }
}

listModels();
