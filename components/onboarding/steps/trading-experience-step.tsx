"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Target, AlertTriangle } from "lucide-react"
import type { UserOnboardingData } from "@/types/onboarding"

interface TradingExperienceStepProps {
  data: UserOnboardingData | null
  onNext: (data?: Partial<UserOnboardingData>) => void
  onPrevious: () => void
  isLoading: boolean
}

const TRADING_PLATFORMS = [
  "Binance",
  "Coinbase",
  "Kraken",
  "Bybit",
  "KuCoin",
  "Huobi",
  "FTX",
  "Bitfinex",
  "Other",
  "None",
]

const TRADING_GOALS = [
  "Long-term investment",
  "Day trading",
  "Swing trading",
  "Arbitrage",
  "DeFi yield farming",
  "NFT trading",
  "Portfolio diversification",
  "Learning and education",
]

export function TradingExperienceStep({ data, onNext, isLoading }: TradingExperienceStepProps) {
  const [formData, setFormData] = useState({
    level: data?.tradingExperience?.level || "beginner",
    yearsExperience: data?.tradingExperience?.yearsExperience || 0,
    previousPlatforms: data?.tradingExperience?.previousPlatforms || [],
    tradingGoals: data?.tradingExperience?.tradingGoals || [],
    riskTolerance: data?.tradingExperience?.riskTolerance || "medium",
  })

  const handleLevelChange = (level: string) => {
    setFormData((prev) => ({ ...prev, level: level as any }))
  }

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      previousPlatforms: checked
        ? [...prev.previousPlatforms, platform]
        : prev.previousPlatforms.filter((p) => p !== platform),
    }))
  }

  const handleGoalChange = (goal: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      tradingGoals: checked ? [...prev.tradingGoals, goal] : prev.tradingGoals.filter((g) => g !== goal),
    }))
  }

  const handleNext = () => {
    onNext({
      tradingExperience: formData,
    })
  }

  const getLevelDescription = (level: string) => {
    switch (level) {
      case "beginner":
        return "New to crypto trading or less than 1 year of experience"
      case "intermediate":
        return "1-3 years of trading experience with basic strategies"
      case "advanced":
        return "3+ years of experience with advanced trading strategies"
      default:
        return ""
    }
  }

  const getRiskDescription = (risk: string) => {
    switch (risk) {
      case "low":
        return "Conservative approach, prefer stable investments"
      case "medium":
        return "Balanced approach, moderate risk for moderate returns"
      case "high":
        return "Aggressive approach, willing to take high risks for high returns"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-white mb-2">Tell Us About Your Trading Experience</h2>
        <p className="text-gray-300">This helps us customize your dashboard and recommend suitable strategies</p>
      </div>

      <div className="space-y-6">
        {/* Experience Level */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <Label className="text-white font-medium">Trading Experience Level</Label>
            </div>
            <RadioGroup value={formData.level} onValueChange={handleLevelChange}>
              {["beginner", "intermediate", "advanced"].map((level) => (
                <div key={level} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={level} id={level} />
                    <Label htmlFor={level} className="text-white capitalize cursor-pointer">
                      {level}
                    </Label>
                  </div>
                  <p className="text-sm text-gray-400 ml-6">{getLevelDescription(level)}</p>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Years of Experience */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardContent className="p-4">
            <Label className="text-white font-medium mb-3 block">Years of Trading Experience</Label>
            <Select
              value={formData.yearsExperience.toString()}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, yearsExperience: Number.parseInt(value) }))}
            >
              <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                <SelectValue placeholder="Select years of experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Less than 1 year</SelectItem>
                <SelectItem value="1">1-2 years</SelectItem>
                <SelectItem value="3">3-5 years</SelectItem>
                <SelectItem value="6">6-10 years</SelectItem>
                <SelectItem value="11">More than 10 years</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Previous Platforms */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardContent className="p-4">
            <Label className="text-white font-medium mb-3 block">
              Which platforms have you used? (Select all that apply)
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TRADING_PLATFORMS.map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform}
                    checked={formData.previousPlatforms.includes(platform)}
                    onCheckedChange={(checked) => handlePlatformChange(platform, checked as boolean)}
                  />
                  <Label htmlFor={platform} className="text-white text-sm cursor-pointer">
                    {platform}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trading Goals */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-green-400" />
              <Label className="text-white font-medium">What are your trading goals? (Select all that apply)</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TRADING_GOALS.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={formData.tradingGoals.includes(goal)}
                    onCheckedChange={(checked) => handleGoalChange(goal, checked as boolean)}
                  />
                  <Label htmlFor={goal} className="text-white text-sm cursor-pointer">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Tolerance */}
        <Card className="bg-slate-700/50 border-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <Label className="text-white font-medium">Risk Tolerance</Label>
            </div>
            <RadioGroup
              value={formData.riskTolerance}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, riskTolerance: value as any }))}
            >
              {["low", "medium", "high"].map((risk) => (
                <div key={risk} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={risk} id={risk} />
                    <Label htmlFor={risk} className="text-white capitalize cursor-pointer">
                      {risk} Risk
                    </Label>
                  </div>
                  <p className="text-sm text-gray-400 ml-6">{getRiskDescription(risk)}</p>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleNext} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 px-8">
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  )
}
