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
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Stable model string
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
           'Doctor': { startingSalary: 1200000, growth: 0.05, demand: 95, risk: 2 },
           'Software': { startingSalary: 800000, growth: 0.08, demand: 90, risk: 35 },
           'Artist': { startingSalary: 400000, growth: 0.03, demand: 40, risk: 65 },
           'Manager': { startingSalary: 1000000, growth: 0.06, demand: 70, risk: 25 },
           'Pilot': { startingSalary: 1500000, growth: 0.04, demand: 60, risk: 40 }
        };
        const base = mockMap[Object.keys(mockMap).find(k => careerName.toLowerCase().includes(k.toLowerCase()))] || 
                     { startingSalary: 600000, growth: 0.04, demand: 50, risk: 45 };
        
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
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
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
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
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
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
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

exports.generatePivotPlan = async (currentCareer, targetCareer) => {
    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `You are an expert career transition analyst. A person currently works as a "${currentCareer}" and wants to pivot to become a "${targetCareer}".

Return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:
{
  "currentCareer": "${currentCareer}",
  "targetCareer": "${targetCareer}",
  "compatibilityScore": <integer 0-100>,
  "compatibilitySummary": "<1-2 sentence explanation>",
  "transferableSkills": ["<skill1>", "<skill2>", "<skill3>"],
  "bridgeSkills": ["<skill1>", "<skill2>", "<skill3>", "<skill4>"],
  "roadmap": ["<step1>", "<step2>", "<step3>", "<step4>", "<step5>"],
  "aiInsight": "<2-3 sentences of strategic career advice for this specific transition>"
}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim().replace(/^```json|^```|```$/g, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.warn("Pivot AI failed, using smart fallback:", err.message);
        return {
            currentCareer,
            targetCareer,
            compatibilityScore: 62,
            compatibilitySummary: `${currentCareer} professionals have several transferable analytical and communication skills relevant to ${targetCareer}. The transition is achievable within 12-18 months with focused upskilling.`,
            transferableSkills: [
                "Analytical Thinking & Problem Solving",
                "Stakeholder Communication",
                "Domain Knowledge & Industry Context"
            ],
            bridgeSkills: [
                `Core ${targetCareer} Fundamentals`,
                "Project Management & Agile Methodology",
                "Data-Driven Decision Making",
                "Industry-Specific Tools & Certifications"
            ],
            roadmap: [
                `Month 1-2: Audit your current skills and research the ${targetCareer} landscape`,
                `Month 3-5: Complete a certification focused on ${targetCareer}`,
                `Month 5-8: Build 2-3 portfolio projects demonstrating ${targetCareer} capabilities`,
                `Month 9-11: Network actively — LinkedIn, meetups, open-source contributions`,
                `Month 12+: Apply for junior ${targetCareer} roles while freelancing to build experience`
            ],
            aiInsight: `Your background in ${currentCareer} gives you a unique edge — you understand the real-world problems that ${targetCareer} professionals solve. Lean into that domain expertise while rapidly building the technical toolkit of your target role. This hybrid background is highly attractive to employers seeking practitioners who "get the business."`,
            isMock: true
        };
    }
};

exports.generateFutureSelfLetter = async ({ currentCareer, dreamCareer, currentAge, yearsOfHesitation, overallRegretScore }) => {
    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Write a deeply personal, emotionally raw letter from a person's 65-year-old future self to their ${currentAge}-year-old present self.

Context:
- They currently work as: ${currentCareer}
- The career they kept delaying: ${dreamCareer}
- Years they hesitated making the switch: ${yearsOfHesitation}
- Overall regret score: ${overallRegretScore}/100

Rules:
1. Start with a punchy, unforgettable opening line — not a generic greeting
2. Write 3-4 short paragraphs, each hitting a different dimension of regret: financial, identity, relationships, legacy
3. Be brutally honest but not cruel — this is love, not punishment
4. Reference the specific careers by name
5. End with one clear, urgent instruction to their younger self
6. NO bullet points. Prose only. No sign-off like "Sincerely" — just end on the instruction.
7. Keep total length under 280 words.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (err) {
        console.warn("Future Self Letter AI failed, using fallback:", err.message);
        return `You're still in ${currentCareer}. I know — because I stayed there too.

I'm writing this from 65, from a desk that isn't mine, doing work that stopped meaning anything around year three. You've been telling yourself the switch to ${dreamCareer} is coming. Next quarter. After the appraisal. When the market settles. I said all of it. Word for word. For ${yearsOfHesitation} years I said it, and then I said it for another twenty after that.

The money I left behind is the easy part to say out loud. The harder thing — the thing I still can't look at straight — is who I could have become. ${dreamCareer} wasn't just a job title. It was the version of me that took up space, that made things, that scared itself into growth. That person existed. They just never got the runway.

Don't mistake motion for courage. Staying is also a choice. Staying is a loud, expensive, daily choice that compounds in silence until one morning you're doing the math on how many good years you have left and realising the answer is not enough to start over.

You have enough time. You have more than enough talent. What you don't have is another ${yearsOfHesitation} years to spend deciding.

Start this week. Not Monday. This week.`;
    }
};


