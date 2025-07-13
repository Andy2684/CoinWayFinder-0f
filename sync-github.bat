@echo off
cd /d C:\Users\admin\Downloads\CoinWayFinder-0f

echo 🔄 Pulling from GitHub...
git pull origin main

echo 🔼 Committing local changes...
git add .
git commit -m "🖥️ Auto sync from local"

echo 🚀 Pushing to GitHub...
git push origin main

echo ✅ Done.
pause
