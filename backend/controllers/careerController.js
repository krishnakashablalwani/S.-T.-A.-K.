const aiService = require('../utils/aiService');
const fs = require('fs');
const path = require('path');

const calculateTax = (annualIncome) => {
  // Simplified Indian New Tax Regime 2025-26
  // Standard Deduction: 75,000
  let taxable = Math.max(0, annualIncome - 75000);
  
  // Rebate: If taxable income <= 1,200,000, zero tax
  if (taxable <= 1200000) return 0;

  let tax = 0;
  const slabs = [
    { limit: 400000, rate: 0 },
    { limit: 400000, rate: 0.05 }, // 4L-8L
    { limit: 400000, rate: 0.10 }, // 8L-12L
    { limit: 400000, rate: 0.15 }, // 12L-16L
    { limit: 400000, rate: 0.20 }, // 16L-20L
    { limit: 400000, rate: 0.25 }, // 20L-24L
  ];

  let remaining = taxable;
  for (const slab of slabs) {
    const taxableInSlab = Math.min(remaining, slab.limit);
    tax += taxableInSlab * slab.rate;
    remaining -= taxableInSlab;
    if (remaining <= 0) break;
  }
  
  if (remaining > 0) {
    tax += remaining * 0.30;
  }

  return tax;
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
      lifeEvents = [],
      scenarioGrowthMod = 1.0,
      scenarioLayoffMod = 1.0,
      learningInvestment = false
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
    if (location === 'Tier 1') {
      locationSalaryMultiplier = 1.2;
      locationDemandModifier = -5; 
    } else if (location === 'Tier 3') {
      locationSalaryMultiplier = 0.8;
      locationDemandModifier = 5;
    }
    // Tier 2 = baseline (1.0)

    const calculateTimeline = (chosenCareer) => {
      let currentSalary = chosenCareer.startingSalary * (1 + skillModifier) * locationSalaryMultiplier;
      let currentDebt = parseFloat(startingDebt) || 0;
      let accumulatedCash = 0;
      let currentGrowthRate = chosenCareer.averageAnnualGrowthRate * scenarioGrowthMod;
      let cumulativeBurnout = 0;
      let skillLevel = 50 + (skillModifier * 100); // 50 base, boosted by initial skill
      let currentAutoRiskBase = chosenCareer.automationRisk;

      // [5] PPP Purchasing Power Modifier
      const pppMultipliers = {
        'Tier 1': 0.7,  // Higher CoL, lower purchasing power per ₹
        'Tier 2': 0.85,
        'Tier 3': 1.0,
        'Global Average': 0.9
      };
      const pppFactor = pppMultipliers[location] || 0.85;

      const timeline = [];

      for (let year = 1; year <= yearsToSimulate; year++) {
        const event = lifeEvents.find(e => parseInt(e.year) === year);
        if (event) {
          accumulatedCash -= parseFloat(event.cost || 0);
          currentGrowthRate += parseFloat(event.newGrowthRateBoost || 0);
        }

        // [3] Job Market Volatility / Layoffs
        // Risk of layoff increases with automationRisk. 
        // A layoff results in 4 months (0.33 year) of zero income.
        let layoffOccurred = false;
        const baseLayoffRisk = chosenCareer.automationRisk / 1000;
        const adjustedLayoffRisk = baseLayoffRisk * scenarioLayoffMod;
        if (Math.random() < adjustedLayoffRisk) {
          layoffOccurred = true;
        }

        let demandVol = Math.floor(Math.random() * 11) - 5;
        let autoRiskVol = Math.floor(Math.random() * 11) - 5;
        let currentDemand = Math.min(100, Math.max(1, chosenCareer.jobDemandScore + locationDemandModifier + demandVol));
        // Skill Decay Engine: automation risk drifts based on learning investment
        let currentAutoRisk = Math.min(100, Math.max(0, currentAutoRiskBase + autoRiskVol));

        // [1] Taxation & Net Income
        const annualTax = calculateTax(currentSalary);
        const netAnnualIncome = currentSalary - annualTax;
        
        let monthlyIncome = netAnnualIncome / 12;
        let incomeThisYear = layoffOccurred ? (monthlyIncome * 8) : netAnnualIncome;

        // [SKILL DECAY ENGINE]
        if (learningInvestment) {
          // Invest 5% of gross salary in upskilling
          const learningCost = currentSalary * 0.05;
          incomeThisYear -= learningCost;
          // Reward: grow +1% faster, automation risk declines
          currentGrowthRate = Math.min(currentGrowthRate + 0.005, 0.30);
          skillLevel = Math.min(100, skillLevel + 2.5);
          currentAutoRiskBase = Math.max(0, currentAutoRiskBase - 1.5);
        } else {
          // Skill decays: growth rate erodes 0.5%/year, automation risk creeps up
          currentGrowthRate = Math.max(currentGrowthRate - 0.003, 0.005);
          skillLevel = Math.max(0, skillLevel - 1.5);
          currentAutoRiskBase = Math.min(100, currentAutoRiskBase + 0.8);
        }

        // [6/Realism] Real Salary with PPP
        let realSalary = (currentSalary * pppFactor) / Math.pow(1 + parseFloat(inflationRate), year - 1);

        let debtPayment = currentSalary * 0.10; // Aggressive repayment
        if (currentDebt > 0) {
          currentDebt = currentDebt * (1 + parseFloat(debtInterestRate));
          if (debtPayment >= currentDebt) {
            incomeThisYear -= currentDebt; 
            currentDebt = 0;
          } else {
            currentDebt -= debtPayment;
            incomeThisYear -= debtPayment;
          }
        }
        
        accumulatedCash += incomeThisYear;
        let netWorth = accumulatedCash - currentDebt;

        // Burnout score: automation risk × stress of layoff events
        const yearlyStress = (currentAutoRisk / 10) + (layoffOccurred ? 15 : 0);
        cumulativeBurnout = Math.min(100, cumulativeBurnout * 0.9 + yearlyStress * 0.1);

        timeline.push({
          year: `Year ${year}`,
          salary: Math.round(currentSalary),
          netSalary: Math.round(netAnnualIncome),
          realSalary: Math.round(realSalary),
          jobDemandScore: currentDemand,
          automationRisk: currentAutoRisk,
          remainingDebt: Math.max(0, Math.round(currentDebt)),
          netWorth: Math.round(netWorth),
          layoffDetected: layoffOccurred,
          burnoutScore: Math.round(cumulativeBurnout),
          skillLevel: Math.round(skillLevel)
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

exports.getCareers = (req, res) => {
  try {
    const data = fs.readFileSync(path.join(__dirname, '../models/mockDatabase.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error loading careers' });
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

exports.pivotCareer = async (req, res) => {
  try {
    const { currentCareer, targetCareer } = req.body;
    if (!currentCareer || !targetCareer) {
      return res.status(400).json({ message: 'Both currentCareer and targetCareer are required.' });
    }
    const pivotPlan = await aiService.generatePivotPlan(currentCareer, targetCareer);
    res.json(pivotPlan);
  } catch (err) {
    console.error('PIVOT ERROR:', err.stack);
    res.status(500).json({ error: 'Pivot analysis failed', details: err.message });
  }
};

