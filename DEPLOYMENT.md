# CoinWayFinder Deployment Guide

Complete guide for deploying the CoinWayFinder cryptocurrency trading bot platform to Vercel.

## 🚀 Quick Deploy

### Option 1: Automated Script
\`\`\`bash
# Make script executable
chmod +x scripts/deploy-vercel.sh

# Run deployment
./scripts/deploy-vercel.sh
\`\`\`

### Option 2: Manual Deploy
\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
\`\`\`

## 📋 Prerequisites

### Required Tools
- Node.js 18+ 
- npm 8+
- Vercel CLI
- Git

### Required Services
- MongoDB Atlas (database)
- Vercel account (hosting)
- Stripe account (payments) - optional
- OpenAI API key (AI features) - optional

## ⚙️ Environment Variables

### Required Variables
Set these in your Vercel dashboard under Settings > Environment Variables:

\`\`\`env
# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_SECRET=your-nextauth-secret-here

# Application
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coinwayfinder
\`\`\`

### Optional Variables (for full functionality)
\`\`\`env
# Redis Cache
REDIS_URL=redis://username:password@host:port

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Subscription Plans
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# AI Features
OPENAI_API_KEY=sk-...

# External APIs
COINGECKO_API_KEY=your-api-key
NEWSAPI_KEY=your-api-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret
\`\`\`

## 🗄️ Database Setup

### MongoDB Atlas Setup
1.
