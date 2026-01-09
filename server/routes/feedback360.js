import express from 'express';
import * as feedback360Controller from '../controllers/feedback360Controller.js';

const router = express.Router();

router.get('/', feedback360Controller.getAllFeedback);
router.post('/submit', feedback360Controller.submitFeedback);
router.get('/employee/:employee_id', feedback360Controller.getEmployeeFeedback);
router.get('/summary/:employee_id', feedback360Controller.getFeedbackSummary);

export default router;
