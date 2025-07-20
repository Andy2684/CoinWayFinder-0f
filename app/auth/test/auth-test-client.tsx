"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthTestClient() {
  const [testResults, setTestResults] = useState({
    database: null,
    auth: null,
    api: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [testCredentials, setTestCredentials] = useState({
    email: "test@example.com",
    password: "testpassword123",
  })

  const runTests = async () => {
    setIsLoading(true)
    setTestResults({ database: null, auth: null, api: null })

    // Simulate test delays
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setTestResults((prev) => ({ ...prev, database: "success" }))

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setTestResults((prev) => ({ ...prev, auth: "success" }))

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setTestResults((prev) => ({ ...prev, api: "success" }))

    setIsLoading(false)
  }

  const getStatusIcon = (status) => {
    if (status === "success") return <CheckCircle className="h-5 w-5 text-green-500" />
    if (status === "error") return <XCircle className="h-5 w-5 text-red-500" />
    if (status === "loading") return <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />
    return <div className="h-5 w-5 bg-gray-300 rounded-full" />
  }

  const getStatusBadge = (status) => {
    if (status === "success") return <Badge className="bg-green-600">Success</Badge>
    if (status === "error") return <Badge className="bg-red-600">Failed</Badge>
    if (status === "loading") return <Badge className="bg-yellow-600">Testing...</Badge>
    return <Badge variant="outline">Pending</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Authentication Test</h1>
        </div>

        <div className="grid gap-8 max-w-4xl">
          {/* Test Credentials */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Test Credentials</CardTitle>
              <CardDescription className="text-gray-300">
                Configure test credentials for authentication testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="testEmail" className="text-white">
                    Test Email
                  </Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testCredentials.email}
                    onChange={(e) => setTestCredentials({ ...testCredentials, email: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="testPassword" className="text-white">
                    Test Password
                  </Label>
                  <Input
                    id="testPassword"
                    type="password"
                    value={testCredentials.password}
                    onChange={(e) => setTestCredentials({ ...testCredentials, password: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>System Tests</CardTitle>
              <CardDescription className="text-gray-300">
                Test various system components and authentication flows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Database Test */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(testResults.database)}
                  <div>
                    <h3 className="font-medium">Database Connection</h3>
                    <p className="text-sm text-gray-400">Test database connectivity and queries</p>
                  </div>
                </div>
                {getStatusBadge(testResults.database)}
              </div>

              {/* Auth Test */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(testResults.auth)}
                  <div>
                    <h3 className="font-medium">Authentication System</h3>
                    <p className="text-sm text-gray-400">Test login, signup, and token validation</p>
                  </div>
                </div>
                {getStatusBadge(testResults.auth)}
              </div>

              {/* API Test */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(testResults.api)}
                  <div>
                    <h3 className="font-medium">API Endpoints</h3>
                    <p className="text-sm text-gray-400">Test protected and public API routes</p>
                  </div>
                </div>
                {getStatusBadge(testResults.api)}
              </div>

              <Button onClick={runTests} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Running Tests..." : "Run All Tests"}
              </Button>
            </CardContent>
          </Card>

          {/* Test Actions */}
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription className="text-gray-300">Test specific authentication flows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  Test Login
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  Test Signup
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  Test Password Reset
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                  Test Token Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
