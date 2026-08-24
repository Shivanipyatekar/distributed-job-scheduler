#!/bin/sh

set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is missing"
  exit 1
fi

echo "DATABASE_URL is configured"

echo "Running database migrations..."
npm run migrate

echo "Starting Runline API..."
node src/server.js &
API_PID=$!

echo "Starting Runline worker..."
node src/worker.js &
WORKER_PID=$!

shutdown() {
  echo "Stopping Runline services..."

  kill -TERM "$API_PID" 2>/dev/null || true
  kill -TERM "$WORKER_PID" 2>/dev/null || true

  wait "$API_PID" 2>/dev/null || true
  wait "$WORKER_PID" 2>/dev/null || true

  exit 0
}

trap shutdown TERM INT

wait "$API_PID" "$WORKER_PID"
