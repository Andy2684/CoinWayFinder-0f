"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Eye, EyeOff, Key, Plus, Trash2, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  createdAt: Date
  lastUsed?: Date
  isActive: boolean
}

interface UsageStats {
  totalRequests: number
  requestsToday: number
  requestsThisMonth: number
  remainingQuota: number
  quotaLimit: number
}

export function ApiAccess() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalRequests: 0,
    requestsToday: 0,
    requestsThisMonth: 0,
    remainingQuota: 0,
    quotaLimit: 0,
  })
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [isCreating, setIsCreating] = useState(false)

  const availablePermissions = [
    { id: "read", label: "Read Access", description: "View data and analytics" },
    { id: "write", label: "Write Access", description: "Create and update data" },
    { id: "delete", label: "Delete Access", description: "Remove data" },
    { id: "admin", label: "Admin Access", description: "Full administrative access" },
  ]

  useEffect(() => {
    loadApiKeys()
    loadUsageStats()
  }, [])

  const loadApiKeys = async () => {
    try {
      // Mock data - replace with actual API call
      const mockKeys: ApiKey[] = [
        {
          id: "1",
          name: "Production API",
          key: "cwf_live_1234567890abcdef",
          permissions: ["read", "write"],
          createdAt: new Date("2024-01-15"),
          lastUsed: new Date("2024-01-20"),
          isActive: true,
        },
        {
          id: "2",
          name: "Development API",
          key: "cwf_test_abcdef1234567890",
          permissions: ["read"],
          createdAt: new Date("2024-01-10"),
          lastUsed: new Date("2024-01-18"),
          isActive: true,
        },
      ]
      setApiKeys(mockKeys)
    } catch (error) {
      toast.error("Failed to load API keys")
    }
  }

  const loadUsageStats = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStats: UsageStats = {
        totalRequests: 15420,
        requestsToday: 234,
        requestsThisMonth: 5680,
        remainingQuota: 4320,
        quotaLimit: 10000,
      }
      setUsageStats(mockStats)
    } catch (error) {
      toast.error("Failed to load usage statistics")
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key")
      return
    }

    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission")
      return
    }

    setIsCreating(true)

    try {
      // Mock API call - replace with actual implementation
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `cwf_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`,
        permissions: selectedPermissions,
        createdAt: new Date(),
        isActive: true,
      }

      setApiKeys((prev) => [newKey, ...prev])
      setNewKeyName("")
      setSelectedPermissions([])
      toast.success("API key created successfully")
    } catch (error) {
      toast.error("Failed to create API key")
    } finally {
      setIsCreating(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      setApiKeys((prev) => prev.filter((key) => key.id !== keyId))
      toast.success("API key deleted successfully")
    } catch (error) {
      toast.error("Failed to delete API key")
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key
    return `${key.substring(0, 8)}${"*".repeat(key.length - 12)}${key.substring(key.length - 4)}`
  }

  const getUsagePercentage = () => {
    if (usageStats.quotaLimit === 0) return 0
    return ((usageStats.quotaLimit - usageStats.remainingQuota) / usageStats.quotaLimit) * 100
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API Access</h2>
        <p className="text-muted-foreground">Manage your API keys and monitor usage</p>
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Usage Statistics</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-4">
          {/* Create New API Key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New API Key
              </CardTitle>
              <CardDescription>Generate a new API key with specific permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production API, Mobile App"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map((permission) => (
                      <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions((prev) => [...prev, permission.id])
                            } else {
                              setSelectedPermissions((prev) => prev.filter((p) => p !== permission.id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={createApiKey} disabled={isCreating} className="w-full md:w-auto">
                {isCreating ? "Creating..." : "Create API Key"}
              </Button>
            </CardContent>
          </Card>

          {/* Existing API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Your API Keys ({apiKeys.length})
              </CardTitle>
              <CardDescription>Manage your existing API keys</CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys</h3>
                  <p className="text-gray-500">Create your first API key to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((apiKey) => (
                    <div key={apiKey.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{apiKey.name}</h4>
                            <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                              {apiKey.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                {showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                              </code>
                              <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                                {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {apiKey.permissions.map((permission) => (
                                <Badge key={permission} variant="outline" className="text-xs">
                                  {availablePermissions.find((p) => p.id === permission)?.label}
                                </Badge>
                              ))}
                            </div>

                            <div className="text-xs text-gray-500">
                              Created: {apiKey.createdAt.toLocaleDateString()}
                              {apiKey.lastUsed && (
                                <span className="ml-4">Last used: {apiKey.lastUsed.toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteApiKey(apiKey.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          {/* Usage Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.requestsToday.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Requests today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageStats.requestsThisMonth.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Requests this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quota Usage</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(getUsagePercentage())}%</div>
                <Progress value={getUsagePercentage()} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {usageStats.remainingQuota.toLocaleString()} / {usageStats.quotaLimit.toLocaleString()} remaining
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Usage Alerts */}
          {getUsagePercentage() > 80 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You've used {Math.round(getUsagePercentage())}% of your monthly quota. Consider upgrading your plan to
                avoid service interruption.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Learn how to integrate with our API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Authentication</h4>
                <p className="text-sm text-gray-600 mb-2">Include your API key in the Authorization header:</p>
                <code className="block bg-gray-100 p-3 rounded text-sm">Authorization: Bearer YOUR_API_KEY</code>
              </div>

              <div>
                <h4 className="font-medium mb-2">Base URL</h4>
                <code className="block bg-gray-100 p-3 rounded text-sm">https://api.coinwayfinder.com/v1</code>
              </div>

              <div>
                <h4 className="font-medium mb-2">Example Request</h4>
                <code className="block bg-gray-100 p-3 rounded text-sm whitespace-pre">
                  {`curl -X GET "https://api.coinwayfinder.com/v1/crypto/prices" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                </code>
              </div>

              <div>
                <h4 className="font-medium mb-2">Rate Limits</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 1000 requests per hour for free tier</li>
                  <li>• 10,000 requests per hour for pro tier</li>
                  <li>• 100,000 requests per hour for enterprise tier</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
