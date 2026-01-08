const mongoose = require('mongoose');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { active, department, project } = req.query;
    
    const filter = {};
    if (active !== undefined) filter.active = parseInt(active);
    if (department) filter.department = department;
    if (project) filter.project = project;
    
    const employees = await db.collection('Total_Company').find(filter).toArray();
    
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
exports.getEmployeeById = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { employee_id } = req.params;
    
    const employee = await db.collection('Total_Company').findOne({ employee_id });
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }
    
    // Get manager info from Peer_Group
    const peerInfo = await db.collection('Peer_Group').findOne({ peer_id: employee_id });
    let manager_info = null;
    
    if (peerInfo && peerInfo.manager_id) {
      const manager = await db.collection('Managers').findOne({ manager_id: peerInfo.manager_id });
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
        ...employee,
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
exports.updateEmployee = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { employee_id } = req.params;
    const updateData = req.body;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date();
    
    const result = await db.collection('Total_Company').findOneAndUpdate(
      { employee_id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result.value && !result) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Employee updated successfully',
      data: result.value || result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get employees by project
exports.getEmployeesByProject = async (req, res) => {
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
    
    const employees = await db.collection('Total_Company')
      .find({ employee_id: { $in: project.people || [] } })
      .toArray();
    
    res.json({
      status: 'success',
      project: project.name,
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
exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { department } = req.params;
    
    const employees = await db.collection('Total_Company')
      .find({ department })
      .toArray();
    
    res.json({
      status: 'success',
      department,
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
