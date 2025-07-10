"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Code,
  Book,
} from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: Date
  lastUsed?: Date
  usageCount: number
  isActive: boolean
  permissions: string[]
}

interface UsageStats {
  totalRequests: number
  requestsToday: number
  requestsThisMonth: number
  averageResponseTime: number
  errorRate: number
  quotaUsed: number
  quotaLimit: number
}

interface ApiEndpoint {
  path: string
  method: string
  description: string
  parameters: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  example: string
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    path: "/api/v1/crypto/prices",
    method: "GET",
    description: "Get current cryptocurrency prices",
    parameters: [
      {
        name: "symbols",
        type: "string",
        required: false,
        description: "Comma-separated list of symbols (e.g., BTC,ETH)",
      },
      { name: "limit", type: "number", required: false, description: "Maximum number of results (default: 100)" },
    ],
    example:
      'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.coinwayfinder.com/api/v1/crypto/prices?symbols=BTC,ETH',
  },
  {
    path: "/api/v1/signals",
    method: "GET",
    description: "Get trading signals",
    parameters: [
      { name: "symbol", type: "string", required: false, description: "Cryptocurrency symbol" },
      { name: "timeframe", type: "string", required: false, description: "Time frame (1h, 4h, 1d)" },
    ],
    example:
      'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.coinwayfinder.com/api/v1/signals?symbol=BTC&timeframe=1h',
  },
  {
    path: "/api/v1/whales",
    method: "GET",
    description: "Get whale movement alerts",
    parameters: [
      { name: "symbol", type: "string", required: false, description: "Cryptocurrency symbol" },
      { name: "min_amount", type: "number", required: false, description: "Minimum transaction amount in USD" },
    ],
    example:
      'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.coinwayfinder.com/api/v1/whales?symbol=BTC&min_amount=1000000',
  },
  {
    path: "/api/v1/trends",
    method: "GET",
    description: "Get market trends and analysis",
    parameters: [{ name: "period", type: "string", required: false, description: "Analysis period (24h, 7d, 30d)" }],
    example: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.coinwayfinder.com/api/v1/trends?period=24h',
  },
]

