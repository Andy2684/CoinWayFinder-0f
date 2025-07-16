import { type NextRequest, NextResponse } from 'next/server'

// Mock bot data
const mockBots = [
  {
    id: '1',
    name: 'DCA Bitcoin Bot',
    strategy: 'DCA',
    status: 'active',
    pair: 'BTC/USDT',
    profit: 12.5,
    trades: 45,
    created_at: new Date().toISOString(),
    config: {
      amount: 100,
      interval: '1h',
      target_profit: 15,
    },
  },
  {
    id: '2',
    name: 'Grid Trading ETH',
    strategy: 'Grid',
    status: 'paused',
    pair: 'ETH/USDT',
    profit: -2.3,
    trades: 23,
    created_at: new Date().toISOString(),
    config: {
      grid_size: 10,
      upper_limit: 4000,
      lower_limit: 3000,
    },
  },
]

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockBots,
    })
  } catch (error) {
    console.error('Get bots error:', error)
    return NextResponse.json({ error: 'Failed to fetch bots' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const botData = await request.json()

    const newBot = {
      id: Date.now().toString(),
      ...botData,
      status: 'active',
      profit: 0,
      trades: 0,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: newBot,
    })
  } catch (error) {
    console.error('Create bot error:', error)
    return NextResponse.json({ error: 'Failed to create bot' }, { status: 500 })
  }
}
