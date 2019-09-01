@echo off
rem INSTALL.bat - Package Install for Windows

rem 1) test if python.exe is in the path:

python.exe --version >NUL 2>&1
if errorlevel 1 goto nopythonerror
echo python.exe found in the path
echo proceeding to install required packages

python -m pip install -r requirements.txt
if errorlevel 1 goto installerror
python backend.py

goto end

:NOPYTHONERROR
echo.
echo Python installation not found on system. Please install Python and run the install.bat again.
REM pause

:INSTALLERROR
echo.
echo Error occured while installing packages. Please try again.
REM pause

:END
echo .
pause
