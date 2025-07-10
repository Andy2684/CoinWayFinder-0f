"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Copy, Eye, EyeOff, Key, Trash2, Plus, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ApiKey {
  id: string
  name: string
  key: string
  usage: number
  limit: number
  created: string
  lastUsed: string
}

interface UsageStats {
  current: number
  limit: number
  resetDate: string
}

export function ApiAccess() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats>({
    current: 0,
    limit: 1000,
    resetDate: new Date().toISOString(),
  })
  const [loading, setLoading] = useState(true)
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchApiKeys()
    fetchUsageStats()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/user/api-keys")
      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.apiKeys || [])
      }
    } catch (error) {
      console.error("Error fetching API keys:", error)
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
      console.error("Error fetching usage stats:", error)
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName }),
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys([...apiKeys, data.apiKey])
        setNewKeyName("")
        setCreateDialogOpen(false)
        toast.success("API key created successfully")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to create API key")
      }
    } catch (error) {
      console.error("Error creating API key:", error)
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
        const error = await response.json()
        toast.error(error.message || "Failed to delete API key")
      }
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast.error("Failed to delete API key")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("API key copied to clipboard")
  }

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(showApiKey === keyId ? null : keyId)
  }

  const maskApiKey = (key: string) => {
    return key.slice(0, 8) + "..." + key.slice(-4)
  }

  const usagePercentage = (usageStats.current / usageStats.limit) * 100

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-48 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            API Usage
          </CardTitle>
          <CardDescription>Track your API usage and manage your limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Current Usage</span>
              <span className="text-sm text-gray-600">
                {usageStats.current.toLocaleString()} / {usageStats.limit.toLocaleString()} requests
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Resets on {new Date(usageStats.resetDate).toLocaleDateString()}</span>
              <Badge variant={usagePercentage > 80 ? "destructive" : "secondary"}>
                {usagePercentage.toFixed(1)}% used
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>Manage your API keys for accessing CoinWayFinder services</CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>Create a new API key to access CoinWayFinder services</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyName">API Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Trading Bot Integration"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createApiKey}>Create Key</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No API keys created yet</p>
              <p className="text-sm">Create your first API key to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{apiKey.name}</h3>
                      <p className="text-sm text-gray-600">Created {new Date(apiKey.created).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {apiKey.usage}/{apiKey.limit} requests
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => toggleApiKeyVisibility(apiKey.id)}>
                        {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this API key? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteApiKey(apiKey.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <code className="text-sm font-mono">
                      {showApiKey === apiKey.id ? apiKey.key : maskApiKey(apiKey.key)}
                    </code>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                    <Progress value={(apiKey.usage / apiKey.limit) * 100} className="w-24 h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ApiAccess
