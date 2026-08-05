@echo off
rem ===== MangaJp: one-time admin setup (firewall + auto-start) =====
rem Run once as administrator (double-click; UAC will ask). Safe to re-run.
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Requesting administrator rights...
  powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

echo [1/2] Adding firewall rule for port 8791 ...
netsh advfirewall firewall add rule name="MangaJpServer 8791" dir=in action=allow protocol=TCP localport=8791 profile=any

echo [2/2] Creating auto-start task at logon ...
schtasks /Create /TN "MangaJpServer" /TR "\"C:\Program Files\nodejs\node.exe\" \"C:\Users\Administrator\lobsterai\project\japanese-manga\server.js\"" /SC ONLOGON /F

echo.
echo Done! Now open on your phone: http://192.168.31.242:8791
echo (Phone and PC must be on the same Wi-Fi)
echo To remove later: run "netsh advfirewall firewall delete rule name=MangaJpServer" and "schtasks /Delete /TN MangaJpServer /F" as admin.
timeout /t 10 >nul
