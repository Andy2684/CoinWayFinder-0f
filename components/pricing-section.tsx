"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Check,
  X,
  Star,
  Crown,
  ArrowRight,
  Users,
  Bot,
  BarChart3,
  Shield,
  Headphones,
  Smartphone,
  Globe,
  TrendingUp,
} from "lucide-react"

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: "Starter",
      description: "Perfect for beginners getting started with crypto trading",
      monthlyPrice: 29,
      yearlyPrice: 290,
      icon: Users,
      color: "blue",
      popular: false,
      features: [
        { name: "Up to 3 Trading Bots", included: true },
        { name: "Basic Market Analysis", included: true },
        { name: "Email Support", included: true },
        { name: "Mobile App Access", included: true },
        { name: "Portfolio Tracking", included: true },
        { name: "Basic Alerts", included: true },
        { name: "Advanced Analytics", included: false },
        { name: "Copy Trading", included: false },
        { name: "Priority Support", included: false },
        { name: "Custom Strategies", included: false },
        { name: "API Access", included: false },
        { name: "White-label Solution", included: false },
      ],
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
    },
    {
      name: "Professional",
      description: "Advanced features for serious traders and small teams",
      monthlyPrice: 99,
      yearlyPrice: 990,
      icon: Bot,
      color: "purple",
      popular: true,
      features: [
        { name: "Up to 15 Trading Bots", included: true },
        { name: "Advanced Market Analysis", included: true },
        { name: "Priority Email & Chat Support", included: true },
        { name: "Mobile App Access", included: true },
        { name: "Advanced Portfolio Tracking", included: true },
        { name: "Smart Alerts & Notifications", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Copy Trading", included: true },
        { name: "Priority Support", included: true },
        { name: "Custom Strategies", included: true },
        { name: "API Access", included: false },
        { name: "White-label Solution", included: false },
      ],
      buttonText: "Start Professional",
      buttonVariant: "default" as const,
    },
    {
      name: "Enterprise",
      description: "Complete solution for institutions and large trading operations",
      monthlyPrice: 299,
      yearlyPrice: 2990,
      icon: Crown,
      color: "gold",
      popular: false,
      features: [
        { name: "Unlimited Trading Bots", included: true },
        { name: "Enterprise Market Analysis", included: true },
        { name: "24/7 Phone & Chat Support", included: true },
        { name: "Mobile App Access", included: true },
        { name: "Enterprise Portfolio Management", included: true },
        { name: "Advanced Alerts & Automation", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Copy Trading", included: true },
        { name: "Priority Support", included: true },
        { name: "Custom Strategies", included: true },
        { name: "Full API Access", included: true },
        { name: "White-label Solution", included: true },
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ]

  const addOns = [
    { name: "Additional Bot Slots", price: "$10/month per bot", icon: Bot },
    { name: "Premium Analytics", price: "$25/month", icon: BarChart3 },
    { name: "Advanced Security", price: "$15/month", icon: Shield },
    { name: "Priority Support", price: "$50/month", icon: Headphones },
    { name: "Mobile Pro Features", price: "$20/month", icon: Smartphone },
    { name: "Multi-Exchange Pro", price: "$30/month", icon: Globe },
  ]

  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, we offer a 14-day free trial for all plans with full access to features.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and cryptocurrency payments.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for all paid plans.",
    },
  ]

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            Flexible Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block">
              Trading Plan
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Start free and scale as you grow. All plans include our core features with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isYearly ? "text-white" : "text-gray-400"}`}>Monthly</span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} className="data-[state=checked]:bg-purple-600" />
            <span className={`text-sm ${isYearly ? "text-white" : "text-gray-400"}`}>
              Yearly
              <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">Save 20%</Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice
            const originalPrice = isYearly ? plan.monthlyPrice * 12 : plan.monthlyPrice

            return (
              <Card
                key={index}
                className={`relative bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 ${
                  plan.popular ? "ring-2 ring-purple-500 shadow-xl shadow-purple-500/20" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div
                    className={`w-16 h-16 rounded-full bg-${plan.color}-500/20 flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className={`w-8 h-8 text-${plan.color}-400`} />
                  </div>
                  <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400 mt-2">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <div className="flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">${price}</span>
                      <span className="text-gray-400 ml-2">/{isYearly ? "year" : "month"}</span>
                    </div>
                    {isYearly && (
                      <div className="text-sm text-gray-400 mt-1">
                        <span className="line-through">${originalPrice}/year</span>
                        <span className="text-green-400 ml-2">Save ${originalPrice - price}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? "text-gray-300" : "text-gray-500"}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-8">
                  <div className="w-full space-y-3">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          : plan.buttonVariant === "outline"
                            ? "border-slate-600 text-white hover:bg-slate-700"
                            : "bg-slate-700 hover:bg-slate-600 text-white"
                      }`}
                      variant={plan.buttonVariant}
                    >
                      {plan.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-gray-400 hover:text-white hover:bg-slate-700"
                    >
                      View Full Features
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Add-ons */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Popular Add-ons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOns.map((addon, index) => {
              const Icon = addon.icon
              return (
                <Card key={index} className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{addon.name}</h4>
                        <p className="text-gray-400 text-sm">{addon.price}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-slate-800/30 border-slate-700">
                <CardContent className="p-6">
                  <h4 className="text-white font-medium mb-2">{faq.question}</h4>
                  <p className="text-gray-400 text-sm">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="text-center bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-8 border border-slate-600">
          <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">Need a Custom Solution?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            We offer custom enterprise solutions with dedicated support, custom integrations, and volume discounts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold px-8"
            >
              Contact Sales
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-8 bg-transparent"
            >
              Schedule Demo
            </Button>
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 px-8">
              View Case Studies
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
