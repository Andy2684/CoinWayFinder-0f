"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react"

export function EmailTester() {
  const [emailType, setEmailType] = useState("custom")
  const [toEmail, setToEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSendTestEmail = async () => {
    if (!toEmail) {
      setResult({ success: false, message: "Please enter recipient email" })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      let response

      if (emailType === "verification") {
        response = await fetch("/api/test/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: toEmail, firstName: "Test User" }),
        })
      } else if (emailType === "reset") {
        response = await fetch("/api/test/send-reset-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: toEmail, firstName: "Test User" }),
        })
      } else if (emailType === "welcome") {
        response = await fetch("/api/test/send-welcome-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: toEmail, firstName: "Test User" }),
        })
      } else {
        response = await fetch("/api/test/send-custom-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: toEmail, subject, message }),
        })
      }

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message || "Email sent successfully!" })
      } else {
        setResult({ success: false, message: data.error || "Failed to send email" })
      }
    } catch (error) {
      setResult({ success: false, message: "Network error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Tester
        </CardTitle>
        <CardDescription>Test email functionality with project.command.center@gmail.com</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="emailType">Email Type</Label>
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger>
              <SelectValue placeholder="Select email type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="verification">Email Verification</SelectItem>
              <SelectItem value="reset">Password Reset</SelectItem>
              <SelectItem value="welcome">Welcome Email</SelectItem>
              <SelectItem value="custom">Custom Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toEmail">Recipient Email</Label>
          <Input
            id="toEmail"
            type="email"
            placeholder="Enter recipient email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
          />
        </div>

        {emailType === "custom" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter email message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
            </div>
          </>
        )}

        {result && (
          <Alert className={result.success ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <AlertDescription className={result.success ? "text-green-300" : "text-red-300"}>
              {result.message}
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSendTestEmail} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Send className="mr-2 h-4 w-4 animate-pulse" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Test Email
            </>
          )}
        </Button>

        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium mb-2">📧 Email Configuration:</p>
          <p>• Sender: project.command.center@gmail.com</p>
          <p>• SMTP Host: {process.env.SMTP_HOST || "smtp.gmail.com"}</p>
          <p>• Make sure SMTP_USER and SMTP_PASS are configured in your environment</p>
        </div>
      </CardContent>
    </Card>
  )
}
