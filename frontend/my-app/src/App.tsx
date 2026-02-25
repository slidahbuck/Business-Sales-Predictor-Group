import { useState } from 'react';

// Mock data
const monthlyForecastData = {
  "Women's Clothing": [
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
  "Men's Clothing": [
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
  "Other Clothing": [
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

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState("Women's Clothing");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const categories = ["Women's Clothing", "Men's Clothing", "Other Clothing"];
  const currentData = monthlyForecastData[selectedCategory as keyof typeof monthlyForecastData];
  
  const maxValue = Math.max(...currentData.map(d => d.predicted));
  const highestMonth = currentData.reduce((max, item) => item.predicted > max.predicted ? item : max);
  const lowestMonth = currentData.reduce((min, item) => item.predicted < min.predicted ? item : min);

  const getCategoryBreakdown = (monthIndex: number) => {
    return [
      { category: "Women's Clothing", sales: monthlyForecastData["Women's Clothing"][monthIndex].predicted },
      { category: "Men's Clothing", sales: monthlyForecastData["Men's Clothing"][monthIndex].predicted },
      { category: "Other Clothing", sales: monthlyForecastData["Other Clothing"][monthIndex].predicted }
    ];
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'increase': return 'Increase Stock';
      case 'reduce': return 'Reduce Stock';
      default: return 'Maintain';
    }
  };

  const getYoyIcon = (yoy: number) => {
    if (yoy > 5) return '↗';
    if (yoy < -2) return '↘';
    return '→';
  };

  const getYoyClass = (yoy: number) => {
    if (yoy > 0) return 'yoy-positive';
    if (yoy < 0) return 'yoy-negative';
    return 'yoy-neutral';
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">W</div>
            <div className="logo-text">
              <h1>Walmart</h1>
              <p>Sales Forecast</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <button 
                className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('dashboard')}
              >
                <span className="nav-icon">📊</span>
                <span>Dashboard</span>
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-button ${currentPage === 'insights' ? 'active' : ''}`}
                onClick={() => setCurrentPage('insights')}
              >
                <span className="nav-icon">💡</span>
                <span>Forecast Insights</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          Inventory Planning Tool
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {currentPage === 'dashboard' ? (
          <>
            <div className="page-header">
              <h1>Sales Forecast Dashboard</h1>
              <p>Predict demand and optimize inventory to reduce waste</p>
            </div>

            {/* Category Selector */}
            <div className="category-selector">
              <div className="category-tabs">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`tab-button ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedMonth(null);
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Card */}
            <div className="card">
              <h2 className="card-title">Monthly Sales Forecast</h2>
              <p className="card-subtitle">Click on a month to see category breakdown</p>

              <div className="chart">
                <div className="chart-bars">
                  {currentData.map((item, index) => (
                    <div 
                      key={item.month} 
                      className="bar-wrapper"
                      onClick={() => setSelectedMonth(index)}
                    >
                      <div 
                        className={`bar ${selectedMonth === index ? 'selected' : ''}`}
                        style={{ height: `${(item.predicted / maxValue) * 100}%` }}
                      >
                        <span className="bar-value">${item.predicted}K</span>
                      </div>
                      <span className="bar-label">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card highest">
                  <p className="stat-label">HIGHEST SALES</p>
                  <p className="stat-value">{highestMonth.month}</p>
                  <p className="stat-detail">${highestMonth.predicted}K predicted</p>
                </div>
                <div className="stat-card lowest">
                  <p className="stat-label">LOWEST SALES</p>
                  <p className="stat-value">{lowestMonth.month}</p>
                  <p className="stat-detail">${lowestMonth.predicted}K predicted</p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {selectedMonth !== null && (
              <div className="card">
                <h2 className="card-title">
                  {currentData[selectedMonth].month} - Category Breakdown
                </h2>

                <div className="horizontal-chart">
                  {getCategoryBreakdown(selectedMonth).map((item) => {
                    const maxBreakdownValue = Math.max(...getCategoryBreakdown(selectedMonth).map(d => d.sales));
                    return (
                      <div key={item.category} className="h-bar-item">
                        <div className="h-bar-label">{item.category}</div>
                        <div className="h-bar-track">
                          <div 
                            className="h-bar" 
                            style={{ width: `${(item.sales / maxBreakdownValue) * 100}%` }}
                          >
                            ${item.sales}K
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Data Table */}
            <div className="card">
              <h2 className="card-title">Monthly Prediction Data</h2>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Predicted Sales</th>
                    <th>YoY Change</th>
                    <th>Replenishment Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, index) => (
                    <tr 
                      key={row.month}
                      className={selectedMonth === index ? 'selected' : ''}
                    >
                      <td className="month">{row.month}</td>
                      <td>${row.predicted}K</td>
                      <td>
                        <div className="yoy-cell">
                          <span className={getYoyClass(row.yoy)}>{getYoyIcon(row.yoy)}</span>
                          <span className={getYoyClass(row.yoy)}>
                            {row.yoy > 0 ? '+' : ''}{row.yoy}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`action-badge ${row.action}`}>
                          {getActionText(row.action)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="page-header">
              <h1>Forecast Insights</h1>
              <p>Understand the predictions and make smarter ordering decisions</p>
            </div>

            {/* How It Works */}
            <div className="insight-card">
              <div className="insight-header">
                <div className="insight-icon blue">🎯</div>
                <div className="insight-title-text">
                  <h2>How the Forecast Was Built</h2>
                  <p>The foundation of accurate predictions</p>
                </div>
              </div>

              <div className="insight-points">
                <div className="insight-point">
                  <div className="point-number">1</div>
                  <p>Analyzed historical Walmart sales data from multiple years</p>
                </div>
                <div className="insight-point">
                  <div className="point-number">2</div>
                  <p>Identified seasonal trends and recurring monthly patterns</p>
                </div>
                <div className="insight-point">
                  <div className="point-number">3</div>
                  <p>Accounted for category-specific demand variations between men's, women's, and other clothing</p>
                </div>
                <div className="insight-point">
                  <div className="point-number">4</div>
                  <p>Applied predictive models to estimate future monthly sales</p>
                </div>
              </div>
            </div>

            {/* Busiest Months */}
            <div className="insight-card">
              <div className="insight-header">
                <div className="insight-icon green">📈</div>
                <div className="insight-title-text">
                  <h2>Busiest Months</h2>
                  <p>Peak demand periods requiring increased inventory</p>
                </div>
              </div>

              <div className="month-grid">
                <div className="month-card green">
                  <div className="month-header">
                    <span className="month-icon">📅</span>
                    <h3>November</h3>
                  </div>
                  <p>Black Friday and holiday shopping preparation drive peak demand across all categories.</p>
                </div>
                <div className="month-card green">
                  <div className="month-header">
                    <span className="month-icon">📅</span>
                    <h3>December</h3>
                  </div>
                  <p>Holiday season and gift purchases result in highest annual sales.</p>
                </div>
                <div className="month-card green">
                  <div className="month-header">
                    <span className="month-icon">📅</span>
                    <h3>October</h3>
                  </div>
                  <p>Back-to-school shopping and early holiday preparation increase demand.</p>
                </div>
              </div>

              <div className="action-box green">
                <p><strong>Action:</strong> Increase stock levels 2-3 weeks before these months to ensure adequate inventory for peak demand.</p>
              </div>
            </div>

            {/* Slowest Months */}
            <div className="insight-card">
              <div className="insight-header">
                <div className="insight-icon orange">📉</div>
                <div className="insight-title-text">
                  <h2>Slowest Months</h2>
                  <p>Lower demand periods to avoid overstocking</p>
                </div>
              </div>

              <div className="month-grid">
                <div className="month-card orange">
                  <div className="month-header">
                    <span className="month-icon">📅</span>
                    <h3>January</h3>
                  </div>
                  <p>Post-holiday slowdown as consumers recover from holiday spending.</p>
                </div>
                <div className="month-card orange">
                  <div className="month-header">
                    <span className="month-icon">📅</span>
                    <h3>July</h3>
                  </div>
                  <p>Mid-summer period with reduced clothing purchases.</p>
                </div>
                <div className="month-card orange">
                  <div className="month-header">
                    <span className="month-icon">📅</span>
                    <h3>February</h3>
                  </div>
                  <p>Between-season period with lower overall demand for new clothing.</p>
                </div>
              </div>

              <div className="action-box orange">
                <p><strong>Action:</strong> Reduce order quantities during these months to minimize excess inventory and potential markdowns.</p>
              </div>
            </div>

            {/* Waste Reduction */}
            <div className="insight-card">
              <div className="insight-header">
                <div className="insight-icon emerald">🌿</div>
                <div className="insight-title-text">
                  <h2>How This Helps Reduce Waste</h2>
                  <p>Making sustainable, data-driven decisions</p>
                </div>
              </div>

              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-content">
                    <span className="benefit-icon">💡</span>
                    <div>
                      <h3>Reduce Overstocking</h3>
                      <p>Order appropriate inventory levels for low-demand months</p>
                    </div>
                  </div>
                </div>
                <div className="benefit-card">
                  <div className="benefit-content">
                    <span className="benefit-icon">💡</span>
                    <div>
                      <h3>Optimize Stock Levels</h3>
                      <p>Increase inventory ahead of peak seasons to meet demand</p>
                    </div>
                  </div>
                </div>
                <div className="benefit-card">
                  <div className="benefit-content">
                    <span className="benefit-icon">💡</span>
                    <div>
                      <h3>Lower Markdowns</h3>
                      <p>Minimize excess inventory that requires discounting</p>
                    </div>
                  </div>
                </div>
                <div className="benefit-card">
                  <div className="benefit-content">
                    <span className="benefit-icon">💡</span>
                    <div>
                      <h3>Smarter Restocking</h3>
                      <p>Make data-driven decisions on when to replenish each category</p>
                    </div>
                  </div>
                </div>
                <div className="benefit-card">
                  <div className="benefit-content">
                    <span className="benefit-icon">💡</span>
                    <div>
                      <h3>Sustainability</h3>
                      <p>Reduce waste from unsold inventory and improve resource efficiency</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bottom-line">
                <h3>Bottom Line</h3>
                <p>
                  By aligning inventory orders with predicted demand, stores can significantly reduce waste, 
                  improve profitability, and operate more sustainably. Better forecasting means buying what 
                  you'll actually sell, reducing markdowns, and minimizing environmental impact.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}