#!/bin/bash

echo "🚀 Deploying CoinWayFinder with Bot Scheduler..."

# Build the application
echo "📦 Building application..."
npm run build

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build

# Start services
echo "🔄 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
curl -f http://localhost:3000/api/health || echo "❌ Main app not ready"
curl -f http://localhost:3001/health || echo "❌ Scheduler not ready"

echo "✅ Deployment complete!"
echo "🌐 Main app: http://localhost:3000"
echo "📊 Scheduler stats: http://localhost:3000/api/bots/scheduler"
