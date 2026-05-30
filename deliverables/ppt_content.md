# PowerPoint Presentation (PPT) Content 📊🖥️

Use this slide-by-slide structure to build your final year project presentation in PowerPoint or Google Slides.

---

### 🎬 Slide 1: Title Slide
* **Slide Title**: AI-Based Stock Market Prediction System
* **Subtitle**: Integrated Deep Learning Sequence Forecasting, News NLP Sentiments & Portfolio Management
* **Presented By**: [Your Name & Roll Number]
* **Course**: B.Tech / MCA Final Year Major Project
* **Under the Guidance of**: [Supervisor Name & Designation]

---

### ⚠️ Slide 2: Problem Statement
* **The Challenges in Financial Markets**:
  * Stock markets are highly non-linear, volatile, and driven by complex time-series sequences.
  * Traditional models (e.g., ARIMA, Linear Regression) struggle to capture deep, non-linear relationships.
  * Stock pricing is not just driven by numbers; it is heavily influenced by **public news sentiment** and macroeconomic narratives.
  * Lack of integrated platforms combining AI forecasting, sentiment scoring, and simulated portfolio tracking in a single modern interface.

---

### 🎯 Slide 3: Project Objectives
* **What our system achieves**:
  * Develop an **LSTM Neural Network** to forecast future closing prices based on historical sequences.
  * Build a **Natural Language Processing (NLP)** engine to perform real-time financial news sentiment analysis.
  * Implement an active **Portfolio Tracking Ledger** to aggregate buy/sell transactions and calculate returns.
  * Support interactive features: **AI Chatbot** for investor Q&A and an **HTML5 Voice Assistant** for hands-free navigation.
  * Generate exportable **PDF Market Analysis Reports** using standard document layout engines.

---

### 🛠️ Slide 4: System Technology Stack
* **Frontend**:
  * React.js (Component-driven responsive SPA)
  * Tailwind CSS (Futuristic glassmorphism theme)
  * Recharts / Chart.js (Responsive market charts & donut allocations)
* **Backend**:
  * FastAPI (Async high-performance Python ASGI framework)
  * JWT Auth (HMAC-SHA256 bearer session locks)
* **AI/ML Core**:
  * TensorFlow & Keras (LSTM sequence modeling)
  * Pandas & NumPy (Data normalizers & sequence vectoring)
  * TextBlob (NLP news polarity scoring)
* **Database**:
  * MongoDB (Document NoSQL) / Thread-Safe JSON Fallback Engine

---

### 🎨 Slide 5: System Architecture
* **Data Flow Model**:
```text
  [yfinance API] ───> [Stock Service] ───> [MinMax Scaler] ───> [LSTM Model] ───> [Future Forecasts]
                                                                                      │
  [News Feed]    ───> [Sentiment NLP] ───> [TextBlob Polarity] ───────────────────────┼──> [Decision Engine]
                                                                                      │      (BUY/SELL/HOLD)
  [React UI]     <─── [FastAPI REST]  <─── [Database Adapter] <─── [MongoDB / JSON] <─┘
```
* High degree of decoupling between service handlers and API routers ensures extreme scalability.

---

### 🧠 Slide 6: AI/ML Sequence Forecasting (LSTM)
* **LSTM (Long Short-Term Memory) Architecture**:
  * Addresses standard RNN's Vanishing Gradients using memory cells and gating controls.
  * **Forget Gate**: $f_t = \sigma(W_f x_t + U_f h_{t-1} + b_f)$
  * **Input Gate**: $i_t = \sigma(W_i x_t + U_i h_{t-1} + b_i)$
  * **Output Gate**: $o_t = \sigma(W_o x_t + U_o h_{t-1} + b_o)$
  * **Historical Lookback Sequence**: 30 days of trading records scaled via MinMaxScaler between $[0, 1]$.
  * Output returns future $N$-day price projections.

---

### 📊 Slide 7: Model Evaluation Metrics
* **Evaluating Model Fit (In-Sample Fits)**:
  * **R-Squared ($R^2$)**: Represents the proportion of close price variance captured by our network (targeted fit $>85\%$).
  * **Root Mean Squared Error (RMSE)**: Calculates standard deviation of fitting errors, heavily penalizing outliers.
  * **Mean Absolute Error (MAE)**: Measures absolute model price deviations, offering intuitive error summaries in dollars.
  * Dual-Engine fallback ensures custom **NumPy sequence models** predict flawlessly when TensorFlow is not available.

