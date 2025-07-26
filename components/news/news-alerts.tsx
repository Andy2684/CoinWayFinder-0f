"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  BellRing,
  Settings,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Smartphone,
  Mail,
  MessageSquare,
} from "lucide-react"

export function NewsAlerts() {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      name: "Bitcoin Price Alerts",
      keywords: ["Bitcoin", "BTC", "price"],
      sentiment: "all",
      sources: ["all"],
      frequency: "instant",
      enabled: true,
      notifications: ["push", "email"],
      created: "2024-01-01",
    },
    {
      id: 2,
      name: "Ethereum Updates",
      keywords: ["Ethereum", "ETH", "merge"],
      sentiment: "positive",
      sources: ["CoinDesk", "Cointelegraph"],
      frequency: "hourly",
      enabled: true,
      notifications: ["push"],
      created: "2024-01-02",
    },
    {
      id: 3,
      name: "DeFi News",
      keywords: ["DeFi", "yield", "protocol"],
      sentiment: "all",
      sources: ["all"],
      frequency: "daily",
      enabled: false,
      notifications: ["email"],
      created: "2024-01-03",
    },
  ])

  const [newAlert, setNewAlert] = useState({
    name: "",
    keywords: "",
    sentiment: "all",
    sources: "all",
    frequency: "instant",
    notifications: ["push"],
  })

  const recentAlerts = [
    {
      id: 1,
      title: "Bitcoin Reaches $68,000 - High Impact News",
      time: "2 minutes ago",
      type: "price",
      priority: "high",
      read: false,
    },
    {
      id: 2,
      title: "Ethereum Staking Rewards Increase",
      time: "15 minutes ago",
      type: "update",
      priority: "medium",
      read: false,
    },
    {
      id: 3,
      title: "New DeFi Protocol Launch",
      time: "1 hour ago",
      type: "launch",
      priority: "low",
      read: true,
    },
    {
      id: 4,
      title: "Regulatory Update from SEC",
      time: "2 hours ago",
      type: "regulation",
      priority: "high",
      read: true,
    },
  ]

  const toggleAlert = (id: number) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, enabled: !alert.enabled } : alert)))
  }

  const deleteAlert = (id: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-400/20"
      case "medium":
        return "text-yellow-400 bg-yellow-400/20"
      case "low":
        return "text-green-400 bg-green-400/20"
      default:
        return "text-gray-400 bg-gray-400/20"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">🔔 News Alerts</h2>
          <p className="text-gray-400">Stay informed with personalized crypto news alerts</p>
        </div>
        <Button className="bg-[#30D5C8] text-black hover:bg-[#30D5C8]/80">
          <Plus className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-gray-900/50 border border-gray-800">
          <TabsTrigger value="active" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
            🔔 Active Alerts
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
            📋 Recent Alerts
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
            ➕ Create New
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black">
            ⚙️ Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BellRing className="h-5 w-5 mr-2 text-[#30D5C8]" />
                Your Active Alerts
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your personalized news alert preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-4 border border-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Switch checked={alert.enabled} onCheckedChange={() => toggleAlert(alert.id)} />
                        <div>
                          <h4 className="text-white font-medium">{alert.name}</h4>
                          <p className="text-gray-400 text-sm">Keywords: {alert.keywords.join(", ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteAlert(alert.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Sentiment:</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {alert.sentiment}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-400">Frequency:</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {alert.frequency}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-400">Notifications:</span>
                        <div className="flex space-x-1 ml-2">
                          {alert.notifications.map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type === "push" ? "📱" : type === "email" ? "📧" : "💬"} {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white text-xs ml-2">{alert.created}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-400" />
                Recent Alert Notifications
              </CardTitle>
              <CardDescription className="text-gray-400">Your latest news alert notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                      alert.read ? "border-gray-800 bg-gray-900/30" : "border-[#30D5C8]/50 bg-[#30D5C8]/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={`text-xs ${getPriorityColor(alert.priority)}`}>
                            {alert.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                          {!alert.read && <div className="w-2 h-2 rounded-full bg-[#30D5C8]"></div>}
                        </div>
                        <h4 className="text-white font-medium mb-1">{alert.title}</h4>
                        <p className="text-gray-400 text-sm">{alert.time}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {alert.read ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Bell className="h-4 w-4 text-[#30D5C8]" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-400" />
                Create New Alert
              </CardTitle>
              <CardDescription className="text-gray-400">Set up a new personalized news alert</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white font-medium mb-2 block">Alert Name</label>
                <Input
                  placeholder="e.g., Bitcoin Price Updates"
                  value={newAlert.name}
                  onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Keywords</label>
                <Input
                  placeholder="e.g., Bitcoin, BTC, price (comma separated)"
                  value={newAlert.keywords}
                  onChange={(e) => setNewAlert({ ...newAlert, keywords: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-medium mb-2 block">Sentiment Filter</label>
                  <Select
                    value={newAlert.sentiment}
                    onValueChange={(value) => setNewAlert({ ...newAlert, sentiment: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">All Sentiment</SelectItem>
                      <SelectItem value="positive">Positive Only</SelectItem>
                      <SelectItem value="negative">Negative Only</SelectItem>
                      <SelectItem value="neutral">Neutral Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white font-medium mb-2 block">Frequency</label>
                  <Select
                    value={newAlert.frequency}
                    onValueChange={(value) => setNewAlert({ ...newAlert, frequency: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Notification Methods</label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Smartphone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">Push Notifications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">Email</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-300">SMS</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-[#30D5C8] text-black hover:bg-[#30D5C8]/80">Create Alert</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-400" />
                Alert Settings
              </CardTitle>
              <CardDescription className="text-gray-400">Configure global alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Enable All Alerts</h4>
                    <p className="text-gray-400 text-sm">Master switch for all news alerts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">High Priority Only</h4>
                    <p className="text-gray-400 text-sm">Only receive high-impact news alerts</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Quiet Hours</h4>
                    <p className="text-gray-400 text-sm">Disable alerts during specified hours</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Weekend Alerts</h4>
                    <p className="text-gray-400 text-sm">Receive alerts on weekends</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <h4 className="text-white font-medium mb-3">Notification Limits</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm">Max alerts per hour</label>
                    <Select defaultValue="10">
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="5">5 alerts</SelectItem>
                        <SelectItem value="10">10 alerts</SelectItem>
                        <SelectItem value="20">20 alerts</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm">Max alerts per day</label>
                    <Select defaultValue="50">
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="25">25 alerts</SelectItem>
                        <SelectItem value="50">50 alerts</SelectItem>
                        <SelectItem value="100">100 alerts</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
