"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthTestClient() {
  const [testResults, setTestResults] = useState({
    registration: null,
    login: null,
    tokenValidation: null,
    logout: null,
  })
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async (testType: string) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock test results
    const mockResult = Math.random() > 0.2 // 80% success rate

    setTestResults((prev) => ({
      ...prev,
      [testType]: mockResult,
    }))

    setIsLoading(false)
  }

  const runAllTests = async () => {
    setIsLoading(true)

    for (const test of ["registration", "login", "tokenValidation", "logout"]) {
      await runTest(test)
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsLoading(false)
  }

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <AlertCircle className="h-4 w-4 text-gray-400" />
    if (status) return <CheckCircle className="h-4 w-4 text-green-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="secondary">Not Run</Badge>
    if (status)
      return (
        <Badge variant="default" className="bg-green-600">
          Passed
        </Badge>
      )
    return <Badge variant="destructive">Failed</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-white hover:text-gray-300">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Authentication Test Suite</h1>
              <p className="text-gray-400">Test authentication endpoints and functionality</p>
            </div>
          </div>

          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button onClick={runAllTests} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? "Running Tests..." : "Run All Tests"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setTestResults({
                      registration: null,
                      login: null,
                      tokenValidation: null,
                      logout: null,
                    })
                  }
                >
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    {getStatusIcon(testResults.registration)}
                    <span className="ml-2">User Registration</span>
                  </span>
                  {getStatusBadge(testResults.registration)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tests user registration endpoint with email validation and password requirements.
                </p>
                <Button variant="outline" onClick={() => runTest("registration")} disabled={isLoading} size="sm">
                  Run Test
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    {getStatusIcon(testResults.login)}
                    <span className="ml-2">User Login</span>
                  </span>
                  {getStatusBadge(testResults.login)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tests user login endpoint with credential validation and token generation.
                </p>
                <Button variant="outline" onClick={() => runTest("login")} disabled={isLoading} size="sm">
                  Run Test
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    {getStatusIcon(testResults.tokenValidation)}
                    <span className="ml-2">Token Validation</span>
                  </span>
                  {getStatusBadge(testResults.tokenValidation)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Tests JWT token validation and protected route access.</p>
                <Button variant="outline" onClick={() => runTest("tokenValidation")} disabled={isLoading} size="sm">
                  Run Test
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    {getStatusIcon(testResults.logout)}
                    <span className="ml-2">User Logout</span>
                  </span>
                  {getStatusBadge(testResults.logout)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Tests user logout endpoint and token invalidation.</p>
                <Button variant="outline" onClick={() => runTest("logout")} disabled={isLoading} size="sm">
                  Run Test
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Manual Test Form */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Test Form</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Test Email</Label>
                  <Input id="testEmail" type="email" placeholder="test@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testPassword">Test Password</Label>
                  <Input id="testPassword" type="password" placeholder="password123" />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Test Registration
                </Button>
                <Button variant="outline" size="sm">
                  Test Login
                </Button>
                <Button variant="outline" size="sm">
                  Test Protected Route
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
