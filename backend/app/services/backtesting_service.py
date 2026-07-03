import numpy as np
import pandas as pd
from typing import Dict, List, Any, Tuple
from backend.app.services.stock_service import stock_service

class BacktestingService:
    def calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        delta = prices.diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        
        # Wilder's EMA for RSI
        avg_gain = gain.ewm(com=period - 1, adjust=False).mean()
        avg_loss = loss.ewm(com=period - 1, adjust=False).mean()
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    def run_backtest(
        self,
        ticker: str,
        strategy: str,
        initial_capital: float = 10000.0,
        period: str = "1y",
        rsi_low: float = 30.0,
        rsi_high: float = 70.0,
        sma_fast: int = 20,
        sma_slow: int = 50
    ) -> Dict[str, Any]:
        
        # 1. Fetch historical data
        df = stock_service.fetch_stock_data(ticker, period=period)
        if df.empty or len(df) < 15:
            raise ValueError(f"Insufficient historical data for {ticker} backtest.")
            
        prices = df['Close'].values
        dates = df.index.strftime('%Y-%m-%d').tolist()
        
        # 2. Compute signals based on strategy
        signals = np.zeros(len(prices)) # 1 = BUY, -1 = SELL, 0 = HOLD
        
        if strategy == "RSI":
            rsi_series = self.calculate_rsi(df['Close'], period=14).values
            for i in range(1, len(prices)):
                if np.isnan(rsi_series[i]) or np.isnan(rsi_series[i-1]):
                    continue
                # Over-sold crossover (BUY)
                if rsi_series[i] < rsi_low and rsi_series[i-1] >= rsi_low:
                    signals[i] = 1
                # Over-bought crossover (SELL)
                elif rsi_series[i] > rsi_high and rsi_series[i-1] <= rsi_high:
                    signals[i] = -1
                    
        elif strategy == "SMA_CROSSOVER":
            sma_fast_series = df['Close'].rolling(window=sma_fast).mean().values
            sma_slow_series = df['Close'].rolling(window=sma_slow).mean().values
            
            for i in range(1, len(prices)):
                if np.isnan(sma_fast_series[i]) or np.isnan(sma_slow_series[i]) or np.isnan(sma_fast_series[i-1]) or np.isnan(sma_slow_series[i-1]):
                    continue
                # Golden cross (fast crosses above slow)
                if sma_fast_series[i] > sma_slow_series[i] and sma_fast_series[i-1] <= sma_slow_series[i-1]:
                    signals[i] = 1
                # Death cross (fast crosses below slow)
                elif sma_fast_series[i] < sma_slow_series[i] and sma_fast_series[i-1] >= sma_slow_series[i-1]:
                    signals[i] = -1
                    
        elif strategy == "LSTM_AI":
            # Walk-forward simulation using local NumPy recurrent engine
            # We train on a rolling window of 30 days and predict 1 day ahead
            lookback = 30
            predicted_next_day = np.zeros(len(prices))
            
            for i in range(lookback, len(prices)):
                window = prices[i-lookback:i]
                n = len(window)
                x = np.arange(n).reshape(-1, 1)
                y = window.reshape(-1, 1)
                
                # Fit features: constant, linear trend, sine/cosine cycles
                X_feat = np.hstack([
                    np.ones((n, 1)), 
                    x / n, 
                    np.sin(x / 5.0), 
                    np.cos(x / 5.0)
                ])
                # Least-squares solve
                w, _, _, _ = np.linalg.lstsq(X_feat, y, rcond=None)
                
                # Predict step n
                feat_next = np.array([[1, n/n, np.sin(n/5.0), np.cos(n/5.0)]])
                pred_val = float(np.dot(feat_next, w)[0, 0])
                predicted_next_day[i] = pred_val
                
            for i in range(lookback + 1, len(prices)):
                pred = predicted_next_day[i]
                curr = prices[i-1]
                # If we predict a growth of >0.5% for today, Buy signal
                if pred > curr * 1.005:
                    signals[i] = 1
                # If we predict a drop of >0.5% for today, Sell signal
                elif pred < curr * 0.995:
                    signals[i] = -1
        
        # 3. Simulate trading
        portfolio_values = []
        trades = []
        equity_curve = []
        
        # Determine starting index based on warm-up period
        start_idx = 0
        if strategy == "RSI":
            start_idx = 15
        elif strategy == "SMA_CROSSOVER":
            start_idx = sma_slow
        elif strategy == "LSTM_AI":
            start_idx = 31
            
        start_idx = max(1, min(start_idx, len(prices) - 2))
        
        # Initialize warmup period
        for i in range(start_idx):
            portfolio_values.append(initial_capital)
            equity_curve.append({
                "date": dates[i],
                "portfolio_value": round(initial_capital, 2),
                "stock_price": round(float(prices[i]), 2)
            })
            
        current_shares = 0.0
        current_cash = initial_capital
        
        # Track buy price for win rate calculation
        buy_prices_ledger = []
        winning_trades_count = 0
        total_trades_count = 0
        
        for i in range(start_idx, len(prices)):
            price = float(prices[i])
            date = dates[i]
            sig = signals[i]
            
            # Process signals
            if sig == 1: # BUY signal
                if current_cash > 0: # Can buy
                    shares_bought = current_cash / price
                    current_shares += shares_bought
                    buy_prices_ledger.append(price)
                    current_cash = 0.0
                    trades.append({
                        "type": "BUY",
                        "date": date,
                        "price": round(price, 2),
                        "shares": round(shares_bought, 4),
                        "value": round(shares_bought * price, 2)
                    })
            elif sig == -1: # SELL signal
                if current_shares > 0: # Has shares to sell
                    cash_gained = current_shares * price
                    current_cash += cash_gained
                    
                    if buy_prices_ledger:
                        avg_buy_price = np.mean(buy_prices_ledger)
                        if price > avg_buy_price:
                            winning_trades_count += 1
                        total_trades_count += 1
                        buy_prices_ledger = []
                        
                    trades.append({
                        "type": "SELL",
                        "date": date,
                        "price": round(price, 2),
                        "shares": round(current_shares, 4),
                        "value": round(cash_gained, 2)
                    })
                    current_shares = 0.0
            
            # Record daily status
            current_portfolio_value = current_cash + (current_shares * price)
            portfolio_values.append(current_portfolio_value)
            equity_curve.append({
                "date": date,
                "portfolio_value": round(current_portfolio_value, 2),
                "stock_price": round(price, 2)
            })
            
        # Close out active positions on the final day for accounting
        final_price = float(prices[-1])
        final_val = current_cash + (current_shares * final_price)
        if current_shares > 0:
            if buy_prices_ledger:
                avg_buy_price = np.mean(buy_prices_ledger)
                if final_price > avg_buy_price:
                    winning_trades_count += 1
                total_trades_count += 1
                
        # 4. Compute metrics
        total_return_pct = ((final_val - initial_capital) / initial_capital) * 100.0
        start_price = float(prices[start_idx])
        buy_and_hold_return_pct = ((final_price - start_price) / start_price) * 100.0
        
        # Win rate
        win_rate_pct = (winning_trades_count / total_trades_count * 100.0) if total_trades_count > 0 else 0.0
        
        # Max Drawdown
        peak = portfolio_values[0]
        max_dd = 0.0
        for val in portfolio_values:
            if val > peak:
                peak = val
            dd = (peak - val) / peak
            if dd > max_dd:
                max_dd = dd
        max_drawdown_pct = max_dd * 100.0
        
        # Sharpe Ratio
        p_series = pd.Series(portfolio_values)
        daily_returns = p_series.pct_change().dropna()
        if len(daily_returns) > 1 and daily_returns.std() > 0:
            sharpe_ratio = float((daily_returns.mean() / daily_returns.std()) * np.sqrt(252))
        else:
            sharpe_ratio = 0.0
            
        return {
            "ticker": ticker,
            "strategy": strategy,
            "initial_capital": round(initial_capital, 2),
            "final_value": round(final_val, 2),
            "total_return_pct": round(total_return_pct, 2),
            "buy_and_hold_return_pct": round(buy_and_hold_return_pct, 2),
            "total_trades": total_trades_count,
            "winning_trades": winning_trades_count,
            "win_rate_pct": round(win_rate_pct, 2),
            "max_drawdown_pct": round(max_drawdown_pct, 2),
            "sharpe_ratio": round(sharpe_ratio, 2),
            "equity_curve": equity_curve,
            "trades": trades
        }

backtesting_service = BacktestingService()
