import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  ArrowRight, 
  Cpu, 
  HelpCircle, 
  Layers 
} from 'lucide-react';

export default function Overview({ 
  portfolioSummary, 
  transactions, 
  watchlistCount, 
  onAnalyzeStock,
  setActiveTab 
}) {
  
  const totals = portfolioSummary?.totals || {
    total_invested: 0,
    total_current_value: 0,
    overall_profit_loss: 0,
    overall_profit_loss_percent: 0
  };

  const hotlist = [
    { ticker: 'AAPL', name: 'Apple Inc.', price: 178.45, change: '+1.8%', isUp: true },
    { ticker: 'NVDA', name: 'NVIDIA Corporation', price: 924.12, change: '+4.5%', isUp: true },
    { ticker: 'TSLA', name: 'Tesla, Inc.', price: 165.20, change: '-2.3%', isUp: false },
    { ticker: 'MSFT', name: 'Microsoft Corp.', price: 421.90, change: '+0.9%', isUp: true }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Upper Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          System Command Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Real-time trading analytics, LSTM sequence forecasting pipelines, and sentiment ledgers.
        </p>
      </div>

      {/* Animated Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card 1: Portfolio Value */}
        <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Portfolio Value</span>
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            ${totals.total_current_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Invested basis: <span className="text-slate-600 dark:text-slate-300 font-semibold">${totals.total_invested.toFixed(2)}</span>
          </p>
        </div>

        {/* Card 2: Profit / Loss */}
        <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Return</span>
            <div className={`p-2.5 rounded-xl border ${
              totals.overall_profit_loss >= 0 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              {totals.overall_profit_loss >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
          </div>
          <h3 className={`text-2xl font-bold leading-tight ${totals.overall_profit_loss >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {totals.overall_profit_loss >= 0 ? '+' : ''}
            ${totals.overall_profit_loss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className={`text-xs mt-2 font-semibold flex items-center gap-1 ${
            totals.overall_profit_loss >= 0 ? 'text-emerald-500' : 'text-red-500'
          }`}>
            {totals.overall_profit_loss_percent >= 0 ? '▲' : '▼'} {Math.abs(totals.overall_profit_loss_percent).toFixed(2)}% overall margin
          </p>
        </div>

        {/* Card 3: Watchlist Counters */}
        <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bookmarked Watchlist</span>
            <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-500 border border-violet-500/20">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            {watchlistCount} Tickers
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Active tracking triggers enabled
          </p>
        </div>

        {/* Card 4: AI Network Accuracy */}
        <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Neural Status</span>
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20">
              <Cpu className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
            LSTM & RNN Cores
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Dynamic sequence lookback: <span className="text-amber-500 font-bold">30 Days</span>
          </p>
        </div>

      </div>

      {/* Main Row layout: Hotlist and Technical Formulas Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Hotlist Cards */}
        <div className="md:col-span-2 glass-panel p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Market Hotlist Tickers
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Quick shortcut widgets to trigger deep AI sequence predictions for market giants.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hotlist.map((stock) => (
                <div 
                  key={stock.ticker} 
                  className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl flex items-center justify-between hover:border-emerald-500 dark:hover:border-emerald-500/60 transition-all group"
                >
                  <div>
                    <span className="font-bold text-slate-950 dark:text-white text-base block">{stock.ticker}</span>
                    <span className="text-xs text-slate-400 truncate max-w-[130px] inline-block">{stock.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm block">${stock.price.toFixed(2)}</span>
                    <span className={`text-xs font-semibold ${stock.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                      {stock.change}
                    </span>
                  </div>
                  <button 
                    onClick={() => onAnalyzeStock(stock.ticker)}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 ml-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Formula Info Card */}
        <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-emerald-500/[0.02] to-blue-500/[0.02]">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Core Technical Formulas
            </h2>
          </div>
          
          <div className="space-y-4 text-xs text-slate-500 dark:text-slate-400">
            {/* Moving Average */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 rounded-xl">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Simple Moving Average (SMA)</span>
              <p className="mb-2 italic text-[10px] leading-relaxed">Smoothing trading datasets to isolate trends:</p>
              <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-center font-mono text-[11px] text-slate-700 dark:text-slate-300 font-bold border border-slate-200/40 dark:border-slate-800/40">
                SMA = (P₁ + P₂ + ... + P_n) / n
              </div>
            </div>

            {/* Linear Regression */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 rounded-xl">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Linear Regression Equations</span>
              <p className="mb-2 italic text-[10px] leading-relaxed">Finding least-squares price lines (y = mx + c):</p>
              <div className="space-y-1.5 font-mono text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200/40 dark:border-slate-800/40 p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                <div className="text-center font-bold">Slope (m) = [nΣxy - (Σx)(Σy)] / [nΣx² - (Σx)²]</div>
                <div className="text-center font-bold">Intercept (c) = (Σy - mΣx) / n</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Transactions History log */}
      <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Recent Transactions History
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological log of buy and sell ledger executions.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className="text-xs font-semibold text-emerald-500 hover:underline flex items-center gap-1"
          >
            <span>Open Portfolio Manager</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm italic">
            No transactions executed yet. Open the portfolio to simulate buying and selling stocks.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 pb-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3 pr-4">Executed Date</th>
                  <th className="py-3 px-4">Equity Asset</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Volume (Shares)</th>
                  <th className="py-3 px-4">Price (USD)</th>
                  <th className="py-3 pl-4 text-right">Aggregate Cost</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((tx) => (
                  <tr 
                    key={tx.id || tx._id} 
                    className="border-b border-slate-100 dark:border-slate-800/40 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                  >
                    <td className="py-3.5 pr-4 text-slate-400 font-medium text-xs">
                      {new Date(tx.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {tx.ticker}
                      <span className="text-[10px] text-slate-400 font-medium ml-2 font-normal hidden sm:inline">{tx.company_name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        tx.transaction_type === 'BUY' 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/10'
                      }`}>
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {tx.shares.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      ${tx.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 pl-4 text-right font-bold text-slate-950 dark:text-white">
                      ${tx.total_cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
