"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, Play, RefreshCw } from "lucide-react"

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
    await runHealthCheck()
    await runDatabaseTest()
    await runAuthTest()
    await runFeaturesTest()
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Test Suite</h1>
          <p className="text-muted-foreground">Verify all features work correctly in production</p>
        </div>
        <Button onClick={runAllTests} disabled={loading !== null}>
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
          Run All Tests
        </Button>
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health">Health Check</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Health Check</CardTitle>
                  <CardDescription>Verify system status and environment</CardDescription>
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
                      <AlertDescription>Database: {healthResult.database}</AlertDescription>
                    </Alert>
                  )}

                  {healthResult.environment?.missingEnvVars && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Missing environment variables: {healthResult.environment.missingEnvVars.join(", ")}
                      </AlertDescription>
                    </Alert>
                  )}

                  {healthResult.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{healthResult.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Click "Run Test" to check system health</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Database Tests</CardTitle>
                  <CardDescription>Verify database schema and connectivity</CardDescription>
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
                      <h4 className="font-medium">Tables:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {databaseResult.tables.map((table: any) => (
                          <div key={table.table} className="flex items-center gap-2">
                            {getStatusIcon(table.exists ? "success" : "error")}
                            <span className="text-sm">{table.table}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {databaseResult.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{databaseResult.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Click "Run Test" to check database</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Authentication Tests</CardTitle>
                  <CardDescription>Verify user authentication and JWT handling</CardDescription>
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
                      <h4 className="font-medium">Test Results:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(authResult.tests).map(([test, status]) => (
                          <div key={test} className="flex items-center gap-2">
                            {getStatusIcon(status as string)}
                            <span className="text-sm">{test.replace(/([A-Z])/g, " $1").toLowerCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {authResult.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{authResult.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Click "Run Test" to check authentication</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Feature Tests</CardTitle>
                  <CardDescription>Verify all trading features work correctly</CardDescription>
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
                      <AlertDescription>
                        {featuresResult.summary.passed}/{featuresResult.summary.total} tests passed
                      </AlertDescription>
                    </Alert>
                  )}

                  {featuresResult.results && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Feature Results:</h4>
                      <div className="space-y-2">
                        {featuresResult.results.map((result: any) => (
                          <div key={result.feature} className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <span className="text-sm">{result.feature.replace(/_/g, " ")}</span>
                            {result.error && <span className="text-xs text-red-500">({result.error})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {featuresResult.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{featuresResult.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Click "Run Test" to check features</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
