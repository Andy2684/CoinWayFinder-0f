"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  Key,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Edit,
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
} from "lucide-react"

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed: string
  created: string
  status: "active" | "inactive" | "expired"
  exchange?: string
}

export function ApiKeyManagement() {
  const { toast } = useToast()
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [isCreating, setIsCreating] = useState(false)
  const [newKeyData, setNewKeyData] = useState({
    name: "",
    permissions: [] as string[],
  })

  const [apiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Trading Bot API",
      key: "sk_live_51H7qYKJ2eZvKYlo2C8...",
      permissions: ["read", "trade"],
      lastUsed: "2 hours ago",
      created: "2024-01-15",
      status: "active",
      exchange: "Binance",
    },
    {
      id: "2",
      name: "Portfolio Tracker",
      key: "sk_live_51H7qYKJ2eZvKYlo2C9...",
      permissions: ["read"],
      lastUsed: "1 day ago",
      created: "2024-01-10",
      status: "active",
    },
    {
      id: "3",
      name: "Analytics Dashboard",
      key: "sk_live_51H7qYKJ2eZvKYlo2D0...",
      permissions: ["read", "analytics"],
      lastUsed: "Never",
      created: "2024-01-05",
      status: "inactive",
    },
  ])

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to your clipboard.",
    })
  }

  const handleCreateKey = async () => {
    if (!newKeyData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated successfully.",
      })
      setNewKeyData({ name: "", permissions: [] })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    toast({
      title: "API Key Deleted",
      description: "The API key has been permanently deleted.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-600/20 text-green-400"
      case "inactive":
        return "bg-gray-600/20 text-gray-400"
      case "expired":
        return "bg-red-600/20 text-red-400"
      default:
        return "bg-gray-600/20 text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "inactive":
        return <Activity className="h-4 w-4" />
      case "expired":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Create New API Key */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New API Key
          </CardTitle>
          <CardDescription className="text-gray-400">
            Generate a new API key for accessing your account programmatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyName" className="text-white">
              API Key Name
            </Label>
            <Input
              id="keyName"
              placeholder="e.g., Trading Bot, Portfolio Tracker"
              value={newKeyData.name}
              onChange={(e) => setNewKeyData((prev) => ({ ...prev, name: e.target.value }))}
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-white">Permissions</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: "read", label: "Read", description: "View account data" },
                { id: "trade", label: "Trade", description: "Execute trades" },
                { id: "withdraw", label: "Withdraw", description: "Withdraw funds" },
                { id: "analytics", label: "Analytics", description: "Access analytics" },
              ].map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Switch
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
                  <div>
                    <Label htmlFor={permission.id} className="text-white text-sm">
                      {permission.label}
                    </Label>
                    <p className="text-xs text-gray-400">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCreateKey}
            disabled={isCreating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Key className="h-4 w-4 mr-2" />
            {isCreating ? "Creating..." : "Create API Key"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing API Keys */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Key className="h-5 w-5" />
            Your API Keys
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage your existing API keys and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-medium">{apiKey.name}</h3>
                    <Badge variant="secondary" className={getStatusColor(apiKey.status)}>
                      {getStatusIcon(apiKey.status)}
                      <span className="ml-1 capitalize">{apiKey.status}</span>
                    </Badge>
                    {apiKey.exchange && (
                      <Badge variant="outline" className="border-slate-600 text-gray-300">
                        {apiKey.exchange}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created {apiKey.created}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      <span>Last used {apiKey.lastUsed}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className="border-red-600 text-red-400 hover:bg-red-600/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-white text-sm">API Key</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 p-2 bg-slate-800/50 rounded border border-slate-600">
                      <code className="text-sm text-gray-300 font-mono">
                        {showKeys[apiKey.id] ? apiKey.key : "•".repeat(32)}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="border-slate-600 text-white hover:bg-slate-700"
                    >
                      {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(apiKey.key)}
                      className="border-slate-600 text-white hover:bg-slate-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-white text-sm">Permissions</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary" className="bg-blue-600/20 text-blue-400 capitalize">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 border-l-4 border-l-yellow-500">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-yellow-400" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-gray-300 space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Never share your API keys with anyone or store them in public repositories</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Use separate API keys for different applications and services</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Regularly rotate your API keys and revoke unused ones</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Grant only the minimum permissions required for each use case</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Monitor API key usage and set up alerts for suspicious activity</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
