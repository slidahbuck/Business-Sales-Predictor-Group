import { addMonths, format, subMonths } from 'date-fns';

export type SalesDataPoint = {
  date: string;
  historical: number | null;
  predicted: number | null;
  category: 'Women' | 'Men' | 'Other' | 'Total';
};

export type KPIData = {
  predictedSalesNextMonth: number;
  inventoryRisk: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
};

// Generate 24 months of data: 12 months historical, 12 months predicted
const generateSalesData = () => {
  const data: SalesDataPoint[] = [];
  const today = new Date();
  const categories = ['Women', 'Men', 'Other'] as const;

  // Base values for categories
  const baseValues = {
    Women: 150000,
    Men: 120000,
    Other: 80000,
  };

  // Seasonality factors (simple approximation)
  const getSeasonality = (monthIndex: number) => {
    // 0 = Jan, 11 = Dec
    if (monthIndex === 11) return 1.5; // Christmas
    if (monthIndex === 10) return 1.3; // Thanksgiving/Black Friday
    if (monthIndex === 0) return 0.8; // Post-holiday slump
    if (monthIndex === 6) return 1.1; // Summer
    return 1.0;
  };

  for (let i = -11; i <= 12; i++) {
    const date = addMonths(today, i);
    const monthIndex = date.getMonth();
    const seasonality = getSeasonality(monthIndex);
    const dateStr = format(date, 'MMM yyyy');

    categories.forEach(cat => {
      const base = baseValues[cat];
      // Add some random noise
      const noise = (Math.random() - 0.5) * 10000;
      const value = Math.round((base * seasonality) + noise);
      
      const isHistorical = i < 0; // Past months
      const isCurrent = i === 0;  // Current month transition
      
      if (i < 0) {
        data.push({
          date: dateStr,
          historical: value,
          predicted: null,
          category: cat,
        });
      } else {
        data.push({
          date: dateStr,
          historical: null, // No historical for future
          predicted: value, // "Predicted" might vary slightly from "Actual" to show model logic
          category: cat,
        });
      }
    });
  }
  return data;
};

export const salesData = generateSalesData();

export const kpiData: KPIData = {
  predictedSalesNextMonth: 485000,
  inventoryRisk: 'Low',
  lastUpdated: format(new Date(), 'MMM dd, yyyy'),
};
