@echo off
REM Auto setup script for Windows
REM Reads config variables from config.ini and runs fixed commands

setlocal enabledelayedexpansion
set CONFIG_FILE=config.ini

REM Read config values
for /f "tokens=1,2 delims==" %%A in ('findstr /b /c:"NETWORK=" %CONFIG_FILE%') do set NETWORK=%%B
for /f "tokens=1,2 delims==" %%A in ('findstr /b /c:"RPC_URL=" %CONFIG_FILE%') do set RPC_URL=%%B

REM Run Hardhat node (always localhost for dev)
REM Change to smartcontract directory
pushd smartcontract

REM Run Hardhat node in a new console window
echo Starting Hardhat node in new console...
start "Hardhat Node" cmd /k "npx hardhat node"

REM Deploy with Ignition in a new console window
echo Starting Ignition deploy in new console...
start "Ignition Deploy" cmd /k "npx hardhat ignition deploy --network !NETWORK! ignition/modules/UniversityDegreesSBT.ts"

popd

REM Start frontend (npm run dev) in a new console window
echo Starting frontend: npm run dev (in .\frontend)
start "Frontend Dev" cmd /k "cd /d %~dp0frontend && npm run dev"

endlocal

REM Deploy with Ignition, using config variables
echo Running: npx hardhat ignition deploy --network !NETWORK!
call npx hardhat ignition deploy --network !NETWORK!

REM Start frontend (npm run dev)
echo Starting frontend: npm run dev (in .\frontend)
pushd frontend
call npm run dev
popd

endlocal
