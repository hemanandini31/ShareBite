@echo off
echo Starting ShareBite Backend...
start "ShareBite Backend" cmd /k "cd backend && mvnw.cmd spring-boot:run"

echo Starting ShareBite Frontend...
start "ShareBite Frontend" cmd /k "cd frontend && npm run dev"

echo ShareBite is starting up! Please wait for the backend to initialize.
