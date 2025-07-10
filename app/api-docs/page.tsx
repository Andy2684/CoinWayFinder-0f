"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Code, Key, Zap, Shield, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState("bots")
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    })
  }

  const endpoints = {
    bots: {
      title: "Trading Bots",
      description: "Manage your automated trading bots",
      methods: ["GET", "POST", "PUT", "DELETE"],
      examples: {
        javascript: `// Get all bots
const response = await fetch('/api/bots', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const bots = await response.json();

// Create a new bot
const newBot = await fetch('/api/bots', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My DCA Bot',
    strategy: 'dca',
    config: {
      symbol: 'BTCUSDT',
      amount: 100,
      interval: '1h'
    }
  })
});`,
        python: `import requests

# Get all bots
response = requests.get(
    'https://api.coinwayfinder.com/api/bots',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    }
)
bots = response.json()

# Create a new bot
new_bot = requests.post(
    'https://api.coinwayfinder.com/api/bots',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    json={
        'name': 'My DCA Bot',
        'strategy': 'dca',
        'config': {
            'symbol': 'BTCUSDT',
            'amount': 100,
            'interval': '1h'
        }
    }
)`,
        curl: `# Get all bots
curl -X GET "https://api.coinwayfinder.com/api/bots" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"

# Create a new bot
curl -X POST "https://api.coinwayfinder.com/api/bots" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My DCA Bot",
    "strategy": "dca",
    "config": {
      "symbol": "BTCUSDT",
      "amount": 100,
      "interval": "1h"
    }
  }'`,
      },
    },
    signals: {
      title: "Trading Signals",
      description: "Access AI-powered trading signals",
      methods: ["GET"],
      examples: {
        javascript: `// Get trading signals
const signals = await fetch('/api/v1/signals', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const data = await signals.json();`,
        python: `import requests

signals = requests.get(
    'https://api.coinwayfinder.com/api/v1/signals',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
data = signals.json()`,
        curl: `curl -X GET "https://api.coinwayfinder.com/api/v1/signals" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      },
    },
    whales: {
      title: "Whale Movements",
      description: "Track large cryptocurrency transactions",
      methods: ["GET"],
      examples: {
        javascript: `// Get whale movements
const whales = await fetch('/api/v1/whales', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const movements = await whales.json();`,
        python: `import requests

whales = requests.get(
    'https://api.coinwayfinder.com/api/v1/whales',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
movements = whales.json()`,
        curl: `curl -X GET "https://api.coinwayfinder.com/api/v1/whales" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      },
    },
    trends: {
      title: "Market Trends",
      description: "Get real-time market trend analysis",
      methods: ["GET"],
      examples: {
        javascript: `// Get market trends
const trends = await fetch('/api/v1/trends', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});
const analysis = await trends.json();`,
        python: `import requests

trends = requests.get(
    'https://api.coinwayfinder.com/api/v1/trends',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
analysis = trends.json()`,
        curl: `curl -X GET "https://api.coinwayfinder.com/api/v1/trends" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">API Documentation</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Integrate CoinWayFinder's powerful trading APIs into your applications
          </p>
        </div>

        {/* Quick Start */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-teal-400" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <Key className="w-8 h-8 text-teal-400 mx-auto mb-2" />
                <h3 className="text-white font-medium mb-1">1. Get API Key</h3>
                <p className="text-slate-400 text-sm">Generate your API key in the dashboard</p>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <Code className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-medium mb-1">2. Make Requests</h3>
                <p className="text-slate-400 text-sm">Use your API key to authenticate requests</p>
              </div>
              <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-medium mb-1">3. Stay Secure</h3>
                <p className="text-slate-400 text-sm">Keep your API key secure and private</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main API Documentation */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="bg-slate-800/50 border-slate-700 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(endpoints).map(([key, endpoint]) => (
                <Button
                  key={key}
                  variant={selectedEndpoint === key ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    selectedEndpoint === key
                      ? "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }`}
                  onClick={() => setSelectedEndpoint(key)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {endpoint.title}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Endpoint Details */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">
                    {endpoints[selectedEndpoint as keyof typeof endpoints].title}
                  </CardTitle>
                  <div className="flex space-x-2">
                    {endpoints[selectedEndpoint as keyof typeof endpoints].methods.map((method) => (
                      <Badge key={method} variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/20">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p className="text-slate-400">{endpoints[selectedEndpoint as keyof typeof endpoints].description}</p>
              </CardHeader>
            </Card>

            {/* Code Examples */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Code Examples</CardTitle>
                <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <TabsList className="bg-slate-700/50">
                    <TabsTrigger
                      value="javascript"
                      className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"
                    >
                      JavaScript
                    </TabsTrigger>
                    <TabsTrigger
                      value="python"
                      className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"
                    >
                      Python
                    </TabsTrigger>
                    <TabsTrigger
                      value="curl"
                      className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400"
                    >
                      cURL
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-slate-900/50 p-4 rounded-lg overflow-x-auto text-sm">
                    <code className="text-slate-300">
                      {
                        endpoints[selectedEndpoint as keyof typeof endpoints].examples[
                          selectedLanguage as keyof (typeof endpoints)[keyof typeof endpoints]["examples"]
                        ]
                      }
                    </code>
                  </pre>
                  <Button
                    size="sm"
                    className="absolute top-2 right-2 bg-slate-700 hover:bg-slate-600"
                    onClick={() =>
                      copyToClipboard(
                        endpoints[selectedEndpoint as keyof typeof endpoints].examples[
                          selectedLanguage as keyof (typeof endpoints)[keyof typeof endpoints]["examples"]
                        ],
                      )
                    }
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Authentication */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Authentication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">
                  All API requests require authentication using your API key in the Authorization header:
                </p>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <code className="text-teal-400">Authorization: Bearer YOUR_API_KEY</code>
                </div>
              </CardContent>
            </Card>

            {/* Rate Limits */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Rate Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                    <h3 className="text-white font-medium">Starter</h3>
                    <p className="text-teal-400 text-2xl font-bold">100</p>
                    <p className="text-slate-400 text-sm">requests/hour</p>
                  </div>
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                    <h3 className="text-white font-medium">Pro</h3>
                    <p className="text-teal-400 text-2xl font-bold">1,000</p>
                    <p className="text-slate-400 text-sm">requests/hour</p>
                  </div>
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                    <h3 className="text-white font-medium">Enterprise</h3>
                    <p className="text-teal-400 text-2xl font-bold">10,000</p>
                    <p className="text-slate-400 text-sm">requests/hour</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Handling */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Error Handling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400">
                  The API uses standard HTTP status codes and returns JSON error responses:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                    <code className="text-red-400">400</code>
                    <span className="text-slate-300">Bad Request - Invalid parameters</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                    <code className="text-red-400">401</code>
                    <span className="text-slate-300">Unauthorized - Invalid API key</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                    <code className="text-red-400">429</code>
                    <span className="text-slate-300">Too Many Requests - Rate limit exceeded</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded">
                    <code className="text-red-400">500</code>
                    <span className="text-slate-300">Internal Server Error</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
