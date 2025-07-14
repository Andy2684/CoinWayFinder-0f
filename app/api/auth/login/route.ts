// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Заглушка проверки учётных данных:
    if (email === "test@example.com" && password === "password") {
      const user = { id: "1", email };
      return NextResponse.json({ success: true, user });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to login" },
      { status: 500 }
    );
  }
}
