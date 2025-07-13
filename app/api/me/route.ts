import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Обязательно указываем, чтобы избежать ошибок статической генерации

export async function GET(req: Request) {
  try {
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    return NextResponse.json({
      success: true,
      message: "User info retrieved successfully",
      userAgent,
      ip,
    });
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
