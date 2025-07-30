"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, CheckCircle, XCircle } from "lucide-react"

interface TestEmailFormData {
  type: string
  email: string
  name?: string
  token?: string
  subject?: string
  html?: string
  text?: string
  symbol?: string
  price?: number
  change?: number
  alertType?: string
  message?: string
  exchange?: string
}

export function TestEmailForm() {
  const [formData, setFormData] = useState<TestEmailFormData>({
    type: "welcome",
    email: "",
    name: "Test User",
    token: "test-token-123",
    subject: "Test Email from CoinWayFinder",
    html: "<h1>Test Email</h1><p>This is a test email from CoinWayFinder.</p>",
    text: "This is a test email from CoinWayFinder.",
    symbol: "BTC/USD",
    price: 45000,
    change: 5.2,
    alertType: "price_target",
    message: "Bitcoin has reached your target price!",
    exchange: "Binance",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null)

  const handleInputChange = (field: keyof TestEmailFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: "Failed to send test email",
        details: error,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const emailTypes = [
    { value: "welcome", label: "Welcome Email" },
    { value: "verification", label: "Email Verification" },
    { value: "password-reset", label: "Password Reset" },
    { value: "trading-alert", label: "Trading Alert" },
    { value: "custom", label: "Custom Email" },
  ]

  const alertTypes = [
    { value: "price_target", label: "Price Target" },
    { value: "stop_loss", label: "Stop Loss" },
    { value: "take_profit", label: "Take Profit" },
    { value: "volume_spike", label: "Volume Spike" },
    { value: "news_sentiment", label: "News Sentiment" },
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Test Email System
        </CardTitle>
        <CardDescription>Send test emails to verify your email configuration and templates</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type">Email Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select email type" />
              </SelectTrigger>
              <SelectContent>
                {emailTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Recipient Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="test@example.com"
              required
            />
          </div>

          {/* Conditional Fields Based on Email Type */}
          {formData.type === "welcome" && (
            <div className="space-y-2">
              <Label htmlFor="name">User Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Test User"
              />
            </div>
          )}

          {(formData.type === "verification" || formData.type === "password-reset") && (
            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Input
                id="token"
                value={formData.token || ""}
                onChange={(e) => handleInputChange("token", e.target.value)}
                placeholder="test-token-123"
              />
            </div>
          )}

          {formData.type === "trading-alert" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  value={formData.symbol || ""}
                  onChange={(e) => handleInputChange("symbol", e.target.value)}
                  placeholder="BTC/USD"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value))}
                  placeholder="45000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="change">Change %</Label>
                <Input
                  id="change"
                  type="number"
                  step="0.1"
                  value={formData.change || ""}
                  onChange={(e) => handleInputChange("change", Number.parseFloat(e.target.value))}
                  placeholder="5.2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exchange">Exchange</Label>
                <Input
                  id="exchange"
                  value={formData.exchange || ""}
                  onChange={(e) => handleInputChange("exchange", e.target.value)}
                  placeholder="Binance"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="alertType">Alert Type</Label>
                <Select value={formData.alertType} onValueChange={(value) => handleInputChange("alertType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select alert type" />
                  </SelectTrigger>
                  <SelectContent>
                    {alertTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="message">Alert Message</Label>
                <Textarea
                  id="message"
                  value={formData.message || ""}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Bitcoin has reached your target price!"
                  rows={2}
                />
              </div>
            </div>
          )}

          {formData.type === "custom" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject || ""}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Test Email from CoinWayFinder"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="html">HTML Content</Label>
                <Textarea
                  id="html"
                  value={formData.html || ""}
                  onChange={(e) => handleInputChange("html", e.target.value)}
                  placeholder="<h1>Test Email</h1><p>This is a test email.</p>"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text">Text Content</Label>
                <Textarea
                  id="text"
                  value={formData.text || ""}
                  onChange={(e) => handleInputChange("text", e.target.value)}
                  placeholder="This is a test email from CoinWayFinder."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading || !formData.email} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Test Email...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>

          {/* Result Display */}
          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                  <div className="font-medium">{result.message}</div>
                  {result.details && (
                    <div className="mt-2 text-sm opacity-80">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(result.details, null, 2)}</pre>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
