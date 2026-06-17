@echo off
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo Speech service is not installed yet.
  echo Run install-speech.cmd first.
  pause
  exit /b 1
)

set HF_HOME=%~dp0models
set HF_HUB_DISABLE_SYMLINKS_WARNING=1
".venv\Scripts\python.exe" -m uvicorn app:app --host 127.0.0.1 --port 8765

