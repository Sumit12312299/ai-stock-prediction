import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Auth from './components/Auth';
import Overview from './components/Overview';
import StockAnalysis from './components/StockAnalysis';
import PortfolioManager from './components/PortfolioManager';
import WatchlistManager from './components/WatchlistManager';
import ChatbotDrawer from './components/ChatbotDrawer';

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

  if (!session) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      
      {/* Dark Premium Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        username={session.username}
      />

      {/* Main Core Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Upper Search/Microphone bar */}
        <Header 
          token={session.token}
          onSearchStock={handleSearchStock}
          setActiveTab={setActiveTab}
          setVoiceChatQuery={setVoiceChatQuery}
          onAddWatchlistQuick={handleAddWatchlist}
        />

        {/* Dynamic viewport renderer */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          
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

        </main>
      </div>
    </div>
  );
}
