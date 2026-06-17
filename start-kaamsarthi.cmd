@echo off
cd /d "%~dp0"

set VENV_OK=0
if exist "speech-service\.venv\Scripts\python.exe" (
  "speech-service\.venv\Scripts\python.exe" --version >nul 2>nul
  if not errorlevel 1 set VENV_OK=1
)

if "%VENV_OK%"=="0" (
  echo Local voice typing is not installed or the environment is invalid.
  echo Starting the installer now.
  call "speech-service\install-speech.cmd"
)

start "KaamSarthi Local Speech" /min cmd /c ""%~dp0speech-service\start-speech.cmd""
set "OLLAMA_EXE=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
if exist "%OLLAMA_EXE%" (
  curl -s http://127.0.0.1:11434/api/tags >nul 2>nul
  if errorlevel 1 start "KaamSarthi Local AI" /min "%OLLAMA_EXE%" serve
) else (
  echo Ollama is not installed. The assistant will use simple offline answers.
)
timeout /t 3 /nobreak >nul
start "KaamSarthi Web" /min cmd /c ""%~dp0start-web.cmd""
timeout /t 4 /nobreak >nul
start "" http://localhost:4000
