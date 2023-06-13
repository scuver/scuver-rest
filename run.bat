:run

taskkill /f /im node.exe
taskkill /f /im node

start /WAIT "" %~dp0PortableGit\bin\git.exe stash
start /WAIT "" %~dp0PortableGit\bin\git.exe pull

start "" %~dp0node\npm i
set /p shop=< %~dp0shop
echo %shop%
:: set /p uber=< %~dp0uber
:: set /p glovo=< %~dp0glovo

start "" %~dp0node\forever notify.js --shop=%shop%
start "" %~dp0node\forever print.js
:: start "" %~dp0node\forever platform.js --shop=%shop%

:: timeout /t 120 /nobreak

:: timeout /t 86400 /nobreak
:: goto run
