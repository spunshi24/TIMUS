# TiMUS Backend - Real Market Data API

This is the Python Flask backend that provides **REAL live market data** from Yahoo Finance to the TiMUS trading simulator.

## 🚀 Setup Instructions

### 1. Create Virtual Environment (Recommended)

```bash
cd backend
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Server

```bash
python app.py
```

The API will be available at: **http://localhost:5000**

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Check if the server is running.

### Get Stock Quote
```
GET /api/quote/<ticker>
Example: GET /api/quote/AAPL
```
Returns current price, volume, market cap, P/E ratio, and more.

### Get Historical Data
```
GET /api/history/<ticker>?period=1d&interval=5m
Example: GET /api/history/AAPL?period=1d&interval=5m
```
Returns historical price data for charts.

**Parameters:**
- `period`: 1d, 5d, 1mo, 3mo, 1y
- `interval`: 1m, 5m, 15m, 1h, 1d

### Get Live Price (Lightweight)
```
GET /api/live/<ticker>
Example: GET /api/live/TSLA
```
Returns just the current price - optimized for frequent updates.

### Search Ticker
```
GET /api/search?q=AAPL
```
Search for stock tickers.

## 🔥 Features

- ✅ **Real-time data** from Yahoo Finance
- ✅ **Caching** to avoid rate limits
- ✅ **CORS enabled** for frontend
- ✅ **Multiple intervals** (1min, 5min, 1hour, 1day)
- ✅ **Rich data**: P/E ratio, market cap, 52-week high/low, beta

## 🛠️ Troubleshooting

**Problem:** `Module not found: yfinance`
**Solution:** Make sure you activated the virtual environment and ran `pip install -r requirements.txt`

**Problem:** `Port 5000 already in use`
**Solution:** Change the port in `app.py` (line 174): `app.run(port=5001)`

**Problem:** No data for ticker
**Solution:** Make sure the ticker symbol is correct (e.g., AAPL, TSLA, BTC-USD)
