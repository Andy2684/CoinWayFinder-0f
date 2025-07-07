"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown } from "lucide-react"
import { subscriptionPlans } from "@/lib/subscription-manager"

interface SubscriptionPlansProps {
  currentPlan?: string
  onSelectPlan: (planId: string) => void
}

export function SubscriptionPlans({ currentPlan, onSelectPlan }: SubscriptionPlansProps) {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month")

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Star className="h-6 w-6" />
      case "basic":
        return <Zap className="h-6 w-6" />
      case "premium":
        return <Crown className="h-6 w-6" />
      case "enterprise":
        return <Crown className="h-6 w-6 text-purple-500" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "free":
        return "border-gray-200"
      case "basic":
        return "border-blue-200"
      case "premium":
        return "border-purple-200 ring-2 ring-purple-100"
      case "enterprise":
        return "border-purple-300 ring-2 ring-purple-200"
      default:
        return "border-gray-200"
    }
  }

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingInterval("month")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingInterval === "month" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("year")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingInterval === "year" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id
          const yearlyPrice = Math.round(plan.price * 12 * 0.8) // 20% discount
          const displayPrice = billingInterval === "year" && plan.price > 0 ? yearlyPrice : plan.price

          return (
            <Card key={plan.id} className={`relative ${getPlanColor(plan.id)}`}>
              {plan.id === "premium" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">{getPlanIcon(plan.id)}</div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  <div className="text-3xl font-bold text-gray-900">
                    ${displayPrice}
                    {plan.price > 0 && (
                      <span className="text-sm font-normal text-gray-600">
                        /{billingInterval === "year" ? "year" : "month"}
                      </span>
                    )}
                  </div>
                  {billingInterval === "year" && plan.price > 0 && (
                    <div className="text-sm text-gray-500 mt-1">${plan.price}/month billed annually</div>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <strong>Bots:</strong> {plan.maxBots === -1 ? "Unlimited" : plan.maxBots}
                    </div>
                    <div>
                      <strong>Strategies:</strong> {plan.maxStrategies.length}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full ${
                    plan.id === "premium"
                      ? "bg-purple-600 hover:bg-purple-700"
                      : plan.id === "enterprise"
                        ? "bg-purple-700 hover:bg-purple-800"
                        : ""
                  }`}
                  variant={isCurrentPlan ? "outline" : "default"}
                >
                  {isCurrentPlan ? "Current Plan" : `Choose ${plan.name}`}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Feature Comparison */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-6 text-center">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-3 text-left">Feature</th>
                {subscriptionPlans.map((plan) => (
                  <th key={plan.id} className="border border-gray-200 p-3 text-center">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 p-3 font-medium">Active Bots</td>
                {subscriptionPlans.map((plan) => (
                  <td key={plan.id} className="border border-gray-200 p-3 text-center">
                    {plan.maxBots === -1 ? "Unlimited" : plan.maxBots}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 p-3 font-medium">AI Risk Analysis</td>
                {subscriptionPlans.map((plan) => (
                  <td key={plan.id} className="border border-gray-200 p-3 text-center">
                    {plan.aiRiskAnalysis ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-200 p-3 font-medium">Priority Support</td>
                {subscriptionPlans.map((plan) => (
                  <td key={plan.id} className="border border-gray-200 p-3 text-center">
                    {plan.prioritySupport ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 p-3 font-medium">Advanced Analytics</td>
                {subscriptionPlans.map((plan) => (
                  <td key={plan.id} className="border border-gray-200 p-3 text-center">
                    {plan.advancedAnalytics ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
