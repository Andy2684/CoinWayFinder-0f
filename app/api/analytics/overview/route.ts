// app/api/analytics/overview/route.ts

import { NextResponse } from "next/server";
import { getAnalytics } from "@/lib/analytics/queries";

export async function GET() {
  try {
    const analytics = await getAnalytics();
    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error("Analytics overview error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
