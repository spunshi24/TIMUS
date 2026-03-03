# 📁 WHERE TO PUT THESE FILES

## 🎯 You Have 2 New Files:

```
NEW_FILES/
├── marketApi.ts      ← New file (API connection)
└── ChartPanel.tsx    ← Updated file (real data)
```

---

## 📂 Put Them in Your Lovable Project:

### YOUR LOVABLE PROJECT STRUCTURE:
```
your-timus-project/
├── src/
│   ├── services/
│   │   └── marketApi.ts        ← PUT FILE #1 HERE
│   ├── components/
│   │   └── simulator/
│   │       └── ChartPanel.tsx  ← PUT FILE #2 HERE (REPLACE existing)
│   └── ...
├── .env                        ← CREATE THIS FILE
└── package.json
```

---

## ✏️ STEP-BY-STEP:

### 1. Copy `marketApi.ts`:

**From:** `NEW_FILES/marketApi.ts`  
**To:** `your-timus-project/src/services/marketApi.ts`

**If `services/` folder doesn't exist:**
```bash
mkdir src/services
```

---

### 2. Replace `ChartPanel.tsx`:

**From:** `NEW_FILES/ChartPanel.tsx`  
**To:** `your-timus-project/src/components/simulator/ChartPanel.tsx`

**⚠️ REPLACE the existing file** (backup the old one if you want)

---

### 3. Create `.env` file:

**Location:** `your-timus-project/.env`  
**Content:**
```
VITE_API_URL=http://localhost:5000/api
```

---

## ✅ THEN RUN:

**Terminal 1 (Backend):**
```bash
cd backend
python app.py
```

**Terminal 2 (Frontend):**
```bash
cd your-timus-project
npm run dev
```

---

## 🎨 VISUAL GUIDE:

```
┌──────────────────────────────────────┐
│  backend/                            │
│  ├── app.py       ← ALREADY DONE     │
│  └── ...          ← START THIS FIRST │
└──────────────────────────────────────┘
            ↓ provides data to ↓
┌──────────────────────────────────────┐
│  your-timus-project/                 │
│  ├── src/                            │
│  │   ├── services/                   │
│  │   │   └── marketApi.ts  ← NEW    │
│  │   └── components/                 │
│  │       └── simulator/              │
│  │           └── ChartPanel.tsx      │
│  │              ↑ REPLACE THIS       │
│  └── .env  ← CREATE THIS             │
└──────────────────────────────────────┘
```

---

## 🤔 CONFUSED ABOUT YOUR LOVABLE PROJECT?

Your Lovable project is probably at:
- `~/timus` or
- `~/Desktop/timus` or  
- Wherever you cloned the GitHub repo

It has these files:
- `package.json`
- `src/` folder
- `vite.config.ts`

That's your Lovable project! Put the NEW files there.

---

## 💡 TIP:

You can also just copy your ENTIRE Lovable `src/` folder here and run everything from this folder! Either way works.
