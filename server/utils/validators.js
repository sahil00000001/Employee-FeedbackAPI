// Validate employee ID
const validateEmployeeId = (employee_id) => {
  if (!employee_id) {
    return { valid: false, message: 'employee_id is required' };
  }
  return { valid: true };
};

// Validate ratings
const validateRatings = (ratings) => {
  const required = ['technical_skills', 'communication', 'teamwork', 'leadership', 'problem_solving'];
  
  for (let field of required) {
    if (!ratings[field]) {
      return { valid: false, message: `${field} is required` };
    }
    if (ratings[field] < 1 || ratings[field] > 5) {
      return { valid: false, message: `${field} must be between 1 and 5` };
    }
  }
  
  return { valid: true };
};

// Validate feedback submission
const validateFeedbackSubmission = (data) => {
  const required = ['employee_id', 'reviewer_id', 'reviewer_name', 'feedback_type', 'ratings'];
  
  for (let field of required) {
    if (!data[field]) {
      return { valid: false, message: `${field} is required` };
    }
  }
  
  // Validate ratings
  const ratingsValidation = validateRatings(data.ratings);
  if (!ratingsValidation.valid) {
    return ratingsValidation;
  }
  
  // Validate feedback_type
  if (!['assigned', 'optional'].includes(data.feedback_type)) {
    return { valid: false, message: 'feedback_type must be "assigned" or "optional"' };
  }
  
  return { valid: true };
};

module.exports = {
  validateEmployeeId,
  validateRatings,
  validateFeedbackSubmission
};
