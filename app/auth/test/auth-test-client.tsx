"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { FloatingDashboardButton } from "@/components/back-to-dashboard"
import { CheckCircle, XCircle, User, Mail, Shield } from "lucide-react"

export default function AuthTestPageClient() {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [testResults, setTestResults] = useState<any>({})

  const testLogin = async () => {
    try {
      // Mock login test
      const success = loginData.email === "demo@coinwayfinder.com" && loginData.password === "password"
      setTestResults({
        ...testResults,
        login: { success, message: success ? "Login successful" : "Invalid credentials" },
      })
    } catch (error) {
      setTestResults({ ...testResults, login: { success: false, message: "Login failed" } })
    }
  }

  const testSignup = async () => {
    try {
      // Mock signup test
      const success = signupData.email && signupData.password && signupData.firstName && signupData.lastName
      setTestResults({
        ...testResults,
        signup: { success, message: success ? "Signup successful" : "Missing required fields" },
      })
    } catch (error) {
      setTestResults({ ...testResults, signup: { success: false, message: "Signup failed" } })
    }
  }

  const testAuth = async () => {
    try {
      // Mock auth check
      const token = localStorage.getItem("auth_token")
      const success = !!token
      setTestResults({
        ...testResults,
        auth: { success, message: success ? "User authenticated" : "No authentication token" },
      })
    } catch (error) {
      setTestResults({ ...testResults, auth: { success: false, message: "Auth check failed" } })
    }
  }

  const TestResult = ({ result }: { result: any }) => {
    if (!result) return null
    return (
      <Alert variant={result.success ? "default" : "destructive"}>
        {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        <AlertDescription>{result.message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Authentication Testing</h1>
            <p className="text-gray-400 mt-2">Test authentication functionality</p>
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
                <Button onClick={testLogin} className="w-full">
                  Test Login
                </Button>
                <TestResult result={testResults.login} />
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
                    <Label htmlFor="signupFirstName">First Name</Label>
                    <Input
                      id="signupFirstName"
                      placeholder="John"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupLastName">Last Name</Label>
                    <Input
                      id="signupLastName"
                      placeholder="Doe"
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
                    placeholder="john@example.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="password123"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  />
                </div>
                <Button onClick={testSignup} className="w-full">
                  Test Signup
                </Button>
                <TestResult result={testResults.signup} />
              </CardContent>
            </Card>
          </div>

          {/* Auth Status Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Authentication Status
              </CardTitle>
              <CardDescription>Check current authentication status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testAuth} className="w-full">
                Check Auth Status
              </Button>
              <TestResult result={testResults.auth} />
            </CardContent>
          </Card>

          <Separator />

          <div className="text-center text-sm text-gray-400">
            <p>Demo credentials: demo@coinwayfinder.com / password</p>
          </div>

          <FloatingDashboardButton />
        </div>
      </div>
    </div>
  )
}
