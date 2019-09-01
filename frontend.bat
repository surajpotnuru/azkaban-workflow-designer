@echo off
rem INSTALL.bat - Package Install for Windows

rem 1) test if python.exe is in the path:

node --version >NUL 2>&1
if errorlevel 1 goto nonodeerror
echo node found in the path

http-server ./


goto end

:NONODEERROR
echo.
echo Node installation not found on system. Please install Node.
REM pause


:END
echo .
pause
