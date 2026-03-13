@echo off
title ShareBite Shutdown
echo ------------------------------------------
echo Stopping ShareBite (React + Spring Boot)
echo ------------------------------------------

echo [1/2] Stopping Java Backend...
taskkill /f /im java.exe /t

echo [2/2] Stopping React Frontend (Node process)...
taskkill /f /im node.exe /t

echo ------------------------------------------
echo Success! All ports have been cleared.
echo ------------------------------------------
pause