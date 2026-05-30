import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Star, 
  FileText, 
  ArrowRightLeft, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Newspaper, 
  PieChart 
} from 'lucide-react';

export default function StockAnalysis({ 
  token, 
  ticker, 
  watchlist, 
  onAddWatchlist, 
  onRemoveWatchlist,
  setActiveTab,
  setQuickTradeTicker
}) {
  const [days, setDays] = useState(7);
  const [details, setDetails] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [error, setError] = useState('');

  const isBookmarked = watchlist.some(item => item.ticker === ticker);

  // Fetch Stock details (price, chart, news)
  const fetchDetails = async () => {
    setLoadingDetails(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:8000/api/v1/stocks/details/${ticker}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to fetch stock information.");
      setDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fetch LSTM price forecast & technical evaluation metrics
  const fetchPrediction = async () => {
    setLoadingPrediction(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/stocks/predict/${ticker}?days=${days}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to generate AI predictions.");
      setPrediction(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPrediction(false);
    }
  };

  useEffect(() => {
    if (ticker) {
      fetchDetails();
    }
  }, [ticker, token]);

  useEffect(() => {
    if (ticker && details) {
      fetchPrediction();
    }
  }, [ticker, days, details, token]);

  const handleWatchlistToggle = () => {
    if (isBookmarked) {
      onRemoveWatchlist(ticker);
    } else {
      onAddWatchlist(ticker, details?.company_name);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadingReport(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/stocks/report/${ticker}?days=${days}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Could not download report.");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${ticker}_AI_Market_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to export PDF: " + err.message);
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleQuickTrade = () => {
    setQuickTradeTicker({
      ticker,
      company_name: details?.company_name,
      price: details?.current_price
    });
    setActiveTab('portfolio');
  };

  if (!ticker) {
    return (
      <div className="py-20 text-center glass-panel border border-dashed border-slate-300 dark:border-slate-800 animate-fadeIn">
        <Sparkles className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">No stock loaded.</h2>
        <p className="text-sm text-slate-400 mt-2">
          Use the search bar in the header or select an asset from the dashboard to begin analysis.
        </p>
      </div>
    );
  }

  if (loadingDetails && !details) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading live stock profiles and news vectors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-start gap-4 text-red-600 dark:text-red-400 animate-fadeIn">
        <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-base">Equity loading failed</h3>
          <p className="text-sm mt-1">{error}</p>
          <button onClick={fetchDetails} className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold hover:bg-red-200 transition-colors">
            Try Re-Fetching
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stock Title & Actions Header */}
      {details && (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {details.company_name}
              </h1>
              <span className="text-sm bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-bold px-3 py-1 rounded-xl uppercase tracking-wider border border-slate-200/40 dark:border-slate-700/40">
                {details.ticker}
              </span>
            </div>
            
            {/* Live Pricing */}
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">${details.current_price.toFixed(2)}</span>
              <span className={`text-base font-bold flex items-center gap-0.5 ${
                details.change >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {details.change >= 0 ? '▲' : '▼'} ${Math.abs(details.change).toFixed(2)} ({details.change_percent.toFixed(2)}%)
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide ml-2 bg-slate-100 dark:bg-slate-800/40 px-2 py-0.5 rounded">
                Live Data fallback active
              </span>
            </div>
          </div>

          {/* Quick Trigger Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleWatchlistToggle}
              className={`p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center gap-2 text-sm font-semibold ${
                isBookmarked 
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Star className={`h-5 w-5 shrink-0 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Add Watchlist'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloadingReport}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2 text-sm font-semibold active:scale-95 disabled:opacity-50"
            >
              {downloadingReport ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FileText className="h-5 w-5 shrink-0 text-slate-400" />
                  <span className="hidden sm:inline">Export PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleQuickTrade}
              className="p-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/15 flex items-center gap-2 text-sm font-semibold active:scale-95"
            >
              <ArrowRightLeft className="h-5 w-5 shrink-0" />
              <span>Quick Trade</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Left Charts / Right Recommendation widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommendation Scorecard */}
        {prediction && (
          <div className="lg:col-span-1 space-y-6">
            
            {/* Verdict Box */}
            <div className={`glass-panel p-6 border ${
              prediction.recommendation === 'BUY' 
                ? 'bg-emerald-500/[0.02] border-emerald-500/20' 
                : prediction.recommendation === 'SELL'
                ? 'bg-red-500/[0.02] border-red-500/20'
                : 'bg-amber-500/[0.02] border-amber-500/20'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Forecast Verdict</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  prediction.recommendation === 'BUY' 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                    : prediction.recommendation === 'SELL'
                    ? 'bg-red-500/10 text-red-500 border border-red-500/10'
                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                }`}>
                  {prediction.recommendation}
                </span>
              </div>
              
              <div className="text-center py-4">
                <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mb-1">Prediction Confidence</p>
                <h2 className="text-5xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {prediction.confidence_score}%
                </h2>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-xs leading-relaxed text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {prediction.recommendation_reason}
              </div>
            </div>

            {/* Model Fitting Performance Scorecard */}
            <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                Fitting Accuracy Scorecard
              </h3>
              <div className="space-y-3.5 font-mono text-xs">
                
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-400 font-medium">R-Squared (R²)</span>
                  <span className="font-bold text-emerald-500">{prediction.r2_score.toFixed(4)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-slate-400 font-medium">Root Mean Squared (RMSE)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{prediction.rmse.toFixed(4)}</span>
                </div>

                <div className="flex justify-between py-2 last:border-0">
                  <span className="text-slate-400 font-medium">Mean Absolute (MAE)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{prediction.mae.toFixed(4)}</span>
                </div>

              </div>
            </div>
            
          </div>
        )}

        {/* Charts block */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart 1: Predicted vs Actual */}
          <div className="glass-panel p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Predicted vs Actual History (In-Sample Fit)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Overlapping LSTM model regression fit against closing trade history.
                </p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            {loadingPrediction ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : prediction ? (
              <div className="h-72 w-full text-xs font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prediction.historical_prices} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.03)" />
                    <XAxis dataKey="date" stroke="#64748b" fontClassName="font-mono text-[9px]" />
                    <YAxis domain={['auto', 'auto']} stroke="#64748b" fontClassName="font-mono text-[9px]" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 20, 38, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', color: '#f8fafc', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                    <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                    <Line type="monotone" dataKey="actual" name="Actual Trade Price" stroke="#22d3ee" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#22d3ee', stroke: '#060913', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="predicted" name="LSTM Model Fit" stroke="#34d399" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-slate-400 italic">No forecast loaded</div>
            )}
          </div>

        </div>

      </div>

      {/* Row 2: Future area predictions chart & News Sentiments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 2: Future Price Projections Area */}
        <div className="lg:col-span-2 glass-panel p-6 border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Future price trajectory forecast (LSTM)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                AI sequential time-series projection across target horizon.
              </p>
            </div>
            
            {/* Horizon select */}
            <div className="flex gap-1.5 p-1 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 rounded-xl">
              {[7, 15, 30].map(h => (
                <button
                  key={h}
                  onClick={() => setDays(h)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    days === h 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {h} Days
                </button>
              ))}
            </div>
          </div>

          {loadingPrediction ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : prediction ? (
            <div className="h-64 w-full text-xs font-semibold">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={prediction.predicted_prices} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.03)" />
                  <XAxis dataKey="date" stroke="#64748b" fontClassName="font-mono text-[9px]" />
                  <YAxis domain={['auto', 'auto']} stroke="#64748b" fontClassName="font-mono text-[9px]" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 20, 38, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', color: '#f8fafc', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                  <Area type="monotone" dataKey="price" name="LSTM Projected Future Value" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 italic">No forecast loaded</div>
          )}
        </div>

        {/* News & Sentiments column */}
        {details && (
          <div className="lg:col-span-1 glass-panel p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-blue-500 shrink-0" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    News Sentiments Ledger
                  </h3>
                </div>
                
                {/* Aggregate sentiment verdict */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  details.sentiment_summary.overall_sentiment === 'POSITIVE' 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : details.sentiment_summary.overall_sentiment === 'NEGATIVE'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {details.sentiment_summary.verdict}
                </span>
              </div>

              {/* Articles lists */}
              <div className="space-y-4 max-y-64 overflow-y-auto pr-1">
                {details.news.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[120px]">{item.source}</span>
                      
                      {/* Sentiment Label Tag */}
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        item.sentiment_label === 'POSITIVE' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : item.sentiment_label === 'NEGATIVE'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.sentiment_score > 0 ? '+' : ''}{item.sentiment_score.toFixed(2)}
                      </span>
                    </div>
                    
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-500 dark:hover:text-emerald-400 line-clamp-2 leading-snug"
                    >
                      {item.title}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
