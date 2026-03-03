#!/bin/bash

# TiMUS - Auto Start Script
# This script automatically starts the backend for you!

echo "🚀 Starting TiMUS Backend..."
echo ""

# Change to backend directory
cd backend || exit

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed!"
    echo "Install it from: https://www.python.org/downloads/"
    exit 1
fi

echo "✓ Python 3 found"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -q flask flask-cors yfinance pandas 2>/dev/null

# Start the backend
echo ""
echo "✅ STARTING BACKEND SERVER..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Backend will be at: http://localhost:5000"
echo "📊 Yahoo Finance data: CONNECTED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the app
python app.py
