import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft, 
  Layers, 
  HelpCircle 
} from 'lucide-react';

export default function PortfolioManager({ 
  token, 
  portfolioSummary, 
  onTransactionSuccess, 
  quickTradeTicker,
  setQuickTradeTicker
}) {
  const [ticker, setTicker] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [txType, setTxType] = useState('BUY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle pre-loaded quick trade data
  useEffect(() => {
    if (quickTradeTicker) {
      setTicker(quickTradeTicker.ticker || '');
      setCompanyName(quickTradeTicker.company_name || '');
      setPrice(quickTradeTicker.price || '');
      setTxType('BUY');
      
      // Reset quick trade so it doesn't loop
      setQuickTradeTicker(null);
    }
  }, [quickTradeTicker]);

  const handleSubmitTrade = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (!ticker || !shares || !price || !companyName) {
      setError("Please fill out all fields.");
      setLoading(false);
      return;
    }

    const payload = {
      ticker: ticker.toUpperCase().strip ? ticker.toUpperCase().strip() : ticker.toUpperCase().trim(),
      company_name: companyName.strip ? companyName.strip() : companyName.trim(),
      transaction_type: txType,
      shares: parseFloat(shares),
      price: parseFloat(price)
    };

    try {
      const response = await fetch('http://localhost:8000/api/v1/portfolio/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Transaction failed to execute.");

      setSuccessMsg(`Successfully executed ${txType} order of ${shares} shares of ${ticker}!`);
      setShares('');
      setPrice('');
      setTicker('');
      setCompanyName('');
      
      // Refresh parent datasets
      onTransactionSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totals = portfolioSummary?.totals || {
    total_invested: 0,
    total_current_value: 0,
    overall_profit_loss: 0,
    overall_profit_loss_percent: 0
  };

  const items = portfolioSummary?.items || [];

  // Prepare allocation data for PieChart
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#38bdf8', '#06b6d4'];
  const pieData = items.map(item => ({
    name: item.ticker,
    value: item.current_value
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Portfolio Asset Ledger
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Execute simulated buy/sell entries, view asset allocations, and track weighted performance gains.
        </p>
      </div>

      {/* Main Grid: left holds portfolio items and Pie; right holds execution forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Holdings and Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Holdings summary table */}
          <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
              Active Stock Positions
            </h2>
            
            {items.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm italic">
                No active stock holdings. Execute a BUY transaction to load assets into your ledger.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/60 pb-3 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                      <th className="py-3 pr-4">Asset</th>
                      <th className="py-3 px-4">Shares</th>
                      <th className="py-3 px-4">Avg Buy</th>
                      <th className="py-3 px-4">Live Price</th>
                      <th className="py-3 px-4">Market Val</th>
                      <th className="py-3 pl-4 text-right">Profit / Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr 
                        key={item.ticker} 
                        className="border-b border-slate-100 dark:border-slate-800/40 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors"
                      >
                        <td className="py-4 pr-4">
                          <span className="font-bold text-slate-900 dark:text-white block">{item.ticker}</span>
                          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px] block">{item.company_name}</span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          {item.total_shares.toFixed(4)}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          ${item.average_buy_price.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          ${item.current_price.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                          ${item.current_value.toFixed(2)}
                        </td>
                        <td className={`py-4 pl-4 text-right font-bold ${
                          item.profit_loss >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                          <div>{item.profit_loss >= 0 ? '+' : ''}${item.profit_loss.toFixed(2)}</div>
                          <div className="text-[10px] font-semibold">
                            {item.profit_loss_pct >= 0 ? '▲' : '▼'} {Math.abs(item.profit_loss_pct).toFixed(2)}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Allocation Pie chart */}
          {items.length > 0 && (
            <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6">
                Equity Allocation Blueprint
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                
                {/* Recharts Pie container */}
                <div className="md:col-span-3 h-52 text-xs font-semibold">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Donut Legend tags */}
                <div className="md:col-span-2 space-y-2">
                  {items.map((item, idx) => (
                    <div key={item.ticker} className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{item.ticker}</span>
                      </div>
                      <span className="text-slate-400">
                        {((item.current_value / totals.total_current_value) * 100.0).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Right column: Execution order card */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800 bg-gradient-to-br from-emerald-500/[0.01] to-violet-500/[0.01]">
            <div className="flex items-center gap-2 mb-6">
              <ArrowRightLeft className="h-5 w-5 text-emerald-500 shrink-0" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Submit Trade Execution
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-500 text-xs font-semibold">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-emerald-500 text-xs font-semibold">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmitTrade} className="space-y-4">
              
              {/* Order Select */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Order Side</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/80 rounded-xl">
                  {['BUY', 'SELL'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTxType(type)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        txType === type 
                          ? type === 'BUY'
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                            : 'bg-red-500 text-white shadow-md shadow-red-500/10'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                      }`}
                    >
                      {type} ORDER
                    </button>
                  ))}
                </div>
              </div>

              {/* Ticker Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stock Ticker</label>
                <input
                  type="text"
                  required
                  placeholder="AAPL"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/25 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Company Name Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="Apple Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/25 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Shares Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Shares Volume</label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="10.0"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/25 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Price Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stock Rate (USD)</label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="175.50"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/25 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Total Calculation */}
              {shares && price && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/40">
                  <span>Aggregate Total</span>
                  <span className="text-slate-950 dark:text-white font-bold">${(shares * price).toFixed(2)}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 text-white font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 text-sm ${
                  txType === 'BUY' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/10' 
                    : 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/10'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  `Execute Order`
                )}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
