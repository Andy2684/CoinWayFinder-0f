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
import { Copy, Eye, EyeOff, Key, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string
  permissions: string[]
  isActive: boolean
}

interface UsageStats {
  current: number
  limit: number
  resetDate: string
}

export function ApiAccess() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats>({
    current: 847,
    limit: 1000,
    resetDate: "2024-01-15",
  })
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["read"])
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const permissions = [
    { id: "read", label: "Read Access", description: "View data and statistics" },
    { id: "write", label: "Write Access", description: "Create and modify bots" },
    { id: "delete", label: "Delete Access", description: "Delete bots and data" },
    { id: "admin", label: "Admin Access", description: "Full administrative access" },
  ]

  useEffect(() => {
    // Load existing API keys
    const mockKeys: ApiKey[] = [
      {
        id: "1",
        name: "Production Bot",
        key: "cwf_live_1234567890abcdef",
        createdAt: "2024-01-01",
        lastUsed: "2024-01-10",
        permissions: ["read", "write"],
        isActive: true,
      },
      {
        id: "2",
        name: "Development Testing",
        key: "cwf_test_abcdef1234567890",
        createdAt: "2024-01-05",
        lastUsed: "2024-01-09",
        permissions: ["read"],
        isActive: true,
      },
    ]
    setApiKeys(mockKeys)
  }, [])

  const generateApiKey = () => {
    const prefix = "cwf_live_"
    const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    return prefix + randomString
  }

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for your API key")
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: generateApiKey(),
        createdAt: new Date().toISOString().split("T")[0],
        permissions: selectedPermissions,
        isActive: true,
      }

      setApiKeys((prev) => [...prev, newKey])
      setNewKeyName("")
      setSelectedPermissions(["read"])
      setIsCreateDialogOpen(false)
      toast.success("API key created successfully!")
    } catch (error) {
      toast.error("Failed to create API key")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      setApiKeys((prev) => prev.filter((key) => key.id !== keyId))
      toast.success("API key deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete API key")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
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
    const prefix = key.split("_").slice(0, 2).join("_") + "_"
    const suffix = key.slice(-4)
    return prefix + "••••••••••••" + suffix
  }

  const usagePercentage = (usageStats.current / usageStats.limit) * 100

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Usage Overview
          </CardTitle>
          <CardDescription>Monitor your API usage and manage access keys</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Current Usage</p>
              <p className="text-2xl font-bold">{usageStats.current.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">of {usageStats.limit.toLocaleString()} requests</p>
              <p className="text-sm text-muted-foreground">Resets on {usageStats.resetDate}</p>
            </div>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          {usagePercentage > 80 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>You're approaching your API limit. Consider upgrading your plan.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for accessing CoinWayFinder services</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                    Create a new API key with specific permissions for your application.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyName">Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Production Bot, Development Testing"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <div className="space-y-2 mt-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPermissions((prev) => [...prev, permission.id])
                              } else {
                                setSelectedPermissions((prev) => prev.filter((p) => p !== permission.id))
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <Label htmlFor={permission.id} className="font-medium">
                              {permission.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateApiKey} disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Key"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No API Keys</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first API key to start using the CoinWayFinder API.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </div>
            ) : (
              apiKeys.map((apiKey) => (
                <Card key={apiKey.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                          {apiKey.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-sm">
                        <span>{visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}</span>
                        <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                          {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created: {apiKey.createdAt}</span>
                        {apiKey.lastUsed && <span>Last used: {apiKey.lastUsed}</span>}
                      </div>
                      <div className="flex gap-1">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteApiKey(apiKey.id)}
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

      {/* API Documentation Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Essential resources for API integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start bg-transparent">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">API Documentation</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">Complete API reference with examples</p>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start bg-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Authentication Guide</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">Learn how to authenticate your requests</p>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start bg-transparent">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Rate Limits</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">Understand API rate limits and best practices</p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ApiAccess
