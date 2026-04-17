require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        console.log("Testing Gemini with key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Say hello world");
        console.log("Response:", result.response.text());
        console.log("✅ GEMINI CONNECTION SUCCESSFUL");
    } catch (err) {
        console.error("❌ GEMINI CONNECTION FAILED:", err);
    }
}

testGemini();
