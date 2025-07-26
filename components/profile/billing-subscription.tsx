"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Download, Calendar, DollarSign, TrendingUp, Crown, CheckCircle, AlertCircle } from "lucide-react"

export function BillingSubscription() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const currentPlan = {
    name: "Pro",
    price: 49,
    billing: "monthly",
    nextBilling: "2024-02-15",
    status: "active",
  }

  const usage = {
    bots: { current: 8, limit: 15, percentage: 53 },
    apiCalls: { current: 45000, limit: 100000, percentage: 45 },
    signals: { current: 25, limit: 50, percentage: 50 },
    storage: { current: 2.3, limit: 10, percentage: 23 },
  }

  const plans = [
    {
      name: "Starter",
      price: 19,
      features: ["5 Trading Bots", "Basic Analytics", "Email Support", "50,000 API Calls/month", "10 Custom Signals"],
      current: false,
    },
    {
      name: "Pro",
      price: 49,
      features: [
        "15 Trading Bots",
        "Advanced Analytics",
        "Priority Support",
        "100,000 API Calls/month",
        "50 Custom Signals",
        "Portfolio Insights",
      ],
      current: true,
    },
    {
      name: "Enterprise",
      price: 149,
      features: [
        "Unlimited Bots",
        "Custom Analytics",
        "24/7 Phone Support",
        "Unlimited API Calls",
        "Unlimited Signals",
        "White-label Options",
        "Dedicated Account Manager",
      ],
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
    {
      id: "INV-2023-010",
      date: "2023-10-15",
      amount: 49,
      status: "paid",
      description: "Pro Plan - Monthly",
    },
  ]

  const paymentMethods = [
    {
      id: "1",
      type: "card",
      last4: "4242",
      brand: "Visa",
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: "2",
      type: "card",
      last4: "5555",
      brand: "Mastercard",
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
    },
  ]

  const handleUpgrade = async (planName: string) => {
    setLoading(true)
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
      setLoading(false)
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
      {/* Current Plan Overview */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Current Plan: {currentPlan.name}
              </CardTitle>
              <CardDescription>
                ${currentPlan.price}/{currentPlan.billing} • Next billing: {currentPlan.nextBilling}
              </CardDescription>
            </div>
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {currentPlan.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">${currentPlan.price}</p>
              <p className="text-sm text-gray-400">Monthly</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">Active</p>
              <p className="text-sm text-gray-400">Status</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">15</p>
              <p className="text-sm text-gray-400">Bot Limit</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">100K</p>
              <p className="text-sm text-gray-400">API Calls</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Overview
          </CardTitle>
          <CardDescription>Your current usage across all features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white">Trading Bots</span>
              <span className="text-gray-400">
                {usage.bots.current} / {usage.bots.limit}
              </span>
            </div>
            <Progress value={usage.bots.percentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white">API Calls</span>
              <span className="text-gray-400">
                {usage.apiCalls.current.toLocaleString()} / {usage.apiCalls.limit.toLocaleString()}
              </span>
            </div>
            <Progress value={usage.apiCalls.percentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white">Custom Signals</span>
              <span className="text-gray-400">
                {usage.signals.current} / {usage.signals.limit}
              </span>
            </div>
            <Progress value={usage.signals.percentage} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white">Storage</span>
              <span className="text-gray-400">
                {usage.storage.current}GB / {usage.storage.limit}GB
              </span>
            </div>
            <Progress value={usage.storage.percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Available Plans</CardTitle>
          <CardDescription>Choose the plan that best fits your trading needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-lg border ${
                  plan.current ? "bg-blue-500/10 border-blue-500/20" : "bg-slate-700/50 border-slate-600"
                }`}
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.current ? "secondary" : "default"}
                  disabled={plan.current || loading}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {plan.current ? "Current Plan" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-white font-medium">
                    {method.brand} •••• {method.last4}
                  </p>
                  <p className="text-sm text-gray-400">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {method.isDefault && (
                  <Badge variant="default" className="text-xs">
                    Default
                  </Badge>
                )}
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full bg-transparent">
            <CreditCard className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium">{invoice.description}</p>
                    <p className="text-sm text-gray-400">
                      {invoice.date} • {invoice.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-white font-medium">${invoice.amount}</p>
                    <Badge variant={invoice.status === "paid" ? "default" : "secondary"} className="text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice.id)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Settings */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Billing Settings</CardTitle>
          <CardDescription>Manage your billing preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Auto-renewal</p>
              <p className="text-sm text-gray-400">Automatically renew your subscription</p>
            </div>
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Enabled
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Billing notifications</p>
              <p className="text-sm text-gray-400">Get notified about billing events</p>
            </div>
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Enabled
            </Badge>
          </div>

          <div className="pt-4 border-t border-slate-600">
            <Button variant="outline" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-transparent">
              <AlertCircle className="h-4 w-4 mr-2" />
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
