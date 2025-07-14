"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Mail, Lock, User, Calendar, Loader2, AlertCircle, CheckCircle, Zap, Check, X } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function SignupForm() {
  const { signup } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
  })

  const [validations, setValidations] = useState({
    usernameAvailable: null as boolean | null,
    emailAvailable: null as boolean | null,
    passwordStrength: 0,
    passwordMatch: false,
    ageVerified: false,
  })

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 20
    if (/[A-Z]/.test(password)) strength += 20
    if (/[a-z]/.test(password)) strength += 20
    if (/\d/.test(password)) strength += 20
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20
    return strength
  }

  // Age verification
  const verifyAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18
    }
    return age >= 18
  }

  // Username availability check (simulated)
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) return

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock unavailable usernames
    const unavailableUsernames = ["admin", "root", "user", "test", "demo", "coinway", "finder"]
    setValidations((prev) => ({
      ...prev,
      usernameAvailable: !unavailableUsernames.includes(username.toLowerCase()),
    }))
  }

  // Email availability check (simulated)
  const checkEmailAvailability = async (email: string) => {
    if (!email.includes("@")) return

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock unavailable emails
    const unavailableEmails = ["admin@coinwayfinder.com", "demo@coinwayfinder.com", "test@coinwayfinder.com"]
    setValidations((prev) => ({
      ...prev,
      emailAvailable: !unavailableEmails.includes(email.toLowerCase()),
    }))
  }

  // Handle form data changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Real-time validations
    if (field === "password") {
      const strength = calculatePasswordStrength(value as string)
      setValidations((prev) => ({
        ...prev,
        passwordStrength: strength,
        passwordMatch: formData.confirmPassword === value,
      }))
    }

    if (field === "confirmPassword") {
      setValidations((prev) => ({
        ...prev,
        passwordMatch: formData.password === value,
      }))
    }

    if (field === "username" && (value as string).length >= 3) {
      checkUsernameAvailability(value as string)
    }

    if (field === "email" && (value as string).includes("@")) {
      checkEmailAvailability(value as string)
    }

    if (field === "dateOfBirth") {
      setValidations((prev) => ({
        ...prev,
        ageVerified: verifyAge(value as string),
      }))
    }
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate step 1
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your first and last name")
      return
    }

    if (!formData.username.trim() || formData.username.length < 3) {
      setError("Username must be at least 3 characters long")
      return
    }

    if (validations.usernameAvailable === false) {
      setError("Username is not available")
      return
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    if (validations.emailAvailable === false) {
      setError("Email is already registered")
      return
    }

    setStep(2)
  }

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate step 2
    if (!formData.password) {
      setError("Please enter a password")
      return
    }

    if (validations.passwordStrength < 80) {
      setError("Password is too weak. Please use a stronger password.")
      return
    }

    if (!validations.passwordMatch) {
      setError("Passwords do not match")
      return
    }

    if (!formData.dateOfBirth) {
      setError("Please enter your date of birth")
      return
    }

    if (!validations.ageVerified) {
      setError("You must be at least 18 years old to create an account")
      return
    }

    if (!formData.acceptTerms) {
      setError("Please accept the Terms of Service")
      return
    }

    if (!formData.acceptPrivacy) {
      setError("Please accept the Privacy Policy")
      return
    }

    setStep(3)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const result = await signup(formData)

      if (result.success) {
        setSuccess("Account created successfully! Please check your email to verify your account.")
        setTimeout(() => {
          router.push("/auth/verify-email")
        }, 2000)
      } else {
        setError(result.error || "Signup failed")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (validations.passwordStrength < 40) return "bg-red-500"
    if (validations.passwordStrength < 60) return "bg-orange-500"
    if (validations.passwordStrength < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (validations.passwordStrength < 40) return "Weak"
    if (validations.passwordStrength < 60) return "Fair"
    if (validations.passwordStrength < 80) return "Good"
    return "Strong"
  }

  return (
    <div className="min-h-screen bg-[#191A1E] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-[#30D5C8] rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#191A1E]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Create Account</CardTitle>
          <CardDescription className="text-gray-400">Join CoinWayFinder and start your trading journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= 1 ? "bg-[#30D5C8] text-[#191A1E]" : "bg-gray-700 text-gray-400"
              }`}
            >
              1
            </div>
            <div className={`w-8 h-1 ${step >= 2 ? "bg-[#30D5C8]" : "bg-gray-700"}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= 2 ? "bg-[#30D5C8] text-[#191A1E]" : "bg-gray-700 text-gray-400"
              }`}
            >
              2
            </div>
            <div className={`w-8 h-1 ${step >= 3 ? "bg-[#30D5C8]" : "bg-gray-700"}`} />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                step >= 3 ? "bg-[#30D5C8] text-[#191A1E]" : "bg-gray-700 text-gray-400"
              }`}
            >
              3
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500/20 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">{success}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    required
                  />
                  {formData.username.length >= 3 && (
                    <div className="absolute right-3 top-3">
                      {validations.usernameAvailable === null ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : validations.usernameAvailable ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <X className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                {formData.username.length >= 3 && validations.usernameAvailable === false && (
                  <p className="text-xs text-red-400">Username is not available</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    required
                  />
                  {formData.email.includes("@") && (
                    <div className="absolute right-3 top-3">
                      {validations.emailAvailable === null ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : validations.emailAvailable ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <X className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                {formData.email.includes("@") && validations.emailAvailable === false && (
                  <p className="text-xs text-red-400">Email is already registered</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-medium">
                Continue
              </Button>
            </form>
          )}

          {/* Step 2: Security & Verification */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
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
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Progress value={validations.passwordStrength} className="flex-1 h-2" />
                      <span className="text-xs text-gray-400 min-w-[50px]">{getPasswordStrengthText()}</span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p className={formData.password.length >= 8 ? "text-green-400" : ""}>✓ At least 8 characters</p>
                      <p className={/[A-Z]/.test(formData.password) ? "text-green-400" : ""}>✓ One uppercase letter</p>
                      <p className={/[a-z]/.test(formData.password) ? "text-green-400" : ""}>✓ One lowercase letter</p>
                      <p className={/\d/.test(formData.password) ? "text-green-400" : ""}>✓ One number</p>
                      <p className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? "text-green-400" : ""}>
                        ✓ One special character
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    required
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
                  {formData.confirmPassword && (
                    <div className="absolute right-10 top-3">
                      {validations.passwordMatch ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <X className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                {formData.confirmPassword && !validations.passwordMatch && (
                  <p className="text-xs text-red-400">Passwords do not match</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-white">
                  Date of Birth
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                {formData.dateOfBirth && !validations.ageVerified && (
                  <p className="text-xs text-red-400">You must be at least 18 years old</p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-medium">
                  Continue
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Terms & Confirmation */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked)}
                    className="border-gray-600 data-[state=checked]:bg-[#30D5C8] data-[state=checked]:border-[#30D5C8] mt-1"
                    required
                  />
                  <Label htmlFor="acceptTerms" className="text-sm text-gray-300 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#30D5C8] hover:text-[#30D5C8]/80">
                      Terms of Service
                    </Link>
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onCheckedChange={(checked) => handleInputChange("acceptPrivacy", checked)}
                    className="border-gray-600 data-[state=checked]:bg-[#30D5C8] data-[state=checked]:border-[#30D5C8] mt-1"
                    required
                  />
                  <Label htmlFor="acceptPrivacy" className="text-sm text-gray-300 leading-relaxed">
                    I agree to the{" "}
                    <Link href="/privacy" className="text-[#30D5C8] hover:text-[#30D5C8]/80">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptMarketing"
                    checked={formData.acceptMarketing}
                    onCheckedChange={(checked) => handleInputChange("acceptMarketing", checked)}
                    className="border-gray-600 data-[state=checked]:bg-[#30D5C8] data-[state=checked]:border-[#30D5C8] mt-1"
                  />
                  <Label htmlFor="acceptMarketing" className="text-sm text-gray-300 leading-relaxed">
                    I would like to receive marketing emails and updates (optional)
                  </Label>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h4 className="text-white font-medium mb-2">Account Summary</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <p>
                    <span className="text-gray-400">Name:</span> {formData.firstName} {formData.lastName}
                  </p>
                  <p>
                    <span className="text-gray-400">Username:</span> @{formData.username}
                  </p>
                  <p>
                    <span className="text-gray-400">Email:</span> {formData.email}
                  </p>
                  <p>
                    <span className="text-gray-400">Age Verified:</span> {validations.ageVerified ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E] font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#30D5C8] hover:text-[#30D5C8]/80 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
