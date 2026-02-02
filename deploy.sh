#!/bin/bash
# Deploy script for CommitQuest
# Run this on the VPS to deploy the latest version

set -e

echo "🚀 Deploying CommitQuest..."

# Navigate to project directory
cd ~/commitquest

# Pull latest code
echo "📥 Pulling latest code..."
cd commitquest-src
git pull
cd ..

# Build Docker image
echo "🏗️  Building Docker image..."
docker build -t commitquest:latest ~/commitquest/commitquest-src

# Restart app container
echo "🔄 Restarting app..."
docker compose up -d app

# Update database schema
echo "🗄️  Updating database schema..."
docker compose run --rm app npx prisma@6 db push --accept-data-loss

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Container status:"
docker compose ps

echo ""
echo "Recent app logs:"
docker compose logs app --tail 20