export function ApiAccess() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [isCreatingKey, setIsCreatingKey] = useState(false)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)

  // Load API keys and usage stats
  useEffect(() => {
    loadApiKeys()
    loadUsageStats()
  }, [])

  const loadApiKeys = async () => {
    try {
      const response = await fetch("/api/user/api-keys")
      if (response.ok) {
        const keys = await response.json()
        setApiKeys(keys)
      }
    } catch (error) {
      toast.error("Failed to load API keys")
    }
  }

  const loadUsageStats = async () => {
    try {
      const response = await fetch("/api/user/usage-stats")
      if (response.ok) {
        const stats = await response.json()
        setUsageStats(stats)
      }
    } catch (error) {
      toast.error("Failed to load usage statistics")
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key")
      return
    }

    setIsCreatingKey(true)
    try {
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (response.ok) {
        const newKey = await response.json()
        setApiKeys((prev) => [newKey, ...prev])
        setNewKeyName("")
        toast.success("API key created successfully")
      } else {
        throw new Error("Failed to create API key")
      }
    } catch (error) {
      toast.error("Failed to create API key")
    } finally {
      setIsCreatingKey(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setApiKeys((prev) => prev.filter((key) => key.id !== keyId))
        toast.success("API key deleted successfully")
      } else {
        throw new Error("Failed to delete API key")
      }
    } catch (error) {
      toast.error("Failed to delete API key")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(keyId)) {
        newSet.delete(keyId)
      } else {
        newSet.add(keyId)
      }
      return newSet
    })
  }

  const maskApiKey = (key: string) => {
    return `${key.substring(0, 8)}${"*".repeat(24)}${key.substring(key.length - 8)}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">API Access</h2>
        <p className="text-muted-foreground">Manage your API keys and monitor usage statistics</p>
      </div>

      {/* Usage Statistics */}
      {usageStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageStats.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{usageStats.requestsToday} today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quota Usage</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((usageStats.quotaUsed / usageStats.quotaLimit) * 100).toFixed(1)}%
              </div>
              <Progress value={(usageStats.quotaUsed / usageStats.quotaLimit) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {usageStats.quotaUsed.toLocaleString()} / {usageStats.quotaLimit.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageStats.averageResponseTime}ms</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageStats.errorRate.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          {/* Create New API Key */}
          <Card>
            <CardHeader>
              <CardTitle>Create New API Key</CardTitle>
              <CardDescription>Generate a new API key to access our services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production Bot, Development Testing"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <Button onClick={createApiKey} disabled={isCreatingKey || !newKeyName.trim()}>
                  {isCreatingKey ? (
                    <>
                      <Key className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create API Key
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Keys List */}
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys ({apiKeys.length})</CardTitle>
              <CardDescription>Manage your existing API keys</CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No API keys found</p>
                  <p className="text-sm">Create your first API key to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <Card key={apiKey.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{apiKey.name}</h4>
                            <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                              {apiKey.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-2 font-mono text-sm">
                            <span>{visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}</span>
                            <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                              {visibleKeys.has(apiKey.id) ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Created: {apiKey.createdAt.toLocaleDateString()}</span>
                            <span>Usage: {apiKey.usageCount.toLocaleString()} requests</span>
                            {apiKey.lastUsed && <span>Last used: {apiKey.lastUsed.toLocaleDateString()}</span>}
                          </div>
                        </div>

                        <Button variant="destructive" size="sm" onClick={() => deleteApiKey(apiKey.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="h-5 w-5 mr-2" />
                API Documentation
              </CardTitle>
              <CardDescription>Complete reference for all available endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Base URL:</strong> https://api.coinwayfinder.com
                  <br />
                  <strong>Authentication:</strong> Include your API key in the Authorization header:
                  <code className="ml-1">Authorization: Bearer YOUR_API_KEY</code>
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                {API_ENDPOINTS.map((endpoint, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="font-mono text-sm">{endpoint.path}</code>
                      </div>

                      <p className="text-sm text-muted-foreground">{endpoint.description}</p>

                      {endpoint.parameters.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Parameters:</h5>
                          <div className="space-y-2">
                            {endpoint.parameters.map((param, paramIndex) => (
                              <div key={paramIndex} className="flex items-center space-x-2 text-sm">
                                <code className="font-mono">{param.name}</code>
                                <Badge variant="secondary" className="text-xs">
                                  {param.type}
                                </Badge>
                                {param.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                                <span className="text-muted-foreground">{param.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h5 className="font-medium mb-2">Example:</h5>
                        <div className="bg-gray-100 p-3 rounded-md">
                          <code className="text-sm">{endpoint.example}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => copyToClipboard(endpoint.example)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Code Examples
              </CardTitle>
              <CardDescription>Ready-to-use code snippets in various programming languages</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>

                <TabsContent value="javascript">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Fetch Crypto Prices</h4>
                      <div className="bg-gray-100 p-4 rounded-md">
                        <pre className="text-sm overflow-x-auto">
                          {`const response = await fetch('https://api.coinwayfinder.com/api/v1/crypto/prices', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`}
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            copyToClipboard(`const response = await fetch('https://api.coinwayfinder.com/api/v1/crypto/prices', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`)
                          }
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="python">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Fetch Crypto Prices</h4>
                      <div className="bg-gray-100 p-4 rounded-md">
                        <pre className="text-sm overflow-x-auto">
                          {`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.coinwayfinder.com/api/v1/crypto/prices',
    headers=headers
)

data = response.json()
print(data)`}
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            copyToClipboard(`import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.coinwayfinder.com/api/v1/crypto/prices',
    headers=headers
)

data = response.json()
print(data)`)
                          }
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="curl">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Fetch Crypto Prices</h4>
                      <div className="bg-gray-100 p-4 rounded-md">
                        <pre className="text-sm overflow-x-auto">
                          {`curl -X GET "https://api.coinwayfinder.com/api/v1/crypto/prices" \\
     -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json"`}
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            copyToClipboard(`curl -X GET "https://api.coinwayfinder.com/api/v1/crypto/prices" \\
     -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json"`)
                          }
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ApiAccess
