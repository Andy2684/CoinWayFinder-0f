#!/bin/bash

# CoinWayFinder Vercel Deployment Script
# This script handles the complete deployment process to Vercel

set -e

echo "🚀 CoinWayFinder Vercel Deployment"
echo "=================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${1}${2}${NC}"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_status $RED "❌ Vercel CLI is not installed"
    print_status $BLUE "💡 Install it with: npm i -g vercel"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_status $RED "❌ package.json not found. Are you in the project root?"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_status $YELLOW "⚠️ Not logged in to Vercel"
    print_status $BLUE "🔐 Please log in..."
    vercel login
fi

print_status $GREEN "✅ Vercel CLI ready"

# Determine deployment type
DEPLOYMENT_TYPE=${1:-"preview"}

if [ "$DEPLOYMENT_TYPE" = "production" ] || [ "$DEPLOYMENT_TYPE" = "prod" ]; then
    DEPLOYMENT_TYPE="production"
    VERCEL_FLAGS="--prod"
    print_status $BLUE "🎯 Deploying to PRODUCTION"
else
    DEPLOYMENT_TYPE="preview"
    VERCEL_FLAGS=""
    print_status $BLUE "🎯 Deploying to PREVIEW"
fi

# Pre-deployment checks
print_status $BLUE "🔍 Running pre-deployment checks..."

# Check if build passes
print_status $BLUE "🏗️ Testing build..."
if npm run build; then
    print_status $GREEN "✅ Build successful"
else
    print_status $RED "❌ Build failed"
    exit 1
fi

# Run linting
print_status $BLUE "🔍 Running linter..."
if npm run lint; then
    print_status $GREEN "✅ Linting passed"
else
    print_status $YELLOW "⚠️ Linting issues found, but continuing..."
fi

# Run tests if available
if npm run test --silent 2>/dev/null; then
    print_status $BLUE "🧪 Running tests..."
    if npm run test -- --passWithNoTests --silent; then
        print_status $GREEN "✅ Tests passed"
    else
        print_status $YELLOW "⚠️ Some tests failed, but continuing..."
    fi
fi

# Environment variables check
print_status $BLUE "🔧 Checking environment variables..."

REQUIRED_VARS=(
    "MONGODB_URI"
    "NEXTAUTH_SECRET"
    "STRIPE_SECRET_KEY"
    "STRIPE_PUBLISHABLE_KEY"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    print_status $YELLOW "⚠️ Missing environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        print_status $YELLOW "   • $var"
    done
    print_status $BLUE "💡 Make sure to set these in Vercel dashboard"
fi

# Deploy to Vercel
print_status $BLUE "🚀 Starting deployment..."

if vercel $VERCEL_FLAGS; then
    print_status $GREEN "✅ Deployment successful!"
    
    # Get deployment URL
    if [ "$DEPLOYMENT_TYPE" = "production" ]; then
        DEPLOYMENT_URL=$(vercel ls --scope $(vercel whoami) | grep "$(basename $(pwd))" | grep "READY" | head -1 | awk '{print $2}')
    else
        DEPLOYMENT_URL=$(vercel ls --scope $(vercel whoami) | grep "$(basename $(pwd))" | head -1 | awk '{print $2}')
    fi
    
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        print_status $GREEN "🌐 Deployment URL: https://$DEPLOYMENT_URL"
        
        # Run post-deployment tests
        print_status $BLUE "🧪 Running post-deployment tests..."
        
        # Wait a moment for deployment to be ready
        sleep 10
        
        # Test the deployment
        if curl -f -s "https://$DEPLOYMENT_URL/api/health" > /dev/null; then
            print_status $GREEN "✅ Deployment health check passed"
        else
            print_status $YELLOW "⚠️ Deployment health check failed, but deployment completed"
        fi
        
        # Run comprehensive tests if script exists
        if [ -f "scripts/test-deployment.ts" ]; then
            print_status $BLUE "🔬 Running comprehensive deployment tests..."
            if npx tsx scripts/test-deployment.ts "https://$DEPLOYMENT_URL"; then
                print_status $GREEN "✅ All deployment tests passed"
            else
                print_status $YELLOW "⚠️ Some deployment tests failed"
            fi
        fi
        
        print_status $GREEN "🎉 Deployment complete!"
        print_status $BLUE "📋 Next steps:"
        print_status $BLUE "   • Visit: https://$DEPLOYMENT_URL"
        print_status $BLUE "   • Monitor: https://vercel.com/dashboard"
        print_status $BLUE "   • Logs: vercel logs"
        
        if [ "$DEPLOYMENT_TYPE" = "production" ]; then
            print_status $BLUE "   • Set up monitoring and alerts"
            print_status $BLUE "   • Update DNS if needed"
        fi
        
    else
        print_status $YELLOW "⚠️ Could not determine deployment URL"
    fi
    
else
    print_status $RED "❌ Deployment failed"
    print_status $BLUE "💡 Troubleshooting:"
    print_status $BLUE "   • Check Vercel dashboard for errors"
    print_status $BLUE "   • Verify environment variables"
    print_status $BLUE "   • Check build logs: vercel logs"
    exit 1
fi

print_status $BLUE "\n🔗 Useful commands:"
print_status $BLUE "   • View logs: vercel logs"
print_status $BLUE "   • List deployments: vercel ls"
print_status $BLUE "   • Remove deployment: vercel rm <url>"
print_status $BLUE "   • Open dashboard: vercel dashboard"

echo ""
print_status $GREEN "✨ Deployment process completed!"
