# Viva Questions and Answers Guide 🎓💬

This guide is designed to prepare you for your major project viva presentation, defense, and placement interviews, focusing on the architectural, mathematical, and algorithmic layers of the **AI-Based Stock Market Prediction System**.

---

## 🧠 Section 1: Artificial Intelligence & Machine Learning Core

### Q1: What is an LSTM network, and how does it differ from a standard Recurrent Neural Network (RNN)?
**Answer**:  
A standard Recurrent Neural Network (RNN) processes sequences by passing historical information through hidden states. However, standard RNNs suffer from **Vanishing Gradients** during backpropagation over long sequences, meaning they quickly "forget" early inputs.  
**LSTM (Long Short-Term Memory)** networks solve this by introducing a **Cell State** ($C_t$) that acts as a highway for carrying long-term dependencies, and three specialized **Gating Mechanisms** that regulate information flow:
1. **Forget Gate ($f_t$)**: Decides what information to discard from the cell state using a sigmoid activation ($\sigma$).
2. **Input Gate ($i_t$) & Candidate State ($\tilde{C}_t$)**: Decides what new information to store in the cell state using a combination of sigmoid and tanh activations.
3. **Output Gate ($o_t$)**: Decides what the next hidden state ($h_t$) should be, filtering the updated cell state.

---

### Q2: Why did you scale/normalize the stock close price using MinMaxScaler? What is "Data Leakage"?
**Answer**:  
Stock closing prices can fluctuate wildly (e.g., Apple trading at \$170 while NVIDIA trades at \$900). LSTM cells use activation functions like $\tanh$ and $\text{sigmoid}$ which have saturated regions. Feeding large, unscaled values causes activation saturation, rendering learning inactive. We scale prices strictly between $[0, 1]$ using a **MinMax Scaler**:
$$x_{\text{scaled}} = \frac{x - x_{\text{min}}}{x_{\text{max}} - x_{\text{min}}}$$
**Data Leakage** occurs if we scale the entire dataset together before splitting it into train and validation sets. This leaks future validation bounds ($x_{\text{max}}$, $x_{\text{min}}$) into the training phase, leading to over-optimistic accuracy metrics. To prevent this, we fit the scaler strictly on training intervals.

---

### Q3: How do you evaluate your AI model's forecast accuracy, and what do your metrics mean?
**Answer**:  
We leverage three main standard mathematical indices:
1. **Coefficient of Determination ($R^2$)**: Tells us the proportion of stock price variance explained by our model. An $R^2$ of 0.88 means our LSTM captures 88% of the price movements.
2. **Root Mean Squared Error (RMSE)**: Calculates the standard deviation of our prediction errors. Because it squares the errors before averaging them, it heavily penalizes outlier errors:
   $$\text{RMSE} = \sqrt{\frac{1}{N}\sum_{i=1}^N (y_i - \hat{y}_i)^2}$$
3. **Mean Absolute Error (MAE)**: Measures the average magnitude of absolute differences between predicted and actual prices. It offers a direct, intuitive dollar-value error (e.g., MAE of 2.5 means our prediction is on average \$2.50 off).

---

### Q4: How does your dual ML Engine fallback structure operate?
**Answer**:  
Installing heavy deep-learning frameworks like **TensorFlow** on local university machines can be highly unreliable due to library mismatch, lack of precompiled Python 3.14 binaries, or slow downloads.  
To solve this, I custom-engineered a **Dual ML Engine** in `lstm_service.py`:
- It attempts to import and run a formal Keras-based sequential LSTM model.
- If TensorFlow is unavailable, it gracefully redirects to a custom **Mathematical Sequence Predictor** built in pure **NumPy**. This sequence solver fits a linear drift trend combined with exponential recurrent decaying states of residual errors on the historical dataset. It performs stable sequence forecasting on-the-fly and guarantees the app runs instantly and perfectly on any evaluator's computer!

---

### Q5: How is the confidence score calculated, and how does the recommendation system operate?
**Answer**:  
- **Confidence Score**: We calculate it by taking our model's $R^2$ coefficient score, factoring in the assets historical price volatility, and scaling the result between $65\%$ and $98.5\%$ to prevent unrealistic $100\%$ claims.
- **Recommendation Engine**: Uses a dual-engine decision tree:
  1. **AI Predicted growth rate**: If predicted price in $n$ days is higher than current price by $>3\%$, it triggers a **BUY**. If it drops by $<-3\%$, it triggers a **SELL**. Otherwise, it triggers a **HOLD**.
  2. **Technical indicators alignment**: Cross-checks if the stock trades above or below its **50-day Moving Average**, confirming the trend.

---

## 💻 Section 2: Backend & Web Engineering (FastAPI)

