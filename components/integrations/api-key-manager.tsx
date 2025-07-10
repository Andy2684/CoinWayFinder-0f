"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Plus, Trash2, Edit, AlertTriangle, Key, Shield } from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
  id: string
  exchange: string
  name: string
  apiKey: string
  secretKey: string
  passphrase?: string
  permissions: string[]
  isTestnet: boolean
  status: "active" | "inactive" | "expired"
  createdAt: string
  lastUsed?: string
}

interface Exchange {
  id: string
  name: string
  logo: string
  requiresPassphrase: boolean
  supportedPermissions: string[]
}

const exchanges: Exchange[] = [
  {
    id: "binance",
    name: "Binance",
    logo: "🟡",
    requiresPassphrase: false,
    supportedPermissions: ["read", "spot", "futures", "margin", "withdraw"],
  },
  {
    id: "coinbase",
    name: "Coinbase Pro",
    logo: "🔵",
    requiresPassphrase: true,
    supportedPermissions: ["read", "spot", "withdraw"],
  },
  {
    id: "kraken",
    name: "Kraken",
    logo: "🟣",
    requiresPassphrase: false,
    supportedPermissions: ["read", "spot", "futures", "margin", "withdraw"],
  },
  {
    id: "bybit",
    name: "Bybit",
    logo: "🟠",
    requiresPassphrase: false,
    supportedPermissions: ["read", "spot", "futures", "withdraw"],
  },
  {
    id: "okx",
    name: "OKX",
    logo: "⚫",
    requiresPassphrase: true,
    supportedPermissions: ["read", "spot", "futures", "margin", "withdraw"],
  },
  {
    id: "kucoin",
    name: "KuCoin",
    logo: "🟢",
    requiresPassphrase: true,
    supportedPermissions: ["read", "spot", "futures", "margin", "withdraw"],
  },
]

