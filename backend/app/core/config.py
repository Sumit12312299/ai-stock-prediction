import os

class Settings:
    PROJECT_NAME: str = "AI Stock Market Prediction System"
    API_V1_STR: str = "/api/v1"
    
    # JWT Security Configuration
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super-secret-stock-trading-ai-key-change-in-prod-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days

    # MongoDB Configuration
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "stock_prediction_db")
    
    # Local JSON fallback storage config (if MongoDB is not available)
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    MOCK_DB_FILE: str = os.path.join(DATA_DIR, "mock_db.json")

    # External APIs
    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")

settings = Settings()

# Ensure data directory exists
os.makedirs(settings.DATA_DIR, exist_ok=True)
