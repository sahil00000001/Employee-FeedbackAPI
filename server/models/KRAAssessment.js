import mongoose from 'mongoose';

const kraAssessmentSchema = new mongoose.Schema({
  employee_id: { type: String, required: true },
  employee_name: { type: String, required: true },
  employee_email: { type: String, required: true },
  designation: String,
  department: String,
  reporting_manager: String,
  assessment_year: Number,
  assessment_period: String,
  status: { type: String, default: 'Draft' },
  educational_background: [{
    field_name: String,
    field_value: mongoose.Schema.Types.Mixed,
    field_type: String,
    additional_info: String
  }],
  achievements: [{
    achievement_id: String,
    title: String,
    category: String,
    description: String,
    date: String,
    impact_level: String,
    custom_fields: [{
      field_name: String,
      field_value: mongoose.Schema.Types.Mixed,
      field_type: String
    }]
  }],
  contributions: {
    projects: [{
      project_id: String,
      project_name: String,
      project_type: String,
      role: String,
      start_date: String,
      end_date: String,
      status: String,
      outcome: String,
      custom_fields: [{
        field_name: String,
        field_value: mongoose.Schema.Types.Mixed,
        field_type: String
      }]
    }],
    initiatives: [{
      initiative_id: String,
      initiative_name: String,
      description: String,
      impact: String,
      date: String,
      custom_fields: [{
        field_name: String,
        field_value: mongoose.Schema.Types.Mixed,
        field_type: String
      }]
    }],
    process_improvements: [{
      improvement_id: String,
      title: String,
      description: String,
      impact: String,
      custom_fields: [{
        field_name: String,
        field_value: mongoose.Schema.Types.Mixed,
        field_type: String
      }]
    }]
  },
  learning_growth: {
    skills_acquired: [{
      skill_id: String,
      skill_name: String,
      proficiency_level: String,
      acquired_date: String,
      how_acquired: String
    }],
    training_courses: [{
      training_id: String,
      training_name: String,
      provider: String,
      completion_date: String,
      duration_hours: Number,
      certification_received: Boolean
    }]
  },
  ctc_information: {
    current_ctc: Number,
    current_ctc_breakup: [{
      component_name: String,
      component_value: Number,
      percentage: Number
    }],
    expected_ctc: Number,
    increment_percentage: Number,
    increment_amount: Number,
    justification: String
  },
  kra_metrics: [{
    kra_id: String,
    kra_title: String,
    kra_description: String,
    kra_category: String,
    assigned_date: String,
    target_date: String,
    completion_date: String,
    weightage: Number,
    priority: String,
    metrics: [{
      metric_name: String,
      target_value: String,
      achieved_value: String,
      unit: String,
      achievement_percentage: Number
    }],
    self_rating: Number,
    manager_rating: Number,
    final_rating: Number,
    status: String,
    comments: {
      self_comments: String,
      manager_comments: String
    }
  }],
  overall_assessment: {
    self_overall_rating: Number,
    manager_overall_rating: Number,
    final_rating: Number,
    performance_category: String,
    performance_score: Number,
    strengths: [String],
    areas_of_improvement: [String]
  },
  custom_sections: [{
    section_id: String,
    section_name: String,
    section_description: String,
    section_data: [{
      field_name: String,
      field_value: mongoose.Schema.Types.Mixed,
      field_type: String
    }]
  }],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  created_by: String,
  last_updated_by: String
}, { collection: 'Employee_KRA_Assessment' });

export const KRAAssessment = mongoose.model('KRAAssessment', kraAssessmentSchema);
