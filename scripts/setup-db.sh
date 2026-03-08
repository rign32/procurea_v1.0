#!/bin/bash
# Procurea - Database Setup Script
# Run this after installing Docker Desktop

set -e

echo "🔧 Procurea Database Setup"
echo "=========================="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found!"
    echo "   Install Docker Desktop: https://docs.docker.com/desktop/install/mac-install/"
    echo "   After install, run this script again."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null 2>&1; then
    echo "❌ Docker is not running. Start Docker Desktop first."
    exit 1
fi

echo "✅ Docker found"

# Start PostgreSQL
cd "$(dirname "$0")/.."
echo "📦 Starting PostgreSQL..."
docker compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker compose exec -T postgres pg_isready -U procurea > /dev/null 2>&1; do
    sleep 1
done
echo "✅ PostgreSQL is ready"

# Run Prisma migration
cd backend
echo "🔄 Running database migration..."
npx prisma migrate dev --name init

echo "✅ Database setup complete!"
echo ""
echo "PostgreSQL is running at: postgresql://procurea:procurea-dev-2026@localhost:5432/procurea"
echo "To stop:  docker compose down"
echo "To start: docker compose up -d"
