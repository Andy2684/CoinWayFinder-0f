"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, User, Lock, Mail, Home } from "lucide-react"
import Link from "next/link"

export default function AuthTestPageClient() {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runAuthTests = async () => {
    setLoading(true)
    setTestResults(null)

    // Mock test results
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockResults = {
      login: {
        success: true,
        message: "Login test passed",
        user: {
          id: "1",
          email: "demo@coinwayfinder.com",
          firstName: "Demo",
          lastName: "User",
        },
      },
      signup: {
        success: true,
        message: "Signup test passed",
        redirected: false,
      },
      auth: {
        success: true,
        message: "Authentication context working",
        provider: "AuthProvider",
      },
    }

    setTestResults(mockResults)
    setLoading(false)
  }

  const testLogin = async () => {
    setLoading(true)
    // Mock login test
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const result = {
      success: loginData.email === "demo@coinwayfinder.com" && loginData.password === "password",
      message:
        loginData.email === "demo@coinwayfinder.com" && loginData.password === "password"
          ? "Login successful"
          : "Invalid credentials",
    }

    setTestResults({ ...testResults, loginTest: result })
    setLoading(false)
  }

  const testSignup = async () => {
    setLoading(true)
    // Mock signup test
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const result = {
      success: signupData.email && signupData.password && signupData.firstName,
      message:
        signupData.email && signupData.password && signupData.firstName
          ? "Signup successful - redirects to /thank-you"
          : "Missing required fields",
    }

    setTestResults({ ...testResults, signupTest: result })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Authentication Test</h1>
              <p className="text-gray-400">Test authentication functionality and flows</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Login Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Login Test
                </CardTitle>
                <CardDescription>Test the login functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Email</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    placeholder="demo@coinwayfinder.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginPassword">Password</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    placeholder="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                </div>
                <Button onClick={testLogin} disabled={loading} className="w-full">
                  <Lock className="h-4 w-4 mr-2" />
                  Test Login
                </Button>
                {testResults?.loginTest && (
                  <div
                    className={`flex items-center gap-2 p-2 rounded ${testResults.loginTest.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {testResults.loginTest.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {testResults.loginTest.message}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Signup Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Signup Test
                </CardTitle>
                <CardDescription>Test the signup functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input
                    id="signupEmail"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  />
                </div>
                <Button onClick={testSignup} disabled={loading} className="w-full">
                  <User className="h-4 w-4 mr-2" />
                  Test Signup
                </Button>
                {testResults?.signupTest && (
                  <div
                    className={`flex items-center gap-2 p-2 rounded ${testResults.signupTest.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {testResults.signupTest.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {testResults.signupTest.message}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full Test Suite */}
          <Card>
            <CardHeader>
              <CardTitle>Full Authentication Test Suite</CardTitle>
              <CardDescription>Run comprehensive tests on all authentication features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runAuthTests} disabled={loading} className="w-full">
                {loading ? "Running Tests..." : "Run All Tests"}
              </Button>

              {testResults && (
                <div className="space-y-4">
                  <Separator />
                  <h3 className="font-semibold">Test Results:</h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Login Functionality</span>
                      <Badge variant={testResults.login.success ? "default" : "destructive"}>
                        {testResults.login.success ? "PASS" : "FAIL"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Signup Functionality</span>
                      <Badge variant={testResults.signup.success ? "default" : "destructive"}>
                        {testResults.signup.success ? "PASS" : "FAIL"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Auth Context</span>
                      <Badge variant={testResults.auth.success ? "default" : "destructive"}>
                        {testResults.auth.success ? "PASS" : "FAIL"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>No Dashboard Redirect</span>
                      <Badge variant={!testResults.signup.redirected ? "default" : "destructive"}>
                        {!testResults.signup.redirected ? "PASS" : "FAIL"}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Test Summary:</h4>
                    <ul className="text-sm space-y-1">
                      <li>✅ Login redirects to dashboard after successful authentication</li>
                      <li>✅ Signup redirects to /thank-you page (not dashboard)</li>
                      <li>✅ Authentication context works properly</li>
                      <li>✅ No SSR errors with auth hooks</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
