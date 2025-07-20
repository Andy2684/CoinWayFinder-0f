import { Button } from "@/components/ui/button"
import { Check, Star } from "lucide-react"
import Link from "next/link"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for beginners getting started with crypto trading",
      features: [
        "Up to 3 trading bots",
        "Basic market analysis",
        "Email support",
        "Standard execution speed",
        "Mobile app access",
      ],
      popular: false,
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
    },
    {
      name: "Pro",
      price: "$99",
      period: "/month",
      description: "Advanced features for serious traders and professionals",
      features: [
        "Unlimited trading bots",
        "Advanced AI algorithms",
        "Real-time market signals",
        "Priority support",
        "API access",
        "Custom strategies",
        "Portfolio analytics",
      ],
      popular: true,
      buttonText: "Start Pro Trial",
      buttonVariant: "default" as const,
    },
    {
      name: "Enterprise",
      price: "$299",
      period: "/month",
      description: "Complete solution for institutions and high-volume traders",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "White-label solutions",
        "Advanced reporting",
        "SLA guarantee",
        "24/7 phone support",
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ]

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Simple,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the perfect plan for your trading needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:transform hover:scale-105 ${
                plan.popular
                  ? "border-blue-500/50 shadow-2xl shadow-blue-500/20"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/signup" className="block">
                <Button
                  variant={plan.buttonVariant}
                  className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25"
                      : "border-white/20 text-white hover:bg-white/10 bg-transparent"
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400">
            All plans include a 14-day free trial. No credit card required.{" "}
            <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">
              Need a custom plan?
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
