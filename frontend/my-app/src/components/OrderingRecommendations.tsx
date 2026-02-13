import React from 'react';
import { SalesDataPoint } from '../data/mockData';
import { ShoppingCart, MinusCircle, AlertCircle } from 'lucide-react';

interface OrderingRecommendationsProps {
  data: SalesDataPoint[];
  category: string;
}

export const OrderingRecommendations: React.FC<OrderingRecommendationsProps> = ({ data, category }) => {
  // Filter for future predicted data only
  const predictedData = data.filter(d => d.predicted !== null && d.category === category);
  
  if (predictedData.length === 0) return null;

  // Calculate average
  const totalPredicted = predictedData.reduce((sum, item) => sum + (item.predicted || 0), 0);
  const averagePredicted = totalPredicted / predictedData.length;
  
  // Threshold for "Buy More" (e.g., 10% above average)
  const threshold = averagePredicted * 1.10;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Monthly Ordering Recommendations</h3>
        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
           {category} Category
        </span>
      </div>
      
      <div className="divide-y divide-gray-100">
        {predictedData.slice(0, 6).map((item, index) => {
          const isHighDemand = (item.predicted || 0) > threshold;
          const percentageDiff = (( (item.predicted || 0) - averagePredicted) / averagePredicted) * 100;
          
          return (
            <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-bold text-gray-900">{item.date}</p>
                <p className="text-xs text-gray-500 mt-0.5">Forecast: ${(item.predicted || 0).toLocaleString()}</p>
              </div>
              
              <div className="flex items-center">
                {isHighDemand ? (
                  <div className="flex items-center text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    <span className="text-sm font-bold">Encouraged to Buy More</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                    <MinusCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Standard Replenishment</span>
                  </div>
                )}
              </div>
              
              <div className="text-right w-24">
                 <span className={`text-xs font-bold ${percentageDiff > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {percentageDiff > 0 ? '+' : ''}{percentageDiff.toFixed(1)}%
                 </span>
                 <p className="text-[10px] text-gray-400">vs avg</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <div className="flex items-start gap-2 text-xs text-gray-500">
            <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5" />
            <p>Recommendations are based on deviation from the 12-month rolling average forecast. Peaks greater than 10% trigger bulk buy suggestions.</p>
        </div>
      </div>
    </div>
  );
};
