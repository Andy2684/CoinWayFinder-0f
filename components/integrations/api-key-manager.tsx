"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Key,
  Globe,
  Settings,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
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
  ipWhitelist: string[]
  status: "active" | "inactive" | "error"
  lastUsed?: Date
  createdAt: Date
}

interface Exchange {
  id: string
  name: string
  logo: string
  supportedFeatures: string[]
  requiresPassphrase: boolean
  testnetAvailable: boolean
}

const exchanges: Exchange[] = [
  {
    id: "binance",
    name: "Binance",
    logo: "🟡",
    supportedFeatures: ["spot", "futures", "margin"],
    requiresPassphrase: false,
    testnetAvailable: true,
  },
  {
    id: "coinbase",
    name: "Coinbase Pro",
    logo: "🔵",
    supportedFeatures: ["spot"],
    requiresPassphrase: true,
    testnetAvailable: true,
  },
  {
    id: "kraken",
    name: "Kraken",
    logo: "🟣",
    supportedFeatures: ["spot", "futures"],
    requiresPassphrase: false,
    testnetAvailable: false,
  },
  {
    id: "bybit",
    name: "Bybit",
    logo: "🟠",
    supportedFeatures: ["spot", "futures"],
    requiresPassphrase: false,
    testnetAvailable: true,
  },
  {
    id: "okx",
    name: "OKX",
    logo: "⚫",
    supportedFeatures: ["spot", "futures", "options"],
    requiresPassphrase: true,
    testnetAvailable: true,
  },
  {
    id: "kucoin",
    name: "KuCoin",
    logo: "🟢",
    supportedFeatures: ["spot", "futures"],
    requiresPassphrase: true,
    testnetAvailable: true,
  },
]

