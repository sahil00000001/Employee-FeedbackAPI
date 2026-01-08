import express from 'express';
import * as managerController from '../controllers/managerController.js';

const router = express.Router();

router.get('/', managerController.getAllManagers);
router.get('/:manager_id/team', managerController.getManagerTeam);
router.get('/:manager_id/projects', managerController.getManagerProjects);

export default router;
