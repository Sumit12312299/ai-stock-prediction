from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.models.schemas import TransactionCreate, TransactionResponse, PortfolioItem
from backend.app.core.db import db_adapter
from backend.app.services.stock_service import stock_service
from backend.app.routers.deps import get_current_user
from typing import List, Dict, Any
import datetime
import uuid

router = APIRouter(prefix="/portfolio", tags=["Portfolio Management"])

@router.post("/transaction", response_model=TransactionResponse)
async def execute_transaction(
    tx_in: TransactionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Any:
    """Execute a BUY or SELL transaction, storing it in the ledger and updating holdings."""
    user_id = current_user["_id"]
    ticker = tx_in.ticker.upper().strip()
    
    # Validation for SELL transactions
    if tx_in.transaction_type == "SELL":
        # Aggregate current holdings to check if the user has enough shares to sell
        user_txs = await db_adapter.find_many("transactions", {"user_id": user_id, "ticker": ticker})
        net_shares = 0.0
        for tx in user_txs:
            if tx["transaction_type"] == "BUY":
                net_shares += tx["shares"]
            elif tx["transaction_type"] == "SELL":
                net_shares -= tx["shares"]
                
        if net_shares < tx_in.shares:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient holdings. You own {net_shares} shares of {ticker}, but tried to sell {tx_in.shares}."
            )
            
    # Create transaction document
    tx_id = str(uuid.uuid4())
    total_cost = float(tx_in.shares * tx_in.price)
    
    tx_doc = {
        "_id": tx_id,
        "user_id": user_id,
        "ticker": ticker,
        "company_name": tx_in.company_name,
        "transaction_type": tx_in.transaction_type,
        "shares": float(tx_in.shares),
        "price": float(tx_in.price),
        "total_cost": round(total_cost, 2),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    # Store in DB
    await db_adapter.insert_one("transactions", tx_doc)
    return tx_doc

@router.get("/transactions", response_model=List[TransactionResponse])
async def get_transaction_history(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Any:
    """Fetch the logged chronological list of buy and sell transactions executed by the user."""
    user_id = current_user["_id"]
    txs = await db_adapter.find_many("transactions", {"user_id": user_id})
    # Sort transactions chronologically, newest first
    txs.sort(key=lambda x: x["timestamp"], reverse=True)
    return txs

@router.get("/summary")
async def get_portfolio_summary(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Aggregate transaction ledgers to construct a live summary of held equities, average buy prices,
    market valuation, and profit/loss margins.
    """
    user_id = current_user["_id"]
    txs = await db_adapter.find_many("transactions", {"user_id": user_id})
    
    # Group transactions by stock ticker
    holdings: Dict[str, Dict[str, Any]] = {}
    for tx in txs:
        ticker = tx["ticker"]
        if ticker not in holdings:
            holdings[ticker] = {
                "ticker": ticker,
                "company_name": tx["company_name"],
                "buy_records": [] # Keeps track of buys to calculate weighted cost basis
            }
        holdings[ticker]["buy_records"].append(tx)

    portfolio_items: List[PortfolioItem] = []
    total_invested = 0.0
    total_current_value = 0.0
    
    for ticker, hold_data in holdings.items():
        net_shares = 0.0
        weighted_cost = 0.0
        
        # Chronological sorting to compute weighted average cost basis
        records = sorted(hold_data["buy_records"], key=lambda x: x["timestamp"])
        
        for rec in records:
            if rec["transaction_type"] == "BUY":
                # Average buy price update
                weighted_cost += rec["shares"] * rec["price"]
                net_shares += rec["shares"]
            elif rec["transaction_type"] == "SELL":
                # Deduct shares at average buy price
                if net_shares > 0:
                    avg_cost_basis = weighted_cost / net_shares
                    net_shares -= rec["shares"]
                    weighted_cost = net_shares * avg_cost_basis
                else:
                    net_shares = 0
                    weighted_cost = 0.0
                    
        # Skip stock if completely liquidated
        if net_shares <= 0.0001:
            continue
            
        avg_buy_price = weighted_cost / net_shares if net_shares > 0 else 0.0
        
        # Fetch current stock price (live or simulated)
        try:
            # We fetch minimal historical data (1mo) to extract current price fast
            market_df = stock_service.fetch_stock_data(ticker, period="1mo")
            current_price = float(market_df.iloc[-1]['Close'])
        except Exception:
            current_price = avg_buy_price  # Fallback to cost if service fails
            
        total_cost = net_shares * avg_buy_price
        current_value = net_shares * current_price
        profit_loss = current_value - total_cost
        profit_loss_pct = (profit_loss / total_cost * 100.0) if total_cost else 0.0
        
        portfolio_items.append(PortfolioItem(
            ticker=ticker,
            company_name=hold_data["company_name"],
            total_shares=round(net_shares, 4),
            average_buy_price=round(avg_buy_price, 2),
            current_price=round(current_price, 2),
            total_cost=round(total_cost, 2),
            current_value=round(current_value, 2),
            profit_loss=round(profit_loss, 2),
            profit_loss_pct=round(profit_loss_pct, 2)
        ))
        
        total_invested += total_cost
        total_current_value += current_value
        
    overall_pl = total_current_value - total_invested
    overall_pl_pct = (overall_pl / total_invested * 100.0) if total_invested else 0.0
    
    return {
        "items": portfolio_items,
        "totals": {
            "total_invested": round(total_invested, 2),
            "total_current_value": round(total_current_value, 2),
            "overall_profit_loss": round(overall_pl, 2),
            "overall_profit_loss_percent": round(overall_pl_pct, 2)
        }
    }
