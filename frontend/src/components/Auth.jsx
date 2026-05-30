import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic slogan typewriter welcome subtitles
  const [slogan, setSlogan] = useState('AI-Based Time-Series Forecasting & Sentiment Index');
  const slogans = [
    'AI-Based Time-Series Forecasting & Sentiment Index',
    'Real-time Market Analytics & Core Portfolio Indicators',
    'Explainable AI Chatbot & Intelligent Voice Controls',
    'Predictive Quant Models for College Evaluation'
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % slogans.length;
      setSlogan(slogans[index]);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const API_URL = 'http://localhost:8000/api/v1/auth';
    const endpoint = isLogin ? `${API_URL}/login` : `${API_URL}/register`;
    const payload = isLogin 
      ? { email, password } 
      : { email, username, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Authentication failed. Please check inputs.');
      }

      // Store in localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);

      // Notify parent
      onAuthSuccess({
        token: data.access_token,
        username: data.username,
        email: data.email
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-transparent z-10">
      
      {/* Visual glowing backlight inside login panel */}
      <div className="w-full max-w-md glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl relative card-glow-cyan bg-slate-950/40 backdrop-blur-2xl">
        
        {/* Brand Logo Header */}
        <div className="text-center mb-8 relative">
          
          {/* Logo with interactive rotating ambient circles */}
          <div className="relative mb-5 inline-block">
            <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-md animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-600/30 flex items-center justify-center border border-cyan-400/40 shadow-inner group">
              <TrendingUp className="h-7 w-7 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-wide text-white font-sans uppercase">
            Antigravity <span className="text-cyan-400">Stock Suite</span>
          </h1>
          
          <div className="h-6 flex items-center justify-center mt-2">
            <p className="text-xs text-slate-400 font-medium tracking-wide animate-fade-slide-up duration-300">
              {slogan}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-400 text-sm animate-pulse">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
                Choose Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-cyan-400/70" />
                <input
                  type="text"
                  required
                  placeholder="alex_trader"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-sans"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-cyan-400/70" />
              <input
                type="email"
                required
                placeholder="alex@trade.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-cyan-400/70" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 btn-neon text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 select-none cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="tracking-wide">{isLogin ? 'Sign In Terminal' : 'Register Operator'}</span>
                <ArrowRight className="h-4 w-4 text-white animate-pulse" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-500">
          <span>{isLogin ? "New user registration needed? " : "Access active account instead? "}</span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-cyan-400 font-bold hover:underline ml-1 uppercase tracking-wider"
          >
            {isLogin ? 'Register Here' : 'Login Here'}
          </button>
        </div>
      </div>
    </div>
  );
}
