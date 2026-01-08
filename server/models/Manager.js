import mongoose from 'mongoose';

const managerSchema = new mongoose.Schema({
  manager_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  project_id: String,
  active: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now }
}, { collection: 'Managers' });

export const Manager = mongoose.model('Manager', managerSchema);