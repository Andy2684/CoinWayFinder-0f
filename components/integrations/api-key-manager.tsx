"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, EyeOff, Plus, Trash2, Edit, Key, AlertCircle, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ApiKey {
  id: string
  name: string
  exchange: string
  publicKey: string
  secretKey: string
  passphrase?: string
  permissions: string[]
  status: "active" | "inactive" | "expired"
  createdAt: string
  lastUsed?: string
}

const mockApiKeys: ApiKey[] = [
  {
    id: "1",
    name: "Binance Main",
    exchange: "binance",
    publicKey: "abc123...xyz789",
    secretKey: "***hidden***",
    permissions: ["spot", "futures"],
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    lastUsed: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Coinbase Pro",
    exchange: "coinbase",
    publicKey: "def456...uvw012",
    secretKey: "***hidden***",
    passphrase: "***hidden***",
    permissions: ["trade", "view"],
    status: "active",
    createdAt: "2024-01-02T00:00:00Z",
    lastUsed: "2024-01-14T15:45:00Z",
  },
]

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newApiKey, setNewApiKey] = useState({
    name: "",
    exchange: "",
    publicKey: "",
    secretKey: "",
    passphrase: "",
  })
  const { toast } = useToast()

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "API key copied successfully",
    })
  }

  const handleAddApiKey = () => {
    if (!newApiKey.name || !newApiKey.exchange || !newApiKey.publicKey || !newApiKey.secretKey) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const apiKey: ApiKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      exchange: newApiKey.exchange,
      publicKey: newApiKey.publicKey,
      secretKey: newApiKey.secretKey,
      passphrase: newApiKey.passphrase || undefined,
      permissions: ["spot", "trade"],
      status: "active",
      createdAt: new Date().toISOString(),
    }

    setApiKeys((prev) => [...prev, apiKey])
    setNewApiKey({ name: "", exchange: "", publicKey: "", secretKey: "", passphrase: "" })
    setIsAddDialogOpen(false)

    toast({
      title: "Success",
      description: "API key added successfully",
    })
  }

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== keyId))
    toast({
      title: "Success",
      description: "API key deleted successfully",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      inactive: "secondary",
      expired: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const getExchangeBadge = (exchange: string) => {
    const colors: Record<string, string> = {
      binance: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      coinbase: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      kraken: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    }
    return <Badge className={colors[exchange] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}>{exchange}</Badge>
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            API Key Management
          </span>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">
                <Plus className="w-4 h-4 mr-2" />
                Add API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Add New API Key</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add your exchange API keys to enable automated trading
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Binance Main"
                    value={newApiKey.name}
                    onChange={(e) => setNewApiKey((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exchange" className="text-white">
                    Exchange
                  </Label>
                  <Input
                    id="exchange"
                    placeholder="e.g., binance, coinbase, kraken"
                    value={newApiKey.exchange}
                    onChange={(e) => setNewApiKey((prev) => ({ ...prev, exchange: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publicKey" className="text-white">
                    API Key (Public)
                  </Label>
                  <Input
                    id="publicKey"
                    placeholder="Your API public key"
                    value={newApiKey.publicKey}
                    onChange={(e) => setNewApiKey((prev) => ({ ...prev, publicKey: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secretKey" className="text-white">
                    Secret Key
                  </Label>
                  <Input
                    id="secretKey"
                    type="password"
                    placeholder="Your API secret key"
                    value={newApiKey.secretKey}
                    onChange={(e) => setNewApiKey((prev) => ({ ...prev, secretKey: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passphrase" className="text-white">
                    Passphrase (Optional)
                  </Label>
                  <Input
                    id="passphrase"
                    type="password"
                    placeholder="Passphrase if required"
                    value={newApiKey.passphrase}
                    onChange={(e) => setNewApiKey((prev) => ({ ...prev, passphrase: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <Alert className="border-yellow-500/20 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-300">
                  Your API keys are encrypted and stored securely. Never share your secret keys with anyone.
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="border-gray-700 text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddApiKey} className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">
                  Add API Key
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription className="text-gray-400">Manage your exchange API keys for automated trading</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border border-gray-800">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Exchange</TableHead>
                <TableHead className="text-gray-400">Public Key</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Last Used</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id} className="border-gray-800">
                  <TableCell className="text-white font-medium">{apiKey.name}</TableCell>
                  <TableCell>{getExchangeBadge(apiKey.exchange)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        {showSecrets[apiKey.id] ? apiKey.publicKey : apiKey.publicKey.slice(0, 8) + "..."}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSecretVisibility(apiKey.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {showSecrets[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.publicKey)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(apiKey.status)}</TableCell>
                  <TableCell className="text-gray-400">
                    {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {apiKeys.length === 0 && (
          <div className="text-center py-12">
            <Key className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No API keys configured</p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First API Key
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
