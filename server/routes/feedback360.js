const express = require('express');
const router = express.Router();
const feedback360Controller = require('../controllers/feedback360Controller');

router.post('/submit', feedback360Controller.submitFeedback);
router.get('/employee/:employee_id', feedback360Controller.getEmployeeFeedback);
router.get('/summary/:employee_id', feedback360Controller.getFeedbackSummary);

module.exports = router;
