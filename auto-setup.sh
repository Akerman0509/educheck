#!/bin/bash
# Auto setup script for Linux/macOS
# Reads commands from config.ini

CONFIG_FILE="config.ini"

# Read config values
declare NETWORK=""

while IFS='=' read -r key value; do
  case "$key" in
    "NETWORK") NETWORK="$value" ;;
  esac
done < <(grep -E '^(NETWORK)' "$CONFIG_FILE")


# Change to smartcontract directory and run blockchain commands in new terminals
echo "Starting Hardhat node in new terminal..."
gnome-terminal -- bash -c "cd smartcontract && npx hardhat node; exec bash" &

echo "Starting Ignition deploy in new terminal..."
gnome-terminal -- bash -c "cd smartcontract && npx hardhat ignition deploy --network $NETWORK ignition/modules/UniversityDegreesSBT.ts; exec bash" &

# Start frontend (npm run dev) in a new terminal
echo "Starting frontend: npm run dev (in ./frontend)"
gnome-terminal -- bash -c "cd frontend && npm run dev; exec bash" &

# Start frontend (npm run dev)
echo "Starting frontend: npm run dev (in ./frontend)"
cd frontend
npm run dev
