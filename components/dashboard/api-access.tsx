"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface APIKey {
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
    requestsThisHour: number
    requestsThisMinute: number
  }
  isActive: boolean
  createdAt: string
  expiresAt?: string
}

interface NewAPIKey {
  keyId: string
  secret: string
  name: string
  permissions: string[]
  rateLimit: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
  }
}

export function ApiAccess() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newAPIKey, setNewAPIKey] = useState<NewAPIKey | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<"active" | "expired" | "cancelled">("active")

  useEffect(() => {
    loadAPIKeys()
  }, [])

  const loadAPIKeys = async () => {
    try {
      const response = await fetch("/api/user/api-keys", {
        headers: {
          "x-user-id": "demo-user",
        },
      })
      const data = await response.json()

      if (data.success) {
        setApiKeys(data.apiKeys)
      }
    } catch (error) {
      console.error("Failed to load API keys:", error)
    } finally {
      setLoading(false)
    }
  }

  const createAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your API key",
        variant: "destructive",
      })
      return
    }

    setCreating(true)

    try {
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "demo-user",
        },
        body: JSON.stringify({
          name: newKeyName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setNewAPIKey(data.apiKey)
        setNewKeyName("")
        await loadAPIKeys()
        toast({
          title: "Success",
          description: "API key created successfully",
        })
      } else {
        if (response.status === 402) {
          setSubscriptionStatus(data.subscriptionStatus)
        }
        toast({
          title: "Error",
          description: data.error || "Failed to create API key",
          variant: "destructive",
        })
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

  const revokeAPIKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": "demo-user",
        },
      })

      const data = await response.json()

      if (data.success) {
        await loadAPIKeys()
        toast({
          title: "Success",
          description: "API key revoked successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to revoke API key",
          variant: "destructive",
        })
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
      description: "API key copied to clipboard",
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

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-400"
    if (percentage >= 70) return "text-yellow-400"
    return "text-green-400"
  }

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#30D5C8]" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Subscription Warning */}
      {subscriptionStatus !== "active" && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Your subscription has expired. Existing API keys will continue to work for read operations, but you cannot
            create new keys or perform write operations until you renew.
            <Button variant="link" className="p-0 ml-2 text-yellow-800 underline">
              Renew Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Access
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your API keys and access programmatic trading features
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-black"
                  disabled={subscriptionStatus !== "active"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New API Key</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Generate a new API key for programmatic access to CoinWayFinder
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyName" className="text-white">
                      Key Name
                    </Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Trading Bot, Mobile App"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <Button
                    onClick={createAPIKey}
                    disabled={creating}
                    className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-black"
                  >
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create API Key
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* New API Key Display */}
      {newAPIKey && (
        <Card className="bg-green-900/20 border-green-800">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              API Key Created Successfully
            </CardTitle>
            <CardDescription className="text-green-300">
              Save these credentials now - the secret will not be shown again
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-green-400">Key ID</Label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="flex-1 bg-gray-800 p-2 rounded text-green-300 font-mono text-sm">
                  {newAPIKey.keyId}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(newAPIKey.keyId)}
                  className="text-green-400 hover:text-green-300"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-green-400">Secret Key</Label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="flex-1 bg-gray-800 p-2 rounded text-green-300 font-mono text-sm">
                  {showSecret ? newAPIKey.secret : "•".repeat(32)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-green-400 hover:text-green-300"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(newAPIKey.secret)}
                  className="text-green-400 hover:text-green-300"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Alert className="border-green-200 bg-green-50">
              <AlertTriangle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Use format:{" "}
                <code>
                  Authorization: Bearer {newAPIKey.keyId}:{newAPIKey.secret}
                </code>
              </AlertDescription>
            </Alert>
            <Button
              variant="ghost"
              onClick={() => setNewAPIKey(null)}
              className="w-full text-green-400 hover:text-green-300"
            >
              I've saved my credentials
            </Button>
          </CardContent>
        </Card>
      )}

      {/* API Keys Table */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Your API Keys</CardTitle>
          <CardDescription className="text-gray-400">Manage and monitor your active API keys</CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No API Keys</h3>
              <p className="text-gray-400 mb-6">Create your first API key to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Key ID</TableHead>
                  <TableHead className="text-gray-300">Usage Today</TableHead>
                  <TableHead className="text-gray-300">Permissions</TableHead>
                  <TableHead className="text-gray-300">Last Used</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.keyId} className="border-gray-700">
                    <TableCell className="text-white font-medium">{key.name}</TableCell>
                    <TableCell>
                      <code className="bg-gray-800 px-2 py-1 rounded text-sm text-gray-300">
                        {key.keyId.substring(0, 20)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span
                            className={getUsageColor(
                              getUsagePercentage(key.usage.requestsToday, key.rateLimit.requestsPerDay),
                            )}
                          >
                            {key.usage.requestsToday.toLocaleString()}
                          </span>
                          <span className="text-gray-400">/ {key.rateLimit.requestsPerDay.toLocaleString()}</span>
                        </div>
                        <Progress
                          value={getUsagePercentage(key.usage.requestsToday, key.rateLimit.requestsPerDay)}
                          className="h-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.slice(0, 2).map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {key.permissions.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{key.permissions.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {key.usage.lastUsed ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(key.usage.lastUsed)}
                        </div>
                      ) : (
                        "Never"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.keyId)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeAPIKey(key.keyId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      {apiKeys.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#30D5C8]">
                  {apiKeys.reduce((sum, key) => sum + key.usage.totalRequests, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#30D5C8]">
                  {apiKeys.reduce((sum, key) => sum + key.usage.requestsToday, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Requests Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#30D5C8]">{apiKeys.filter((key) => key.isActive).length}</div>
                <div className="text-sm text-gray-400">Active Keys</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Export both named and default
export { ApiAccess as APIAccess }
export default ApiAccess
