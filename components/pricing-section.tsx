import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      description: "Perfect for beginners getting started with crypto trading",
      features: [
        "3 AI Trading Bots",
        "Basic Trading Signals",
        "Portfolio Tracking",
        "Email Support",
        "Mobile App Access",
      ],
    },
    {
      name: "Professional",
      price: "$99",
      description: "Advanced features for serious traders and investors",
      features: [
        "Unlimited AI Trading Bots",
        "Premium Trading Signals",
        "Advanced Analytics",
        "Priority Support",
        "API Access",
        "Custom Strategies",
        "Risk Management Tools",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$299",
      description: "Complete solution for professional trading teams",
      features: [
        "Everything in Professional",
        "White-label Solution",
        "Dedicated Account Manager",
        "Custom Integrations",
        "Advanced Reporting",
        "Team Management",
        "SLA Guarantee",
      ],
    },
  ]

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Trading Plan</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Start with our free tier or upgrade to unlock advanced features and maximize your trading potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 border-white/10 backdrop-blur-sm ${
                plan.popular ? "ring-2 ring-blue-500" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <CardDescription className="text-gray-300 mt-2">{plan.description}</CardDescription>
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
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                  asChild
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
