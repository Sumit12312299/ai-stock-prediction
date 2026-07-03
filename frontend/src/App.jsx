import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Auth from './components/Auth';
import Overview from './components/Overview';
import StockAnalysis from './components/StockAnalysis';
import PortfolioManager from './components/PortfolioManager';
import WatchlistManager from './components/WatchlistManager';
import ChatbotDrawer from './components/ChatbotDrawer';
import Backtester from './components/Backtester';

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  
  // Dashboard Shared States
  const [watchlist, setWatchlist] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Cross-Component Action Routing States
  const [voiceChatQuery, setVoiceChatQuery] = useState('');
  const [quickTradeTicker, setQuickTradeTicker] = useState(null);

  // PREMIUM VISUAL STATES
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Booting Antigravity Engine...');
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });

  // 1. Mouse coordinates listener for CursorGlow
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 2. Custom Loader sequence that shows dynamic ML steps
  useEffect(() => {
    const phases = [
      { progress: 15, text: 'Calibrating LSTM neural weight arrays...' },
      { progress: 38, text: 'Caching historical assets from Yahoo Finance...' },
      { progress: 62, text: 'Formulating moving averages & technical models...' },
      { progress: 85, text: 'Processing news sentiment matrices via TextBlob...' },
      { progress: 100, text: 'Syncing Portfolio Command Center...' }
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress >= 100) {
        progress = 100;
        setLoadingProgress(100);
        setLoadingText('Syncing Portfolio Command Center...');
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // Wait for smooth CSS exit transition
      } else {
        setLoadingProgress(progress);
        const matchingPhase = phases.find(p => progress <= p.progress);
        if (matchingPhase) {
          setLoadingText(matchingPhase.text);
        }
      }
    }, 60);

    return () => clearInterval(interval);
  }, []);

  // Authenticate token on startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');

    if (token && username && email) {
      setSession({ token, username, email });
    }
  }, []);

  // Fetch Dashboard State once session is active
  const fetchDashboardData = async () => {
    if (!session) return;

    try {
      const headers = { 'Authorization': `Bearer ${session.token}` };

      // 1. Fetch Watchlist
      const wlRes = await fetch('http://localhost:8000/api/v1/watchlist/', { headers });
      if (wlRes.ok) {
        const wlData = await wlRes.json();
        setWatchlist(wlData);
      }

      // 2. Fetch Portfolio Summary
      const pfRes = await fetch('http://localhost:8000/api/v1/portfolio/summary', { headers });
      if (pfRes.ok) {
        const pfData = await pfRes.json();
        setPortfolioSummary(pfData);
      }

      // 3. Fetch Transactions history
      const txRes = await fetch('http://localhost:8000/api/v1/portfolio/transactions', { headers });
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData);
      }

    } catch (err) {
      console.error("Failed to load dashboard parameters", err);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const handleAuthSuccess = (userSession) => {
    setSession(userSession);
  };

  const handleLogout = () => {
    localStorage.clear();
    setSession(null);
    setActiveTab('overview');
    setSelectedStock('AAPL');
    setWatchlist([]);
    setPortfolioSummary(null);
    setTransactions([]);
  };

  const handleSearchStock = (ticker) => {
    setSelectedStock(ticker);
    setActiveTab('analysis');
  };

  // Watchlist handlers
  const handleAddWatchlist = async (ticker, companyName) => {
    if (!session) return;
    try {
      const response = await fetch('http://localhost:8000/api/v1/watchlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({ ticker, company_name: companyName })
      });
      if (response.ok) {
        fetchDashboardData(); // Refresh list
      }
    } catch (err) {
      console.error("Watchlist save failed", err);
    }
  };

  const handleRemoveWatchlist = async (ticker) => {
    if (!session) return;
    try {
      const response = await fetch(`http://localhost:8000/api/v1/watchlist/remove/${ticker}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      if (response.ok) {
        fetchDashboardData(); // Refresh list
      }
    } catch (err) {
      console.error("Watchlist remove failed", err);
    }
  };

  // PREMIUM LOADING SCREEN PORTAL OVERLAY
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#060813] font-sans antialiased text-white select-none">
        
        {/* Soft radial background laser backlights */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[20%] left-[15%] w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] animate-blob-1" />
          <div className="absolute bottom-[20%] right-[15%] w-96 h-96 rounded-full bg-emerald-500/8 blur-[120px] animate-blob-2" />
        </div>

        {/* Core Container */}
        <div className="max-w-md w-full px-6 text-center animate-fade-slide-up">
          
          {/* Logo with interactive glowing orbit rings */}
          <div className="relative mb-8 inline-block">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center border border-cyan-400/40 shadow-lg shadow-cyan-500/25">
              <svg className="w-10 h-10 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          {/* Typewriter-Style Pulsing Header */}
          <h1 className="text-3xl font-extrabold tracking-wider mb-2 font-display bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400">
            ANTIGRAVITY <span className="text-white/90 font-light">STOCK AI</span>
          </h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-[0.25em] mb-10">
            Next-Gen Predictive System
          </p>

          {/* Sleek Progress Indicator Bar */}
          <div className="w-full bg-slate-950/80 rounded-full h-2 border border-white/5 p-[2px] overflow-hidden mb-5">
            <div 
              className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(34,211,238,0.6)]" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          {/* Description status and counter */}
          <div className="flex justify-between items-center text-xs px-1 text-slate-500 font-mono">
            <span className="text-cyan-400/80 animate-pulse text-left truncate max-w-[280px]">{loadingText}</span>
            <span className="font-bold text-slate-300">{loadingProgress}%</span>
          </div>
        </div>
      </div>
    );
  }

  // CORE APPLICATION SHELL
  return (
    <div className="relative w-full h-full min-h-screen text-slate-200 overflow-hidden font-sans bg-[#060913]">
      
      {/* 1. Interactive Cursor Glow follow trail (adapted from portfolio) */}
      <div 
        className="cursor-glow hidden lg:block pointer-events-none fixed" 
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px` 
        }} 
      />

      {/* 2. Premium space floating blobs backlight (adapted from portfolio) */}
      <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden pointer-events-none select-none">
        <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[50%] rounded-full bg-cyan-500/5 blur-[120px] animate-blob-1" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-emerald-500/4 blur-[130px] animate-blob-2" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#22d3ee 1.5px, transparent 1.5px)', backgroundSize: '36px 36px' }} />
      </div>

      {/* 3. Authentication gate / Session selector */}
      {!session ? (
        <Auth onAuthSuccess={handleAuthSuccess} />
      ) : (
        <div className="flex h-screen overflow-hidden bg-transparent">
          
          {/* Dark Premium Sidebar */}
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogout={handleLogout}
            username={session.username}
          />

          {/* Main Core Viewport */}
          <div className="flex-1 flex flex-col overflow-hidden relative bg-transparent">
            
            {/* Upper Search/Microphone bar */}
            <Header 
              token={session.token}
              onSearchStock={handleSearchStock}
              setActiveTab={setActiveTab}
              setVoiceChatQuery={setVoiceChatQuery}
              onAddWatchlistQuick={handleAddWatchlist}
            />

            {/* Dynamic viewport renderer */}
            <main className="flex-1 overflow-y-auto p-8 relative scrollbar-thin">
              
              {activeTab === 'overview' && (
                <Overview 
                  portfolioSummary={portfolioSummary}
                  transactions={transactions}
                  watchlistCount={watchlist.length}
                  onAnalyzeStock={handleSearchStock}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'analysis' && (
                <StockAnalysis 
                  token={session.token}
                  ticker={selectedStock}
                  watchlist={watchlist}
                  onAddWatchlist={handleAddWatchlist}
                  onRemoveWatchlist={handleRemoveWatchlist}
                  setActiveTab={setActiveTab}
                  setQuickTradeTicker={setQuickTradeTicker}
                />
              )}

              {activeTab === 'portfolio' && (
                <PortfolioManager 
                  token={session.token}
                  portfolioSummary={portfolioSummary}
                  onTransactionSuccess={fetchDashboardData}
                  quickTradeTicker={quickTradeTicker}
                  setQuickTradeTicker={setQuickTradeTicker}
                />
              )}

              {activeTab === 'watchlist' && (
                <WatchlistManager 
                  watchlist={watchlist}
                  onRemoveWatchlist={handleRemoveWatchlist}
                  onAnalyzeStock={handleSearchStock}
                />
              )}

              {activeTab === 'chatbot' && (
                <ChatbotDrawer 
                  token={session.token}
                  onAnalyzeStock={handleSearchStock}
                  voiceQuery={voiceChatQuery}
                  clearVoiceQuery={() => setVoiceChatQuery('')}
                />
              )}

              {activeTab === 'backtest' && (
                <Backtester 
                  token={session.token}
                  defaultTicker={selectedStock}
                />
              )}

            </main>
          </div>
        </div>
      )}
    </div>
  );
}
