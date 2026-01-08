const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/', employeeController.getAllEmployees);
router.get('/:employee_id', employeeController.getEmployeeById);
router.put('/:employee_id', employeeController.updateEmployee);
router.get('/project/:project_id', employeeController.getEmployeesByProject);
router.get('/department/:department', employeeController.getEmployeesByDepartment);

module.exports = router;
