import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'

type Diagnose = {
  uriPresent: boolean
  uriScheme: "mongodb" | "mongodb+srv" | "unknown"
  hosts: string[]
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

export const revalidate = 0

async function getDiagnose(): Promise<{ ok: boolean; data: Diagnose | null; status: number }> {
  const res = await fetch(`/api/database/diagnose`, { cache: "no-store" })
  const data = (await res.json()) as Diagnose
  return { ok: res.ok, data, status: res.status }
}

export default async function DiagnosePage() {
  const { ok, data, status } = await getDiagnose()

  const healthy = !!data?.connectionAttempt?.ok

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/status/database" className="inline-flex items-center text-sm text-muted-foreground hover:underline">
          <ArrowLeft className="mr-1 h-4 w-4" />
          {'Back to Status'}
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{'MongoDB Connectivity Diagnose'}</CardTitle>
          {healthy ? (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              {'Connected'}
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700">
              <XCircle className="mr-1 h-4 w-4" />
              {'Failed'}
            </Badge>
          )}
        </CardHeader>
        <Separator />
        <CardContent className="space-y-6 pt-4">
          {/* Summary */}
          <section className="space-y-2">
            <div className="text-sm text-muted-foreground">{'Summary'}</div>
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <div>
                <span className="font-medium">{'Status: '}</span>
                <span className={healthy ? "text-green-700" : "text-red-700"}>
                  {healthy ? "Connected" : "Failed"} ({status})
                </span>
              </div>
              <div>
                <span className="font-medium">{'URI Scheme: '}</span>
                <span className="tabular-nums">{data?.uriScheme ?? "unknown"}</span>
              </div>
              <div>
                <span className="font-medium">{'Force IPv4: '}</span>
                <span>{String(data?.connectionAttempt?.usedIPv4 ?? false)}</span>
              </div>
              {!healthy && data?.connectionAttempt?.errorName && (
                <div className="mt-2 rounded-md bg-amber-50 p-3 text-amber-800">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    {'Error'}
                  </div>
                  <div className="mt-1 text-sm">{data.connectionAttempt.errorName}</div>
                  <div className="text-xs opacity-90">{data.connectionAttempt.errorMessage}</div>
                </div>
              )}
            </div>
          </section>

          {/* Hosts */}
          <section className="space-y-2">
            <div className="text-sm text-muted-foreground">{'Hosts parsed from URI'}</div>
            <div className="rounded-md border p-3">
              {data?.hosts?.length ? (
                <ul className="list-inside list-disc text-sm">
                  {data.hosts.map((h) => (
                    <li key={h} className="break-all">{h}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">{'No hosts found in MONGODB_URI'}</div>
              )}
            </div>
          </section>

          {/* SRV */}
          {data?.srv && (
            <section className="space-y-2">
              <div className="text-sm text-muted-foreground">{'SRV Lookup'}</div>
              <div className="rounded-md border p-3 text-sm">
                <div className="mb-2">
                  <span className="font-medium">{'Query: '}</span>
                  <span className="break-all">{data.srv.query}</span>
                </div>
                {data.srv.ok ? (
                  <div className="space-y-1">
                    {(data.srv.records ?? []).map((r, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-2">
                        <div className="break-all">{r.target}</div>
                        <div className="tabular-nums">{'port '}{r.port} {'prio '}{r.priority} {'w '}{r.weight}</div>
                      </div>
                    ))}
                    {!data.srv.records?.length && (
                      <div className="text-muted-foreground">{'No SRV records returned'}</div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md bg-amber-50 p-3 text-amber-800">
                    {data.srv.error || "SRV lookup failed"}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* DNS A/AAAA */}
          <section className="space-y-2">
            <div className="text-sm text-muted-foreground">{'DNS Resolution'}</div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border p-3 text-sm">
                <div className="mb-2 font-medium">{'A Records (IPv4)'}</div>
                <div className="space-y-1">
                  {data?.dns?.a
                    ? Object.entries(data.dns.a).map(([host, rec]) => (
                        <div key={host}>
                          <div className="text-muted-foreground">{host}</div>
                          <div className="text-xs">{Array.isArray(rec) ? rec.join(", ") : rec.error}</div>
                        </div>
                      ))
                    : <div className="text-muted-foreground">{'No data'}</div>}
                </div>
              </div>
              <div className="rounded-md border p-3 text-sm">
                <div className="mb-2 font-medium">{'AAAA Records (IPv6)'}</div>
                <div className="space-y-1">
                  {data?.dns?.aaaa
                    ? Object.entries(data.dns.aaaa).map(([host, rec]) => (
                        <div key={host}>
                          <div className="text-muted-foreground">{host}</div>
                          <div className="text-xs">{Array.isArray(rec) ? rec.join(", ") : rec.error}</div>
                        </div>
                      ))
                    : <div className="text-muted-foreground">{'No data'}</div>}
                </div>
              </div>
            </div>
          </section>

          {/* Recommendations */}
          <section className="space-y-2">
            <div className="text-sm text-muted-foreground">{'Recommendations'}</div>
            <div className="rounded-md bg-muted/50 p-3">
              <ul className="list-inside list-disc text-sm">
                {(data?.recommendations?.length ? data.recommendations : [
                  "Ensure MONGODB_URI is set and valid.",
                  "If using MongoDB Atlas, allow network access for your environment (temporarily 0.0.0.0/0 to test).",
                  "URL-encode your password in the URI.",
                  "If SRV lookups fail, try MONGODB_FORCE_IPV4=1 or use a non-SRV mongodb:// URI with direct hosts and ports.",
                ]).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </section>

          <div className="flex justify-end">
            <Link href="/status/database">
              <Button variant="outline">{'Back to Status'}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
