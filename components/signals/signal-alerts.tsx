"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Settings,
  Plus,
  Trash2,
  Edit,
  Clock,
  TrendingUp,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Alert {
  id: string
  name: string
  condition: string
  symbol: string
  value: number
  operator: ">" | "<" | "=" | ">=" | "<="
  enabled: boolean
  channels: string[]
  createdAt: string
  triggeredAt?: string
  status: "ACTIVE" | "TRIGGERED" | "PAUSED"
}

export function SignalAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      name: "BTC Price Alert",
      condition: "Price",
      symbol: "BTC/USDT",
      value: 45000,
      operator: ">",
      enabled: true,
      channels: ["push", "telegram"],
      createdAt: "2024-01-15T10:00:00Z",
      status: "ACTIVE",
    },
    {
      id: "2",
      name: "ETH Volume Spike",
      condition: "Volume",
      symbol: "ETH/USDT",
      value: 1000000,
      operator: ">",
      enabled: true,
      channels: ["email", "push"],
      createdAt: "2024-01-15T09:30:00Z",
      triggeredAt: "2024-01-15T11:45:00Z",
      status: "TRIGGERED",
    },
    {
      id: "3",
      name: "SOL RSI Oversold",
      condition: "RSI",
      symbol: "SOL/USDT",
      value: 30,
      operator: "<",
      enabled: false,
      channels: ["telegram"],
      createdAt: "2024-01-15T08:15:00Z",
      status: "PAUSED",
    },
  ])

  const [alertSettings, setAlertSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    telegramNotifications: true,
    smsNotifications: false,
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00",
    },
    maxAlertsPerHour: 10,
  })

  const toggleAlert = (id: string) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, enabled: !alert.enabled, status: alert.enabled ? "PAUSED" : "ACTIVE" } : alert,
      ),
    )
  }

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-400 bg-green-400/10"
      case "TRIGGERED":
        return "text-yellow-400 bg-yellow-400/10"
      case "PAUSED":
        return "text-gray-400 bg-gray-400/10"
      default:
        return "text-gray-400 bg-gray-400/10"
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "push":
        return <Smartphone className="w-4 h-4" />
      case "email":
        return <Mail className="w-4 h-4" />
      case "telegram":
        return <MessageSquare className="w-4 h-4" />
      case "sms":
        return <Smartphone className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Alerts</p>
                <p className="text-2xl font-bold text-green-400">
                  {alerts.filter((a) => a.status === "ACTIVE").length}
                </p>
              </div>
              <Bell className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Triggered Today</p>
                <p className="text-2xl font-bold text-yellow-400">12</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Alerts</p>
                <p className="text-2xl font-bold text-white">{alerts.length}</p>
              </div>
              <Settings className="w-8 h-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1B23] border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-[#30D5C8]">94.2%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#30D5C8]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="bg-[#1A1B23] border-gray-800">
          <TabsTrigger value="alerts" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]">
            Alert Rules
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]">
            Alert History
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Alert Rules</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1A1B23] border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Alert</DialogTitle>
                  <DialogDescription>
                    Set up a new alert rule to get notified when conditions are met.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="alert-name">Alert Name</Label>
                    <Input id="alert-name" placeholder="Enter alert name" className="bg-[#0F1015] border-gray-700" />
                  </div>
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Select>
                      <SelectTrigger className="bg-[#0F1015] border-gray-700">
                        <SelectValue placeholder="Select symbol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                        <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                        <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select>
                        <SelectTrigger className="bg-[#0F1015] border-gray-700">
                          <SelectValue placeholder="Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="volume">Volume</SelectItem>
                          <SelectItem value="rsi">RSI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="operator">Operator</Label>
                      <Select>
                        <SelectTrigger className="bg-[#0F1015] border-gray-700">
                          <SelectValue placeholder="Op" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=">">{">"}</SelectItem>
                          <SelectItem value="<">{"<"}</SelectItem>
                          <SelectItem value=">=">{"≥"}</SelectItem>
                          <SelectItem value="<=">{"≤"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="value">Value</Label>
                      <Input id="value" type="number" placeholder="0" className="bg-[#0F1015] border-gray-700" />
                    </div>
                  </div>
                  <Button className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">Create Alert</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="bg-[#1A1B23] border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Switch checked={alert.enabled} onCheckedChange={() => toggleAlert(alert.id)} />
                      <div>
                        <h4 className="font-medium text-white">{alert.name}</h4>
                        <p className="text-sm text-gray-400">
                          {alert.symbol} {alert.condition} {alert.operator} {alert.value.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={cn("text-xs", getStatusColor(alert.status))}>{alert.status}</Badge>

                      <div className="flex items-center gap-1">
                        {alert.channels.map((channel) => (
                          <div key={channel} className="p-1 bg-gray-800 rounded">
                            {getChannelIcon(channel)}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteAlert(alert.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-[#1A1B23] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Alert Activity</CardTitle>
              <CardDescription>History of triggered alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    time: "2 hours ago",
                    alert: "BTC Price Alert",
                    message: "BTC/USDT crossed above $45,000",
                    status: "triggered",
                  },
                  {
                    time: "4 hours ago",
                    alert: "ETH Volume Spike",
                    message: "ETH/USDT volume exceeded 1M",
                    status: "triggered",
                  },
                  {
                    time: "6 hours ago",
                    alert: "SOL RSI Alert",
                    message: "SOL/USDT RSI dropped below 30",
                    status: "triggered",
                  },
                  {
                    time: "8 hours ago",
                    alert: "ADA Support Level",
                    message: "ADA/USDT bounced from support",
                    status: "triggered",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-[#0F1015] rounded-lg border border-gray-800"
                  >
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{item.alert}</h4>
                      <p className="text-sm text-gray-400">{item.message}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{item.time}</p>
                      <Badge className="text-xs text-yellow-400 bg-yellow-400/10">Triggered</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-[#1A1B23] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Notification Channels</CardTitle>
              <CardDescription>Configure how you want to receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-white">Push Notifications</p>
                    <p className="text-sm text-gray-400">Receive alerts on your device</p>
                  </div>
                </div>
                <Switch
                  checked={alertSettings.pushNotifications}
                  onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, pushNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-white">Email Notifications</p>
                    <p className="text-sm text-gray-400">Receive alerts via email</p>
                  </div>
                </div>
                <Switch
                  checked={alertSettings.emailNotifications}
                  onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-white">Telegram Notifications</p>
                    <p className="text-sm text-gray-400">Receive alerts on Telegram</p>
                  </div>
                </div>
                <Switch
                  checked={alertSettings.telegramNotifications}
                  onCheckedChange={(checked) => setAlertSettings({ ...alertSettings, telegramNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1B23] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Alert Preferences</CardTitle>
              <CardDescription>Customize your alert behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Quiet Hours</p>
                  <p className="text-sm text-gray-400">Disable alerts during specified hours</p>
                </div>
                <Switch
                  checked={alertSettings.quietHours.enabled}
                  onCheckedChange={(checked) =>
                    setAlertSettings({
                      ...alertSettings,
                      quietHours: { ...alertSettings.quietHours, enabled: checked },
                    })
                  }
                />
              </div>

              {alertSettings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiet-start">Start Time</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={alertSettings.quietHours.start}
                      className="bg-[#0F1015] border-gray-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet-end">End Time</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={alertSettings.quietHours.end}
                      className="bg-[#0F1015] border-gray-700"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="max-alerts">Max Alerts Per Hour</Label>
                <Input
                  id="max-alerts"
                  type="number"
                  value={alertSettings.maxAlertsPerHour}
                  className="bg-[#0F1015] border-gray-700"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
