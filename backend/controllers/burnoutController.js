const { generateBurnoutNarrative } = require('../utils/aiService');

exports.calculateBurnout = async (req, res) => {
    try {
        const {
            role           = 'Unknown',
            hoursPerWeek   = 45,
            commuteMinutes = 60,
            lastVacationMonths = 6,
            likesWork      = false,
            managerQuality = 'ok',   // 'good' | 'ok' | 'bad'
            workLifeBalance = 5,      // 1-10
            meaningfulness  = 5,      // 1-10
        } = req.body;

        // ── Dimension scoring: 0-100, higher = more burned out ──────────
        const physical = Math.min(100, Math.round(
            Math.max(0, hoursPerWeek - 40) * 2.8 +   // overtime penalty
            commuteMinutes * 0.38 +                    // commute drain
            Math.min(lastVacationMonths, 12) * 3.5     // no-vacation penalty
        ));

        const motivational = Math.min(100, Math.round(
            (!likesWork ? 40 : 0) +
            (10 - meaningfulness) * 5.5 +
            (10 - workLifeBalance) * 2.5
        ));

        const relational = Math.min(100, Math.round(
            (managerQuality === 'bad' ? 52 : managerQuality === 'ok' ? 22 : 6) +
            (10 - workLifeBalance) * 2
        ));

        const emotional = Math.min(100, Math.round(
            (!likesWork ? 33 : 5) +
            (10 - meaningfulness) * 4 +
            Math.min(lastVacationMonths, 12) * 2.8
        ));

        const overall = Math.min(100, Math.round(
            physical * 0.25 + motivational * 0.35 + relational * 0.20 + emotional * 0.20
        ));

        // Days until breakdown (logarithmic — burns faster when already high)
        const daysUntilBreakdown = overall >= 80
            ? Math.max(7,  Math.round((100 - overall) * 1.8))
            : Math.max(30, Math.round((100 - overall) * 3.5));

        const verdict = overall >= 75 ? 'CRITICAL'
            : overall >= 50 ? 'WARNING'
            : overall >= 25 ? 'WATCH'
            : 'STABLE';

        const narrative = await generateBurnoutNarrative({
            role, overall, verdict, daysUntilBreakdown, physical, motivational, relational, emotional,
        });

        res.json({ overall, daysUntilBreakdown, verdict, dimensions: { physical, motivational, relational, emotional }, narrative, role });
    } catch (err) {
        console.error('Burnout error:', err);
        res.status(500).json({ error: 'Burnout calculation failed.', message: err.message });
    }
};
