@echo off
echo ========================================================
echo  Sri Lakshmi Ganapathi - Push to GitHub
echo ========================================================
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/sri-lakshmi-ganapathi.git): "
if "%REPO_URL%"=="" (
    echo Error: No repository URL entered.
    pause
    exit /b
)
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main
echo.
echo ========================================================
echo  Done! Your project is now pushed to GitHub.
echo ========================================================
pause
