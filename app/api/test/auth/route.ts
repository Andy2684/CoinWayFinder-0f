import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { createUser, getUserByEmail } from "@/lib/database"
import { sql } from "@/lib/database" // Declare the sql variable

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST() {
  try {
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = "TestPassword123!"
    const testUsername = `testuser${Date.now()}`

    // Test user creation
    const passwordHash = await bcrypt.hash(testPassword, 12)

    const newUser = await createUser({
      email: testEmail,
      username: testUsername,
      passwordHash,
      firstName: "Test",
      lastName: "User",
    })

    if (!newUser) {
      throw new Error("Failed to create test user")
    }

    // Test user retrieval
    const retrievedUser = await getUserByEmail(testEmail)

    if (!retrievedUser) {
      throw new Error("Failed to retrieve test user")
    }

    // Test password verification
    const passwordValid = await bcrypt.compare(testPassword, retrievedUser.password_hash)

    if (!passwordValid) {
      throw new Error("Password verification failed")
    }

    // Test JWT token generation
    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "24h" })

    // Test JWT token verification
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }

    if (decoded.userId !== newUser.id) {
      throw new Error("JWT token verification failed")
    }

    // Clean up test user
    await sql`DELETE FROM users WHERE id = ${newUser.id}`

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      tests: {
        userCreation: "passed",
        userRetrieval: "passed",
        passwordHashing: "passed",
        passwordVerification: "passed",
        jwtGeneration: "passed",
        jwtVerification: "passed",
        cleanup: "passed",
      },
    })
  } catch (error) {
    console.error("Auth test failed:", error)
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
