import { type NextRequest, NextResponse } from "next/server"
import { apiKeyManager } from "@/lib/api-key-manager"

export async function DELETE(request: NextRequest, { params }: { params: { keyId: string } }) {
  try {
    const userId = request.headers.get("x-user-id") // Simplified - use your auth system

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const success = await apiKeyManager.revokeApiKey(params.keyId)

    if (!success) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "API key revoked successfully",
    })
  } catch (error) {
    console.error("Revoke API key error:", error)
    return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 })
  }
}
