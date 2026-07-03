import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, Sun, Moon, Volume2, X, AlertTriangle, TrendingUp } from 'lucide-react';
import SiriWaveform from './SiriWaveform';

export default function Header({ 
  token, 
  onSearchStock, 
  setActiveTab, 
  setVoiceChatQuery,
  onAddWatchlistQuick
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [theme, setTheme] = useState('dark');
  
  // Voice Assistant States
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [voiceError, setVoiceError] = useState('');
  
  const recognitionRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search autocomplete suggestions from API
  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/stocks/suggestions?q=${query}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("Autocomplete failure", err);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query, token]);

  // Default to premium Dark Mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark' || !localStorage.getItem('theme')) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  const handleSuggestionClick = (ticker) => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearchStock(ticker);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleSuggestionClick(query.trim().toUpperCase());
    }
  };

  // --- Voice Assistant HTML5 Speech Engine ---
  const startSpeechRecognition = () => {
    setVoiceError('');
    setVoiceText('Listening to input channels...');
    setAssistantReply('');
    setIsListening(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(`" ${transcript} "`);
        await processVoiceIntent(transcript);
      };

      rec.onerror = (e) => {
        console.error("Speech Error", e);
        setVoiceError("Could not capture audio. Make sure mic permissions are enabled.");
        setIsListening(false);
      };

      rec.onend = () => {
        // Managed by result or error
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      setVoiceError("Mic connection failed.");
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceIntent = async (queryText) => {
    setVoiceText(`Analyzing intent: "${queryText}"`);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/assistant/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voice_query: queryText })
      });

      if (!response.ok) throw new Error("Assistant response failed");
      const data = await response.json();
      
      setAssistantReply(data.spoken_text);
      speakText(data.spoken_text);

      // Execute Action Payload on Frontend after dynamic delay
      setTimeout(() => {
        setIsListening(false);
        executeVoiceAction(data.action_type, data.action_payload);
      }, 3500);

    } catch (err) {
      setVoiceError("AI Assistant processing error.");
      setIsListening(false);
    }
  };

  const executeVoiceAction = (actionType, payload) => {
    if (!actionType || actionType === "UNKNOWN") return;

    switch (actionType) {
      case "SEARCH":
      case "PREDICT":
        setActiveTab("analysis");
        onSearchStock(payload.ticker);
        break;
      case "PORTFOLIO":
        setActiveTab("portfolio");
        break;
      case "WATCHLIST":
        setActiveTab("watchlist");
        break;
      case "ADD_WATCHLIST":
        setActiveTab("watchlist");
        if (payload.ticker) {
          onAddWatchlistQuick(payload.ticker, payload.company_name);
        }
        break;
      case "CHAT":
        setActiveTab("chatbot");
        if (payload.message) {
          setVoiceChatQuery(payload.message);
        }
        break;
      default:
        break;
    }
  };

  return (
    <header className="h-20 bg-slate-950/20 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40">
      
      {/* Dynamic Search Box */}
      <div className="w-96 relative" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-cyan-400" />
          <input
            type="text"
            placeholder="Search company ticker or symbol (e.g. AAPL, TSLA)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-white/5 rounded-2xl text-xs placeholder-slate-500 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all shadow-inner font-sans"
          />
        </form>

        {/* Search Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/90 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-fade-slide-up duration-200">
            {suggestions.map((item) => (
              <button
                key={item.ticker}
                onClick={() => handleSuggestionClick(item.ticker)}
                className="w-full px-4 py-3 text-left hover:bg-cyan-500/5 flex items-center justify-between border-b border-white/[0.02] last:border-0 transition-colors group cursor-pointer"
              >
                <div>
                  <span className="font-bold text-white text-xs font-mono">{item.ticker}</span>
                  <span className="text-[10px] text-slate-500 ml-2 truncate max-w-[200px] inline-block align-bottom group-hover:text-slate-300">{item.name}</span>
                </div>
                <span className="text-[8px] bg-cyan-500/10 text-cyan-400 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-cyan-500/10 group-hover:bg-cyan-500 group-hover:text-white transition-all">
                  Forecast
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Control Buttons (Mic, Theme, Profile) */}
      <div className="flex items-center gap-4">
        
        {/* Voice Assistant Trigger */}
        <button
          onClick={startSpeechRecognition}
          className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white border border-cyan-500/20 transition-all group active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)] flex items-center justify-center"
          title="Launch voice command assistant"
        >
          <Mic className="h-4.5 w-4.5 shrink-0 group-hover:scale-110 transition-transform" />
        </button>

        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white hover:bg-slate-900 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          title="Toggle system styling mode"
        >
          {theme === 'light' ? (
            <Moon className="h-4.5 w-4.5 shrink-0 text-cyan-400" />
          ) : (
            <Sun className="h-4.5 w-4.5 shrink-0 text-amber-400 animate-spin-slow" />
          )}
        </button>
      </div>

      {/* Voice Assistant Futuristic Overlay Panel */}
      {isListening && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fade-slide-up duration-300">
          <div className="w-full max-w-md bg-slate-950/90 border border-cyan-500/20 rounded-3xl p-8 text-center shadow-2xl relative card-glow-cyan">
            
            <button
              onClick={stopSpeechRecognition}
              className="absolute right-6 top-6 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="h-4 w-4 shrink-0" />
            </button>

            <div className="mb-6 inline-flex items-center gap-1.5 p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.25)] animate-pulse">
              <Mic className="h-8 w-8 text-cyan-400" />
            </div>

            <h3 className="text-lg font-extrabold text-white mb-1 uppercase tracking-wider font-display">
              Voice Operator Console
            </h3>
            
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-8">
              Microphone input active
            </p>

            {/* Siri-like Waveform Visualizer */}
            {!assistantReply && !voiceError && (
              <SiriWaveform isListening={isListening} />
            )}

            {assistantReply && (
              <div className="flex justify-center items-center gap-2 text-cyan-400 mb-8 animate-pulse-slow">
                <Volume2 className="h-5 w-5 shrink-0" />
                <span className="font-bold text-[9px] tracking-[0.2em] uppercase">Synthesizing Voice</span>
              </div>
            )}

            {/* Transcript Log bubbles */}
            <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl mb-4 text-center">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Transcription Stream</p>
              <p className="text-sm text-white font-semibold italic">
                {voiceText || "Say 'Predict Apple' or 'Show my portfolio'"}
              </p>
            </div>

            {assistantReply && (
              <div className="p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-2xl text-left">
                <p className="text-[9px] text-cyan-400 uppercase tracking-widest mb-1.5 font-bold">Response Synthesis</p>
                <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                  {assistantReply}
                </p>
              </div>
            )}

            {voiceError && (
              <div className="p-4 bg-red-950/40 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs text-left animate-pulse">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <span>{voiceError}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
