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
    <aside className="w-64 bg-slate-950/60 backdrop-blur-2xl text-slate-400 flex flex-col justify-between border-r border-white/5 shrink-0 h-screen sticky top-0 z-20">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl border border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)] animate-pulse">
            <TrendingUp className="h-5.5 w-5.5 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-extrabold text-white text-sm tracking-widest leading-none uppercase">Antigravity</h2>
            <span className="text-[9px] text-cyan-400 font-bold tracking-[0.2em] uppercase mt-1 block">AI Stock Suite</span>
          </div>
        </div>

        {/* Navigation Routes List */}
        <nav className="p-4 space-y-2 mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 group relative cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-600/5 text-cyan-400 border border-cyan-400/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                    : 'hover:bg-cyan-500/5 hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                <span>{item.name}</span>
                
                {/* Active left glowing bar indicator */}
                {isActive && (
                  <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-gradient-to-b from-cyan-400 to-teal-400 rounded-r-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile and Log Out */}
      <div className="p-4 border-t border-white/5 bg-slate-950/20">
        <div className="flex items-center gap-3 px-3.5 py-3 bg-slate-900/40 border border-white/5 rounded-2xl mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-600/30 flex items-center justify-center font-black text-cyan-400 text-xs border border-cyan-400/30 font-mono shadow-[0_0_8px_rgba(6,182,212,0.1)]">
            {username ? username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="truncate flex-1">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Operator</p>
            <p className="text-xs font-black text-slate-200 truncate mt-1 leading-normal font-mono">{username || 'Trader'}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 font-bold text-xs uppercase tracking-wider transition-colors group cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          <span>Exit Suite</span>
        </button>
      </div>
    </aside>
  );
}
