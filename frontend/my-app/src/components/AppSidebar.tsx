import React from 'react';
import { 
  LayoutDashboard, 
  BarChart2, 
  ShoppingBag
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const AppSidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate }) => {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
             <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">SupplyAI</h1>
            <p className="text-xs text-slate-400">Inventory Intelligence</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2 mt-4">Overview</div>
        
        <button 
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors border-l-4 ${
            activeTab === 'dashboard' 
              ? 'bg-blue-700/50 text-white border-blue-500' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white border-transparent'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium text-sm">Dashboard</span>
        </button>

        <button 
          onClick={() => onNavigate('forecasts')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors border-l-4 ${
            activeTab === 'forecasts' 
              ? 'bg-blue-700/50 text-white border-blue-500' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white border-transparent'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="font-medium text-sm">Forecasts</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                JD
            </div>
            <div>
                <p className="text-sm font-medium text-white">Jane Doe</p>
                <p className="text-xs text-slate-400">Store Mgr #4291</p>
            </div>
        </div>
      </div>
    </div>
  );
};
