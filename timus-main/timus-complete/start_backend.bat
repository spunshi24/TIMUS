@echo off
REM TiMUS - Auto Start Script (Windows)
REM This script automatically starts the backend for you!

echo.
echo ========================================
echo   TiMUS Backend - Starting...
echo ========================================
echo.

cd backend

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed!
    echo Please install from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Python found

REM Create virtual environment if it doesn't exist
if not exist "venv\" (
    echo [INFO] Creating virtual environment...
    python -m venv venv
    echo [OK] Virtual environment created
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo [INFO] Installing dependencies...
pip install -q flask flask-cors yfinance pandas

REM Start the backend
echo.
echo ========================================
echo   BACKEND SERVER STARTING
echo ========================================
echo   Backend URL: http://localhost:5000
echo   Data Source: Yahoo Finance (LIVE)
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Run the app
python app.py
