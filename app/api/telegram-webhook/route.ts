import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Basic Telegram webhook structure validation
    if (!body.message) {
      return NextResponse.json({ ok: true })
    }

    const { message } = body
    const chatId = message.chat.id
    const text = message.text

    // Handle different commands
    if (text?.startsWith("/start")) {
      // Send welcome message
      console.log(`New user started bot: ${chatId}`)
    } else if (text?.startsWith("/signals")) {
      // Send latest trading signals
      console.log(`User requested signals: ${chatId}`)
    } else if (text?.startsWith("/portfolio")) {
      // Send portfolio summary
      console.log(`User requested portfolio: ${chatId}`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
