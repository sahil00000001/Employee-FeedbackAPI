import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  project_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  people: [String],
  scrum_master: String,
  manager: String,
  active: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { collection: 'Project_Details' });

export const Project = mongoose.model('Project', projectSchema);