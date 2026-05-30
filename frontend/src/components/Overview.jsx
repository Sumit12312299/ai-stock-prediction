import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
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
    <div className="space-y-8 animate-fade-slide-up bg-transparent">
      
      {/* Upper Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-white uppercase font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            System Command Center
          </h1>
          <p className="text-xs text-cyan-400 font-semibold tracking-wider uppercase mt-1">
            Real-time Trading Terminals & LSTM Deep-Learning Forecasting Kernels
          </p>
        </div>
        
        {/* Dynamic active status pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-mono font-bold animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Core AI Pipelines Active</span>
        </div>
      </div>

      {/* Animated Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Card 1: Portfolio Value - Cyan glow */}
        <div className="glass-panel p-6 rounded-2xl hover:scale-[1.02] transition-all bg-slate-950/40 backdrop-blur-md relative border border-white/5 card-glow-cyan">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net Portfolio Value</span>
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-mono leading-tight tracking-wide">
            ${totals.total_current_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-500 mt-2">
            Invested Basis: <span className="text-cyan-400/90 font-semibold font-mono">${totals.total_invested.toFixed(2)}</span>
          </p>
        </div>

        {/* Card 2: Profit / Loss - Emerald/Red glow */}
        <div className={`glass-panel p-6 rounded-2xl hover:scale-[1.02] transition-all bg-slate-950/40 backdrop-blur-md relative border border-white/5 ${
          totals.overall_profit_loss >= 0 ? 'card-glow-emerald' : 'card-glow-cyan'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Margin Return</span>
            <div className={`p-2.5 rounded-xl border ${
              totals.overall_profit_loss >= 0 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {totals.overall_profit_loss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
          </div>
          <h3 className={`text-2xl font-black font-mono leading-tight tracking-wide ${totals.overall_profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totals.overall_profit_loss >= 0 ? '+' : ''}
            ${totals.overall_profit_loss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className={`text-[10px] mt-2 font-bold flex items-center gap-1 ${
            totals.overall_profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {totals.overall_profit_loss_percent >= 0 ? '▲' : '▼'} {Math.abs(totals.overall_profit_loss_percent).toFixed(2)}% ROI Margin
          </p>
        </div>

        {/* Card 3: Watchlist Counters - Purple/Indigo glow */}
        <div className="glass-panel p-6 rounded-2xl hover:scale-[1.02] transition-all bg-slate-950/40 backdrop-blur-md relative border border-white/5 card-glow-cyan">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Watchlist</span>
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white font-mono leading-tight tracking-wide">
            {watchlistCount} Equities
          </h3>
          <p className="text-[10px] text-indigo-400/90 mt-2 font-semibold tracking-wider uppercase">
            Tracking channels active
          </p>
        </div>

        {/* Card 4: AI Network Accuracy - Amber glow */}
        <div className="glass-panel p-6 rounded-2xl hover:scale-[1.02] transition-all bg-slate-950/40 backdrop-blur-md relative border border-white/5 card-glow-cyan">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LSTM Neural Engine</span>
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-white leading-tight tracking-wide font-display">
            Dual Forecasting
          </h3>
          <p className="text-[10px] text-slate-500 mt-2">
            Dynamic sequence basis: <span className="text-amber-400 font-bold font-mono">30 Days</span>
          </p>
        </div>

      </div>

      {/* Main Row layout: Hotlist and Technical Formulas Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Hotlist Cards */}
        <div className="md:col-span-2 glass-panel p-8 rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-md flex flex-col justify-between card-glow-cyan">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-display">
                Real-Time Hotlist Feed
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">INDEX DATA</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Launch instantaneous time-series LSTM futures forecasts for these blue-chip industry leaders.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hotlist.map((stock) => (
                <div 
                  key={stock.ticker} 
                  className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex items-center justify-between hover:border-cyan-400/40 hover:bg-slate-900/70 transition-all group cursor-pointer"
                  onClick={() => onAnalyzeStock(stock.ticker)}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-bold text-white text-base block font-mono">{stock.ticker}</span>
                    <span className="text-[10px] text-slate-500 truncate block">{stock.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white text-sm block font-mono">${stock.price.toFixed(2)}</span>
                    <span className={`text-[10px] font-bold ${stock.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stock.change}
                    </span>
                  </div>
                  <div className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white rounded-xl border border-cyan-500/20 transition-all ml-3 opacity-60 group-hover:opacity-100 group-hover:scale-105">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technical Formula Info Card */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-md flex flex-col relative card-glow-emerald">
          <div className="flex items-center gap-2.5 mb-2">
            <HelpCircle className="h-5 w-5 text-emerald-400 shrink-0" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display">
              Formula Blueprint
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Underlying quantitative mathematical layers driving secondary predictions.
          </p>
          
          <div className="space-y-4 text-xs">
            {/* Moving Average */}
            <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
              <span className="font-bold text-slate-200 block mb-1 font-sans">Simple Moving Average (SMA)</span>
              <p className="mb-3 text-[10px] text-slate-500 leading-relaxed">Isolates high-frequency volatility noise:</p>
              <div className="p-2.5 bg-slate-950/60 rounded-xl text-center font-mono text-[10px] text-cyan-400 border border-white/5 font-semibold">
                SMA_k = 1/k * Σ (P_t-i)
              </div>
            </div>

            {/* Linear Regression */}
            <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
              <span className="font-bold text-slate-200 block mb-1 font-sans">Linear Trend Forecasting</span>
              <p className="mb-3 text-[10px] text-slate-500 leading-relaxed">Computes optimal linear slope parameters:</p>
              <div className="space-y-1.5 font-mono text-[9px] text-slate-400 border border-white/5 p-2 bg-slate-950/60 rounded-xl">
                <div className="text-center font-bold">Slope (m) = [nΣxy - (Σx)(Σy)] / [nΣx² - (Σx)²]</div>
                <div className="text-center font-bold">Constant (c) = (Σy - mΣx) / n</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Transactions History log */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-md card-glow-cyan">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-display">
              Transaction Execution Log
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ledger registering buy and sell positions simulated on active server databases.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('portfolio')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider border border-cyan-400/20 bg-cyan-500/5 px-3.5 py-1.5 rounded-xl hover:bg-cyan-500/10 transition-all cursor-pointer"
          >
            <span>Open Ledger</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-xs italic">
            No transactions executed yet. Open the Portfolio Manager to simulate trading positions.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 pb-3 text-slate-500 font-semibold uppercase tracking-[0.15em] text-[10px]">
                  <th className="py-3 pr-4">Timestamp</th>
                  <th className="py-3 px-4">Equity Symbol</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Shares Count</th>
                  <th className="py-3 px-4">Execution Price</th>
                  <th className="py-3 pl-4 text-right">Aggregate Cost</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((tx) => (
                  <tr 
                    key={tx.id || tx._id} 
                    className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 pr-4 text-slate-500 font-mono text-[10px]">
                      {new Date(tx.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white font-mono">
                      {tx.ticker}
                      <span className="text-[9px] text-slate-500 font-normal ml-2 hidden sm:inline">{tx.company_name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${
                        tx.transaction_type === 'BUY' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-300 font-mono">
                      {tx.shares.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-300 font-mono">
                      ${tx.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 pl-4 text-right font-black text-white font-mono">
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
