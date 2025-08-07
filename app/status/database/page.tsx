import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

async function getHealth() {
  // Use relative path by default; NEXT_PUBLIC_BASE_URL if provided
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ""
  const res = await fetch(`${base}/api/database/health`, {
    // Always check live DB
    cache: "no-store",
  })
  const data = await res.json()
  return { ok: res.ok, data }
}

export default async function DatabaseStatusPage() {
  const { ok, data } = await getHealth()

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Database Status</CardTitle>
            <Badge variant={ok ? "default" : "destructive"}>
              {ok ? "Healthy" : "Unhealthy"}
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-3 pt-4">
          <div className="text-sm">
            <span className="font-medium">Message:</span>{" "}
            <span className={ok ? "text-green-600" : "text-red-600"}>
              {String(data?.message ?? (ok ? "OK" : "Error"))}
            </span>
          </div>
          {ok && typeof data?.durationMs === "number" && (
            <div className="text-sm">
              <span className="font-medium">Latency:</span>{" "}
              <span className="tabular-nums">{data.durationMs} ms</span>
            </div>
          )}
          {ok && data?.database && (
            <div className="text-sm">
              <span className="font-medium">Database:</span>{" "}
              <span>{data.database}</span>
            </div>
          )}
          {!ok && data?.status === "error" && (
            <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 text-xs leading-relaxed">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        Tip: If you still see an error, confirm your MONGODB_URI, that your
        password is URL-encoded, and that your IP/Serverless environment is
        allowed in your MongoDB provider’s Network Access.
      </p>
    </div>
  )
}
