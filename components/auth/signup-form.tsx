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
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Check, X, AlertCircle, Loader2 } from "lucide-react"

interface PasswordRequirement {
  met: boolean
  text: string
  key: string
}

export function SignupForm() {
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

  const router = useRouter()
  const { toast } = useToast()

  // Password requirements validation
  const passwordRequirements: PasswordRequirement[] = [
    {
      key: "length",
      met: formData.password.length >= 8,
      text: "At least 8 characters long",
    },
    {
      key: "uppercase",
      met: /[A-Z]/.test(formData.password),
      text: "One uppercase letter (A-Z)",
    },
    {
      key: "lowercase",
      met: /[a-z]/.test(formData.password),
      text: "One lowercase letter (a-z)",
    },
    {
      key: "number",
      met: /\d/.test(formData.password),
      text: "One number (0-9)",
    },
    {
      key: "special",
      met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password),
      text: "One special character (!@#$%^&*)",
    },
  ]

  const isPasswordValid = passwordRequirements.every((req) => req.met)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ""
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)

  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      isEmailValid &&
      isPasswordValid &&
      passwordsMatch
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("") // Clear error when user starts typing
  }

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Mark all fields as touched for validation display
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    if (!isFormValid()) {
      setError("Please fill in all fields correctly.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      })

      if (!response.ok) {
        // Handle different types of errors
        if (response.status === 0 || !response.status) {
          throw new Error("Failed to fetch - Please check your internet connection and try again.")
        }

        let errorData
        try {
          errorData = await response.json()
        } catch {
          throw new Error("An unexpected error occurred. Please try again.")
        }

        throw new Error(errorData.error || `Server error (${response.status}). Please try again.`)
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Account Created Successfully! 🎉",
          description: "Welcome to CoinWayFinder! Please check your email to verify your account.",
        })

        // Redirect to thank you page instead of dashboard
        router.push("/thank-you")
      } else {
        throw new Error(data.error || "Failed to create account")
      }
    } catch (error) {
      console.error("Signup error:", error)

      let errorMessage = "An unexpected error occurred. Please try again."

      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Connection failed. Please check your internet connection and try again."
        } else if (error.message.includes("already exists")) {
          errorMessage = "An account with this email already exists. Please try signing in instead."
        } else {
          errorMessage = error.message
        }
      }

      setError(errorMessage)
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const RequirementItem = ({ requirement }: { requirement: PasswordRequirement }) => (
    <div
      className={`flex items-center gap-2 text-sm transition-colors ${
        requirement.met ? "text-green-600" : "text-gray-500"
      }`}
    >
      {requirement.met ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-400" />}
      <span>{requirement.text}</span>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join CoinWayFinder
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create your account and start your crypto trading journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("firstName")}
                  className={`transition-colors ${
                    touched.firstName && !formData.firstName.trim()
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="John"
                />
                {touched.firstName && !formData.firstName.trim() && (
                  <p className="text-xs text-red-500">First name is required</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("lastName")}
                  className={`transition-colors ${
                    touched.lastName && !formData.lastName.trim()
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Doe"
                />
                {touched.lastName && !formData.lastName.trim() && (
                  <p className="text-xs text-red-500">Last name is required</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                onBlur={() => handleBlur("email")}
                className={`transition-colors ${
                  touched.email && !isEmailValid
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="john@example.com"
              />
              {touched.email && formData.email && !isEmailValid && (
                <p className="text-xs text-red-500">Please enter a valid email address</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("password")}
                  className={`pr-10 transition-colors ${
                    touched.password && !isPasswordValid
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Create a strong password"
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

              {/* Password Requirements */}
              {formData.password && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
                  <div className="space-y-1">
                    {passwordRequirements.map((requirement) => (
                      <RequirementItem key={requirement.key} requirement={requirement} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("confirmPassword")}
                  className={`pr-10 transition-colors ${
                    touched.confirmPassword && !passwordsMatch
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Confirm your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div
                  className={`flex items-center gap-2 text-sm ${passwordsMatch ? "text-green-600" : "text-red-500"}`}
                >
                  {passwordsMatch ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 transition-all duration-200"
              disabled={isLoading || !isFormValid()}
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
          </form>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Legal Links */}
          <div className="text-center text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <Link href="/legal/terms" className="text-blue-600 hover:text-blue-700 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-blue-600 hover:text-blue-700 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
