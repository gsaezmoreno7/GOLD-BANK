@echo off
echo Iniciando Backend (Puerto 3001)...
cd backend
start cmd /k "npm start"

echo Iniciando Frontend (Vite)...
cd ../frontend
start cmd /k "npm run dev"

echo ¡El sistema Maestranza R.S está levantando!
