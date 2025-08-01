"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"

import { WelcomeStep } from "./steps/welcome-step"
import { ProfileStep } from "./steps/profile-step"
import { TradingExperienceStep } from "./steps/trading-experience-step"
import { PreferencesStep } from "./steps/preferences-step"
import { ExchangeConnectionStep } from "./steps/exchange-connection-step"
import { CompletionStep } from "./steps/completion-step"

import type { UserOnboardingData, OnboardingProgress } from "@/types/onboarding"

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to CoinWayFinder",
    description: "Let's get you started on your crypto trading journey",
    component: WelcomeStep,
  },
  {
    id: "profile",
    title: "Complete Your Profile",
    description: "Tell us a bit about yourself",
    component: ProfileStep,
  },
  {
    id: "experience",
    title: "Trading Experience",
    description: "Help us understand your trading background",
    component: TradingExperienceStep,
  },
  {
    id: "preferences",
    title: "Set Your Preferences",
    description: "Customize your CoinWayFinder experience",
    component: PreferencesStep,
  },
  {
    id: "exchanges",
    title: "Connect Exchanges",
    description: "Link your trading accounts (optional)",
    component: ExchangeConnectionStep,
  },
  {
    id: "completion",
    title: "You're All Set!",
    description: "Welcome to the CoinWayFinder community",
    component: CompletionStep,
  },
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<UserOnboardingData | null>(null)
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchOnboardingData()
    fetchProgress()
  }, [])

  const fetchOnboardingData = async () => {
    try {
      const response = await fetch("/api/onboarding")
      if (response.ok) {
        const data = await response.json()
        setOnboardingData(data)
        setCurrentStep(data.currentStep || 0)
      }
    } catch (error) {
      console.error("Failed to fetch onboarding data:", error)
      toast({
        title: "Error",
        description: "Failed to load onboarding data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await fetch("/api/onboarding/progress")
      if (response.ok) {
        const data = await response.json()
        setProgress(data)
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error)
    }
  }

  const updateOnboardingData = async (stepData: Partial<UserOnboardingData>, stepId?: string) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/onboarding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: currentStep,
          data: {
            ...stepData,
            completedSteps: stepId
              ? [...(onboardingData?.completedSteps || []), stepId].filter((v, i, a) => a.indexOf(v) === i)
              : onboardingData?.completedSteps,
          },
        }),
      })

      if (response.ok) {
        const updatedData = await response.json()
        setOnboardingData(updatedData)
        await fetchProgress()
        return true
      } else {
        throw new Error("Failed to update onboarding data")
      }
    } catch (error) {
      console.error("Failed to update onboarding data:", error)
      toast({
        title: "Error",
        description: "Failed to save your progress",
        variant: "destructive",
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async (stepData?: Partial<UserOnboardingData>) => {
    if (stepData) {
      const success = await updateOnboardingData(stepData, STEPS[currentStep].id)
      if (!success) return
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding
      await updateOnboardingData({ completedAt: new Date() })
      toast({
        title: "Onboarding Complete!",
        description: "Welcome to CoinWayFinder. Let's start trading!",
      })
      router.push("/dashboard")
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const CurrentStepComponent = STEPS[currentStep].component
  const progressPercent = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Getting Started</h1>
          <p className="text-gray-300">Complete your setup to unlock all CoinWayFinder features</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-300">{Math.round(progressPercent)}% Complete</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index < currentStep
                    ? "bg-green-500 border-green-500 text-white"
                    : index === currentStep
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-gray-700 border-gray-600 text-gray-400"
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-center">{STEPS[currentStep].title}</CardTitle>
            <p className="text-gray-300 text-center">{STEPS[currentStep].description}</p>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              data={onboardingData}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isLoading={isSaving}
            />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button variant="ghost" onClick={handleSkip} className="text-gray-400 hover:text-white">
            Skip for now
          </Button>

          <Button onClick={() => handleNext()} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            {currentStep === STEPS.length - 1 ? "Complete" : "Next"}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
