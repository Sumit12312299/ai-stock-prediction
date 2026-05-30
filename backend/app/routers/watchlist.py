from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.models.schemas import WatchlistAdd, WatchlistItem
from backend.app.core.db import db_adapter
from backend.app.services.stock_service import stock_service
from backend.app.routers.deps import get_current_user
from typing import List, Dict, Any
import datetime
import uuid

router = APIRouter(prefix="/watchlist", tags=["Watchlist Management"])

@router.get("/", response_model=List[WatchlistItem])
async def get_watchlist(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Any:
    """Fetch all saved stock watchlists for the logged user."""
    user_id = current_user["_id"]
    watchlist = await db_adapter.find_many("watchlist", {"user_id": user_id})
    return watchlist

@router.post("/add", response_model=WatchlistItem, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    item_in: WatchlistAdd,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Any:
    """Add a stock ticker to user's saved watchlist."""
    user_id = current_user["_id"]
    ticker = item_in.ticker.upper().strip()
    
    # Check if already bookmarked
    existing = await db_adapter.find_one("watchlist", {"user_id": user_id, "ticker": ticker})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{ticker} is already in your watchlist."
        )
        
    company_name = item_in.company_name or stock_service.get_company_name(ticker)
    
    # Create watchlist record
    watchlist_id = str(uuid.uuid4())
    watchlist_doc = {
        "_id": watchlist_id,
        "user_id": user_id,
        "ticker": ticker,
        "company_name": company_name,
        "added_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    # Save to database
    await db_adapter.insert_one("watchlist", watchlist_doc)
    return watchlist_doc

@router.delete("/remove/{ticker}", status_code=status.HTTP_200_OK)
async def remove_from_watchlist(
    ticker: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, str]:
    """Remove a bookmarked ticker from the watchlist."""
    user_id = current_user["_id"]
    ticker_clean = ticker.upper().strip()
    
    deleted = await db_adapter.delete_one("watchlist", {"user_id": user_id, "ticker": ticker_clean})
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{ticker_clean} was not found in your watchlist."
        )
        
    return {"message": f"Successfully removed {ticker_clean} from your watchlist."}
