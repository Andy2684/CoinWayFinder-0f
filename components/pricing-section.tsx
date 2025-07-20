import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "forever",
      description: "Perfect for beginners getting started with crypto trading",
      features: [
        "1 Trading Bot",
        "Basic Market Signals",
        "Portfolio Tracking",
        "Community Support",
        "Mobile App Access",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "Advanced features for serious traders",
      features: [
        "5 Trading Bots",
        "Advanced AI Signals",
        "Real-time Analytics",
        "Priority Support",
        "API Access",
        "Custom Strategies",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "per month",
      description: "Full-featured solution for professional traders",
      features: [
        "Unlimited Trading Bots",
        "Premium AI Signals",
        "Advanced Analytics",
        "Dedicated Support",
        "White-label Solution",
        "Custom Integrations",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start free and upgrade as you grow. All plans include our core trading features and 24/7 support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300 ${
                plan.popular ? "ring-2 ring-blue-500/50 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 ml-2">{plan.period}</span>}
                </div>
                <p className="text-gray-400">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/auth/signup">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
