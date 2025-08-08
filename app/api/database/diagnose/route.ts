import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { resolve as resolveDns } from "node:dns/promises"

type DiagnoseResult = {
  uriPresent: boolean
  uriScheme: "mongodb" | "mongodb+srv" | "unknown"
  hosts: string[]
  ports?: Record<string, number | null> // host -> port (if parsed)
  srv?: {
    query: string
    ok: boolean
    records?: { name: string; port: number; weight: number; priority: number; target: string }[]
    error?: string
  }
  dns?: {
    a?: Record<string, string[] | { error: string }>
    aaaa?: Record<string, string[] | { error: string }>
  }
  connectionAttempt: {
    ok: boolean
    errorName?: string
    errorMessage?: string
    usedIPv4?: boolean
    serverSelectionTimeoutMS: number
  }
  recommendations: string[]
}

function parseMongoUri(uri: string | undefined) {
  if (!uri || typeof uri !== "string") {
    return { uriPresent: false, scheme: "unknown" as const, hosts: [] as string[] }
  }

  let rest = uri
  let scheme: "mongodb" | "mongodb+srv" | "unknown" = "unknown"
  if (uri.startsWith("mongodb+srv://")) {
    scheme = "mongodb+srv"
    rest = uri.slice("mongodb+srv://".length)
  } else if (uri.startsWith("mongodb://")) {
    scheme = "mongodb"
    rest = uri.slice("mongodb://".length)
  }

  // Strip credentials if present
  const afterAt = rest.includes("@") ? rest.split("@")[1] : rest
  const authority = afterAt.split("/")[0] || ""
  const hostParts = authority.split(",").filter(Boolean)

  const hosts = hostParts.map((h) => {
    // remove :port if any (for display)
    return h.trim()
  })

  return { uriPresent: true, scheme, hosts }
}

async function diagnoseDns(scheme: "mongodb" | "mongodb+srv" | "unknown", hosts: string[]) {
  const res: DiagnoseResult["dns"] & { srv?: DiagnoseResult["srv"] } = {}

  if (scheme === "mongodb+srv" && hosts.length > 0) {
    const base = hosts[0].split(":")[0]
    const name = `_mongodb._tcp.${base}`
    try {
      // @ts-ignore - TS doesn't have detailed types here
      const records = await (resolveDns as any).resolveSrv(name)
      res.srv = {
        query: name,
        ok: true,
        records: records?.map((r: any) => ({
          name: r.name ?? base,
          port: r.port,
          weight: r.weight,
          priority: r.priority,
          target: r.name ?? r.target ?? base,
        })),
      }
    } catch (e: any) {
      res.srv = {
        query: name,
        ok: false,
        error: e?.message || String(e),
      }
    }
  }

  // A/AAAA for each host
  const a: Record<string, any> = {}
  const aaaa: Record<string, any> = {}

  for (const h of hosts) {
    const host = h.split(":")[0]
    try {
      // @ts-ignore
      const list = await (resolveDns as any).resolve4(host)
      a[host] = list
    } catch (e: any) {
      a[host] = { error: e?.message || String(e) }
    }
    try {
      // @ts-ignore
      const list6 = await (resolveDns as any).resolve6(host)
      aaaa[host] = list6
    } catch (e: any) {
      aaaa[host] = { error: e?.message || String(e) }
    }
  }

  res.a = a
  res.aaaa = aaaa

  return res
}

export async function GET() {
  const uri = process.env.MONGODB_URI
  const forceIPv4 = process.env.MONGODB_FORCE_IPV4 === "1"
  const serverSelectionTimeoutMS = 5000

  const parsed = parseMongoUri(uri)
  const result: DiagnoseResult = {
    uriPresent: parsed.uriPresent,
    uriScheme: parsed.scheme,
    hosts: parsed.hosts,
    connectionAttempt: {
      ok: false,
      serverSelectionTimeoutMS,
      usedIPv4: forceIPv4,
    },
    recommendations: [],
  }

  if (!parsed.uriPresent) {
    result.recommendations.push(
      "Set MONGODB_URI to a valid connection string (MongoDB Atlas recommended).",
    )
    return NextResponse.json(result, { status: 400 })
  }

  // DNS checks
  try {
    const dns = await diagnoseDns(parsed.scheme, parsed.hosts)
    if (dns.srv) result.srv = dns.srv
    result.dns = { a: dns.a, aaaa: dns.aaaa }
  } catch (e: any) {
    // ignore DNS diag fatal errors; we still try to connect
  }

  // Attempt to connect
  try {
    const client = new MongoClient(uri!, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS,
      socketTimeoutMS: 45000,
      ...(forceIPv4 ? ({ family: 4 } as const) : {}),
    })
    await client.connect()
    await client.db("admin").command({ ping: 1 })
    await client.close().catch(() => {})
    result.connectionAttempt.ok = true
  } catch (e: any) {
    result.connectionAttempt.ok = false
    result.connectionAttempt.errorName = e?.name
    result.connectionAttempt.errorMessage = e?.message || String(e)

    const msg = (e?.message || "").toLowerCase()
    const recs: string[] = []

    if (parsed.uriScheme === "mongodb+srv" && msg.includes("querysrv")) {
      recs.push(
        "SRV DNS lookup failed. Ensure your environment can resolve DNS for your Atlas hostname.",
        "If the issue persists, try setting MONGODB_FORCE_IPV4=1.",
        "Alternatively, use a non-SRV URI (mongodb://) from Atlas with direct hosts and ports.",
      )
    }
    if (msg.includes("authentication") || msg.includes("bad auth") || msg.includes("user not found")) {
      recs.push("Check your MongoDB username/password. Ensure the password is URL-encoded in the URI.")
    }
    if (msg.includes("timeout") || msg.includes("server selection")) {
      recs.push(
        "Server selection timed out. Verify Atlas Network Access allows your deployment (allow 0.0.0.0/0 for testing).",
        "Confirm your cluster is in a ready state and not paused.",
        "If using private networking/VPC peering, confirm routing rules.",
      )
    }
    if (forceIPv4 === false) {
      recs.push("Try setting MONGODB_FORCE_IPV4=1 to force IPv4 if IPv6 routing is an issue.")
    }
    result.recommendations.push(...recs)
  }

  return NextResponse.json(result, { status: result.connectionAttempt.ok ? 200 : 503 })
}
