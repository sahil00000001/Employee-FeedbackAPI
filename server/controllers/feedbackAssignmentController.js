const mongoose = require('mongoose');

// Get assignments for an employee
exports.getEmployeeAssignments = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { employee_id } = req.params;
    
    const assignment = await db.collection('Peer_Group').findOne({ peer_id: employee_id });
    
    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assignments not found'
      });
    }
    
    res.json({
      status: 'success',
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get assigned peers for feedback
exports.getAssignedPeers = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { employee_id } = req.params;
    
    const peerGroup = await db.collection('Peer_Group').findOne({ peer_id: employee_id });
    
    if (!peerGroup || !peerGroup.peers) {
      return res.json({
        status: 'success',
        count: 0,
        data: []
      });
    }
    
    const peers = await db.collection('Total_Company')
      .find({ employee_id: { $in: peerGroup.peers } })
      .toArray();
    
    res.json({
      status: 'success',
      count: peers.length,
      data: peers
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
