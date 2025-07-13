import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()

    // Basic webhook validation
    if (!update.message && !update.callback_query) {
      return NextResponse.json({ ok: true })
    }

    const message = update.message
    const callbackQuery = update.callback_query

    if (message) {
      const chatId = message.chat.id
      const text = message.text

      // Handle different commands
      if (text?.startsWith("/start")) {
        // Send welcome message
        console.log(`New user started bot: ${chatId}`)
        // In production, you would send a message back via Telegram API
      } else if (text?.startsWith("/signals")) {
        // Send trading signals
        console.log(`User requested signals: ${chatId}`)
        // In production, fetch and send latest signals
      } else if (text?.startsWith("/portfolio")) {
        // Send portfolio information
        console.log(`User requested portfolio: ${chatId}`)
        // In production, fetch user's portfolio data
      }
    }

    if (callbackQuery) {
      const chatId = callbackQuery.message?.chat.id
      const data = callbackQuery.data

      console.log(`Callback query received: ${data} from ${chatId}`)
      // Handle button callbacks
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" })
}
