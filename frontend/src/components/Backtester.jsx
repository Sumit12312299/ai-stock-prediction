import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Cpu, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Activity, 
  ShieldAlert, 
  Play, 
  Calendar, 
  ArrowRightLeft,
  Settings,
  Sparkles
} from 'lucide-react';

export default function Backtester({ token, defaultTicker }) {
  const [ticker, setTicker] = useState(defaultTicker || 'AAPL');
  const [strategy, setStrategy] = useState('LSTM_AI');
  const [capital, setCapital] = useState(10000);
  const [period, setPeriod] = useState('1y');
  
  // Strategy specific parameters
  const [rsiLow, setRsiLow] = useState(30);
  const [rsiHigh, setRsiHigh] = useState(70);
  const [smaFast, setSmaFast] = useState(20);
  const [smaSlow, setSmaSlow] = useState(50);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleRunBacktest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    const payload = {
      ticker: ticker.toUpperCase().trim(),
      strategy,
      initial_capital: parseFloat(capital),
      period,
      rsi_low: parseFloat(rsiLow),
      rsi_high: parseFloat(rsiHigh),
      sma_fast: parseInt(smaFast),
      sma_slow: parseInt(smaSlow)
    };

    try {
      const response = await fetch('http://localhost:8000/api/v1/stocks/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to execute backtest.');
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pre-load defaultTicker if changed
  useEffect(() => {
    if (defaultTicker) {
      setTicker(defaultTicker);
    }
  }, [defaultTicker]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Strategy Backtesting Engine
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Simulate buy/sell strategies on historical stock sequences. Contrast AI-based models against traditional technical algorithms.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Parameter Configuration form */}
        <div className="lg:col-span-1 glass-panel p-6 border border-slate-100 dark:border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Parameters</h2>
          </div>

          <form onSubmit={handleRunBacktest} className="space-y-4">
            {/* Ticker Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stock Ticker</label>
              <input
                type="text"
                required
                placeholder="AAPL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/25 border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-450 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Strategy Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Strategy Model</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/25 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="LSTM_AI">LSTM AI (Rolling Trend Forecast)</option>
                <option value="RSI">RSI Momentum Strategy</option>
                <option value="SMA_CROSSOVER">SMA Golden/Death Cross</option>
              </select>
            </div>

            {/* Starting Balance */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Starting Capital ($)</label>
              <input
                type="number"
                required
                min="100"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950/25 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Historical Window */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">History Window</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/25 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="3mo">Last 3 Months</option>
                <option value="6mo">Last 6 Months</option>
                <option value="1y">Last 1 Year</option>
                <option value="2y">Last 2 Years</option>
                <option value="5y">Last 5 Years</option>
              </select>
            </div>

            {/* Conditional Parameters based on Strategy selection */}
            {strategy === 'RSI' && (
              <div className="space-y-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/60 animate-fadeIn">
                <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">RSI Bounds</h4>
                <div>
                  <label className="flex justify-between text-[9px] text-slate-400 font-semibold mb-1">
                    <span>Oversold Floor:</span>
                    <span className="font-mono">{rsiLow}</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    value={rsiLow}
                    onChange={(e) => setRsiLow(e.target.value)}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <div>
                  <label className="flex justify-between text-[9px] text-slate-400 font-semibold mb-1">
                    <span>Overbought Ceiling:</span>
                    <span className="font-mono">{rsiHigh}</span>
                  </label>
                  <input
                    type="range"
                    min="55"
                    max="90"
                    value={rsiHigh}
                    onChange={(e) => setRsiHigh(e.target.value)}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            )}

            {strategy === 'SMA_CROSSOVER' && (
              <div className="space-y-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/60 animate-fadeIn">
                <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">SMA Windows</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold mb-1">Fast Window</label>
                    <input
                      type="number"
                      min="5"
                      max="30"
                      value={smaFast}
                      onChange={(e) => setSmaFast(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950/25 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-center focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-400 font-bold mb-1">Slow Window</label>
                    <input
                      type="number"
                      min="35"
                      max="150"
                      value={smaSlow}
                      onChange={(e) => setSmaSlow(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950/25 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-center focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 text-white font-bold bg-cyan-500 hover:bg-cyan-600 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-cyan-500/10 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Play className="h-4.5 w-4.5 shrink-0" />
                  <span>Execute Backtest</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Results Display */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-semibold animate-fadeIn">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!results && !loading && (
            <div className="flex flex-col items-center justify-center py-24 glass-panel border border-dashed border-slate-300 dark:border-slate-800 text-center animate-fadeIn">
              <Cpu className="h-12 w-12 text-slate-400 mb-4 animate-pulse" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Engine Standing By</h3>
              <p className="text-xs text-slate-450 mt-1 max-w-sm">
                Enter a valid stock ticker, choose your technical or neural network strategy, and hit **Execute Backtest** to simulate historical performance.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-fadeIn">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold text-slate-450">Crunching historical tickers & processing strategies...</p>
            </div>
          )}

          {results && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Final Value */}
                <div className="glass-panel p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Final Value</span>
                  <div className="mt-2">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">${results.final_value.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                    <span className={`text-[10px] font-black inline-flex items-center mt-1 ${
                      results.total_return_pct >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {results.total_return_pct >= 0 ? '▲' : '▼'} {Math.abs(results.total_return_pct).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Win Rate */}
                <div className="glass-panel p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Win Rate</span>
                  <div className="mt-2">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{results.win_rate_pct}%</h3>
                    <span className="text-[10px] text-slate-450 font-semibold block mt-1">
                      {results.winning_trades} / {results.total_trades} Trades won
                    </span>
                  </div>
                </div>

                {/* Sharpe Ratio */}
                <div className="glass-panel p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Risk Metric (Sharpe)</span>
                  <div className="mt-2">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">{results.sharpe_ratio.toFixed(2)}</h3>
                    <span className={`text-[10px] font-bold block mt-1 ${
                      results.sharpe_ratio >= 1.5 ? 'text-emerald-500' : results.sharpe_ratio >= 1.0 ? 'text-cyan-500' : 'text-slate-450'
                    }`}>
                      {results.sharpe_ratio >= 1.5 ? 'Excellent' : results.sharpe_ratio >= 1.0 ? 'Acceptable' : 'Suboptimal Risk'}
                    </span>
                  </div>
                </div>

                {/* Max Drawdown */}
                <div className="glass-panel p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Max Drawdown</span>
                  <div className="mt-2">
                    <h3 className="text-xl font-extrabold text-red-500 font-mono">-{results.max_drawdown_pct.toFixed(2)}%</h3>
                    <span className="text-[10px] text-slate-450 font-semibold block mt-1">
                      Peak-to-trough worst drop
                    </span>
                  </div>
                </div>

              </div>

              {/* Benchmarking Comparison Info banner */}
              <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl flex items-center justify-between text-xs font-semibold font-mono">
                <span className="text-slate-400">Strategy vs. Buy & Hold benchmark:</span>
                <div className="flex gap-4">
                  <span className="text-slate-200">
                    Strategy: <span className={results.total_return_pct >= 0 ? 'text-emerald-500' : 'text-red-500'}>{results.total_return_pct >= 0 ? '+' : ''}{results.total_return_pct}%</span>
                  </span>
                  <span className="text-slate-200">
                    Buy & Hold: <span className={results.buy_and_hold_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}>{results.buy_and_hold_return_pct >= 0 ? '+' : ''}{results.buy_and_hold_return_pct}%</span>
                  </span>
                </div>
              </div>

              {/* Performance Chart: Double Y-Axis */}
              <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Historical Equity Curve</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Growth comparison of strategy capital versus the underlying asset price.</p>
                  </div>
                  <div className="p-1.5 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>

                <div className="h-72 w-full text-xs font-semibold">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results.equity_curve} margin={{ top: 10, right: -10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.03)" />
                      <XAxis dataKey="date" stroke="#64748b" fontClassName="font-mono text-[9px]" />
                      <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#22d3ee" label={{ value: 'Capital ($)', angle: -90, position: 'insideLeft', style: { fill: '#22d3ee', fontSize: '9px', textTransform: 'uppercase' } }} fontClassName="font-mono text-[9px]" />
                      <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} stroke="#a855f7" label={{ value: 'Stock Price ($)', angle: 90, position: 'insideRight', style: { fill: '#a855f7', fontSize: '9px', textTransform: 'uppercase' } }} fontClassName="font-mono text-[9px]" />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 20, 38, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', color: '#f8fafc' }} />
                      <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '10px' }} />
                      <Line yAxisId="left" type="monotone" dataKey="portfolio_value" name="Strategy Portfolio ($)" stroke="#22d3ee" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                      <Line yAxisId="right" type="monotone" dataKey="stock_price" name="Underlying Stock Price" stroke="#a855f7" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Trades Ledger */}
              <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-6">
                  <ArrowRightLeft className="h-4.5 w-4.5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transaction Logs</h3>
                </div>

                {results.trades.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-450 italic">
                    No orders were triggered by indicators. Adjust parameters or select a wider historical window.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto pr-1">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800/60 pb-2 text-slate-400 font-semibold uppercase tracking-wider">
                          <th className="py-2">Date</th>
                          <th className="py-2 px-3">Side</th>
                          <th className="py-2 px-3">Price</th>
                          <th className="py-2 px-3">Shares</th>
                          <th className="py-2 text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.trades.map((trade, idx) => (
                          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/40 last:border-0 hover:bg-slate-950/20">
                            <td className="py-3 font-mono text-[10px] text-slate-400">{trade.date}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                                trade.type === 'BUY' 
                                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15' 
                                  : 'bg-red-500/10 text-red-500 border border-red-500/15'
                              }`}>
                                {trade.type}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold font-mono">${trade.price.toFixed(2)}</td>
                            <td className="py-3 px-3 font-mono text-slate-350">{trade.shares.toFixed(4)}</td>
                            <td className="py-3 text-right font-bold font-mono text-slate-200">${trade.value.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
