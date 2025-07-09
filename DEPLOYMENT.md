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
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster (M0 free tier is sufficient for testing)
3. Create database user with read/write permissions
4. Whitelist your IP addresses (or use 0.0.0.0/0 for all IPs)
5. Get connection string and add to `MONGODB_URI`

### Database Collections
The application will automatically create these collections:
- `users` - User accounts and profiles
- `bots` - Trading bot configurations
- `trades` - Trade history and logs
- `subscriptions` - User subscription data
- `api_keys` - API key management
- `sessions` - User session data
- `logs` - Application logs

## 💳 Payment Setup (Optional)

### Stripe Configuration
1. Create account at [Stripe](https://stripe.com)
2. Get API keys from Dashboard > Developers > API keys
3. Create products and prices for subscription plans
4. Set up webhooks (see webhook section below)

### Subscription Plans
Create these products in Stripe:
- **Starter Plan**: $29/month
- **Pro Plan**: $99/month  
- **Enterprise Plan**: $299/month

## 🔗 Webhook Configuration

### Stripe Webhooks
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 🚀 Deployment Steps

### Step 1: Prepare Repository
\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/coinwayfinder.git
cd coinwayfinder

# Install dependencies
npm install --legacy-peer-deps
\`\`\`

### Step 2: Configure Environment
\`\`\`bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
\`\`\`

### Step 3: Test Locally
\`\`\`bash
# Run development server
npm run dev

# Test the application
npm run test

# Run deployment tests
npm run test:deployment
\`\`\`

### Step 4: Deploy to Vercel
\`\`\`bash
# Login to Vercel
vercel login

# Deploy
vercel --prod

# Or use the automated script
./scripts/deploy-vercel.sh
\`\`\`

## 🧪 Testing Deployment

### Automated Testing
\`\`\`bash
# Test local deployment
npm run test:deployment

# Test production deployment
npm run test:deployment https://your-app.vercel.app

# Run comprehensive tests
./scripts/run-tests.sh https://your-app.vercel.app
\`\`\`

### Manual Testing Checklist
- [ ] Home page loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard displays properly
- [ ] Bot creation functions
- [ ] API endpoints respond
- [ ] Payment flow works (if configured)
- [ ] Health check passes: `/api/health`
- [ ] Test suite passes: `/api/test`

## 📊 Monitoring & Analytics

### Vercel Analytics
1. Enable in Vercel dashboard
2. Go to your project > Analytics
3. Monitor page views, performance, and errors

### Application Monitoring
- Health endpoint: `https://your-app.vercel.app/api/health`
- Test endpoint: `https://your-app.vercel.app/api/test`
- API documentation: `https://your-app.vercel.app/api-docs`

### Performance Optimization
- Enable Vercel Edge Functions for better performance
- Use Vercel Image Optimization for images
- Configure caching headers appropriately
- Monitor function execution times

## 🔒 Security Considerations

### Environment Variables
- Never commit secrets to version control
- Use strong, unique secrets for JWT and NextAuth
- Rotate API keys regularly
- Use different keys for development and production

### Database Security
- Use strong database passwords
- Enable MongoDB Atlas IP whitelisting
- Regular backup your database
- Monitor for unusual activity

### API Security
- Implement rate limiting
- Validate all inputs
- Use HTTPS everywhere
- Monitor API usage

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
\`\`\`bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
\`\`\`

#### Environment Variable Issues
- Check variable names for typos
- Ensure all required variables are set
- Verify values are correct (no extra spaces)
- Check Vercel dashboard for proper configuration

#### Database Connection Issues
- Verify MongoDB URI format
- Check IP whitelist in MongoDB Atlas
- Test connection locally first
- Check database user permissions

#### Deployment Failures
- Check Vercel function logs
- Verify all dependencies are listed in package.json
- Check for Node.js version compatibility
- Review build output for errors

### Getting Help
1. Check Vercel deployment logs
2. Review application logs in Vercel dashboard
3. Test endpoints individually
4. Use the health check endpoint for diagnostics
5. Contact support if issues persist

## 📈 Scaling Considerations

### Performance Optimization
- Use Vercel Edge Functions for global distribution
- Implement Redis caching for frequently accessed data
- Optimize database queries with proper indexing
- Use CDN for static assets

### Database Scaling
- Monitor MongoDB Atlas metrics
- Consider upgrading to dedicated clusters for production
- Implement database connection pooling
- Use read replicas for read-heavy operations

### Cost Optimization
- Monitor Vercel function execution times
- Optimize cold start times
- Use appropriate Vercel plan for your needs
- Monitor bandwidth usage

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

\`\`\`yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install --legacy-peer-deps
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
\`\`\`

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Stripe Documentation](https://stripe.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 🎯 Post-Deployment Checklist

- [ ] Application is accessible at production URL
- [ ] All environment variables are configured
- [ ] Database connection is working
- [ ] Payment processing is functional (if configured)
- [ ] API endpoints are responding correctly
- [ ] Health checks are passing
- [ ] Monitoring is set up
- [ ] Backups are configured
- [ ] Security measures are in place
- [ ] Documentation is updated
- [ ] Team has access to necessary accounts

---

**Need Help?** 
- Check the troubleshooting section above
- Review Vercel deployment logs
- Test individual components using `/api/test`
- Contact support if issues persist

**Success!** 🎉
Your CoinWayFinder application should now be successfully deployed and running on Vercel!
