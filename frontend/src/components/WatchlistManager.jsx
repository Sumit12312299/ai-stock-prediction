import React from 'react';
import { Bookmark, Star, Trash2, LineChart, TrendingUp } from 'lucide-react';

export default function WatchlistManager({ watchlist, onRemoveWatchlist, onAnalyzeStock }) {
  
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Saved Stock Watchlist
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Quickly monitor favorited equities and jump straight to their deep LSTM neural forecasting models.
        </p>
      </div>

      <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-6">
          <Bookmark className="h-5 w-5 text-amber-500 shrink-0" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Your Tracked Securities
          </h2>
        </div>

        {watchlist.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm italic">
            <Star className="h-10 w-10 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
            No stocks bookmarked yet. Search for a stock in the header and click "Add Watchlist" to save items here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {watchlist.map((item) => (
              <div 
                key={item.id || item._id} 
                className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex items-center justify-between hover:border-amber-500 dark:hover:border-amber-500/50 transition-all group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-950 dark:text-white text-base leading-none">{item.ticker}</span>
                    <span className="text-[9px] bg-amber-500/10 text-amber-500 font-bold px-1.5 py-0.2 rounded uppercase">
                      Tracked
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-1 block truncate max-w-[200px]">{item.company_name}</span>
                  <span className="text-[10px] text-slate-400 mt-2 block">
                    Added: {new Date(item.added_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Jump button */}
                  <button 
                    onClick={() => onAnalyzeStock(item.ticker)}
                    className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all flex items-center gap-1.5 text-xs font-semibold"
                    title="Run LSTM Forecast"
                  >
                    <LineChart className="h-4 w-4" />
                    <span>Run AI</span>
                  </button>

                  {/* Remove button */}
                  <button 
                    onClick={() => onRemoveWatchlist(item.ticker)}
                    className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
