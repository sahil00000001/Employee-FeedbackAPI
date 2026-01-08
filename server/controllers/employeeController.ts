import mongoose from 'mongoose';

// Get all employees
export const getAllEmployees = async (req: any, res: any) => {
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');
    const { active, department, project } = req.query;
    
    const filter: any = {};
    if (active !== undefined) filter.active = parseInt(active);
    if (department) filter.department = department;
    if (project) filter.project = project;
    
    const employees = await db.collection('Total_Company').find(filter).toArray();
    
    res.json({
      status: 'success',
      count: employees.length,
      data: employees
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get employee by ID
export const getEmployeeById = async (req: any, res: any) => {
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');
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
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update employee
export const updateEmployee = async (req: any, res: any) => {
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');
    const { employee_id } = req.params;
    const updateData = req.body;
    
    updateData.updated_at = new Date();
    
    const result = await db.collection('Total_Company').findOneAndUpdate(
      { employee_id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Employee updated successfully',
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get employees by project
export const getEmployeesByProject = async (req: any, res: any) => {
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');
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
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get employees by department
export const getEmployeesByDepartment = async (req: any, res: any) => {
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');
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
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
