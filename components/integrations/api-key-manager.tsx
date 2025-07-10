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
import { toast } from "sonner"
import { Plus, Eye, EyeOff, Edit, Trash2, Shield, AlertTriangle } from "lucide-react"

interface ApiKey {
  id: string
  exchange: string
  name: string
  apiKey: string
  secretKey: string
  passphrase?: string
  permissions: string[]
  testnet: boolean
  status: "active" | "inactive" | "expired"
  createdAt: string
  lastUsed?: string
}

interface Exchange {
  id: string
  name: string
  logo: string
  requiresPassphrase: boolean
}

const exchanges: Exchange[] = [
  { id: "binance", name: "Binance", logo: "🟡", requiresPassphrase: false },
  { id: "coinbase", name: "Coinbase Pro", logo: "🔵", requiresPassphrase: true },
  { id: "kraken", name: "Kraken", logo: "🟣", requiresPassphrase: false },
  { id: "bybit", name: "Bybit", logo: "🟠", requiresPassphrase: false },
  { id: "okx", name: "OKX", logo: "⚫", requiresPassphrase: true },
  { id: "kucoin", name: "KuCoin", logo: "🟢", requiresPassphrase: true },
]

const permissions = [
  { id: "read", label: "Read", description: "View account information and balances" },
  { id: "spot", label: "Spot Trading", description: "Execute spot trades" },
  { id: "futures", label: "Futures Trading", description: "Execute futures trades" },
  { id: "margin", label: "Margin Trading", description: "Execute margin trades" },
  { id: "withdraw", label: "Withdraw", description: "Withdraw funds (high risk)" },
]

const mockApiKeys: ApiKey[] = [
  {
    id: "1",
    exchange: "binance",
    name: "Binance Main",
    apiKey: "BNB_API_KEY_123456789",
    secretKey: "BNB_SECRET_KEY_987654321",
    permissions: ["read", "spot", "futures"],
    testnet: false,
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
    passphrase: "CB_PASSPHRASE_XYZ",
    permissions: ["read", "spot"],
    testnet: true,
    status: "active",
    createdAt: "2024-01-10",
    lastUsed: "2024-01-19",
  },
]

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState("binance")
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
    secretKey: "",
    passphrase: "",
    permissions: [] as string[],
    testnet: false,
  })

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const handleAddApiKey = () => {
    const exchange = exchanges.find((e) => e.id === selectedExchange)
    if (!exchange) return

    const newApiKey: ApiKey = {
      id: Date.now().toString(),
      exchange: selectedExchange,
      name: formData.name,
      apiKey: formData.apiKey,
      secretKey: formData.secretKey,
      passphrase: formData.passphrase,
      permissions: formData.permissions,
      testnet: formData.testnet,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setApiKeys((prev) => [...prev, newApiKey])
    setIsAddDialogOpen(false)
    setFormData({
      name: "",
      apiKey: "",
      secretKey: "",
      passphrase: "",
      permissions: [],
      testnet: false,
    })
    toast.success(`API key added for ${exchange.name}`)
  }

  const handleDeleteApiKey = (id: string) => {
    const apiKey = apiKeys.find((key) => key.id === id)
    if (!apiKey) return

    setApiKeys((prev) => prev.filter((key) => key.id !== id))
    const exchange = exchanges.find((e) => e.id === apiKey.exchange)
    toast.success(`API key deleted for ${exchange?.name}`)
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked ? [...prev.permissions, permission] : prev.permissions.filter((p) => p !== permission),
    }))
  }

  const getExchangeInfo = (exchangeId: string) => {
    return exchanges.find((e) => e.id === exchangeId)
  }

  const maskSecret = (secret: string) => {
    if (secret.length <= 8) return "*".repeat(secret.length)
    return secret.substring(0, 4) + "*".repeat(secret.length - 8) + secret.substring(secret.length - 4)
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

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your API keys are encrypted and stored securely. Never share your secret keys.
              </AlertDescription>
            </Alert>

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
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="name">API Key Name</Label>
                      <Input
                        id="name"
                        placeholder={`${exchange.name} Trading`}
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      />
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

                    {exchange.requiresPassphrase && (
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

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="testnet"
                        checked={formData.testnet}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, testnet: checked }))}
                      />
                      <Label htmlFor="testnet">Use Testnet</Label>
                    </div>

                    <div>
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissions.includes(permission.id)}
                              onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label htmlFor={permission.id} className="text-sm font-medium">
                                {permission.label}
                              </Label>
                              <p className="text-xs text-muted-foreground">{permission.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {formData.permissions.includes("withdraw") && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Withdraw permission is high risk. Only enable if absolutely necessary.
                        </AlertDescription>
                      </Alert>
                    )}
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
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No API Keys Added</h3>
            <p className="text-muted-foreground text-center mb-4">Add your first API key to start automated trading</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First API Key
            </Button>
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
                        <CardDescription>{exchange?.name}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={apiKey.status === "active" ? "default" : "secondary"}>{apiKey.status}</Badge>
                      {apiKey.testnet && <Badge variant="outline">Testnet</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-sm font-medium">API Key</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={showSecrets[apiKey.id] ? apiKey.apiKey : maskSecret(apiKey.apiKey)}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" size="sm" onClick={() => toggleSecretVisibility(apiKey.id)}>
                          {showSecrets[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Secret Key</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={showSecrets[apiKey.id] ? apiKey.secretKey : maskSecret(apiKey.secretKey)}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" size="sm" onClick={() => toggleSecretVisibility(apiKey.id)}>
                          {showSecrets[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {apiKey.passphrase && (
                      <div>
                        <Label className="text-sm font-medium">Passphrase</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={showSecrets[apiKey.id] ? apiKey.passphrase : maskSecret(apiKey.passphrase)}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button variant="outline" size="sm" onClick={() => toggleSecretVisibility(apiKey.id)}>
                            {showSecrets[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-sm font-medium">Permissions</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permissions.find((p) => p.id === permission)?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Created: {apiKey.createdAt}</span>
                      {apiKey.lastUsed && <span>Last used: {apiKey.lastUsed}</span>}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteApiKey(apiKey.id)}>
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
