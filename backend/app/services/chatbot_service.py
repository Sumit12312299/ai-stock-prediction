from typing import Dict, List, Any
import re

class ChatbotService:
    def __init__(self):
        # A lookup table of responses for common terms
        self.finance_kb = {
            r"\b(lstm|long short term memory)\b": (
                "Long Short-Term Memory (LSTM) is a state-of-the-art Recurrent Neural Network (RNN) architecture. "
                "Unlike standard feed-forward networks, LSTMs have 'memory cells' and gating mechanisms "
                "(forget, input, and output gates) that prevent vanishing gradients. "
                "This allows LSTMs to capture long-term temporal dependencies in sequential data, "
                "making them highly effective for forecasting non-linear time-series like stock closing prices!"
            ),
            r"\b(moving average|ma|sma|ema)\b": (
                "Moving Averages (MA) smooth out short-term price fluctuations to filter noise and reveal trends. "
                "Our platform calculates the 50-day and 200-day Simple Moving Average. "
                "When a short-term MA (50-day) crosses above a long-term MA (200-day), it triggers a 'Golden Cross' (BULLISH signal). "
                "Conversely, when the 50-day MA crosses below the 200-day MA, it triggers a 'Death Cross' (BEARISH signal)."
            ),
            r"\b(r2|r-squared|coefficient of determination)\b": (
                "R-squared (R²) measures the proportion of variance in the actual stock prices that can be "
                "explained by our LSTM predictions. It ranges from 0 to 1 (or 0% to 100%). "
                "An R² of 0.85 means our AI model explains 85% of the price movements. "
                "Higher R² indicates strong fitting and reliability, though market anomalies can still occur."
            ),
            r"\b(portfolio|diversification)\b": (
                "A stock portfolio represents your collection of investment assets. "
                "Portfolio diversification involves spreading capital across non-correlated sectors (e.g., Tech, Finance, Healthcare) "
                "to minimize unsystematic risk. Our system calculates your real-time Profit/Loss percentage, average buy price, "
                "and total equity distribution to help you rebalance assets strategically."
            ),
            r"\b(sentiment|news sentiment|nlp)\b": (
                "News Sentiment Analysis uses Natural Language Processing (NLP) to parse headlines and summaries. "
                "Our backend uses TextBlob to assign positive or negative scores (-1.0 to +1.0) to articles. "
                "Analyzing collective news sentiment acts as an excellent leading indicator for market sentiment, "
                "preceding trading volume surges and retail buy-ins."
            ),
            r"\b(confidence|accuracy)\b": (
                "Prediction Confidence represents the model's reliability score. It is calculated dynamically "
                "by combining the R² coefficient, historical volatility of the asset, and model training convergence loss. "
                "A confidence score of 90%+ indicates a highly stable trend line, while a score under 75% indicates high market noise."
            ),
            r"\b(buy|sell|hold|recommendation)\b": (
                "Our recommendation system uses a dual-engine decision tree: "
                "1) The AI-predicted growth rate over the forecasted window (e.g., Buy if predicted return > 3%, Sell if < -3%, Hold otherwise). "
                "2) Technical indicator alignment (50-day vs 200-day Moving Average crossovers). "
                "Always combine AI predictions with personal risk parameters!"
            )
        }

    def generate_response(self, message: str) -> Dict[str, Any]:
        message_lower = message.lower().strip()
        
        # Check against knowledge base patterns
        for pattern, kb_response in self.finance_kb.items():
            if re.search(pattern, message_lower):
                return {
                    "response": kb_response,
                    "suggested_actions": ["Analyze Stock", "View Portfolio", "Learn LSTM Details"]
                }
                
        # Check if the user is asking about a specific stock prediction
        stock_match = re.search(r"\b(predict|forecast|predict price of)\s+([a-zA-Z]{1,5})\b", message_lower)
        if stock_match:
            ticker = stock_match.group(2).upper()
            return {
                "response": (
                    f"Certainly! I can run the LSTM prediction pipeline for **{ticker}**. "
                    "I will download its historical closing prices, scale them, train our sequential neural model, "
                    "and calculate future price trajectories with confidence intervals and Moving Average signals. "
                    "Would you like to trigger this prediction now?"
                ),
                "suggested_actions": [f"Predict {ticker}", "Search Stock Suggestions"]
            }

        # Check for greetings
        if any(greet in message_lower for greet in ["hello", "hi", "hey", "greetings", "good morning", "good afternoon"]):
            return {
                "response": (
                    "Hello! I am your AI Investment Assistant. 📈\n\n"
                    "I can help you:\n"
                    "1. Explain financial metrics (Moving Averages, P/E ratio, Market Cap).\n"
                    "2. Explain our AI models (LSTM architecture, R² metrics, scaling).\n"
                    "3. Guide you on managing your Portfolio and Watchlist.\n"
                    "4. Trigger a price forecast (e.g., 'Predict AAPL').\n\n"
                    "What stock or concept are we exploring today?"
                ),
                "suggested_actions": ["Predict AAPL", "Analyze TSLA Sentiment", "Explain LSTM"]
            }
            
        # Default smart response
        return {
            "response": (
                "Interesting question! As an AI Stock Advisor, I recommend checking a stock's fundamentals and sentiment "
                "before initiating trade setups. Our LSTM model excels at detecting cyclical sequence patterns. "
                "Try asking me things like:\n"
                "- 'What is an LSTM model?'\n"
                "- 'How do you calculate Moving Averages?'\n"
                "- 'Predict TSLA'\n"
                "- 'How do news sentiments affect stock prices?'"
            ),
            "suggested_actions": ["Explain LSTM", "Explain Moving Average", "Analyze AAPL Sentiment"]
        }

chatbot_service = ChatbotService()
