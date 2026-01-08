import { Manager } from '../models/Manager.js';
import { Employee } from '../models/Employee.js';
import { Project } from '../models/Project.js';
import { Assignment } from '../models/Assignment.js';

// Get all managers
export const getAllManagers = async (req, res) => {
  try {
    const { active } = req.query;
    
    const filter = {};
    if (active !== undefined) filter.active = parseInt(active);
    
    const managers = await Manager.find(filter);
    
    res.json({
      status: 'success',
      count: managers.length,
      data: managers
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get manager's team
export const getManagerTeam = async (req, res) => {
  try {
    const { manager_id } = req.params;
    
    const manager = await Manager.findOne({ manager_id });
    
    if (!manager) {
      return res.status(404).json({
        status: 'error',
        message: 'Manager not found'
      });
    }
    
    const assignments = await Assignment.find({ manager_id });
    const teamIds = assignments.map(a => a.employee_id);
    
    const team = await Employee.find({ employee_id: { $in: teamIds } });
    
    res.json({
      status: 'success',
      manager: {
        manager_id: manager.manager_id,
        name: manager.name,
        project: manager.project_id
      },
      team_count: team.length,
      team
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get manager's projects
export const getManagerProjects = async (req, res) => {
  try {
    const { manager_id } = req.params;
    const projects = await Project.find({ manager: manager_id });
    
    res.json({
      status: 'success',
      manager_id,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
