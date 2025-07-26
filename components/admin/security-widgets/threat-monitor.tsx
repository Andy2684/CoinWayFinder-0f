"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Shield, Eye, Clock } from "lucide-react"

interface ThreatData {
  suspiciousIps: number
  rateLimitViolations: number
  unauthorizedAccess: number
  highRiskEvents: number
}

interface ThreatMonitorProps {
  data: ThreatData
  loading?: boolean
}

export function ThreatMonitor({ data, loading = false }: ThreatMonitorProps) {
  const [threatLevel, setThreatLevel] = useState<"low" | "medium" | "high" | "critical">("low")

  useEffect(() => {
    // Calculate threat level based on data
    const totalThreats = data.suspiciousIps + data.rateLimitViolations + data.unauthorizedAccess + data.highRiskEvents

    if (totalThreats > 20) {
      setThreatLevel("critical")
    } else if (totalThreats > 10) {
      setThreatLevel("high")
    } else if (totalThreats > 5) {
      setThreatLevel("medium")
    } else {
      setThreatLevel("low")
    }
  }, [data])

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      default:
        return "bg-green-500 text-white"
    }
  }

  const getThreatLevelIcon = (level: string) => {
    switch (level) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4" />
      case "medium":
        return <Eye className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Threat Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Threat Monitor
          </div>
          <Badge className={getThreatLevelColor(threatLevel)}>
            {getThreatLevelIcon(threatLevel)}
            <span className="ml-1 capitalize">{threatLevel}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Suspicious IPs</span>
              <span className="font-medium text-orange-600">{data.suspiciousIps}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rate Limit Violations</span>
              <span className="font-medium text-red-600">{data.rateLimitViolations}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Unauthorized Access</span>
              <span className="font-medium text-red-600">{data.unauthorizedAccess}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">High Risk Events</span>
              <span className="font-medium text-orange-600">{data.highRiskEvents}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last 24 hours</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Real-time</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
