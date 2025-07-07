"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, XCircle, Brain, TrendingUp, Shield } from "lucide-react"

interface RiskAnalysis {
  riskScore: number
  riskLevel: "low" | "medium" | "high" | "extreme"
  warnings: string[]
  recommendations: string[]
  canStart: boolean
  requiresConfirmation: boolean
  marketData?: {
    price: number
    change24h: number
    volume: number
    volatility: number
  }
}

interface AIRiskCheckProps {
  botConfig: any
  onAnalysisComplete: (analysis: RiskAnalysis) => void
  onProceed: () => void
  onCancel: () => void
}

export function AIRiskCheck({ botConfig, onAnalysisComplete, onProceed, onCancel }: AIRiskCheckProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const performRiskAnalysis = async () => {
    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/bots/risk-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "user123", // Replace with actual user ID
          botConfig,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setAnalysis(result.riskAnalysis)
        onAnalysisComplete(result.riskAnalysis)

        if (result.riskAnalysis.requiresConfirmation) {
          setShowConfirmation(true)
        }
      } else {
        throw new Error(result.error || "Analysis failed")
      }
    } catch (error) {
      console.error("Risk analysis failed:", error)
      // Fallback analysis
      const fallbackAnalysis: RiskAnalysis = {
        riskScore: 50,
        riskLevel: "medium",
        warnings: ["⚠️ AI analysis unavailable - proceed with caution"],
        recommendations: ["💡 Start with smaller position size", "💡 Monitor bot closely"],
        canStart: true,
        requiresConfirmation: true,
      }
      setAnalysis(fallbackAnalysis)
      onAnalysisComplete(fallbackAnalysis)
      setShowConfirmation(true)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "extreme":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "medium":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "high":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "extreme":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  if (!analysis) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="h-12 w-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl">AI Risk Analysis</CardTitle>
          <CardDescription>
            Our AI will analyze your bot configuration and current market conditions to assess potential risks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Analysis includes:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Market volatility assessment</li>
              <li>• Strategy suitability for current conditions</li>
              <li>• Position sizing evaluation</li>
              <li>• Risk/reward ratio analysis</li>
              <li>• Personalized recommendations</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <Button onClick={performRiskAnalysis} disabled={isAnalyzing} className="flex-1">
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Start AI Analysis
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Skip Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-500" />
            <div>
              <CardTitle className="text-xl">Risk Analysis Complete</CardTitle>
              <CardDescription>AI-powered assessment of your trading bot configuration</CardDescription>
            </div>
          </div>
          <Badge className={`${getRiskColor(analysis.riskLevel)} border`}>
            {getRiskIcon(analysis.riskLevel)}
            <span className="ml-2 capitalize">{analysis.riskLevel} Risk</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Risk Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Risk Score</span>
            <span className="text-sm text-gray-600">{analysis.riskScore}/100</span>
          </div>
          <Progress value={analysis.riskScore} className="h-3" />
        </div>

        {/* Market Data */}
        {analysis.marketData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600">Current Price</div>
              <div className="font-semibold">${analysis.marketData.price.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">24h Change</div>
              <div
                className={`font-semibold ${analysis.marketData.change24h >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {analysis.marketData.change24h >= 0 ? "+" : ""}
                {analysis.marketData.change24h.toFixed(2)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Volume</div>
              <div className="font-semibold">${(analysis.marketData.volume / 1000000).toFixed(1)}M</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Volatility</div>
              <div className="font-semibold">{analysis.marketData.volatility.toFixed(1)}%</div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-semibold text-orange-800">Warnings:</div>
                {analysis.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-orange-700">
                    {warning}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-semibold text-blue-800">Recommendations:</div>
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="text-sm text-blue-700">
                    {recommendation}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          {analysis.canStart ? (
            <>
              <Button
                onClick={showConfirmation ? onProceed : () => setShowConfirmation(true)}
                className="flex-1"
                variant={analysis.riskLevel === "extreme" ? "destructive" : "default"}
              >
                {showConfirmation ? "Confirm & Start Bot" : "Proceed"}
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Alert className="flex-1 border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Bot start blocked:</strong> Risk level too high. Please adjust your configuration.
                </AlertDescription>
              </Alert>
              <Button variant="outline" onClick={onCancel}>
                Back to Settings
              </Button>
            </>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && analysis.requiresConfirmation && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-semibold text-yellow-800">Confirmation Required</div>
                <div className="text-sm text-yellow-700">
                  The AI has identified potential risks with your configuration. By proceeding, you acknowledge these
                  risks and understand that trading involves potential losses.
                </div>
                <div className="text-xs text-yellow-600 mt-2">
                  Remember: Never invest more than you can afford to lose.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
