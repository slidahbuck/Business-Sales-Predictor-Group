import React from 'react';
import { SalesDataPoint } from '../data/mockData';

interface ForecastTableProps {
  data: SalesDataPoint[];
  category: string;
}

export const ForecastTable: React.FC<ForecastTableProps> = ({ data, category }) => {
  // Filter for predicted data only and for the selected category
  const predictedData = data.filter(d => d.category === category && d.predicted !== null);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">Monthly Predictions Data</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Predicted Sales
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                YoY Change
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confidence
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {predictedData.map((row, idx) => {
               // Mock YoY change for demo
               const yoy = ((Math.random() * 10) - 2).toFixed(1);
               const isPositive = Number(yoy) > 0;
               
               return (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    ${row.predicted?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {isPositive ? '+' : ''}{yoy}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px] mx-auto">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${85 + Math.random() * 10}%` }}></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
