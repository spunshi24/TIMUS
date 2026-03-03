"""
TiMUS Backend - Flask API with Yahoo Finance Integration
This provides REAL live market data to the frontend
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
from datetime import datetime, timedelta
import time

app = Flask(__name__)
CORS(app)  # Allow frontend to make requests

# Cache to avoid hitting Yahoo Finance too frequently
cache = {}
CACHE_DURATION = 5  # seconds

def get_cached_or_fetch(key, fetch_func, *args):
    """Simple cache mechanism to avoid rate limits"""
    now = time.time()
    if key in cache:
        data, timestamp = cache[key]
        if now - timestamp < CACHE_DURATION:
            return data
    
    data = fetch_func(*args)
    cache[key] = (data, now)
    return data

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if the API is running"""
    return jsonify({"status": "healthy", "message": "TiMUS Backend is running!"})

@app.route('/api/quote/<ticker>', methods=['GET'])
def get_quote(ticker):
    """Get current stock quote with real-time data"""
    try:
        def fetch_quote():
            stock = yf.Ticker(ticker)
            info = stock.info
            
            # Get the most recent price data
            hist = stock.history(period='1d', interval='1m')
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            open_price = hist['Open'].iloc[0]
            high = hist['High'].max()
            low = hist['Low'].min()
            volume = hist['Volume'].sum()
            
            # Calculate change
            prev_close = info.get('previousClose', open_price)
            change = current_price - prev_close
            change_percent = (change / prev_close) * 100 if prev_close else 0
            
            return {
                "ticker": ticker.upper(),
                "price": round(current_price, 2),
                "open": round(open_price, 2),
                "high": round(high, 2),
                "low": round(low, 2),
                "volume": int(volume),
                "previousClose": round(prev_close, 2),
                "change": round(change, 2),
                "changePercent": round(change_percent, 2),
                "marketCap": info.get('marketCap', 'N/A'),
                "peRatio": info.get('trailingPE', 'N/A'),
                "dividendYield": info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
                "week52High": info.get('fiftyTwoWeekHigh', 'N/A'),
                "week52Low": info.get('fiftyTwoWeekLow', 'N/A'),
                "beta": info.get('beta', 'N/A'),
                "timestamp": datetime.now().isoformat()
            }
        
        data = get_cached_or_fetch(f"quote_{ticker}", fetch_quote)
        
        if data is None:
            return jsonify({"error": "Unable to fetch data for ticker"}), 404
        
        return jsonify(data)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/history/<ticker>', methods=['GET'])
def get_history(ticker):
    """Get historical price data for charts"""
    try:
        period = request.args.get('period', '1d')  # 1d, 5d, 1mo, 3mo, 1y
        interval = request.args.get('interval', '5m')  # 1m, 5m, 15m, 1h, 1d
        
        def fetch_history():
            stock = yf.Ticker(ticker)
            hist = stock.history(period=period, interval=interval)
            
            if hist.empty:
                return None
            
            # Convert to list of data points
            data_points = []
            for timestamp, row in hist.iterrows():
                data_points.append({
                    "timestamp": timestamp.isoformat(),
                    "open": round(row['Open'], 2),
                    "high": round(row['High'], 2),
                    "low": round(row['Low'], 2),
                    "close": round(row['Close'], 2),
                    "volume": int(row['Volume'])
                })
            
            return data_points
        
        data = get_cached_or_fetch(f"history_{ticker}_{period}_{interval}", fetch_history)
        
        if data is None:
            return jsonify({"error": "Unable to fetch historical data"}), 404
        
        return jsonify({
            "ticker": ticker.upper(),
            "period": period,
            "interval": interval,
            "data": data
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search', methods=['GET'])
def search_ticker():
    """Search for stock tickers"""
    query = request.args.get('q', '').upper()
    
    if not query:
        return jsonify({"results": []})
    
    # Simple search - in production, you'd use a proper ticker database
    # For now, just validate the ticker exists
    try:
        stock = yf.Ticker(query)
        info = stock.info
        
        if 'symbol' in info:
            return jsonify({
                "results": [{
                    "symbol": query,
                    "name": info.get('longName', query),
                    "type": info.get('quoteType', 'EQUITY')
                }]
            })
        else:
            return jsonify({"results": []})
            
    except:
        return jsonify({"results": []})

@app.route('/api/live/<ticker>', methods=['GET'])
def live_price(ticker):
    """Get just the current price - lightweight endpoint for frequent updates"""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period='1d', interval='1m')
        
        if hist.empty:
            return jsonify({"error": "No data available"}), 404
        
        current_price = hist['Close'].iloc[-1]
        
        return jsonify({
            "ticker": ticker.upper(),
            "price": round(current_price, 2),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 TiMUS Backend Starting...")
    print("📊 Connected to Yahoo Finance")
    print("🌐 API running on http://localhost:5000")
    app.run(debug=True, port=5000, host='0.0.0.0')
