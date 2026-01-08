import express from 'express';
import * as feedbackAssignmentController from '../controllers/feedbackAssignmentController.js';

const router = express.Router();

router.get('/:employee_id', feedbackAssignmentController.getEmployeeAssignments);
router.get('/:employee_id/peers', feedbackAssignmentController.getAssignedPeers);
router.post('/assign', feedbackAssignmentController.assignReviewer);
router.post('/remove', feedbackAssignmentController.removeReviewer);

export default router;
