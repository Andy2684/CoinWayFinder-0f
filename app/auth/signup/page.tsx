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
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Chrome, Github, Apple, Check } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { BackToDashboard } from "@/components/back-to-dashboard"
import { toast } from "sonner"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptMarketing, setAcceptMarketing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { signup } = useAuth()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError("First name is required")
      return false
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    if (!acceptTerms) {
      setError("You must accept the terms and conditions")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        acceptMarketing,
      })

      if (result.success) {
        toast.success("Account created successfully!")
        // Don't redirect to dashboard - stay on current page or go to homepage
        router.push("/")
      } else {
        setError(result.error || "Signup failed")
        toast.error(result.error || "Signup failed")
      }
    } catch (err) {
      const errorMessage = "An unexpected error occurred"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignup = (provider: string) => {
    toast.info(`${provider} signup coming soon!`)
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

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
          <CardTitle className="text-2xl font-bold text-center text-white">Create your account</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Join CoinWayFinder and start trading smarter
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-white">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-white">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
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
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Password strength: {strengthLabels[passwordStrength - 1] || "Very Weak"}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-400">Passwords match</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="terms" className="text-sm text-gray-400">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketing"
                  checked={acceptMarketing}
                  onCheckedChange={(checked) => setAcceptMarketing(checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="marketing" className="text-sm text-gray-400">
                  I want to receive marketing emails and updates
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
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
              onClick={() => handleSocialSignup("Google")}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Chrome className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialSignup("GitHub")}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Github className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialSignup("Apple")}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Apple className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>

        <CardFooter>
          <p className="text-center text-sm text-gray-400 w-full">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
