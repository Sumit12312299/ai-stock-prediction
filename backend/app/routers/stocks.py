from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from backend.app.models.schemas import StockSearchSuggestion, StockDetailsResponse, StockPredictionResponse
from backend.app.services.stock_service import stock_service
from backend.app.services.lstm_service import lstm_prediction_engine
from backend.app.services.pdf_service import pdf_report_service
from backend.app.routers.deps import get_current_user
from typing import List, Any
import datetime

router = APIRouter(prefix="/stocks", tags=["Stock Market Operations"])

@router.get("/suggestions", response_model=List[StockSearchSuggestion])
async def get_suggestions(
    q: str = Query("", description="Query keyword (ticker or company name)"),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Any:
    """Search stock autocomplete suggestions by ticker or company name."""
    return stock_service.search_suggestions(q)

@router.get("/details/{ticker}", response_model=StockDetailsResponse)
async def get_stock_details(
    ticker: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Any:
    """Fetch current prices, financial indices, charts, and news sentiment vectors for a ticker."""
    ticker_clean = ticker.upper().strip()
    try:
        details = stock_service.fetch_stock_details(ticker_clean)
        return details
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stock ticker '{ticker_clean}' could not be processed: {str(e)}"
        )

@router.get("/predict/{ticker}", response_model=StockPredictionResponse)
async def predict_stock(
    ticker: str,
    days: int = Query(7, ge=1, le=30, description="Number of days in the future to forecast"),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Any:
    """Train sequential neural network (LSTM/RNN) and return future forecasts, evaluation metrics, and trading advice."""
    ticker_clean = ticker.upper().strip()
    try:
        # Fetch historical prices (1y data to ensure good training sequence window)
        df = stock_service.fetch_stock_data(ticker_clean, period="1y")
        if df.empty or len(df) < 10:
            raise ValueError("Insufficient historical trading data to train the model.")
            
        company_name = stock_service.get_company_name(ticker_clean)
        
        # Train and forecast close prices
        prediction = lstm_prediction_engine.predict(
            ticker=ticker_clean,
            company_name=company_name,
            historical_df=df,
            days_to_predict=days
        )
        return prediction
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI predictions for '{ticker_clean}': {str(e)}"
        )

@router.get("/report/{ticker}")
async def export_pdf_report(
    ticker: str,
    days: int = Query(7, ge=1, le=30, description="Forecast horizon inside the PDF"),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> StreamingResponse:
    """Generate and export a beautifully compiled PDF research and analysis report for a stock."""
    ticker_clean = ticker.upper().strip()
    try:
        # 1. Fetch details
        details = stock_service.fetch_stock_details(ticker_clean)
        
        # 2. Fetch predictions
        df = stock_service.fetch_stock_data(ticker_clean, period="1y")
        predictions = lstm_prediction_engine.predict(
            ticker=ticker_clean,
            company_name=details["company_name"],
            historical_df=df,
            days_to_predict=days
        )
        
        # 3. Generate PDF Report in memory
        pdf_stream = pdf_report_service.generate_stock_report(details, predictions)
        
        # 4. Stream response
        filename = f"{ticker_clean}_AI_Analysis_Report.pdf"
        return StreamingResponse(
            pdf_stream,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not generate PDF report for '{ticker_clean}': {str(e)}"
        )
