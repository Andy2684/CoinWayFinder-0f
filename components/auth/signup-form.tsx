"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Check, X, Loader2, Sparkles, MailCheck, Mail, Home } from "lucide-react"
import { toast } from "sonner"

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

interface PasswordRequirement {
  id: string
  text: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { id: "length", text: "At least 8 characters long", test: (password) => password.length >= 8 },
  { id: "uppercase", text: "One uppercase letter (A-Z)", test: (password) => /[A-Z]/.test(password) },
  { id: "lowercase", text: "One lowercase letter (a-z)", test: (password) => /[a-z]/.test(password) },
  { id: "number", text: "One number (0-9)", test: (password) => /\d/.test(password) },
  { id: "special", text: "One special character (!@#$%^&*)", test: (password) => /[!@#$%^&*]/.test(password) },
]

export default function SignupForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required"
        if (value.trim().length < 2) return "First name must be at least 2 characters"
        break
      case "lastName":
        if (!value.trim()) return "Last name is required"
        if (value.trim().length < 2) return "Last name must be at least 2 characters"
        break
      case "email":
        if (!value.trim()) return "Email is required"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address"
        break
      case "password": {
        if (!value) return "Password is required"
        const failedRequirements = passwordRequirements.filter((req) => !req.test(value))
        if (failedRequirements.length > 0) return "Password does not meet all requirements"
        break
      }
      case "confirmPassword":
        if (!value) return "Please confirm your password"
        if (value !== formData.password) return "Passwords do not match"
        break
    }
    return undefined
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    if (name === "password" && formData.confirmPassword && touched.confirmPassword) {
      const confirmError = validateField("confirmPassword", formData.confirmPassword)
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const isFormValid = () => {
    const requiredFields: (keyof FormData)[] = ["firstName", "lastName", "email", "password", "confirmPassword"]
    return (
      requiredFields.every((field) => formData[field].trim() !== "") &&
      Object.keys(errors).every((key) => !errors[key as keyof FormErrors]) &&
      passwordRequirements.every((req) => req.test(formData.password)) &&
      formData.password === formData.confirmPassword
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    const newErrors: FormErrors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData])
      if (error) newErrors[key as keyof FormErrors] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) setErrors({ email: "An account with this email already exists" })
        else if (response.status === 400)
          setErrors({ general: data.error || "Please check your information and try again" })
        else if (response.status >= 500)
          setErrors({ general: "Unable to connect to database. Please try again later." })
        else setErrors({ general: data.error || "An unexpected error occurred. Please try again." })
        return
      }

      // Prevent redirect after signup: show success state inline
      setSuccessEmail(data?.user?.email || formData.email.trim().toLowerCase())
      toast.success("Account created successfully! Please verify your email.")
    } catch (error) {
      console.error("Signup error:", error)
      if (error instanceof TypeError && (error as Error).message.includes("fetch")) {
        setErrors({
          general: "Unable to connect to server. Please check your internet connection and try again.",
        })
      } else {
        setErrors({ general: "An unexpected error occurred. Please try again later." })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-neutral-900 to-slate-950 relative overflow-hidden">
      {/* Background elements (lighter than before) */}
      <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:42px_42px] opacity-[0.06]" />
      <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/15 p-8 shadow-2xl">
            {!successEmail ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-8 h-8 text-emerald-400" />
                    <h1 className="text-3xl font-bold text-white">Join CoinWayFinder</h1>
                  </div>
                  <p className="text-white/70">Create your account and start your journey to smarter crypto trading</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  {/* General Error */}
                  {errors.general && (
                    <div className="bg-red-500/15 border border-red-500/30 rounded-lg p-3 text-red-200 text-sm">
                      {errors.general}
                    </div>
                  )}

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-white font-medium">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-emerald-400/20 ${
                          errors.firstName ? "border-red-500 focus:border-red-500" : ""
                        }`}
                        placeholder="John"
                        disabled={isLoading}
                        autoComplete="given-name"
                      />
                      {errors.firstName && <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-white font-medium">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-emerald-400/20 ${
                          errors.lastName ? "border-red-500 focus:border-red-500" : ""
                        }`}
                        placeholder="Doe"
                        disabled={isLoading}
                        autoComplete="family-name"
                      />
                      {errors.lastName && <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <Label htmlFor="email" className="text-white font-medium">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-emerald-400/20 ${
                        errors.email ? "border-red-500 focus:border-red-500" : ""
                      }`}
                      placeholder="john@example.com"
                      disabled={isLoading}
                      autoComplete="email"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                  </div>

                  {/* Password Field */}
                  <div>
                    <Label htmlFor="password" className="text-white font-medium">
                      Password *
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-emerald-400/20 pr-10 ${
                          errors.password ? "border-red-500 focus:border-red-500" : ""
                        }`}
                        placeholder="Enter your password"
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-white font-medium mb-3">Password Requirements:</h4>
                    <div className="space-y-2">
                      {passwordRequirements.map((requirement) => {
                        const isValid = requirement.test(formData.password)
                        return (
                          <div key={requirement.id} className="flex items-center gap-2">
                            {isValid ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <X className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`text-sm ${isValid ? "text-emerald-300" : "text-white/70"}`}>
                              {requirement.text}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <Label htmlFor="confirmPassword" className="text-white font-medium">
                      Confirm Password *
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-emerald-400/20 pr-10 ${
                          errors.confirmPassword ? "border-red-500 focus:border-red-500" : ""
                        }`}
                        placeholder="Confirm your password"
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <div className="mt-1 flex items-center gap-2">
                        {formData.password === formData.confirmPassword ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-emerald-300">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-red-400">Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-fuchsia-600 hover:from-emerald-700 hover:to-fuchsia-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  {/* Sign In Link */}
                  <div className="text-center">
                    <p className="text-white/70">
                      Already have an account?{" "}
                      <Link
                        href="/auth/login"
                        className="text-emerald-300 hover:text-emerald-200 font-medium transition-colors"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </form>
              </>
            ) : (
              // Success state (no redirect)
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <MailCheck className="w-8 h-8 text-emerald-400" />
                  <h2 className="text-2xl font-semibold text-white">Check your email</h2>
                </div>
                <p className="text-white/80">
                  We sent a verification link to <span className="font-medium text-white">{successEmail}</span>. Please
                  verify your email to activate your account.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="mailto:"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white hover:bg-white/15 transition"
                  >
                    <Mail className="w-4 h-4" />
                    Open email app
                  </a>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition"
                  >
                    <Home className="w-4 h-4" />
                    Back to Home
                  </Link>
                  <Link
                    href="/thank-you"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-white hover:bg-white/10 transition"
                  >
                    View details
                  </Link>
                </div>
                <p className="text-xs text-white/60">
                  Didn{"'"}t receive the email? It may take a few minutes to arrive. You can also check your spam
                  folder.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { SignupForm }
