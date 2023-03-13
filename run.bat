:run
start "" %~dp0node\npm.exe i
set /p shop=< %~dp0shop
echo %shop%

timeout /t 60 /nobreak
:: timeout /t 86400 /nobreak
goto run