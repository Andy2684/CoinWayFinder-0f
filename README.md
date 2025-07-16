# Coinwayfinder - Advanced Crypto Trading Platform

A comprehensive cryptocurrency trading platform with AI-powered signals, automated trading bots, portfolio management, and real-time market analysis.

## 🚀 Features

### Core Trading Features
- **Portfolio Management** - Track positions, P&L, and asset allocation
- **Trading Signals** - AI-powered buy/sell recommendations
- **Automated Trading Bots** - Custom strategies with backtesting
- **Real-time Market Data** - Live prices and market analysis
- **News Integration** - Crypto news with sentiment analysis

### Advanced Features
- **Risk Management** - Position limits and stop-loss settings
- **Price Alerts** - Custom notifications for price movements
- **Trade History** - Complete trading record with analytics
- **Exchange Integration** - Connect multiple exchanges securely
- **Performance Analytics** - Detailed charts and metrics

### Security & Authentication
- **JWT Authentication** - Secure user sessions
- **Email Verification** - Account security
- **Encrypted API Keys** - Secure exchange connections
- **Role-based Access** - Admin and user permissions

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Database**: Neon PostgreSQL
- **Authentication**: JWT, bcryptjs
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm/pnpm/yarn
- Neon Database account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/yourusername/coinwayfinder.git
cd coinwayfinder
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
pnpm install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your values:
\`\`\`env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"
\`\`\`

4. **Initialize the database**
\`\`\`bash
npm run db:init
\`\`\`

5. **Start development server**
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables
- Deploy

3. **Initialize production database**
After deployment, run the database initialization script.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - User accounts and authentication
- `trading_signals` - AI-generated trading signals
- `trading_bots` - Automated trading bot configurations
- `portfolios` - User portfolio positions
- `trade_history` - Complete trading history
- `news_articles` - Crypto news with sentiment analysis
- `alerts` - Price alerts and notifications
- `risk_settings` - User risk management preferences
- `exchange_connections` - Encrypted exchange API keys

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Trading
- `GET /api/signals` - Get trading signals
- `POST /api/signals` - Create trading signal
- `GET /api/bots` - Get trading bots
- `POST /api/bots` - Create trading bot

### Portfolio
- `GET /api/portfolio` - Get user portfolio
- `POST /api/portfolio` - Update portfolio position
- `GET /api/trades` - Get trade history
- `POST /api/trades` - Record new trade

### Alerts & Settings
- `GET /api/alerts` - Get user alerts
- `POST /api/alerts` - Create price alert
- `GET /api/risk-settings` - Get risk settings
- `POST /api/risk-settings` - Update risk settings

## 🎨 UI Components

The application uses shadcn/ui components:

- **Navigation** - Responsive sidebar with collapsible menu
- **Dashboard** - Overview cards with charts and metrics
- **Tables** - Sortable data tables for trades and signals
- **Forms** - Validated forms for user input
- **Charts** - Interactive charts for performance data
- **Dialogs** - Modal dialogs for actions and settings

## 🔐 Security Features

- **Password Hashing** - bcryptjs for secure password storage
- **JWT Tokens** - Secure authentication tokens
- **API Key Encryption** - Exchange API keys are encrypted
- **Input Validation** - All user inputs are validated
- **CORS Protection** - Cross-origin request protection
- **Rate Limiting** - API rate limiting (configurable)

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
\`\`\`

## 📈 Performance

- **Server-Side Rendering** - Fast initial page loads
- **Static Generation** - Pre-built pages where possible
- **Image Optimization** - Automatic image optimization
- **Code Splitting** - Automatic code splitting
- **Caching** - Intelligent caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the docs folder
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions
- **Email**: support@coinwayfinder.com

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced charting tools
- [ ] Social trading features
- [ ] Copy trading functionality
- [ ] DeFi protocol integration
- [ ] NFT portfolio tracking
- [ ] Advanced order types
- [ ] Multi-language support

## ⚡ Quick Start

\`\`\`bash
# Clone and setup
git clone https://github.com/yourusername/coinwayfinder.git
cd coinwayfinder
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your database URL and secrets

# Initialize database and start
npm run db:init
npm run dev
\`\`\`

## 🏗️ Architecture

\`\`\`
coinwayfinder/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── ...
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── ...
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── scripts/              # Database and utility scripts
└── public/               # Static assets
\`\`\`

---

Built with ❤️ by the Coinwayfinder team
