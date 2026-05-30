# AI-Based Stock Market Prediction System 📈🧠

An industry-grade, major final-year project bridging sequential deep learning (LSTM networks) with natural language news sentiment analysis and responsive portfolio tracking.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://tensorflow.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

---

## 🚀 Key Functional Systems

1. **Sequential Forecasting Core (LSTM/RNN)**: Trains an LSTM neural net on closing trade sequences. Gracefully falls back to a custom-engineered high-fidelity NumPy Recurrent sequence solver to guarantee 100% operation on any hardware.
2. **NLP News Sentiment Ledger**: Fetches financial articles and runs them through a natural language processing (`TextBlob`) engine to calculate exact sentiment polarities, directly guiding trade advice.
3. **Aggregated Portfolio tracking**: Dynamic purchase and sale logs with weighted average cost basis calculations and real-time valuation updates.
4. **Interactive Voice Assistant**: Leverages browser-native HTML5 SpeechRecognition and SpeechSynthesis to parse vocal transcripts, speak responses, and trigger dashboard actions.
5. **PDF Research Exports**: Generates and downloads double-column professional market analysis reports utilizing the `ReportLab` engine.

---

## 🗃️ Directory Structure

```text
ai-stock-prediction/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py         # App configuration settings
│   │   │   ├── db.py             # MongoDB & thread-safe JSON DB Adapter
│   │   │   └── security.py       # Password hashing & JWT generators
│   │   ├── models/
│   │   │   └── schemas.py        # Pydantic request/response validations
│   │   ├── routers/
│   │   │   ├── auth.py           # Login, Register & Swagger authentication
│   │   │   ├── stocks.py         # Chart data, LSTM & report streaming
│   │   │   ├── portfolio.py      # Transactions aggregators
│   │   │   ├── watchlist.py      # User bookmarks controller
│   │   │   └── assistant.py      # AI chatbot & Voice assistant
│   │   ├── services/
│   │   │   ├── lstm_service.py   # TensorFlow & NumPy prediction cores
│   │   │   ├── stock_service.py  # yfinance crawler & Brownian Walk simulator
│   │   │   ├── sentiment_service.py # NLP News text blob scoring
│   │   │   ├── chatbot_service.py   # Interactive financial Q&A KB
│   │   │   ├── voice_service.py     # Speech intent classification
│   │   │   └── pdf_service.py    # ReportLab layout engine
│   │   └── main.py               # FastAPI entry lifecycle file
│   └── requirements.txt          # Python dependency requirements
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx          # Login/Register Glassmorphic views
│   │   │   ├── Sidebar.jsx       # Dark navigation drawer
│   │   │   ├── Header.jsx        # debounced suggestions & Speech assistant
│   │   │   ├── Overview.jsx      # Stat cards & formula theory boards
│   │   │   ├── StockAnalysis.jsx # Recharts dual graph & NLP News sent
│   │   │   ├── PortfolioManager.jsx # Trades & allocations PieCharts
│   │   │   ├── WatchlistManager.jsx # bookmark drawers
│   │   │   └── ChatbotDrawer.jsx  # Suggested action chip dialogs
│   │   ├── App.jsx               # Orchestration & State controllers
│   │   └── index.css             # Outfitters fonts & wave keyframes
│   ├── index.html                # SEO meta head definitions
│   ├── tailwind.config.js        # Dark mode & custom palettes config
│   └── package.json              # UI dependencies
│
└── deliverables/                 # PPT presentation, report, & Viva questions
```

---

## 📈 Academic Mathematical Framework

### Simple Moving Average (SMA)
Calculated to smooth trade price movements and isolate trend direction over a time horizon $n$:
$$\text{SMA} = \frac{P_1 + P_2 + \dots + P_n}{n}$$

### Linear Regression Least-Squares
Solves the trend-fitting coefficient weights ($y = mx + c$) across business day index sequences:
$$m = \frac{n\sum(xy) - \sum x\sum y}{n\sum(x^2) - (\sum x)^2}$$
$$c = \frac{\sum y - m\sum x}{n}$$

---

## 🛠️ Step-by-Step Installation Manual

### 1. Prerequisites
- **Python**: v3.8 or higher.
- **Node.js**: v18.0 or higher.
- **MongoDB**: (Optional) Connection fallback defaults automatically to local thread-safe JSON files, ensuring zero config launch!

### 2. Backend Setup
Navigate to the `backend/` directory, create a virtual environment, and install dependencies:
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # On Windows PowerShell
# source venv/bin/activate  # On Linux/macOS
pip install -r requirements.txt
```

Launch the FastAPI uvicorn server:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Interactive docs will load at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup
Navigate to the `frontend/` directory and install packages:
```bash
cd ../frontend
npm install
```

Launch the React Vite server:
```bash
npm run dev
```
Open your web browser at: [http://localhost:5173](http://localhost:5173)

---

## 📄 License & Disclaimer
This system is developed as an academic major final year showcase. All algorithmic predictions are probabilistic forecasts based on sequence trends and do not constitute professional investment trading advice.
