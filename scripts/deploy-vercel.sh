#!/bin/bash

echo "🚀 Deploying CoinWayFinder to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Set up environment variables
echo "🔧 Setting up environment variables..."

# Core environment variables
vercel env add MONGODB_URI production
vercel env add REDIS_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# API Keys
vercel env add OPENAI_API_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production

# Price IDs
vercel env add STRIPE_STARTER_PRICE_ID production
vercel env add STRIPE_PRO_PRICE_ID production
vercel env add STRIPE_ENTERPRISE_PRICE_ID production

# Database
vercel env add DB_NAME production
vercel env add API_SECRET_KEY production

# Public URLs
vercel env add NEXT_PUBLIC_BASE_URL production

# JWT Secret
vercel env add JWT_SECRET production

# Deploy to production
echo "🌟 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your MongoDB Atlas database"
echo "2. Set up Redis instance (Upstash recommended)"
echo "3. Configure Stripe webhook endpoints"
echo "4. Test all API endpoints"
echo "5. Verify cron jobs are running"
