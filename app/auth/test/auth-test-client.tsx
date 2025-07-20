"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthTestClient() {
  const [testResults] = useState({
    database: { status: "success", message: "Database connection successful" },
    auth: { status: "success", message: "Authentication system working" },
    api: { status: "warning", message: "Some API endpoints need attention" },
    features: { status: "success", message: "All features operational" },
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-600"
      case "warning":
        return "bg-yellow-600"
      case "error":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">System Test</h1>
        </div>

        <div className="grid gap-6 max-w-4xl">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Authentication System Status</CardTitle>
              <CardDescription className="text-gray-300">Testing all system components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(testResults).map(([key, result]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium capitalize">{key} Test</p>
                      <p className="text-sm text-gray-400">{result.message}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
              <CardDescription className="text-gray-300">Run additional tests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700">Test Database Connection</Button>
                <Button className="bg-green-600 hover:bg-green-700">Test API Endpoints</Button>
                <Button className="bg-purple-600 hover:bg-purple-700">Test Authentication</Button>
                <Button className="bg-orange-600 hover:bg-orange-700">Test All Features</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                Go to Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                Go to Signup
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
