import { useState } from 'react';
import './App.css';


// Historical quarterly GDP data for accurate YoY comparisons
const GDP_LOOKUP = {
 '2009-1': 14430.902, '2009-2': 14381.236, '2009-3': 14448.882, '2009-4': 14651.249,
 '2010-1': 14764.610, '2010-2': 14980.193, '2010-3': 15141.607, '2010-4': 15309.474,
 '2011-1': 15351.448, '2011-2': 15557.539, '2011-3': 15647.680, '2011-4': 15842.259,
 '2012-1': 16068.805, '2012-2': 16207.115, '2012-3': 16319.541, '2012-4': 16420.419,
 '2013-1': 16648.189, '2013-2': 16728.687, '2013-3': 16953.838, '2013-4': 17192.019,
 '2014-1': 17197.738, '2014-2': 17518.508, '2014-3': 17804.228, '2014-4': 17912.079,
 '2015-1': 18063.529, '2015-2': 18279.784, '2015-3': 18401.626, '2015-4': 18435.137,
 '2016-1': 18525.933, '2016-2': 18711.702, '2016-3': 18892.639, '2016-4': 19089.379,
 '2017-1': 19280.084, '2017-2': 19438.643, '2017-3': 19692.595, '2017-4': 20037.088,
 '2018-1': 20328.553, '2018-2': 20580.912, '2018-3': 20798.730, '2018-4': 20917.867,
 '2019-1': 21111.600, '2019-2': 21397.938, '2019-3': 21717.171, '2019-4': 21933.217,
 '2020-1': 21751.238, '2020-2': 19958.291, '2020-3': 21704.437, '2020-4': 22087.160,
 '2021-1': 22680.693, '2021-2': 23425.910, '2021-3': 23982.379, '2021-4': 24813.600,
 '2022-1': 25250.347, '2022-2': 25861.292, '2022-3': 26336.304, '2022-4': 26770.514,
 '2023-1': 27216.445, '2023-2': 27530.055, '2023-3': 28074.846, '2023-4': 28424.722,
 '2024-1': 28708.161, '2024-2': 29147.044, '2024-3': 29511.664, '2024-4': 29825.182,
 '2025-1': 30042.113, '2025-2': 30485.729, '2025-3': 31098.027, '2025-4': 31442.483,
};


// Default placeholder data shown before any prediction is made
const defaultForecastData = {
 "Women's Clothing": [
   { quarter: 'Q1', predicted: 0, yoy: 0, action: 'maintain' },
   { quarter: 'Q2', predicted: 0, yoy: 0, action: 'maintain' },
   { quarter: 'Q3', predicted: 0, yoy: 0, action: 'maintain' },
   { quarter: 'Q4', predicted: 0, yoy: 0, action: 'maintain' }
 ],
 "Men's Clothing": [
   { quarter: 'Q1', predicted: 0, yoy: 0, action: 'maintain' },
   { quarter: 'Q2', predicted: 0, yoy: 0, action: 'maintain' },
   { quarter: 'Q3', predicted: 0, yoy: 0, action: 'maintain' },
   { quarter: 'Q4', predicted: 0, yoy: 0, action: 'maintain' }
 ],
 "Other Clothing": [
   { quarter: 'Q1', predicted: 0, yoy: 0, action: 'maintain' },
   { quarter: 'Q2', predicted: 0, yoy: 0, action: 'maintain' },
   { quarter: 'Q3', predicted: 0, yoy: 0, action: 'maintain' },
   { quarter: 'Q4', predicted: 0, yoy: 0, action: 'maintain' }
 ]
};


