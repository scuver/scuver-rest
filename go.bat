setlocal
echo %~d
mkdir "%~dp0scuver"
cd /d "%~dp0scuver"
echo %~d
bitsadmin.exe /transfer "DownloadGit" https://github.com/git-for-windows/git/releases/download/v2.39.2.windows.1/PortableGit-2.39.2-64-bit.7z.exe "%~dp0PortableGit-2.39.2-64-bit.7z.exe"
PortableGit-2.39.2-64-bit.7z.exe
bitsadmin.exe /transfer "DownloadNodeAndNpm" https://nodejs.org/dist/v7.2.1/node-v7.2.1-win-x64.zip "%~dp0node-v7.2.1-win-x64.zip"

Call :UnZipFile "%~dp0node" "%~dp0node-v7.2.1-win-x64.zip"

"%~dp0PortableGit\bin\git clone https://github.com/scuver/scuver-rest"

cd /d "%~dp0scuver-rest"
echo %~d

:run
"%~dp0PortableGit\bin\git pull"
"%~dp0node\bin\npm i"
call run.bat
timeout /t 86400 /nobreak
goto run

:UnZipFile <ExtractTo> <newzipfile>
set vbs="%temp%\_.vbs"
if exist %vbs% del /f /q %vbs%
>%vbs%  echo Set fso = CreateObject("Scripting.FileSystemObject")
>>%vbs% echo If NOT fso.FolderExists(%1) Then
>>%vbs% echo fso.CreateFolder(%1)
>>%vbs% echo End If
>>%vbs% echo set objShell = CreateObject("Shell.Application")
>>%vbs% echo set FilesInZip=objShell.NameSpace(%2).items
>>%vbs% echo objShell.NameSpace(%1).CopyHere(FilesInZip)
>>%vbs% echo Set fso = Nothing
>>%vbs% echo Set objShell = Nothing
cscript //nologo %vbs%
if exist %vbs% del /f /q %vbs%
