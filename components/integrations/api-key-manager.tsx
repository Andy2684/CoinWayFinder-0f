'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, Trash2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ApiKey {
  id: string
  exchange: string
  name: string
  key: string
  secret: string
  passphrase?: string
  isActive: boolean
  createdAt: string
}

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      exchange: 'binance',
      name: 'Binance Main',
      key: 'abc123***',
      secret: '***hidden***',
      isActive: true,
      createdAt: '2024-01-15',
    },
  ])
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [isAddingKey, setIsAddingKey] = useState(false)
  const [newKey, setNewKey] = useState({
    exchange: '',
    name: '',
    key: '',
    secret: '',
    passphrase: '',
  })

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const handleAddKey = () => {
    const apiKey: ApiKey = {
      id: Date.now().toString(),
      exchange: newKey.exchange,
      name: newKey.name,
      key: newKey.key,
      secret: newKey.secret,
      passphrase: newKey.passphrase,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    }

    setApiKeys((prev) => [...prev, apiKey])
    setNewKey({ exchange: '', name: '', key: '', secret: '', passphrase: '' })
    setIsAddingKey(false)
  }

  const handleDeleteKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== keyId))
  }

  const exchanges = [
    { value: 'binance', label: 'Binance' },
    { value: 'coinbase', label: 'Coinbase Pro' },
    { value: 'kraken', label: 'Kraken' },
    { value: 'bybit', label: 'Bybit' },
    { value: 'okx', label: 'OKX' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Key Management</h2>
          <p className="text-muted-foreground">Manage your exchange API keys securely</p>
        </div>
        <Dialog open={isAddingKey} onOpenChange={setIsAddingKey}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New API Key</DialogTitle>
              <DialogDescription>
                Add a new exchange API key to enable trading functionality.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="exchange">Exchange</Label>
                <Select
                  value={newKey.exchange}
                  onValueChange={(value) => setNewKey((prev) => ({ ...prev, exchange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    {exchanges.map((exchange) => (
                      <SelectItem key={exchange.value} value={exchange.value}>
                        {exchange.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  value={newKey.name}
                  onChange={(e) => setNewKey((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Trading Account"
                />
              </div>
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  value={newKey.key}
                  onChange={(e) => setNewKey((prev) => ({ ...prev, key: e.target.value }))}
                  placeholder="Your API key"
                />
              </div>
              <div>
                <Label htmlFor="secret">Secret Key</Label>
                <Input
                  id="secret"
                  type="password"
                  value={newKey.secret}
                  onChange={(e) => setNewKey((prev) => ({ ...prev, secret: e.target.value }))}
                  placeholder="Your secret key"
                />
              </div>
              {newKey.exchange === 'okx' && (
                <div>
                  <Label htmlFor="passphrase">Passphrase</Label>
                  <Input
                    id="passphrase"
                    type="password"
                    value={newKey.passphrase}
                    onChange={(e) => setNewKey((prev) => ({ ...prev, passphrase: e.target.value }))}
                    placeholder="Your passphrase (OKX only)"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingKey(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddKey}
                disabled={!newKey.exchange || !newKey.name || !newKey.key || !newKey.secret}
              >
                Add Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {apiKey.name}
                    <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
                      {apiKey.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {exchanges.find((e) => e.value === apiKey.exchange)?.label} • Created{' '}
                    {apiKey.createdAt}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleDeleteKey(apiKey.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">API Key</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={showSecrets[apiKey.id] ? apiKey.key : apiKey.key.slice(0, 8) + '***'}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSecretVisibility(apiKey.id)}
                    >
                      {showSecrets[apiKey.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Secret Key</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={showSecrets[apiKey.id] ? apiKey.secret : '***hidden***'}
                      readOnly
                      className="font-mono text-sm"
                      type={showSecrets[apiKey.id] ? 'text' : 'password'}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {apiKeys.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No API Keys Added</h3>
              <p className="text-muted-foreground mb-4">
                Add your first exchange API key to start trading
              </p>
              <Button onClick={() => setIsAddingKey(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add API Key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ApiKeyManager
