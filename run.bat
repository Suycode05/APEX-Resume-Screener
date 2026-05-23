@echo off
cd /d "%~dp0backend"
call .venv\Scripts\activate.bat
python -m uvicorn app:app --host 127.0.0.1 --port 8008 --reload
pause

