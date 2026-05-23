#!/bin/bash

# Navigate into the backend directory
cd "$(dirname "$0")/backend"

# Determine activation script path based on OS shell
if [ -d ".venv/Scripts" ]; then
    # Windows shell fallback (Git Bash / Cygwin)
    source .venv/Scripts/activate
else
    # Linux/macOS shell fallback
    source .venv/bin/activate
fi

# Run the FastAPI server
python -m uvicorn app:app --host 127.0.0.1 --port 8008 --reload

