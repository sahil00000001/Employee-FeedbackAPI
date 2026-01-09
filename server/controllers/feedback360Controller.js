import { Feedback } from '../models/Feedback.js';
import { calculateOverallRating, calculateCategoryAverages } from '../utils/calculations.js';

// Get all feedback
export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({});
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

// Submit feedback
export const submitFeedback = async (req, res) => {
  try {
    const feedbackData = req.body;
    
    const feedback = new Feedback({
      employee_id: feedbackData.employeeId,
      name: feedbackData.name,
      reviewer_id: feedbackData.reviewerId,
      reviewer_name: feedbackData.reviewerName,
      feedback_type: feedbackData.feedbackType,
      ratings: {
        technical_skills: feedbackData.technicalSkills || 3,
        communication: feedbackData.communication || 3,
        teamwork: feedbackData.teamwork || 3,
        leadership: feedbackData.leadership || 3,
        problem_solving: feedbackData.problemSolving || 3
      },
      detailed_ratings: feedbackData.detailedRatings || [],
      comments: feedbackData.comments,
      strengths: feedbackData.strengths,
      areas_of_improvement: feedbackData.areasOfImprovement,
      submitted_date: new Date()
    });

    await feedback.save();
    
    res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get feedback for an employee
export const getEmployeeFeedback = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const feedback = await Feedback.find({ employee_id });
    
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
export const getFeedbackSummary = async (req, res) => {
  try {
    const { employee_id } = req.params;
    
    const feedback = await Feedback.find({ employee_id });
    
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
