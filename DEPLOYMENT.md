# CoinWayFinder Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a cluster at [mongodb.com](https://cloud.mongodb.com)
3. **Redis Instance**: Set up at [upstash.com](https://upstash.com) (recommended)
4. **Stripe Account**: For payment processing
5. **OpenAI API Key**: For AI features

## Environment Variables

Set these environment variables in your Vercel dashboard:

### Core Configuration
\`\`\`
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coinwayfinder?retryWrites=true&w=majority
REDIS_URL=redis://username:password@host:port
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters
NEXTAUTH_URL=https://your-domain.vercel.app
\`\`\`

### API Keys
\`\`\`
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
\`\`\`

### Stripe Price IDs
\`\`\`
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
\`\`\`

### Additional Configuration
\`\`\`
DB_NAME=coinwayfinder
API_SECRET_KEY=your-api-secret-key
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
JWT_SECRET=your-jwt-secret-key
\`\`\`

## Deployment Steps

### 1. Clone and Prepare Repository
\`\`\`bash
git clone <your-repo-url>
cd coinwayfinder
npm install
\`\`\`

### 2. Deploy to Vercel
\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
\`\`\`

### 3. Configure Environment Variables
Go to your Vercel dashboard → Project → Settings → Environment Variables and add all the variables listed above.

### 4. Set Up Database
- Create MongoDB Atlas cluster
- Add your IP address to the whitelist
- Create a database user
- Update MONGODB_URI with your connection string

### 5. Configure Redis
- Set up Upstash Redis instance
- Update REDIS_URL with your connection string

### 6. Configure Stripe
- Set up Stripe products and prices
- Configure webhook endpoints:
  - `https://your-domain.vercel.app/api/stripe/webhook`
  - `https://your-domain.vercel.app/api/subscription/webhook`

### 7. Verify Deployment
- Check all API endpoints are working
- Test user authentication
- Verify payment processing
- Check cron jobs are running

## Post-Deployment Configuration

### 1. Webhook Configuration
Configure these webhook endpoints in your external services:

**Stripe Webhooks:**
- URL: `https://your-domain.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`

**Coinbase Webhooks (if using):**
- URL: `https://your-domain.vercel.app/api/coinbase/webhook`

### 2. Cron Jobs
The following cron job is automatically configured:
- Bot Scheduler: Runs every 5 minutes at `/api/bots/scheduler`

### 3. API Rate Limits
Default rate limits are configured in the API middleware. Adjust as needed for your usage.

## Monitoring and Logs

### 1. Vercel Analytics
Enable Vercel Analytics in your project settings for performance monitoring.

### 2. Error Tracking
Consider integrating with Sentry or similar for error tracking:
\`\`\`bash
npm install @sentry/nextjs
\`\`\`

### 3. Database Monitoring
Monitor your MongoDB Atlas cluster and Redis instance for performance.

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **API Keys**: Rotate API keys regularly
3. **Database**: Use MongoDB Atlas with proper access controls
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure CORS properly for your domain

## Troubleshooting

### Common Issues

1. **Environment Variables**: Ensure all required variables are set
2. **Database Connection**: Check MongoDB connection string
3. **API Timeouts**: Adjust function timeouts in vercel.json
4. **Memory Issues**: Monitor function memory usage
5. **Build Errors**: Check build logs in Vercel dashboard

### Support
For deployment issues, check:
- Vercel deployment logs
- MongoDB Atlas logs
- Redis connection status
- Stripe webhook logs

## Scaling Considerations

1. **Database**: Use MongoDB Atlas auto-scaling
2. **Redis**: Consider Redis clustering for high load
3. **API Limits**: Monitor and adjust rate limits
4. **Function Timeouts**: Optimize long-running operations
5. **Caching**: Implement caching strategies for frequently accessed data
\`\`\`

Now let's create a health check endpoint to monitor the deployment:
