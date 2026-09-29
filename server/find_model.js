
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function findWorkingModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = [
    "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-flash-latest", 
    "gemini-pro-latest", "gemini-1.5-flash", "gemini-1.5-pro"
  ];
  for (const m of models) {
      console.log(`Testing ${m}...`);
      try {
          const model = genAI.getGenerativeModel({ model: m });
          const result = await model.generateContent("hi");
          console.log(`FOUND WORKING MODEL: ${m}`);
          console.log("RESPONSE:", result.response.text());
          process.exit(0);
      } catch (e) {
          console.log(`FAILED: ${m} - ${e.message.substring(0, 100)}...`);
      }
  }
}
findWorkingModel();
