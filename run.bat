:run

taskkill /f /im node.exe

start "" %~dp0PortableGit\bin\git.exe stash
start "" %~dp0PortableGit\bin\git.exe pull

start "" %~dp0node\npm.exe i
set /p shop=< %~dp0shop
echo %shop%
set /p uber=< %~dp0uber
set /p glovo=< %~dp0glovo

forever notify.js --shop=%shop%
forever print.js
:: forever platform.js --shop=%shop%

timeout /t 60 /nobreak
:: timeout /t 86400 /nobreak
goto run
