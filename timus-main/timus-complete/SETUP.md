# 🚀 TiMUS - SUPER SIMPLE SETUP

## What You Have Here:
- ✅ Python Backend with REAL Yahoo Finance data
- ✅ Updated ChartPanel.tsx with live data
- ✅ marketApi.ts service file

## 📝 3-STEP SETUP:

### STEP 1: Start Backend (Terminal 1)

```bash
cd backend
pip install flask flask-cors yfinance pandas
python app.py
```

✅ You should see: "API running on http://localhost:5000"

---

### STEP 2: Update Your Lovable Project

**A. Copy these 2 files to your Lovable TiMUS:**

1. Copy `marketApi.ts` → `your-timus-project/src/services/marketApi.ts`
2. Copy `ChartPanel.tsx` → `your-timus-project/src/components/simulator/ChartPanel.tsx` (REPLACE existing)

**B. Create `.env` file in your Lovable project root:**

```
VITE_API_URL=http://localhost:5000/api
```

---

### STEP 3: Run Your Lovable Project (Terminal 2)

```bash
npm run dev
```

---

## ✅ HOW TO TEST IT'S WORKING:

1. Open your simulator (usually http://localhost:8080/simulator)
2. Look for green badge: **"✓ LIVE YAHOO FINANCE DATA"**
3. Try ticker: **AAPL**
4. Price should be real and updating!

---

## 🎯 WHAT CHANGED:

### OLD (Fake Data):
```typescript
let price = 150 + Math.random() * 50;  // ❌ Random fake numbers
```

### NEW (Real Data):
```typescript
const quote = await getStockQuote('AAPL');  // ✅ Real Yahoo Finance!
```

---

## 🔥 Try These Tickers:

- **AAPL** - Apple
- **TSLA** - Tesla
- **MSFT** - Microsoft
- **BTC-USD** - Bitcoin
- **ETH-USD** - Ethereum

---

## ❌ TROUBLESHOOTING:

**"Connection Refused"**
- Make sure backend is running: `python backend/app.py`
- Check http://localhost:5000/api/health in browser

**"Module not found: yfinance"**
- Run: `pip install yfinance`

**"No data for ticker"**
- Use correct symbols: AAPL, TSLA, BTC-USD (not BTC)

---

## 💡 THAT'S IT!

Your TiMUS now uses **100% REAL market data** from Yahoo Finance!

Backend pulls live data → Frontend displays it → You see real prices! 🎉
