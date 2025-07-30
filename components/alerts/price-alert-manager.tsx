"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, Mail, Smartphone, MessageSquare } from "lucide-react"

interface PriceAlert {
  id: string
  userId: string
  symbol: string
  exchange: string
  type:
    | "price_above"
    | "price_below"
    | "price_change"
    | "volume_spike"
    | "rsi_oversold"
    | "rsi_overbought"
    | "macd_cross"
  condition: {
    value: number
    percentage?: number
    timeframe?: string
  }
  isActive: boolean
  isTriggered: boolean
  createdAt: number
  triggeredAt?: number
  message: string
  notificationMethods: ("email" | "push" | "sms")[]
  metadata?: Record<string, any>
}

export function PriceAlertManager() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAlert, setNewAlert] = useState({
    symbol: "",
    exchange: "binance",
    type: "price_above" as const,
    condition: { value: 0 },
    message: "",
    notificationMethods: ["email"] as ("email" | "push" | "sms")[],
  })
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null)
  const [stats, setStats] = useState({ total: 0, active: 0, triggered: 0, byType: {} })

  useEffect(() => {
    loadAlerts()
    loadStats()
  }, [])

  const loadAlerts = async () => {
    try {
      const response = await fetch("/api/alerts?action=user&userId=demo-user")
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.data || [])
      }
    } catch (error) {
      console.error("Failed to load alerts:", error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch("/api/alerts?action=stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.data)
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const createAlert = async () => {
    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAlert,
          userId: "demo-user",
          symbol: newAlert.symbol.toUpperCase(),
        }),
      })

      if (response.ok) {
        setIsCreateDialogOpen(false)
        setNewAlert({
          symbol: "",
          exchange: "binance",
          type: "price_above",
          condition: { value: 0 },
          message: "",
          notificationMethods: ["email"],
        })
        loadAlerts()
        loadStats()
      }
    } catch (error) {
      console.error("Failed to create alert:", error)
    }
  }

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts?alertId=${alertId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        loadAlerts()
        loadStats()
      }
    } catch (error) {
      console.error("Failed to delete alert:", error)
    }
  }

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, isActive }),
      })

      if (response.ok) {
        loadAlerts()
      }
    } catch (error) {
      console.error("Failed to toggle alert:", error)
    }
  }

  const getAlertTypeLabel = (type: string) => {
    const labels = {
      price_above: "Price Above",
      price_below: "Price Below",
      price_change: "Price Change",
      volume_spike: "Volume Spike",
      rsi_oversold: "RSI Oversold",
      rsi_overbought: "RSI Overbought",
      macd_cross: "MACD Cross",
    }
    return labels[type as keyof typeof labels] || type
  }

  const getNotificationIcon = (method: string) => {
    switch (method) {
      case "email":
        return <Mail className="w-4 h-4" />
      case "push":
        return <Smartphone className="w-4 h-4" />
      case "sms":
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString() + " " + new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Triggered</p>
                <p className="text-2xl font-bold text-orange-600">{stats.triggered}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total > 0 ? Math.round((stats.triggered / stats.total) * 100) : 0}%
                </p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Price Alerts</span>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Symbol</Label>
                      <Input
                        placeholder="BTCUSDT"
                        value={newAlert.symbol}
                        onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Exchange</Label>
                      <Select
                        value={newAlert.exchange}
                        onValueChange={(value) => setNewAlert({ ...newAlert, exchange: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="binance">Binance</SelectItem>
                          <SelectItem value="bybit">Bybit</SelectItem>
                          <SelectItem value="coinbase">Coinbase</SelectItem>
                          <SelectItem value="kraken">Kraken</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Alert Type</Label>
                    <Select
                      value={newAlert.type}
                      onValueChange={(value) => setNewAlert({ ...newAlert, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price_above">Price Above</SelectItem>
                        <SelectItem value="price_below">Price Below</SelectItem>
                        <SelectItem value="price_change">Price Change %</SelectItem>
                        <SelectItem value="volume_spike">Volume Spike</SelectItem>
                        <SelectItem value="rsi_oversold">RSI Oversold</SelectItem>
                        <SelectItem value="rsi_overbought">RSI Overbought</SelectItem>
                        <SelectItem value="macd_cross">MACD Cross</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {newAlert.type.includes("price") && !newAlert.type.includes("change")
                        ? "Price Value"
                        : newAlert.type.includes("change")
                          ? "Percentage %"
                          : newAlert.type.includes("rsi")
                            ? "RSI Value"
                            : newAlert.type.includes("volume")
                              ? "Volume Multiplier"
                              : "Value"}
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newAlert.condition.value}
                      onChange={(e) =>
                        setNewAlert({
                          ...newAlert,
                          condition: { ...newAlert.condition, value: Number(e.target.value) },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Custom Message (Optional)</Label>
                    <Input
                      placeholder="Alert message..."
                      value={newAlert.message}
                      onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notification Methods</Label>
                    <div className="space-y-2">
                      {["email", "push", "sms"].map((method) => (
                        <div key={method} className="flex items-center space-x-2">
                          <Checkbox
                            checked={newAlert.notificationMethods.includes(method as any)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewAlert({
                                  ...newAlert,
                                  notificationMethods: [...newAlert.notificationMethods, method as any],
                                })
                              } else {
                                setNewAlert({
                                  ...newAlert,
                                  notificationMethods: newAlert.notificationMethods.filter((m) => m !== method),
                                })
                              }
                            }}
                          />
                          <div className="flex items-center space-x-2">
                            {getNotificationIcon(method)}
                            <Label className="capitalize">{method}</Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createAlert} disabled={!newAlert.symbol || !newAlert.condition.value}>
                      Create Alert
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                Active ({alerts.filter((a) => a.isActive && !a.isTriggered).length})
              </TabsTrigger>
              <TabsTrigger value="triggered">Triggered ({alerts.filter((a) => a.isTriggered).length})</TabsTrigger>
              <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {alerts.filter((a) => a.isActive && !a.isTriggered).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active alerts. Create your first alert to get started.
                </div>
              ) : (
                alerts
                  .filter((a) => a.isActive && !a.isTriggered)
                  .map((alert) => (
                    <Card key={alert.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold">{alert.symbol}</h3>
                              <p className="text-sm text-muted-foreground capitalize">{alert.exchange}</p>
                            </div>
                            <div>
                              <Badge variant="outline">{getAlertTypeLabel(alert.type)}</Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                {alert.type.includes("price") && !alert.type.includes("change")
                                  ? `$${alert.condition.value}`
                                  : alert.type.includes("change")
                                    ? `${alert.condition.value}%`
                                    : alert.condition.value}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              {alert.notificationMethods.map((method, index) => (
                                <div key={index} className="p-1 rounded bg-muted">
                                  {getNotificationIcon(method)}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={alert.isActive}
                              onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                            />
                            <Button variant="outline" size="sm" onClick={() => deleteAlert(alert.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {alert.message && <p className="text-sm text-muted-foreground mt-2">{alert.message}</p>}
                        <p className="text-xs text-muted-foreground mt-2">Created: {formatDate(alert.createdAt)}</p>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>

            <TabsContent value="triggered" className="space-y-4">
              {alerts.filter((a) => a.isTriggered).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No triggered alerts yet.</div>
              ) : (
                alerts
                  .filter((a) => a.isTriggered)
                  .map((alert) => (
                    <Card key={alert.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-semibold">{alert.symbol}</h3>
                              <p className="text-sm text-muted-foreground capitalize">{alert.exchange}</p>
                            </div>
                            <div>
                              <Badge variant="destructive">{getAlertTypeLabel(alert.type)}</Badge>
                              <p className="text-sm text-muted-foreground mt-1">
                                Triggered: {alert.triggeredAt ? formatDate(alert.triggeredAt) : "Unknown"}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => deleteAlert(alert.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No alerts created yet.</div>
              ) : (
                alerts.map((alert) => (
                  <Card key={alert.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold">{alert.symbol}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{alert.exchange}</p>
                          </div>
                          <div>
                            <Badge
                              variant={alert.isTriggered ? "destructive" : alert.isActive ? "default" : "secondary"}
                            >
                              {alert.isTriggered ? "Triggered" : alert.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">{getAlertTypeLabel(alert.type)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={alert.isActive}
                            onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
                            disabled={alert.isTriggered}
                          />
                          <Button variant="outline" size="sm" onClick={() => deleteAlert(alert.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
