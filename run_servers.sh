#!/usr/bin/bash

# Kills servers processes
stopServers() {
    echo "Stopping servers..."
    if [[ -n "$FRONTEND_PID" ]]; then
        kill "$FRONTEND_PID" 2>/dev/null
    fi
    if [[ -n "$BACKEND_PID" ]]; then
        kill "$BACKEND_PID" 2>/dev/null
    fi
}

# Calls stopServers on Ctrl+C, kill or normal exit
trap stopServers INT TERM EXIT

# ------------
# GLOBAL SETUP
# ------------

BACKEND_DIR="src/fastapi-backend"
FRONTEND_DIR="src/angular-frontend"

# -----------------------------------
# 1) Python dependencies installation
# -----------------------------------

echo "1) Installing Python dependencies..."
cd "$BACKEND_DIR"
pip install -r requirements.txt
cd - >/dev/null

# ------------------------------------
# 2) Angular dependencies installation
# ------------------------------------

echo "2) Installing Angular dependencies..."
cd "$FRONTEND_DIR"
npm ci

# ---------------------------
# 3) Angular production build
# ---------------------------

echo "3) Building the Angular frontend..."
npx ng build
cd - >/dev/null

# --------------------
# 4) Backend execution
# --------------------

cd "$BACKEND_DIR"
python3 main.py & BACKEND_PID=$!
cd - >/dev/null

# ---------------------
# 5) Frontend execution
# ---------------------

cd "$FRONTEND_DIR"
npx serve -s dist/angular-frontend/browser -l 4200 & FRONTEND_PID=$!
cd - >/dev/null

echo
echo Servers are up !
echo
echo "FastAPI backend -> http://localhost:8000"
echo "SwaggerUI backend -> http://localhost:8000/docs"
echo "ReDoc backend -> http://localhost:8000/redoc"
echo "Angular frontend -> http://localhost:4200"
echo
echo "Ctrl + C to stop the servers..."
echo

# Waits for a process death
wait -n "$BACKEND_PID" "$FRONTEND_PID"