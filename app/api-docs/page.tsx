"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Code, Zap, Shield, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"
import requests from "requests"

export default function ApiDocsPage() {
  const API_BASE = "https://coinwayfinder.com/api/v1"
  const API_KEY = "your_key_id:your_secret_key"

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  }

  const getWhaleTransactions = (token = "BTC", min_value = 1000000) => {
    const url = `${API_BASE}/whales`
    const params = {
      token: token,
      min_value: min_value,
      limit: 10,
    }

    const response = requests.get(url, { headers: headers, params: params })

    if (response.status_code === 200) {
      const data = response.json()
      data.data.forEach((whale) => {
        console.log(`Whale moved ${whale.amount} ${whale.token} worth $${whale.usdValue.toLocaleString()}`)
      })
    } else {
      console.error(`Error: ${response.status_code} - ${response.text}`)
    }
  }

  const getMarketTrends = () => {
    const url = `${API_BASE}/trends`
    const response = requests.get(url, { headers: headers })

    if (response.status_code === 200) {
      const data = response.json()
      data.data.forEach((trend) => {
        console.log(`${trend.symbol}: ${trend.trend} (Sentiment: ${trend.sentiment})`)
      })
    } else {
      console.error(`Error: ${response.status_code} - ${response.text}`)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">CoinWayFinder API</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Powerful REST API for crypto trading signals, whale tracking, market analysis, and bot management
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button asChild>
            <Link href="/dashboard">Get API Key</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="#quickstart">Quick Start</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle>Real-time Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access live trading signals, whale movements, and market trends as they happen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-green-500 mb-2" />
            <CardTitle>Secure & Reliable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Enterprise-grade security with rate limiting, authentication, and 99.9% uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
            <CardTitle>AI-Powered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Machine learning algorithms analyze market data to provide high-confidence signals
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>Everything you need to know to get started with the CoinWayFinder API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Base URL</h4>
                <code className="bg-muted px-3 py-2 rounded block">https://coinwayfinder.com/api/v1</code>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Response Format</h4>
                <p className="text-sm text-muted-foreground mb-2">All responses are in JSON format:</p>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  {`{
  "success": true,
  "data": [...],
  "meta": {
    "total": 10,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Rate Limits</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border rounded p-3 text-center">
                    <div className="font-bold text-lg">Free</div>
                    <div className="text-sm text-muted-foreground">10/min</div>
                  </div>
                  <div className="border rounded p-3 text-center">
                    <div className="font-bold text-lg">Starter</div>
                    <div className="text-sm text-muted-foreground">30/min</div>
                  </div>
                  <div className="border rounded p-3 text-center">
                    <div className="font-bold text-lg">Pro</div>
                    <div className="text-sm text-muted-foreground">100/min</div>
                  </div>
                  <div className="border rounded p-3 text-center">
                    <div className="font-bold text-lg">Enterprise</div>
                    <div className="text-sm text-muted-foreground">500/min</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="quickstart">
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Get up and running in minutes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Get your API key</p>
                    <p className="text-sm text-muted-foreground">
                      Sign up for a plan and generate your API key in the dashboard
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Make your first request</p>
                    <p className="text-sm text-muted-foreground">Use the key to authenticate and fetch trading signals</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Build your application</p>
                    <p className="text-sm text-muted-foreground">
                      Integrate signals, whale data, and bot management into your app
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Code className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test it now:</strong> Use our interactive examples in the Examples tab to try the API without
                  writing code.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Secure your API requests with proper authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">API Key Format</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Your API key consists of two parts: Key ID and Secret Key
                </p>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium">Key ID:</span>
                    <code className="bg-muted px-2 py-1 rounded text-sm block">cwf_1234567890abcdef1234567890abcdef</code>
                  </div>
                  <div>
                    <span className="text-xs font-medium">Secret Key:</span>
                    <code className="bg-muted px-2 py-1 rounded text-sm block">
                      abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab
                    </code>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Authorization Header</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Include your API key in the Authorization header as a Bearer token:
                </p>
                <code className="bg-muted px-3 py-2 rounded block text-sm">
                  Authorization: Bearer your_key_id:your_secret_key
                </code>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Keep your secret key safe!</strong> Never expose it in client-side code or public
                  repositories. The secret key is only shown once when created.
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-2">Error Responses</h4>
                <div className="space-y-2">
                  <div className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">401</Badge>
                      <span className="font-medium">Unauthorized</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Missing or invalid API key</p>
                  </div>

                  <div className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">403</Badge>
                      <span className="font-medium">Forbidden</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Insufficient permissions for this endpoint</p>
                  </div>

                  <div className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">429</Badge>
                      <span className="font-medium">Rate Limited</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Too many requests, check rate limits</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Trading Signals
                </CardTitle>
                <CardDescription>Get AI-powered trading signals with confidence scores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/v1/signals</code>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Query Parameters</h5>
                  <div className="space-y-1 text-sm">
                    <div>
                      <code>pair</code> - Filter by trading pair (e.g., BTC, ETH)
                    </div>
                    <div>
                      <code>timeframe</code> - Filter by timeframe (1m, 5m, 15m, 1h, 4h, 1d)
                    </div>
                    <div>
                      <code>limit</code> - Number of signals to return (default: 10, max: 100)
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Example Response</h5>
                  <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                    {`{
  "success": true,
  "data": [
    {
      "id": "signal_001",
      "pair": "BTC/USDT",
      "signal": "LONG",
      "confidence": 85,
      "timeframe": "15m",
      "entry": 43250.5,
      "targets": [43800, 44200, 44600],
      "stopLoss": 42800,
      "timestamp": "2024-01-15T10:30:00Z",
      "source": "AI_ANALYSIS",
      "indicators": {
        "rsi": 65.2,
        "macd": "bullish",
        "volume": "high"
      }
    }
  ],
  "meta": {
    "total": 1,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Whale Transactions</CardTitle>
                <CardDescription>Track large cryptocurrency movements and whale activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/v1/whales</code>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Query Parameters</h5>
                  <div className="space-y-1 text-sm">
                    <div>
                      <code>token</code> - Filter by token (BTC, ETH, USDT, etc.)
                    </div>
                    <div>
                      <code>min_value</code> - Minimum USD value of transactions
                    </div>
                    <div>
                      <code>limit</code> - Number of transactions to return (default: 20, max: 100)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>Get comprehensive market analysis and trend data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code className="text-sm">/api/v1/trends</code>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Query Parameters</h5>
                  <div className="space-y-1 text-sm">
                    <div>
                      <code>symbol</code> - Filter by cryptocurrency symbol
                    </div>
                    <div>
                      <code>trend</code> - Filter by trend direction (bullish, bearish, neutral)
                    </div>
                    <div>
                      <code>limit</code> - Number of trends to return (default: 50, max: 100)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trading Bots</CardTitle>
                <CardDescription>Manage your automated trading bots programmatically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">GET</Badge>
                    <code className="text-sm">/api/v1/bots</code>
                    <span className="text-xs text-muted-foreground">- List all bots</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">POST</Badge>
                    <code className="text-sm">/api/v1/bots</code>
                    <span className="text-xs text-muted-foreground">- Create new bot</span>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium mb-2">Required Permissions</h5>
                  <div className="flex gap-2">
                    <Badge variant="secondary">bots:read</Badge>
                    <Badge variant="secondary">bots:create</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>Ready-to-use code snippets in popular programming languages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="javascript" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                </TabsList>

                <TabsContent value="javascript">
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    {`// Get trading signals
fetch('https://coinwayfinder.com/api/v1/signals?pair=BTC&limit=5', {
  headers: {
    'Authorization': 'Bearer your_key_id:your_secret_key',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    data.data.forEach(signal => {
      console.log(\`\${signal.pair}: \${signal.signal} (Confidence: \${signal.confidence}%)\`);
    });
  } else {
    console.error('API Error:', data.error);
  }
})
.catch(error => console.error('Error:', error));

// Create a trading bot
const botData = {
  name: 'My BTC DCA Bot',
  exchange: 'binance',
  strategy: 'dca',
  symbol: 'BTCUSDT',
  config: {
    investment: 100,
    riskLevel: 5,
    takeProfit: 2,
    stopLoss: 1
  }
};

fetch('https://coinwayfinder.com/api/v1/bots', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_key_id:your_secret_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(botData)
})
.then(response => response.json())
.then(bot => console.log('Bot created:', bot.data.id))
.catch(error => console.error('Error:', error));`}
                  </pre>
                </TabsContent>

                <TabsContent value="python">
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    {`import requests

# Configuration
API_BASE = 'https://coinwayfinder.com/api/v1'
API_KEY = 'your_key_id:your_secret_key'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Get whale transactions
def get_whale_transactions(token='BTC', min_value=1000000):
    url = f'{API_BASE}/whales'
    params = {
        'token': token,
        'min_value': min_value,
        'limit': 10
    }
    
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        data = response.json()
        for whale in data['data']:
            print(f"Whale moved {whale['amount']} {whale['token\']} worth ${whale['usdValue\']:,}")\
    else:\
        print(f"Error: {response.status_code} - {response.text}")
\
# Get market trends
def get_market_trends():
    url = f'{API_BASE}/trends'
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        for trend in data['data']:
            print(f"{trend['symbol']}: {trend['trend']} (Sentiment: {trend['sentiment']})")
    else:
        print(f"Error: {response.status_code} - {response.text}")

# Run examples
get_whale_transactions()
get_market_trends()`}
                  </pre>
                </TabsContent>

                <TabsContent value="curl">
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    {`# Get trading signals
curl -X GET "https://coinwayfinder.com/api/v1/signals?pair=BTC&timeframe=1h" \\
  -H "Authorization: Bearer your_key_id:your_secret_key" \\
  -H "Content-Type: application/json"

# Get whale transactions for Ethereum
curl -X GET "https://coinwayfinder.com/api/v1/whales?token=ETH&min_value=5000000" \\
  -H "Authorization: Bearer your_key_id:your_secret_key" \\
  -H "Content-Type: application/json"

# Create a new trading bot
curl -X POST "https://coinwayfinder.com/api/v1/bots" \\
  -H "Authorization: Bearer your_key_id:your_secret_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "ETH Scalping Bot",
    "exchange": "binance",
    "strategy": "scalping",
    "symbol": "ETHUSDT",
    "config": {
      "investment": 500,
      "riskLevel": 7,
      "takeProfit": 1.5,
      "stopLoss": 0.8
    }
  }'

# Get all your bots
curl -X GET "https://coinwayfinder.com/api/v1/bots" \\
  -H "Authorization: Bearer your_key_id:your_secret_key" \\
  -H "Content-Type: application/json"`}
                  </pre>
                </TabsContent>

                <TabsContent value="php">
                  <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                    {`<?php

class CoinWayFinderAPI {
    private $baseUrl = 'https://coinwayfinder.com/api/v1';
    private $apiKey;
    
    public function __construct($keyId, $secretKey) {
        $this->apiKey = $keyId . ':' . $secretKey;
    }
    
    private function makeRequest($endpoint, $method = 'GET', $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        if ($method === 'POST' && $data) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [
            'status' => $httpCode,
            'data' => json_decode($response, true)
        ];
    }
    
    public function getSignals($pair = null, $timeframe = null, $limit = 10) {
        $params = [];
        if ($pair) $params['pair'] = $pair;
        if ($timeframe) $params['timeframe'] = $timeframe;
        if ($limit) $params['limit'] = $limit;
        
        $query = http_build_query($params);
        $endpoint = '/signals' . ($query ? '?' . $query : '');
        
        return $this->makeRequest($endpoint);
    }
    
    public function createBot($name, $exchange, $strategy, $symbol, $config) {
        $data = [
            'name' => $name,
            'exchange' => $exchange,
            'strategy' => $strategy,
            'symbol' => $symbol,
            'config' => $config
        ];
        
        return $this->makeRequest('/bots', 'POST', $data);
    }
}

// Usage example
$api = new CoinWayFinderAPI('your_key_id', 'your_secret_key');

// Get BTC signals
$signals = $api->getSignals('BTC', '1h', 5);
if ($signals['status'] === 200) {
    foreach ($signals['data']['data'] as $signal) {
        echo $signal['pair'] . ': ' . $signal['signal'] . ' (Confidence: ' . $signal['confidence'] . "%)\\n";
    }
}

// Create a bot
$botConfig = [
    'investment' => 200,
    'riskLevel' => 6,
    'takeProfit' => 2.5,
    'stopLoss' => 1.2
];

$result = $api->createBot('PHP Bot', 'binance', 'dca', 'BTCUSDT', $botConfig);
if ($result['status'] === 200) {
    echo "Bot created successfully: " . $result['data']['data']['id'] . "\\n";
}

?>`}
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Pricing Plans</CardTitle>
              <CardDescription>Choose the plan that fits your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="border rounded-lg p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">Free</h3>
                  <div className="text-3xl font-bold mb-4">$0</div>
                  <div className="space-y-2 text-sm">
                    <div>10 requests/minute</div>
                    <div>100 requests/hour</div>
                    <div>1,000 requests/day</div>
                    <div>Basic signals only</div>
                  </div>
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    Current Plan
                  </Button>
                </div>

                <div className="border rounded-lg p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">Starter</h3>
                  <div className="text-3xl font-bold mb-4">$29</div>
                  <div className="space-y-2 text-sm">
                    <div>30 requests/minute</div>
                    <div>500 requests/hour</div>
                    <div>5,000 requests/day</div>
                    <div>Signals + Whales + Trends</div>
                  </div>
                  <Button className="w-full mt-4">Upgrade</Button>
                </div>

                <div className="border-2 border-primary rounded-lg p-6 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Pro</h3>
                  <div className="text-3xl font-bold mb-4">$99</div>
                  <div className="space-y-2 text-sm">
                    <div>100 requests/minute</div>
                    <div>2,000 requests/hour</div>
                    <div>20,000 requests/day</div>
                    <div>All endpoints + Bot management</div>
                  </div>
                  <Button className="w-full mt-4">Upgrade</Button>
                </div>

                <div className="border rounded-lg p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">Enterprise</h3>
                  <div className="text-3xl font-bold mb-4">$299</div>
                  <div className="space-y-2 text-sm">
                    <div>500 requests/minute</div>
                    <div>10,000 requests/hour</div>
                    <div>100,000 requests/day</div>
                    <div>All features + Priority support</div>
                  </div>
                  <Button className="w-full mt-4">Contact Sales</Button>
                </div>
              </div>

              <Alert className="mt-6">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  All plans include SSL encryption, 99.9% uptime SLA, and comprehensive documentation. Enterprise
                  customers get dedicated support and custom rate limits.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
