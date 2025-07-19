import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getNewsItems } from "@/lib/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

type NewsItem = {
  id: string
  title: string
  content: string
  createdAt: string
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 })
    }

    jwt.verify(token, JWT_SECRET)

    const news: NewsItem[] = await getNewsItems()

    return NextResponse.json({
      success: true,
      news: news.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        createdAt: item.createdAt
      }))
    })
  } catch (error) {
    console.error("News fetch error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