const mockApiKeys: ApiKey[] = [
  {
    id: "1",
    exchange: "binance",
    name: "Binance Main",
    apiKey: "abc123...xyz789",
    secretKey: "secret123...secret789",
    permissions: ["read", "spot", "futures"],
    isTestnet: false,
    status: "active",
    createdAt: "2024-01-15T10:30:00Z",
    lastUsed: "2024-01-20T14:22:00Z",
  },
  {
    id: "2",
    exchange: "coinbase",
    name: "Coinbase Trading",
    apiKey: "def456...uvw012",
    secretKey: "secret456...secret012",
    passphrase: "mypassphrase123",
    permissions: ["read", "spot"],
    isTestnet: true,
    status: "active",
    createdAt: "2024-01-10T09:15:00Z",
    lastUsed: "2024-01-19T16:45:00Z",
  },
]

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState("binance")
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
    secretKey: "",
    passphrase: "",
    permissions: [] as string[],
    isTestnet: false,
  })

  const handleAddApiKey = () => {
    const exchange = exchanges.find((e) => e.id === selectedExchange)
    if (!exchange) return

    const newApiKey: ApiKey = {
      id: Date.now().toString(),
      exchange: selectedExchange,
      name: formData.name || `${exchange.name} API`,
      apiKey: formData.apiKey,
      secretKey: formData.secretKey,
      passphrase: exchange.requiresPassphrase ? formData.passphrase : undefined,
      permissions: formData.permissions,
      isTestnet: formData.isTestnet,
      status: "active",
      createdAt: new Date().toISOString(),
    }

    setApiKeys([...apiKeys, newApiKey])
    setIsDialogOpen(false)
    setFormData({
      name: "",
      apiKey: "",
      secretKey: "",
      passphrase: "",
      permissions: [],
      isTestnet: false,
    })
    toast.success("API key added successfully!")
  }

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id))
    toast.success("API key deleted successfully!")
  }

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, permission],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((p) => p !== permission),
      }))
    }
  }

  const getExchangeInfo = (exchangeId: string) => {
    return exchanges.find((e) => e.id === exchangeId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "inactive":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
      case "expired":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">API Key Management</h2>
          <p className="text-gray-400">Manage your exchange API keys securely</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">
              <Plus className="w-4 h-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Add New API Key</DialogTitle>
              <DialogDescription className="text-gray-400">
                Connect your exchange account by adding API credentials
              </DialogDescription>
            </DialogHeader>

            <Alert className="border-yellow-500/20 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300">
                Never share your API keys. We encrypt and store them securely. Avoid granting withdraw permissions
                unless absolutely necessary.
              </AlertDescription>
            </Alert>

            <Tabs value={selectedExchange} onValueChange={setSelectedExchange}>
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 bg-gray-800">
                {exchanges.map((exchange) => (
                  <TabsTrigger
                    key={exchange.id}
                    value={exchange.id}
                    className="data-[state=active]:bg-[#30D5C8] data-[state=active]:text-[#191A1E]"
                  >
                    <span className="mr-1">{exchange.logo}</span>
                    <span className="hidden sm:inline">{exchange.name}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {exchanges.map((exchange) => (
                <TabsContent key={exchange.id} value={exchange.id} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">
                        API Key Name
                      </Label>
                      <Input
                        id="name"
                        placeholder={`${exchange.name} Trading Account`}
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apiKey" className="text-white">
                        API Key *
                      </Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="Enter your API key"
                        value={formData.apiKey}
                        onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secretKey" className="text-white">
                        Secret Key *
                      </Label>
                      <Input
                        id="secretKey"
                        type="password"
                        placeholder="Enter your secret key"
                        value={formData.secretKey}
                        onChange={(e) => setFormData((prev) => ({ ...prev, secretKey: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        required
                      />
                    </div>

                    {exchange.requiresPassphrase && (
                      <div className="space-y-2">
                        <Label htmlFor="passphrase" className="text-white">
                          Passphrase *
                        </Label>
                        <Input
                          id="passphrase"
                          type="password"
                          placeholder="Enter your passphrase"
                          value={formData.passphrase}
                          onChange={(e) => setFormData((prev) => ({ ...prev, passphrase: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label className="text-white">Permissions</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {exchange.supportedPermissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission}
                              checked={formData.permissions.includes(permission)}
                              onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                              className="border-gray-600 data-[state=checked]:bg-[#30D5C8] data-[state=checked]:border-[#30D5C8]"
                            />
                            <Label htmlFor={permission} className="text-gray-300 capitalize">
                              {permission === "read" && "Read Only"}
                              {permission === "spot" && "Spot Trading"}
                              {permission === "futures" && "Futures Trading"}
                              {permission === "margin" && "Margin Trading"}
                              {permission === "withdraw" && "Withdraw (⚠️ High Risk)"}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="testnet"
                        checked={formData.isTestnet}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isTestnet: checked }))}
                      />
                      <Label htmlFor="testnet" className="text-gray-300">
                        Use Testnet (Recommended for testing)
                      </Label>
                    </div>

                    <Button
                      onClick={handleAddApiKey}
                      className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
                      disabled={
                        !formData.apiKey || !formData.secretKey || (exchange.requiresPassphrase && !formData.passphrase)
                      }
                    >
                      Add API Key
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {apiKeys.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No API Keys Added</h3>
            <p className="text-gray-400 text-center mb-6">Add your first API key to start trading with CoinWayfinder</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First API Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {apiKeys.map((apiKey) => {
            const exchange = getExchangeInfo(apiKey.exchange)
            return (
              <Card key={apiKey.id} className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{exchange?.logo}</span>
                    <div>
                      <CardTitle className="text-white text-lg">{apiKey.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {exchange?.name} • {apiKey.isTestnet ? "Testnet" : "Mainnet"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(apiKey.status)}>{apiKey.status}</Badge>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-400">API Key</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={showSecrets[apiKey.id] ? apiKey.apiKey : "••••••••••••••••"}
                          readOnly
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(apiKey.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {showSecrets[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-400">Secret Key</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={showSecrets[apiKey.id] ? apiKey.secretKey : "••••••••••••••••"}
                          readOnly
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(apiKey.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {showSecrets[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Permissions:</span>
                    </div>
                    {apiKey.permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="border-gray-600 text-gray-300">
                        {permission}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                    {apiKey.lastUsed && <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ApiKeyManager
