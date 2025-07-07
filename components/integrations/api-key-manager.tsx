"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Key, Eye, EyeOff, Copy, Edit, Trash2, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"

interface APIKey {
  id: string
  exchange: string
  name: string
  keyId: string
  permissions: string[]
  status: "active" | "inactive" | "expired" | "error"
  createdAt: string
  lastUsed: string
  ipWhitelist: string[]
  testnet: boolean
  encrypted: boolean
}

export function APIKeyManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "1",
      exchange: "binance",
      name: "Main Trading Account",
      keyId: "abc123***",
      permissions: ["spot", "futures", "read"],
      status: "active",
      createdAt: "2024-01-01",
      lastUsed: "2 hours ago",
      ipWhitelist: ["192.168.1.1", "10.0.0.1"],
      testnet: false,
      encrypted: true,
    },
    {
      id: "2",
      exchange: "coinbase",
      name: "Portfolio Bot",
      keyId: "def456***",
      permissions: ["trade", "view"],
      status: "active",
      createdAt: "2024-01-05",
      lastUsed: "15 minutes ago",
      ipWhitelist: [],
      testnet: false,
      encrypted: true,
    },
    {
      id: "3",
      exchange: "bybit",
      name: "Test Environment",
      keyId: "ghi789***",
      permissions: ["spot", "read"],
      status: "inactive",
      createdAt: "2024-01-10",
      lastUsed: "1 day ago",
      ipWhitelist: [],
      testnet: true,
      encrypted: true,
    },
  ])

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  const [newKey, setNewKey] = useState({
    exchange: "",
    name: "",
    apiKey: "",
    secretKey: "",
    passphrase: "",
    permissions: [] as string[],
    testnet: false,
    ipWhitelist: "",
  })

  const exchanges = [
    { id: "binance", name: "Binance", requiresPassphrase: false },
    { id: "binance-us", name: "Binance.US", requiresPassphrase: false },
    { id: "coinbase", name: "Coinbase Pro", requiresPassphrase: true },
    { id: "kraken", name: "Kraken", requiresPassphrase: false },
    { id: "bybit", name: "Bybit", requiresPassphrase: false },
    { id: "okx", name: "OKX", requiresPassphrase: true },
    { id: "kucoin", name: "KuCoin", requiresPassphrase: true },
    { id: "huobi", name: "Huobi", requiresPassphrase: false },
  ]

  const permissionOptions = [
    { id: "read", name: "Read Only", description: "View account info and balances" },
    { id: "spot", name: "Spot Trading", description: "Execute spot trades" },
    { id: "futures", name: "Futures Trading", description: "Execute futures trades" },
    { id: "margin", name: "Margin Trading", description: "Execute margin trades" },
    { id: "withdraw", name: "Withdrawals", description: "Withdraw funds (NOT recommended)" },
    { id: "transfer", name: "Internal Transfer", description: "Transfer between accounts" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400"
      case "inactive":
        return "bg-gray-500/10 text-gray-400"
      case "expired":
        return "bg-yellow-500/10 text-yellow-400"
      case "error":
        return "bg-red-500/10 text-red-400"
      default:
        return "bg-gray-500/10 text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "inactive":
        return <Clock className="w-4 h-4 text-gray-400" />
      case "expired":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const handleAddKey = () => {
    const key: APIKey = {
      id: Date.now().toString(),
      exchange: newKey.exchange,
      name: newKey.name,
      keyId: newKey.apiKey.substring(0, 6) + "***",
      permissions: newKey.permissions,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      ipWhitelist: newKey.ipWhitelist ? newKey.ipWhitelist.split(",").map((ip) => ip.trim()) : [],
      testnet: newKey.testnet,
      encrypted: true,
    }

    setApiKeys([...apiKeys, key])
    setShowAddDialog(false)
    setNewKey({
      exchange: "",
      name: "",
      apiKey: "",
      secretKey: "",
      passphrase: "",
      permissions: [],
      testnet: false,
      ipWhitelist: "",
    })
  }

  const deleteKey = (keyId: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== keyId))
  }

  const toggleKeyStatus = (keyId: string) => {
    setApiKeys(
      apiKeys.map((key) =>
        key.id === keyId ? { ...key, status: key.status === "active" ? "inactive" : "active" } : key,
      ),
    )
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">🔑 API Key Management</h2>
          <p className="text-gray-300">Securely manage your exchange API keys</p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                <Key className="w-5 h-5 mr-2 text-[#30D5C8]" />
                Add New API Key
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Connect your exchange account securely with API credentials
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="basic" className="text-gray-300 data-[state=active]:text-white">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="credentials" className="text-gray-300 data-[state=active]:text-white">
                  Credentials
                </TabsTrigger>
                <TabsTrigger value="security" className="text-gray-300 data-[state=active]:text-white">
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exchange" className="text-white">
                      Exchange
                    </Label>
                    <Select
                      value={newKey.exchange}
                      onValueChange={(value) => setNewKey({ ...newKey, exchange: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select exchange" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        {exchanges.map((exchange) => (
                          <SelectItem key={exchange.id} value={exchange.id}>
                            {exchange.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-white">
                      Key Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="My Trading Bot"
                      value={newKey.name}
                      onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-3 block">Permissions</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {permissionOptions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
                        <Switch
                          checked={newKey.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewKey({ ...newKey, permissions: [...newKey.permissions, permission.id] })
                            } else {
                              setNewKey({
                                ...newKey,
                                permissions: newKey.permissions.filter((p) => p !== permission.id),
                              })
                            }
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-white">{permission.name}</p>
                          <p className="text-xs text-gray-400">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newKey.testnet}
                      onCheckedChange={(checked) => setNewKey({ ...newKey, testnet: checked })}
                    />
                    <Label className="text-white">Testnet Environment</Label>
                  </div>
                  <Badge variant="outline" className="border-yellow-500/20 text-yellow-400">
                    Recommended for testing
                  </Badge>
                </div>
              </TabsContent>

              <TabsContent value="credentials" className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    <h3 className="text-red-400 font-semibold">Security Warning</h3>
                  </div>
                  <p className="text-red-300 text-sm">
                    Never share your API credentials. We encrypt and store them securely, but you should only grant
                    minimum required permissions.
                  </p>
                </div>

                <div>
                  <Label htmlFor="apiKey" className="text-white">
                    API Key
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Enter your API key"
                    value={newKey.apiKey}
                    onChange={(e) => setNewKey({ ...newKey, apiKey: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="secretKey" className="text-white">
                    Secret Key
                  </Label>
                  <Input
                    id="secretKey"
                    type="password"
                    placeholder="Enter your secret key"
                    value={newKey.secretKey}
                    onChange={(e) => setNewKey({ ...newKey, secretKey: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {exchanges.find((e) => e.id === newKey.exchange)?.requiresPassphrase && (
                  <div>
                    <Label htmlFor="passphrase" className="text-white">
                      Passphrase
                    </Label>
                    <Input
                      id="passphrase"
                      type="password"
                      placeholder="Enter your passphrase"
                      value={newKey.passphrase}
                      onChange={(e) => setNewKey({ ...newKey, passphrase: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <div>
                  <Label htmlFor="ipWhitelist" className="text-white">
                    IP Whitelist (Optional)
                  </Label>
                  <Textarea
                    id="ipWhitelist"
                    placeholder="192.168.1.1, 10.0.0.1 (comma separated)"
                    value={newKey.ipWhitelist}
                    onChange={(e) => setNewKey({ ...newKey, ipWhitelist: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Restrict API access to specific IP addresses for enhanced security
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-white font-semibold">Security Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">End-to-end encryption</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">Secure key storage</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">Activity monitoring</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-300">Automatic key rotation</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between pt-6 border-t border-gray-800">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddKey}
                disabled={!newKey.exchange || !newKey.name || !newKey.apiKey || !newKey.secretKey}
                className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold"
              >
                Add API Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((key) => (
          <Card key={key.id} className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#30D5C8]/10 rounded-lg flex items-center justify-center">
                    <Key className="w-6 h-6 text-[#30D5C8]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{key.name}</h3>
                    <p className="text-gray-400 text-sm capitalize">{key.exchange} Exchange</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(key.status)}>
                    {getStatusIcon(key.status)}
                    <span className="ml-1">{key.status}</span>
                  </Badge>
                  {key.testnet && (
                    <Badge variant="outline" className="border-yellow-500/20 text-yellow-400">
                      Testnet
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Key Information */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">API Key ID</p>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm text-white bg-gray-800 px-2 py-1 rounded">
                        {showSecrets[key.id] ? key.keyId.replace("***", "abc123def456") : key.keyId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleSecretVisibility(key.id)}
                      >
                        {showSecrets[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-1">Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {key.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Usage Information */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Created</p>
                    <p className="text-sm text-white">{key.createdAt}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 mb-1">Last Used</p>
                    <p className="text-sm text-white">{key.lastUsed}</p>
                  </div>

                  {key.ipWhitelist.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">IP Whitelist</p>
                      <div className="space-y-1">
                        {key.ipWhitelist.map((ip, index) => (
                          <code key={index} className="text-xs text-white bg-gray-800 px-2 py-1 rounded block">
                            {ip}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Active</span>
                    <Switch checked={key.status === "active"} onCheckedChange={() => toggleKeyStatus(key.id)} />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-white hover:bg-gray-800 bg-transparent"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-400 hover:bg-red-900/20 bg-transparent"
                    onClick={() => deleteKey(key.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {apiKeys.length === 0 && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No API Keys Added</h3>
              <p className="text-gray-400 mb-6">Add your first API key to start automated trading</p>
              <Button
                className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-semibold"
                onClick={() => setShowAddDialog(true)}
              >
                Add Your First API Key
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
