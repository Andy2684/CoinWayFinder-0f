"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, AlertCircle, Chrome, Github, Apple } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { BackToDashboard } from "@/components/back-to-dashboard"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await login(email, password)
      if (result.success) {
        toast.success("Login successful!")
        // Don't redirect to dashboard - stay on current page or go to homepage
        router.push("/")
      } else {
        setError(result.error || "Login failed")
        toast.error(result.error || "Login failed")
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login coming soon!`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Back to Dashboard Button */}
      <div className="absolute top-6 left-6">
        <BackToDashboard />
      </div>

      <Card className="w-full max-w-md bg-black/40 border-white/10 backdrop-blur-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">Welcome back</CardTitle>
          <CardDescription className="text-center text-gray-400">Sign in to your CoinWayFinder account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500"
                />
                <Label htmlFor="remember" className="text-sm text-gray-400">
                  Remember me
                </Label>
              </div>
              <Link href="/auth/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black/40 px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("Google")}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Chrome className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("GitHub")}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Github className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("Apple")}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Apple className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>

        <CardFooter>
          <p className="text-center text-sm text-gray-400 w-full">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
