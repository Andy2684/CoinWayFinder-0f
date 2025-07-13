import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    // Handle Telegram webhook
    if (update.message) {
      const chatId = update.message.chat.id
      const text = update.message.text

      // Simple command handling
      if (text === "/start") {
        // Send welcome message
        console.log(`Welcome message sent to chat ${chatId}`)
      } else if (text === "/signals") {
        // Send latest signals
        console.log(`Signals sent to chat ${chatId}`)
      } else if (text === "/portfolio") {
        // Send portfolio summary
        console.log(`Portfolio summary sent to chat ${chatId}`)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