exports.generateAlternateUniverseNarrative = async ({ currentCareer, dreamCareer, currentAge, yearsAgo, ghostSalaryToday, currentSalaryToday }) => {
    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const gap = (ghostSalaryToday - currentSalaryToday).toLocaleString('en-IN');
        const prompt = [
            "Write a vivid, 3-sentence scene describing what someone's alternate self is doing RIGHT NOW",
            "- the version who switched from \"" + currentCareer + "\" to \"" + dreamCareer + "\" exactly " + yearsAgo + " year(s) ago.",
            "",
            "They are now " + currentAge + " years old. Their alternate self earns Rs." + ghostSalaryToday.toLocaleString('en-IN') + " per year",
            "vs their current Rs." + currentSalaryToday.toLocaleString('en-IN') + " - a gap of Rs." + gap + ".",
            "",
            "Rules:",
            "- Describe a specific, concrete Monday morning scene - NOT abstract career advice",
            "- Reference both careers by name",
            "- Make it vivid and slightly enviable - not cruel",
            "- Maximum 3 sentences. No filler.",
            "- Do NOT start with 'In an alternate universe' or generic openers."
        ].join("\n");

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (err) {
        console.warn('Alternate Universe AI failed, using fallback:', err.message);
        const annualGap = ghostSalaryToday - currentSalaryToday;
        const role      = yearsAgo >= 3 ? "a recognised name" : "building momentum";
        const action    = yearsAgo >= 3 ? "turning down projects that don't excite them" : "landing clients they once thought were out of reach";
        return "At " + currentAge + ", the version of you that made the switch " + yearsAgo + " year(s) ago wakes up on Monday morning " +
               "and opens a laptop they own outright - not one assigned by a manager. " +
               "They're " + role + " in " + dreamCareer + ", " + action + ". " +
               "That version earns Rs." + (ghostSalaryToday / 100000).toFixed(1) + "L a year - Rs." +
               (annualGap / 100000).toFixed(1) + "L more than you do right now - and the gap is widening every quarter.";
    }
};

