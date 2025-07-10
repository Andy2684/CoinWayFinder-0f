import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { lucia } from "@/lib/auth"

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const { username, password } = await request.json()
    // basic check
    if (typeof username !== "string" || username.length < 1 || username.length > 31) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid username",
        }),
        {
          status: 400,
        },
      )
    }
    if (typeof password !== "string" || password.length < 1 || password.length > 255) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid password",
        }),
        {
          status: 400,
        },
      )
    }

    const key = await lucia.useKey("username", username, password)
    const session = await lucia.createSession(key.userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    return NextResponse.json({
      success: true,
    })
  } catch (e: any) {
    // username or password was invalid
    if (e.message === "AUTH_INVALID_KEY_ID" || e.message === "AUTH_INVALID_PASSWORD") {
      return new NextResponse(
        JSON.stringify({
          error: "Incorrect username or password",
        }),
        {
          status: 400,
        },
      )
    }
    console.error(e)
    return new NextResponse(
      JSON.stringify({
        error: "An unknown error occurred",
      }),
      {
        status: 500,
      },
    )
  }
}
