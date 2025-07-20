import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Star } from "lucide-react"

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
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "Advanced features for serious traders and professionals",
      features: [
        "Unlimited trading bots",
        "Advanced AI analytics",
        "Priority support",
        "Lightning-fast execution",
        "Custom strategies",
        "Risk management tools",
        "API access",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$299",
      period: "/month",
      description: "Complete solution for institutions and high-volume traders",
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Custom integrations",
        "White-label solutions",
        "Advanced reporting",
        "SLA guarantee",
        "24/7 phone support",
      ],
      popular: false,
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Choose Your
            <span className="block text-blue-400">Trading Plan</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Start with our free trial and upgrade as your trading grows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white/5 backdrop-blur-sm rounded-xl p-8 border transition-all duration-300 hover:transform hover:scale-105 ${
                plan.popular
                  ? "border-blue-500 shadow-lg shadow-blue-500/20"
                  : "border-white/10 hover:border-blue-500/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-300">
                    <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href="/auth/signup" className="block">
                <Button
                  className={`w-full py-3 ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  }`}
                >
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
