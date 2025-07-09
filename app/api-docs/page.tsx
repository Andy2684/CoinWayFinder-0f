"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Code, Copy, Key, Zap, TrendingUp, Activity, Bot, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function APIDocsPage() {
  const [activeEndpoint, setActiveEndpoint] = useState("signals")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    })
  }

  const endpoints = [
    {
      id: "signals",
      name: "Trading Signals",
      icon: Zap,
      method: "GET",
      path: "/api/v1/signals",
      description: "Get AI-powered trading signals with confidence scores",
      permission: "signals:read",
      planRequired: "Free+",
    },
    {
      id: "whales",
      name: "Whale Tracking",
      icon: Activity,
      method: "GET",
      path: "/api/v1/whales",
      description: "Track large cryptocurrency transactions and whale movements",
      permission: "whales:read",
      planRequired: "Basic+",
    },
    {
      id: "trends",
      name: "Market Trends",
      icon: TrendingUp,
      method: "GET",
      path: "/api/v1/trends",
      description: "Get comprehensive market analysis and trending data",
      permission: "trends:read",
      planRequired: "Basic+",
    },
    {
      id: "bots",
      name: "Trading Bots",
      icon: Bot,
      method: "GET/POST",
      path: "/api/v1/bots",
      description: "Manage your trading bots programmatically",
      permission: "bots:read, bots:create",
      planRequired: "Premium+",
    },
  ]

  const codeExamples = {
    javascript: {
      signals: `// JavaScript/Node.js Example
const response = await fetch('https://coinwayfinder.com/api/v1/signals?symbol=BTC/USDT&limit=10', {
  headers: {
    'Authorization': 'Bearer your_key_id:your_secret',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
      whales: `// JavaScript/Node.js Example
const response = await fetch('https://coinwayfinder.com/api/v1/whales?minAmount=1000000&limit=20', {
  headers: {
    'Authorization': 'Bearer your_key_id:your_secret',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
      trends: `// JavaScript/Node.js Example
const response = await fetch('https://coinwayfinder.com/api/v1/trends?timeframe=24h', {
  headers: {
    'Authorization': 'Bearer your_key_id:your_secret',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
      bots: `// JavaScript/Node.js Example - Get Bots
const response = await fetch('https://coinwayfinder.com/api/v1/bots', {
  headers: {
    'Authorization': 'Bearer your_key_id:your_secret',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);

// Create New Bot
const createBot = await fetch('https://coinwayfinder.com/api/v1/bots', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_key_id:your_secret',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Trading Bot',
    exchange: 'binance',
    strategy: 'dca',
    symbol: 'BTC/USDT',
    apiKey: 'your_exchange_api_key',
    secretKey: 'your_exchange_secret',
    investment: 1000,
    riskLevel: 50
  })
});`,
    },
    python: {
      signals: `# Python Example
import requests

headers = {
    'Authorization': 'Bearer your_key_id:your_secret',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://coinwayfinder.com/api/v1/signals',
    headers=headers,
    params={'symbol': 'BTC/USDT', 'limit': 10}
)

data = response.json()
print(data)`,
      whales: `# Python Example
import requests

headers = {
    'Authorization': 'Bearer your_key_id:your_secret',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://coinwayfinder.com/api/v1/whales',
    headers=headers,
    params={'minAmount': 1000000, 'limit': 20}
)

data = response.json()
print(data)`,
      trends: `# Python Example
import requests

headers = {
    'Authorization': 'Bearer your_key_id:your_secret',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://coinwayfinder.com/api/v1/trends',
    headers=headers,
    params={'timeframe': '24h'}
)

data = response.json()
print(data)`,
      bots: `# Python Example
import requests

headers = {
    'Authorization': 'Bearer your_key_id:your_secret',
    'Content-Type': 'application/json'
}

# Get bots
response = requests.get(
    'https://coinwayfinder.com/api/v1/bots',
    headers=headers
)

data = response.json()
print(data)

# Create new bot
bot_data = {
    'name': 'My Trading Bot',
    'exchange': 'binance',
    'strategy': 'dca',
    'symbol': 'BTC/USDT',
    'apiKey': 'your_exchange_api_key',
    'secretKey': 'your_exchange_secret',
    'investment': 1000,
    'riskLevel': 50
}

create_response = requests.post(
    'https://coinwayfinder.com/api/v1/bots',
    headers=headers,
    json=bot_data
)`,
    },
    curl: {
      signals: `# cURL Example
curl -X GET "https://coinwayfinder.com/api/v1/signals?symbol=BTC/USDT&limit=10" \\
  -H "Authorization: Bearer your_key_id:your_secret" \\
  -H "Content-Type: application/json"`,
      whales: `# cURL Example
curl -X GET "https://coinwayfinder.com/api/v1/whales?minAmount=1000000&limit=20" \\
  -H "Authorization: Bearer your_key_id:your_secret" \\
  -H "Content-Type: application/json"`,
      trends: `# cURL Example
curl -X GET "https://coinwayfinder.com/api/v1/trends?timeframe=24h" \\
  -H "Authorization: Bearer your_key_id:your_secret" \\
  -H "Content-Type: application/json"`,
      bots: `# cURL Example - Get Bots
curl -X GET "https://coinwayfinder.com/api/v1/bots" \\
  -H "Authorization: Bearer your_key_id:your_secret" \\
  -H "Content-Type: application/json"

# Create New Bot
curl -X POST "https://coinwayfinder.com/api/v1/bots" \\
  -H "Authorization: Bearer your_key_id:your_secret" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Trading Bot",
    "exchange": "binance",
    "strategy": "dca",
    "symbol": "BTC/USDT",
    "apiKey": "your_exchange_api_key",
    "secretKey": "your_exchange_secret",
    "investment": 1000,
    "riskLevel": 50
  }'`,
    },
  }

  const responseExamples = {
    signals: `{
  "success": true,
  "data": [
    {
      "id": "signal_1704067200_0",
      "symbol": "BTC/USDT",
      "timeframe": "1h",
      "signal": "BUY",
      "confidence": 85,
      "price": 47250.50,
      "timestamp": "2024-01-01T00:00:00.000Z",
      "indicators": {
        "rsi": 35,
        "macd": 125.5,
        "bollinger": "lower",
        "volume": 850000
      },
      "targets": {
        "entry": 47250.50,
        "stopLoss": 46800.00,
        "takeProfit": 48500.00
      }
    }
  ],
  "meta": {
    "symbol": "BTC/USDT",
    "timeframe": "1h",
    "count": 1,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "subscriptionStatus": "active"
  }
}`,
    whales: `{
  "success": true,
  "data": [
    {
      "id": "whale_1704067200_0",
      "hash": "0x1234567890abcdef...",
      "from": "0xabcdef1234567890...",
      "to": "0x0987654321fedcba...",
      "amount": 5000000,
      "token": "BTC",
      "exchange": "Binance",
      "type": "withdrawal",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "impact": {
        "priceChange": -1.2,
        "volumeSpike": 150
      }
    }
  ],
  "meta": {
    "minAmount": 1000000,
    "count": 1,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "subscriptionStatus": "active"
  }
}`,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">CoinWayFinder API</h1>
          <p className="text-xl text-gray-400 mb-8">
            Powerful REST API for cryptocurrency trading, signals, and market analysis
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge className="bg-green-500/10 text-green-400">v1.0</Badge>
            <Badge className="bg-blue-500/10 text-blue-400">REST API</Badge>
            <Badge className="bg-purple-500/10 text-purple-400">Real-time</Badge>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="h-5 w-5" />
              Quick Start
            </CardTitle>
            <CardDescription className="text-gray-400">
              Get started with the CoinWayFinder API in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="w-8 h-8 bg-[#30D5C8] rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-black font-bold">1</span>
                </div>
                <h3 className="text-white font-medium mb-1">Get API Key</h3>
                <p className="text-gray-400 text-sm">Create an API key in your dashboard</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="w-8 h-8 bg-[#30D5C8] rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-black font-bold">2</span>
                </div>
                <h3 className="text-white font-medium mb-1">Authenticate</h3>
                <p className="text-gray-400 text-sm">Use Bearer token authentication</p>
              </div>
              <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                <div className="w-8 h-8 bg-[#30D5C8] rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-black font-bold">3</span>
                </div>
                <h3 className="text-white font-medium mb-1">Start Trading</h3>
                <p className="text-gray-400 text-sm">Make API calls to access features</p>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Base URL:</strong> <code>https://coinwayfinder.com</code>
                <br />
                <strong>Authentication:</strong> <code>Authorization: Bearer keyId:secret</code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Authentication</CardTitle>
            <CardDescription className="text-gray-400">
              All API requests require authentication using API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2">Header Format</h4>
              <code className="text-[#30D5C8] text-sm">Authorization: Bearer your_key_id:your_secret_key</code>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-medium mb-2">✅ Correct</h4>
                <pre className="bg-green-900/20 border border-green-800 p-3 rounded text-green-300 text-sm">
                  {`curl -H "Authorization: Bearer cwf_abc123:def456xyz"`}
                </pre>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">❌ Incorrect</h4>
                <pre className="bg-red-900/20 border border-red-800 p-3 rounded text-red-300 text-sm">
                  {`curl -H "Authorization: cwf_abc123:def456xyz"`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Rate Limits</CardTitle>
            <CardDescription className="text-gray-400">
              API usage limits based on your subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-white py-2">Plan</th>
                    <th className="text-left text-white py-2">Per Minute</th>
                    <th className="text-left text-white py-2">Per Hour</th>
                    <th className="text-left text-white py-2">Per Day</th>
                    <th className="text-left text-white py-2">Features</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 text-gray-300">Free</td>
                    <td className="py-2 text-gray-300">10</td>
                    <td className="py-2 text-gray-300">100</td>
                    <td className="py-2 text-gray-300">500</td>
                    <td className="py-2 text-gray-300">Signals only</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 text-gray-300">Basic</td>
                    <td className="py-2 text-gray-300">50</td>
                    <td className="py-2 text-gray-300">1,000</td>
                    <td className="py-2 text-gray-300">5,000</td>
                    <td className="py-2 text-gray-300">Signals, Whales, Trends</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-2 text-gray-300">Premium</td>
                    <td className="py-2 text-gray-300">200</td>
                    <td className="py-2 text-gray-300">5,000</td>
                    <td className="py-2 text-gray-300">25,000</td>
                    <td className="py-2 text-gray-300">All features + Bot management</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-300">Enterprise</td>
                    <td className="py-2 text-gray-300">500</td>
                    <td className="py-2 text-gray-300">15,000</td>
                    <td className="py-2 text-gray-300">100,000</td>
                    <td className="py-2 text-gray-300">Unlimited access</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">API Endpoints</CardTitle>
            <CardDescription className="text-gray-400">Available endpoints and their functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              {endpoints.map((endpoint) => {
                const Icon = endpoint.icon
                return (
                  <button
                    key={endpoint.id}
                    onClick={() => setActiveEndpoint(endpoint.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      activeEndpoint === endpoint.id
                        ? "bg-[#30D5C8]/10 border-[#30D5C8] text-[#30D5C8]"
                        : "bg-gray-800/50 border-gray-700 text-gray-300 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{endpoint.name}</span>
                    </div>
                    <div className="text-xs opacity-75 mb-2">{endpoint.method}</div>
                    <div className="text-sm opacity-90">{endpoint.description}</div>
                    <Badge className="mt-2 text-xs" variant="secondary">
                      {endpoint.planRequired}
                    </Badge>
                  </button>
                )
              })}
            </div>

            {/* Endpoint Details */}
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className={activeEndpoint === endpoint.id ? "block" : "hidden"}>
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <endpoint.icon className="h-6 w-6 text-[#30D5C8]" />
                      <h3 className="text-xl font-semibold text-white">{endpoint.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500/10 text-blue-400">{endpoint.method}</Badge>
                      <Badge className="bg-purple-500/10 text-purple-400">{endpoint.permission}</Badge>
                    </div>
                  </div>

                  <div className="mb-6">
                    <code className="bg-gray-900 px-3 py-2 rounded text-[#30D5C8] text-sm">
                      {endpoint.method} {endpoint.path}
                    </code>
                  </div>

                  <Tabs defaultValue="javascript" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-700">
                      <TabsTrigger value="javascript" className="text-white">
                        JavaScript
                      </TabsTrigger>
                      <TabsTrigger value="python" className="text-white">
                        Python
                      </TabsTrigger>
                      <TabsTrigger value="curl" className="text-white">
                        cURL
                      </TabsTrigger>
                    </TabsList>

                    {Object.entries(codeExamples).map(([lang, examples]) => (
                      <TabsContent key={lang} value={lang}>
                        <div className="relative">
                          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
                            <code>{examples[endpoint.id as keyof typeof examples]}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                            onClick={() => copyToClipboard(examples[endpoint.id as keyof typeof examples])}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>

                  {/* Response Example */}
                  {responseExamples[endpoint.id as keyof typeof responseExamples] && (
                    <div className="mt-6">
                      <h4 className="text-white font-medium mb-3">Response Example</h4>
                      <div className="relative">
                        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
                          <code>{responseExamples[endpoint.id as keyof typeof responseExamples]}</code>
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() =>
                            copyToClipboard(responseExamples[endpoint.id as keyof typeof responseExamples])
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Error Handling */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Error Handling</CardTitle>
            <CardDescription className="text-gray-400">Common error codes and how to handle them</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg">
                  <h4 className="text-red-400 font-medium mb-2">401 Unauthorized</h4>
                  <p className="text-red-300 text-sm mb-2">Invalid or missing API key</p>
                  <code className="text-red-200 text-xs">{'{ "error": "Invalid API key" }'}</code>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-800 p-4 rounded-lg">
                  <h4 className="text-yellow-400 font-medium mb-2">402 Payment Required</h4>
                  <p className="text-yellow-300 text-sm mb-2">Subscription expired</p>
                  <code className="text-yellow-200 text-xs">
                    {'{ "error": "Subscription expired", "renewUrl": "/subscription" }'}
                  </code>
                </div>
                <div className="bg-orange-900/20 border border-orange-800 p-4 rounded-lg">
                  <h4 className="text-orange-400 font-medium mb-2">403 Forbidden</h4>
                  <p className="text-orange-300 text-sm mb-2">Insufficient permissions</p>
                  <code className="text-orange-200 text-xs">{'{ "error": "Insufficient permissions" }'}</code>
                </div>
                <div className="bg-purple-900/20 border border-purple-800 p-4 rounded-lg">
                  <h4 className="text-purple-400 font-medium mb-2">429 Too Many Requests</h4>
                  <p className="text-purple-300 text-sm mb-2">Rate limit exceeded</p>
                  <code className="text-purple-200 text-xs">
                    {'{ "error": "Rate limit exceeded", "resetTime": "2024-01-01T01:00:00Z" }'}
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Graceful Expiration Notice */}
        <Card className="bg-blue-900/20 border-blue-800 mb-8">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Graceful Expiration Policy
            </CardTitle>
            <CardDescription className="text-blue-300">User-friendly subscription handling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-medium mb-2">✅ Continues Working</h4>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• Existing trading bots keep running</li>
                  <li>• Read-only API access (GET requests)</li>
                  <li>• Manual bot stopping allowed</li>
                  <li>• Data export and viewing</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">❌ Requires Renewal</h4>
                <ul className="text-red-300 text-sm space-y-1">
                  <li>• Creating new trading bots</li>
                  <li>• Modifying bot parameters</li>
                  <li>• Write operations (POST/PUT/DELETE)</li>
                  <li>• New API key generation</li>
                </ul>
              </div>
            </div>
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                When your subscription expires, you'll receive HTTP 402 responses for write operations, but existing
                bots will continue running until manually stopped or completed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Support & Resources</CardTitle>
            <CardDescription className="text-gray-400">Get help and additional resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 border-gray-700 hover:border-[#30D5C8] bg-transparent">
                <div className="text-center">
                  <Code className="h-6 w-6 mx-auto mb-2 text-[#30D5C8]" />
                  <div className="text-white font-medium">API Status</div>
                  <div className="text-gray-400 text-sm">Check system status</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 border-gray-700 hover:border-[#30D5C8] bg-transparent">
                <div className="text-center">
                  <ExternalLink className="h-6 w-6 mx-auto mb-2 text-[#30D5C8]" />
                  <div className="text-white font-medium">Discord Community</div>
                  <div className="text-gray-400 text-sm">Join our developers</div>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 border-gray-700 hover:border-[#30D5C8] bg-transparent">
                <div className="text-center">
                  <Key className="h-6 w-6 mx-auto mb-2 text-[#30D5C8]" />
                  <div className="text-white font-medium">Manage API Keys</div>
                  <div className="text-gray-400 text-sm">Dashboard access</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
