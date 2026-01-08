const mongoose = require('mongoose');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { active } = req.query;
    
    const filter = {};
    if (active !== undefined) filter.active = parseInt(active);
    
    const projects = await db.collection('Project_Details').find(filter).toArray();
    
    const projectsWithSize = projects.map(project => ({
      ...project,
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
exports.getProjectById = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { project_id } = req.params;
    
    const project = await db.collection('Project_Details').findOne({ project_id });
    
    if (!project) {
      return res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
    }
    
    const people = await db.collection('Total_Company')
      .find({ employee_id: { $in: project.people || [] } })
      .toArray();
    
    res.json({
      status: 'success',
      data: {
        ...project,
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