---

### 📰 Slide 8: NLP News Sentiment Ledger
* **Quantifying Market Sentiment**:
  * Crawls recent stock news associated with the ticker.
  * **TextBlob NLP Classifier**: Evaluates headlines and descriptions for polarity scores:
    * Positive Polarity ($>+0.15$): **POSITIVE (Bullish)**
    * Negative Polarity ($<-0.15$): **NEGATIVE (Bearish)**
    * In-between: **NEUTRAL**
  * Overall average sentiment builds a **verdict score** which direct inputs the decision recommendations.

---

### 💼 Slide 9: Portfolio & Transaction Management
* **Simulated Brokerage System**:
  * **Transaction Ledger**: Logs all BUY/SELL orders with execution volumes, price basis, and timestamps.
  * **Summary Aggregator**: Groups transactions by asset ticker to compute:
    * Total shares held.
    * Weighted cost basis (average buy rate).
    * Current valuation (live price * shares held).
    * Dynamic portfolio profit/loss dollar margins and percentage returns.
    * Capital weights displayed in an interactive donut PieChart.

---

### 🗣️ Slide 10: Interactive Assistants
* **AI Chatbot**:
  * Financial Q&A helper.
  * Answers core conceptual definitions (LSTM cells, Moving Averages crossover, R² fitting) and suggests actionable dashboard tags.
* **HTML5 Voice Assistant**:
  * Binds browser-native SpeechRecognition to compile audio transcriptions.
  * API processes intents (`SEARCH`, `PREDICT`, `PORTFOLIO`).
  * Speaks replies using browser's `SpeechSynthesis` and triggers automated layout navigation tabs.

---

### 📄 Slide 11: Export Reports as PDF
* **ReportLab Document Engine**:
  * Programmatically builds professional technical analysis briefs in-memory.
  * Contains executive recommendation callouts, key performance highlight tables (Market Cap, P/E ratio, MA crossover), model accuracy tables, and predicted future prices arrays.
  * Streams PDF binaries directly to browser clients.

---

### 📁 Slide 12: MongoDB Schema Structure
* **Decoupled Documents Collections**:
  * **Users**: `_id`, `email`, `username`, `hashed_password`, `created_at`
  * **Transactions**: `_id`, `user_id`, `ticker`, `company_name`, `transaction_type` (BUY/SELL), `shares`, `price`, `total_cost`, `timestamp`
  * **Watchlist**: `_id`, `user_id`, `ticker`, `company_name`, `added_at`
  * **Predictions**: `_id`, `ticker`, `forecast_dates`, `predicted_prices`, `confidence`, `r2_score`, `created_at`

---

### 📈 Slide 13: Core System Achievements
* **Key Achievements & Project Highlights**:
  * Seamless **MongoDB connection auto-fallback** to local JSON files guarantees zero-configuration launches.
  * **Dual AI prediction models** (TensorFlow & pure NumPy sequences) ensure the model works on any system.
  * Hands-free web-browser voice command dashboard.
  * Curated finance brand aesthetic featuring glassmorphism and animated card layouts.

---

### 🔮 Slide 14: Future Project Upgrades
* **Scalable Enhancements**:
  * Support multi-variate LSTM forecasting (incorporating Volume, MACD, and news sentiment vectors directly into the neural network input layers).
  * Real-time trade routing via broker API links.
  * Push alerts for target price triggers.
  * Advanced NLP transformers (e.g. FinBERT fine-tuned model) for sentiment analysis.

---

### 🏁 Slide 15: Conclusion & References
* **Conclusion**:
  * Successfully built an industry-grade, responsive AI-based stock prediction suite that fuses quantitative sequential deep learning forecasts with qualitative natural language news sentiments.
* **References**:
  * Hochreiter, S., & Schmidhuber, J. (1997). Long Short-Term Memory.
  * FastAPI, React, and TensorFlow official guidelines.
  * Yahoo Finance API integrations.
