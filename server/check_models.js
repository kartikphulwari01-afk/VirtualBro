
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There is no direct listModels in the client SDK like this usually, 
    // but let's try to see if we can get it or just try common names.
    console.log("Checking common names...");
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("test");
            console.log(`Model ${m} is available:`, result.response.text().substring(0, 20));
        } catch (e) {
            console.log(`Model ${m} failed:`, e.message);
        }
    }
  } catch (err) {
    console.error(err);
  }
}

listModels();