export default function App() {
 const [currentPage, setCurrentPage] = useState('dashboard');
 const [selectedCategory, setSelectedCategory] = useState("Women's Clothing");
 const [selectedQuarter, setSelectedQuarter] = useState(null);
 const [predictionQuarter, setPredictionQuarter] = useState('');
 const [predictionYear, setPredictionYear] = useState('');
 const [predictionGdp, setPredictionGdp] = useState('');
 const [weatherInputs, setWeatherInputs] = useState({
   rainy_days: '', snowy_days: '', foggy_days: '',
 });
 const [predictionResults, setPredictionResults] = useState(null);
 const [forecastData, setForecastData] = useState(null);
 const [forecastYear, setForecastYear] = useState(null);


 const updateWeather = (field, value) => {
   setWeatherInputs(prev => ({ ...prev, [field]: value }));
 };


 const categories = ["Women's Clothing", "Men's Clothing", "Other Clothing"];
 const displayData = forecastData || defaultForecastData;
 const currentData = displayData[selectedCategory];


 const maxValue = Math.max(...currentData.map(d => d.predicted), 1);
 const highestQuarter = currentData.reduce((max, item) => item.predicted > max.predicted ? item : max);
 const lowestQuarter = currentData.reduce((min, item) => item.predicted < min.predicted ? item : min);


 const quarters = [1, 2, 3, 4];
 const quarterLabels = { 1: 'Q1 (Jan-Mar)', 2: 'Q2 (Apr-Jun)', 3: 'Q3 (Jul-Sep)', 4: 'Q4 (Oct-Dec)' };


 const fetchPrediction = async () => {
   try {
     const weatherParams = Object.entries(weatherInputs)
       .filter(([, v]) => v !== '')
       .map(([k, v]) => `${k}=${v}`)
       .join('&');


     const buildUrl = (year, quarter, gdp) => {
       let url = `http://localhost:4000/api/walmart/predict?year=${year}&quarter=${quarter}&gdp=${gdp}`;
       if (weatherParams) url += '&' + weatherParams;
       return url;
     };


     const year = parseInt(predictionYear);
     const prevYear = year - 1;


     // Fetch all 4 quarters for selected year + previous year (for YoY)
     // Use user-provided GDP for current year, historical GDP for previous year
     const fetches = [];
     for (let q = 1; q <= 4; q++) {
       fetches.push(fetch(buildUrl(year, q, predictionGdp)).then(r => r.json()));
       const prevGdp = GDP_LOOKUP[`${prevYear}-${q}`] || predictionGdp;
       fetches.push(fetch(buildUrl(prevYear, q, prevGdp)).then(r => r.json()));
     }
     const results = await Promise.all(fetches);


     // Build forecast data from real predictions
     const categoryMap = {
       "Women's Clothing": "WomenClothing",
       "Men's Clothing": "MenClothing",
       "Other Clothing": "OtherClothing",
     };


     const newForecastData = {};
     for (const [displayName, apiName] of Object.entries(categoryMap)) {
       newForecastData[displayName] = [];
       for (let q = 0; q < 4; q++) {
         const current = results[q * 2][apiName];
         const prev = results[q * 2 + 1][apiName];
         const yoy = prev !== 0 ? ((current - prev) / prev) * 100 : 0;
         const action = yoy > 5 ? 'increase' : yoy < -2 ? 'reduce' : 'maintain';
         newForecastData[displayName].push({
           quarter: `Q${q + 1}`,
           predicted: Math.round(current * 100) / 100,
           yoy: Math.round(yoy * 10) / 10,
           action,
         });
       }
     }


     setForecastData(newForecastData);
     setForecastYear(year);


     // Also set the single prediction result for the selected quarter
     const selectedQ = parseInt(predictionQuarter);
     const selectedResult = results[(selectedQ - 1) * 2];
     if (selectedResult.success) {
       const total = Math.round((selectedResult.WomenClothing + selectedResult.MenClothing + selectedResult.OtherClothing) * 100) / 100;
       setPredictionResults({
         quarter: predictionQuarter,
         year: predictionYear,
         total,
         categories: [
           { name: "Women's Clothing", sales: selectedResult.WomenClothing, yoy: newForecastData["Women's Clothing"][selectedQ - 1].yoy, action: newForecastData["Women's Clothing"][selectedQ - 1].action },
           { name: "Men's Clothing", sales: selectedResult.MenClothing, yoy: newForecastData["Men's Clothing"][selectedQ - 1].yoy, action: newForecastData["Men's Clothing"][selectedQ - 1].action },
           { name: "Other Clothing", sales: selectedResult.OtherClothing, yoy: newForecastData["Other Clothing"][selectedQ - 1].yoy, action: newForecastData["Other Clothing"][selectedQ - 1].action },
         ]
       });
     }
   } catch (err) {
     console.error(err);
   }
 };


 const getCategoryBreakdown = (quarterIndex) => {
   return [
     { category: "Women's Clothing", sales: displayData["Women's Clothing"][quarterIndex].predicted },
     { category: "Men's Clothing", sales: displayData["Men's Clothing"][quarterIndex].predicted },
     { category: "Other Clothing", sales: displayData["Other Clothing"][quarterIndex].predicted }
   ];
 };


 const getActionText = (action) => {
   switch (action) {
     case 'increase': return 'Increase Stock';
     case 'reduce': return 'Reduce Stock';
     default: return 'Maintain';
   }
 };


 const getYoyIcon = (yoy) => {
   if (yoy > 5) return '↗';
   if (yoy < -2) return '↘';
   return '→';
 };


 const getYoyClass = (yoy) => {
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


           {/* Prediction Section */}
           <div className="prediction-section">
             <div className="prediction-form">
               <div className="form-row">
                 <div className="form-group">
                   <label>Select Quarter</label>
                   <select
                     className="input-field"
                     value={predictionQuarter}
                     onChange={(e) => setPredictionQuarter(e.target.value)}
                   >
                     <option value="">Choose a quarter...</option>
                     {quarters.map(q => (
                       <option key={q} value={q}>{quarterLabels[q]}</option>
                     ))}
                   </select>
                 </div>


                 <div className="form-group">
                   <label>Year</label>
                   <input
                     type="number"
                     className="input-field"
                     placeholder="e.g., 2026"
                     value={predictionYear}
                     onChange={(e) => setPredictionYear(e.target.value)}
                     min="2009"
                     max="2030"
                   />
                 </div>


                 <div className="form-group">
                   <label>Quarterly GDP ($M)</label>
                   <input
                     type="number"
                     className="input-field"
                     placeholder="e.g., 30000"
                     value={predictionGdp}
                     onChange={(e) => setPredictionGdp(e.target.value)}
                   />
                 </div>
               </div>


               <div className="form-section-label">Weather Conditions (optional)</div>
               <div className="form-row">
                 <div className="form-group small">
                   <label>Rainy Days</label>
                   <input type="number" className="input-field" placeholder="20"
                     value={weatherInputs.rainy_days} onChange={(e) => updateWeather('rainy_days', e.target.value)} />
                 </div>
                 <div className="form-group small">
                   <label>Snowy Days</label>
                   <input type="number" className="input-field" placeholder="0"
                     value={weatherInputs.snowy_days} onChange={(e) => updateWeather('snowy_days', e.target.value)} />
                 </div>
                 <div className="form-group small">
                   <label>Foggy Days</label>
                   <input type="number" className="input-field" placeholder="5"
                     value={weatherInputs.foggy_days} onChange={(e) => updateWeather('foggy_days', e.target.value)} />
                 </div>
               </div>


               <button
                 className="predict-button"
                 onClick={fetchPrediction}
                 disabled={!predictionQuarter || !predictionYear || !predictionGdp}
               >
                 Predict Sales
               </button>
             </div>


             {predictionResults && (
               <div className="prediction-results">
                 <div className="prediction-header">
                   <h3>Prediction for Q{predictionResults.quarter} {predictionResults.year}</h3>
                   <button
                     className="close-button"
                     onClick={() => setPredictionResults(null)}
                   >
                     ✕
                   </button>
                 </div>


                 <div className="prediction-summary">
                   <div className="total-prediction">
                     <p className="total-label">Total Predicted Sales</p>
                     <p className="total-value">${predictionResults.total}K</p>
                   </div>
                 </div>


                 <div className="prediction-breakdown">
                   {predictionResults.categories.map((cat) => (
                     <div key={cat.name} className="prediction-item">
                       <div className="prediction-item-header">
                         <span className="category-name">{cat.name}</span>
                         <span className="category-sales">${cat.sales}K</span>
                       </div>
                       {(cat.yoy != null || cat.action) && (
                         <div className="prediction-item-details">
                           {cat.yoy != null && (
                             <div className="yoy-cell">
                               <span className={getYoyClass(cat.yoy)}>{getYoyIcon(cat.yoy)}</span>
                               <span className={getYoyClass(cat.yoy)}>
                                 {cat.yoy > 0 ? '+' : ''}{cat.yoy}% YoY
                               </span>
                             </div>
                           )}
                           {cat.action && (
                             <span className={`action-badge ${cat.action}`}>
                               {getActionText(cat.action)}
                             </span>
                           )}
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}
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
                     setSelectedQuarter(null);
                   }}
                 >
                   {category}
                 </button>
               ))}
             </div>
           </div>


           {/* Chart Card */}
           <div className="card">
             <h2 className="card-title">Quarterly Sales Forecast{forecastYear ? ` — ${forecastYear}` : ''}</h2>
             <p className="card-subtitle">{forecastData ? 'Click on a quarter to see category breakdown' : 'Make a prediction to populate the forecast'}</p>


             <div className="chart">
               <div className="chart-bars">
                 {currentData.map((item, index) => (
                   <div
                     key={item.quarter}
                     className="bar-wrapper"
                     onClick={() => setSelectedQuarter(index)}
                   >
                     <div
                       className={`bar ${selectedQuarter === index ? 'selected' : ''}`}
                       style={{ height: `${(item.predicted / maxValue) * 100}%` }}
                     >
                       <span className="bar-value">${item.predicted}K</span>
                     </div>
                     <span className="bar-label">{item.quarter}</span>
                   </div>
                 ))}
               </div>
             </div>


             <div className="stats-grid">
               <div className="stat-card highest">
                 <p className="stat-label">HIGHEST SALES</p>
                 <p className="stat-value">{highestQuarter.quarter}</p>
                 <p className="stat-detail">${highestQuarter.predicted}K predicted</p>
               </div>
               <div className="stat-card lowest">
                 <p className="stat-label">LOWEST SALES</p>
                 <p className="stat-value">{lowestQuarter.quarter}</p>
                 <p className="stat-detail">${lowestQuarter.predicted}K predicted</p>
               </div>
             </div>
           </div>


           {/* Category Breakdown */}
           {selectedQuarter !== null && (
             <div className="card">
               <h2 className="card-title">
                 {currentData[selectedQuarter].quarter} - Category Breakdown
               </h2>


               <div className="horizontal-chart">
                 {getCategoryBreakdown(selectedQuarter).map((item) => {
                   const maxBreakdownValue = Math.max(...getCategoryBreakdown(selectedQuarter).map(d => d.sales));
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
             <h2 className="card-title">Quarterly Prediction Data{forecastYear ? ` — ${forecastYear}` : ''}</h2>


             <table className="data-table">
               <thead>
                 <tr>
                   <th>Quarter</th>
                   <th>Predicted Sales</th>
                   <th>YoY Change</th>
                   <th>Replenishment Action</th>
                 </tr>
               </thead>
               <tbody>
                 {currentData.map((row, index) => (
                   <tr
                     key={row.quarter}
                     className={selectedQuarter === index ? 'selected' : ''}
                   >
                     <td className="month">{row.quarter}</td>
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
                 <p>Identified seasonal trends and recurring quarterly patterns</p>
               </div>
               <div className="insight-point">
                 <div className="point-number">3</div>
                 <p>Accounted for category-specific demand variations between men's, women's, and other clothing</p>
               </div>
               <div className="insight-point">
                 <div className="point-number">4</div>
                 <p>Applied predictive models to estimate future quarterly sales</p>
               </div>
             </div>
           </div>


           {/* Busiest Quarters */}
           <div className="insight-card">
             <div className="insight-header">
               <div className="insight-icon green">📈</div>
               <div className="insight-title-text">
                 <h2>Busiest Quarters</h2>
                 <p>Peak demand periods requiring increased inventory</p>
               </div>
             </div>


             <div className="month-grid">
               <div className="month-card green">
                 <div className="month-header">
                   <span className="month-icon">📅</span>
                   <h3>Q4 (Oct-Dec)</h3>
                 </div>
                 <p>Black Friday, holiday shopping, and gift purchases drive the highest annual sales across all categories.</p>
               </div>
               <div className="month-card green">
                 <div className="month-header">
                   <span className="month-icon">📅</span>
                   <h3>Q3 (Jul-Sep)</h3>
                 </div>
                 <p>Back-to-school shopping and fall season preparation increase demand.</p>
               </div>
             </div>


             <div className="action-box green">
               <p><strong>Action:</strong> Increase stock levels before these quarters to ensure adequate inventory for peak demand.</p>
             </div>
           </div>


           {/* Slowest Quarters */}
           <div className="insight-card">
             <div className="insight-header">
               <div className="insight-icon orange">📉</div>
               <div className="insight-title-text">
                 <h2>Slowest Quarters</h2>
                 <p>Lower demand periods to avoid overstocking</p>
               </div>
             </div>


             <div className="month-grid">
               <div className="month-card orange">
                 <div className="month-header">
                   <span className="month-icon">📅</span>
                   <h3>Q1 (Jan-Mar)</h3>
                 </div>
                 <p>Post-holiday slowdown as consumers recover from holiday spending.</p>
               </div>
               <div className="month-card orange">
                 <div className="month-header">
                   <span className="month-icon">📅</span>
                   <h3>Q2 (Apr-Jun)</h3>
                 </div>
                 <p>Between-season period with moderate demand before summer picks up.</p>
               </div>
             </div>


             <div className="action-box orange">
               <p><strong>Action:</strong> Reduce order quantities during these quarters to minimize excess inventory and potential markdowns.</p>
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
                     <p>Order appropriate inventory levels for low-demand quarters</p>
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

