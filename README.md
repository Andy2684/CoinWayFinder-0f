# Coinwayfinder

A comprehensive cryptocurrency trading platform with AI-powered signals, automated trading bots, and real-time market analysis.

## Features

- **AI-Powered Trading Signals**: Get intelligent trading recommendations
- **Automated Trading Bots**: Deploy and manage trading strategies
- **Real-time Market Data**: Live cryptocurrency prices and charts
- **Exchange Integrations**: Connect to major cryptocurrency exchanges
- **Risk Management**: Advanced portfolio analytics and risk controls
- **News Analysis**: Real-time crypto news with sentiment analysis

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: JWT-based auth system
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with the following variables:

\`\`\`
JWT_SECRET=your_jwt_secret
XAI_API_KEY=your_xai_api_key
\`\`\`

## Deployment

Deploy to Vercel with one click or use the Vercel CLI:

\`\`\`bash
vercel deploy
