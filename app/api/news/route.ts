import { type NextRequest, NextResponse } from "next/server"
import { getNewsItems, createNewsItem } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const news = await getNewsItems(limit, offset)

    return NextResponse.json({
      success: true,
      news: news.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        source: item.source,
        sentiment: item.sentiment,
        url: item.url,
        publishedAt: item.published_at,
        createdAt: item.created_at,
      })),
    })
  } catch (error) {
    console.error("Get news error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, source, sentiment, url, publishedAt } = await request.json()

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
    }

    const newsItem = await createNewsItem({
      title,
      content,
      source,
      sentiment,
      url,
      publishedAt: publishedAt ? new Date(publishedAt) : undefined,
    })

    return NextResponse.json({
      success: true,
      news: {
        id: newsItem.id,
        title: newsItem.title,
        content: newsItem.content,
        source: newsItem.source,
        sentiment: newsItem.sentiment,
        url: newsItem.url,
        publishedAt: newsItem.published_at,
        createdAt: newsItem.created_at,
      },
    })
  } catch (error) {
    console.error("Create news error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
