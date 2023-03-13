setlocal
for /f "usebackq tokens=1,2,*" %%B IN (`reg query "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v Desktop`) do set DESKTOP=%%D
start /d "%~dp0nircmd" nircmd.exe shortcut "%~dp0run.bat" "%DESKTOP%" "Scuver"

start "" %~dp0PortableGit\bin\git.exe init
start "" %~dp0PortableGit\bin\git.exe remote add origin "https://github.com/scuver/scuver-rest"
start "" %~dp0PortableGit\bin\git.exe pull

start "" %~dp0node\npm.exe i -g forever

set /p "id=SHOP UID: "
echo %id% > shop

set /p "uber=Ativar Integração Uber Eats? (s/n): "
echo %uber% > uber

set /p "glovo=Ativar Integração Glovo? (s/n): "
echo %glovo% > glovo


:: exit 0

:: bitsadmin.exe /transfer "DownloadGit" https://github.com/git-for-windows/git/releases/download/v2.39.2.windows.1/PortableGit-2.39.2-32-bit.7z.exe "%~dp0gitSetup.exe"
:: start /d "%~dp0" gitSetup.exe
:: bitsadmin.exe /transfer "DownloadNodeAndNpm" https://nodejs.org/dist/v7.2.1/node-v7.2.1-win-x86.zip "%~dp0node.zip"
:: Call :UnZipFile "%~dp0node" "%~dp0node.zip"

:: :UnZipFile <ExtractTo> <newzipfile>
:: set vbs="%temp%\_.vbs"
:: if exist %vbs% del /f /q %vbs%
:: >%vbs%  echo Set fso = CreateObject("Scripting.FileSystemObject")
:: >>%vbs% echo If NOT fso.FolderExists(%1) Then
:: >>%vbs% echo fso.CreateFolder(%1)
:: >>%vbs% echo End If
:: >>%vbs% echo set objShell = CreateObject("Shell.Application")
:: >>%vbs% echo set FilesInZip=objShell.NameSpace(%2).items
:: >>%vbs% echo objShell.NameSpace(%1).CopyHere(FilesInZip)
:: >>%vbs% echo Set fso = Nothing
:: >>%vbs% echo Set objShell = Nothing
:: cscript //nologo %vbs%
:: if exist %vbs% del /f /q %vbs%
