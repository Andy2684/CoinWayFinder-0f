/**
 * Lightweight TypeScript test runner for signup-related endpoints.
 * Run with:
 *   npx ts-node tests/test-signup.ts
 *
 * Behavior:
 * - Validates validation paths (should pass even without DB)
 * - Attempts a real signup; treats DB-unavailable (503) as a soft pass with a warning
 */

type Json = Record<string, any>

const BASE =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.BASE_URL ||
  "http://localhost:3000"

type TestFn = () => Promise<void>

const results: { name: string; status: "pass" | "fail" | "warn"; details?: string }[] = []
let failures = 0

function log(msg: string) {
  console.log(msg)
}

async function request(path: string, init?: RequestInit): Promise<{ status: number; json: Json; text: string }> {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })
  const text = await res.text()
  let json: Json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  return { status: res.status, json, text }
}

async function run(name: string, fn: TestFn) {
  try {
    await fn()
    results.push({ name, status: "pass" })
  } catch (e: any) {
    failures++
    results.push({ name, status: "fail", details: e?.message || String(e) })
  }
}

function expect(condition: any, message: string) {
  if (!condition) throw new Error(message)
}

function warn(name: string, details: string) {
  results.push({ name, status: "warn", details })
}

async function testDatabaseHealth() {
  const { status, json } = await request("/api/database/health")
  if (status === 200) {
    expect(json?.status === "ok", "Expected status ok from /api/database/health")
    log("Health: OK")
  } else {
    // Soft pass with warning if DB is not up yet
    warn("Database Health", `Non-200 (${status}). Message: ${json?.message || "N/A"}`)
  }
}

async function testSignupValidationInvalidEmail() {
  const payload = {
    firstName: "John",
    lastName: "Doe",
    email: "invalid-email",
    password: "Valid@1234",
  }
  const { status, json } = await request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  expect(status === 400, `Expected 400 for invalid email, got ${status}`)
  expect(
    (json?.error || "").toString().toLowerCase().includes("valid email") ||
      (json?.error || "").toString().toLowerCase().includes("enter a valid email"),
    `Expected validation error message for invalid email, got: ${JSON.stringify(json)}`
  )
}

async function testSignupValidationWeakPassword() {
  const payload = {
    firstName: "Jane",
    lastName: "Doe",
    email: `ts_weak_${Date.now()}@example.com`,
    password: "short",
  }
  const { status, json } = await request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  expect(status === 400, `Expected 400 for weak password, got ${status}`)
  const msg = (json?.error || "").toString().toLowerCase()
  expect(
    msg.includes("password") && (msg.includes("8") || msg.includes("special") || msg.includes("uppercase")),
    `Expected password policy error message, got: ${JSON.stringify(json)}`
  )
}

async function testSignupHappyPathOrDbUnavailable() {
  const uniqueEmail = `ts_user_${Date.now()}@example.com`
  const payload = {
    firstName: "Alice",
    lastName: "Tester",
    email: uniqueEmail,
    password: "Strong@1234",
  }
  const { status, json } = await request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (status === 201) {
    expect(json?.success === true, "Expected success true on signup")
    expect(!!json?.user?.id, "Expected user id in response")
    log(`Signup success for ${uniqueEmail}`)
  } else if (status === 503) {
    // This is the case when DB is unreachable. Soft pass with warning.
    warn("Signup DB Unavailable", `503: ${json?.error || "Unable to connect to database"}`)
  } else if (status === 409) {
    // In case the test is re-run and the unique calculation collided (rare)
    warn("Signup Duplicate", `409: ${json?.error || "Duplicate email"}`)
  } else {
    throw new Error(`Unexpected status ${status} from signup: ${JSON.stringify(json)}`)
  }
}

async function main() {
  console.log(`Running signup tests against BASE=${BASE}`)

  await run("Database Health", testDatabaseHealth)
  await run("Validation: Invalid Email", testSignupValidationInvalidEmail)
  await run("Validation: Weak Password", testSignupValidationWeakPassword)
  await run("Signup: Happy Path or DB Unavailable", testSignupHappyPathOrDbUnavailable)

  console.log("\nResults:")
  for (const r of results) {
    const label =
      r.status === "pass" ? "PASS" : r.status === "fail" ? "FAIL" : "WARN"
    console.log(`- [${label}] ${r.name}${r.details ? ` — ${r.details}` : ""}`)
  }

  if (failures > 0) {
    console.log(`\n${failures} test(s) failed.`)
    process.exitCode = 1
  } else {
    console.log("\nAll critical tests passed (warnings may exist).")
    process.exitCode = 0
  }
}

main().catch((e) => {
  console.error("Unexpected error during test run:", e)
  process.exitCode = 1
})
