import React, { useState } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { KPICards } from './components/KPICards';
import { SalesChart } from './components/SalesChart';
import { ForecastTable } from './components/ForecastTable';
import { InsightsPanel } from './components/InsightsPanel';
import { OrderingRecommendations } from './components/OrderingRecommendations';
import { salesData, kpiData } from './data/mockData';
import { Clock, Download, Share2 } from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<'Women' | 'Men' | 'Other'>('Women');
  const [currentView, setCurrentView] = useState('dashboard');

  const renderDashboard = () => (
    <>
      {/* KPI Section */}
      <section>
        <KPICards data={kpiData} />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Charts & Data (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* Category Filter Tabs */}
          <div className="bg-white p-1 rounded-lg inline-flex shadow-sm border border-gray-200">
            <button 
              onClick={() => setSelectedCategory('Women')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${selectedCategory === 'Women' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Women's Clothing
            </button>
            <button 
              onClick={() => setSelectedCategory('Men')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${selectedCategory === 'Men' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Men's Clothing
            </button>
            <button 
              onClick={() => setSelectedCategory('Other')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${selectedCategory === 'Other' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Other Clothing
            </button>
          </div>

          {/* Sales Chart */}
          <SalesChart data={salesData} category={selectedCategory} />
          
          {/* Data Table */}
          <ForecastTable data={salesData} category={selectedCategory} />
        </div>

        {/* Right Column: Recommendations & Insights (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
           {/* Ordering Recommendations Component */}
          <OrderingRecommendations data={salesData} category={selectedCategory} />
          
          <InsightsPanel />
        </div>
      </div>
    </>
  );

  const renderForecasts = () => (
    <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Detailed Forecast Models</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
             <div className="mb-6 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Comparative Forecast Analysis</h3>
                 <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                    <button 
                    onClick={() => setSelectedCategory('Women')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedCategory === 'Women' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                    Women
                    </button>
                    <button 
                    onClick={() => setSelectedCategory('Men')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedCategory === 'Men' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                    Men
                    </button>
                    <button 
                    onClick={() => setSelectedCategory('Other')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${selectedCategory === 'Other' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                    Other
                    </button>
                </div>
             </div>
             <SalesChart data={salesData} category={selectedCategory} />
        </div>
        
        <div className="grid grid-cols-12 gap-6">
             <div className="col-span-12 lg:col-span-8">
                <ForecastTable data={salesData} category={selectedCategory} />
             </div>
             <div className="col-span-12 lg:col-span-4 space-y-6">
                <OrderingRecommendations data={salesData} category={selectedCategory} />
                <InsightsPanel />
             </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      <AppSidebar activeTab={currentView} onNavigate={setCurrentView} />
      
      <main className="ml-64 flex-1 p-8">
        {/* Header */}
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
                {currentView === 'dashboard' && 'Sales Prediction Dashboard'}
                {currentView === 'forecasts' && 'Forecast Analytics'}
            </h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="w-4 h-4 mr-1.5" />
              <span>Last updated: {kpiData.lastUpdated}</span>
              <span className="mx-2">•</span>
              <span>Model v2.4 (XGBoost)</span>
            </div>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
               <Share2 className="w-4 h-4" />
               Share Report
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
               <Download className="w-4 h-4" />
               Export Data
             </button>
          </div>
        </header>

        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'forecasts' && renderForecasts()}
        
      </main>
    </div>
  );
}
