# CoinWayFinder Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a MongoDB cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **Redis Instance**: Use Upstash Redis or another Redis provider
4. **Stripe Account**: For payment processing
5. **API Keys**: Various exchange and service API keys

## Environment Variables

Configure these environment variables in your Vercel dashboard:

### Database Configuration
\`\`\`
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coinwayfinder?retryWrites=true&w=majority
REDIS_URL=redis://username:password@host:port
\`\`\`

### Authentication
\`\`\`
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
\`\`\`

### Stripe Configuration
\`\`\`
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
\`\`\`

### API Keys
\`\`\`
API_SECRET_KEY=your-api-secret-key
OPENAI_API_KEY=sk-...
\`\`\`

### App Configuration
\`\`\`
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
VERCEL_REGION=us-east-1
\`\`\`

## Deployment Steps

### 1. Prepare Repository

\`\`\`bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
\`\`\`

### 2. Import to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: \`npm install --force && npm run build\`
   - Output Directory: .next
   - Install Command: \`npm install --force\`

### 3. Configure Environment Variables

1. Go to Project Settings → Environment Variables
2. Add all environment variables listed above
3. Make sure to use production values

### 4. Configure Domains

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 5. Set Up Webhooks

Configure webhooks for:
- **Stripe**: \`https://your-domain.vercel.app/api/stripe/webhook\`
- **Telegram**: \`https://your-domain.vercel.app/api/telegram-webhook\`

## Post-Deployment Verification

### 1. Health Checks

\`\`\`bash
# Test API endpoints
curl https://your-domain.vercel.app/api/health
curl https://your-domain.vercel.app/api/crypto/prices
\`\`\`

### 2. Database Connection

- Verify MongoDB connection in logs
- Check Redis connectivity
- Test user registration/login

### 3. Payment System

- Test Stripe webhook endpoint
- Verify subscription flow
- Check payment processing

### 4. Trading Features

- Test exchange API connections
- Verify bot creation and management
- Check trade execution logs

## Monitoring & Maintenance

### Vercel Analytics
- Enable Web Analytics in project settings
- Monitor performance and usage

### Error Tracking
- Check Vercel function logs
- Monitor API endpoint performance
- Set up alerts for critical errors

### Scheduled Jobs
- Verify cron job execution: \`/api/bots/scheduler\`
- Monitor bot performance metrics
- Check automated trade execution

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check dependency conflicts
   - Verify Node.js version compatibility
   - Review build logs for specific errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify secret key formats

3. **Database Connection**
   - Whitelist Vercel IP addresses in MongoDB Atlas
   - Check connection string format
   - Verify network access settings

4. **API Rate Limits**
   - Monitor exchange API usage
   - Implement proper rate limiting
   - Use caching where appropriate

## Security Checklist

- [ ] All API keys are properly secured
- [ ] JWT secret is strong and unique
- [ ] Stripe webhook endpoints are verified
- [ ] Database access is restricted
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] Error messages don't expose sensitive data

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review function execution logs
3. Monitor database connections
4. Verify webhook configurations
\`\`\`

Let's also create a health check endpoint to verify deployment:
