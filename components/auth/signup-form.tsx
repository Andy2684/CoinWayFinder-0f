"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, CheckCircle, XCircle, User, Mail, Calendar, Lock, Shield } from "lucide-react"
import { useAuth } from "./auth-provider"

interface FormErrors {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  dateOfBirth?: string
  acceptTerms?: string
}

export function SignupForm() {
  const router = useRouter()
  const { signup } = useAuth()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    acceptTerms: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Calculate max date (18 years ago)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 18)
  const maxDateString = maxDate.toISOString().split("T")[0]

  // Real-time validation
  const validateField = (name: string, value: any) => {
    const newErrors = { ...errors }

    switch (name) {
      case "firstName":
        if (!value.trim()) {
          newErrors.firstName = "First name is required"
        } else if (value.trim().length < 2) {
          newErrors.firstName = "First name must be at least 2 characters"
        } else {
          delete newErrors.firstName
        }
        break

      case "lastName":
        if (!value.trim()) {
          newErrors.lastName = "Last name is required"
        } else if (value.trim().length < 2) {
          newErrors.lastName = "Last name must be at least 2 characters"
        } else {
          delete newErrors.lastName
        }
        break

      case "username":
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
        if (!value.trim()) {
          newErrors.username = "Username is required"
        } else if (!usernameRegex.test(value)) {
          newErrors.username = "Username must be 3-20 characters (letters, numbers, underscore only)"
        } else {
          delete newErrors.username
        }
        break

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!value.trim()) {
          newErrors.email = "Email is required"
        } else if (!emailRegex.test(value)) {
          newErrors.email = "Please enter a valid email address"
        } else {
          delete newErrors.email
        }
        break

      case "password":
        const minLength = value.length >= 6
        const hasUpperCase = /[A-Z]/.test(value)
        const hasLowerCase = /[a-z]/.test(value)
        const hasNumbers = /\d/.test(value)

        if (!value) {
          newErrors.password = "Password is required"
        } else if (!minLength || !hasUpperCase || !hasLowerCase || !hasNumbers) {
          newErrors.password = "Password must be 6+ chars with uppercase, lowercase, and number"
        } else {
          delete newErrors.password
        }

        // Also validate confirm password if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match"
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          delete newErrors.confirmPassword
        }
        break

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password"
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match"
        } else {
          delete newErrors.confirmPassword
        }
        break

      case "dateOfBirth":
        if (!value) {
          newErrors.dateOfBirth = "Date of birth is required"
        } else {
          const age = calculateAge(value)
          if (age < 18) {
            newErrors.dateOfBirth = "You must be at least 18 years old"
          } else {
            delete newErrors.dateOfBirth
          }
        }
        break

      case "acceptTerms":
        if (!value) {
          newErrors.acceptTerms = "You must accept the terms and conditions"
        } else {
          delete newErrors.acceptTerms
        }
        break
    }

    setErrors(newErrors)
  }

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const newValue = type === "checkbox" ? checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Real-time validation
    validateField(name, newValue)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key as keyof typeof formData])
    })

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return
    }

    setIsLoading(true)

    try {
      const result = await signup(formData)

      if (result.success) {
        setRegistrationSuccess(true)
      } else {
        setErrors({ email: result.error || "Registration failed" })
      }
    } catch (error) {
      setErrors({ email: "Network error. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    }

    const score = Object.values(checks).filter(Boolean).length
    return { checks, score }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  if (registrationSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Registration Successful!</CardTitle>
          <CardDescription>
            We've sent a verification email to <strong>{formData.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Please check your email and click the verification link to activate your account. The link will expire in
              24 hours.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Didn't receive the email? Check your spam folder or</p>
            <Button variant="outline" size="sm">
              Resend Verification Email
            </Button>
          </div>

          <div className="text-center">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Back to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Join CoinWayFinder and start your crypto trading journey</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                <User className="inline h-4 w-4 mr-1" />
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 flex items-center">
                  <XCircle className="h-3 w-3 mr-1" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 flex items-center">
                  <XCircle className="h-3 w-3 mr-1" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">
              <User className="inline h-4 w-4 mr-1" />
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleInputChange}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-500 flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                {errors.username}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="inline h-4 w-4 mr-1" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">
              <Calendar className="inline h-4 w-4 mr-1" />
              Date of Birth (Must be 18+)
            </Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              max={maxDateString}
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className={errors.dateOfBirth ? "border-red-500" : ""}
            />
            {formData.dateOfBirth && !errors.dateOfBirth && (
              <p className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Age: {calculateAge(formData.dateOfBirth)} years old
              </p>
            )}
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500 flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                {errors.dateOfBirth}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              <Lock className="inline h-4 w-4 mr-1" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded ${
                        passwordStrength.score >= level
                          ? passwordStrength.score === 4
                            ? "bg-green-500"
                            : passwordStrength.score >= 3
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs space-y-1">
                  <div
                    className={`flex items-center ${passwordStrength.checks.length ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordStrength.checks.length ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    At least 6 characters
                  </div>
                  <div
                    className={`flex items-center ${passwordStrength.checks.uppercase ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordStrength.checks.uppercase ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    One uppercase letter
                  </div>
                  <div
                    className={`flex items-center ${passwordStrength.checks.lowercase ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordStrength.checks.lowercase ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    One lowercase letter
                  </div>
                  <div
                    className={`flex items-center ${passwordStrength.checks.number ? "text-green-600" : "text-gray-400"}`}
                  >
                    {passwordStrength.checks.number ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    One number
                  </div>
                </div>
              </div>
            )}

            {errors.password && (
              <p className="text-sm text-red-500 flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              <Shield className="inline h-4 w-4 mr-1" />
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Passwords match
              </p>
            )}
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => {
                  setFormData((prev) => ({ ...prev, acceptTerms: checked as boolean }))
                  validateField("acceptTerms", checked)
                }}
                className={errors.acceptTerms ? "border-red-500" : ""}
              />
              <Label htmlFor="acceptTerms" className="text-sm leading-5">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-red-500 flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                {errors.acceptTerms}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || Object.keys(errors).length > 0}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
