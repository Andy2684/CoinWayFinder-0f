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
import { AlertTriangle, Eye, EyeOff, Plus, Trash2, Edit } from "lucide-react"
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
    supportedPermissions: ["read", "spot", "futures", "margin"],
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
    supportedPermissions: ["read", "spot", "futures"],
  },
  {
    id: "okx",
    name: "OKX",
    logo: "⚫",
    requiresPassphrase: true,
    supportedPermissions: ["read", "spot", "futures", "margin"],
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
    secretKey: "***hidden***",
    permissions: ["read", "spot", "futures"],
    isTestnet: false,
    status: "active",
    createdAt: "2024-01-15",
    lastUsed: "2024-01-20",
  },
  {
    id: "2",
    exchange: "coinbase",
    name: "Coinbase Trading",
    apiKey: "def456...uvw012",
    secretKey: "***hidden***",
    passphrase: "***hidden***",
    permissions: ["read", "spot"],
    isTestnet: true,
    status: "active",
    createdAt: "2024-01-10",
    lastUsed: "2024-01-19",
  },
]

function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState("binance")
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
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
      name: formData.name,
      apiKey: formData.apiKey,
      secretKey: formData.secretKey,
      passphrase: exchange.requiresPassphrase ? formData.passphrase : undefined,
      permissions: formData.permissions,
      isTestnet: formData.isTestnet,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setApiKeys([...apiKeys, newApiKey])
    setIsAddDialogOpen(false)
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
        return "bg-green-500"
      case "inactive":
        return "bg-yellow-500"
      case "expired":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Key Manager</h2>
          <p className="text-muted-foreground">Manage your exchange API keys securely</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>Add API keys from supported exchanges to enable trading</DialogDescription>
            </DialogHeader>

            <Tabs value={selectedExchange} onValueChange={setSelectedExchange}>
              <TabsList className="grid grid-cols-3 lg:grid-cols-6">
                {exchanges.map((exchange) => (
                  <TabsTrigger key={exchange.id} value={exchange.id} className="text-xs">
                    <span className="mr-1">{exchange.logo}</span>
                    {exchange.name.split(" ")[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {exchanges.map((exchange) => (
                <TabsContent key={exchange.id} value={exchange.id} className="space-y-4">
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Never share your API keys. They will be encrypted and stored securely.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Key Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Main Trading Account"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        placeholder="Your API key"
                        value={formData.apiKey}
                        onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secretKey">Secret Key</Label>
                      <Input
                        id="secretKey"
                        type="password"
                        placeholder="Your secret key"
                        value={formData.secretKey}
                        onChange={(e) => setFormData((prev) => ({ ...prev, secretKey: e.target.value }))}
                      />
                    </div>
                    {exchange.requiresPassphrase && (
                      <div className="space-y-2">
                        <Label htmlFor="passphrase">Passphrase</Label>
                        <Input
                          id="passphrase"
                          type="password"
                          placeholder="Your passphrase"
                          value={formData.passphrase}
                          onChange={(e) => setFormData((prev) => ({ ...prev, passphrase: e.target.value }))}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {exchange.supportedPermissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission}
                            checked={formData.permissions.includes(permission)}
                            onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                          />
                          <Label htmlFor={permission} className="text-sm capitalize">
                            {permission === "read"
                              ? "Read Only"
                              : permission === "spot"
                                ? "Spot Trading"
                                : permission === "futures"
                                  ? "Futures Trading"
                                  : permission === "margin"
                                    ? "Margin Trading"
                                    : "Withdraw"}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.permissions.includes("withdraw") && (
                      <div className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <p className="text-xs text-red-800">
                          Withdraw permission allows the bot to withdraw funds. Use with extreme caution.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="testnet"
                      checked={formData.isTestnet}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isTestnet: checked }))}
                    />
                    <Label htmlFor="testnet">Use Testnet</Label>
                  </div>

                  <Button onClick={handleAddApiKey} className="w-full">
                    Add {exchange.name} API Key
                  </Button>
                </TabsContent>
              ))}
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {apiKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">No API Keys Added</h3>
              <p className="text-muted-foreground">Add your first API key to start trading with CoinWayFinder</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First API Key
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {apiKeys.map((apiKey) => {
            const exchange = getExchangeInfo(apiKey.exchange)
            return (
              <Card key={apiKey.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{exchange?.logo}</span>
                      <div>
                        <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                        <CardDescription>
                          {exchange?.name} • Created {apiKey.createdAt}
                          {apiKey.lastUsed && ` • Last used ${apiKey.lastUsed}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={apiKey.isTestnet ? "secondary" : "default"}>
                        {apiKey.isTestnet ? "Testnet" : "Mainnet"}
                      </Badge>
                      <Badge className={getStatusColor(apiKey.status)}>{apiKey.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">API Key</Label>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                            {showSecrets[apiKey.id] ? apiKey.apiKey : apiKey.apiKey.replace(/./g, "*")}
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => toggleSecretVisibility(apiKey.id)}>
                            {showSecrets[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Secret Key</Label>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                            {showSecrets[apiKey.id] ? apiKey.secretKey : "***hidden***"}
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => toggleSecretVisibility(apiKey.id)}>
                            {showSecrets[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {apiKey.passphrase && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Passphrase</Label>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                            {showSecrets[apiKey.id] ? apiKey.passphrase : "***hidden***"}
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => toggleSecretVisibility(apiKey.id)}>
                            {showSecrets[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-xs text-muted-foreground">Permissions</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission === "read"
                              ? "Read Only"
                              : permission === "spot"
                                ? "Spot Trading"
                                : permission === "futures"
                                  ? "Futures Trading"
                                  : permission === "margin"
                                    ? "Margin Trading"
                                    : "Withdraw"}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteApiKey(apiKey.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
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

export { ApiKeyManager }
export default ApiKeyManager
