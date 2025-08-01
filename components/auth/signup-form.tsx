"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Check, X, Loader2, Mail, Lock, User, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface PasswordRequirement {
  id: string
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: "length",
    label: "At least 8 characters long",
    test: (password) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "One number (0-9)",
    test: (password) => /\d/.test(password),
  },
  {
    id: "special",
    label: "One special character (!@#$%^&*)",
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
]

export function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getPasswordStrength = () => {
    const metRequirements = passwordRequirements.filter((req) => req.test(formData.password))
    return metRequirements.length
  }

  const isFormValid = () => {
    return (
      formData.firstName.trim().length >= 2 &&
      formData.lastName.trim().length >= 2 &&
      validateEmail(formData.email) &&
      getPasswordStrength() === 5 &&
      formData.password === formData.confirmPassword
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid()) {
      setError("Please fill in all fields correctly")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      if (data.success) {
        toast.success("Account created successfully! Welcome to CoinWayFinder!")
        router.push("/thank-you")
      } else {
        throw new Error(data.error || "Failed to create account")
      }
    } catch (error) {
      console.error("Signup error:", error)

      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          setError("Unable to connect to server. Please check your internet connection and try again.")
        } else {
          setError(error.message)
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-500" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Create Your Account</CardTitle>
            <CardDescription className="text-gray-300">
              Join thousands of traders using AI-powered crypto trading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">
                    First Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      onBlur={() => handleBlur("firstName")}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="John"
                      required
                    />
                  </div>
                  {touched.firstName && formData.firstName.trim().length < 2 && (
                    <p className="text-red-400 text-sm">First name must be at least 2 characters</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">
                    Last Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName")}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      placeholder="Doe"
                      required
                    />
                  </div>
                  {touched.lastName && formData.lastName.trim().length < 2 && (
                    <p className="text-red-400 text-sm">Last name must be at least 2 characters</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email Address *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                {touched.email && formData.email && !validateEmail(formData.email) && (
                  <p className="text-red-400 text-sm">Please enter a valid email address</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="space-y-2">
                  <Label className="text-white text-sm">Password Requirements:</Label>
                  <div className="space-y-1">
                    {passwordRequirements.map((requirement) => {
                      const isMet = requirement.test(formData.password)
                      return (
                        <div key={requirement.id} className="flex items-center gap-2">
                          {isMet ? (
                            <Check className="h-4 w-4 text-green-400" />
                          ) : (
                            <X className="h-4 w-4 text-red-400" />
                          )}
                          <span className={`text-sm ${isMet ? "text-green-400" : "text-gray-400"}`}>
                            {requirement.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {touched.confirmPassword &&
                  formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 text-sm">Passwords do not match</span>
                    </div>
                  )}
                {touched.confirmPassword &&
                  formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 text-sm">Passwords match</span>
                    </div>
                  )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isFormValid() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-gray-300">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
