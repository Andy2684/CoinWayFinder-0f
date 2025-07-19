import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    settings: {
      max_drawdown: 10,
      position_size_limit: 5,
      daily_loss_limit: 1000,
    },
  })
}
