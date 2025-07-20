"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Shield, CheckCircle, AlertCircle, Plus, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { BackToDashboard } from "@/components/back-to-dashboard"

interface Exchange {
  id: string
  name: string
  logo: string
  connected: boolean
  status: "active" | "error" | "pending"
  lastSync: string
  features: string[]
}

interface ApiKey {
  id: string
  exchange: string
  name: string
  permissions: string[]
  created: string
  lastUsed: string
  status: "active" | "inactive"
}

export default function IntegrationsPage() {
  const [exchanges] = useState<Exchange[]>([
    {
      id: "binance",
      name: "Binance",
      logo: "/placeholder.svg?height=40&width=40",
      connected: true,
      status: "active",
      lastSync: "2 minutes ago",
      features: ["Spot Trading", "Futures", "Options"],
    },
    {
      id: "coinbase",
      name: "Coinbase Pro",
      logo: "/placeholder.svg?height=40&width=40",
      connected: true,
      status: "active",
      lastSync: "5 minutes ago",
      features: ["Spot Trading", "Advanced Orders"],
    },
    {
      id: "kraken",
      name: "Kraken",
      logo: "/placeholder.svg?height=40&width=40",
      connected: false,
      status: "pending",
      lastSync: "Never",
      features: ["Spot Trading", "Futures", "Staking"],
    },
  ])

  const [apiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      exchange: "Binance",
      name: "Main Trading Key",
      permissions: ["Read", "Trade"],
      created: "2023-12-01",
      lastUsed: "2 minutes ago",
      status: "active",
    },
    {
      id: "2",
      exchange: "Coinbase Pro",
      name: "Portfolio Key",
      permissions: ["Read"],
      created: "2023-11-15",
      lastUsed: "1 hour ago",
      status: "active",
    },
  ])

  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({})

  const handleConnect = (exchangeId: string) => {
    toast.success(`Connecting to ${exchangeId}...`)
  }

  const handleDisconnect = (exchangeId: string) => {
    toast.success(`Disconnected from ${exchangeId}`)
  }

  const handleTestConnection = (exchangeId: string) => {
    toast.info(`Testing connection to ${exchangeId}...`)
  }

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-4">
        <BackToDashboard />
        <div>
          <h1 className="text-3xl font-bold">Exchange Integrations</h1>
          <p className="text-muted-foreground">Connect your exchange accounts to enable automated trading</p>
        </div>
      </div>

      <Tabs defaultValue="exchanges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exchanges">Exchanges</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="exchanges" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exchanges.map((exchange) => (
              <Card key={exchange.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={exchange.logo || "/placeholder.svg"}
                        alt={exchange.name}
                        className="w-10 h-10 rounded-lg"
                      />
                      <div>
                        <CardTitle className="text-lg">{exchange.name}</CardTitle>
                        <CardDescription>Last sync: {exchange.lastSync}</CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        exchange.status === "active"
                          ? "default"
                          : exchange.status === "error"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {exchange.status === "active" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {exchange.status === "error" && <AlertCircle className="w-3 h-3 mr-1" />}
                      {exchange.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {exchange.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {exchange.connected ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleTestConnection(exchange.id)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Test
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDisconnect(exchange.id)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => handleConnect(exchange.id)} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your API keys are encrypted and stored securely. We never store your private keys or passwords.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">API Key Management</h3>
              <p className="text-sm text-muted-foreground">Manage your exchange API keys and permissions</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add API Key
            </Button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <Badge variant="outline">{apiKey.exchange}</Badge>
                        <Badge variant={apiKey.status === "active" ? "default" : "secondary"}>{apiKey.status}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Created:</span> {apiKey.created}
                        </div>
                        <div>
                          <span className="font-medium">Last used:</span> {apiKey.lastUsed}
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="text-sm font-medium">Permissions: </span>
                        <div className="flex gap-1 mt-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Input
                          type={showApiKeys[apiKey.id] ? "text" : "password"}
                          value="sk_live_abcd1234efgh5678ijkl9012mnop3456"
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button variant="outline" size="sm" onClick={() => toggleApiKeyVisibility(apiKey.id)}>
                          {showApiKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security settings for your exchange integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">IP Whitelist</Label>
                    <p className="text-sm text-muted-foreground">Only allow API access from specific IP addresses</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for sensitive operations</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-Lock Inactive Keys</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically disable keys after 30 days of inactivity
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Withdrawal Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified of all withdrawal attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  We recommend enabling all security features to protect your trading accounts. Never share your API
                  keys with anyone.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
