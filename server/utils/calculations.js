// Calculate overall rating from feedback array
const calculateOverallRating = (feedbackArray) => {
  if (!feedbackArray || feedbackArray.length === 0) return 0;
  
  let totalRating = 0;
  
  feedbackArray.forEach(feedback => {
    const ratings = feedback.ratings;
    const avgRating = (
      ratings.technical_skills +
      ratings.communication +
      ratings.teamwork +
      ratings.leadership +
      ratings.problem_solving
    ) / 5;
    
    totalRating += avgRating;
  });
  
  return parseFloat((totalRating / feedbackArray.length).toFixed(1));
};

// Calculate category-wise averages
const calculateCategoryAverages = (feedbackArray) => {
  if (!feedbackArray || feedbackArray.length === 0) return null;
  
  const categories = [
    'technical_skills',
    'communication',
    'teamwork',
    'leadership',
    'problem_solving'
  ];
  
  const averages = {};
  
  categories.forEach(category => {
    let sum = 0;
    feedbackArray.forEach(feedback => {
      sum += feedback.ratings[category];
    });
    averages[category] = parseFloat((sum / feedbackArray.length).toFixed(1));
  });
  
  return averages;
};

module.exports = {
  calculateOverallRating,
  calculateCategoryAverages
};
