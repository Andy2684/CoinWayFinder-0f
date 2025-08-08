import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCcw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

type HealthResponse =
  | {
      status: "ok"
      ping: unknown
      database: string
      durationMs: number
      message: string
    }
  | {
      status: "error"
      message: string
    }

async function getHealth(): Promise<{ ok: boolean; data: HealthResponse | null; error?: string }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/database/health`, {
      cache: "no-store",
      next: { revalidate: 0 },
    })
    const data = (await res.json()) as HealthResponse
    return { ok: res.ok, data }
  } catch (e: any) {
    return { ok: false, data: null, error: e?.message || "Failed to fetch health" }
  }
}

export const revalidate = 0

export default async function DatabaseStatusPage() {
  const { ok, data, error } = await getHealth()

  const isHealthy = ok && data && "status" in data && data.status === "ok"

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Database Status</h1>
        <form action="" className="contents">
          {/* This button simply reloads the page */}
          <Button
            type="submit"
            formAction={async () => {
              "use server"
              // no-op; the platform will refresh the route
            }}
            className="gap-2"
            variant="outline"
          >
            <RefreshCcw className="h-4 w-4" />
            {'Refresh'}
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>MongoDB Connection</CardTitle>
          {isHealthy ? (
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              {'Healthy'}
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">
              <XCircle className="mr-1 h-4 w-4" />
              {'Unavailable'}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isHealthy && data && "status" in data && data.status === "ok" ? (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">{'Status: Connected and responding to ping'}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">{'Database'}</div>
                  <div className="font-medium">{data.database}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{'Latency (ms)'}</div>
                  <div className="font-medium">{data.durationMs}</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{data.message}</div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">{'Database not reachable'}</span>
              </div>
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                {data && "message" in data ? data.message : error || "Unknown error"}
              </div>
              <div className="text-sm text-muted-foreground">
                {
                  'Tip: Verify MONGODB_URI and DB network rules. After updating environment variables on Vercel, trigger a redeploy and try again.'
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
