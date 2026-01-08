import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employee_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: String,
  project: String,
  designation: String,
  email: { type: String, required: true },
  active: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { collection: 'Total_Company' });

export const Employee = mongoose.model('Employee', employeeSchema);