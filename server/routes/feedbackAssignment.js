const express = require('express');
const router = express.Router();
const feedbackAssignmentController = require('../controllers/feedbackAssignmentController');

router.get('/:employee_id', feedbackAssignmentController.getEmployeeAssignments);
router.get('/:employee_id/peers', feedbackAssignmentController.getAssignedPeers);

module.exports = router;
