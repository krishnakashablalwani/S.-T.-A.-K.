const { generateSkillGapData } = require('../utils/aiService');

exports.analyzeSkillGap = async (req, res) => {
    try {
        const { currentRole, targetRole, currentSkills = '', yearsOfExperience = 3 } = req.body;
        if (!currentRole || !targetRole) {
            return res.status(400).json({ error: 'currentRole and targetRole are required.' });
        }
        const data = await generateSkillGapData({ currentRole, targetRole, currentSkills, yearsOfExperience });
        res.json(data);
    } catch (err) {
        console.error('Skill gap error:', err);
        res.status(500).json({ error: 'Skill gap analysis failed.', message: err.message });
    }
};
