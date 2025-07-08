#!/bin/bash

echo "🚀 Deploying CoinWayFinder Bot System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/coinwayfinder?authSource=admin

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# OpenAI (for AI risk analysis)
OPENAI_API_KEY=your-openai-api-key

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Exchange APIs (encrypted in database)
BINANCE_API_KEY=your-binance-api-key
BINANCE_API_SECRET=your-binance-api-secret
EOF
    echo "✅ .env file created. Please update with your actual API keys."
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker-compose ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📱 Web Application: http://localhost:3000"
echo "📊 Redis: localhost:6379"
echo "🗄️  MongoDB: localhost:27017"
echo ""
echo "🔧 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart scheduler: docker-compose restart scheduler"
echo "  View queue stats: curl http://localhost:3000/api/bots/scheduler"
echo ""
echo "⚠️  Don't forget to update your .env file with real API keys!"
