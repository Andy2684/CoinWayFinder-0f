#!/bin/bash

# CoinWayFinder Vercel Deployment Script
# Automated deployment with comprehensive checks and optimizations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo "🚀 CoinWayFinder Vercel Deployment Script"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    log_error "Vercel CLI is not installed"
    log_info "Installing Vercel CLI..."
    npm install -g vercel
    log_success "Vercel CLI installed"
fi

# Check if user is logged in to Vercel
log_info "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    log_warning "Not logged in to Vercel"
    log_info "Please log in to Vercel..."
    vercel login
fi

VERCEL_USER=$(vercel whoami)
log_success "Logged in as: $VERCEL_USER"

# Pre-deployment checks
log_info "Running pre-deployment checks..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Are you in the right directory?"
    exit 1
fi

# Check if required files exist
REQUIRED_FILES=("next.config.mjs" "vercel.json" "tailwind.config.ts" "tsconfig.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "Required file $file not found"
        exit 1
    fi
done

log_success "All required files present"

# Check environment variables
log_info "Checking environment variables..."

REQUIRED_ENV_VARS=("JWT_SECRET" "NEXTAUTH_SECRET" "NEXT_PUBLIC_BASE_URL")
MISSING_ENV_VARS=()

for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_ENV_VARS+=("$var")
    fi
done

if [ ${#MISSING_ENV_VARS[@]} -gt 0 ]; then
    log_warning "Missing environment variables: ${MISSING_ENV_VARS[*]}"
    log_info "These should be set in your Vercel dashboard"
else
    log_success "All required environment variables are set"
fi

# Optional environment variables check
OPTIONAL_ENV_VARS=("MONGODB_URI" "REDIS_URL" "STRIPE_SECRET_KEY" "OPENAI_API_KEY")
MISSING_OPTIONAL=()

for var in "${OPTIONAL_ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_OPTIONAL+=("$var")
    fi
done

if [ ${#MISSING_OPTIONAL[@]} -gt 0 ]; then
    log_warning "Missing optional environment variables: ${MISSING_OPTIONAL[*]}"
    log_info "Some features may not work without these"
fi

# Clean up previous builds
log_info "Cleaning up previous builds..."
rm -rf .next
rm -rf node_modules/.cache
log_success "Cleanup completed"

# Install dependencies
log_info "Installing dependencies..."
npm install --legacy-peer-deps
log_success "Dependencies installed"

# Run type checking
log_info "Running type checking..."
if npm run type-check &> /dev/null; then
    log_success "Type checking passed"
else
    log_warning "Type checking failed, but continuing deployment"
fi

# Run linting
log_info "Running linting..."
if npm run lint &> /dev/null; then
    log_success "Linting passed"
else
    log_warning "Linting failed, but continuing deployment"
fi

# Build the application locally to check for errors
log_info "Building application locally..."
if npm run build; then
    log_success "Local build successful"
else
    log_error "Local build failed. Please fix the errors before deploying."
    exit 1
fi

# Check if this is the first deployment
if vercel ls | grep -q "coinwayfinder"; then
    log_info "Existing deployment found - this will be an update"
    DEPLOYMENT_TYPE="update"
else
    log_info "No existing deployment found - this will be a new deployment"
    DEPLOYMENT_TYPE="new"
fi

# Deploy to Vercel
log_info "Deploying to Vercel..."

# Deploy with production flag
if vercel --prod --yes; then
    log_success "Deployment successful!"
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls --scope="$VERCEL_USER" | grep coinwayfinder | head -1 | awk '{print $2}')
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        log_success "Deployment URL: https://$DEPLOYMENT_URL"
        
        # Wait a moment for deployment to be ready
        log_info "Waiting for deployment to be ready..."
        sleep 10
        
        # Test the deployment
        log_info "Testing deployment..."
        
        # Test health endpoint
        if curl -s -f "https://$DEPLOYMENT_URL/api/health" > /dev/null; then
            log_success "Health endpoint is responding"
        else
            log_warning "Health endpoint is not responding yet"
        fi
        
        # Test home page
        if curl -s -f "https://$DEPLOYMENT_URL" > /dev/null; then
            log_success "Home page is loading"
        else
            log_warning "Home page is not loading yet"
        fi
        
        # Run comprehensive tests if test script exists
        if [ -f "scripts/run-tests.sh" ]; then
            log_info "Running deployment tests..."
            if bash scripts/run-tests.sh "https://$DEPLOYMENT_URL"; then
                log_success "All deployment tests passed!"
            else
                log_warning "Some deployment tests failed. Check the output above."
            fi
        fi
        
        # Display deployment information
        echo ""
        echo "🎉 Deployment Complete!"
        echo "======================"
        echo "🌐 URL: https://$DEPLOYMENT_URL"
        echo "📊 Health Check: https://$DEPLOYMENT_URL/api/health"
        echo "🧪 Test Suite: https://$DEPLOYMENT_URL/api/test"
        echo "📚 API Docs: https://$DEPLOYMENT_URL/api-docs"
        echo ""
        
        # Show next steps
        echo "📋 Next Steps:"
        echo "=============="
        echo "1. Visit your application: https://$DEPLOYMENT_URL"
        echo "2. Check health status: https://$DEPLOYMENT_URL/api/health"
        echo "3. Run comprehensive tests: https://$DEPLOYMENT_URL/api/test"
        echo "4. Configure environment variables in Vercel dashboard if needed"
        echo "5. Set up custom domain if desired"
        echo "6. Configure Stripe webhooks if using payments"
        echo "7. Set up monitoring and analytics"
        echo ""
        
        # Show environment variable setup if needed
        if [ ${#MISSING_ENV_VARS[@]} -gt 0 ] || [ ${#MISSING_OPTIONAL[@]} -gt 0 ]; then
            echo "⚙️  Environment Variables Setup:"
            echo "==============================="
            echo "Go to: https://vercel.com/dashboard"
            echo "Select your project: coinwayfinder"
            echo "Go to Settings > Environment Variables"
            echo ""
            
            if [ ${#MISSING_ENV_VARS[@]} -gt 0 ]; then
                echo "Required variables to set:"
                for var in "${MISSING_ENV_VARS[@]}"; do
                    echo "  • $var"
                done
                echo ""
            fi
            
            if [ ${#MISSING_OPTIONAL[@]} -gt 0 ]; then
                echo "Optional variables for full functionality:"
                for var in "${MISSING_OPTIONAL[@]}"; do
                    echo "  • $var"
                done
                echo ""
            fi
        fi
        
        # Show webhook setup instructions
        echo "🔗 Webhook Setup (if using Stripe):"
        echo "==================================="
        echo "1. Go to Stripe Dashboard > Webhooks"
        echo "2. Add endpoint: https://$DEPLOYMENT_URL/api/stripe/webhook"
        echo "3. Select events: customer.subscription.*, invoice.payment_*"
        echo "4. Copy webhook secret to STRIPE_WEBHOOK_SECRET env var"
        echo ""
        
    else
        log_warning "Could not determine deployment URL"
    fi
    
else
    log_error "Deployment failed!"
    exit 1
fi

# Final success message
log_success "CoinWayFinder has been successfully deployed to Vercel!"
log_info "Check the URLs above to access your application"

exit 0
