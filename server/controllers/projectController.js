import { Project } from '../models/Project.js';
import { Employee } from '../models/Employee.js';

// Get all projects
export const getAllProjects = async (req, res) => {
  try {
    const { active } = req.query;
    
    const filter = {};
    if (active !== undefined) filter.active = parseInt(active);
    
    const projects = await Project.find(filter);
    
    const projectsWithSize = projects.map(project => ({
      ...project.toObject(),
      team_size: project.people ? project.people.length : 0
    }));
    
    res.json({
      status: 'success',
      count: projectsWithSize.length,
      data: projectsWithSize
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get project by ID with full details
export const getProjectById = async (req, res) => {
  try {
    const { project_id } = req.params;
    
    const project = await Project.findOne({ project_id });
    
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }
    
    const people = await Employee.find({ employee_id: { $in: project.people || [] } });
    
    res.json({
      status: 'success',
      data: {
        ...project.toObject(),
        people_details: people
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
