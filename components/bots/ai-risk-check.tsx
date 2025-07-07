"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, XCircle, Brain, TrendingUp, Shield, Zap, Target } from "lucide-react"
import { toast } from "sonner"

interface RiskAnalysisResult {
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "extreme"
  warnings: string[]
  recommendations: string[]
  shouldBlock: boolean
  analysis: {
    strategyRisk: number
    marketRisk: number
    positionRisk: number
    leverageRisk: number
  }
}

interface BotConfig {
  strategy: string
  symbol: string
  investment: number
  leverage?: number
  stopLoss: number
  takeProfit: number
  riskLevel: number
  parameters: Record<string, any>
}

interface AIRiskCheckProps {
  userId: string
  botConfig: BotConfig
  onRiskAnalysisComplete: (result: RiskAnalysisResult) => void
}

export function AIRiskCheck({ userId, botConfig, onRiskAnalysisComplete }: AIRiskCheckProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [riskResult, setRiskResult] = useState<RiskAnalysisResult | null>(null)

  const performRiskAnalysis = async () => {
    setAnalyzing(true)

    try {
      const response = await fetch("/api/bots/risk-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          botConfig,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setRiskResult(data.riskAnalysis)
        onRiskAnalysisComplete(data.riskAnalysis)

        if (data.riskAnalysis.shouldBlock) {
          toast.error("High risk configuration detected - bot creation blocked")
        } else {
          toast.success("Risk analysis completed")
        }
      } else {
        toast.error(data.error || "Risk analysis failed")
      }
    } catch (error) {
      console.error("Risk analysis failed:", error)
      toast.error("Failed to perform risk analysis")
    } finally {
      setAnalyzing(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "high":
        return "text-orange-600 bg-orange-100"
      case "extreme":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="h-5 w-5" />
      case "medium":
        return <AlertTriangle className="h-5 w-5" />
      case "high":
        return <AlertTriangle className="h-5 w-5" />
      case "extreme":
        return <XCircle className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Risk Analysis Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Risk Analysis
          </CardTitle>
          <CardDescription>Get AI-powered risk assessment for your bot configuration before deployment</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={performRiskAnalysis} disabled={analyzing} className="w-full">
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing Risk...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze Risk
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Risk Analysis Results */}
      {riskResult && (
        <div className="space-y-4">
          {/* Overall Risk Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Risk Assessment</span>
                <Badge className={getRiskColor(riskResult.riskLevel)}>
                  {getRiskIcon(riskResult.riskLevel)}
                  <span className="ml-1 capitalize">{riskResult.riskLevel} Risk</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Risk Score</span>
                    <span className="text-2xl font-bold">{riskResult.riskScore}/100</span>
                  </div>
                  <Progress value={riskResult.riskScore} className="h-3" />
                </div>

                {riskResult.shouldBlock && (
                  <Alert className="border-red-200 bg-red-50">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      <strong>Bot Creation Blocked:</strong> This configuration has been flagged as extremely high risk.
                      Please review the warnings and adjust your settings.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Risk Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Breakdown</CardTitle>
              <CardDescription>Detailed analysis of different risk factors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Strategy Risk</span>
                    <span className="ml-auto text-sm">{riskResult.analysis.strategyRisk}/100</span>
                  </div>
                  <Progress value={riskResult.analysis.strategyRisk} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Market Risk</span>
                    <span className="ml-auto text-sm">{riskResult.analysis.marketRisk}/100</span>
                  </div>
                  <Progress value={riskResult.analysis.marketRisk} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Position Risk</span>
                    <span className="ml-auto text-sm">{riskResult.analysis.positionRisk}/100</span>
                  </div>
                  <Progress value={riskResult.analysis.positionRisk} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Leverage Risk</span>
                    <span className="ml-auto text-sm">{riskResult.analysis.leverageRisk}/100</span>
                  </div>
                  <Progress value={riskResult.analysis.leverageRisk} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warnings */}
          {riskResult.warnings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {riskResult.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{warning}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {riskResult.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <CheckCircle className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {riskResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
