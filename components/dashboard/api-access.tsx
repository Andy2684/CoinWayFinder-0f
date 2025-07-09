"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Eye, EyeOff, Key, Trash2, Plus, Code, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApiKey {
  keyId: string
  name: string
  permissions: string[]
  rateLimit: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
  usage: {
    totalRequests: number
    lastUsed?: string
    requestsToday: number
  }
  status: string
  createdAt: string
  expiresAt?: string
}

export function ApiAccess() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyData, setNewKeyData] = useState<any>(null)
  const [showSecret, setShowSecret] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/user/api-keys")
      const data = await response.json()

      if (data.success) {
        setApiKeys(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error)
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async (name: string) => {
    try {
      setCreating(true)

      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (data.success) {
        setNewKeyData(data.data)
        await fetchApiKeys()
        toast({
          title: "API Key Created",
          description: "Your new API key has been created successfully.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const revokeApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        await fetchApiKeys()
        toast({
          title: "API Key Revoked",
          description: "The API key has been revoked successfully.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Access</h2>
          <p className="text-muted-foreground">Manage your CoinWayFinder API keys and access</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>Generate a new API key to access CoinWayFinder programmatically.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="keyName">API Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="My Trading Bot"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const name = (e.target as HTMLInputElement).value
                      if (name.trim()) {
                        createApiKey(name.trim())
                      }
                    }
                  }}
                />
              </div>
              <Button
                onClick={() => {
                  const input = document.getElementById("keyName") as HTMLInputElement
                  const name = input?.value?.trim()
                  if (name) {
                    createApiKey(name)
                  }
                }}
                disabled={creating}
                className="w-full"
              >
                {creating ? "Creating..." : "Create API Key"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* New Key Display */}
      {newKeyData && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <Key className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-semibold text-green-800 dark:text-green-300">🎉 API Key Created Successfully!</p>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs font-medium">Key ID:</Label>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">{newKeyData.keyId}</code>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(newKeyData.keyId)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">Secret Key:</Label>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                      {showSecret ? newKeyData.keySecret : "••••••••••••••••"}
                    </code>
                    <Button size="sm" variant="ghost" onClick={() => setShowSecret(!showSecret)}>
                      {showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(newKeyData.keySecret)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-green-700 dark:text-green-400">
                ⚠️ Save this secret key now - it won't be shown again!
              </p>
              <Button size="sm" variant="outline" onClick={() => setNewKeyData(null)}>
                I've saved it
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">Loading API keys...</div>
              </CardContent>
            </Card>
          ) : apiKeys.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-2">
                  <Key className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No API Keys</h3>
                  <p className="text-muted-foreground">Create your first API key to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {apiKeys.map((key) => (
                <Card key={key.keyId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{key.name}</CardTitle>
                        <CardDescription>
                          Created {formatDate(key.createdAt)}
                          {key.usage.lastUsed && ` • Last used ${formatDate(key.usage.lastUsed)}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={key.status === "active" ? "default" : "destructive"}>{key.status}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => revokeApiKey(key.keyId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium">Key ID:</Label>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm">{key.keyId}</code>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(key.keyId)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs font-medium">Usage Today</Label>
                        <div className="text-2xl font-bold">{key.usage.requestsToday}</div>
                        <div className="text-xs text-muted-foreground">
                          of {key.rateLimit.requestsPerDay} daily limit
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Total Requests</Label>
                        <div className="text-2xl font-bold">{key.usage.totalRequests}</div>
                        <div className="text-xs text-muted-foreground">all time</div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Rate Limits</Label>
                        <div className="text-sm">
                          <div>{key.rateLimit.requestsPerMinute}/min</div>
                          <div>{key.rateLimit.requestsPerHour}/hour</div>
                          <div>{key.rateLimit.requestsPerDay}/day</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium">Permissions</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {key.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                API Documentation
              </CardTitle>
              <CardDescription>Learn how to integrate with the CoinWayFinder API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Base URL</h4>
                <code className="bg-muted px-3 py-2 rounded block">https://coinwayfinder.com/api/v1</code>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Authentication</h4>
                <p className="text-sm text-muted-foreground mb-2">Include your API key in the Authorization header:</p>
                <code className="bg-muted px-3 py-2 rounded block text-sm">
                  Authorization: Bearer your_key_id:your_secret_key
                </code>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Available Endpoints</h4>

                <div className="space-y-2">
                  <div className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">GET</Badge>
                      <code className="text-sm">/api/v1/signals</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Get AI trading signals</p>
                    <p className="text-xs">Required permission: signals:read</p>
                  </div>

                  <div className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">GET</Badge>
                      <code className="text-sm">/api/v1/whales</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Get whale transaction data</p>
                    <p className="text-xs">Required permission: whales:read</p>
                  </div>

                  <div className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">GET</Badge>
                      <code className="text-sm">/api/v1/trends</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Get market trends and analysis</p>
                    <p className="text-xs">Required permission: trends:read</p>
                  </div>

                  <div className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">GET</Badge>
                      <Badge variant="outline">POST</Badge>
                      <code className="text-sm">/api/v1/bots</code>
                    </div>
                    <p className="text-xs text-muted-foreground">Manage your trading bots</p>
                    <p className="text-xs">Required permission: bots:read, bots:create</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Code Examples
              </CardTitle>
              <CardDescription>Ready-to-use code snippets for common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">JavaScript/Node.js</h4>
                <Textarea
                  readOnly
                  className="font-mono text-sm"
                  rows={10}
                  value={`// Get trading signals
const response = await fetch('https://coinwayfinder.com/api/v1/signals', {
  headers: {
    'Authorization': 'Bearer your_key_id:your_secret_key',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.data); // Array of signals

// Create a new trading bot
const botResponse = await fetch('https://coinwayfinder.com/api/v1/bots', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_key_id:your_secret_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My BTC Bot',
    exchange: 'binance',
    strategy: 'dca',
    symbol: 'BTCUSDT',
    config: {
      investment: 100,
      riskLevel: 5
    }
  })
});`}
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Python</h4>
                <Textarea
                  readOnly
                  className="font-mono text-sm"
                  rows={8}
                  value={
                    `import requests

# Get whale transactions
headers = {
    'Authorization': 'Bearer your_key_id:your_secret_key',
    'Content-Type': 'application/json'
}

response = requests.get('https://coinwayfinder.com/api/v1/whales', headers=headers)
whales = response.json()

for whale in whales['data']:
    print(f"Whale moved {whale['amount']} {whale['token']} worth ${whale['usdValue']:,}")`
                  }
                />
                \
              </div>

              <div>
                <h4 className="font-semibold mb-2">cURL</h4>
                <Textarea
                  readOnly
                  className="font-mono text-sm"
                  rows={6}
                  value={`# Get market trends
curl -X GET "https://coinwayfinder.com/api/v1/trends?symbol=BTC" \\
  -H "Authorization: Bearer your_key_id:your_secret_key" \\
  -H "Content-Type: application/json"

# Response includes trend analysis, sentiment scores, and technical indicators`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
