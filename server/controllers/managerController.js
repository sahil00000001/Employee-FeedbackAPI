const mongoose = require('mongoose');

// Get all managers
exports.getAllManagers = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { active } = req.query;
    
    const filter = {};
    if (active !== undefined) filter.active = parseInt(active);
    
    const managers = await db.collection('Managers').find(filter).toArray();
    
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
exports.getManagerTeam = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { manager_id } = req.params;
    
    const manager = await db.collection('Managers').findOne({ manager_id });
    
    if (!manager) {
      return res.status(404).json({
        status: 'error',
        message: 'Manager not found'
      });
    }
    
    const peerGroup = await db.collection('Peer_Group')
      .find({ manager_id })
      .toArray();
    
    const teamIds = peerGroup.map(peer => peer.peer_id);
    
    const team = await db.collection('Total_Company')
      .find({ employee_id: { $in: teamIds } })
      .toArray();
    
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
exports.getManagerProjects = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { manager_id } = req.params;
    
    const projects = await db.collection('Project_Details')
      .find({ manager: manager_id })
      .toArray();
    
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
