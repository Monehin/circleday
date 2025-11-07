#!/bin/bash
#
# CircleDay Worker Deployment Script
# Compatible with: Hetzner, DigitalOcean, Linode, AWS EC2, or any VPS
# 
# This script:
# 1. Pulls latest code from GitHub
# 2. Decrypts production secrets
# 3. Rebuilds and restarts the worker
#

set -e

# Configuration
PROJECT_DIR="/opt/circleday-worker"
REPO_URL="git@github.com:your-username/circleday.git"
BRANCH="main"
LOG_FILE="/var/log/circleday-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[ERROR] $1" >> "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    echo "[WARN] $1" >> "$LOG_FILE"
}

log "Starting CircleDay Worker deployment"
log "==========================================="

# Clone or update repository
if [ ! -d "$PROJECT_DIR" ]; then
    log "Cloning repository for the first time..."
    git clone $REPO_URL $PROJECT_DIR
else
    log "Repository exists, updating..."
    cd $PROJECT_DIR
    
    # Stash any local changes
    git stash save "Auto-stash before deployment $(date)"
    
    # Fetch and reset to latest
    git fetch origin
    git reset --hard origin/$BRANCH
fi

cd $PROJECT_DIR

# Decrypt production secrets
log "Decrypting production secrets..."
if command -v git-secret &> /dev/null; then
    git secret reveal -f
    log "Secrets decrypted successfully"
else
    error "git-secret not installed!"
    exit 1
fi

# Verify .env.production exists
if [ ! -f ".env.production" ]; then
    error ".env.production not found after decryption!"
    exit 1
fi

# Stop existing containers
log "Stopping existing worker..."
docker compose down 2>/dev/null || warn "No existing worker to stop"

# Clean up old images
log "Cleaning up old Docker images..."
docker image prune -f

# Build new image
log "Building worker image..."
docker compose build --no-cache

# Start worker
log "Starting worker..."
docker compose up -d

# Wait for worker to start
log "Waiting for worker to be healthy..."
sleep 10

# Check status
log "Checking worker status..."
docker compose ps

# Show recent logs
log "Recent worker logs:"
docker compose logs --tail=30 worker

# Disk usage
log "Disk usage:"
df -h /

log "==========================================="
log "Deployment complete!"
log "Worker is running on Hetzner"
log ""
log "Useful commands:"
log "  docker compose logs -f worker     # View logs"
log "  docker compose ps                 # Check status"
log "  docker compose restart worker     # Restart"
log ""

exit 0

