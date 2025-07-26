"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface EventType {
  event_type: string
  event_category: string
  count: number
  failed_count: number
}

interface LiveActivityProps {
  data: EventType[]
  loading?: boolean
}

export function LiveActivity({ data, loading = false }: LiveActivityProps) {
  const getSuccessRate = (total: number, failed: number) => {
    if (total === 0) return 100
    return Math.round(((total - failed) / total) * 100)
  }

  const getTrendIcon = (successRate: number) => {
    if (successRate >= 95) return <TrendingUp className="h-3 w-3 text-green-600" />
    if (successRate >= 80) return <Minus className="h-3 w-3 text-yellow-600" />
    return <TrendingDown className="h-3 w-3 text-red-600" />
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return "text-green-600"
    if (rate >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const formatEventType = (eventType: string) => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "authentication":
        return "bg-blue-100 text-blue-800"
      case "security":
        return "bg-red-100 text-red-800"
      case "api":
        return "bg-green-100 text-green-800"
      case "system":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity
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
            Live Activity
          </div>
          <Badge variant="secondary">{data.length} event types</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No activity in the last 7 days</p>
            </div>
          ) : (
            data.map((event, index) => {
              const successRate = getSuccessRate(event.count, event.failed_count)

              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{formatEventType(event.event_type)}</span>
                      <Badge variant="secondary" className={getCategoryColor(event.event_category)}>
                        {event.event_category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{event.count} events</span>
                      {event.failed_count > 0 && <span className="text-red-600">• {event.failed_count} failed</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {getTrendIcon(successRate)}
                    <span className={`text-sm font-medium ${getSuccessRateColor(successRate)}`}>{successRate}%</span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last 7 days</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>Live data</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
