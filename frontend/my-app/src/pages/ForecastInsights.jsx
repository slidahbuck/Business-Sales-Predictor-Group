// import React from 'react';
// import { TrendingUp, TrendingDown, Target, Lightbulb, Calendar, Leaf } from 'lucide-react';
// import { insights } from '../data/salesData';

// export function ForecastInsights() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="ml-64 p-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Forecast Insights</h1>
//           <p className="text-gray-600">Understand the predictions and make smarter ordering decisions</p>
//         </div>

//         {/* How the Forecast Was Built */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex items-start gap-3 mb-4">
//             <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
//               <Target className="w-5 h-5 text-blue-600" />
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900">{insights.howItWorks.title}</h2>
//               <p className="text-sm text-gray-500 mt-1">The foundation of accurate predictions</p>
//             </div>
//           </div>
          
//           <div className="space-y-3 mt-6">
//             {insights.howItWorks.points.map((point, index) => (
//               <div key={index} className="flex items-start gap-3">
//                 <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//                   <span className="text-blue-600 text-sm font-semibold">{index + 1}</span>
//                 </div>
//                 <p className="text-gray-700">{point}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Busiest Months */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex items-start gap-3 mb-4">
//             <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
//               <TrendingUp className="w-5 h-5 text-green-600" />
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900">Busiest Months</h2>
//               <p className="text-sm text-gray-500 mt-1">Peak demand periods requiring increased inventory</p>
//             </div>
//           </div>

//           <div className="grid gap-4 mt-6">
//             {insights.busiestMonths.map((item, index) => (
//               <div key={index} className="border border-green-200 bg-green-50 rounded-lg p-4">
//                 <div className="flex items-center gap-2 mb-2">
//                   <Calendar className="w-4 h-4 text-green-600" />
//                   <h3 className="font-semibold text-green-900">{item.month}</h3>
//                 </div>
//                 <p className="text-green-800 text-sm">{item.reason}</p>
//               </div>
//             ))}
//           </div>

//           <div className="mt-6 bg-green-100 border border-green-300 rounded-lg p-4">
//             <p className="text-sm text-green-900">
//               <strong>Action:</strong> Increase stock levels 2-3 weeks before these months to ensure adequate inventory for peak demand.
//             </p>
//           </div>
//         </div>

//         {/* Slowest Months */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex items-start gap-3 mb-4">
//             <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
//               <TrendingDown className="w-5 h-5 text-orange-600" />
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900">Slowest Months</h2>
//               <p className="text-sm text-gray-500 mt-1">Lower demand periods to avoid overstocking</p>
//             </div>
//           </div>

//           <div className="grid gap-4 mt-6">
//             {insights.slowestMonths.map((item, index) => (
//               <div key={index} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
//                 <div className="flex items-center gap-2 mb-2">
//                   <Calendar className="w-4 h-4 text-orange-600" />
//                   <h3 className="font-semibold text-orange-900">{item.month}</h3>
//                 </div>
//                 <p className="text-orange-800 text-sm">{item.reason}</p>
//               </div>
//             ))}
//           </div>

//           <div className="mt-6 bg-orange-100 border border-orange-300 rounded-lg p-4">
//             <p className="text-sm text-orange-900">
//               <strong>Action:</strong> Reduce order quantities during these months to minimize excess inventory and potential markdowns.
//             </p>
//           </div>
//         </div>

//         {/* How This Helps Reduce Waste */}
//         <div className="bg-white rounded-lg shadow-sm p-6">
//           <div className="flex items-start gap-3 mb-4">
//             <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
//               <Leaf className="w-5 h-5 text-emerald-600" />
//             </div>
//             <div>
//               <h2 className="text-xl font-semibold text-gray-900">{insights.wasteReduction.title}</h2>
//               <p className="text-sm text-gray-500 mt-1">Making sustainable, data-driven decisions</p>
//             </div>
//           </div>

//           <div className="grid md:grid-cols-2 gap-4 mt-6">
//             {insights.wasteReduction.benefits.map((benefit, index) => {
//               const [title, description] = benefit.split(': ');
//               return (
//                 <div key={index} className="border border-emerald-200 bg-emerald-50 rounded-lg p-4">
//                   <div className="flex items-start gap-3">
//                     <Lightbulb className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <h3 className="font-semibold text-emerald-900 mb-1">{title}</h3>
//                       <p className="text-emerald-800 text-sm">{description}</p>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           <div className="mt-6 bg-emerald-100 border-2 border-emerald-400 rounded-lg p-5">
//             <h3 className="font-semibold text-emerald-900 mb-2">Bottom Line</h3>
//             <p className="text-emerald-900">
//               By aligning inventory orders with predicted demand, stores can significantly reduce waste, 
//               improve profitability, and operate more sustainably. Better forecasting means buying what 
//               you'll actually sell, reducing markdowns, and minimizing environmental impact.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
export const ForecastInsights = () => {
  return <div>Here are your Forecast Insights!</div>;
};