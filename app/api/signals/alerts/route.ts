import { type NextRequest, NextResponse } from 'next/server'

interface AlertRule {
  id: string
  name: string
  condition: string
  value: string
  enabled: boolean
  channels: string[]
  created: string
}

interface AlertHistory {
  id: string
  title: string
  message: string
  time: string
  type: 'signal' | 'success' | 'warning'
  read: boolean
}

// Mock data - in production, this would come from your database
const mockAlertRules: AlertRule[] = [
  {
    id: '1',
    name: 'High Confidence Signals',
    condition: 'confidence_above',
    value: '85',
    enabled: true,
    channels: ['push', 'email'],
    created: '2024-01-10',
  },
  {
    id: '2',
    name: 'BTC Signals',
    condition: 'symbol_contains',
    value: 'BTC',
    enabled: true,
    channels: ['push', 'telegram'],
    created: '2024-01-09',
  },
]

const mockAlertHistory: AlertHistory[] = [
  {
    id: '1',
    title: 'High Confidence BTC Signal',
    message: 'New BUY signal for BTC/USDT with 89% confidence',
    time: '2 minutes ago',
    type: 'signal',
    read: false,
  },
  {
    id: '2',
    title: 'Target Reached',
    message: 'ETH/USDT signal reached target price',
    time: '1 hour ago',
    type: 'success',
    read: true,
  },
  {
    id: '3',
    title: 'Stop Loss Triggered',
    message: 'SOL/USDT signal stopped out',
    time: '3 hours ago',
    type: 'warning',
    read: true,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'rules'

    if (type === 'rules') {
      return NextResponse.json({ rules: mockAlertRules })
    } else if (type === 'history') {
      return NextResponse.json({ history: mockAlertHistory })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const alertData = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'condition', 'value', 'channels']
    for (const field of requiredFields) {
      if (!alertData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create new alert rule
    const newRule: AlertRule = {
      id: Date.now().toString(),
      name: alertData.name,
      condition: alertData.condition,
      value: alertData.value,
      enabled: true,
      channels: alertData.channels,
      created: new Date().toISOString().split('T')[0],
    }

    mockAlertRules.push(newRule)

    return NextResponse.json(newRule, { status: 201 })
  } catch (error) {
    console.error('Error creating alert rule:', error)
    return NextResponse.json({ error: 'Failed to create alert rule' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const updates = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing alert rule ID' }, { status: 400 })
    }

    const ruleIndex = mockAlertRules.findIndex((rule) => rule.id === id)
    if (ruleIndex === -1) {
      return NextResponse.json({ error: 'Alert rule not found' }, { status: 404 })
    }

    mockAlertRules[ruleIndex] = { ...mockAlertRules[ruleIndex], ...updates }

    return NextResponse.json(mockAlertRules[ruleIndex])
  } catch (error) {
    console.error('Error updating alert rule:', error)
    return NextResponse.json({ error: 'Failed to update alert rule' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing alert rule ID' }, { status: 400 })
    }

    const ruleIndex = mockAlertRules.findIndex((rule) => rule.id === id)
    if (ruleIndex === -1) {
      return NextResponse.json({ error: 'Alert rule not found' }, { status: 404 })
    }

    mockAlertRules.splice(ruleIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting alert rule:', error)
    return NextResponse.json({ error: 'Failed to delete alert rule' }, { status: 500 })
  }
}
