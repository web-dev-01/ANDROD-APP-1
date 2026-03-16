require("dotenv").config();
const https = require("https");

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
  let data = "";
  res.on("data", (chunk) => { data += chunk; });
  res.on("end", () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        console.log("AVAILABLE MODELS:");
        json.models.forEach(m => {
          if (m.supportedGenerationMethods.includes("generateContent")) {
            console.log(`- ${m.name.split("/")[1]}`);
          }
        });
      } else {
        console.log("No models found or error:", json);
      }
    } catch (e) {
      console.log("Error parsing response:", e.message);
    }
  });
}).on("error", (err) => {
  console.log("Error:", err.message);
});
