"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Code, Key, Zap, Shield, Globe } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface APIEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE"
  path: string
  description: string
  parameters?: { name: string; type: string; required: boolean; description: string }[]
  response: string
  example: {
    request?: string
    response: string
  }
}

export default function APIDocsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>("bots") // Updated default value

  const endpoints: { [key: string]: APIEndpoint[] } = {
    bots: [
      {
        method: "GET",
        path: "/api/bots",
        description: "Get all trading bots for the authenticated user",
        response: "Array of bot objects with configuration and statistics",
        example: {
          response: `{
  "success": true,
  "bots": [
    {
      "_id": "bot123",
      "name": "BTC DCA Bot",
      "strategy": "dca",
      "symbol": "BTC/USDT",
      "status": "running",
      "config": {
        "investment": 1000,
        "riskLevel": 30
      },
      "stats": {
        "totalTrades": 45,
        "winRate": 73.2,
        "totalProfit": 234.56
      }
    }
  ]
}`,
        },
      },
      {
        method: "POST",
        path: "/api/bots",
        description: "Create a new trading bot",
        parameters: [
          { name: "name", type: "string", required: true, description: "Bot name" },
          { name: "strategy", type: "string", required: true, description: "Trading strategy (dca, grid, scalping)" },
          { name: "symbol", type: "string", required: true, description: "Trading pair (e.g., BTC/USDT)" },
          { name: "config", type: "object", required: true, description: "Bot configuration parameters" },
        ],
        response: "Created bot object",
        example: {
          request: `{
  "name": "My DCA Bot",
  "strategy": "dca",
  "symbol": "BTC/USDT",
  "config": {
    "investment": 1000,
    "riskLevel": 30,
    "interval": "1h"
  }
}`,
          response: `{
  "success": true,
  "bot": {
    "_id": "bot456",
    "name": "My DCA Bot",
    "strategy": "dca",
    "status": "created"
  }
}`,
        },
      },
      {
        method: "POST",
        path: "/api/bots/{botId}/start",
        description: "Start a trading bot",
        parameters: [{ name: "botId", type: "string", required: true, description: "Bot ID" }],
        response: "Success confirmation",
        example: {
          response: `{
  "success": true,
  "message": "Bot started successfully"
}`,
        },
      },
      {
        method: "POST",
        path: "/api/bots/{botId}/pause",
        description: "Pause a running trading bot",
        parameters: [{ name: "botId", type: "string", required: true, description: "Bot ID" }],
        response: "Success confirmation",
        example: {
          response: `{
  "success": true,
  "message": "Bot paused successfully"
}`,
        },
      },
    ],
    signals: [
      {
        method: "GET",
        path: "/api/v1/signals",
        description: "Get AI-generated trading signals",
        parameters: [
          { name: "symbol", type: "string", required: false, description: "Filter by trading pair" },
          { name: "timeframe", type: "string", required: false, description: "Signal timeframe (1h, 4h, 1d)" },
        ],
        response: "Array of trading signals",
        example: {
          response: `{
  "success": true,
  "signals": [
    {
      "symbol": "BTC/USDT",
      "signal": "BUY",
      "confidence": 0.85,
      "price": 67234.56,
      "timestamp": "2024-01-07T14:30:00Z",
      "reasoning": "Strong bullish momentum with RSI oversold"
    }
  ]
}`,
        },
      },
    ],
    market: [
      {
        method: "GET",
        path: "/api/crypto/prices",
        description: "Get real-time cryptocurrency prices",
        parameters: [
          { name: "symbols", type: "string", required: false, description: "Comma-separated list of symbols" },
        ],
        response: "Array of price data",
        example: {
          response: `{
  "success": true,
  "data": [
    {
      "symbol": "BTC",
      "current_price": 67234.56,
      "price_change_percentage_24h": 2.34,
      "market_cap": 1320000000000,
      "volume_24h": 28500000000
    }
  ]
}`,
        },
      },
      {
        method: "GET",
        path: "/api/crypto/trends",
        description: "Get market trends and top gainers/losers",
        response: "Market trend data",
        example: {
          response: `{
  "success": true,
  "data": {
    "gainers": [
      {
        "symbol": "SOL",
        "price_change_percentage_24h": 15.67,
        "current_price": 156.78
      }
    ],
    "losers": [
      {
        "symbol": "ADA",
        "price_change_percentage_24h": -8.45,
        "current_price": 0.4567
      }
    ]
  }
}`,
        },
      },
    ],
    portfolio: [
      {
        method: "GET",
        path: "/api/portfolio",
        description: "Get user's portfolio overview",
        response: "Portfolio data with balances and performance",
        example: {
          response: `{
  "success": true,
  "portfolio": {
    "totalValue": 45678.32,
    "totalPnL": 3456.78,
    "positions": [
      {
        "symbol": "BTC",
        "amount": 0.5,
        "value": 33617.28,
        "pnl": 1234.56
      }
    ]
  }
}`,
        },
      },
    ],
  }

  const codeExamples = {
    javascript: {
      auth: `// Authentication
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.token;`,
      request: `// Making API requests
const response = await fetch('/api/bots', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.bots);`,
    },
    python: {
      auth: `# Authentication
import requests

response = requests.post('/api/auth/signin', json={
    'email': 'user@example.com',
    'password': 'password123'
})

data = response.json()
token = data['token']`,
      request: `# Making API requests
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.get('/api/bots', headers=headers)
data = response.json()
print(data['bots'])`,
    },
    curl: {
      auth: `# Authentication
curl -X POST /api/auth/signin \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'`,
      request: `# Making API requests
curl -X GET /api/bots \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"`,
    },
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Code example copied successfully",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">API Documentation</h1>
          <p className="text-gray-400">Complete reference for the CoinWayFinder API</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-800 sticky top-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Code className="w-5 h-5 mr-2 text-[#30D5C8]" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-[#30D5C8]" />
                  <span className="text-sm text-gray-300">Get API Key</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#30D5C8]" />
                  <span className="text-sm text-gray-300">Authentication</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-[#30D5C8]" />
                  <span className="text-sm text-gray-300">Rate Limits</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-[#30D5C8]" />
                  <span className="text-sm text-gray-300">Endpoints</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gray-800/50 border border-gray-700">
                <TabsTrigger
                  value="overview"
                  className="text-white data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="auth"
                  className="text-white data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black"
                >
                  Authentication
                </TabsTrigger>
                <TabsTrigger
                  value="endpoints"
                  className="text-white data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black"
                >
                  Endpoints
                </TabsTrigger>
                <TabsTrigger
                  value="examples"
                  className="text-white data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black"
                >
                  Examples
                </TabsTrigger>
                <TabsTrigger
                  value="errors"
                  className="text-white data-[state=active]:bg-[#30D5C8] data-[state=active]:text-black"
                >
                  Errors
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">API Overview</CardTitle>
                    <CardDescription className="text-gray-400">
                      The CoinWayFinder API provides programmatic access to trading bots, market data, and portfolio
                      management.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Base URL</h3>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <code className="text-[#30D5C8]">https://api.coinwayfinder.com/v1</code>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-800/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Trading Bots</h4>
                          <p className="text-gray-400 text-sm">Create, manage, and monitor automated trading bots</p>
                        </div>
                        <div className="p-4 bg-gray-800/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Market Data</h4>
                          <p className="text-gray-400 text-sm">Real-time prices, trends, and market analysis</p>
                        </div>
                        <div className="p-4 bg-gray-800/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">AI Signals</h4>
                          <p className="text-gray-400 text-sm">AI-powered trading signals and recommendations</p>
                        </div>
                        <div className="p-4 bg-gray-800/30 rounded-lg">
                          <h4 className="text-white font-medium mb-2">Portfolio</h4>
                          <p className="text-gray-400 text-sm">Portfolio tracking and performance analytics</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Rate Limits</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                          <span className="text-gray-300">Free Tier</span>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            100 requests/hour
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                          <span className="text-gray-300">Pro Tier</span>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            1,000 requests/hour
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                          <span className="text-gray-300">Enterprise</span>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            10,000 requests/hour
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="auth" className="mt-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Authentication</CardTitle>
                    <CardDescription className="text-gray-400">
                      Secure your API requests with proper authentication
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">API Key Authentication</h3>
                      <p className="text-gray-400 mb-4">
                        Include your API key in the Authorization header of every request:
                      </p>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <code className="text-[#30D5C8]">Authorization: Bearer YOUR_API_KEY</code>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Getting Your API Key</h3>
                      <ol className="list-decimal list-inside space-y-2 text-gray-400">
                        <li>Sign up for a CoinWayFinder account</li>
                        <li>Navigate to Dashboard → API Access</li>
                        <li>Click "Create API Key"</li>
                        <li>Copy and securely store your key</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Security Best Practices</h3>
                      <ul className="list-disc list-inside space-y-2 text-gray-400">
                        <li>Never expose API keys in client-side code</li>
                        <li>Use environment variables to store keys</li>
                        <li>Rotate keys regularly</li>
                        <li>Monitor API usage for suspicious activity</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="endpoints" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">API Endpoints</h2>
                    <Select value={selectedEndpoint || "bots"} onValueChange={setSelectedEndpoint}>
                      <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select endpoint" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        <SelectItem value="bots">Bots API</SelectItem>
                        <SelectItem value="signals">Signals API</SelectItem>
                        <SelectItem value="market">Market API</SelectItem>
                        <SelectItem value="portfolio">Portfolio API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {Object.entries(endpoints).map(([category, categoryEndpoints]) => {
                    if (selectedEndpoint && selectedEndpoint !== category) return null

                    return (
                      <Card key={category} className="bg-gray-900/50 border-gray-800">
                        <CardHeader>
                          <CardTitle className="text-white capitalize">{category} API</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {categoryEndpoints.map((endpoint, index) => (
                            <div key={index} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <Badge
                                    className={`${
                                      endpoint.method === "GET"
                                        ? "bg-green-500/10 text-green-400"
                                        : endpoint.method === "POST"
                                          ? "bg-blue-500/10 text-blue-400"
                                          : endpoint.method === "PUT"
                                            ? "bg-yellow-500/10 text-yellow-400"
                                            : "bg-red-500/10 text-red-400"
                                    }`}
                                  >
                                    {endpoint.method}
                                  </Badge>
                                  <code className="text-[#30D5C8]">{endpoint.path}</code>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(endpoint.path)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>

                              <p className="text-gray-300 mb-3">{endpoint.description}</p>

                              {endpoint.parameters && (
                                <div className="mb-3">
                                  <h4 className="text-white font-medium mb-2">Parameters</h4>
                                  <div className="space-y-2">
                                    {endpoint.parameters.map((param, paramIndex) => (
                                      <div
                                        key={paramIndex}
                                        className="flex items-center justify-between p-2 bg-gray-800 rounded"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <code className="text-[#30D5C8]">{param.name}</code>
                                          <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                                            {param.type}
                                          </Badge>
                                          {param.required && (
                                            <Badge className="bg-red-500/10 text-red-400 text-xs">required</Badge>
                                          )}
                                        </div>
                                        <span className="text-gray-400 text-sm">{param.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <h4 className="text-white font-medium mb-2">Response Example</h4>
                                <div className="bg-gray-800 p-3 rounded-lg overflow-x-auto">
                                  <pre className="text-[#30D5C8] text-sm">{endpoint.example.response}</pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="examples" className="mt-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">Code Examples</CardTitle>
                        <CardDescription className="text-gray-400">
                          Ready-to-use code examples in multiple languages
                        </CardDescription>
                      </div>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-700">
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="curl">cURL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">Authentication</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].auth)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-[#30D5C8] text-sm">
                          {codeExamples[selectedLanguage as keyof typeof codeExamples].auth}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">Making Requests</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(codeExamples[selectedLanguage as keyof typeof codeExamples].request)
                          }
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-[#30D5C8] text-sm">
                          {codeExamples[selectedLanguage as keyof typeof codeExamples].request}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="errors" className="mt-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Error Handling</CardTitle>
                    <CardDescription className="text-gray-400">
                      Understanding API error responses and status codes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">HTTP Status Codes</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-green-500/10 text-green-400">200</Badge>
                            <span className="text-gray-300">OK</span>
                          </div>
                          <span className="text-gray-400 text-sm">Request successful</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-red-500/10 text-red-400">400</Badge>
                            <span className="text-gray-300">Bad Request</span>
                          </div>
                          <span className="text-gray-400 text-sm">Invalid request parameters</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-red-500/10 text-red-400">401</Badge>
                            <span className="text-gray-300">Unauthorized</span>
                          </div>
                          <span className="text-gray-400 text-sm">Invalid or missing API key</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-red-500/10 text-red-400">429</Badge>
                            <span className="text-gray-300">Rate Limited</span>
                          </div>
                          <span className="text-gray-400 text-sm">Too many requests</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-red-500/10 text-red-400">500</Badge>
                            <span className="text-gray-300">Server Error</span>
                          </div>
                          <span className="text-gray-400 text-sm">Internal server error</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Error Response Format</h3>
                      <div className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
                        <pre className="text-[#30D5C8] text-sm">
                          {`{
  "success": false,
  "error": "Invalid API key",
  "code": "INVALID_API_KEY",
  "details": {
    "message": "The provided API key is invalid or expired",
    "timestamp": "2024-01-07T14:30:00Z"
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
