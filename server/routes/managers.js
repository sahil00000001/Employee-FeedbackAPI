const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');

router.get('/', managerController.getAllManagers);
router.get('/:manager_id/team', managerController.getManagerTeam);
router.get('/:manager_id/projects', managerController.getManagerProjects);

module.exports = router;
