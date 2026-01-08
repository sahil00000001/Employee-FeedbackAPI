import express from 'express';
import * as employeeController from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', employeeController.getAllEmployees);
router.get('/:employee_id', employeeController.getEmployeeById);
router.put('/:employee_id', employeeController.updateEmployee);
router.get('/project/:project_id', employeeController.getEmployeesByProject);
router.get('/department/:department', employeeController.getEmployeesByDepartment);

export default router;
