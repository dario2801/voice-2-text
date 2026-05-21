@echo off
title Voice-2-Text
cd /d "%~dp0"

REM Voice-2-Text local server launcher (Windows).
REM Requires: Node, Python + openai-whisper, and ffmpeg/ffprobe on PATH.

if not exist ".next" (
  echo Primera vez: compilando ^(~1 min^)...
  call npm run build
  if errorlevel 1 (
    echo.
    echo El build fallo. Si es un error de .next / antivirus, excluye la
    echo carpeta .next del antivirus y volve a ejecutar este archivo.
    echo.
    pause
    exit /b 1
  )
)

echo.
echo ==================================================
echo   Voice-2-Text corriendo en:
echo       http://localhost:3000
echo.
echo   Deja esta ventana abierta. Ctrl+C para detener.
echo ==================================================
echo.
call npm run start
pause
