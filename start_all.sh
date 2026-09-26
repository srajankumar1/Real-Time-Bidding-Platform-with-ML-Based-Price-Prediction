#!/usr/bin/env bash
# start_all.sh - Starts all three services for Real-Time Bidding Platform with ML Prediction

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo " Starting Real-Time Bidding Platform with ML Prediction"
echo "=========================================================="

# Check if Python virtual environment exists
if [ ! -d "$ROOT_DIR/venv" ]; then
  echo "Virtual environment not found. Creating and installing..."
  python3 -m venv "$ROOT_DIR/venv"
  "$ROOT_DIR/venv/bin/pip" install -r "$ROOT_DIR/ml_service/requirements.txt"
fi

# 1. Start Flask ML Service on Port 5001
echo "[1/3] Launching Flask ML Microservice on port 5001..."
"$ROOT_DIR/venv/bin/python3" "$ROOT_DIR/ml_service/app.py" &
ML_PID=$!

# Wait 2 seconds for ML service
sleep 2

# 2. Start Backend Server on Port 5002 (macOS friendly port)
echo "[2/3] Launching Node.js Express & Socket.IO Backend on port 5002..."
cd "$ROOT_DIR/backend"
PORT=5002 node server.js &
BACKEND_PID=$!

# Wait 2 seconds for Backend
sleep 2

# 3. Start Frontend Dev Server on Port 3000
echo "[3/3] Launching Vite Frontend on port 3000..."
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo "=========================================================="
echo " All services running!"
echo " - Frontend:   http://localhost:3000"
echo " - Backend:    http://localhost:5002"
echo " - ML Service: http://localhost:5001"
echo "=========================================================="
echo "Press CTRL+C to stop all services."

cleanup() {
  echo ""
  echo "Shutting down services..."
  kill $ML_PID 2>/dev/null
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  exit 0
}

trap cleanup INT TERM
wait
