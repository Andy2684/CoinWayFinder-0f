import { type NextRequest, NextResponse } from "next/server"
import { apiKeyManager } from "@/lib/api-key-manager"

export async function GET(request: NextRequest) {
  try {
    // Get user session (implement based on your auth system)
    const userId = request.headers.get("x-user-id") // Simplified - use your auth system

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKeys = await apiKeyManager.getUserApiKeys(userId)

    return NextResponse.json({
      success: true,
      data: apiKeys,
    })
  } catch (error) {
    console.error("Get API keys error:", error)
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") // Simplified - use your auth system

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, permissions, expiresInDays } = body

    if (!name) {
      return NextResponse.json({ error: "API key name is required" }, { status: 400 })
    }

    const apiKey = await apiKeyManager.createApiKey(userId, name, permissions, expiresInDays)

    return NextResponse.json({
      success: true,
      data: {
        keyId: apiKey.keyId,
        keySecret: apiKey.keySecret, // Only shown once!
        name: apiKey.name,
        permissions: apiKey.permissions,
        rateLimit: apiKey.rateLimit,
        createdAt: apiKey.createdAt,
        expiresAt: apiKey.expiresAt,
      },
      message: "API key created successfully. Save the secret key - it won't be shown again!",
    })
  } catch (error) {
    console.error("Create API key error:", error)
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 })
  }
}
