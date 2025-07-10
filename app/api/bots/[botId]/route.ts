import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { botId: string } }) {
  try {
    const userId = request.headers.get("x-user-id")
    const { botId } = params

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 401 })
    }

    if (!botId) {
      return NextResponse.json({ success: false, error: "Bot ID required" }, { status: 400 })
    }

    // Simulate bot deletion
    await new Promise((resolve) => setTimeout(resolve, 200))

    return NextResponse.json({
      success: true,
      message: "Bot deleted successfully",
      botId,
    })
  } catch (error) {
    console.error("Error deleting bot:", error)
    return NextResponse.json({ success: false, error: "Failed to delete bot" }, { status: 500 })
  }
}