### Q6: Why did you choose FastAPI over Flask or Django?
**Answer**:  
1. **Speed and Performance**: FastAPI is built on top of **Starlette** and **Pydantic**, matching the speed of Go and NodeJS.
2. **Asynchronous Support**: Built natively to support `async` and `await` structures, making it highly efficient at running non-blocking database queries or parallelizing stock API lookups.
3. **Automated Documentation**: Instantly generates interactive OpenAPI documentation (`/docs` using Swagger UI), enabling rapid endpoint testing.
4. **Data Validation**: Leveraging Pydantic schemas, it validates request data types automatically at the gateway, returning standard 422 Unprocessable Entity errors when inputs fail constraints.

---

### Q7: What is the difference between WSGI and ASGI? Which does FastAPI use?
**Answer**:  
- **WSGI (Web Server Gateway Interface)**: A synchronous standard (used by Django and Flask). It processes requests one-by-one, blocking threads for long database operations.
- **ASGI (Asynchronous Server Gateway Interface)**: An asynchronous standard (used by FastAPI). It enables handling multiple connections concurrently (like WebSockets, long-polling, and HTTP/2) without locking threads. FastAPI runs on ASGI servers like **Uvicorn**.

---

### Q8: How did you secure your API routes?
**Answer**:  
I implemented a robust **JWT (JSON Web Token) Bearer authentication** flow:
1. When users submit credentials to `/auth/login`, we hash and verify their passwords using `passlib` with `bcrypt`.
2. Upon verification, we sign a JWT using the HMAC-SHA256 (`HS256`) algorithm with a secure, server-side secret key. The token payload contains the user's unique ID and an expiration duration.
3. Secure endpoints are mounted with a dependency `get_current_user`. This decodes the token from the request's authorization headers, validates its signature, and injects the authenticated profile into the route handler.

---

## 🗃️ Section 3: Database & Local Fallbacks

### Q9: Why did you choose MongoDB for this system?
**Answer**:  
MongoDB is a document-oriented NoSQL database. It is highly suitable for financial applications due to:
1. **Flexible Document Schema**: Portfolio transactions, watchlists, and predictions have structured yet fluid structures.
2. **JSON Compatibility**: MongoDB stores records natively in BSON (Binary JSON), mapping directly to our frontend React payloads and Pydantic schemas.
3. **Horizontal Scalability**: Excellent at sharding and scale distributions for handling massive real-time stock datasets.

---

### Q10: How does your database gracefully run without MongoDB installed?
**Answer**:  
University evaluators frequently run projects without setting up complex database servers. To solve this, I designed a **Database Adapter Class** in `db.py`:
- On startup, it attempts to connect to `mongodb://localhost:27017` with a low timeout.
- If it catches a connection timeout, it prints a console warning and **gracefully falls back to Local JSON database mode**, reading and writing documents into a thread-safe local file `mock_db.json`.
- The adapter translates standard MongoDB CRUD methods (`insert_one`, `find_one`, `find_many`, `update_one`, `delete_one`) to read/write arrays in this JSON ledger, meaning the entire system remains 100% functional without MongoDB!

---

## 🎤 Section 4: News Sentiments & Speech Integrations

### Q11: How does your sentiment analysis engine work under the hood?
**Answer**:  
It leverages **NLP news sentiment indexing**:
- It pulls financial news headlines and summaries associated with the target ticker (using a template generator fallback to bypass rate limits or offline states).
- It feeds these text sequences into a natural language engine (`TextBlob` or built-in tokenizers) to calculate **Polarity Scores** from $[-1.0, 1.0]$.
- A score $>0.15$ marks the article as **POSITIVE (Bullish)**, $<-0.15$ as **NEGATIVE (Bearish)**, and in-between as **NEUTRAL**.
- The service aggregates individual article scores to compute an overall stock sentiment score and confidence percent.

---

### Q12: How did you build the Voice Assistant without paid third-party APIs?
**Answer**:  
Paid Speech-to-Text and Text-to-Speech APIs are complex to integrate and cost-heavy. I built a futuristic **HTML5 browser-native voice loop**:
1. **Speech Recognition**: Uses browser-native Web Speech API (`SpeechRecognition` or `webkitSpeechRecognition`) to record user audio directly via the browser, yielding a text transcript client-side.
2. **Intent Processing**: Sends the transcript text to our FastAPI `/assistant/voice` endpoint. This parses keywords using regex/substring patterns to map intents: `SEARCH` (lookup stock), `PREDICT` (run forecast), `PORTFOLIO` (view holdings), or `ADD_WATCHLIST`.
3. **Speech Synthesis**: The backend returns a speech response string, which the frontend plays out-loud using the browser's native `SpeechSynthesisUtterance` interface, while automatically navigating the client dashboard to match the parsed intent!
