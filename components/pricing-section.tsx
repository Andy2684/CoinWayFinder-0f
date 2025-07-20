"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Star, Zap, Crown } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

const plans = [
  {
    name: "Starter",
    description: "Perfect for beginners",
    monthlyPrice: 29,
    yearlyPrice: 290,
    icon: Zap,
    features: [
      "3 Trading Bots",
      "Basic Analytics",
      "Email Support",
      "Mobile App Access",
      "Basic Risk Management",
      "Community Access",
    ],
    popular: false,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Professional",
    description: "Most popular choice",
    monthlyPrice: 99,
    yearlyPrice: 990,
    icon: Star,
    features: [
      "Unlimited Trading Bots",
      "Advanced Analytics",
      "Priority Support",
      "API Access",
      "Advanced Risk Management",
      "Custom Strategies",
      "Portfolio Optimization",
      "Real-time Alerts",
    ],
    popular: true,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Enterprise",
    description: "For serious traders",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    icon: Crown,
    features: [
      "Everything in Professional",
      "White-label Solution",
      "Dedicated Account Manager",
      "Custom Integrations",
      "Advanced Security",
      "Institutional Features",
      "Custom Analytics",
      "24/7 Phone Support",
    ],
    popular: false,
    gradient: "from-yellow-500 to-orange-500",
  },
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)
  const { user } = useAuth()

  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">Pricing</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Start with our free trial and upgrade as you grow. All plans include our core features and 24/7 support.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg ${!isYearly ? "text-white" : "text-gray-400"}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-purple-600" />
            <span className={`text-lg ${isYearly ? "text-white" : "text-gray-400"}`}>
              Yearly
              <Badge className="ml-2 bg-green-500/20 text-green-300 border-green-500/30">Save 20%</Badge>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-black/40 border-white/10 backdrop-blur-xl hover:bg-black/50 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                plan.popular ? "ring-2 ring-purple-500/50 hover:ring-purple-400/70" : "hover:shadow-blue-500/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-sm font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.gradient} bg-opacity-20 flex items-center justify-center`}
                >
                  <plan.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
                <CardDescription className="text-gray-300 text-lg">{plan.description}</CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-white">
                      ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-gray-400 ml-2">/{isYearly ? "year" : "month"}</span>
                  </div>
                  {isYearly && (
                    <div className="text-green-400 text-sm mt-2">
                      Save ${plan.monthlyPrice * 12 - plan.yearlyPrice} per year
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-6">
                  {user ? (
                    <Link href="/dashboard">
                      <Button
                        className={`w-full py-3 text-lg font-semibold rounded-full transition-all duration-300 ${
                          plan.popular
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
                            : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                        }`}
                      >
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signup">
                      <Button
                        className={`w-full py-3 text-lg font-semibold rounded-full transition-all duration-300 ${
                          plan.popular
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
                            : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                        }`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Features */}
        <div className="text-center mt-16">
          <p className="text-gray-300 mb-6">All plans include:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">✨ 7-day Free Trial</Badge>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
              🔒 Bank-level Security
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
              📱 Mobile & Web App
            </Badge>
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-4 py-2">🚀 Instant Setup</Badge>
          </div>
        </div>
      </div>
    </section>
  )
}
