
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro", "gemini-1.0-pro"];
  for (const m of models) {
      try {
          const model = genAI.getGenerativeModel({ model: m });
          const result = await model.generateContent("hi");
          console.log(`SUCCESS: ${m}`);
          process.exit(0);
      } catch (e) {
          console.log(`FAILED: ${m} - ${e.message}`);
      }
  }
}

listModels();
