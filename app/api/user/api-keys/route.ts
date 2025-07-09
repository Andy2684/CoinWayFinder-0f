import { type NextRequest, NextResponse } from "next/server"
import { apiKeyManager } from "@/lib/api-key-manager"
import { database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user"
    const apiKeys = await apiKeyManager.getUserAPIKeys(userId)

    // Remove sensitive information
    const sanitizedKeys = apiKeys.map((key) => ({
      keyId: key.keyId,
      name: key.name,
      permissions: key.permissions,
      rateLimit: key.rateLimit,
      usage: key.usage,
      isActive: key.isActive,
      createdAt: key.createdAt,
      expiresAt: key.expiresAt,
    }))

    return NextResponse.json({
      success: true,
      apiKeys: sanitizedKeys,
    })
  } catch (error) {
    console.error("Failed to get API keys:", error)
    return NextResponse.json({ success: false, error: "Failed to get API keys" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user"
    const body = await request.json()
    const { name, permissions } = body

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 })
    }

    // Get user's subscription plan to determine limits
    const userSettings = await database.getUserSettings(userId)
    const plan = userSettings?.subscription.plan || "free"
    const subscriptionStatus = userSettings?.subscription.status || "expired"

    // Check if user can create API keys (subscription must be active)
    if (subscriptionStatus !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: "Active subscription required to create API keys",
          subscriptionStatus,
          renewUrl: "/subscription",
        },
        { status: 402 },
      )
    }

    const planLimits = apiKeyManager.getPlanLimits(plan)
    const defaultPermissions = permissions || apiKeyManager.getPermissionsByPlan(plan)

    const { keyId, secret } = await apiKeyManager.createAPIKey(userId, name, defaultPermissions, planLimits)

    return NextResponse.json(
      {
        success: true,
        apiKey: {
          keyId,
          secret, // Only shown once!
          name,
          permissions: defaultPermissions,
          rateLimit: planLimits,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create API key:", error)
    return NextResponse.json({ success: false, error: "Failed to create API key" }, { status: 500 })
  }
}
