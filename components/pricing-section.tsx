import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star } from "lucide-react"
import Link from "next/link"

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for beginners getting started with AI trading",
      features: [
        "5 AI Trading Signals per day",
        "Basic portfolio tracking",
        "Email alerts",
        "Community access",
        "Mobile app access",
        "Basic risk management",
      ],
      popular: false,
      cta: "Start Free Trial",
    },
    {
      name: "Pro",
      price: "$79",
      period: "/month",
      description: "Advanced features for serious traders",
      features: [
        "Unlimited AI Trading Signals",
        "Advanced portfolio analytics",
        "Real-time alerts (SMS, Email, Push)",
        "Automated trading bots",
        "Multi-exchange integration",
        "Advanced risk management",
        "Priority support",
        "Custom strategies",
      ],
      popular: true,
      cta: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "Complete solution for professional traders and institutions",
      features: [
        "Everything in Pro",
        "White-label solutions",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Advanced analytics & reporting",
        "Institutional-grade security",
        "24/7 phone support",
      ],
      popular: false,
      cta: "Contact Sales",
    },
  ]

  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Trading Plan</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start with our free trial and upgrade as your trading grows. All plans include our core AI features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? "border-emerald-500 shadow-lg scale-105" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-600 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${plan.popular ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/auth/signup">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">All plans include a 14-day free trial. No credit card required.</p>
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-emerald-600 mr-2" />
              Cancel anytime
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-emerald-600 mr-2" />
              24/7 support
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-emerald-600 mr-2" />
              Money-back guarantee
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
