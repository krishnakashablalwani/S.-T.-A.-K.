const { generateCareerHealthReport } = require('../utils/aiService');

exports.calculateCareerHealth = async (req, res) => {
    try {
        const { role = 'Unknown', answers = {} } = req.body;
        // answers: { q1..q10 } each 1-5
        const q = (k) => Math.min(5, Math.max(1, Number(answers[k]) || 3));

        // Dimension scores (0-100)
        const dims = {
            financial: Math.round(((q('q1') + q('q2')) / 2) * 20),
            growth:    Math.round(((q('q3') + q('q4')) / 2) * 20),
            security:  Math.round(((q('q5') + q('q6')) / 2) * 20),
            purpose:   Math.round(((q('q7') + q('q8')) / 2) * 20),
            market:    Math.round(((q('q9') + q('q10'))/ 2) * 20),
        };

        const overall  = Math.round(Object.values(dims).reduce((a, b) => a + b, 0) / 5);
        const weakest  = Object.entries(dims).sort((a, b) => a[1] - b[1])[0];
        const strongest= Object.entries(dims).sort((a, b) => b[1] - a[1])[0];
        const grade    = overall >= 80 ? 'A' : overall >= 65 ? 'B' : overall >= 50 ? 'C' : overall >= 35 ? 'D' : 'F';

        const report = await generateCareerHealthReport({ role, overall, grade, dims, weakest, strongest });

        res.json({ overall, grade, dims, weakest: weakest[0], strongest: strongest[0], report, role });
    } catch (err) {
        console.error('Career health error:', err);
        res.status(500).json({ error: err.message });
    }
};
