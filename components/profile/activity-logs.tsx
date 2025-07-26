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
  TrendingUp,
  Settings,
  Key,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react"

interface ActivityLog {
  id: string
  timestamp: string
  action: string
  category: "auth" | "trading" | "security" | "settings" | "api"
  description: string
  ipAddress: string
  location: string
  device: string
  status: "success" | "failed" | "warning"
}

export function ActivityLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const activityLogs: ActivityLog[] = [
    {
      id: "1",
      timestamp: "2024-01-15 14:30:25",
      action: "Login",
      category: "auth",
      description: "User logged in successfully",
      ipAddress: "192.168.1.100",
      location: "New York, US",
      device: "Chrome on Windows",
      status: "success",
    },
    {
      id: "2",
      timestamp: "2024-01-15 14:25:10",
      action: "Bot Created",
      category: "trading",
      description: "Created new trading bot 'BTC Scalper'",
      ipAddress: "192.168.1.100",
      location: "New York, US",
      device: "Chrome on Windows",
      status: "success",
    },
    {
      id: "3",
      timestamp: "2024-01-15 13:45:33",
      action: "Password Changed",
      category: "security",
      description: "Account password was updated",
      ipAddress: "192.168.1.100",
      location: "New York, US",
      device: "Chrome on Windows",
      status: "success",
    },
    {
      id: "4",
      timestamp: "2024-01-15 12:20:15",
      action: "API Key Generated",
      category: "api",
      description: "New API key created for 'Trading Bot'",
      ipAddress: "192.168.1.100",
      location: "New York, US",
      device: "Chrome on Windows",
      status: "success",
    },
    {
      id: "5",
      timestamp: "2024-01-15 11:15:42",
      action: "Failed Login",
      category: "auth",
      description: "Failed login attempt with incorrect password",
      ipAddress: "203.0.113.1",
      location: "Unknown Location",
      device: "Chrome on Linux",
      status: "failed",
    },
    {
      id: "6",
      timestamp: "2024-01-15 10:30:18",
      action: "Trade Executed",
      category: "trading",
      description: "Executed buy order for 0.1 BTC at $42,500",
      ipAddress: "192.168.1.100",
      location: "New York, US",
      device: "Mobile App",
      status: "success",
    },
    {
      id: "7",
      timestamp: "2024-01-15 09:45:55",
      action: "Settings Updated",
      category: "settings",
      description: "Updated notification preferences",
      ipAddress: "192.168.1.100",
      location: "New York, US",
      device: "Chrome on Windows",
      status: "success",
    },
    {
      id: "8",
      timestamp: "2024-01-15 08:20:30",
      action: "2FA Enabled",
      category: "security",
      description: "Two-factor authentication was enabled",
      ipAddress: "192.168.1.100",
      location: "New York, US",
      device: "Chrome on Windows",
      status: "success",
    },
  ]

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || log.category === filterCategory
    const matchesStatus = filterStatus === "all" || log.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "auth":
        return <User className="h-4 w-4" />
      case "trading":
        return <TrendingUp className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      case "settings":
        return <Settings className="h-4 w-4" />
      case "api":
        return <Key className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "auth":
        return "bg-blue-600/20 text-blue-400"
      case "trading":
        return "bg-green-600/20 text-green-400"
      case "security":
        return "bg-red-600/20 text-red-400"
      case "settings":
        return "bg-purple-600/20 text-purple-400"
      case "api":
        return "bg-yellow-600/20 text-yellow-400"
      default:
        return "bg-gray-600/20 text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-400" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-600/20 text-green-400"
      case "failed":
        return "bg-red-600/20 text-red-400"
      case "warning":
        return "bg-yellow-600/20 text-yellow-400"
      default:
        return "bg-gray-600/20 text-gray-400"
    }
  }

  const handleExportLogs = () => {
    // In a real app, this would generate and download a CSV/JSON file
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `activity-logs-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Logs
          </CardTitle>
          <CardDescription className="text-gray-400">
            Monitor all activities and changes to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="auth">Authentication</SelectItem>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleExportLogs}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardContent className="p-0">
          <div className="space-y-0">
            {filteredLogs.map((log, index) => (
              <div
                key={log.id}
                className={`p-4 border-b border-slate-700 ${
                  index === filteredLogs.length - 1 ? "border-b-0" : ""
                } hover:bg-slate-700/20 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-slate-700/50 rounded-lg">{getCategoryIcon(log.category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{log.action}</h3>
                        <Badge variant="secondary" className={getCategoryColor(log.category)}>
                          {log.category}
                        </Badge>
                        <Badge variant="secondary" className={getStatusColor(log.status)}>
                          {getStatusIcon(log.status)}
                          <span className="ml-1 capitalize">{log.status}</span>
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{log.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{log.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{log.location}</span>
                        </div>
                        <span>{log.device}</span>
                        <span>{log.ipAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No Activity Found</h3>
              <p className="text-gray-400 text-sm">
                No activities match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
