@echo off
title Voice-2-Text (stop)
cd /d "%~dp0"
echo Deteniendo Voice-2-Text...
docker compose down
echo.
echo Detenido. Para volver a iniciarlo: start-docker.bat
echo.
pause
