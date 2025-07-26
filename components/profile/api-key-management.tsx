"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Key, Plus, Eye, EyeOff, Copy, Trash2, Shield, AlertTriangle, CheckCircle, Clock, Activity } from "lucide-react"

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  created: string
  lastUsed: string
  status: "active" | "inactive" | "expired"
  usage: number
}

export function ApiKeyManagement() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const [newKeyData, setNewKeyData] = useState({
    name: "",
    permissions: [] as string[],
    expiresIn: "never",
  })

  const [apiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Trading Bot API",
      key: "cwf_live_1234567890abcdef1234567890abcdef",
      permissions: ["read", "trade", "withdraw"],
      created: "2024-01-15",
      lastUsed: "2 hours ago",
      status: "active",
      usage: 1247,
    },
    {
      id: "2",
      name: "Portfolio Tracker",
      key: "cwf_live_abcdef1234567890abcdef1234567890",
      permissions: ["read"],
      created: "2024-01-10",
      lastUsed: "1 day ago",
      status: "active",
      usage: 89,
    },
    {
      id: "3",
      name: "Analytics Dashboard",
      key: "cwf_live_567890abcdef1234567890abcdef1234",
      permissions: ["read", "analytics"],
      created: "2024-01-05",
      lastUsed: "Never",
      status: "inactive",
      usage: 0,
    },
  ])

  const availablePermissions = [
    { id: "read", label: "Read", description: "View account information and balances" },
    { id: "trade", label: "Trade", description: "Execute trades and manage orders" },
    { id: "withdraw", label: "Withdraw", description: "Withdraw funds from account" },
    { id: "analytics", label: "Analytics", description: "Access advanced analytics data" },
    { id: "bots", label: "Bot Management", description: "Create and manage trading bots" },
    { id: "signals", label: "Signals", description: "Access and create trading signals" },
  ]

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    })
  }

  const handleCreateKey = async () => {
    if (!newKeyData.name || newKeyData.permissions.length === 0) {
      toast({
        title: "Error",
        description: "Please provide a name and select at least one permission.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "API Key Created",
        description: "Your new API key has been created successfully.",
      })

      setIsCreateDialogOpen(false)
      setNewKeyData({ name: "", permissions: [], expiresIn: "never" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteKey = (keyId: string) => {
    toast({
      title: "API Key Deleted",
      description: "The API key has been permanently deleted.",
    })
  }

  const handleToggleKeyStatus = (keyId: string) => {
    toast({
      title: "Status Updated",
      description: "API key status has been updated.",
    })
  }

  const maskApiKey = (key: string) => {
    return key.substring(0, 12) + "..." + key.substring(key.length - 8)
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">API Keys</h3>
          <p className="text-gray-400">Manage your API keys for external applications</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key with specific permissions for your application.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName" className="text-white">
                  API Key Name
                </Label>
                <Input
                  id="keyName"
                  value={newKeyData.name}
                  onChange={(e) => setNewKeyData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Trading Bot API"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-white">Permissions</Label>
                <div className="space-y-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={permission.id}
                        checked={newKeyData.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewKeyData((prev) => ({
                              ...prev,
                              permissions: [...prev.permissions, permission.id],
                            }))
                          } else {
                            setNewKeyData((prev) => ({
                              ...prev,
                              permissions: prev.permissions.filter((p) => p !== permission.id),
                            }))
                          }
                        }}
                      />
                      <div className="space-y-1">
                        <Label htmlFor={permission.id} className="text-white font-medium">
                          {permission.label}
                        </Label>
                        <p className="text-sm text-gray-400">{permission.description}</p>
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
              <Button onClick={handleCreateKey} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? "Creating..." : "Create API Key"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Notice */}
      <Card className="bg-yellow-500/10 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            <div>
              <h4 className="text-yellow-500 font-medium">Security Best Practices</h4>
              <ul className="text-sm text-yellow-200 mt-2 space-y-1">
                <li>• Never share your API keys with anyone</li>
                <li>• Use different keys for different applications</li>
                <li>• Regularly rotate your API keys</li>
                <li>• Only grant necessary permissions</li>
                <li>• Monitor API key usage regularly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-gray-400" />
                  <div>
                    <CardTitle className="text-white text-lg">{apiKey.name}</CardTitle>
                    <CardDescription>Created on {apiKey.created}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={apiKey.status === "active" ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {apiKey.status === "active" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {apiKey.status}
                  </Badge>
                  <Switch
                    checked={apiKey.status === "active"}
                    onCheckedChange={() => handleToggleKeyStatus(apiKey.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Key Display */}
              <div className="space-y-2">
                <Label className="text-white">API Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                    readOnly
                    className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                    {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-2">
                <Label className="text-white">Permissions</Label>
                <div className="flex flex-wrap gap-2">
                  {apiKey.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {availablePermissions.find((p) => p.id === permission)?.label || permission}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Activity className="h-4 w-4" />
                  <span>Usage: {apiKey.usage.toLocaleString()} calls</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Last used: {apiKey.lastUsed}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                <div className="text-sm text-gray-400">Key ID: {apiKey.id}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteKey(apiKey.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Guidelines */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            API Usage Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-white font-medium mb-2">Rate Limits</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• 1000 requests per minute</li>
                <li>• 10,000 requests per hour</li>
                <li>• 100,000 requests per day</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Documentation</h4>
              <ul className="text-gray-400 space-y-1">
                <li>
                  •{" "}
                  <a href="#" className="text-blue-400 hover:underline">
                    API Reference
                  </a>
                </li>
                <li>
                  •{" "}
                  <a href="#" className="text-blue-400 hover:underline">
                    Code Examples
                  </a>
                </li>
                <li>
                  •{" "}
                  <a href="#" className="text-blue-400 hover:underline">
                    SDKs & Libraries
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
