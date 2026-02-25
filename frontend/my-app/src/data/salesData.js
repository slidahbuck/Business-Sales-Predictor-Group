// Mock Walmart clothing sales forecast data based on historical patterns

export const categories = ['Women\'s Clothing', 'Men\'s Clothing', 'Other Clothing'];

// Monthly sales predictions by category (in thousands of dollars)
export const monthlyForecastData = {
  'Women\'s Clothing': [
    { month: 'Jan', predicted: 145, yoy: 3.5, action: 'maintain' },
    { month: 'Feb', predicted: 168, yoy: 8.2, action: 'increase' },
    { month: 'Mar', predicted: 192, yoy: 12.1, action: 'increase' },
    { month: 'Apr', predicted: 178, yoy: 6.4, action: 'increase' },
    { month: 'May', predicted: 156, yoy: 2.1, action: 'maintain' },
    { month: 'Jun', predicted: 142, yoy: -1.8, action: 'reduce' },
    { month: 'Jul', predicted: 138, yoy: -3.2, action: 'reduce' },
    { month: 'Aug', predicted: 165, yoy: 7.5, action: 'increase' },
    { month: 'Sep', predicted: 182, yoy: 10.3, action: 'increase' },
    { month: 'Oct', predicted: 195, yoy: 14.6, action: 'increase' },
    { month: 'Nov', predicted: 238, yoy: 22.4, action: 'increase' },
    { month: 'Dec', predicted: 256, yoy: 25.8, action: 'increase' }
  ],
  'Men\'s Clothing': [
    { month: 'Jan', predicted: 125, yoy: 2.8, action: 'maintain' },
    { month: 'Feb', predicted: 118, yoy: -0.5, action: 'maintain' },
    { month: 'Mar', predicted: 132, yoy: 5.2, action: 'increase' },
    { month: 'Apr', predicted: 128, yoy: 3.1, action: 'maintain' },
    { month: 'May', predicted: 135, yoy: 6.8, action: 'increase' },
    { month: 'Jun', predicted: 142, yoy: 9.2, action: 'increase' },
    { month: 'Jul', predicted: 138, yoy: 7.1, action: 'increase' },
    { month: 'Aug', predicted: 145, yoy: 10.5, action: 'increase' },
    { month: 'Sep', predicted: 148, yoy: 11.8, action: 'increase' },
    { month: 'Oct', predicted: 152, yoy: 13.2, action: 'increase' },
    { month: 'Nov', predicted: 185, yoy: 21.5, action: 'increase' },
    { month: 'Dec', predicted: 198, yoy: 24.3, action: 'increase' }
  ],
  'Other Clothing': [
    { month: 'Jan', predicted: 85, yoy: 1.2, action: 'maintain' },
    { month: 'Feb', predicted: 88, yoy: 3.5, action: 'maintain' },
    { month: 'Mar', predicted: 95, yoy: 8.1, action: 'increase' },
    { month: 'Apr', predicted: 92, yoy: 5.7, action: 'increase' },
    { month: 'May', predicted: 98, yoy: 9.2, action: 'increase' },
    { month: 'Jun', predicted: 102, yoy: 11.8, action: 'increase' },
    { month: 'Jul', predicted: 105, yoy: 13.5, action: 'increase' },
    { month: 'Aug', predicted: 112, yoy: 16.2, action: 'increase' },
    { month: 'Sep', predicted: 96, yoy: 6.8, action: 'increase' },
    { month: 'Oct', predicted: 94, yoy: 4.5, action: 'maintain' },
    { month: 'Nov', predicted: 115, yoy: 18.6, action: 'increase' },
    { month: 'Dec', predicted: 128, yoy: 22.1, action: 'increase' }
  ]
};

// Breakdown by category for selected month
export const getCategoryBreakdown = (monthIndex) => {
  return [
    { category: 'Women\'s Clothing', sales: monthlyForecastData['Women\'s Clothing'][monthIndex].predicted },
    { category: 'Men\'s Clothing', sales: monthlyForecastData['Men\'s Clothing'][monthIndex].predicted },
    { category: 'Other Clothing', sales: monthlyForecastData['Other Clothing'][monthIndex].predicted }
  ];
};

// Insights data
export const insights = {
  busiestMonths: [
    { month: 'November', reason: 'Black Friday and holiday shopping preparation drive peak demand across all categories.' },
    { month: 'December', reason: 'Holiday season and gift purchases result in highest annual sales.' },
    { month: 'October', reason: 'Back-to-school shopping and early holiday preparation increase demand.' }
  ],
  slowestMonths: [
    { month: 'January', reason: 'Post-holiday slowdown as consumers recover from holiday spending.' },
    { month: 'July', reason: 'Mid-summer period with reduced clothing purchases.' },
    { month: 'February', reason: 'Between-season period with lower overall demand for new clothing.' }
  ],
  howItWorks: {
    title: 'How the Forecast Was Built',
    points: [
      'Analyzed historical Walmart sales data from multiple years',
      'Identified seasonal trends and recurring monthly patterns',
      'Accounted for category-specific demand variations between men\'s, women\'s, and other clothing',
      'Applied predictive models to estimate future monthly sales'
    ]
  },
  wasteReduction: {
    title: 'How This Helps Reduce Waste',
    benefits: [
      'Reduce Overstocking: Order appropriate inventory levels for low-demand months',
      'Optimize Stock Levels: Increase inventory ahead of peak seasons to meet demand',
      'Lower Markdowns: Minimize excess inventory that requires discounting',
      'Smarter Restocking: Make data-driven decisions on when to replenish each category',
      'Sustainability: Reduce waste from unsold inventory and improve resource efficiency'
    ]
  }
};
