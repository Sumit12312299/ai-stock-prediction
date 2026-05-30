from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.app.core.config import settings
from backend.app.core.db import db_adapter
from backend.app.routers import auth, stocks, portfolio, watchlist, assistant

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Context manager to handle application startup and shutdown lifecycle events.
    Handles DB connections and cleanups asynchronously.
    """
    # Connect to Database (MongoDB or Fallback JSON DB)
    await db_adapter.connect()
    yield
    # Disconnect Database
    await db_adapter.disconnect()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="An industry-grade AI-powered financial prediction, news sentiment, and portfolio system.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
# Enables secure local development between React frontend (5173) and FastAPI backend (8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Modular Routers under API v1 prefix
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(stocks.router, prefix=settings.API_V1_STR)
app.include_router(portfolio.router, prefix=settings.API_V1_STR)
app.include_router(watchlist.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health Check"])
async def root_health_check():
    """Verify application status and database routing."""
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "database_mode": "MongoDB Cluster" if db_adapter.is_mongodb else "Local JSON Engine",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
