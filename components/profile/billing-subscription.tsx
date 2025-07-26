"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Download, Receipt, Crown, Clock, CheckCircle, Plus } from "lucide-react"

export function BillingSubscription() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const currentPlan = {
    name: "Pro",
    price: 49,
    billing: "monthly",
    nextBilling: "2024-02-15",
    status: "active",
  }

  const usage = {
    apiCalls: { used: 8500, limit: 10000 },
    bots: { used: 3, limit: 5 },
    signals: { used: 45, limit: 100 },
    storage: { used: 2.3, limit: 5 },
  }

  const plans = [
    {
      name: "Free",
      price: 0,
      billing: "forever",
      features: ["1 Trading Bot", "10 Signals/month", "Basic Analytics", "Community Support"],
      limits: {
        bots: 1,
        signals: 10,
        apiCalls: 1000,
      },
      current: false,
    },
    {
      name: "Pro",
      price: 49,
      billing: "monthly",
      features: [
        "5 Trading Bots",
        "100 Signals/month",
        "Advanced Analytics",
        "Priority Support",
        "API Access",
        "Custom Strategies",
      ],
      limits: {
        bots: 5,
        signals: 100,
        apiCalls: 10000,
      },
      current: true,
    },
    {
      name: "Enterprise",
      price: 199,
      billing: "monthly",
      features: [
        "Unlimited Bots",
        "Unlimited Signals",
        "White-label Solution",
        "Dedicated Support",
        "Custom Integrations",
        "Advanced Risk Management",
      ],
      limits: {
        bots: "Unlimited",
        signals: "Unlimited",
        apiCalls: "Unlimited",
      },
      current: false,
    },
  ]

  const invoices = [
    {
      id: "INV-2024-001",
      date: "2024-01-15",
      amount: 49,
      status: "paid",
      description: "Pro Plan - Monthly",
    },
    {
      id: "INV-2023-012",
      date: "2023-12-15",
      amount: 49,
      status: "paid",
      description: "Pro Plan - Monthly",
    },
    {
      id: "INV-2023-011",
      date: "2023-11-15",
      amount: 49,
      status: "paid",
      description: "Pro Plan - Monthly",
    },
  ]

  const handleUpgrade = async (planName: string) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Plan Updated",
        description: `Successfully upgraded to ${planName} plan.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Download Started",
      description: `Invoice ${invoiceId} is being downloaded.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            Current Plan
          </CardTitle>
          <CardDescription className="text-gray-400">Your active subscription and usage details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">{currentPlan.name} Plan</h3>
              <p className="text-gray-400">
                ${currentPlan.price}/{currentPlan.billing}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="bg-green-600/20 text-green-400 mb-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
              <p className="text-sm text-gray-400">Next billing: {currentPlan.nextBilling}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">API Calls</span>
                <span className="text-sm text-white">
                  {usage.apiCalls.used.toLocaleString()}/{usage.apiCalls.limit.toLocaleString()}
                </span>
              </div>
              <Progress value={(usage.apiCalls.used / usage.apiCalls.limit) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Trading Bots</span>
                <span className="text-sm text-white">
                  {usage.bots.used}/{usage.bots.limit}
                </span>
              </div>
              <Progress value={(usage.bots.used / usage.bots.limit) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Signals</span>
                <span className="text-sm text-white">
                  {usage.signals.used}/{usage.signals.limit}
                </span>
              </div>
              <Progress value={(usage.signals.used / usage.signals.limit) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Storage (GB)</span>
                <span className="text-sm text-white">
                  {usage.storage.used}/{usage.storage.limit}
                </span>
              </div>
              <Progress value={(usage.storage.used / usage.storage.limit) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Available Plans</CardTitle>
          <CardDescription className="text-gray-400">Choose the plan that best fits your trading needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-lg border ${
                  plan.current ? "border-blue-500 bg-blue-600/10" : "border-slate-600 bg-slate-700/30"
                }`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/{plan.billing}</span>
                  </div>
                  {plan.current && (
                    <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                      Current Plan
                    </Badge>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={plan.current || isLoading}
                  className={`w-full ${
                    plan.current
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  }`}
                >
                  {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription className="text-gray-400">Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-600/50 rounded">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-white font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-400">Expires 12/25</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-700 bg-transparent"
              >
                Remove
              </Button>
            </div>
          </div>
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700 bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription className="text-gray-400">View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-600/50 rounded">
                    <Receipt className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{invoice.id}</p>
                    <p className="text-sm text-gray-400">{invoice.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white font-medium">${invoice.amount}</p>
                    <p className="text-sm text-gray-400">{invoice.date}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      invoice.status === "paid" ? "bg-green-600/20 text-green-400" : "bg-yellow-600/20 text-yellow-400"
                    }
                  >
                    {invoice.status === "paid" ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {invoice.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(invoice.id)}
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
