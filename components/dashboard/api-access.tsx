"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { Copy, Eye, EyeOff, Key, Plus, Trash2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string
  usage: number
  limit: number
  isActive: boolean
}

interface UsageStats {
  totalRequests: number
  requestsToday: number
  requestsThisMonth: number
  limit: number
  resetDate: string
  percentage: number
}

export function ApiAccess() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchApiKeys()
    fetchUsageStats()
  }, [])

  const fetchApiKeys = async () => {
    try {
      // Mock data for demonstration
      const mockApiKeys: ApiKey[] = [
        {
          id: "key_1",
          name: "Trading Bot",
          key: "cwf_1234567890abcdef1234567890abcdef12345678",
          createdAt: "2024-01-15T10:30:00Z",
          lastUsed: "2024-01-20T14:22:00Z",
          usage: 1250,
          limit: 10000,
          isActive: true,
        },
        {
          id: "key_2",
          name: "Mobile App",
          key: "cwf_abcdef1234567890abcdef1234567890abcdef12",
          createdAt: "2024-01-10T09:15:00Z",
          lastUsed: "2024-01-19T16:45:00Z",
          usage: 750,
          limit: 5000,
          isActive: true,
        },
      ]

      setApiKeys(mockApiKeys)
    } catch (error) {
      console.error("Failed to fetch API keys:", error)
      toast.error("Failed to load API keys")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsageStats = async () => {
    try {
      // Mock data for demonstration
      const mockUsageStats: UsageStats = {
        totalRequests: 15420,
        requestsToday: 234,
        requestsThisMonth: 2000,
        limit: 15000,
        resetDate: "2024-02-01T00:00:00Z",
        percentage: 13.3,
      }

      setUsageStats(mockUsageStats)
    } catch (error) {
      console.error("Failed to fetch usage stats:", error)
    }
  }

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key")
      return
    }

    setCreating(true)
    try {
      // Mock API key creation
      const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        name: newKeyName,
        key: `cwf_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date().toISOString(),
        usage: 0,
        limit: 1000,
        isActive: true,
      }

      setApiKeys([...apiKeys, newKey])
      setNewKeyName("")
      setIsDialogOpen(false)
      toast.success("API key created successfully")
    } catch (error) {
      console.error("Failed to create API key:", error)
      toast.error("Failed to create API key")
    } finally {
      setCreating(false)
    }
  }

  const deleteApiKey = async (keyId: string) => {
    try {
      setApiKeys(apiKeys.filter((key) => key.id !== keyId))
      toast.success("API key deleted successfully")
    } catch (error) {
      console.error("Failed to delete API key:", error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>Loading API keys and usage statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Usage Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            API Usage Overview
          </CardTitle>
          <CardDescription>Monitor your API usage and limits</CardDescription>
        </CardHeader>
        <CardContent>
          {usageStats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{usageStats.totalRequests.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Total Requests</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{usageStats.requestsToday.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Requests Today</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {usageStats.requestsThisMonth.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-500">This Month</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{usageStats.limit.toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Monthly Limit</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Monthly Usage</span>
                  <span>
                    {usageStats.requestsThisMonth.toLocaleString()} / {usageStats.limit.toLocaleString()}
                  </span>
                </div>
                <Progress value={usageStats.percentage} className="w-full" />
                <p className="text-sm text-gray-500">
                  Resets on {formatDate(usageStats.resetDate)} • {usageStats.percentage.toFixed(1)}% used
                </p>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Usage statistics are not available at the moment.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* API Keys Management Card */}
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key to access CoinWayFinder services programmatically.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyName">API Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Trading Bot, Mobile App, Analytics Dashboard"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createApiKey} disabled={creating}>
                    {creating ? "Creating..." : "Create Key"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h3>
              <p className="text-gray-500 mb-6">Create your first API key to start using the CoinWayFinder API.</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-lg">{apiKey.name}</h4>
                          <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                            {apiKey.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">
                            {apiKey.usage.toLocaleString()} / {apiKey.limit.toLocaleString()} requests
                          </Badge>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-sm font-mono">
                              {showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                            </code>
                            <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                              {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="space-y-1">
                            <p>Created: {formatDate(apiKey.createdAt)}</p>
                            {apiKey.lastUsed && <p>Last used: {formatDate(apiKey.lastUsed)}</p>}
                          </div>
                          <div className="text-right">
                            <Progress value={(apiKey.usage / apiKey.limit) * 100} className="w-32 h-2 mb-1" />
                            <p>{((apiKey.usage / apiKey.limit) * 100).toFixed(1)}% used</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-4"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Documentation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>Get started with the CoinWayFinder API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Authentication</h4>
            <p className="text-sm text-gray-600 mb-2">Include your API key in the Authorization header:</p>
            <div className="bg-gray-100 p-3 rounded-lg">
              <code className="text-sm">Authorization: Bearer YOUR_API_KEY</code>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Base URL</h4>
            <div className="bg-gray-100 p-3 rounded-lg">
              <code className="text-sm">https://coinwayfinder.vercel.app/api/v1</code>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Example Request</h4>
            <div className="bg-gray-100 p-3 rounded-lg">
              <code className="text-sm whitespace-pre-wrap">
                {`curl -X GET "https://coinwayfinder.vercel.app/api/v1/crypto/prices" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
              </code>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href="/api-docs" target="_blank" rel="noopener noreferrer">
                View Full Documentation
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api-docs#examples" target="_blank" rel="noopener noreferrer">
                Code Examples
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ApiAccess
