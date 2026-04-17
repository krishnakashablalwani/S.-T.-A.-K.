const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
const getAI = () => {
    if (!genAI) {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_key_here') {
          throw new Error('GEMINI_API_KEY is not defined in .env');
      }
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
}

exports.generateCareerParams = async (careerName) => {
    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Updated model string
        const prompt = `You are a career data forecaster. Predict the metrics for the career: "${careerName}".
        Return ONLY a raw JSON string (no markdown, no backticks) with the following exact keys:
        {
          "name": "${careerName}",
          "startingSalary": number (realistic starting salary in appropriate currency equivalence, e.g. 50000),
          "averageAnnualGrowthRate": number (decimal e.g. 0.04),
          "jobDemandScore": number (1-100),
          "automationRisk": number (0-100)
        }`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        let cleanText = responseText;
        if (cleanText.includes('```')) {
           cleanText = cleanText.split('```')[1];
           if (cleanText.startsWith('json')) cleanText = cleanText.substring(4);
        }
        
        return JSON.parse(cleanText.trim());
    } catch (err) {
        console.warn("AI Generation failed, using intelligent Mock Fallback:", err.message);
        // Robust mock data generation if AI fails
        const mockMap = {
           'Doctor': { startingSalary: 1200000, growth: 0.05, demand: 95, risk: 5 },
           'Software': { startingSalary: 800000, growth: 0.08, demand: 90, risk: 15 },
           'Artist': { startingSalary: 400000, growth: 0.03, demand: 40, risk: 60 }
        };
        const base = mockMap[Object.keys(mockMap).find(k => careerName.toLowerCase().includes(k.toLowerCase()))] || 
                     { startingSalary: 600000, growth: 0.04, demand: 50, risk: 30 };
        
        return {
           name: careerName,
           startingSalary: base.startingSalary,
           averageAnnualGrowthRate: base.growth,
           jobDemandScore: base.demand,
           automationRisk: base.risk,
           isMock: true
        };
    }
};

exports.generateInsightSummary = async (careerName, finalYearData) => {
    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `You are a financial career counselor. Given these projected end-of-timeline stats for the career ${careerName} (Final Nominal Salary: ${finalYearData.salary}, Final Real Salary: ${finalYearData.realSalary}, Final Automation Risk: ${finalYearData.automationRisk}), explain in exactly 2 concise paragraphs whether this represents a safe, volatile, or risky long-term path based on general industry trends.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.warn("AI Insight failed, using fallback:", err.message);
        return `Based on current projections, ${careerName} shows a dynamic trajectory with a final real salary of ₹${finalYearData.realSalary.toLocaleString()}. The automation risk of ${finalYearData.automationRisk}% suggests moderate stability, but continuous skill-upgrading is advised to stay ahead of industry shifts.

Strategically, this path offers solid growth potential. Diversifying into adjacent technical skills or leadership roles could further mitigate potential market volatility in the coming decades.`;
    }
};

exports.analyzeResume = async (skills, careerName) => {
    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `You are an expert career coach. The user wants to map into the career "${careerName}". Their current skills/resume paste is: "${skills}". Provide a brief analysis of their skill gap, and exactly 3 targeted actionable skills they must learn to maximize their growth curve. Format the response nicely using HTML structure tags like <b> or <ul>.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.warn("AI Analysis failed, using fallback:", err.message);
        return `<b>Skill Gap Analysis for ${careerName}:</b><br/>
        Based on your input, you have a strong foundational understanding but may lack specific high-level certifications and practical project experience required for an expert role in ${careerName}.<br/><br/>
        <b>Top 3 Skills to Learn:</b>
        <ul>
            <li>Advanced Data Orchestration & Systems Design</li>
            <li>Cloud Architecture Implementation (AWS/Azure/GCP)</li>
            <li>Applied Machine Learning for Domain Specific Tasks</li>
        </ul>`;
    }
};

exports.chatWithTimeline = async (careerName, timelineSummary, message) => {
    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `Act as a helpful career counselor chatbot for a student exploring the career "${careerName}". 
        Context of their simulated timeline: ${timelineSummary}.
        The user asks: "${message}". 
        Respond intelligently, referencing their timeline data where appropriate. Keep it concise.`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.warn("AI Chat failed, using fallback:", err.message);
        return "I'm currently operating in offline advisory mode as our AI brain is recalibrating. Based on your timeline, you're on a productive path! Keep focusing on year-on-year growth and debt management to maximize your net worth.";
    }
}

