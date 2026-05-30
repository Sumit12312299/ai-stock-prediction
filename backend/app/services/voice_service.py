from typing import Dict, Any, Tuple
import re

class VoiceService:
    def __init__(self):
        # Maps company colloquial names to tickers
        self.name_to_ticker = {
            "apple": "AAPL",
            "microsoft": "MSFT",
            "google": "GOOGL",
            "alphabet": "GOOGL",
            "amazon": "AMZN",
            "tesla": "TSLA",
            "nvidia": "NVDA",
            "meta": "META",
            "facebook": "META",
            "netflix": "NFLX",
            "amd": "AMD",
            "intel": "INTC",
            "jpmorgan": "JPM",
            "chase": "JPM",
            "visa": "V",
            "disney": "DIS",
            "walmart": "WMT",
            "nike": "NKE",
            "oracle": "ORCL",
            "paypal": "PYPL",
            "salesforce": "CRM",
            "alibaba": "BABA"
        }

    def parse_ticker(self, text: str) -> Tuple[str, str]:
        """Extract a stock ticker or company name from voice text."""
        words = text.lower().split()
        
        # Look for explicit company colloquial name matches
        for word in words:
            if word in self.name_to_ticker:
                ticker = self.name_to_ticker[word]
                return ticker, word.capitalize()
                
        # Look for uppercase/direct ticker matches (e.g., "AAPL", "TSLA")
        for word in words:
            cleaned = re.sub(r'[^a-zA-Z]', '', word).upper()
            if cleaned in ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX", "AMD", "INTC", "JPM", "V", "DIS", "WMT", "NKE", "ORCL", "PYPL", "CRM", "BABA"]:
                return cleaned, cleaned
                
        # Fallback to last word if it's 1-5 letters
        if len(words) > 0:
            last_word = re.sub(r'[^a-zA-Z]', '', words[-1]).upper()
            if 1 <= len(last_word) <= 5:
                return last_word, last_word
                
        return "AAPL", "Apple"

    def process_voice_query(self, query: str) -> Dict[str, Any]:
        """Parse voice query, map to actions, and return spoken text response."""
        q_clean = query.lower().strip()
        
        # Intent 1: PREDICT / FORECAST
        if any(keyword in q_clean for keyword in ["predict", "forecast", "future", "tomorrow", "next week"]):
            ticker, name = self.parse_ticker(q_clean)
            return {
                "spoken_text": f"Running the LSTM neural model on historical sequences for {name}. Processing predictions, metrics, and recommendations.",
                "action_type": "PREDICT",
                "action_payload": {
                    "ticker": ticker,
                    "company_name": f"{name} Inc."
                }
            }
            
        # Intent 2: SEARCH / ANALYZE / SHOW DETAILS
        if any(keyword in q_clean for keyword in ["search", "show", "analyze", "lookup", "price", "sentiment", "chart"]):
            ticker, name = self.parse_ticker(q_clean)
            return {
                "spoken_text": f"Searching market details and news sentiment profiles for {name}.",
                "action_type": "SEARCH",
                "action_payload": {
                    "ticker": ticker
                }
            }
            
        # Intent 3: PORTFOLIO
        if any(keyword in q_clean for keyword in ["portfolio", "investments", "holdings", "my stocks", "profit", "loss"]):
            return {
                "spoken_text": "Opening your portfolio ledger. Showing holdings, average buy rates, and current profit and loss margins.",
                "action_type": "PORTFOLIO",
                "action_payload": {}
            }
            
        # Intent 4: WATCHLIST
        if any(keyword in q_clean for keyword in ["watchlist", "favorites", "saved"]):
            # Check if user wants to ADD to watchlist
            if "add" in q_clean:
                ticker, name = self.parse_ticker(q_clean)
                return {
                    "spoken_text": f"Adding {name} ticker to your favorite stocks watchlist.",
                    "action_type": "ADD_WATCHLIST",
                    "action_payload": {
                        "ticker": ticker,
                        "company_name": f"{name} Inc."
                    }
                }
            return {
                "spoken_text": "Opening your real-time stock watchlist.",
                "action_type": "WATCHLIST",
                "action_payload": {}
            }

        # Intent 5: CHATBOT / EXPLAIN QUESTIONS
        if any(keyword in q_clean for keyword in ["what is", "how do you", "explain", "why"]):
            return {
                "spoken_text": "Forwarding this market query to the AI Investment Chatbot for complete guidance.",
                "action_type": "CHAT",
                "action_payload": {
                    "message": query
                }
            }

        # Unknown fallback
        return {
            "spoken_text": f"I heard: '{query}'. You can say 'Predict Tesla', 'Show Portfolio', 'Show Watchlist' or 'Search Apple'. How can I help you?",
            "action_type": "UNKNOWN",
            "action_payload": {}
        }

voice_service = VoiceService()
