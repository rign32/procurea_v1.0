#!/bin/sh
set -e

echo "🚀 Starting Procurea Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
timeout=60
counter=0

while [ $counter -lt $timeout ]; do
  if echo "SELECT 1" | npx prisma db execute --stdin; then
    echo "✅ Database connection established"
    break
  fi
  echo "⚠️ Database connection failed... retrying ($counter/$timeout)"
  counter=$((counter + 1))
  if [ $counter -eq $timeout ]; then
    echo "❌ Database connection timeout after ${timeout}s"
    exit 1
  fi
  sleep 1
done

# Run database migrations (only if not a worker)
if [ "$PROCESS_TYPE" != "worker" ]; then
  echo "📦 Syncing database schema (db push)..."
  npx prisma db push --accept-data-loss
  echo "✅ Schema synced successfully"
else
  echo "👷 Worker mode detected: Skipping migrations"
fi

# Start the application
echo "🎯 Starting NestJS application..."
exec npm run start:prod
