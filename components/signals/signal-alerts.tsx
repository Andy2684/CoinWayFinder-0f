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
import { Bell, Smartphone, Mail, MessageSquare, Plus, Trash2 } from "lucide-react"

interface AlertRule {
  id: string
  name: string
  condition: string
  value: string
  enabled: boolean
  channels: string[]
  created: string
}

export function SignalAlerts() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: "1",
      name: "High Confidence Signals",
      condition: "confidence_above",
      value: "85",
      enabled: true,
      channels: ["push", "email"],
      created: "2024-01-10",
    },
    {
      id: "2",
      name: "BTC Signals",
      condition: "symbol_contains",
      value: "BTC",
      enabled: true,
      channels: ["push", "telegram"],
      created: "2024-01-09",
    },
    {
      id: "3",
      name: "Large P&L Changes",
      condition: "pnl_change_above",
      value: "5",
      enabled: false,
      channels: ["email"],
      created: "2024-01-08",
    },
  ])

  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    telegram: false,
    sms: false,
  })

  const toggleRule = (id: string) => {
    setAlertRules((rules) => rules.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)))
  }

  const deleteRule = (id: string) => {
    setAlertRules((rules) => rules.filter((rule) => rule.id !== id))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="settings">Notification Settings</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Alert Rules</h3>
              <p className="text-sm text-muted-foreground">Configure when to receive signal notifications</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>

          <div className="space-y-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{rule.name}</CardTitle>
                      <CardDescription>
                        {rule.condition.replace("_", " ")} {rule.value}
                        {rule.condition.includes("percentage") && "%"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                      <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {rule.channels.map((channel) => (
                        <Badge key={channel} variant="outline">
                          {channel === "push" && <Smartphone className="h-3 w-3 mr-1" />}
                          {channel === "email" && <Mail className="h-3 w-3 mr-1" />}
                          {channel === "telegram" && <MessageSquare className="h-3 w-3 mr-1" />}
                          {channel}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Created {new Date(rule.created).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create New Rule Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Alert Rule</CardTitle>
              <CardDescription>Set up a new condition for signal notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-name">Rule Name</Label>
                  <Input id="rule-name" placeholder="Enter rule name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confidence_above">Confidence Above</SelectItem>
                      <SelectItem value="confidence_below">Confidence Below</SelectItem>
                      <SelectItem value="symbol_contains">Symbol Contains</SelectItem>
                      <SelectItem value="strategy_equals">Strategy Equals</SelectItem>
                      <SelectItem value="pnl_change_above">P&L Change Above</SelectItem>
                      <SelectItem value="risk_level_equals">Risk Level Equals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input id="value" placeholder="Enter condition value" />
              </div>
              <div className="space-y-2">
                <Label>Notification Channels</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="push-new" />
                    <Label htmlFor="push-new">Push</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="email-new" />
                    <Label htmlFor="email-new">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="telegram-new" />
                    <Label htmlFor="telegram-new">Telegram</Label>
                  </div>
                </div>
              </div>
              <Button className="w-full">Create Alert Rule</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you want to receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Instant alerts on your device</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Detailed alerts via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Telegram Bot</p>
                      <p className="text-sm text-muted-foreground">Alerts via Telegram bot</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.telegram}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, telegram: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5" />
                    <div>
                      <p className="font-medium">SMS Alerts</p>
                      <p className="text-sm text-muted-foreground">Critical alerts via SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                  />
                </div>
              </div>

              {notifications.telegram && (
                <div className="p-4 bg-blue-50 rounded-lg border">
                  <h4 className="font-medium mb-2">Telegram Setup</h4>
                  <p className="text-sm text-muted-foreground mb-3">Connect your Telegram account to receive alerts</p>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Connect Telegram
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Quiet Hours</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiet-start">Start Time</Label>
                    <Input id="quiet-start" type="time" defaultValue="22:00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet-end">End Time</Label>
                    <Input id="quiet-end" type="time" defaultValue="08:00" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>History of sent notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "1",
                    title: "High Confidence BTC Signal",
                    message: "New BUY signal for BTC/USDT with 89% confidence",
                    time: "2 minutes ago",
                    type: "signal",
                    read: false,
                  },
                  {
                    id: "2",
                    title: "Target Reached",
                    message: "ETH/USDT signal reached target price",
                    time: "1 hour ago",
                    type: "success",
                    read: true,
                  },
                  {
                    id: "3",
                    title: "Stop Loss Triggered",
                    message: "SOL/USDT signal stopped out",
                    time: "3 hours ago",
                    type: "warning",
                    read: true,
                  },
                ].map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${!alert.read ? "bg-blue-50 border-blue-200" : ""}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === "signal"
                          ? "bg-blue-500"
                          : alert.type === "success"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
