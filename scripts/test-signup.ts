// Node.js E2E-style test for signup -> thank-you flow
// Usage examples:
//   BASE_URL="https://your-app.vercel.app" bun scripts/test-signup.ts
//   NEXT_PUBLIC_BASE_URL="http://localhost:3000" CLEANUP=true bun scripts/test-signup.ts

import { MongoClient } from "mongodb"

// Resolve Base URL for HTTP calls
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  process.env.BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000"

// Database settings
const mongoUri = process.env.MONGODB_URI
const dbName = process.env.DB_NAME || "coinwayfinder"
const doCleanup = String(process.env.CLEANUP || "").toLowerCase() === "true"

type SignupResponse =
  | {
      success: true
      message: string
      user: { id: string; email: string; username: string }
    }
  | { error: string }

function randomEmail() {
  const ts = Date.now()
  const rand = Math.random().toString(36).slice(2, 7)
  return `test+${ts}-${rand}@example.com`
}

function usernameFromEmail(email: string) {
  return email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 20)
}

async function assertThankYouPage() {
  const res = await fetch(`${baseUrl}/thank-you`, { redirect: "follow" })
  if (!res.ok) {
    throw new Error(`Thank You page returned non-200 status: ${res.status}`)
  }
  const html = await res.text()
  // Look for a few key substrings that exist on your thank-you page
  const needles = ["Welcome to CoinWayFinder", "Redirecting to login", "Sign In to Your Account"]
  const found = needles.some((n) => html.includes(n))
  if (!found) {
    throw new Error("Thank You page content did not include expected markers")
  }
}

async function signup(email: string, username: string, password: string) {
  const res = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  })

  const data = (await res.json()) as SignupResponse

  if (!res.ok) {
    const msg =
      "error" in data
        ? data.error
        : `Signup failed with status ${res.status} and unknown error shape`
    throw new Error(msg)
  }

  if (!("success" in data) || !data.success) {
    throw new Error("Signup did not return success:true")
  }

  return data
}

async function getUserFromDb(email: string) {
  if (!mongoUri) {
    console.warn("MONGODB_URI not set. Skipping DB verification.")
    return null
  }

  const client = new MongoClient(mongoUri)
  try {
    await client.connect()
    const db = client.db(dbName)
    const user = await db.collection("users").findOne({ email: email.toLowerCase() })
    return user
  } finally {
    await client.close()
  }
}

async function cleanupUser(email: string) {
  if (!mongoUri) return
  const client = new MongoClient(mongoUri)
  try {
    await client.connect()
    const db = client.db(dbName)
    const result = await db.collection("users").deleteOne({ email: email.toLowerCase() })
    console.log(`Cleanup: deleted ${result.deletedCount} user(s) with email ${email}`)
  } finally {
    await client.close()
  }
}

async function main() {
  console.log("=== CoinWayFinder: Signup → Thank You Test ===")
  console.log(`Base URL: ${baseUrl}`)
  console.log(`DB Name: ${dbName}`)
  console.log(`Cleanup after test: ${doCleanup ? "Yes" : "No"}`)
  console.log("--------------------------------------------------")

  // Prepare test data
  const email = randomEmail()
  const username = usernameFromEmail(email)
  // Meets policy: >= 8 chars, upper, lower, number, special
  const password = "Aa1!Test12"

  console.log("Step 1: Calling signup API ...")
  let signupData: SignupResponse | null = null
  try {
    signupData = await signup(email, username, password)
    console.log("✅ Signup API success:", signupData)
  } catch (err) {
    console.error("❌ Signup API failed:", (err as Error).message)
    process.exitCode = 1
    return
  }

  console.log("Step 2: Verifying Thank You page ...")
  try {
    await assertThankYouPage()
    console.log("✅ Thank You page returned expected content")
  } catch (err) {
    console.error("❌ Thank You page verification failed:", (err as Error).message)
    process.exitCode = 1
    // Continue to DB check to provide more diagnostics
  }

  console.log("Step 3: Verifying user exists in DB ...")
  try {
    const user = await getUserFromDb(email)
    if (!user) {
      console.warn("⚠ Could not verify user in DB (MONGODB_URI missing or user not found).")
    } else {
      console.log("✅ User found in DB:", { _id: user._id?.toString?.(), email: user.email, username: user.username })
    }
  } catch (err) {
    console.error("❌ DB verification failed:", (err as Error).message)
    // Not fatal for overall flow, continue
  }

  if (doCleanup) {
    console.log("Step 4: Cleaning up test user ...")
    try {
      await cleanupUser(email)
      console.log("✅ Cleanup complete")
    } catch (err) {
      console.error("❌ Cleanup failed:", (err as Error).message)
    }
  }

  console.log("--------------------------------------------------")
  console.log("Test complete.")
}

main().catch((err) => {
  console.error("Unexpected error:", err)
  process.exitCode = 1
})
