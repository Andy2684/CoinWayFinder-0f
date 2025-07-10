import { type NextRequest, NextResponse } from "next/server"

// Mock API keys for demo
const mockApiKeys = [
  {
    keyId: "ak_1234567890abcdef",
    name: "Trading Bot API",
    permissions: ["read", "trade"],
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
    },
    usage: {
      totalRequests: 15847,
      lastUsed: "2024-01-07T14:30:00Z",
      requestsToday: 247,
      requestsThisHour: 15,
      requestsThisMinute: 2,
    },
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    keyId: "ak_fedcba0987654321",
    name: "Portfolio Tracker",
    permissions: ["read"],
    rateLimit: {
      requestsPerMinute: 30,
      requestsPerHour: 500,
      requestsPerDay: 5000,
    },
    usage: {
      totalRequests: 3421,
      lastUsed: "2024-01-06T18:45:00Z",
      requestsToday: 89,
      requestsThisHour: 5,
      requestsThisMinute: 0,
    },
    isActive: true,
    createdAt: "2024-01-03T00:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      apiKeys: mockApiKeys,
    })
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch API keys" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "API key name is required" }, { status: 400 })
    }

    // Generate new API key
    const newApiKey = {
      keyId: `ak_${Math.random().toString(36).substring(2, 18)}`,
      secret: `sk_${Math.random().toString(36).substring(2, 50)}`,
      name,
      permissions: ["read", "trade"],
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
      },
    }

    return NextResponse.json({
      success: true,
      apiKey: newApiKey,
      message: "API key created successfully",
    })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json({ success: false, error: "Failed to create API key" }, { status: 500 })
  }
}
