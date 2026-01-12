import express from 'express';
import { KRAAssessment } from '../models/KRAAssessment.js';

const router = express.Router();

// Get all assessments
router.get('/', async (req, res) => {
  try {
    const assessments = await KRAAssessment.find();
    res.json({ status: 'success', data: assessments });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get assessment by employee ID
router.get('/:employee_id', async (req, res) => {
  try {
    const assessment = await KRAAssessment.findOne({ employee_id: req.params.employee_id });
    res.json({ status: 'success', data: assessment });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Create or update assessment
router.post('/', async (req, res) => {
  try {
    const { employee_id, status } = req.body;
    
    // Ensure we don't accidentally overwrite a "Completed" or "Submitted" status with "Draft"
    const current = await KRAAssessment.findOne({ employee_id });
    
    let finalStatus = status;
    if (current) {
      const currentStatusLower = (current.status || "").toLowerCase();
      const newStatusLower = (status || "").toLowerCase();
      
      if ((currentStatusLower === "completed" || currentStatusLower === "submitted") && newStatusLower === "draft") {
        finalStatus = current.status; // Keep the more advanced status
      }
    }

    const assessment = await KRAAssessment.findOneAndUpdate(
      { employee_id },
      { $set: { ...req.body, status: finalStatus, updated_at: new Date() } },
      { new: true, upsert: true }
    );
    res.json({ status: 'success', data: assessment });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
