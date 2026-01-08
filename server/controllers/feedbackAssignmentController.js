import { Assignment } from '../models/Assignment.js';
import { Employee } from '../models/Employee.js';

// Get assignments for an employee
export const getEmployeeAssignments = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const assignment = await Assignment.findOne({ employee_id });
    
    res.json({
      status: 'success',
      data: assignment || { employee_id, assigned: [], optional: [], status: 'pending' }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Assign a reviewer
export const assignReviewer = async (req, res) => {
  try {
    const { employee_id, name, manager_id, reviewer_id, reviewer_name } = req.body;
    
    const reviewer = {
      reviewer_id,
      reviewer_name,
      assigned_date: new Date()
    };
    
    // Check if already assigned
    const existing = await Assignment.findOne({ 
      employee_id, 
      'assigned.reviewer_id': reviewer_id 
    });

    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'Reviewer already assigned'
      });
    }

    const result = await Assignment.findOneAndUpdate(
      { employee_id },
      { 
        $set: { name, manager_id, updated_at: new Date() },
        $setOnInsert: { created_at: new Date(), status: 'in_progress', optional: [] },
        $push: { assigned: reviewer }
      },
      { upsert: true, new: true }
    );
    
    res.json({
      status: 'success',
      message: 'Reviewer assigned successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Remove a reviewer
export const removeReviewer = async (req, res) => {
  try {
    const { employee_id, reviewer_id } = req.body;
    
    const result = await Assignment.findOneAndUpdate(
      { employee_id },
      { 
        $pull: { assigned: { reviewer_id } },
        $set: { updated_at: new Date() }
      },
      { new: true }
    );
    
    res.json({
      status: 'success',
      message: 'Reviewer removed successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get assigned peers for feedback
export const getAssignedPeers = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const assignment = await Assignment.findOne({ employee_id });
    
    if (!assignment || !assignment.assigned) {
      return res.json({
        status: 'success',
        count: 0,
        data: []
      });
    }
    
    const reviewerIds = assignment.assigned.map(a => a.reviewer_id);
    const peers = await Employee.find({ employee_id: { $in: reviewerIds } });
    
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
