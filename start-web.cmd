@echo off
cd /d "%~dp0apps\web"
node .\node_modules\next\dist\bin\next dev --port 4000
