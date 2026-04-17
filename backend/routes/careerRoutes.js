const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');

router.get('/careers', careerController.getCareers);
router.post('/simulate', careerController.simulateCareer);
router.post('/analyze-resume', careerController.analyzeResume);
router.post('/chat', careerController.chat);

module.exports = router;
