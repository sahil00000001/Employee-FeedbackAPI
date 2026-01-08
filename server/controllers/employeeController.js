import { Employee } from '../models/Employee.js';
import { Assignment } from '../models/Assignment.js';
import { Manager } from '../models/Manager.js';

// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const { active, department, project } = req.query;
    
    const filter = {};
    if (active !== undefined) filter.active = parseInt(active);
    if (department) filter.department = department;
    if (project) filter.project = project;
    
    const employees = await Employee.find(filter);
    
    res.json({
      status: 'success',
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { employee_id } = req.params;
    
    const employee = await Employee.findOne({ employee_id });
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }
    
    // Get manager info from Assignment (used to be Peer_Group)
    const assignment = await Assignment.findOne({ employee_id });
    let manager_info = null;
    
    if (assignment && assignment.manager_id) {
      const manager = await Manager.findOne({ manager_id: assignment.manager_id });
      if (manager) {
        manager_info = {
          manager_id: manager.manager_id,
          manager_name: manager.name
        };
      }
    }
    
    res.json({
      status: 'success',
      data: {
        ...employee.toObject(),
        manager_info
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const updateData = req.body;
    
    updateData.updated_at = new Date();
    
    const employee = await Employee.findOneAndUpdate(
      { employee_id },
      { $set: updateData },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Employee updated successfully',
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get employees by project
export const getEmployeesByProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const employees = await Employee.find({ project: project_id });
    
    res.json({
      status: 'success',
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get employees by department
export const getEmployeesByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const employees = await Employee.find({ department });
    
    res.json({
      status: 'success',
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
