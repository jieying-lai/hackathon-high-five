@echo off
setlocal
cd /d "%~dp0"
git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo This publishing shortcut must be run from the team's Git checkout, not a downloaded ZIP.
  pause
  exit /b 1
)
echo Publishing the already committed local-launcher changes to the current GitHub branch.
echo Git may open its normal sign-in window. No password or token should be pasted into a chat.
git push origin HEAD
if errorlevel 1 (
  echo Push failed. Sign in to GitHub in your Git client, then run this file again.
  pause
  exit /b 1
)
echo Published. Share the GitHub download link for the branch just pushed.
pause