/* ── SKILL GAP DATA ─────────────────────────────────────────────── */
exports.generateSkillGapData = async ({ currentRole, targetRole, currentSkills, yearsOfExperience }) => {
    const FALLBACK = {
        skills: [
            { name: 'Core Technical Skills',  current: 35, target: 90, gap: 55, salaryPremium: 350000, weeksToLearn: 12, priority: 1, resource: 'Coursera / fast.ai' },
            { name: 'System Design',           current: 30, target: 85, gap: 55, salaryPremium: 250000, weeksToLearn: 8,  priority: 2, resource: 'System Design Primer (GitHub)' },
            { name: 'Portfolio Projects',      current: 20, target: 90, gap: 70, salaryPremium: 400000, weeksToLearn: 16, priority: 3, resource: 'GitHub / Kaggle / HuggingFace' },
            { name: 'Domain Knowledge',        current: 40, target: 85, gap: 45, salaryPremium: 200000, weeksToLearn: 10, priority: 4, resource: 'Industry blogs & arXiv' },
            { name: 'Communication & Presence',current: 60, target: 90, gap: 30, salaryPremium: 150000, weeksToLearn: 4,  priority: 5, resource: 'Toastmasters / technical writing' },
        ],
        battlePlan: 'Month 1: Build the foundation. Spend 2 hrs/day on the #1 skill gap — start with one structured course and finish it.\n\nMonth 2: Build in public. Ship two portfolio projects targeting the exact role. Imperfect and live beats perfect and local.\n\nMonth 3: Network with purpose. DM 3 people already in your target role each week. Ask for 15-min chats, not jobs.\n\nMonth 4: Apply selectively. Target 5 companies max. Tailor every application. Quality over volume — one great application beats ten generic ones.',
        totalSalaryUnlock: 1350000,
        timeToSwitch: '3-5 months',
    };

    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = [
            'Analyze the skill gap for transitioning from "' + currentRole + '" to "' + targetRole + '".',
            'Experience: ' + yearsOfExperience + ' years. Current skills mentioned: ' + (currentSkills || 'not specified') + '.',
            '',
            'Return ONLY a valid JSON object (no markdown fences) with this exact structure:',
            '{"skills":[{"name":"skill","current":0-100,"target":0-100,"gap":0-100,"salaryPremium":inr_number,"weeksToLearn":number,"priority":1-5,"resource":"free resource"}],"battlePlan":"4 paragraphs - one per month - concrete weekly actions","totalSalaryUnlock":inr_number,"timeToSwitch":"X-Y months"}',
            '',
            'Rules: 5 skills total, ordered by priority. salaryPremium in INR for Indian market. Make skill names specific to this exact transition. timeToSwitch realistic. battlePlan paragraphs separated by newlines.',
        ].join('\n');

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim().replace(/```json|```/gi, '').trim();
        const parsed = JSON.parse(text);
        if (!parsed.skills || !Array.isArray(parsed.skills)) throw new Error('Bad AI structure');
        return parsed;
    } catch (err) {
        console.warn('Skill gap AI failed, using fallback:', err.message);
        return FALLBACK;
    }
};

/* ── BURNOUT NARRATIVE ──────────────────────────────────────────── */
exports.generateBurnoutNarrative = async ({ role, overall, verdict, daysUntilBreakdown, physical, motivational, relational, emotional }) => {
    const fallback = overall >= 75
        ? 'Your burnout trajectory is not a warning — it\'s a countdown. At ' + overall + '/100, the highest drain is coming from ' + (motivational > relational ? 'your motivation collapsing (' + motivational + '/100)' : 'your relationships at work (' + relational + '/100)') + '. You have roughly ' + daysUntilBreakdown + ' days before something breaks — and historically, it\'s never the job that breaks first. Block one hour this weekend to write a 90-day exit draft. Not a plan. A draft.'
        : overall >= 50
        ? 'You\'re at ' + overall + '/100 — past the safety midpoint and drifting. Your ' + (physical > motivational ? 'physical load (' + physical + '/100)' : 'motivation deficit (' + motivational + '/100)') + ' is the fastest-compounding variable. The ' + daysUntilBreakdown + '-day runway feels abstract until it doesn\'t — book a week of leave in the next 30 days and use it to make one concrete career decision.'
        : 'Your burnout index is ' + overall + '/100 — currently manageable, but the trend matters more than the number. Your ' + (physical > motivational ? 'physical dimension (' + physical + '/100)' : 'motivational reserve (' + (100 - motivational) + '% intact)') + ' is your primary buffer. Protect it proactively — one bad sprint or a management change can move this 20 points in 6 weeks.';

    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const highest = Object.entries({ physical, motivational, relational, emotional }).sort((a, b) => b[1] - a[1])[0];
        const prompt = [
            'Write a 3-sentence burnout assessment for someone in "' + role + '".',
            'Burnout score: ' + overall + '/100. Verdict: ' + verdict + '. Days until breakdown: ' + daysUntilBreakdown + '.',
            'Highest dimension: ' + highest[0] + ' at ' + highest[1] + '/100.',
            '',
            'Rules: Be specific and direct. Reference the highest dimension. End with ONE urgent action to take THIS WEEK. No hedging. No "consider". 3 sentences max.',
        ].join('\n');
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (err) {
        console.warn('Burnout AI failed:', err.message);
        return fallback;
    }
};

