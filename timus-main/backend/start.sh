#!/bin/bash
# -------------------------------------------------------
# TiMUS Flask Backend — start script
# Run this once before starting the React dev server.
# -------------------------------------------------------
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create a virtual environment if one doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv venv
fi

# Activate and install/update dependencies
source venv/bin/activate
echo "Installing dependencies..."
pip install -q -r requirements.txt

echo ""
echo "Starting Flask backend on http://localhost:5000"
echo "Press Ctrl+C to stop."
echo ""
python app.py
