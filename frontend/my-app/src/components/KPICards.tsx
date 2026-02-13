import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, DollarSign, ShoppingCart } from 'lucide-react';
import { KPIData } from '../data/mockData';

interface KPICardsProps {
  data: KPIData;
}

export const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Predicted Sales Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-600 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Predicted Sales (Next Month)</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ${(data.predictedSalesNextMonth / 1000).toFixed(1)}k
            </p>
          </div>
          <div className="p-2 bg-blue-50 rounded-full">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="flex items-center text-sm">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-green-600 font-medium">+4.2%</span>
          <span className="text-gray-400 ml-2">vs last month</span>
        </div>
      </div>

      {/* Forecast Accuracy Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-600 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Model Accuracy</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              96.8%
            </p>
          </div>
          <div className="p-2 bg-purple-50 rounded-full">
            <CheckCircle className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-gray-500">
            Based on <span className="font-semibold text-gray-800">24 months</span> of validation data
          </span>
        </div>
      </div>

      {/* Purchasing Recommendation Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-emerald-500 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Purchasing Advice</h3>
            <p className="text-lg font-bold text-emerald-700 mt-2">
              Encouraged to Buy More
            </p>
          </div>
          <div className="p-2 bg-emerald-50 rounded-full">
            <ShoppingCart className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-gray-500">
            Sales volume trending <span className="font-semibold text-gray-800">High</span> for upcoming season
          </span>
        </div>
      </div>
    </div>
  );
};
