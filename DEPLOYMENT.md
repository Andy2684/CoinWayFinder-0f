# Coinwayfinder Deployment Guide

## Prerequisites

1. **Neon Database Account**: Sign up at [neon.tech](https://neon.tech)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Push your code to GitHub

## Step 1: Set up Neon Database

1. Create a new project in Neon
2. Copy the connection string from the dashboard
3. It should look like: `postgresql://username:password@host:port/database?sslmode=require`

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Deploy

### Option B: Vercel CLI
\`\`\`bash
npm i -g vercel
vercel login
vercel --prod
\`\`\`

## Step 3: Environment Variables

Add these environment variables in Vercel:

### Required Variables
- `DATABASE_URL`: Your Neon database connection string
- `JWT_SECRET`: Random 32+ character string for JWT signing
- `NEXTAUTH_SECRET`: Random 32+ character string for NextAuth

### Generate Secrets
\`\`\`bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate NEXTAUTH_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

## Step 4: Initialize Database

After deployment, initialize the database:

1. Go to your deployed app
2. Visit `/test` page
3. Run the database test to verify schema creation
4. Or manually run the SQL script in Neon's SQL editor

## Step 5: Verify Deployment

Visit your deployed app and test:

1. **Health Check**: `/api/test/health`
2. **Database Test**: `/api/test/database` 
3. **Full Test Suite**: `/test`
4. **User Registration**: `/auth/signup`
5. **Login**: `/auth/login`
6. **Dashboard**: `/dashboard`
7. **Portfolio**: `/portfolio`

## Step 6: Production Checklist

- [ ] Database initialized successfully
- [ ] All environment variables set
- [ ] Health checks passing
- [ ] User registration working
- [ ] Authentication working
- [ ] All features tested
- [ ] SSL certificate active
- [ ] Custom domain configured (optional)

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check Neon database is active
- Ensure connection string includes `?sslmode=require`

### Authentication Issues
- Verify JWT_SECRET is set
- Check NEXTAUTH_SECRET is configured
- Ensure secrets are properly generated

### Build Issues
- Check all dependencies are installed
- Verify TypeScript compilation
- Review build logs in Vercel dashboard

## Monitoring

- Use Vercel Analytics for performance monitoring
- Check Vercel Functions logs for errors
- Monitor Neon database metrics
- Set up alerts for critical issues

## Scaling

- Neon automatically scales database connections
- Vercel automatically scales serverless functions
- Consider upgrading plans for higher limits
- Implement caching for better performance

## Security

- All secrets are encrypted in Vercel
- Database connections use SSL
- JWT tokens have expiration
- API routes have authentication middleware
- Input validation on all endpoints
