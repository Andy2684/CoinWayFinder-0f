"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, User, Mail, Shield } from "lucide-react"

export default function AuthTestPageClient() {
  const { user, login, logout, signup, loading, isAuthenticated } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testDemoLogin = async () => {
    addTestResult("Testing demo login...")
    const result = await login("demo@coinwayfinder.com", "password")
    if (result) {
      addTestResult("✅ Demo login successful")
    } else {
      addTestResult("❌ Demo login failed")
    }
  }

  const testAdminLogin = async () => {
    addTestResult("Testing admin login...")
    const result = await login("admin@coinwayfinder.com", "AdminPass123!")
    if (result) {
      addTestResult("✅ Admin login successful")
    } else {
      addTestResult("❌ Admin login failed")
    }
  }

  const testInvalidLogin = async () => {
    addTestResult("Testing invalid login...")
    const result = await login("invalid@test.com", "wrongpassword")
    if (!result) {
      addTestResult("✅ Invalid login correctly rejected")
    } else {
      addTestResult("❌ Invalid login incorrectly accepted")
    }
  }

  const testSignup = async () => {
    addTestResult("Testing signup...")
    const testUser = {
      firstName: "Test",
      lastName: "User",
      username: `testuser${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: "TestPass123!",
      confirmPassword: "TestPass123!",
      dateOfBirth: "1990-01-01",
      acceptTerms: true,
    }

    const result = await signup(testUser)
    if (result.success) {
      addTestResult("✅ Signup successful")
    } else {
      addTestResult(`❌ Signup failed: ${result.message}`)
    }
  }

  const testLogout = async () => {
    addTestResult("Testing logout...")
    await logout()
    addTestResult("✅ Logout completed")
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-[#191A1E] p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#30D5C8]" />
              Authentication Test Dashboard
            </CardTitle>
            <CardDescription className="text-gray-400">
              Test the login and signup functionality of CoinWayfinder
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Current User Status */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Current Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="text-white">Status: {isAuthenticated ? "Authenticated" : "Not Authenticated"}</span>
            </div>

            {user && (
              <div className="space-y-3 p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-white">
                    {user.firstName} {user.lastName}
                  </span>
                  <Badge variant="outline" className="text-[#30D5C8] border-[#30D5C8]">
                    @{user.username}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">Role: {user.role}</span>
                  <Badge variant="secondary">{user.plan}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Authentication Tests</CardTitle>
            <CardDescription className="text-gray-400">
              Run various authentication scenarios to test the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button onClick={testDemoLogin} className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
                Test Demo Login
              </Button>
              <Button onClick={testAdminLogin} className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
                Test Admin Login
              </Button>
              <Button onClick={testInvalidLogin} className="bg-orange-600 hover:bg-orange-700" disabled={loading}>
                Test Invalid Login
              </Button>
              <Button onClick={testSignup} className="bg-green-600 hover:bg-green-700" disabled={loading}>
                Test Signup
              </Button>
              <Button
                onClick={testLogout}
                className="bg-red-600 hover:bg-red-700"
                disabled={loading || !isAuthenticated}
              >
                Test Logout
              </Button>
              <Button onClick={clearResults} variant="outline" className="border-gray-600 text-gray-300 bg-transparent">
                Clear Results
              </Button>
            </div>

            {/* Demo Credentials */}
            <Alert className="border-blue-500/20 bg-blue-500/10">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300">
                <strong>Demo Credentials:</strong>
                <br />
                Email: demo@coinwayfinder.com | Password: password
                <br />
                <strong>Admin Credentials:</strong>
                <br />
                Email: admin@coinwayfinder.com | Password: AdminPass123!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="p-2 bg-gray-800 rounded text-sm font-mono text-gray-300">
                    {result}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
