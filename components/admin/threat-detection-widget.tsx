"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Shield, Globe } from "lucide-react"

interface ThreatData {
  suspiciousIPs: number
  blockedAttempts: number
  riskScore: number
  activeThreats: Array<{
    type: string
    count: number
    severity: "low" | "medium" | "high" | "critical"
  }>
  recentBlocks: Array<{
    ip: string
    reason: string
    timestamp: string
  }>
}

export function ThreatDetectionWidget() {
  const [threatData, setThreatData] = useState<ThreatData>({
    suspiciousIPs: 0,
    blockedAttempts: 0,
    riskScore: 0,
    activeThreats: [],
    recentBlocks: [],
  })
  const [loading, setLoading] = useState(true)

  const fetchThreatData = async () => {
    try {
      const response = await fetch("/api/admin/security/threats")
      if (response.ok) {
        const data = await response.json()
        setThreatData(data.threats)
      }
    } catch (error) {
      console.error("Error fetching threat data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchThreatData()

    // Update every 20 seconds
    const interval = setInterval(fetchThreatData, 20000)

    return () => clearInterval(interval)
  }, [])

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600"
    if (score >= 60) return "text-orange-600"
    if (score >= 40) return "text-yellow-600"
    return "text-green-600"
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800 text-xs">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 text-xs">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Low</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Threat Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Shield className="h-6 w-6 animate-pulse" />
            <span className="ml-2">Analyzing threats...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
          Threat Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Risk Score</span>
            <span className={`text-lg font-bold ${getRiskColor(threatData.riskScore)}`}>
              {threatData.riskScore}/100
            </span>
          </div>
          <Progress value={threatData.riskScore} className="h-2" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-2 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{threatData.suspiciousIPs}</div>
            <div className="text-xs text-muted-foreground">Suspicious IPs</div>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{threatData.blockedAttempts}</div>
            <div className="text-xs text-muted-foreground">Blocked Today</div>
          </div>
        </div>

        {/* Active Threats */}
        {threatData.activeThreats.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Active Threats</h4>
            <div className="space-y-2">
              {threatData.activeThreats.slice(0, 3).map((threat, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{threat.type}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">{threat.count}</span>
                    {getSeverityBadge(threat.severity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Blocks */}
        {threatData.recentBlocks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Blocks</h4>
            <div className="space-y-1">
              {threatData.recentBlocks.slice(0, 2).map((block, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Globe className="h-3 w-3" />
                    <span className="font-mono">{block.ip}</span>
                  </div>
                  <div className="ml-4">{block.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="pt-2 border-t">
          {threatData.riskScore < 30 ? (
            <div className="flex items-center text-green-600">
              <Shield className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">System Secure</span>
            </div>
          ) : (
            <div className="flex items-center text-orange-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Monitoring Threats</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
