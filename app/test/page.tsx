"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, Play, RefreshCw, Globe, Database, Shield, Zap } from "lucide-react"

interface TestResult {
  status: string
  timestamp: string
  [key: string]: any
}

export default function TestPage() {
  const [healthResult, setHealthResult] = useState<TestResult | null>(null)
  const [databaseResult, setDatabaseResult] = useState<TestResult | null>(null)
  const [authResult, setAuthResult] = useState<TestResult | null>(null)
  const [featuresResult, setFeaturesResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const runHealthCheck = async () => {
    setLoading("health")
    try {
      const response = await fetch("/api/test/health")
      const result = await response.json()
      setHealthResult(result)
    } catch (error) {
      setHealthResult({
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(null)
    }
  }

  const runDatabaseTest = async () => {
    setLoading("database")
    try {
      const response = await fetch("/api/test/database")
      const result = await response.json()
      setDatabaseResult(result)
    } catch (error) {
      setDatabaseResult({
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(null)
    }
  }

  const runAuthTest = async () => {
    setLoading("auth")
    try {
      const response = await fetch("/api/test/auth", { method: "POST" })
      const result = await response.json()
      setAuthResult(result)
    } catch (error) {
      setAuthResult({
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(null)
    }
  }

  const runFeaturesTest = async () => {
    setLoading("features")
    try {
      const response = await fetch("/api/test/features", { method: "POST" })
      const result = await response.json()
      setFeaturesResult(result)
    } catch (error) {
      setFeaturesResult({
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(null)
    }
  }

  const runAllTests = async () => {
    setLoading("all")
    await runHealthCheck()
    await runDatabaseTest()
    await runAuthTest()
    await runFeaturesTest()
    setLoading(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "success":
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "unhealthy":
      case "error":
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "partial":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant =
      status === "healthy" || status === "success" || status === "passed"
        ? "default"
        : status === "partial"
          ? "secondary"
          : "destructive"

    return <Badge variant={variant}>{status}</Badge>
  }

  const getOverallStatus = () => {
    const results = [healthResult, databaseResult, authResult, featuresResult]
    const validResults = results.filter((r) => r !== null)

    if (validResults.length === 0) return "pending"

    const hasErrors = validResults.some(
      (r) => r.status === "error" || r.status === "unhealthy" || r.status === "failed",
    )
    const hasPartial = validResults.some((r) => r.status === "partial")
    const allSuccess = validResults.every(
      (r) => r.status === "success" || r.status === "healthy" || r.status === "passed",
    )

    if (hasErrors) return "error"
    if (hasPartial) return "partial"
    if (allSuccess) return "success"
    return "pending"
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coinwayfinder Test Suite</h1>
          <p className="text-muted-foreground">Comprehensive testing for your crypto trading platform</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={loading !== null} size="lg">
            {loading === "all" ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Overall Status Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6" />
              <div>
                <CardTitle>Overall System Status</CardTitle>
                <CardDescription>Real-time health of your trading platform</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(getOverallStatus())}
              {getStatusBadge(getOverallStatus())}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Globe className="h-5 w-5 mr-1" />
                {healthResult ? getStatusIcon(healthResult.status) : <Clock className="h-4 w-4 text-gray-400" />}
              </div>
              <p className="text-sm font-medium">System Health</p>
              <p className="text-xs text-muted-foreground">Environment & Config</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Database className="h-5 w-5 mr-1" />
                {databaseResult ? getStatusIcon(databaseResult.status) : <Clock className="h-4 w-4 text-gray-400" />}
              </div>
              <p className="text-sm font-medium">Database</p>
              <p className="text-xs text-muted-foreground">Schema & Connectivity</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 mr-1" />
                {authResult ? getStatusIcon(authResult.status) : <Clock className="h-4 w-4 text-gray-400" />}
              </div>
              <p className="text-sm font-medium">Authentication</p>
              <p className="text-xs text-muted-foreground">User Security</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 mr-1" />
                {featuresResult ? getStatusIcon(featuresResult.status) : <Clock className="h-4 w-4 text-gray-400" />}
              </div>
              <p className="text-sm font-medium">Trading Features</p>
              <p className="text-xs text-muted-foreground">Core Functionality</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Health Check
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database
          </TabsTrigger>
          <TabsTrigger value="auth" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    System Health Check
                  </CardTitle>
                  <CardDescription>Verify system status, environment variables, and basic connectivity</CardDescription>
                </div>
                <Button onClick={runHealthCheck} disabled={loading === "health"} size="sm">
                  {loading === "health" ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Run Test"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {healthResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(healthResult.status)}
                    {getStatusBadge(healthResult.status)}
                    <span className="text-sm text-muted-foreground">{healthResult.timestamp}</span>
                  </div>

                  {healthResult.database && (
                    <Alert>
                      <Database className="h-4 w-4" />
                      <AlertDescription>Database Connection: {healthResult.database}</AlertDescription>
                    </Alert>
                  )}

                  {healthResult.environment && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Environment Status:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Node Environment: {healthResult.environment.nodeEnv}</span>
                        </div>
                        {healthResult.environment.missingEnvVars ? (
                          <Alert variant="destructive">
                            <AlertDescription>
                              Missing environment variables: {healthResult.environment.missingEnvVars.join(", ")}
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">All required environment variables are set</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {healthResult.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{healthResult.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Click "Run Test" to check system health</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Database Tests
                  </CardTitle>
                  <CardDescription>Verify database schema, table structure, and query functionality</CardDescription>
                </div>
                <Button onClick={runDatabaseTest} disabled={loading === "database"} size="sm">
                  {loading === "database" ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Run Test"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {databaseResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(databaseResult.status)}
                    {getStatusBadge(databaseResult.status)}
                    <span className="text-sm text-muted-foreground">{databaseResult.timestamp}</span>
                  </div>

                  {databaseResult.tables && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Database Tables:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {databaseResult.tables.map((table: any) => (
                          <div key={table.table} className="flex items-center gap-2 p-2 border rounded">
                            {getStatusIcon(table.exists ? "success" : "error")}
                            <span className="text-sm font-mono">{table.table}</span>
                            {table.error && <span className="text-xs text-red-500">({table.error})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {databaseResult.queries && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Query Tests:</h4>
                      <div className="space-y-1">
                        {databaseResult.queries.map((query: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            {getStatusIcon(query.status)}
                            <span className="text-sm">{query.query.replace(/_/g, " ")}</span>
                            {query.error && <span className="text-xs text-red-500">({query.error})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {databaseResult.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{databaseResult.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Click "Run Test" to check database connectivity and schema</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Authentication Tests
                  </CardTitle>
                  <CardDescription>
                    Verify user registration, login, password hashing, and JWT token handling
                  </CardDescription>
                </div>
                <Button onClick={runAuthTest} disabled={loading === "auth"} size="sm">
                  {loading === "auth" ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Run Test"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {authResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(authResult.status)}
                    {getStatusBadge(authResult.status)}
                    <span className="text-sm text-muted-foreground">{authResult.timestamp}</span>
                  </div>

                  {authResult.tests && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Authentication Flow Tests:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(authResult.tests).map(([test, status]) => (
                          <div key={test} className="flex items-center gap-2 p-2 border rounded">
                            {getStatusIcon(status as string)}
                            <span className="text-sm">{test.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {authResult.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{authResult.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Click "Run Test" to verify authentication system</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Trading Features Tests
                  </CardTitle>
                  <CardDescription>
                    Verify all core trading functionality including signals, bots, portfolio, and news
                  </CardDescription>
                </div>
                <Button onClick={runFeaturesTest} disabled={loading === "features"} size="sm">
                  {loading === "features" ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Run Test"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {featuresResult ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(featuresResult.status)}
                    {getStatusBadge(featuresResult.status)}
                    <span className="text-sm text-muted-foreground">{featuresResult.timestamp}</span>
                  </div>

                  {featuresResult.summary && (
                    <Alert>
                      <Zap className="h-4 w-4" />
                      <AlertDescription>
                        Test Results: {featuresResult.summary.passed}/{featuresResult.summary.total} features passed
                        {featuresResult.summary.failed > 0 && ` (${featuresResult.summary.failed} failed)`}
                      </AlertDescription>
                    </Alert>
                  )}

                  {featuresResult.results && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Feature Test Results:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {featuresResult.results.map((result: any) => (
                          <div key={result.feature} className="p-3 border rounded">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(result.status)}
                              <span className="text-sm font-medium">{result.feature.replace(/_/g, " ")}</span>
                            </div>
                            {result.details && (
                              <div className="text-xs text-muted-foreground space-y-1">
                                {Object.entries(result.details).map(([key, value]) => (
                                  <div key={key} className="flex items-center gap-1">
                                    {value ? (
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <XCircle className="h-3 w-3 text-red-500" />
                                    )}
                                    <span>
                                      {key}: {value ? "✓" : "✗"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {result.error && <div className="text-xs text-red-500 mt-1">Error: {result.error}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {featuresResult.error && (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{featuresResult.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Click "Run Test" to verify all trading features</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common testing and debugging actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => window.open("/", "_blank")}>
              View Homepage
            </Button>
            <Button variant="outline" onClick={() => window.open("/dashboard", "_blank")}>
              View Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.open("/auth/login", "_blank")}>
              Test Login
            </Button>
            <Button variant="outline" onClick={() => window.open("/auth/signup", "_blank")}>
              Test Signup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
