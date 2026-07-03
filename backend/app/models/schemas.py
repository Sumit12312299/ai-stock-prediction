from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Authentication Schemas ---

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    email: str

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    username: str
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)


# --- Watchlist Schemas ---

class WatchlistAdd(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=10)
    company_name: Optional[str] = None

class WatchlistItem(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    ticker: str
    company_name: str
    added_at: datetime

    model_config = ConfigDict(populate_by_name=True)


# --- Portfolio & Transaction Schemas ---

class TransactionCreate(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=10)
    company_name: str
    transaction_type: str = Field(..., pattern="^(BUY|SELL)$")
    shares: float = Field(..., gt=0)
    price: float = Field(..., gt=0)

class TransactionResponse(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    ticker: str
    company_name: str
    transaction_type: str
    shares: float
    price: float
    total_cost: float
    timestamp: datetime

    model_config = ConfigDict(populate_by_name=True)

class PortfolioItem(BaseModel):
    ticker: str
    company_name: str
    total_shares: float
    average_buy_price: float
    current_price: float
    total_cost: float
    current_value: float
    profit_loss: float
    profit_loss_pct: float


# --- Prediction Schemas ---

class StockPredictionRequest(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=10)
    days_to_predict: int = Field(default=7, ge=1, le=30)

class StockPredictionResponse(BaseModel):
    ticker: str
    company_name: str
    current_price: float
    predicted_prices: List[Dict[str, Any]]  # List of dicts with {"date": str, "price": float}
    historical_prices: List[Dict[str, Any]]
    confidence_score: float  # Percentage (e.g., 85.5)
    recommendation: str  # BUY, SELL, HOLD
    recommendation_reason: str
    moving_average_50: float
    moving_average_200: float
    r2_score: float
    rmse: float
    mae: float
    monte_carlo_upper: Optional[List[Dict[str, Any]]] = None
    monte_carlo_lower: Optional[List[Dict[str, Any]]] = None
    monte_carlo_median: Optional[List[Dict[str, Any]]] = None
    monte_carlo_samples: Optional[List[List[Dict[str, Any]]]] = None

# --- Stock Data & News Schemas ---

class StockSearchSuggestion(BaseModel):
    ticker: str
    name: str

class NewsSentimentItem(BaseModel):
    title: str
    source: str
    url: str
    published_at: str
    sentiment_score: float  # -1.0 to 1.0
    sentiment_label: str  # POSITIVE, NEGATIVE, NEUTRAL
    summary: str

class StockDetailsResponse(BaseModel):
    ticker: str
    company_name: str
    current_price: float
    change: float
    change_percent: float
    open: float
    high: float
    low: float
    volume: int
    market_cap: float
    pe_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    chart_data: List[Dict[str, Any]]
    news: List[NewsSentimentItem]
    sentiment_summary: Dict[str, Any] # e.g. {"overall": "POSITIVE", "score": 0.45}
    sentiment_trend: Optional[List[Dict[str, Any]]] = None


# --- Interactive Features ---

class ChatbotRequest(BaseModel):
    message: str

class ChatbotResponse(BaseModel):
    response: str
    suggested_actions: Optional[List[str]] = None

class VoiceAssistantRequest(BaseModel):
    voice_query: str

class VoiceAssistantResponse(BaseModel):
    spoken_text: str
    action_type: str  # "SEARCH", "PREDICT", "PORTFOLIO", "WATCHLIST", "CHAT", "UNKNOWN"
    action_payload: Optional[Dict[str, Any]] = None


# --- Backtesting Schemas ---

class BacktestRequest(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=10)
    strategy: str = Field(..., pattern="^(RSI|SMA_CROSSOVER|LSTM_AI)$")
    initial_capital: float = Field(default=10000.0, gt=0)
    period: str = Field(default="1y", pattern="^(1mo|3mo|6mo|1y|2y|5y)$")
    rsi_low: Optional[float] = Field(default=30.0, ge=0, le=100)
    rsi_high: Optional[float] = Field(default=70.0, ge=0, le=100)
    sma_fast: Optional[int] = Field(default=20, ge=1)
    sma_slow: Optional[int] = Field(default=50, ge=1)

class BacktestResponse(BaseModel):
    ticker: str
    strategy: str
    initial_capital: float
    final_value: float
    total_return_pct: float
    buy_and_hold_return_pct: float
    total_trades: int
    winning_trades: int
    win_rate_pct: float
    max_drawdown_pct: float
    sharpe_ratio: float
    equity_curve: List[Dict[str, Any]]  # List of {"date": str, "portfolio_value": float, "stock_price": float}
    trades: List[Dict[str, Any]]  # List of {"type": str, "date": str, "price": float, "shares": float, "value": float}

