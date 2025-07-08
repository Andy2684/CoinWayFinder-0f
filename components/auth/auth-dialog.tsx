"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, User, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface AuthDialogProps {
  children: React.ReactNode
  defaultTab?: "signin" | "signup"
}

export function AuthDialog({ children, defaultTab = "signin" }: AuthDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const { signIn, signUp } = useAuth()

  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  })

  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await signIn(signInForm.email, signInForm.password)

      if (result.success) {
        setMessage({ type: "success", text: "Welcome back! Redirecting..." })
        setTimeout(() => {
          setOpen(false)
          setMessage(null)
        }, 1500)
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Client-side validation
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" })
      setLoading(false)
      return
    }

    if (signUpForm.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" })
      setLoading(false)
      return
    }

    try {
      const result = await signUp(signUpForm.email, signUpForm.password, signUpForm.name, signUpForm.confirmPassword)

      if (result.success) {
        setMessage({ type: "success", text: "Account created! Welcome to CoinWayFinder!" })
        setTimeout(() => {
          setOpen(false)
          setMessage(null)
        }, 2000)
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to CoinWayFinder</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "signin" | "signup")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Sign in to your account</CardTitle>
                <CardDescription>Enter your credentials to access your trading dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signInForm.email}
                        onChange={(e) => setSignInForm((prev) => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={signInForm.password}
                        onChange={(e) => setSignInForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {message && (
                    <Alert className={message.type === "error" ? "border-red-500" : "border-green-500"}>
                      {message.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                      <AlertDescription className={message.type === "error" ? "text-red-600" : "text-green-600"}>
                        {message.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Create your account</CardTitle>
                <CardDescription>Get started with a 3-day free trial - no credit card required</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        value={signUpForm.name}
                        onChange={(e) => setSignUpForm((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm((prev) => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min. 6 characters)"
                        className="pl-10"
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        className="pl-10"
                        value={signUpForm.confirmPassword}
                        onChange={(e) => setSignUpForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  {message && (
                    <Alert className={message.type === "error" ? "border-red-500" : "border-green-500"}>
                      {message.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                      <AlertDescription className={message.type === "error" ? "text-red-600" : "text-green-600"}>
                        {message.text}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    By signing up, you agree to our Terms of Service and Privacy Policy
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
