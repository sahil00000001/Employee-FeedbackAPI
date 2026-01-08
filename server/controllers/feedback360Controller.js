const mongoose = require('mongoose');
const { validateFeedbackSubmission } = require('../utils/validators');
const { calculateOverallRating, calculateCategoryAverages } = require('../utils/calculations');

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const feedbackData = req.body;
    
    // Validate submission
    const validation = validateFeedbackSubmission(feedbackData);
    if (!validation.valid) {
      return res.status(400).json({
        status: 'error',
        message: validation.message
      });
    }
    
    // Add timestamp
    feedbackData.created_at = new Date();
    
    const result = await db.collection('Feedback_360').insertOne(feedbackData);
    
    res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully',
      data: {
        _id: result.insertedId,
        ...feedbackData
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get feedback for an employee
exports.getEmployeeFeedback = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { employee_id } = req.params;
    
    const feedback = await db.collection('Feedback_360')
      .find({ employee_id })
      .toArray();
    
    res.json({
      status: 'success',
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get feedback summary (averages)
exports.getFeedbackSummary = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const { employee_id } = req.params;
    
    const feedback = await db.collection('Feedback_360')
      .find({ employee_id })
      .toArray();
    
    if (feedback.length === 0) {
      return res.json({
        status: 'success',
        message: 'No feedback found for this employee',
        summary: null
      });
    }
    
    const summary = {
      overall_rating: calculateOverallRating(feedback),
      category_averages: calculateCategoryAverages(feedback),
      total_reviews: feedback.length
    };
    
    res.json({
      status: 'success',
      employee_id,
      summary
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
