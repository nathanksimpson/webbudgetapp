#!/bin/bash

# Budget Web App Launcher
# Double-click this file or run it from terminal to start the app

cd "$(dirname "$0")"

echo "🚀 Starting Budget Web App..."
echo ""
echo "The app will open in your browser at http://localhost:5173"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
