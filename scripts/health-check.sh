#!/bin/bash
#
# CircleDay Worker Health Check
#

cd /opt/circleday-worker 2>/dev/null || {
    echo "❌ Worker directory not found"
    exit 1
}

echo "CircleDay Worker Health Check"
echo "=============================="
echo ""

# Check if worker is running
if docker compose ps | grep -q "running"; then
    echo "✓ Worker is running"
else
    echo "❌ Worker is not running"
    exit 1
fi

# Check container health
HEALTH=$(docker inspect circleday-worker --format='{{.State.Health.Status}}' 2>/dev/null)
if [ "$HEALTH" == "healthy" ]; then
    echo "✓ Worker is healthy"
elif [ "$HEALTH" == "starting" ]; then
    echo "⏳ Worker is starting..."
else
    echo "❌ Worker health status: $HEALTH"
fi

# Show last 10 log lines
echo ""
echo "Recent logs:"
echo "------------"
docker compose logs --tail=10 worker

# Show resource usage
echo ""
echo "Resource usage:"
echo "---------------"
docker stats --no-stream circleday-worker

exit 0

