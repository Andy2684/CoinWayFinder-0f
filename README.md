# CoinWayFinder

A comprehensive cryptocurrency trading platform with AI-powered signals, automated trading bots, and real-time market analysis.

## Features

- **AI-Powered Trading Signals**: Get intelligent trading recommendations based on market analysis
- **Automated Trading Bots**: Deploy and manage trading bots with various strategies
- **Real-time Market Data**: Live cryptocurrency prices and market analytics
- **Exchange Integration**: Connect with major cryptocurrency exchanges
- **Risk Management**: Advanced portfolio tracking and risk assessment tools
- **News Analytics**: Real-time crypto news with sentiment analysis

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: JWT-based auth system
- **State Management**: React hooks and context
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

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

4. Run the development server:
\`\`\`bash
pnpm dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`env
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
API_SECRET_KEY=your-api-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── signals/           # Trading signals pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── signals/          # Signal components
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
\`\`\`

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
