"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Eye, EyeOff, Key, Plus, Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  key: string
  lastUsed: string
  requests: number
  limit: number
  createdAt: string
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApiKeys()
    fetchUsageStats()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/user/api-keys")
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.keys || [])
      }
    } catch (error) {
      toast.error("Failed to fetch API keys")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsageStats = async () => {
    try {
      const response = await fetch("/api/user/usage-stats")
      if (response.ok) {
        const data = await response.json()
        setUsageStats(data)
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

    try {
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys([...apiKeys, data.key])
        setNewKeyName("")
        setIsCreateDialogOpen(false)
        toast.success("API key created successfully")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create API key")
      }
    } catch (error) {
      toast.error("Failed to create API key")
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
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const maskApiKey = (key: string) => {
    return `${key.substring(0, 8)}${"*".repeat(24)}${key.substring(key.length - 4)}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>Loading API access information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Access
        </CardTitle>
        <CardDescription>Manage your API keys and monitor usage</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="keys" className="space-y-4">
          <TabsList>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
            <TabsTrigger value="usage">Usage Stats</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Your API Keys</h3>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                      Give your API key a descriptive name to help you identify it later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        placeholder="e.g., Trading Bot, Mobile App"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createApiKey}>Create Key</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {apiKeys.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>You don't have any API keys yet. Create one to start using the API.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <Card key={apiKey.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{apiKey.name}</h4>
                            <Badge variant="secondary">
                              {apiKey.requests.toLocaleString()} / {apiKey.limit.toLocaleString()} requests
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-sm">
                            <span>{showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}</span>
                            <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                              {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Last used: {apiKey.lastUsed || "Never"} • Created:{" "}
                            {new Date(apiKey.createdAt).toLocaleDateString()}
                          </p>
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
                      <div className="mt-4">
                        <Progress value={(apiKey.requests / apiKey.limit) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            {usageStats ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Requests Used</span>
                        <span className="font-mono">
                          {usageStats.totalRequests.toLocaleString()} / {usageStats.monthlyLimit.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={(usageStats.totalRequests / usageStats.monthlyLimit) * 100} className="h-3" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Remaining: {usageStats.remainingRequests.toLocaleString()}</span>
                        <span>Resets: {new Date(usageStats.resetDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Alert>
                <AlertDescription>Usage statistics are not available at the moment.</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Include your API key in the Authorization header:
                  </p>
                  <code className="block bg-muted p-2 rounded text-sm">Authorization: Bearer YOUR_API_KEY</code>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Base URL</h4>
                  <code className="block bg-muted p-2 rounded text-sm">https://coinwayfinder.vercel.app/api/v1</code>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Rate Limits</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Starter: 1,000 requests/month</li>
                    <li>• Pro: 10,000 requests/month</li>
                    <li>• Enterprise: 100,000 requests/month</li>
                  </ul>
                </div>
                <Button asChild>
                  <a href="/api-docs" target="_blank" rel="noreferrer">
                    View Full Documentation
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ApiAccess
