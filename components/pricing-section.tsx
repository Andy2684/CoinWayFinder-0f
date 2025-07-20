"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown, UserPlus, LogIn, ArrowRight, Shield, Bot, BarChart3 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export function PricingSection() {
  const { user } = useAuth()

  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for beginners getting started with crypto trading",
      icon: Star,
      color: "blue",
      popular: false,
      features: [
        "1 AI Trading Bot",
        "Basic market analysis",
        "Email support",
        "Mobile app access",
        "Community access",
        "Basic tutorials",
      ],
      limitations: ["Limited to $1,000 portfolio", "Basic strategies only", "Standard execution speed"],
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "Advanced features for serious traders",
      icon: Zap,
      color: "purple",
      popular: true,
      features: [
        "5 AI Trading Bots",
        "Advanced analytics",
        "Priority support",
        "All mobile features",
        "Premium strategies",
        "Risk management tools",
        "Real-time alerts",
        "Portfolio optimization",
      ],
      limitations: [],
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "Maximum power for professional traders",
      icon: Crown,
      color: "gold",
      popular: false,
      features: [
        "Unlimited AI Bots",
        "Custom strategies",
        "24/7 phone support",
        "API access",
        "White-label options",
        "Dedicated account manager",
        "Advanced risk controls",
        "Institutional features",
        "Custom integrations",
      ],
      limitations: [],
    },
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      gold: "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const getBorderColor = (color: string) => {
    const colorMap = {
      blue: "border-blue-500/50",
      purple: "border-purple-500/50",
      gold: "border-yellow-500/50",
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">
            <Crown className="w-4 h-4 mr-2" />
            Pricing Plans
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent block">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free and upgrade as you grow. All plans include our core AI trading features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const colorClasses = getColorClasses(plan.color)
            const borderColor = getBorderColor(plan.color)
            return (
              <Card
                key={index}
                className={`relative bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 ${
                  plan.popular ? `${borderColor} border-2` : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${colorClasses} flex items-center justify-center`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <div className="text-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.price !== "Free" && <span className="text-gray-400 ml-2">{plan.period}</span>}
                  </div>
                  <p className="text-gray-300 text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations.map((limitation, limitIndex) => (
                      <div key={limitIndex} className="flex items-center space-x-3 opacity-60">
                        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                          <div className="w-1 h-1 bg-gray-500 rounded-full" />
                        </div>
                        <span className="text-gray-400 text-sm">{limitation}</span>
                      </div>
                    ))}
                  </div>

                  {!user ? (
                    <div className="space-y-3">
                      <Button asChild className={`w-full bg-gradient-to-r ${colorClasses} text-white font-semibold`}>
                        <Link href="/auth/signup">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Get Started
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        <Link href="/auth/login">
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <Button className={`w-full bg-gradient-to-r ${colorClasses} text-white font-semibold`}>
                      {plan.name === "Starter" ? "Current Plan" : "Upgrade Now"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">All Plans Include</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h4 className="text-lg font-semibold text-white mb-2">Bank-Grade Security</h4>
              <p className="text-gray-300 text-sm">Your funds are protected with military-grade encryption</p>
            </div>
            <div className="text-center">
              <Bot className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h4 className="text-lg font-semibold text-white mb-2">AI Trading Bots</h4>
              <p className="text-gray-300 text-sm">Automated trading powered by advanced algorithms</p>
            </div>
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h4 className="text-lg font-semibold text-white mb-2">Real-time Analytics</h4>
              <p className="text-gray-300 text-sm">Comprehensive market analysis and insights</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {!user && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-4">Start Your Trading Journey Today</h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of successful traders. Start with our free plan and upgrade when you're ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-4"
                >
                  <Link href="/auth/signup">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Free Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 bg-transparent"
                >
                  <Link href="/auth/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Already Have Account?
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                No credit card required • Cancel anytime • 30-day money-back guarantee
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
