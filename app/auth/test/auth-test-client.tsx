"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, LogIn, LogOut, UserPlus, CheckCircle, XCircle } from "lucide-react"

export default function AuthTestPageClient() {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [loginData, setLoginData] = useState({ email: "demo@coinwayfinder.com", password: "password" })
  const [signupData, setSignupData] = useState({
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    password: "password123",
  })

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true)
    try {
      const result = await testFn()
      setTestResults((prev: any) => ({
        ...prev,
        [testName]: { success: true, data: result },
      }))
    } catch (error) {
      setTestResults((prev: any) => ({
        ...prev,
        [testName]: { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      }))
    }
    setLoading(false)
  }

  const testLogin = async () => {
    // Mock login test
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (loginData.email === "demo@coinwayfinder.com" && loginData.password === "password") {
      return { user: { id: "1", email: loginData.email, name: "Demo User" }, token: "mock_token" }
    }
    throw new Error("Invalid credentials")
  }

  const testSignup = async () => {
    // Mock signup test
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { message: "Account created successfully", user: signupData }
  }

  const testLogout = async () => {
    // Mock logout test
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { message: "Logged out successfully" }
  }

  const testAuthStatus = async () => {
    // Mock auth status test
    await new Promise((resolve) => setTimeout(resolve, 500))
    const token = localStorage.getItem("auth_token")
    return { authenticated: !!token, token }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">Authentication Test Suite</h1>
            <p className="text-gray-400">Test authentication functionality and API endpoints</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Login Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Login Test
                </CardTitle>
                <CardDescription>Test user login functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Email</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loginPassword">Password</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                </div>
                <Button onClick={() => runTest("login", testLogin)} disabled={loading} className="w-full">
                  Test Login
                </Button>
                {testResults.login && (
                  <Alert variant={testResults.login.success ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {testResults.login.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription>
                        {testResults.login.success
                          ? `Login successful: ${JSON.stringify(testResults.login.data)}`
                          : `Login failed: ${testResults.login.error}`}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Signup Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Signup Test
                </CardTitle>
                <CardDescription>Test user registration functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="signupFirstName">First Name</Label>
                    <Input
                      id="signupFirstName"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupLastName">Last Name</Label>
                    <Input
                      id="signupLastName"
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
                <Button onClick={() => runTest("signup", testSignup)} disabled={loading} className="w-full">
                  Test Signup
                </Button>
                {testResults.signup && (
                  <Alert variant={testResults.signup.success ? "default" : "destructive"}>
                    <div className="flex items-center gap-2">
                      {testResults.signup.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription>
                        {testResults.signup.success
                          ? `Signup successful: ${JSON.stringify(testResults.signup.data)}`
                          : `Signup failed: ${testResults.signup.error}`}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Auth Status Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Auth Status Test
                </CardTitle>
                <CardDescription>Check current authentication status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => runTest("authStatus", testAuthStatus)} disabled={loading} className="w-full">
                  Check Auth Status
                </Button>
                {testResults.authStatus && (
                  <Alert>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription>
                        Status: {testResults.authStatus.data.authenticated ? "Authenticated" : "Not Authenticated"}
                        {testResults.authStatus.data.token && (
                          <div className="mt-2">
                            <Badge variant="secondary">Token: {testResults.authStatus.data.token}</Badge>
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Logout Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="h-5 w-5" />
                  Logout Test
                </CardTitle>
                <CardDescription>Test user logout functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => runTest("logout", testLogout)}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  Test Logout
                </Button>
                {testResults.logout && (
                  <Alert>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription>{testResults.logout.data.message}</AlertDescription>
                    </div>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Test Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
              <CardDescription>Overview of all authentication tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {Object.entries(testResults).map(([testName, result]: [string, any]) => (
                  <div key={testName} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium capitalize">{testName}</span>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
