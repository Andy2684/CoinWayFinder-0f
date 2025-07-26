"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react"

interface SystemHealthData {
  status: "healthy" | "warning" | "critical"
  uptime: number
  errorRate: number
  responseTime: number
}

interface SystemHealthProps {
  data: SystemHealthData
  loading?: boolean
}

export function SystemHealth({ data, loading = false }: SystemHealthProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return "text-green-600"
    if (uptime >= 95) return "text-yellow-600"
    return "text-red-600"
  }

  const getErrorRateColor = (errorRate: number) => {
    if (errorRate <= 1) return "text-green-600"
    if (errorRate <= 5) return "text-yellow-600"
    return "text-red-600"
  }

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime <= 200) return "text-green-600"
    if (responseTime <= 500) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
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
            <Activity className="h-5 w-5" />
            System Health
          </div>
          <Badge className={getStatusColor(data.status)}>
            {getStatusIcon(data.status)}
            <span className="ml-1 capitalize">{data.status}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Uptime */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Uptime</span>
              <span className={`font-medium ${getUptimeColor(data.uptime)}`}>{data.uptime}%</span>
            </div>
            <Progress value={data.uptime} className="h-2" />
          </div>

          {/* Error Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Error Rate</span>
              <span className={`font-medium ${getErrorRateColor(data.errorRate)}`}>{data.errorRate}%</span>
            </div>
            <Progress value={Math.min(data.errorRate, 100)} className="h-2" />
          </div>

          {/* Response Time */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg Response Time</span>
            <span className={`font-medium ${getResponseTimeColor(data.responseTime)}`}>{data.responseTime}ms</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last hour</span>
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
