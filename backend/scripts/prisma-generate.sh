#!/bin/bash
set -e

echo "=== Prisma Version Check ==="
echo "Checking installed Prisma version..."

# Check if prisma is installed
if [ ! -f "node_modules/.bin/prisma" ]; then
    echo "ERROR: Prisma binary not found in node_modules/.bin/"
    exit 1
fi

# Get the version
PRISMA_VERSION=$(node_modules/.bin/prisma --version | grep "prisma" | head -1 | awk '{print $3}')
echo "Detected Prisma version: $PRISMA_VERSION"

# Check if it's the correct version
if [[ "$PRISMA_VERSION" != "5.22.0" ]]; then
    echo "WARNING: Expected Prisma 5.22.0 but found $PRISMA_VERSION"
    echo "Attempting to use the installed version anyway..."
fi

# Run prisma generate
echo "Running prisma generate..."
node_modules/.bin/prisma generate

echo "=== Prisma generation completed successfully ==="
