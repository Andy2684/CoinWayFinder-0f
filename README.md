# CoinWayFinder - AI-Powered Crypto Trading Platform

A comprehensive cryptocurrency trading platform with AI-powered signals, automated trading bots, and real-time market analysis.

## Features

- 🤖 **AI Trading Signals** - Advanced algorithms analyze market trends
- 🔄 **Automated Trading Bots** - Set-and-forget trading strategies
- 📊 **Real-time Analytics** - Live market data and portfolio tracking
- 🔗 **Exchange Integration** - Connect to major crypto exchanges
- 📰 **News Sentiment Analysis** - AI-powered market news analysis
- 🔐 **Secure Authentication** - Protected user accounts and API keys

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Charts**: Recharts
- **Authentication**: JWT, bcrypt
- **AI**: Vercel AI SDK with OpenAI integration

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository
\`\`\`bash
git clone https://github.com/your-username/coinwayfinder.git
cd coinwayfinder
\`\`\`

2. Install dependencies
\`\`\`bash
pnpm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Run the development server
\`\`\`bash
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a \`.env.local\` file in the root directory with the following variables:

\`\`\`
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
XAI_API_KEY=your-xai-api-key
JWT_SECRET=your-jwt-secret
\`\`\`

## Project Structure

\`\`\`
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   └── ...
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── auth/          # Authentication components
│   ├── dashboard/     # Dashboard components
│   └── ...
├── lib/               # Utility functions
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── styles/            # Global styles
\`\`\`

## Features Overview

### Trading Dashboard
- Portfolio overview with P&L tracking
- Active trading strategies
- Real-time market data
- Quick action buttons

### AI Trading Signals
- Machine learning-powered market analysis
- Signal performance tracking
- Custom alerts and notifications
- Historical signal data

### Trading Bots
- Multiple strategy templates
- Automated execution
- Performance monitoring
- Risk management tools

### Exchange Integration
- Secure API key management
- Multi-exchange support
- Real-time order book data
- Trading execution

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@coinwayfinder.com or join our [Discord community](https://discord.gg/coinwayfinder).
