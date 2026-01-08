import express from 'express';
import * as projectController from '../controllers/projectController.js';

const router = express.Router();

router.get('/', projectController.getAllProjects);
router.get('/:project_id', projectController.getProjectById);

export default router;
