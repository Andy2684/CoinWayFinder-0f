"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Eye, EyeOff, Key, Trash2, Plus, Activity, TrendingUp, Clock, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string
  requests: number
  limit: number
}

interface UsageStats {
  totalRequests: number
  monthlyLimit: number
  remainingRequests: number
  resetDate: string
}

export function ApiAccess() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchApiKeys()
    fetchUsageStats()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/user/api-keys")
      if (response.ok) {
        const keys = await response.json()
        setApiKeys(keys)
      }
    } catch (error) {
      toast.error("Failed to fetch API keys")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsageStats = async () => {
    try {
      const response = await fetch("/api/user/usage-stats")
      if (response.ok) {
        const stats = await response.json()
        setUsageStats(stats)
      }
    } catch (error) {
      console.error("Failed to fetch usage stats:", error)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (response.ok) {
        const newKey = await response.json()
        setApiKeys([...apiKeys, newKey])
        setNewKeyName("")
        toast.success("API key created successfully")
      } else {
        toast.error("Failed to create API key")
      }
    } catch (error) {
      toast.error("Failed to create API key")
    } finally {
      setIsCreating(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setApiKeys(apiKeys.filter((key) => key.id !== keyId))
        toast.success("API key deleted successfully")
      } else {
        toast.error("Failed to delete API key")
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
    setShowKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const maskApiKey = (key: string) => {
    return `${key.substring(0, 8)}${"*".repeat(24)}${key.substring(key.length - 4)}`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Usage Statistics */}
      {usageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              API Usage Statistics
            </CardTitle>
            <CardDescription>Monitor your API usage and limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Requests Used</span>
                  <span className="text-sm text-muted-foreground">{usageStats.totalRequests.toLocaleString()}</span>
                </div>
                <Progress value={(usageStats.totalRequests / usageStats.monthlyLimit) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Remaining</span>
                  <span className="text-sm text-muted-foreground">{usageStats.remainingRequests.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Resets {usageStats.resetDate}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Limit</span>
                  <span className="text-sm text-muted-foreground">{usageStats.monthlyLimit.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
            </div>

            {usageStats.remainingRequests < usageStats.monthlyLimit * 0.1 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You're approaching your monthly API limit. Consider upgrading your plan.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>Create and manage your API keys for accessing CoinWayFinder services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create New API Key */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="keyName">API Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Production Bot, Development"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={createApiKey} disabled={isCreating || !newKeyName.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? "Creating..." : "Create Key"}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Existing API Keys */}
          <div className="space-y-4">
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No API keys created yet</p>
                <p className="text-sm">Create your first API key to get started</p>
              </div>
            ) : (
              apiKeys.map((apiKey) => (
                <Card key={apiKey.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <Badge variant="secondary">Active</Badge>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-sm">
                        <span className="bg-muted px-2 py-1 rounded">
                          {showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                          {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created: {apiKey.created}</span>
                        <span>Last used: {apiKey.lastUsed}</span>
                        <span>Requests: {apiKey.requests.toLocaleString()}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteApiKey(apiKey.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Documentation Link */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">API Documentation</h4>
              <p className="text-sm text-muted-foreground">Learn how to integrate with our API endpoints</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/api-docs" target="_blank" rel="noreferrer">
                View Docs
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
