import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, Sun, Moon, Volume2, X, AlertTriangle } from 'lucide-react';

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
  const [theme, setTheme] = useState('light');
  
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

  // Dark/Light Theme Manager
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
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

  // --- Voice Assistant HTML5 Engine ---
  const startSpeechRecognition = () => {
    setVoiceError('');
    setVoiceText('Listening...');
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
      // Cancel ongoing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceIntent = async (queryText) => {
    setVoiceText(`Analyzing: "${queryText}"`);
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

      // Execute Action Payload on Frontend
      setTimeout(() => {
        setIsListening(false);
        executeVoiceAction(data.action_type, data.action_payload);
      }, 3500); // Allow time to speak

    } catch (err) {
      setVoiceError("AI Assistant processing error.");
      setIsListening(false);
    }
  };

  const executeVoiceAction = (actionType, payload) => {
    if (!actionType || actionType === "UNKNOWN") return;

    switch (actionType) {
      case "SEARCH":
        setActiveTab("analysis");
        onSearchStock(payload.ticker);
        break;
      case "PREDICT":
        setActiveTab("analysis");
        onSearchStock(payload.ticker);
        // Custom search trigger will run details and predictions automatically
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
    <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
      
      {/* Dynamic Search Box */}
      <div className="w-96 relative" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search stock by company name or ticker..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
          />
        </form>

        {/* Search Suggestion Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden py-2 animate-fadeIn">
            {suggestions.map((item) => (
              <button
                key={item.ticker}
                onClick={() => handleSuggestionClick(item.ticker)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/20 last:border-0"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{item.ticker}</span>
                  <span className="text-xs text-slate-400 ml-2 truncate max-w-[200px] inline-block align-bottom">{item.name}</span>
                </div>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Equity
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Control Buttons (Mic, Theme, Profile) */}
      <div className="flex items-center gap-4">
        
        {/* Voice Assistant Button */}
        <button
          onClick={startSpeechRecognition}
          className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 transition-all group active:scale-95"
          title="Voice Assistant Search"
        >
          <Mic className="h-5 w-5 shrink-0 group-hover:scale-105 transition-transform" />
        </button>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors active:scale-95"
          title="Toggle Dark/Light Mode"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 shrink-0" />
          ) : (
            <Sun className="h-5 w-5 shrink-0" />
          )}
        </button>
      </div>

      {/* Voice Assistant Futuristic Overlay Panel */}
      {isListening && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative">
            <button
              onClick={stopSpeechRecognition}
              className="absolute right-6 top-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              <X className="h-5 w-5 shrink-0" />
            </button>

            <div className="mb-6 inline-flex items-center gap-1.5 p-3.5 bg-blue-500/10 rounded-3xl border border-blue-500/20">
              <Mic className="h-10 w-10 text-blue-500 animate-pulse-slow" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              AI Voice Assistant
            </h3>
            
            <p className="text-sm text-slate-400 mb-6">
              Ask for predictions, check portfolios, or navigate stock lists.
            </p>

            {/* Bouncing Audio Wave Visual */}
            {!assistantReply && !voiceError && (
              <div className="flex justify-center items-end h-10 mb-8">
                <div className="voice-bar"></div>
                <div className="voice-bar"></div>
                <div className="voice-bar"></div>
                <div className="voice-bar"></div>
                <div className="voice-bar"></div>
              </div>
            )}

            {assistantReply && (
              <div className="flex justify-center items-center gap-2 text-emerald-500 mb-6 animate-pulse-slow">
                <Volume2 className="h-6 w-6 shrink-0" />
                <span className="font-bold text-sm tracking-wider uppercase">Speaking Response</span>
              </div>
            )}

            {/* Transcription Log bubbles */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 rounded-2xl mb-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-bold">You Said</p>
              <p className="text-base text-slate-800 dark:text-slate-100 font-medium italic">
                {voiceText || "Say 'Predict Apple' or 'Show my Watchlist'"}
              </p>
            </div>

            {assistantReply && (
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/30 dark:border-blue-900/30 rounded-2xl text-left">
                <p className="text-xs text-blue-500 uppercase tracking-wider mb-2 font-bold">Assistant Response</p>
                <p className="text-sm text-slate-700 dark:text-slate-200 font-semibold leading-relaxed">
                  {assistantReply}
                </p>
              </div>
            )}

            {voiceError && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-500 dark:text-red-400 text-sm text-left">
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
