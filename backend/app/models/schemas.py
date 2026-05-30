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
