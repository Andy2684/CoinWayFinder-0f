"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, User } from "lucide-react"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const { login, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    const success = await login(email, password)
    if (!success) {
      setError("Invalid email or password")
    }
  }

  const fillDemoCredentials = () => {
    setEmail("demo@coinwayfinder.com")
    setPassword("password")
    setError("")
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-[#1A1B23] border-gray-800">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-white">Welcome back</CardTitle>
        <CardDescription className="text-center text-gray-400">Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full border-[#30D5C8] text-[#30D5C8] hover:bg-[#30D5C8] hover:text-[#0F1015] bg-transparent"
          onClick={fillDemoCredentials}
        >
          <User className="w-4 h-4 mr-2" />
          Use Demo Credentials
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#1A1B23] px-2 text-gray-400">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="demo@coinwayfinder.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#0F1015] border-gray-700 text-white placeholder-gray-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0F1015] border-gray-700 text-white placeholder-gray-500 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="border-red-500 bg-red-500/10">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full bg-[#30D5C8] hover:bg-[#28B8AC] text-[#0F1015]" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-400">Don't have an account? </span>
          <Link href="/auth/signup" className="text-[#30D5C8] hover:underline">
            Sign up
          </Link>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Demo credentials:</p>
          <p>Email: demo@coinwayfinder.com</p>
          <p>Password: password</p>
        </div>
      </CardContent>
    </Card>
  )
}
