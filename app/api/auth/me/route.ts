// app/api/auth/me/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Заглушка проверки авторизации
    // В реальном коде вы бы декодировали JWT из заголовков:
    // const authHeader = request.headers.get("Authorization");
    // const token = authHeader?.split(" ")[1];
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // const userId = (decoded as any).userId;

    const userId = "stub-user-id";

    // Заглушка данных пользователя
    const user = {
      id: userId,
      email: "stub@example.com",
      role: "user",
    };

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 401 }
    );
  }
}
