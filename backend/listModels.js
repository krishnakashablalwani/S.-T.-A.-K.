require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use the model to get the list of models
    // In SDK 0.24.1, listModels might be under genAI or require a different approach
    // We can also try a direct generic model call to list
    const response = await genAI.getGenerativeModel({ model: "gemini-pro" }).listModels(); // This might not work
    // Correct way in some SDK versions:
    // Some versions don't have listModels directly on genAI.
    // Let's try to just guess a few more: gemini-1.5-flash-001, gemini-1.5-pro-001
    console.log("Attempting to list models...");
  } catch (err) {
    console.error("FAILED TO LIST MODELS:", err.message);
    // Try to fallback to a known high-probability model if list failed
    console.log("SUGGESTION: Try 'gemini-1.5-pro' or 'gemini-2.0-flash-exp'");
  }
}
run();
