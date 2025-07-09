"use client"

import { Label } from "@/components/ui/label"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Code, Zap, Shield, TrendingUp, Activity } from "lucide-react"
import Link from "next/link"

export default function ApiDocsPage() {
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
                    <Label className="text-xs font-medium">Key ID:</Label>
                    <code className="bg-muted px-2 py-1 rounded text-sm block">cwf_1234567890abcdef1234567890abcdef</code>
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Secret Key:</Label>
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

            <Card>\
