import { type NextRequest, NextResponse } from "next/server"
import { apiKeyManager } from "@/lib/api-key-manager"

export async function DELETE(request: NextRequest, { params }: { params: { keyId: string } }) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user"
    const { keyId } = params

    const success = await apiKeyManager.revokeAPIKey(keyId, userId)

    if (!success) {
      return NextResponse.json({ success: false, error: "API key not found or already revoked" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "API key revoked successfully",
    })
  } catch (error) {
    console.error("Failed to revoke API key:", error)
    return NextResponse.json({ success: false, error: "Failed to revoke API key" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { keyId: string } }) {
  try {
    const userId = request.headers.get("x-user-id") || "demo-user"
    const { keyId } = params
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    const usage = await apiKeyManager.getAPIKeyUsage(keyId, userId, days)

    return NextResponse.json({
      success: true,
      usage,
    })
  } catch (error) {
    console.error("Failed to get API key usage:", error)
    return NextResponse.json({ success: false, error: "Failed to get API key usage" }, { status: 500 })
  }
}
