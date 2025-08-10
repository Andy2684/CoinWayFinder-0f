"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MailCheck, Loader2, ArrowLeft, RefreshCcw } from "lucide-react"

type SignupResponse = {
  success?: boolean
  message?: string
  error?: string
}

export default function SignupForm() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setResendMessage(null)

    if (!email || !username || !password) {
      setError("Please fill in all required fields.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      })

      const data: SignupResponse = await res.json()

      if (!res.ok) {
        setError(data.error || data.message || "Sign up failed. Please try again.")
        return
      }

      // IMPORTANT: Do NOT redirect after successful signup.
      // We show an inline confirmation instead to satisfy the requirement.
      setSuccessMessage(
        data.message || "Account created! Please check your email to verify your address before logging in.",
      )
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResendVerification() {
    setResendMessage(null)
    setResending(true)
    try {
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json()) as { success?: boolean; message?: string; error?: string }
      if (!res.ok) {
        setResendMessage(data.error || data.message || "Unable to resend verification email.")
        return
      }
      setResendMessage(data.message || "Verification email resent. Please check your inbox.")
    } catch {
      setResendMessage("An unexpected error occurred while resending the email.")
    } finally {
      setResending(false)
    }
  }

  if (successMessage) {
    return (
      <Card className="mx-auto w-full max-w-md bg-neutral-900/60 border-neutral-800 text-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15">
              <MailCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Check your email</CardTitle>
              <CardDescription className="text-neutral-300">{successMessage}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-neutral-300">
            We sent a verification link to: <span className="font-medium text-white">{email}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`mailto:${email}`} className="inline-flex" aria-label="Open your default email app">
              <Button variant="secondary" className="bg-neutral-800 text-white hover:bg-neutral-700">
                Open Email App
              </Button>
            </a>
            <Button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="inline-flex items-center gap-2"
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Resend Verification
            </Button>
            <Link href="/" className="inline-flex">
              <Button variant="ghost" className="text-neutral-300 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>
          </div>
          {resendMessage && <p className="text-sm text-neutral-300">{resendMessage}</p>}
        </CardContent>
        <CardFooter className="text-xs text-neutral-400">
          Didn&apos;t receive the email? Check your spam folder or try resending.
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-md bg-neutral-900/60 border-neutral-800 text-white">
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription className="text-neutral-300">
          Start building, backtesting, and monitoring bots in minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-neutral-900 border-neutral-800 placeholder:text-neutral-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              required
              placeholder="yourhandle"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-neutral-900 border-neutral-800 placeholder:text-neutral-500"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-neutral-900 border-neutral-800 placeholder:text-neutral-500"
            />
            <p className="text-xs text-neutral-400">Use at least 8 characters. Longer is stronger.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="bg-neutral-900 border-neutral-800 placeholder:text-neutral-500"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-red-700/40 bg-red-900/20 px-3 py-2 text-sm text-red-200"
            >
              {error}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-500">
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating your account...
              </span>
            ) : (
              "Sign up"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-neutral-400">
        Already have an account?&nbsp;
        <Link href="/auth/login" className="text-neutral-200 underline underline-offset-4 hover:text-white">
          Log in
        </Link>
      </CardFooter>
    </Card>
  )
}
