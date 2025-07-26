import { Suspense } from "react"
import { AuditLogsContent } from "./audit-logs-content"

export default function AuditLogsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Security Audit Logs</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and analyze security events, authentication attempts, and system activities
        </p>
      </div>

      <Suspense fallback={<div>Loading audit logs...</div>}>
        <AuditLogsContent />
      </Suspense>
    </div>
  )
}
