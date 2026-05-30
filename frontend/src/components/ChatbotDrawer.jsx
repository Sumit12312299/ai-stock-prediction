import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Cpu, ChevronRight } from 'lucide-react';

export default function ChatbotDrawer({ token, onAnalyzeStock, voiceQuery, clearVoiceQuery }) {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your AI Investment Assistant. 📈\n\nI can provide structural explanations on LSTM modeling, technical indices like Moving Averages, or portfolio management. You can also ask me to trigger a price forecast by typing things like 'Predict TSLA'. What stock or concept are we exploring today?",
      actions: ["Explain LSTM", "Explain Moving Average", "Analyze AAPL Sentiment"]
    }
  ]);
  const [loading, setLoading] = useState(false);
  
  const bottomRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, loading]);

  // Handle queries passed from Voice assistant commands
  useEffect(() => {
    if (voiceQuery) {
      handleSendQuery(voiceQuery);
      clearVoiceQuery();
    }
  }, [voiceQuery]);

  const handleSendQuery = async (queryText) => {
    if (!queryText.trim()) return;

    // Add user message
    const nextLog = [...chatLog, { sender: 'user', text: queryText }];
    setChatLog(nextLog);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/assistant/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: queryText })
      });

      const data = await response.json();
      if (!response.ok) throw new Error("Advisor API failed");

      setChatLog(prev => [...prev, {
        sender: 'ai',
        text: data.response,
        actions: data.suggested_actions || []
      }]);

    } catch (err) {
      setChatLog(prev => [...prev, {
        sender: 'ai',
        text: "I apologize, I am experiencing communication difficulties with my analytical nodes. Please try again in a moment."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    // Check if action refers to a stock predict (e.g. "Predict AAPL")
    if (action.startsWith("Predict ") || action.startsWith("Analyze ")) {
      const parts = action.split(" ");
      const ticker = parts[parts.length - 1].toUpperCase();
      onAnalyzeStock(ticker);
    } else {
      // General question, submit directly to chatbot
      handleSendQuery(action);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendQuery(message);
    }
  };

  return (
    <div className="glass-panel border border-slate-100 dark:border-slate-800 flex flex-col h-[calc(100vh-12rem)] overflow-hidden animate-fadeIn">
      {/* Drawer Title Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
              AI Investment Advisor
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1.5 block">
              Direct Neural Interface
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active</span>
        </div>
      </div>

      {/* Message Bubbles Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chatLog.map((chat, index) => {
          const isAI = chat.sender === 'ai';
          return (
            <div 
              key={index} 
              className={`flex items-start gap-3.5 max-w-[85%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Bubble Avatar */}
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                isAI 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50'
              }`}>
                {isAI ? <Cpu className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>

              {/* Bubble text */}
              <div className="space-y-3">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isAI 
                    ? 'bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-850' 
                    : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                }`}>
                  <p className="whitespace-pre-line font-medium">{chat.text}</p>
                </div>

                {/* Suggested Action Chips (only on AI bubbles) */}
                {isAI && chat.actions && chat.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 animate-fadeIn">
                    {chat.actions.map((act) => (
                      <button
                        key={act}
                        onClick={() => handleActionClick(act)}
                        className="py-1.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all flex items-center gap-1"
                      >
                        <span>{act}</span>
                        <ChevronRight className="h-3 w-3 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing spinner indicator */}
        {loading && (
          <div className="flex items-start gap-3.5 mr-auto max-w-[80%]">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0 animate-pulse">
              <Cpu className="h-5 w-5" />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* Input Message Panel */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2.5 items-center bg-slate-50/50 dark:bg-slate-950/20">
        <input
          type="text"
          placeholder="Ask me a question or type 'Predict TSLA'..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 px-4 py-3 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm placeholder-slate-400 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 transition-colors"
        />
        <button
          onClick={() => handleSendQuery(message)}
          disabled={!message.trim() || loading}
          className="p-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-lg shadow-emerald-500/15 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center"
        >
          <Send className="h-5 w-5 shrink-0" />
        </button>
      </div>
    </div>
  );
}
