import { NextResponse } from 'next/server'

// Mock news data
const mockNews = [
  {
    id: '1',
    title: 'Bitcoin Reaches New All-Time High Above $100,000',
    summary:
      'Bitcoin has surged past the $100,000 milestone for the first time, driven by institutional adoption and regulatory clarity.',
    content:
      'In a historic moment for cryptocurrency, Bitcoin has broken through the $100,000 barrier, marking a significant milestone in its journey from a niche digital asset to a mainstream financial instrument. The surge comes amid increased institutional adoption, with major corporations adding Bitcoin to their treasury reserves and traditional financial institutions launching Bitcoin-focused products.',
    source: 'CryptoNews',
    url: 'https://example.com/bitcoin-100k',
    published_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    sentiment_score: 0.8,
    impact_score: 0.9,
    tags: ['Bitcoin', 'Price', 'ATH', 'Institutional'],
  },
  {
    id: '2',
    title: 'Ethereum 2.0 Staking Rewards Increase to 5.2% APY',
    summary:
      'Ethereum staking rewards have increased following the latest network upgrade, attracting more validators to secure the network.',
    content:
      'The Ethereum network has seen a significant increase in staking rewards, now offering an annual percentage yield (APY) of 5.2% for validators. This increase comes after the successful implementation of the latest network upgrade, which has improved the efficiency of the proof-of-stake consensus mechanism.',
    source: 'EthereumDaily',
    url: 'https://example.com/eth-staking',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    sentiment_score: 0.6,
    impact_score: 0.7,
    tags: ['Ethereum', 'Staking', 'Rewards', 'Upgrade'],
  },
  {
    id: '3',
    title: 'SEC Approves First Solana ETF Application',
    summary:
      'The Securities and Exchange Commission has approved the first Solana exchange-traded fund, opening new investment opportunities.',
    content:
      'In a groundbreaking decision, the U.S. Securities and Exchange Commission has approved the first Solana-based exchange-traded fund (ETF). This approval marks a significant step forward for alternative cryptocurrency investments and could pave the way for more diverse crypto ETF offerings.',
    source: 'RegulationToday',
    url: 'https://example.com/solana-etf',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    sentiment_score: 0.7,
    impact_score: 0.8,
    tags: ['Solana', 'ETF', 'SEC', 'Regulation'],
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockNews,
    })
  } catch (error) {
    console.error('Get news error:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
