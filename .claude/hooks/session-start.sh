#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

cd "$CLAUDE_PROJECT_DIR"

# Install Node.js dependencies
if [ -f "package.json" ]; then
  echo "[chakra9] Installing npm dependencies..."
  npm install
  echo "[chakra9] npm install complete."
fi

# Install worker dependencies if present
if [ -f "chakra9-machine/worker/package.json" ]; then
  echo "[chakra9] Installing worker dependencies..."
  cd chakra9-machine/worker && npm install && cd "$CLAUDE_PROJECT_DIR"
fi
