# CoinWayFinder

A comprehensive cryptocurrency trading bot platform with AI-powered risk analysis, real-time market data, and automated trading strategies.

## Features

- **AI-Powered Trading Bots**: Multiple strategies including DCA, Grid Trading, Scalping, and more
- **Real-time Market Data**: Live prices, whale alerts, and market sentiment analysis
- **Risk Management**: AI-powered risk analysis and automated safety checks
- **Multi-Exchange Support**: Binance, Bybit, KuCoin, OKX integration
- **Advanced Analytics**: Performance tracking, P&L analysis, and detailed reporting
- **Subscription Management**: Tiered pricing with Stripe integration
- **Admin Dashboard**: User management and system monitoring

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with connection pooling
- **Cache**: Redis (Upstash)
- **Authentication**: JWT with secure session management
- **Payments**: Stripe for subscription billing
- **AI**: OpenAI GPT-4 for risk analysis and market sentiment
- **Monitoring**: Sentry for error tracking
- **Deployment**: Vercel with edge functions

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MongoDB database
- Redis instance
- Required API keys (see Environment Variables)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/coinwayfinder.git
cd coinwayfinder
\`\`\`

2. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configure your environment variables (see below)

5. Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
# Database
DATABASE_URL=mongodb://localhost:27017/coinwayfinder
POSTGRES_URL=your_postgres_url

# Redis
REDIS_URL=redis://localhost:6379
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Authentication
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
XAI_API_KEY=your_xai_api_key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=0.1.0

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
\`\`\`

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── subscription/      # Subscription pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── dashboard/        # Dashboard-specific components
│   ├── bots/            # Trading bot components
│   └── auth/            # Authentication components
├── lib/                  # Utility libraries
│   ├── trading-strategies/ # Bot trading strategies
│   ├── exchange-adapters/ # Exchange API adapters
│   └── utils.ts          # Common utilities
├── hooks/               # Custom React hooks
├── scripts/            # Build and deployment scripts
└── public/            # Static assets
\`\`\`

## API Documentation

### Authentication

All API endpoints require authentication via JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

### Core Endpoints

- `GET /api/auth/me` - Get current user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signup` - Register new user
- `GET /api/bots` - List user's trading bots
- `POST /api/bots` - Create new trading bot
- `GET /api/crypto/prices` - Get live crypto prices
- `GET /api/crypto/news` - Get crypto news feed

### Trading Bot Management

- `POST /api/bots/{id}/start` - Start a trading bot
- `POST /api/bots/{id}/pause` - Pause a trading bot
- `POST /api/bots/{id}/stop` - Stop a trading bot
- `GET /api/bots/{id}/performance` - Get bot performance metrics

## Trading Strategies

### Available Strategies

1. **DCA (Dollar Cost Averaging)**
   - Regular interval purchases
   - Risk Level: Low
   - Best for: Long-term accumulation

2. **Grid Trading**
   - Buy/sell orders at predetermined intervals
   - Risk Level: Medium
   - Best for: Range-bound markets

3. **Scalping**
   - High-frequency small profit trades
   - Risk Level: High
   - Best for: Volatile markets

4. **AI-Adaptive**
   - Machine learning-based strategy
   - Risk Level: Medium-High
   - Best for: Dynamic market conditions

### Risk Management

- AI-powered risk analysis before trade execution
- Automatic position sizing based on account balance
- Stop-loss and take-profit automation
- Real-time monitoring and alerts

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

\`\`\`bash
# Build the application
pnpm build

# Start production server
pnpm start
\`\`\`

### Docker Deployment

\`\`\`bash
# Build Docker image
docker build -t coinwayfinder .

# Run container
docker run -p 3000:3000 coinwayfinder
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@coinwayfinder.com or join our Discord community.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced backtesting engine
- [ ] Social trading features
- [ ] NFT trading integration
- [ ] DeFi yield farming strategies
- [ ] Multi-language support
- [ ] Advanced charting tools
- [ ] Telegram bot integration

## Disclaimer

This software is for educational purposes only. Trading cryptocurrencies involves substantial risk and may not be suitable for all investors. Past performance does not guarantee future results. Please trade responsibly and never invest more than you can afford to lose.
