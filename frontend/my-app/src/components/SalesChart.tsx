import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { SalesDataPoint } from '../data/mockData';

interface SalesChartProps {
  data: SalesDataPoint[];
  category: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data, category }) => {
  // Filter data by category
  const filteredData = data.filter(d => d.category === category);

  // We need to merge historical and predicted into a single array for the chart
  // But we want them as separate lines/areas to style them differently.
  
  // Actually, keeping them as separate entries in the array is fine if we transform them.
  // Recharts expects an array of objects where each object represents a point on the X axis.
  // We should group by date.
  
  const chartData = filteredData.reduce((acc, curr) => {
    const existing = acc.find(item => item.date === curr.date);
    if (existing) {
      if (curr.historical !== null) existing.historical = curr.historical;
      if (curr.predicted !== null) existing.predicted = curr.predicted;
    } else {
      acc.push({
        date: curr.date,
        historical: curr.historical,
        predicted: curr.predicted
      });
    }
    return acc;
  }, [] as any[]);

  // Find the index where prediction starts to add a reference line
  const predictionStartIndex = chartData.findIndex(d => d.predicted !== null && d.historical === null);

  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">12-Month Forecast: {category}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0071DC" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#0071DC" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            tick={{fontSize: 12, fill: '#6B7280'}} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{fontSize: 12, fill: '#6B7280'}} 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Sales']}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Area 
            type="monotone" 
            dataKey="historical" 
            name="Historical Sales" 
            stroke="#0071DC" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorHistorical)" 
            connectNulls
          />
          <Area 
            type="monotone" 
            dataKey="predicted" 
            name="Predicted Sales" 
            stroke="#4CAF50" 
            strokeDasharray="5 5"
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPredicted)" 
            connectNulls
          />
          
          {predictionStartIndex > 0 && (
             <ReferenceLine x={chartData[predictionStartIndex]?.date} stroke="#9CA3AF" strokeDasharray="3 3" label={{ position: 'top', value: 'Forecast Start', fill: '#6B7280', fontSize: 12 }} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
