"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import SignupForm from "@/components/auth/signup-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Beaker, ShieldAlert, ArrowRight } from 'lucide-react'

export default function TestSignupPage() {
  const router = useRouter()
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 10000))
  const email = `test.user.${seed}@example.com`

  const [running, setRunning] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Beaker className="h-6 w-6 text-yellow-400" />
            <h1 className="text-2xl font-semibold">Signup E2E Test Harness</h1>
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
              Mock API
            </Badge>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" asChild className="border-white/20">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href="/auth/signup">
                Real Signup Form
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>About this test</CardTitle>
              <CardDescription className="text-blue-100/80">
                This page uses a mock endpoint at <code className="text-blue-200">/api/test/signup</code> to avoid the
                database. On success, it should navigate to the Thank You page, which then redirects to Login.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-100/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Fill valid values into the form automatically.
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Submit to mock endpoint that validates inputs and returns success.
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                Expect redirect to /thank-you, then auto-redirect to /auth/login.
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-yellow-400" />
                This does not touch your real database or production signup route.
              </div>

              <div className="pt-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSeed(Math.floor(Math.random() * 10000))
                    setRunning(false)
                    setTimeout(() => setRunning(true), 0)
                  }}
                >
                  Reset and re-run
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Automated Signup</CardTitle>
              <CardDescription className="text-blue-100/80">
                Using email {email} and a compliant password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {running ? (
                <SignupForm
                  endpoint="/api/test/signup"
                  initialValues={{
                    firstName: "Test",
                    lastName: "User",
                    email,
                    password: "StrongP@ssw0rd!",
                    confirmPassword: "StrongP@ssw0rd!",
                  }}
                  autoSubmit
                />
              ) : (
                <div className="text-blue-100/80">Resetting...</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