/* ── FIRE NARRATIVE ─────────────────────────────────────────────── */
exports.generateFIRENarrative = async ({ currentMonthlySalary, dreamMonthlySalary, currentYears, dreamYears, yearsSaved, fireTarget, monthlySavingsCurrent, monthlySavingsDream }) => {
    const fmt = (n) => n >= 10000000 ? (n / 10000000).toFixed(1) + 'Cr' : (n / 100000).toFixed(1) + 'L';
    const fallback = currentYears && dreamYears && yearsSaved > 0
        ? 'On your current salary, financial independence arrives in ' + currentYears + ' years. Switch to the dream career, and that compresses to ' + dreamYears + ' years — a difference of ' + yearsSaved + ' years of your life. That gap is not a financial statistic; it is ' + yearsSaved + ' extra years of Monday mornings you never have to explain yourself to a manager.'
        : 'Financial independence on your current trajectory is ' + (currentYears ? 'achievable in ' + currentYears + ' years' : 'beyond the 50-year horizon — your savings rate needs to increase before compounding can do its job') + '. Run the dream career scenario to see what a salary upgrade does to your retirement clock.';
    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = [
            'Write a 3-sentence FIRE (Financial Independence Retire Early) insight for someone with these numbers:',
            '- Current salary: ₹' + fmt(currentMonthlySalary * 12) + '/yr. Dream salary: ₹' + fmt(dreamMonthlySalary * 12) + '/yr.',
            '- Current path FIRE age offset: ' + (currentYears ?? 'impossible in 50 years') + ' years.',
            '- Dream path FIRE age offset: '  + (dreamYears   ?? 'impossible in 50 years') + ' years.',
            '- Years saved by switching: ' + (yearsSaved ?? 'unknown') + '.',
            '- FIRE target corpus: ₹' + fmt(fireTarget) + '.',
            '- Extra monthly savings from dream salary: ₹' + fmt((monthlySavingsDream - monthlySavingsCurrent) * 12) + '/yr more.',
            '',
            'Rules: Emotionally powerful, no jargon, no hedging. Frame the year difference as lived experience (Mondays, vacations, autonomy). End with one action they should take TODAY. Max 3 sentences.',
        ].join('\n');
        const res = await model.generateContent(prompt);
        return res.response.text().trim();
    } catch (err) {
        console.warn('FIRE AI failed:', err.message);
        return fallback;
    }
};

/* ── CAREER HEALTH REPORT ───────────────────────────────────────── */
exports.generateCareerHealthReport = async ({ role, overall, grade, dims, weakest, strongest }) => {
    const dimNames = { financial: 'Financial Health', growth: 'Growth Trajectory', security: 'Job Security', purpose: 'Purpose Alignment', market: 'Market Position' };
    const fallback = 'Your career health is at ' + overall + '/100 — grade ' + grade + '. The biggest red flag is ' + dimNames[weakest[0]] + ' at ' + weakest[1] + '/100, which is likely the silent anchor holding back your overall trajectory. Your strongest dimension is ' + dimNames[strongest[0]] + ' at ' + strongest[1] + '/100 — that\'s the lever to pull first when planning your next move.';
    try {
        const ai = getAI();
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const dimStr = Object.entries(dims).map(([k, v]) => dimNames[k] + ': ' + v + '/100').join(', ');
        const prompt = [
            'Write a 3-sentence career health diagnosis for someone in "' + role + '".',
            'Overall score: ' + overall + '/100, Grade: ' + grade + '.',
            'Dimensions: ' + dimStr + '.',
            'Weakest: ' + dimNames[weakest[0]] + '. Strongest: ' + dimNames[strongest[0]] + '.',
            '',
            'Rules: Be a brutally honest mentor. Name the specific weakest dimension and its consequence. Name what to do about it in the next 30 days. 3 sentences max, no corporate-speak.',
        ].join('\n');
        const res = await model.generateContent(prompt);
        return res.response.text().trim();
    } catch (err) {
        console.warn('Career health AI failed:', err.message);
        return fallback;
    }
};

