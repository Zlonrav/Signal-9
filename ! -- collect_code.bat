@echo off
chcp 65001 >nul
setlocal

set "OUT=! -- all_text.txt"
set "SELF=%~nx0"

if exist "%OUT%" del "%OUT%"

for /r . %%f in (*.js *.html *.css *.json *.txt *.md) do (
    if /i not "%%~nxf"=="%OUT%" if /i not "%%~nxf"=="%SELF%" (
        echo ====================================== start %%~nxf ====================================== >> "%OUT%"
        echo FILE: %%~ff >> "%OUT%"
        type "%%f" >> "%OUT%"
        echo(>> "%OUT%"
        echo ====================================== end %%~nxf ====================================== >> "%OUT%"
        echo(>> "%OUT%"
    )
)

echo.
echo Done. Output: "%OUT%"
pause
