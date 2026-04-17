const express = require('express');
const router  = express.Router();
const careerController              = require('../controllers/careerController');
const { calculateRegret }           = require('../controllers/regretController');
const { calculateTimeMachine }      = require('../controllers/timeMachineController');
const { analyzeSkillGap }           = require('../controllers/skillGapController');
const { calculateBurnout }          = require('../controllers/burnoutController');
const { calculateFIRE }             = require('../controllers/fireController');
const { calculateCareerHealth }     = require('../controllers/careerHealthController');

router.get('/careers',          careerController.getCareers);
router.post('/simulate',        careerController.simulateCareer);
router.post('/analyze-resume',  careerController.analyzeResume);
router.post('/chat',            careerController.chat);
router.post('/pivot',           careerController.pivotCareer);
router.post('/regret',          calculateRegret);
router.post('/time-machine',    calculateTimeMachine);
router.post('/skill-gap',       analyzeSkillGap);
router.post('/burnout',         calculateBurnout);
router.post('/fire',            calculateFIRE);
router.post('/career-health',   calculateCareerHealth);

module.exports = router;