export function ApiKeyManager() {
  const { user, hasPermission } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    apiKey: "",
    secretKey: "",
    passphrase: "",
    permissions: [] as string[],
    isTestnet: false,
    ipWhitelist: "",
  })

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    // Mock data - replace with actual API call
    const mockApiKeys: ApiKey[] = [
      {
        id: "1",
        exchange: "binance",
        name: "Main Trading Account",
        apiKey: "abc123***",
        secretKey: "***hidden***",
        permissions: ["spot", "futures"],
        isTestnet: false,
        ipWhitelist: ["192.168.1.1"],
        status: "active",
        lastUsed: new Date(),
        createdAt: new Date("2024-01-01"),
      },
    ]
    setApiKeys(mockApiKeys)
  }

  const handleAddApiKey = async () => {
    if (!selectedExchange) return

    setIsLoading(true)
    try {
      // Validate form
      if (!formData.name || !formData.apiKey || !formData.secretKey) {
        toast.error("Please fill in all required fields")
        return
      }

      if (selectedExchange.requiresPassphrase && !formData.passphrase) {
        toast.error("Passphrase is required for this exchange")
        return
      }

      // Test connection
      const testResult = await testConnection()
      if (!testResult.success) {
        toast.error(`Connection test failed: ${testResult.error}`)
        return
      }

      // Create new API key
      const newApiKey: ApiKey = {
        id: Date.now().toString(),
        exchange: selectedExchange.id,
        name: formData.name,
        apiKey: formData.apiKey,
        secretKey: formData.secretKey,
        passphrase: formData.passphrase || undefined,
        permissions: formData.permissions,
        isTestnet: formData.isTestnet,
        ipWhitelist: formData.ipWhitelist
          .split(",")
          .map((ip) => ip.trim())
          .filter(Boolean),
        status: "active",
        createdAt: new Date(),
      }

      setApiKeys([...apiKeys, newApiKey])
      setIsAddDialogOpen(false)
      resetForm()
      toast.success("API key added successfully!")
    } catch (error) {
      toast.error("Failed to add API key")
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    // Mock connection test
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 1000)
    })
  }

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id))
    toast.success("API key deleted successfully")
  }

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      apiKey: "",
      secretKey: "",
      passphrase: "",
      permissions: [],
      isTestnet: false,
      ipWhitelist: "",
    })
    setSelectedExchange(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />
      case "inactive":
        return <XCircle className="h-4 w-4" />
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  if (!hasPermission("allExchanges")) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You need premium access to manage exchange API keys. Please upgrade your plan.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Key Management</h2>
          <p className="text-gray-600">Securely manage your exchange API keys</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>Connect your exchange account to start trading</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="exchange" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="exchange">Exchange</TabsTrigger>
                <TabsTrigger value="credentials">Credentials</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="exchange" className="space-y-4">
                <div>
                  <Label>Select Exchange</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {exchanges.map((exchange) => (
                      <Card
                        key={exchange.id}
                        className={`cursor-pointer transition-colors ${
                          selectedExchange?.id === exchange.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedExchange(exchange)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{exchange.logo}</span>
                            <div>
                              <h3 className="font-medium">{exchange.name}</h3>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {exchange.supportedFeatures.map((feature) => (
                                  <Badge key={feature} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="credentials" className="space-y-4">
                {!selectedExchange ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>Please select an exchange first</AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Connection Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Main Trading Account"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        placeholder="Enter your API key"
                        value={formData.apiKey}
                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secretKey">Secret Key</Label>
                      <Input
                        id="secretKey"
                        type="password"
                        placeholder="Enter your secret key"
                        value={formData.secretKey}
                        onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                      />
                    </div>

                    {selectedExchange.requiresPassphrase && (
                      <div className="space-y-2">
                        <Label htmlFor="passphrase">Passphrase</Label>
                        <Input
                          id="passphrase"
                          type="password"
                          placeholder="Enter your passphrase"
                          value={formData.passphrase}
                          onChange={(e) => setFormData({ ...formData, passphrase: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedExchange.supportedFeatures.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Switch
                              id={feature}
                              checked={formData.permissions.includes(feature)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    permissions: [...formData.permissions, feature],
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    permissions: formData.permissions.filter((p) => p !== feature),
                                  })
                                }
                              }}
                            />
                            <Label htmlFor={feature} className="capitalize">
                              {feature}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedExchange.testnetAvailable && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="testnet"
                          checked={formData.isTestnet}
                          onCheckedChange={(checked) => setFormData({ ...formData, isTestnet: checked })}
                        />
                        <Label htmlFor="testnet">Use Testnet</Label>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="security" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ipWhitelist">IP Whitelist (Optional)</Label>
                  <Input
                    id="ipWhitelist"
                    placeholder="192.168.1.1, 10.0.0.1"
                    value={formData.ipWhitelist}
                    onChange={(e) => setFormData({ ...formData, ipWhitelist: e.target.value })}
                  />
                  <p className="text-sm text-gray-500">
                    Comma-separated list of IP addresses that can use this API key
                  </p>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security Tips:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Never share your API keys with anyone</li>
                      <li>• Use IP whitelisting when possible</li>
                      <li>• Only enable required permissions</li>
                      <li>• Regularly rotate your API keys</li>
                      <li>• Monitor API key usage regularly</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddApiKey} disabled={isLoading || !selectedExchange}>
                {isLoading ? "Testing Connection..." : "Add API Key"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* API Keys List */}
      <div className="grid gap-4">
        {apiKeys.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Key className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No API Keys</h3>
              <p className="text-gray-500 mb-4">Add your first exchange API key to start trading</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add API Key
              </Button>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((apiKey) => {
            const exchange = exchanges.find((e) => e.id === apiKey.exchange)
            return (
              <Card key={apiKey.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{exchange?.logo}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{apiKey.name}</h3>
                          <Badge className={getStatusColor(apiKey.status)}>
                            {getStatusIcon(apiKey.status)}
                            <span className="ml-1 capitalize">{apiKey.status}</span>
                          </Badge>
                          {apiKey.isTestnet && <Badge variant="outline">Testnet</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">{exchange?.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteApiKey(apiKey.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">API Key</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {showSecrets[apiKey.id] ? apiKey.apiKey : "••••••••••••••••"}
                        </code>
                        <Button variant="ghost" size="sm" onClick={() => toggleSecretVisibility(apiKey.id)}>
                          {showSecrets[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Last Used</Label>
                      <p className="text-sm mt-1">{apiKey.lastUsed ? apiKey.lastUsed.toLocaleDateString() : "Never"}</p>
                    </div>

                    {apiKey.ipWhitelist.length > 0 && (
                      <div>
                        <Label className="text-xs text-gray-500">IP Whitelist</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {apiKey.ipWhitelist.map((ip, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Globe className="mr-1 h-3 w-3" />
                              {ip}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label className="text-xs text-gray-500">Created</Label>
                      <p className="text-sm mt-1">{apiKey.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ApiKeyManager
