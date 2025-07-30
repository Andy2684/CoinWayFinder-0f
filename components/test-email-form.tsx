"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Mail, Send, CheckCircle, XCircle } from "lucide-react"

interface EmailFormData {
  to: string
  type: string
  data: {
    name?: string
    token?: string
    symbol?: string
    currentPrice?: string
    targetPrice?: string
    change?: string
    subject?: string
    title?: string
    content?: string
  }
}

export function TestEmailForm() {
  const [formData, setFormData] = useState<EmailFormData>({
    to: "",
    type: "welcome",
    data: {},
  })
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<any>(null)

  const emailTypes = [
    { value: "welcome", label: "Welcome Email", description: "New user welcome message" },
    { value: "verification", label: "Email Verification", description: "Email address verification" },
    { value: "passwordReset", label: "Password Reset", description: "Password reset instructions" },
    { value: "tradingAlert", label: "Trading Alert", description: "Price alert notification" },
    { value: "custom", label: "Custom Email", description: "Custom email template" },
  ]

  const handleTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      type,
      data: getDefaultDataForType(type),
    }))
  }

  const getDefaultDataForType = (type: string) => {
    switch (type) {
      case "welcome":
        return { name: "John Doe" }
      case "verification":
        return { token: "sample-verification-token-123" }
      case "passwordReset":
        return { token: "sample-reset-token-456" }
      case "tradingAlert":
        return {
          symbol: "BTC/USDT",
          currentPrice: "45000",
          targetPrice: "50000",
          change: "5.2",
        }
      case "custom":
        return {
          subject: "Test Email from CoinWayFinder",
          title: "Test Email",
          content:
            "<h2>Hello!</h2><p>This is a test email from CoinWayFinder platform.</p><p>Everything is working correctly!</p>",
        }
      default:
        return {}
    }
  }

  const updateData = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: value,
      },
    }))
  }

  const sendTestEmail = async () => {
    if (!formData.to) {
      toast.error("Please enter a recipient email address")
      return
    }

    setSending(true)
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

      if (data.success) {
        toast.success("Test email sent successfully!")
      } else {
        toast.error(data.error || "Failed to send test email")
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      toast.error("Network error occurred")
      setResult({
        success: false,
        error: "Network error occurred",
      })
    } finally {
      setSending(false)
    }
  }

  const renderFormFields = () => {
    const selectedType = emailTypes.find((t) => t.value === formData.type)

    switch (formData.type) {
      case "welcome":
        return (
          <div>
            <Label htmlFor="name">Recipient Name</Label>
            <Input
              id="name"
              value={formData.data.name || ""}
              onChange={(e) => updateData("name", e.target.value)}
              placeholder="Enter recipient name"
            />
          </div>
        )

      case "verification":
        return (
          <div>
            <Label htmlFor="token">Verification Token</Label>
            <Input
              id="token"
              value={formData.data.token || ""}
              onChange={(e) => updateData("token", e.target.value)}
              placeholder="Enter verification token"
            />
          </div>
        )

      case "passwordReset":
        return (
          <div>
            <Label htmlFor="token">Reset Token</Label>
            <Input
              id="token"
              value={formData.data.token || ""}
              onChange={(e) => updateData("token", e.target.value)}
              placeholder="Enter reset token"
            />
          </div>
        )

      case "tradingAlert":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="symbol">Trading Symbol</Label>
              <Input
                id="symbol"
                value={formData.data.symbol || ""}
                onChange={(e) => updateData("symbol", e.target.value)}
                placeholder="e.g., BTC/USDT"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentPrice">Current Price</Label>
                <Input
                  id="currentPrice"
                  value={formData.data.currentPrice || ""}
                  onChange={(e) => updateData("currentPrice", e.target.value)}
                  placeholder="45000"
                />
              </div>
              <div>
                <Label htmlFor="targetPrice">Target Price</Label>
                <Input
                  id="targetPrice"
                  value={formData.data.targetPrice || ""}
                  onChange={(e) => updateData("targetPrice", e.target.value)}
                  placeholder="50000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="change">Price Change (%)</Label>
              <Input
                id="change"
                value={formData.data.change || ""}
                onChange={(e) => updateData("change", e.target.value)}
                placeholder="5.2"
              />
            </div>
          </div>
        )

      case "custom":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={formData.data.subject || ""}
                onChange={(e) => updateData("subject", e.target.value)}
                placeholder="Enter email subject"
              />
            </div>
            <div>
              <Label htmlFor="title">Email Title</Label>
              <Input
                id="title"
                value={formData.data.title || ""}
                onChange={(e) => updateData("title", e.target.value)}
                placeholder="Enter email title"
              />
            </div>
            <div>
              <Label htmlFor="content">Email Content (HTML)</Label>
              <Textarea
                id="content"
                rows={6}
                value={formData.data.content || ""}
                onChange={(e) => updateData("content", e.target.value)}
                placeholder="Enter HTML content for the email"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Test Email System
          </CardTitle>
          <CardDescription>Send test emails to verify your email configuration and templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="to">Recipient Email</Label>
                <Input
                  id="to"
                  type="email"
                  value={formData.to}
                  onChange={(e) => setFormData((prev) => ({ ...prev, to: e.target.value }))}
                  placeholder="test@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Email Type</Label>
                <Select value={formData.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select email type" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderFormFields()}

              <Button onClick={sendTestEmail} disabled={sending || !formData.to} className="w-full">
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Email Preview</Label>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="text-sm space-y-2">
                    <div>
                      <strong>To:</strong> {formData.to || "recipient@example.com"}
                    </div>
                    <div>
                      <strong>Type:</strong> {emailTypes.find((t) => t.value === formData.type)?.label}
                    </div>
                    <div>
                      <strong>Data:</strong>
                    </div>
                    <pre className="text-xs bg-background p-2 rounded overflow-auto">
                      {JSON.stringify(formData.data, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {result && (
                <div>
                  <Label>Result</Label>
                  <div
                    className={`p-4 border rounded-lg ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                        {result.success ? "Success" : "Error"}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        <strong>Message:</strong> {result.message}
                      </div>
                      {result.messageId && (
                        <div>
                          <strong>Message ID:</strong> {result.messageId}
                        </div>
                      )}
                      {result.recipient && (
                        <div>
                          <strong>Sent to:</strong> {result.recipient}
                        </div>
                      )}
                      {result.error && (
                        <div>
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                      {result.details && (
                        <div>
                          <strong>Details:</strong> {result.details}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>How to use the test email API programmatically</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Endpoint</Label>
              <code className="block p-2 bg-muted rounded text-sm">POST /api/test-email</code>
            </div>

            <div>
              <Label>Request Body Example</Label>
              <pre className="p-4 bg-muted rounded text-sm overflow-auto">
                {`{
  "to": "recipient@example.com",
  "type": "welcome",
  "data": {
    "name": "John Doe"
  }
}`}
              </pre>
            </div>

            <div>
              <Label>Available Email Types</Label>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {emailTypes.map((type) => (
                  <li key={type.value}>
                    <strong>{type.value}:</strong> {type.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
