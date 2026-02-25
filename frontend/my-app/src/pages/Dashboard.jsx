// import React, { useState } from 'react';
// import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
// import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
// import { monthlyForecastData, getCategoryBreakdown } from '../data/salesData';

// export function Dashboard() {
//   const [selectedCategory, setSelectedCategory] = useState('Women\'s Clothing');
//   const [selectedMonth, setSelectedMonth] = useState(null);

//   const currentData = monthlyForecastData[selectedCategory];
  
//   const categories = ['Women\'s Clothing', 'Men\'s Clothing', 'Other Clothing'];

//   const getActionColor = (action) => {
//     switch (action) {
//       case 'increase': return 'text-green-700 bg-green-50';
//       case 'reduce': return 'text-red-700 bg-red-50';
//       default: return 'text-yellow-700 bg-yellow-50';
//     }
//   };

//   const getActionText = (action) => {
//     switch (action) {
//       case 'increase': return 'Increase Stock';
//       case 'reduce': return 'Reduce Stock';
//       default: return 'Maintain';
//     }
//   };

//   const getActionIcon = (yoy) => {
//     if (yoy > 5) return <TrendingUp className="w-4 h-4 text-green-600" />;
//     if (yoy < -2) return <TrendingDown className="w-4 h-4 text-red-600" />;
//     return <Minus className="w-4 h-4 text-yellow-600" />;
//   };

//   const handleBarClick = (data, index) => {
//     setSelectedMonth(index);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="ml-64 p-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Forecast Dashboard</h1>
//           <p className="text-gray-600">Predict demand and optimize inventory to reduce waste</p>
//         </div>

//         {/* Category Selector */}
//         <div className="mb-6">
//           <div className="bg-white rounded-lg p-1 inline-flex shadow-sm">
//             {categories.map((category) => (
//               <button
//                 key={category}
//                 onClick={() => {
//                   setSelectedCategory(category);
//                   setSelectedMonth(null);
//                 }}
//                 className={`px-6 py-3 rounded-md font-medium transition-all ${
//                   selectedCategory === category
//                     ? 'bg-blue-600 text-white shadow-sm'
//                     : 'text-gray-700 hover:text-gray-900'
//                 }`}
//               >
//                 {category}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Monthly Sales Forecast Chart */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Sales Forecast</h2>
//           <p className="text-sm text-gray-500 mb-6">Click on a month to see category breakdown</p>
          
//           <ResponsiveContainer width="100%" height={350}>
//             <BarChart data={currentData} onClick={handleBarClick}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//               <XAxis dataKey="month" stroke="#6b7280" />
//               <YAxis stroke="#6b7280" label={{ value: 'Sales ($K)', angle: -90, position: 'insideLeft' }} />
//               <Tooltip 
//                 contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
//                 formatter={(value) => [`$${value}K`, 'Predicted Sales']}
//               />
//               <Bar dataKey="predicted" radius={[8, 8, 0, 0]} cursor="pointer">
//                 {currentData.map((entry, index) => (
//                   <Cell 
//                     key={`cell-${index}`} 
//                     fill={selectedMonth === index ? '#2563eb' : '#60a5fa'} 
//                   />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>

//           {/* Highlight Peak and Low Months */}
//           <div className="mt-6 flex gap-4">
//             <div className="flex-1 bg-green-50 rounded-lg p-4 border border-green-200">
//               <p className="text-xs font-medium text-green-700 mb-1">HIGHEST SALES</p>
//               <p className="text-2xl font-bold text-green-900">
//                 {currentData.reduce((max, item) => item.predicted > max.predicted ? item : max).month}
//               </p>
//               <p className="text-sm text-green-700 mt-1">
//                 ${currentData.reduce((max, item) => item.predicted > max.predicted ? item : max).predicted}K predicted
//               </p>
//             </div>
//             <div className="flex-1 bg-orange-50 rounded-lg p-4 border border-orange-200">
//               <p className="text-xs font-medium text-orange-700 mb-1">LOWEST SALES</p>
//               <p className="text-2xl font-bold text-orange-900">
//                 {currentData.reduce((min, item) => item.predicted < min.predicted ? item : min).month}
//               </p>
//               <p className="text-sm text-orange-700 mt-1">
//                 ${currentData.reduce((min, item) => item.predicted < min.predicted ? item : min).predicted}K predicted
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Category Breakdown (when month is selected) */}
//         {selectedMonth !== null && (
//           <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4">
//               {currentData[selectedMonth].month} - Category Breakdown
//             </h2>
            
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={getCategoryBreakdown(selectedMonth)} layout="vertical">
//                 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
//                 <XAxis type="number" stroke="#6b7280" label={{ value: 'Sales ($K)', position: 'insideBottom', offset: -5 }} />
//                 <YAxis type="category" dataKey="category" stroke="#6b7280" width={150} />
//                 <Tooltip 
//                   contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
//                   formatter={(value) => [`$${value}K`, 'Predicted Sales']}
//                 />
//                 <Bar dataKey="sales" fill="#3b82f6" radius={[0, 8, 8, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         )}

//         {/* Monthly Prediction Data Table */}
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Prediction Data</h2>
          
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200">
//                   <th className="text-left py-3 px-4 font-semibold text-gray-900">Month</th>
//                   <th className="text-left py-3 px-4 font-semibold text-gray-900">Predicted Sales</th>
//                   <th className="text-left py-3 px-4 font-semibold text-gray-900">YoY Change</th>
//                   <th className="text-left py-3 px-4 font-semibold text-gray-900">Replenishment Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentData.map((row, index) => (
//                   <tr 
//                     key={row.month} 
//                     className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
//                       selectedMonth === index ? 'bg-blue-50' : ''
//                     }`}
//                   >
//                     <td className="py-3 px-4 font-medium text-gray-900">{row.month}</td>
//                     <td className="py-3 px-4 text-gray-700">${row.predicted}K</td>
//                     <td className="py-3 px-4">
//                       <div className="flex items-center gap-2">
//                         {getActionIcon(row.yoy)}
//                         <span className={row.yoy > 0 ? 'text-green-700' : row.yoy < 0 ? 'text-red-700' : 'text-gray-700'}>
//                           {row.yoy > 0 ? '+' : ''}{row.yoy}%
//                         </span>
//                       </div>
//                     </td>
//                     <td className="py-3 px-4">
//                       <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getActionColor(row.action)}`}>
//                         {getActionText(row.action)}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
export const Dashboard = () => {
  return <div>Welcome to the Dashboard!</div>;
};  