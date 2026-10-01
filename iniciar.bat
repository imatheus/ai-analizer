@echo off
echo =========================================
echo Iniciando AI Analyzer...
echo =========================================

echo.
echo Iniciando o backend (API)...
start "AI Analyzer Backend" cmd /k "cd backend && npm run dev"

echo Iniciando o frontend (Interface Vite)...
start "AI Analyzer Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Pronto! Duas janelas foram abertas para executar o backend e o frontend.
echo Pode fechar esta janela principal se quiser.
