#!/bin/bash
#
# CircleDay Worker - Simple Pull & Deploy
# No building - just pulls pre-built image from GitHub Container Registry
#

set -e

echo "🚀 Deploying CircleDay Worker (Pull-based)..."

cd /opt/circleday-worker

# Pull latest code (for docker-compose.yml updates)
echo "📥 Pulling latest docker-compose.yml..."
git fetch origin
git reset --hard origin/main

# Pull new Docker image
echo "🐳 Pulling latest worker image..."
docker compose pull worker

# Restart worker
echo "🔄 Restarting worker..."
docker compose up -d worker

# Check status
echo "✅ Deployment complete!"
echo ""
echo "📊 Status:"
docker compose ps

echo ""
echo "📝 Recent logs:"
docker compose logs --tail=30 worker

echo ""
echo "🎉 Worker is running!"

