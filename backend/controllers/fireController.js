const { generateFIRENarrative } = require('../utils/aiService');

exports.calculateFIRE = async (req, res) => {
    try {
        const {
            currentMonthlySalary = 100000,
            monthlyExpenses      = 60000,
            currentSavings       = 500000,
            dreamMonthlySalary   = 180000,
            annualReturnRate     = 0.12,
        } = req.body;

        const FIRE_MULTIPLIER = 25;
        const annualExpenses  = monthlyExpenses * 12;
        const fireTarget      = annualExpenses * FIRE_MULTIPLIER;

        const simulatePath = (monthlySalary, initCorpus) => {
            const monthlyRate    = annualReturnRate / 12;
            const monthlySavings = Math.max(0, monthlySalary - monthlyExpenses);
            let corpus = initCorpus;
            let months = 0;
            const timeline = [{ year: 0, wealth: Math.round(corpus) }];

            while (corpus < fireTarget && months < 600) {
                corpus = corpus * (1 + monthlyRate) + monthlySavings;
                months++;
                if (months % 12 === 0) {
                    timeline.push({ year: months / 12, wealth: Math.round(corpus) });
                }
            }
            // Pad to same length + a few extra years past FIRE
            for (let extra = 1; extra <= 5; extra++) {
                const y = months / 12 + extra;
                corpus  = corpus * (1 + monthlyRate * 12) + monthlySavings * 12;
                timeline.push({ year: Math.round(y), wealth: Math.round(corpus) });
            }
            return { months: months > 0 ? months : null, timeline, achievable: months < 600 };
        };

        const currentPath = simulatePath(currentMonthlySalary, currentSavings);
        const dreamPath   = simulatePath(dreamMonthlySalary,   currentSavings);

        // Merge timelines for chart (align by year)
        const maxLen  = Math.max(currentPath.timeline.length, dreamPath.timeline.length);
        const chartData = [];
        for (let i = 0; i < maxLen; i++) {
            chartData.push({
                year:    currentPath.timeline[i]?.year    ?? dreamPath.timeline[i]?.year ?? i,
                current: currentPath.timeline[i]?.wealth ?? null,
                dream:   dreamPath.timeline[i]?.wealth   ?? null,
            });
        }

        const currentYears = currentPath.achievable ? Math.ceil(currentPath.months / 12) : null;
        const dreamYears   = dreamPath.achievable   ? Math.ceil(dreamPath.months / 12)   : null;
        const yearsSaved   = currentYears && dreamYears ? currentYears - dreamYears : null;
        const monthlySavingsCurrent = Math.max(0, currentMonthlySalary - monthlyExpenses);
        const monthlySavingsDream   = Math.max(0, dreamMonthlySalary   - monthlyExpenses);

        // SIP needed = monthly contribution required to hit fireTarget in N years from currentSavings
        // Using FV formula: PV*(1+r)^n + PMT*((1+r)^n - 1)/r = FT  →  PMT = (FT - PV*(1+r)^n) / ((1+r)^n - 1) * r
        const computeSIP = (years) => {
            if (!years || years <= 0) return null;
            const r  = annualReturnRate / 12;
            const n  = years * 12;
            const fv = currentSavings * Math.pow(1 + r, n);
            if (fv >= fireTarget) return 0; // already there
            return Math.max(0, Math.round(((fireTarget - fv) * r) / (Math.pow(1 + r, n) - 1)));
        };
        const sipNeededCurrent = computeSIP(currentYears);
        const sipNeededDream   = computeSIP(dreamYears);

        const narrative = await generateFIRENarrative({
            currentMonthlySalary, dreamMonthlySalary, currentYears, dreamYears, yearsSaved, fireTarget,
            monthlySavingsCurrent, monthlySavingsDream,
        });

        res.json({
            fireTarget, currentYears, dreamYears, yearsSaved,
            monthlySavingsCurrent, monthlySavingsDream,
            sipNeededCurrent, sipNeededDream,
            currentAchievable: currentPath.achievable,
            dreamAchievable:   dreamPath.achievable,
            chartData, narrative,
        });
    } catch (err) {
        console.error('FIRE calc error:', err);
        res.status(500).json({ error: err.message });
    }
};
