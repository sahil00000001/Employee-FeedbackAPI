const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.get('/', projectController.getAllProjects);
router.get('/:project_id', projectController.getProjectById);

module.exports = router;
