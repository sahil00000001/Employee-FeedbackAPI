import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  employee_id: { type: String, required: true },
  name: String,
  reviewer_id: { type: String, required: true },
  reviewer_name: String,
  feedback_type: { type: String, enum: ['assigned', 'optional', 'project'], default: 'assigned' },
  ratings: {
    technical_skills: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    teamwork: { type: Number, min: 1, max: 5 },
    leadership: { type: Number, min: 1, max: 5 },
    problem_solving: { type: Number, min: 1, max: 5 }
  },
  comments: String,
  strengths: String,
  areas_of_improvement: String,
  submitted_date: { type: Date, default: Date.now }
}, { collection: '360_Feedback' });

export const Feedback = mongoose.model('Feedback', feedbackSchema);