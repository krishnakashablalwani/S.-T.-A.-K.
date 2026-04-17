const { generateFutureSelfLetter } = require('../utils/aiService');

const calculateRegret = async (req, res) => {
  try {
    const { currentCareer, dreamCareer, currentAge, yearsOfHesitation, currentSalary } = req.body;

    const age    = Number(currentAge)        || 28;
    const years  = Number(yearsOfHesitation) || 2;
    const salary = Number(currentSalary)     || 1200000;

    // ── FINANCIAL MODEL ────────────────────────────────────────────
    // Conservative assumption: current career grows at 10% p.a.,
    // dream career (actively pursued) grows at 18% p.a.
    const currentRate = 0.10;
    const dreamRate   = 0.18;
    const annualGap   = salary * (dreamRate - currentRate);

    // Compound wealth lost over hesitation period (FV of annuity)
    const wealthGap   = Math.round(annualGap * ((Math.pow(1 + dreamRate, years) - 1) / dreamRate));
    const costPerDay  = Math.round(annualGap / 365);
    const costPerHour = Math.round(costPerDay / 24);

    // Wealth at retirement (65) on each path
    const yearsToRetirement = Math.max(0, 65 - age);
    const wealthStay  = Math.round(salary * ((Math.pow(1 + currentRate, yearsToRetirement) - 1) / currentRate));
    const wealthPivot = Math.round(salary * ((Math.pow(1 + dreamRate,   yearsToRetirement) - 1) / dreamRate));
    const retirementGap = wealthPivot - wealthStay;

    // ── REGRET SCORE BREAKDOWN (0-100) ─────────────────────────────
    const financialRegret = Math.min(100, Math.round(
      Math.min(years * 9, 55) + Math.min(salary / 120000, 45)
    ));
    const purposeRegret   = Math.min(100, Math.round(52 + years * 4));
    const autonomyRegret  = Math.min(100, Math.round(48 + years * 4.5));
    const growthRegret    = Math.min(100, Math.round(43 + years * 5.5));

    const overallRegretScore = Math.round(
      financialRegret * 0.30 +
      purposeRegret   * 0.30 +
      autonomyRegret  * 0.20 +
      growthRegret    * 0.20
    );

    // ── VERDICT ────────────────────────────────────────────────────
    const verdict = overallRegretScore > 70 ? 'PIVOT_NOW'
                  : overallRegretScore > 45 ? 'PLAN_PIVOT'
                  : 'STAY_OPTIMISE';

    // ── BRUTAL INSIGHTS ────────────────────────────────────────────
    const fmt = (n) => n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr`
                     : n >= 100000   ? `₹${(n/100000).toFixed(1)}L`
                     : `₹${n.toLocaleString('en-IN')}`;

    const insights = [
      `Every 24 hours in ${currentCareer} instead of ${dreamCareer} costs exactly ${fmt(costPerDay)} in compounded opportunity wealth.`,
      `Over ${years} year(s) of hesitation you have already surrendered ${fmt(wealthGap)} — gone, not recoverable.`,
      `If you pivot today you retire with ${fmt(retirementGap)} more than if you stay. That's the price of inaction.`,
      `The longer you wait, the steeper the skill ramp. Your ${dreamCareer} peers are ${years} year(s) ahead accumulating experience you don't have.`,
      `${100 - Math.round(currentRate / dreamRate * 100)}% less retirement corpus on your current path vs. the dream career path. That's not a rounding error — it's a life outcome.`,
    ];

    // ── AI LETTER ──────────────────────────────────────────────────
    const futureSelfLetter = await generateFutureSelfLetter({
      currentCareer, dreamCareer, currentAge: age, yearsOfHesitation: years, overallRegretScore
    });

    res.json({
      currentCareer,
      dreamCareer,
      currentAge: age,
      yearsOfHesitation: years,
      wealthGap,
      costPerDay,
      costPerHour,
      retirementGap,
      wealthStay,
      wealthPivot,
      overallRegretScore,
      regretBreakdown: {
        financial: financialRegret,
        purpose:   purposeRegret,
        autonomy:  autonomyRegret,
        growth:    growthRegret,
      },
      insights,
      verdict,
      futureSelfLetter,
      yearsToRetirement,
    });
  } catch (err) {
    console.error('Regret calc error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { calculateRegret };
