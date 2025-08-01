import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Mail, Shield, TrendingUp, Bot, Bell, ArrowRight, Star, Clock, Users, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Welcome to CoinWayFinder - Account Created Successfully",
  description:
    "Your CoinWayFinder account has been created successfully. Check your email to verify your account and start trading.",
}

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Welcome to CoinWayFinder!</h1>
          <p className="text-xl text-slate-300 mb-2">Your account has been created successfully</p>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Email Verification Pending
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Next Steps Card */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Mail className="w-5 h-5 text-blue-600" />
                Next Steps
              </CardTitle>
              <CardDescription>Complete these steps to get started with your trading journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-medium flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">Check Your Email</h4>
                  <p className="text-sm text-slate-600">
                    We've sent a verification link to your email address. Click it to activate your account.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-400 rounded-full text-sm font-medium flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-slate-400">Complete Your Profile</h4>
                  <p className="text-sm text-slate-400">
                    Add your trading preferences and connect your exchange accounts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-400 rounded-full text-sm font-medium flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-slate-400">Start Trading</h4>
                  <p className="text-sm text-slate-400">Create your first trading bot and begin automated trading.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview Card */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Zap className="w-5 h-5 text-purple-600" />
                What You'll Get Access To
              </CardTitle>
              <CardDescription>Powerful tools to enhance your trading experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">AI-Powered Trading Bots</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-slate-700">Real-time Market Analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-slate-700">Advanced Risk Management</span>
              </div>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-slate-700">Smart Price Alerts</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-slate-700">Community Signals</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-700">4.9/5 User Rating</p>
                <p className="text-xs text-slate-500">Based on 2,847 reviews</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 mb-1">50,000+</p>
                <p className="text-sm font-medium text-slate-700">Active Traders</p>
                <p className="text-xs text-slate-500">Join our growing community</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800 mb-1">$2.5B+</p>
                <p className="text-sm font-medium text-slate-700">Trading Volume</p>
                <p className="text-xs text-slate-500">Processed this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Link href="/auth/login">
                Sign In to Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/">Back to Homepage</Link>
            </Button>
          </div>

          <p className="text-sm text-slate-400">
            Need help? Contact our{" "}
            <Link href="/support" className="text-blue-400 hover:text-blue-300 underline">
              support team
            </Link>{" "}
            or check our{" "}
            <Link href="/help" className="text-blue-400 hover:text-blue-300 underline">
              help center
            </Link>
          </p>

          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
            <p className="text-sm text-blue-200 mb-2">
              🎉 <strong>Special Welcome Offer:</strong> Get 30 days of premium features free!
            </p>
            <p className="text-xs text-blue-300">Automatically applied to your account after email verification</p>
          </div>
        </div>

        {/* Auto-redirect Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">You'll be automatically redirected to the login page in 10 seconds</p>
        </div>
      </div>

      {/* Auto-redirect Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            setTimeout(function() {
              window.location.href = '/auth/login';
            }, 10000);
          `,
        }}
      />
    </div>
  )
}
