
require('dotenv').config();

async function listModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log('No models found or error:', data);
    }
  } catch (e) {
    console.error('Fetch error:', e.message);
  }
}

listModels();
