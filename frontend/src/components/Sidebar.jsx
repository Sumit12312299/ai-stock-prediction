import React from 'react';
import { 
  LayoutDashboard, 
  LineChart, 
  Briefcase, 
  Bookmark, 
  MessageSquare, 
  LogOut, 
  TrendingUp 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, username }) {
  const menuItems = [
    { id: 'overview', name: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'analysis', name: 'Stock AI Forecaster', icon: LineChart },
    { id: 'portfolio', name: 'Portfolio Ledger', icon: Briefcase },
    { id: 'watchlist', name: 'Saved Watchlist', icon: Bookmark },
    { id: 'chatbot', name: 'AI Investment Chat', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-400 flex flex-col justify-between border-r border-slate-800 shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/60 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base tracking-tight leading-none">Antigravity AI</h2>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1 block">Stock Suite</span>
          </div>
        </div>

        {/* Navigation Routes List */}
        <nav className="p-4 space-y-1.5 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/15' 
                    : 'hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span>{item.name}</span>
                
                {/* Active Indicator bar */}
                {isActive && (
                  <div className="absolute right-0 top-1/3 bottom-1/3 w-1 bg-white rounded-l-full"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile and Log Out */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/30 rounded-xl mb-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/25 flex items-center justify-center font-bold text-emerald-400 text-sm border border-emerald-500/30">
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-400 leading-tight">Welcome,</p>
            <p className="text-sm font-bold text-slate-200 truncate leading-normal">{username || 'Trader'}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 font-semibold text-sm transition-colors group"
        >
          <LogOut className="h-5 w-5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
}
