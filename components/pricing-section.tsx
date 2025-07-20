import { Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for beginners getting started with crypto trading",
      features: [
        "1 Trading Bot",
        "Basic Market Analysis",
        "Email Support",
        "5 Exchange Connections",
        "Basic Portfolio Tracking",
        "Standard Alerts",
      ],
      popular: false,
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "Advanced features for serious traders and professionals",
      features: [
        "5 Trading Bots",
        "Advanced AI Analysis",
        "Priority Support",
        "Unlimited Exchange Connections",
        "Advanced Portfolio Analytics",
        "Custom Alerts & Notifications",
        "Risk Management Tools",
        "API Access",
      ],
      popular: true,
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
    },
    {
      name: "Enterprise",
      price: "$299",
      period: "/month",
      description: "Complete solution for institutions and high-volume traders",
      features: [
        "Unlimited Trading Bots",
        "Custom AI Models",
        "24/7 Dedicated Support",
        "White-label Solutions",
        "Advanced Risk Controls",
        "Custom Integrations",
        "Institutional Features",
        "Priority Execution",
        "Custom Reporting",
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ]

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start with a free trial and upgrade as you grow. All plans include our core AI trading features.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 ${plan.popular ? "ring-2 ring-blue-500/50 scale-105" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-white text-2xl font-bold mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <CardDescription className="text-gray-300">{plan.description}</CardDescription>
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

                <div className="pt-6">
                  {plan.buttonText === "Contact Sales" ? (
                    <Button
                      variant={plan.buttonVariant}
                      className={`w-full py-3 font-semibold transition-all duration-300 ${
                        plan.buttonVariant === "default"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                          : "border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                      }`}
                    >
                      {plan.buttonText}
                    </Button>
                  ) : (
                    <Link href="/auth/signup">
                      <Button
                        variant={plan.buttonVariant}
                        className={`w-full py-3 font-semibold transition-all duration-300 ${
                          plan.buttonVariant === "default"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                            : "border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                        }`}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            All plans include a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
