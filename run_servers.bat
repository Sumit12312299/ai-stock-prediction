@echo off
title AI Stock Market Prediction System Starter
color 0a

echo ====================================================================
echo             AI-BASED STOCK MARKET PREDICTION SYSTEM
echo ====================================================================
echo.
echo Preparing startup sequences for FastAPI backend and React frontend...
echo.

:: 1. Launch FastAPI Backend
echo [1/2] Launching FastAPI Backend on http://localhost:8000 ...
start "FastAPI Backend Service" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: 2. Launch React Frontend
echo [2/2] Launching React Frontend on http://localhost:5173 ...
start "React Vite Frontend Service" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================================================
echo Startup instructions triggered successfully!
echo.
echo - Backend active at: http://localhost:8000 (Swagger docs at /docs)
echo - Frontend active at: http://localhost:5173
echo ====================================================================
echo.
pause
