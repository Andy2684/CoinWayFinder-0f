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
import { AlertTriangle, Eye, EyeOff, Plus, Trash2, Edit, Key } from "lucide-react"
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

const exchanges = [
  { id: "binance", name: "Binance", logo: "🟡" },
  { id: "coinbase", name: "Coinbase Pro", logo: "🔵" },
  { id: "kraken", name: "Kraken", logo: "🟣" },
  { id: "bybit", name: "Bybit", logo: "🟠" },
  { id: "okx", name: "OKX", logo: "⚫" },
  { id: "kucoin", name: "KuCoin", logo: "🟢" },
]

const permissions = [
  { id: "read", label: "Read", description: "View account information" },
  { id: "spot", label: "Spot Trading", description: "Execute spot trades" },
  { id: "futures", label: "Futures Trading", description: "Execute futures trades" },
  { id: "margin", label: "Margin Trading", description: "Execute margin trades" },
  { id: "withdraw", label: "Withdraw", description: "Withdraw funds" },
]

const mockApiKeys: ApiKey[] = [
  {
    id: "1",
    exchange: "binance",
    name: "Binance Main",
    apiKey: "BNB_API_KEY_123456789",
    secretKey: "BNB_SECRET_KEY_987654321",
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
    apiKey: "CB_API_KEY_ABCDEF123",
    secretKey: "CB_SECRET_KEY_FEDCBA321",
    permissions: ["read", "spot"],
    isTestnet: false,
    status: "active",
    createdAt: "2024-01-10",
    lastUsed: "2024-01-19",
  },
]

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState("binance")
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
    secretKey: "",
    passphrase: "",
    permissions: [] as string[],
    isTestnet: false,
  })

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const handleAddApiKey = () => {
    if (!formData.name || !formData.apiKey || !formData.secretKey) {
      toast.error("Please fill in all required fields")
      return
    }

    const newApiKey: ApiKey = {
      id: Date.now().toString(),
      exchange: selectedExchange,
      name: formData.name,
      apiKey: formData.apiKey,
      secretKey: formData.secretKey,
      passphrase: formData.passphrase,
      permissions: formData.permissions,
      isTestnet: formData.isTestnet,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setApiKeys((prev) => [...prev, newApiKey])
    setFormData({
      name: "",
      apiKey: "",
      secretKey: "",
      passphrase: "",
      permissions: [],
      isTestnet: false,
    })
    setIsAddDialogOpen(false)
    toast.success("API key added successfully")
  }

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== keyId))
    toast.success("API key deleted successfully")
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked ? [...prev.permissions, permissionId] : prev.permissions.filter((p) => p !== permissionId),
    }))
  }

  const getExchangeInfo = (exchangeId: string) => {
    return exchanges.find((ex) => ex.id === exchangeId) || exchanges[0]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">API Key Management</h2>
          <p className="text-muted-foreground">Manage your exchange API keys for automated trading</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>Add API credentials for your exchange account</DialogDescription>
            </DialogHeader>

            <Tabs value={selectedExchange} onValueChange={setSelectedExchange}>
              <TabsList className="grid w-full grid-cols-3">
                {exchanges.slice(0, 6).map((exchange) => (
                  <TabsTrigger key={exchange.id} value={exchange.id} className="text-xs">
                    {exchange.logo} {exchange.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {exchanges.map((exchange) => (
                <TabsContent key={exchange.id} value={exchange.id} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Key Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Main Trading Account"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="testnet"
                        checked={formData.isTestnet}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isTestnet: checked }))}
                      />
                      <Label htmlFor="testnet">Testnet</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      placeholder="Enter your API key"
                      value={formData.apiKey}
                      onChange={(e) => setFormData((prev) => ({ ...prev, apiKey: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="secretKey">Secret Key</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      placeholder="Enter your secret key"
                      value={formData.secretKey}
                      onChange={(e) => setFormData((prev) => ({ ...prev, secretKey: e.target.value }))}
                    />
                  </div>

                  {(exchange.id === "okx" || exchange.id === "kucoin") && (
                    <div>
                      <Label htmlFor="passphrase">Passphrase</Label>
                      <Input
                        id="passphrase"
                        type="password"
                        placeholder="Enter your passphrase"
                        value={formData.passphrase}
                        onChange={(e) => setFormData((prev) => ({ ...prev, passphrase: e.target.value }))}
                      />
                    </div>
                  )}

                  <div>
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={formData.permissions.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                          />
                          <Label htmlFor={permission.id} className="text-sm">
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Security Notice</p>
                      <p>Your API keys are encrypted and stored securely. Never share your secret keys with anyone.</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddApiKey}>Add API Key</Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {apiKeys.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
            <p className="text-muted-foreground text-center mb-4">Add your first API key to start automated trading</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {apiKeys.map((apiKey) => {
            const exchange = getExchangeInfo(apiKey.exchange)
            const isSecretVisible = showSecrets[apiKey.id]

            return (
              <Card key={apiKey.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{exchange.logo}</div>
                      <div>
                        <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                        <CardDescription>
                          {exchange.name} • Created {apiKey.createdAt}
                          {apiKey.lastUsed && ` • Last used ${apiKey.lastUsed}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(apiKey.status)}>{apiKey.status}</Badge>
                      {apiKey.isTestnet && <Badge variant="outline">Testnet</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">API Key</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input value={apiKey.apiKey} readOnly className="font-mono text-sm" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Secret Key</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type={isSecretVisible ? "text" : "password"}
                          value={apiKey.secretKey}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" size="sm" onClick={() => toggleSecretVisibility(apiKey.id)}>
                          {isSecretVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {apiKey.passphrase && (
                    <div>
                      <Label className="text-sm font-medium">Passphrase</Label>
                      <Input type="password" value={apiKey.passphrase} readOnly className="font-mono text-sm mt-1" />
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Permissions</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {apiKey.permissions.map((permissionId) => {
                        const permission = permissions.find((p) => p.id === permissionId)
                        return (
                          <Badge key={permissionId} variant="secondary">
                            {permission?.label}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
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
