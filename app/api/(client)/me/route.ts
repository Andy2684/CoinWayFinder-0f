import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Mock user database - replace with real database
const users = [
  {
    id: "1",
    email: "demo@coinwayfinder.com",
    name: "Demo User",
    plan: "pro" as const,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key",
      ) as any;

      // Find user
      const user = users.find((u) => u.id === decoded.userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user,
      });
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
