"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Key,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Copy,
} from "lucide-react";

interface APIKey {
  id: string;
  exchange: string;
  name: string;
  apiKey: string;
  secretKey: string;
  passphrase?: string;
  permissions: string[];
  isTestnet: boolean;
  status: "active" | "inactive" | "expired";
  createdAt: string;
  lastUsed: string;
  ipWhitelist: string[];
}

export function APIKeyManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "1",
      exchange: "Binance",
      name: "Main Trading Account",
      apiKey: "abc123...xyz789",
      secretKey: "***hidden***",
      permissions: ["spot", "futures", "margin"],
      isTestnet: false,
      status: "active",
      createdAt: "2024-01-15",
      lastUsed: "2 minutes ago",
      ipWhitelist: ["192.168.1.100", "203.0.113.0/24"],
    },
    {
      id: "2",
      exchange: "Bybit",
      name: "Derivatives Trading",
      apiKey: "def456...uvw012",
      secretKey: "***hidden***",
      permissions: ["spot", "derivatives"],
      isTestnet: false,
      status: "active",
      createdAt: "2024-01-10",
      lastUsed: "5 minutes ago",
      ipWhitelist: ["192.168.1.100"],
    },
    {
      id: "3",
      exchange: "KuCoin",
      name: "Test Account",
      apiKey: "ghi789...rst345",
      secretKey: "***hidden***",
      passphrase: "***hidden***",
      permissions: ["spot"],
      isTestnet: true,
      status: "inactive",
      createdAt: "2024-01-05",
      lastUsed: "2 days ago",
      ipWhitelist: [],
    },
  ]);

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    exchange: "",
    name: "",
    apiKey: "",
    secretKey: "",
    passphrase: "",
    isTestnet: false,
    permissions: [] as string[],
  });

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleAddKey = () => {
    const newKey: APIKey = {
      id: Date.now().toString(),
      ...newKeyData,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      ipWhitelist: [],
    };
    setApiKeys((prev) => [...prev, newKey]);
    setIsAddingKey(false);
    setNewKeyData({
      exchange: "",
      name: "",
      apiKey: "",
      secretKey: "",
      passphrase: "",
      isTestnet: false,
      permissions: [],
    });
  };

  const handleDeleteKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
  };

  const toggleKeyStatus = (keyId: string) => {
    setApiKeys((prev) =>
      prev.map((key) =>
        key.id === keyId
          ? { ...key, status: key.status === "active" ? "inactive" : "active" }
          : key,
      ),
    );
  };

  const testConnection = async (keyId: string) => {
    const key = apiKeys.find((k) => k.id === keyId);
    if (!key) return;

    // Simulate API test
    try {
      const response = await fetch("/api/integrations/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exchangeId: key.exchange.toLowerCase(),
          credentials: {
            apiKey: key.apiKey,
            secretKey: key.secretKey,
            passphrase: key.passphrase,
          },
          testnet: key.isTestnet,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Connection test successful!");
      } else {
        alert(`Connection test failed: ${result.error}`);
      }
    } catch (error) {
      alert("Connection test failed: Network error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400";
      case "inactive":
        return "bg-gray-500/10 text-gray-400";
      case "expired":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const exchangeOptions = [
    { id: "binance", name: "Binance", requiresPassphrase: false },
    { id: "bybit", name: "Bybit", requiresPassphrase: false },
    { id: "kucoin", name: "KuCoin", requiresPassphrase: true },
    { id: "okx", name: "OKX", requiresPassphrase: true },
    { id: "coinbase", name: "Coinbase Pro", requiresPassphrase: true },
    { id: "kraken", name: "Kraken", requiresPassphrase: false },
  ];

  const permissionOptions = [
    "spot",
    "futures",
    "margin",
    "options",
    "staking",
    "lending",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-xl">
                🔑 API Key Management
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Securely manage your exchange API credentials
              </p>
            </div>
            <Dialog open={isAddingKey} onOpenChange={setIsAddingKey}>
              <DialogTrigger asChild>
                <Button className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New API Key</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="exchange">Exchange</Label>
                      <select
                        id="exchange"
                        className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                        value={newKeyData.exchange}
                        onChange={(e) =>
                          setNewKeyData((prev) => ({
                            ...prev,
                            exchange: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select Exchange</option>
                        {exchangeOptions.map((exchange) => (
                          <option key={exchange.id} value={exchange.name}>
                            {exchange.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="name">Key Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Main Trading Account"
                        value={newKeyData.name}
                        onChange={(e) =>
                          setNewKeyData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      placeholder="Enter your API key"
                      value={newKeyData.apiKey}
                      onChange={(e) =>
                        setNewKeyData((prev) => ({
                          ...prev,
                          apiKey: e.target.value,
                        }))
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="secretKey">Secret Key</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      placeholder="Enter your secret key"
                      value={newKeyData.secretKey}
                      onChange={(e) =>
                        setNewKeyData((prev) => ({
                          ...prev,
                          secretKey: e.target.value,
                        }))
                      }
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  {exchangeOptions.find((ex) => ex.name === newKeyData.exchange)
                    ?.requiresPassphrase && (
                    <div>
                      <Label htmlFor="passphrase">Passphrase</Label>
                      <Input
                        id="passphrase"
                        type="password"
                        placeholder="Enter your passphrase"
                        value={newKeyData.passphrase}
                        onChange={(e) =>
                          setNewKeyData((prev) => ({
                            ...prev,
                            passphrase: e.target.value,
                          }))
                        }
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {permissionOptions.map((permission) => (
                        <label
                          key={permission}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={newKeyData.permissions.includes(
                              permission,
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewKeyData((prev) => ({
                                  ...prev,
                                  permissions: [
                                    ...prev.permissions,
                                    permission,
                                  ],
                                }));
                              } else {
                                setNewKeyData((prev) => ({
                                  ...prev,
                                  permissions: prev.permissions.filter(
                                    (p) => p !== permission,
                                  ),
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm capitalize">
                            {permission}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newKeyData.isTestnet}
                      onCheckedChange={(checked) =>
                        setNewKeyData((prev) => ({
                          ...prev,
                          isTestnet: checked,
                        }))
                      }
                    />
                    <Label>Use Testnet</Label>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your API keys are encrypted and stored securely. Never
                      share your secret keys with anyone.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingKey(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddKey}
                      className="bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
                      disabled={
                        !newKeyData.exchange ||
                        !newKeyData.name ||
                        !newKeyData.apiKey ||
                        !newKeyData.secretKey
                      }
                    >
                      Add Key
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* API Keys List */}
      <div className="grid grid-cols-1 gap-6">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id} className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#30D5C8]/20 rounded-lg flex items-center justify-center">
                    <Key className="w-6 h-6 text-[#30D5C8]" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      {apiKey.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        {apiKey.exchange}
                      </Badge>
                      {apiKey.isTestnet && (
                        <Badge className="bg-yellow-500/10 text-yellow-400">
                          Testnet
                        </Badge>
                      )}
                      <Badge className={getStatusColor(apiKey.status)}>
                        {apiKey.status.charAt(0).toUpperCase() +
                          apiKey.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={apiKey.status === "active"}
                    onCheckedChange={() => toggleKeyStatus(apiKey.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => testConnection(apiKey.id)}
                    className="text-[#30D5C8] hover:bg-[#30D5C8]/10"
                  >
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteKey(apiKey.id)}
                    className="text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="credentials" className="space-y-4">
                <TabsList className="bg-gray-800/50">
                  <TabsTrigger value="credentials">Credentials</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="credentials" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-400">API Key</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={
                            showSecrets[apiKey.id]
                              ? apiKey.apiKey
                              : apiKey.apiKey.replace(/./g, "*")
                          }
                          readOnly
                          className="bg-gray-800/50 border-gray-700 text-white font-mono"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(apiKey.id)}
                        >
                          {showSecrets[apiKey.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigator.clipboard.writeText(apiKey.apiKey)
                          }
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-400">Secret Key</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={
                            showSecrets[apiKey.id]
                              ? apiKey.secretKey
                              : "***hidden***"
                          }
                          readOnly
                          className="bg-gray-800/50 border-gray-700 text-white font-mono"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSecretVisibility(apiKey.id)}
                        >
                          {showSecrets[apiKey.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {apiKey.passphrase && (
                      <div className="space-y-2">
                        <Label className="text-gray-400">Passphrase</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={
                              showSecrets[apiKey.id]
                                ? apiKey.passphrase
                                : "***hidden***"
                            }
                            readOnly
                            className="bg-gray-800/50 border-gray-700 text-white font-mono"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSecretVisibility(apiKey.id)}
                          >
                            {showSecrets[apiKey.id] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-gray-400">Created</Label>
                      <div className="text-white">{apiKey.createdAt}</div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-400">Last Used</Label>
                      <div className="text-white">{apiKey.lastUsed}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                  <div>
                    <Label className="text-gray-400 mb-3 block">
                      Granted Permissions
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {apiKey.permissions.map((permission) => (
                        <Badge
                          key={permission}
                          className="bg-[#30D5C8]/10 text-[#30D5C8]"
                        >
                          {permission.charAt(0).toUpperCase() +
                            permission.slice(1)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Only grant the minimum permissions required for your
                      trading strategy. You can modify permissions by creating a
                      new API key on the exchange.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-400">IP Whitelist</Label>
                      <div className="space-y-1">
                        {apiKey.ipWhitelist.length > 0 ? (
                          apiKey.ipWhitelist.map((ip, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
                            >
                              <span className="text-white font-mono text-sm">
                                {ip}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:bg-red-400/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 text-sm">
                            No IP restrictions
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-white bg-transparent"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add IP
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                        <div>
                          <div className="text-white font-medium">
                            Two-Factor Authentication
                          </div>
                          <div className="text-gray-400 text-sm">
                            Additional security layer
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                        <div>
                          <div className="text-white font-medium">
                            Withdrawal Restrictions
                          </div>
                          <div className="text-gray-400 text-sm">
                            API cannot withdraw funds
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                        <div>
                          <div className="text-white font-medium">
                            Rate Limiting
                          </div>
                          <div className="text-gray-400 text-sm">
                            Automatic request throttling
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      For maximum security, enable IP whitelisting and disable
                      withdrawal permissions for trading-only API keys.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Recommendations */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">
            🛡️ Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-medium">✅ Recommended</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Use separate API keys for different strategies</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Enable IP whitelisting when possible</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Disable withdrawal permissions for trading bots</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Regularly rotate API keys</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Monitor API key usage and activity</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-medium">⚠️ Avoid</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Never share API keys or secret keys</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Don't store keys in plain text files</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Avoid using keys with full account permissions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Don't use the same key across multiple platforms</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>Never commit API keys to version control</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
