@echo off
title Voice-2-Text (Docker)
cd /d "%~dp0"

where docker >nul 2>nul
if errorlevel 1 (
  echo Docker no esta instalado o no esta en el PATH.
  echo 1^) Instala Docker Desktop: https://www.docker.com/products/docker-desktop/
  echo 2^) Abrilo una vez hasta que diga "Engine running".
  echo 3^) Volve a hacer doble clic en este archivo.
  echo.
  pause
  exit /b 1
)

echo Levantando Voice-2-Text en Docker...
echo La PRIMERA vez compila la imagen: descarga varios GB ^(Torch + modelo^)
echo y puede tardar 10-20 min. Las proximas veces arranca en segundos.
echo.
docker compose up -d --build
if errorlevel 1 (
  echo.
  echo No se pudo levantar el contenedor.
  echo Asegurate de que Docker Desktop este abierto y "Engine running".
  echo.
  pause
  exit /b 1
)

echo.
echo Esperando a que el servidor responda...
:wait
curl -s -o nul http://localhost:3000
if errorlevel 1 (
  timeout /t 3 >nul
  goto wait
)

echo Listo. Abriendo http://localhost:3000
start "" "http://localhost:3000"
echo.
echo El servicio queda corriendo en segundo plano y se reinicia solo con la PC.
echo Para detenerlo: doble clic en stop-docker.bat
echo.
pause
