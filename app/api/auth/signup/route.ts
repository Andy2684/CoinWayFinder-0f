import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { simpleHash, generateRandomString } from "../../../lib/security"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return new NextResponse("Missing email or password", { status: 400 })
    }

    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`

    if (existingUser.rows.length) {
      return new NextResponse("Email already in use", { status: 400 })
    }

    const salt = generateRandomString(16)
    const hashedPassword = await simpleHash(password, salt)

    await sql`
      INSERT INTO users (email, password, salt)
      VALUES (${email}, ${hashedPassword}, ${salt})
    `

    return new NextResponse("User created successfully", { status: 201 })
  } catch (error: any) {
    console.error("Signup error", error)
    return new NextResponse(error.message, { status: 500 })
  }
}
