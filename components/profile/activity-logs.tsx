"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Search,
  Filter,
  Download,
  User,
  Shield,
  Bot,
  TrendingUp,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Monitor,
} from "lucide-react"

interface ActivityLog {
  id: string
  timestamp: string
  type: "login" | "trade" | "bot" | "security" | "settings" | "api"
  action: string
  description: string
  status: "success" | "failed" | "warning"
  ip: string
  location: string
  device: string
  details?: Record<string, any>
}

export function ActivityLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const activities: ActivityLog[] = [
    {
      id: "1",
      timestamp: "2024-01-15 14:30:25",
      type: "login",
      action: "User Login",
      description: "Successful login to account",
      status: "success",
      ip: "192.168.1.1",
      location: "New York, USA",
      device: "MacBook Pro",
    },
    {
      id: "2",
      timestamp: "2024-01-15 14:25:10",
      type: "trade",
      action: "Trade Executed",
      description: "Buy order for BTC/USDT executed",
      status: "success",
      ip: "192.168.1.1",
      location: "New York, USA",
      device: "MacBook Pro",
      details: { pair: "BTC/USDT", amount: "0.1", price: "42500" },
    },
    {
      id: "3",
      timestamp: "2024-01-15 14:20:45",
      type: "bot",
      action: "Bot Started",
      description: "DCA Bot #5 started successfully",
      status: "success",
      ip: "192.168.1.1",
      location: "New York, USA",
      device: "MacBook Pro",
      details: { botId: "5", strategy: "DCA", pair: "ETH/USDT" },
    },
    {
      id: "4",
      timestamp: "2024-01-15 13:45:30",
      type: "security",
      action: "Password Changed",
      description: "Account password updated",
      status: "success",
      ip: "192.168.1.1",
      location: "New York, USA",
      device: "MacBook Pro",
    },
    {
      id: "5",
      timestamp: "2024-01-15 13:30:15",
      type: "api",
      action: "API Key Created",
      description: "New API key 'Trading Bot API' created",
      status: "success",
      ip: "192.168.1.1",
      location: "New York, USA",
      device: "MacBook Pro",
      details: { keyName: "Trading Bot API", permissions: ["read", "trade"] },
    },
    {
      id: "6",
      timestamp: "2024-01-15 12:15:20",
      type: "trade",
      action: "Trade Failed",
      description: "Sell order for ETH/USDT failed - insufficient balance",
      status: "failed",
      ip: "192.168.1.1",
      location: "New York, USA",
      device: "MacBook Pro",
      details: { pair: "ETH/USDT", amount: "2.5", error: "Insufficient balance" },
    },
    {
      id: "7",
      timestamp: "2024-01-15 11:30:45",
      type: "security",
      action: "Failed Login",
      description: "Failed login attempt from unknown device",
      status: "failed",
      ip: "203.0.113.1",
      location: "Unknown",
      device: "Chrome Browser",
    },
    {
      id: "8",
      timestamp: "2024-01-15 10:45:10",
      type: "bot",
      action: "Bot Stopped",
      description: "Grid Bot #3 stopped due to error",
      status: "warning",
      ip: "192.168.1.1",
      location: "New York, USA",
      device: "MacBook Pro",
      details: { botId: "3", strategy: "Grid", error: "API connection lost" },
    },
    {
      id: "9",
      timestamp: "2024-01-15 09:20:35",
      type: "settings",
      action: "Settings Updated",
      description: "Trading preferences updated",
      status: "success",
      ip: "192.168.1.1",
      location: "New York, USA",
      device: "MacBook Pro",
    },
    {
      id: "10",
      timestamp: "2024-01-15 08:15:50",
      type: "login",
      action: "User Login",
      description: "Successful login via mobile app",
      status: "success",
      ip: "192.168.1.2",
      location: "New York, USA",
      device: "iPhone 15 Pro",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "login":
        return User
      case "trade":
        return TrendingUp
      case "bot":
        return Bot
      case "security":
        return Shield
      case "settings":
        return Settings
      case "api":
        return Activity
      default:
        return Activity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400"
      case "failed":
        return "text-red-400"
      case "warning":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return CheckCircle
      case "failed":
        return AlertTriangle
      case "warning":
        return AlertTriangle
      default:
        return Clock
    }
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || activity.type === filterType
    const matchesStatus = filterStatus === "all" || activity.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const handleExport = () => {
    // In a real app, this would generate and download a CSV/PDF
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Timestamp,Type,Action,Description,Status,IP,Location,Device\n" +
      filteredActivities
        .map(
          (activity) =>
            `${activity.timestamp},${activity.type},${activity.action},${activity.description},${activity.status},${activity.ip},${activity.location},${activity.device}`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "activity_logs.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Activity Logs</h3>
          <p className="text-gray-400">Monitor all activities on your account</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="trade">Trading</SelectItem>
                  <SelectItem value="bot">Bots</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription>
            Showing {filteredActivities.length} of {activities.length} activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredActivities.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type)
              const StatusIcon = getStatusIcon(activity.status)

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-slate-600 rounded-full">
                      <ActivityIcon className="h-5 w-5 text-gray-300" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium">{activity.action}</h4>
                      <Badge
                        variant={activity.status === "success" ? "default" : "secondary"}
                        className={`text-xs ${getStatusColor(activity.status)}`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {activity.status}
                      </Badge>
                    </div>

                    <p className="text-gray-400 text-sm mb-2">{activity.description}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.timestamp}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {activity.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        {activity.device}
                      </span>
                      <span>{activity.ip}</span>
                    </div>

                    {activity.details && (
                      <div className="mt-2 p-2 bg-slate-600/50 rounded text-xs">
                        <pre className="text-gray-300 whitespace-pre-wrap">
                          {JSON.stringify(activity.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No activities found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
