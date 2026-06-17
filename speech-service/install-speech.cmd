@echo off
cd /d "%~dp0"

set "PYTHON_CMD="

py -3.12 --version >nul 2>nul
if not errorlevel 1 (
  set "PYTHON_CMD=py -3.12"
) else (
  python --version >nul 2>nul
  if not errorlevel 1 (
    python -c "import sys; exit(0 if sys.version_info.major == 3 and sys.version_info.minor in (11, 12) else 1)" >nul 2>nul
    if not errorlevel 1 (
      set "PYTHON_CMD=python"
    )
  )
)

if "%PYTHON_CMD%"=="" (
  if exist "%USERPROFILE%\AppData\Local\Programs\Python\Launcher\py.exe" (
    set "PYTHON_CMD="%USERPROFILE%\AppData\Local\Programs\Python\Launcher\py.exe" -3.12"
  ) else if exist "%LOCALAPPDATA%\Programs\Python\Launcher\py.exe" (
    set "PYTHON_CMD="%LOCALAPPDATA%\Programs\Python\Launcher\py.exe" -3.12"
  ) else if exist "%USERPROFILE%\AppData\Local\Programs\Python\Python312\python.exe" (
    set "PYTHON_CMD="%USERPROFILE%\AppData\Local\Programs\Python\Python312\python.exe""
  ) else if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PYTHON_CMD="%LOCALAPPDATA%\Programs\Python\Python312\python.exe""
  )
)

if "%PYTHON_CMD%"=="" (
  echo Python 3.11 or 3.12 was not found.
  echo Install Python 3.11 or 3.12 from https://www.python.org/downloads/windows/
  pause
  exit /b 1
)

set VENV_OK=0
if exist ".venv\Scripts\python.exe" (
  ".venv\Scripts\python.exe" --version >nul 2>nul
  if not errorlevel 1 set VENV_OK=1
)

if "%VENV_OK%"=="0" (
  echo Virtual environment is missing or invalid. Recreating it...
  if exist ".venv" rd /s /q ".venv"
  %PYTHON_CMD% -m venv .venv
  if errorlevel 1 (
    echo Failed to create virtual environment.
    pause
    exit /b 1
  )
)

".venv\Scripts\python.exe" -m pip install --upgrade pip
".venv\Scripts\python.exe" -m pip install -r requirements.txt

echo.
echo Speech service installed.
echo The Whisper Small model downloads on first use and stays in speech-service\models.
pause
