import { Assignment } from '../models/Assignment.js';
import { Employee } from '../models/Employee.js';

// Get all assignments
export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({});
    // Map to camelCase if frontend expects it
    const formatted = assignments.map(a => ({
      id: a._id,
      employeeId: a.employee_id,
      name: a.name,
      managerId: a.manager_id,
      peers: a.assigned.map(rev => rev.reviewer_id),
      status: a.status
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Bulk assign reviewers (matching frontend payload)
export const assignReviewerBulk = async (req, res) => {
  try {
    const { employeeId, managerId, peers } = req.body;
    
    const assigned = peers.map(reviewer_id => ({
      reviewer_id,
      assigned_date: new Date()
    }));

    const result = await Assignment.findOneAndUpdate(
      { employee_id: employeeId },
      { 
        $set: { 
          manager_id: managerId, 
          assigned: assigned,
          updated_at: new Date(),
          status: 'in_progress'
        },
        $setOnInsert: { created_at: new Date(), optional: [] }
      },
      { upsert: true, new: true }
    );
    
    res.json({
      status: 'success',
      message: 'Reviewers assigned successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get reviews assigned TO a specific person
export const getAssignedToReviewer = async (req, res) => {
  try {
    const { reviewer_id } = req.params;
    const assignments = await Assignment.find({ 
      'assigned.reviewer_id': reviewer_id 
    });
    
    // Format for the "My Reviews" page
    const formatted = assignments.map(a => {
      const assignmentInfo = a.assigned.find(r => r.reviewer_id === reviewer_id);
      return {
        employeeId: a.employee_id,
        employeeName: a.name,
        status: assignmentInfo?.status || a.status,
        assignedDate: assignmentInfo?.assigned_date
      };
    });

    res.json({
      status: 'success',
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

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
