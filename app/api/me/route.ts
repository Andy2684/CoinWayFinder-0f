export const dynamic = "force-dynamic"; // Указываем, чтобы избежать ошибок статической генерации

import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    return NextResponse.json({
      success: true,
      message: "User info retrieved successfully",
      userAgent,
      ip,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
