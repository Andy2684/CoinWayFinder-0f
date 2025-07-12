import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "3-day access",
      description: "Perfect for trying out our platform",
      features: [
        "Limited signals access",
        "Basic market overview",
        "Community support",
        "Mobile app access",
      ],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Basic",
      price: "$19",
      period: "/month",
      description: "Great for individual traders",
      features: [
        "DCA bot (3 pairs)",
        "Telegram signals",
        "Basic analytics",
        "Email support",
        "Risk management tools",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "Most popular for serious traders",
      features: [
        "Full access (10 pairs)",
        "AI-powered signals",
        "Advanced analytics",
        "Priority support",
        "Custom bot strategies",
        "Portfolio tracking",
      ],
      cta: "Go Pro",
      popular: true,
    },
    {
      name: "VIP",
      price: "$99",
      period: "/month",
      description: "For professional traders",
      features: [
        "Unlimited pairs (20+)",
        "Auto-trade execution",
        "Advanced portfolio view",
        "Dedicated support",
        "Custom integrations",
        "API access",
        "White-label options",
      ],
      cta: "Get VIP",
      popular: false,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Choose Your
            <span className="text-[#30D5C8]"> Trading Plan</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Start with our free trial and upgrade as you grow your trading
            portfolio
          </p>

          {/* Referral Program Banner */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#30D5C8]/10 border border-[#30D5C8]/20">
            <Star className="w-4 h-4 text-[#30D5C8] mr-2" />
            <span className="text-[#30D5C8] text-sm font-medium">
              🎁 Referral Program: Invite a friend = +5 free days
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative bg-gray-900/50 border-gray-800 hover:border-[#30D5C8]/50 transition-all ${
                plan.popular ? "ring-2 ring-[#30D5C8]/50 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#30D5C8] text-[#191A1E] px-3 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-white text-xl mb-2">
                  {plan.name}
                </CardTitle>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-[#30D5C8]">
                    {plan.price}
                  </span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <p className="text-gray-300 text-sm">{plan.description}</p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-gray-300"
                    >
                      <Check className="w-4 h-4 text-[#30D5C8] mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/pricing" className="block">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-[#30D5C8] hover:bg-[#30D5C8]/90 text-[#191A1E]"
                        : "bg-gray-800 hover:bg-gray-700 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
