import React from 'react';
import { CloudRain, Calendar, TrendingUp, Info } from 'lucide-react';

export const InsightsPanel: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <div className="flex items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mr-2">Model Insights</h3>
        <Info className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="space-y-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 p-2 bg-purple-50 rounded-lg mt-1">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-bold text-gray-900">Holiday Effects Detected</h4>
            <p className="text-sm text-gray-600 mt-1">
              The model anticipates a <span className="font-semibold text-purple-600">30% surge</span> leading up to Thanksgiving based on historical retail patterns.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 p-2 bg-orange-50 rounded-lg mt-1">
            <CloudRain className="w-5 h-5 text-orange-600" />
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-bold text-gray-900">Seasonal Adjustment</h4>
            <p className="text-sm text-gray-600 mt-1">
              Transition to cooler weather adjusted forecasts for Men's Outerwear by <span className="font-semibold text-orange-600">+15%</span> compared to last month.
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg mt-1">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <h4 className="text-sm font-bold text-gray-900">Macro-Economic Factors</h4>
            <p className="text-sm text-gray-600 mt-1">
              Current CPI data suggests consumer spending will remain stable. No negative weighting applied for this period.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Model Features Importance</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Past Sales (Lagged)</span>
              <span className="font-medium text-gray-900">45%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Holidays & Events</span>
              <span className="font-medium text-gray-900">30%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Economic Indicators</span>
              <span className="font-medium text-gray-900">15%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
