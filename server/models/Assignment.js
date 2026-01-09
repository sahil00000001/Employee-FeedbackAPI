import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  employee_id: { type: String, required: true, unique: true },
  name: String,
  manager_id: String,
  assigned: [{
    reviewer_id: String,
    reviewer_name: String,
    assigned_date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    submitted_date: { type: Date }
  }],
  optional: [{
    reviewer_id: String,
    reviewer_name: String,
    selected_date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    submitted_date: { type: Date }
  }],
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { collection: 'Assign_Feedback' });

export const Assignment = mongoose.model('Assignment', assignmentSchema);