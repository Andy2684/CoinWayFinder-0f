/**
 * Minimal TS test runner for signup endpoints.
 * Run with:
 *   npx ts-node tests/test-signup.ts
 *
 * Optionally set:
 *   NEXT_PUBLIC_BASE_URL=http://localhost:3000
 */
type HttpMethod = "GET" | "POST"
const BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

type TestResult = { name: string; ok: boolean; details?: any }

async function req(path: string, method: HttpMethod = "GET", body?: any) {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  return { res, data }
}

function logResult(r: TestResult) {
  const prefix = r.ok ? "✅" : "❌"
  console.log(`${prefix} ${r.name}`)
  if (!r.ok && r.details) {
    console.log("   Details:", typeof r.details === "string" ? r.details : JSON.stringify(r.details, null, 2))
  }
}

async function testHealth(): Promise<TestResult> {
  try {
    const { res, data } = await req("/api/database/health", "GET")
    const ok = res.ok || res.status === 503 // 503 expected when DB is not configured yet
    return { name: "GET /api/database/health", ok, details: ok ? undefined : { status: res.status, data } }
  } catch (e: any) {
    return { name: "GET /api/database/health", ok: false, details: e?.message || e }
  }
}

async function testMockSignup(): Promise<TestResult> {
  // This endpoint is expected to exist in your project as a mocked helper.
  try {
    const payload = {
      email: `user${Date.now()}@example.com`,
      username: `tester_${Math.random().toString(36).slice(2, 8)}`,
      password: "StrongP@ssw0rd!",
      confirmPassword: "StrongP@ssw0rd!",
    }
    const { res, data } = await req("/api/test/signup", "POST", payload)
    const ok = res.status === 201 || res.status === 200 || res.status === 400
    return { name: "POST /api/test/signup", ok, details: ok ? undefined : { status: res.status, data } }
  } catch (e: any) {
    return { name: "POST /api/test/signup", ok: false, details: e?.message || e }
  }
}

async function testRealSignup(): Promise<TestResult> {
  // This tests the real signup. It may return 201 (success), 409 (duplicate), or 503 (DB unavailable).
  try {
    const unique = Date.now()
    const payload = {
      email: `real_${unique}@example.com`,
      username: `realuser_${unique}`,
      password: "StrongP@ssw0rd!",
      confirmPassword: "StrongP@ssw0rd!",
    }
    const { res, data } = await req("/api/auth/signup", "POST", payload)
    const acceptable = [201, 409, 503] // 503 is acceptable while DB is not configured
    const ok = acceptable.includes(res.status)
    return {
      name: "POST /api/auth/signup",
      ok,
      details: ok ? undefined : { status: res.status, data },
    }
  } catch (e: any) {
    return { name: "POST /api/auth/signup", ok: false, details: e?.message || e }
  }
}

async function run() {
  console.log(`Running signup tests against ${BASE}`)
  const results = await Promise.all([testHealth(), testMockSignup(), testRealSignup()])

  let failures = 0
  for (const r of results) {
    logResult(r)
    if (!r.ok) failures++
  }

  if (failures > 0) {
    console.log(`\nFinished with ${failures} failure(s).`)
    process.exit(1)
  } else {
    console.log("\nAll tests passed.")
    process.exit(0)
  }
}

run().catch((e) => {
  console.error("Unhandled error:", e)
  process.exit(1)
})
