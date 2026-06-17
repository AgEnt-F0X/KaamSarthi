@echo off
setlocal

set "OLLAMA_EXE=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"

if not exist "%OLLAMA_EXE%" (
  echo Ollama is not installed.
  echo Install it from https://ollama.com/download/windows
  echo Then run this file again.
  pause
  exit /b 1
)

curl -s http://127.0.0.1:11434/api/tags >nul 2>nul
if errorlevel 1 (
  start "KaamSarthi Local AI" /min "%OLLAMA_EXE%" serve
  timeout /t 3 /nobreak >nul
)

echo Downloading the KaamSarthi assistant model...
"%OLLAMA_EXE%" pull gemma3:1b

if errorlevel 1 (
  echo The model download did not finish. Check your internet and run this file again.
  pause
  exit /b 1
)

echo Local AI is ready.
pause
