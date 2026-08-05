@echo off
rem ===== MangaJp server: start (no admin needed) =====
netstat -ano | findstr ":8791" | findstr "LISTENING" >nul
if %errorlevel%==0 (
  echo Server already running.
  echo Open on phone: http://192.168.31.242:8791
  timeout /t 5 >nul
  exit /b
)
cd /d "%~dp0"
start "MangaJpServer" /min cmd /c "node server.js"
timeout /t 1 >nul
echo Server started.
echo Open on phone: http://192.168.31.242:8791
echo (Phone and PC must be on the same Wi-Fi)
timeout /t 8 >nul
