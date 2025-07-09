#!/bin/bash

echo "🚀 Deploying CoinWayFinder to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Create .env.local for local development
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Authentication
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Database
MONGODB_URI=your-mongodb-connection-string

# Redis
REDIS_URL=your-redis-connection-string

# JWT
JWT_SECRET=your-jwt-secret-key

# Stripe
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_STARTER_PRICE_ID=your-starter-price-id
STRIPE_PRO_PRICE_ID=your-pro-price-id
STRIPE_ENTERPRISE_PRICE_ID=your-enterprise-price-id

# OpenAI (for AI analysis)
OPENAI_API_KEY=your-openai-api-key

# API Configuration
API_SECRET_KEY=your-api-secret-key

# Public URLs
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
EOF
    echo "✅ .env.local file created. Please update with your actual values."
fi

# Clean install dependencies
echo "🧹 Cleaning and installing dependencies..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment process initiated!"
echo ""
echo "⚠️  Important: Set these environment variables in Vercel dashboard:"
echo "   - MONGODB_URI"
echo "   - REDIS_URL"
echo "   - JWT_SECRET"
echo "   - NEXTAUTH_SECRET"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - OPENAI_API_KEY"
echo "   - API_SECRET_KEY"
echo ""
echo "🔧 After deployment, configure:"
echo "   1. Database connection"
echo "   2. Redis connection (Upstash recommended)"
echo "   3. Stripe webhooks"
echo "   4. Domain settings"
