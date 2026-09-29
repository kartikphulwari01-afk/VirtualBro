
require('dotenv').config();
console.log('KEY_LENGTH:', process.env.GEMINI_API_KEY.length);
console.log('KEY_START:', process.env.GEMINI_API_KEY.substring(0, 5));
console.log('KEY_END:', process.env.GEMINI_API_KEY.substring(process.env.GEMINI_API_KEY.length - 5));
