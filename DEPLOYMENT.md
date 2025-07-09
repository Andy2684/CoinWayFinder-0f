# CoinWayFinder Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: MongoDB Atlas or similar
3. **Redis**: Upstash Redis or similar
4. **Stripe Account**: For subscription management
5. **OpenAI API Key**: For AI analysis features

## Environment Variables

Set these in your Vercel dashboard under Settings > Environment Variables:

### Required Variables
\`\`\`
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=https://your-domain.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coinwayfinder
REDIS_URL=redis://default:password@redis-url:port
JWT_SECRET=your-jwt-secret-key
API_SECRET_KEY=your-api-secret-key
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
\`\`\`

### Stripe Configuration
\`\`\`
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
\`\`\`

### AI Integration
\`\`\`
OPENAI_API_KEY=sk-...
\`\`\`

## Deployment Steps

### 1. Install Vercel CLI
\`\`\`bash
npm install -g vercel
\`\`\`

### 2. Login to Vercel
\`\`\`bash
vercel login
\`\`\`

### 3. Deploy
\`\`\`bash
# Run the deployment script
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh

# Or deploy manually
vercel --prod
\`\`\`

### 4. Configure Domain (Optional)
- Go to Vercel dashboard
- Navigate to your project
- Go to Settings > Domains
- Add your custom domain

### 5. Set up Database
1. Create MongoDB Atlas cluster
2. Create database named \`coinwayfinder\`
3. Add connection string to \`MONGODB_URI\`

### 6. Set up Redis
1. Create Upstash Redis database
2. Add connection string to \`REDIS_URL\`

### 7. Configure Stripe Webhooks
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: \`https://your-domain.vercel.app/api/stripe/webhook\`
3. Select events: \`checkout.session.completed\`, \`invoice.payment_succeeded\`
4. Copy webhook secret to \`STRIPE_WEBHOOK_SECRET\`

## Post-Deployment Setup

### 1. Test API Endpoints
\`\`\`bash
curl https://your-domain.vercel.app/api/health
\`\`\`

### 2. Create Admin User
1. Visit: \`https://your-domain.vercel.app\`
2. Sign up with admin credentials
3. Use admin panel to manage users

### 3. Configure Cron Jobs
- Vercel automatically handles the cron job defined in \`vercel.json\`
- Monitor at: \`https://your-domain.vercel.app/api/bots/scheduler\`

## Monitoring

### 1. Vercel Analytics
- Enable in Vercel dashboard
- Monitor performance and usage

### 2. Error Tracking
- Check Vercel function logs
- Monitor API endpoint responses

### 3. Database Monitoring
- Monitor MongoDB Atlas metrics
- Check Redis usage in Upstash

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs in Vercel dashboard

2. **Database Connection**
   - Verify MongoDB URI format
   - Check IP whitelist in MongoDB Atlas
   - Test connection locally first

3. **Environment Variables**
   - Ensure all required vars are set
   - Check for typos in variable names
   - Verify secret values are correct

4. **Stripe Integration**
   - Test webhook endpoints
   - Verify API keys (test vs live)
   - Check webhook secret configuration

### Support

For deployment issues:
1. Check Vercel documentation
2. Review function logs
3. Test API endpoints individually
4. Contact support if needed

## Security Checklist

- [ ] All API keys are set as environment variables
- [ ] Database has proper authentication
- [ ] Redis is password protected
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Webhook secrets are configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place

## Performance Optimization

- [ ] Enable Vercel Analytics
- [ ] Configure CDN for static assets
- [ ] Implement caching strategies
- [ ] Monitor function execution times
- [ ] Optimize database queries
- [ ] Use Redis for session storage
\`\`\`

Let's also create a health check endpoint to verify deployment:
