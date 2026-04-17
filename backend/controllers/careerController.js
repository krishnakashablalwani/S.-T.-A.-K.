const aiService = require('../utils/aiService');

exports.getCareers = (req, res) => {
  res.json([]);
};

exports.simulateCareer = async (req, res) => {
  try {
    const { 
      careerName, 
      yearsToSimulate = 10, 
      userSkillLevel = 'Beginner',
      compareCareerName = '',
      location = 'Global Average',
      inflationRate = 0.03,
      startingDebt = 0,
      debtInterestRate = 0.05,
      lifeEvents = [] 
    } = req.body;

    if (!careerName || careerName.trim() === '') {
      return res.status(400).json({ message: 'Career name is required' });
    }

    const career = await aiService.generateCareerParams(careerName);

    let compareCareer = null;
    if (compareCareerName && compareCareerName.trim() !== '') {
      compareCareer = await aiService.generateCareerParams(compareCareerName);
    }

    let skillModifier = 0;
    if (userSkillLevel === 'Intermediate') skillModifier = 0.15;
    if (userSkillLevel === 'Advanced') skillModifier = 0.30;

    let locationSalaryMultiplier = 1.0;
    let locationDemandModifier = 0;
    if (location === 'Tier-1 City') {
      locationSalaryMultiplier = 1.2;
      locationDemandModifier = -5; 
    } else if (location === 'Rural') {
      locationSalaryMultiplier = 0.8;
      locationDemandModifier = 5; 
    }

    const calculateTimeline = (chosenCareer) => {
      let currentSalary = chosenCareer.startingSalary * (1 + skillModifier) * locationSalaryMultiplier;
      let currentDebt = parseFloat(startingDebt) || 0;
      let accumulatedCash = 0;
      let currentGrowthRate = chosenCareer.averageAnnualGrowthRate;

      const timeline = [];

      for (let year = 1; year <= yearsToSimulate; year++) {
        const event = lifeEvents.find(e => parseInt(e.year) === year);
        if (event) {
          accumulatedCash -= parseFloat(event.cost || 0);
          currentGrowthRate += parseFloat(event.newGrowthRateBoost || 0);
        }

        let demandVol = Math.floor(Math.random() * 11) - 5;
        let autoRiskVol = Math.floor(Math.random() * 11) - 5;
        let currentDemand = Math.min(100, Math.max(1, chosenCareer.jobDemandScore + locationDemandModifier + demandVol));
        let currentAutoRisk = Math.min(100, Math.max(0, chosenCareer.automationRisk + autoRiskVol));

        let realSalary = currentSalary / Math.pow(1 + parseFloat(inflationRate), year - 1);

        let debtPayment = currentSalary * 0.10;
        if (currentDebt > 0) {
          currentDebt = currentDebt * (1 + parseFloat(debtInterestRate));
          if (debtPayment >= currentDebt) {
            accumulatedCash += (debtPayment - currentDebt); 
            currentDebt = 0;
          } else {
            currentDebt -= debtPayment;
          }
        } else {
          accumulatedCash += debtPayment;
        }
        
        let netWorth = accumulatedCash - currentDebt;

        timeline.push({
          year: `Year ${year}`,
          salary: Math.round(currentSalary),
          realSalary: Math.round(realSalary),
          jobDemandScore: currentDemand,
          automationRisk: currentAutoRisk,
          remainingDebt: Math.max(0, Math.round(currentDebt)),
          netWorth: Math.round(netWorth)
        });

        currentSalary = currentSalary * (1 + currentGrowthRate);
      }
      return timeline;
    };

    const primaryTimeline = calculateTimeline(career);
    let combinedTimeline = primaryTimeline;

    if (compareCareer) {
      const compareTimeline = calculateTimeline(compareCareer);
      combinedTimeline = primaryTimeline.map((pt, index) => {
        const ct = compareTimeline[index];
        return {
          ...pt,
          compareSalary: ct.salary,
          compareRealSalary: ct.realSalary,
          compareJobDemandScore: ct.jobDemandScore,
          compareAutomationRisk: ct.automationRisk,
          compareRemainingDebt: ct.remainingDebt,
          compareNetWorth: ct.netWorth
        };
      });
    }

    const finalYear = primaryTimeline[primaryTimeline.length - 1];
    const insightSummary = await aiService.generateInsightSummary(career.name, finalYear);

    res.json({
      careerName: career.name,
      compareCareerName: compareCareer ? compareCareer.name : null,
      timeline: combinedTimeline,
      insightSummary
    });
  } catch (err) {
    console.error("SIMULATION ERROR STACK:", err.stack);
    res.status(500).json({ 
      error: 'Simulation failed. Target server error or Missing API Key.',
      details: err.message 
    });
  }
};

exports.analyzeResume = async (req, res) => {
  try {
    const { skills, careerName } = req.body;
    if (!skills || !careerName) return res.status(400).json({ message: 'Missing skills or careerName' });
    const analysis = await aiService.analyzeResume(skills, careerName);
    res.json({ analysis });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'AI Analysis Failed' });
  }
};

exports.chat = async (req, res) => {
  try {
    const { careerName, timelineSummary, message } = req.body;
    if (!message) return res.status(400).json({ message: 'Missing message' });
    const aiResponse = await aiService.chatWithTimeline(careerName, timelineSummary, message);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'AI Chat Failed' });
  }
};
