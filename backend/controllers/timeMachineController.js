const { generateAlternateUniverseNarrative } = require('../utils/aiService');

const calculateTimeMachine = async (req, res) => {
  try {
    const { currentCareer, dreamCareer, currentAge, currentSalary, yearsAgo } = req.body;

    const age    = Number(currentAge)    || 28;
    const salary = Number(currentSalary) || 1200000;
    const X      = Math.max(1, Number(yearsAgo) || 2);
    const FUTURE = 10;

    const currentRate = 0.10;
    const dreamRate   = 0.18;
    const SAVINGS     = 0.25; // assumed savings rate

    // Back-calculate salary X years ago (before any raises)
    const startSalary = salary / Math.pow(1 + currentRate, X);

    // ── COMBINED TIMELINE ─────────────────────────────────────────
    // from (age - X) → (age + FUTURE)
    const timeline = [];
    let ghostWealthAcc   = 0;
    let currentWealthAcc = 0;

    for (let i = 0; i <= X + FUTURE; i++) {
      const year    = age - X + i;
      const isPast  = year < age;
      const isToday = year === age;

      const ghostSalary   = Math.round(startSalary * Math.pow(1 + dreamRate,   i));
      const currentSalaryY = Math.round(startSalary * Math.pow(1 + currentRate, i));

      timeline.push({
        year,
        yearLabel:     isToday ? 'TODAY' : String(year),
        ghostSalary,
        currentSalary: currentSalaryY,
        ghostWealth:   Math.round(ghostWealthAcc),
        currentWealth: Math.round(currentWealthAcc),
        salaryGap:     ghostSalary - currentSalaryY,
        isPast,
        isToday,
      });

      // Accumulate wealth for NEXT year's entry
      ghostWealthAcc   += ghostSalary   * SAVINGS;
      currentWealthAcc += currentSalaryY * SAVINGS;
    }

    // ── KEY METRICS ───────────────────────────────────────────────
    const todayPoint         = timeline.find(p => p.isToday);
    const futurePoint        = timeline[timeline.length - 1];

    const ghostSalaryToday   = todayPoint?.ghostSalary    || 0;
    const ghostWealthToday   = todayPoint?.ghostWealth    || 0;
    const currentWealthToday = todayPoint?.currentWealth  || 0;
    const wealthGapToday     = ghostWealthToday - currentWealthToday;
    const futureSalaryGap    = futurePoint.ghostSalary - futurePoint.currentSalary;
    const costPerDay         = Math.round((ghostSalaryToday - salary) / 365);

    // ── AI NARRATIVE ──────────────────────────────────────────────
    const narrative = await generateAlternateUniverseNarrative({
      currentCareer, dreamCareer,
      currentAge: age, yearsAgo: X,
      ghostSalaryToday, currentSalaryToday: salary,
    });

    res.json({
      currentCareer, dreamCareer,
      currentAge: age, yearsAgo: X,
      startSalary:        Math.round(startSalary),
      ghostSalaryToday,
      currentSalaryToday: salary,
      salaryGapToday:     ghostSalaryToday - salary,
      wealthGapToday,
      futureSalaryGap,
      costPerDay,
      narrative,
      timeline,
      rates: { currentRate, dreamRate },
    });
  } catch (err) {
    console.error('Time Machine error:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { calculateTimeMachine };
