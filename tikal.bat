@echo off
start ABSOLUTE PATH TO wampmanager.exe
cd "ABSOLUTE PATH TO TIKAL/BACK"
start cmd /k "nodemon server.js"
cd "ABSOLUTE PATH TO TIKAL/FRONT"
start cmd /k "ionic serve"