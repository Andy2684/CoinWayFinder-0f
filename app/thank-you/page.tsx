"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Mail, Gift } from "lucide-react"
import Link from "next/link"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border-white/10">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-4">Welcome to CoinWayFinder!</CardTitle>
          <p className="text-gray-400 text-lg">
            Your account has been successfully created. Get ready to revolutionize your crypto trading experience.
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* What's Next */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white text-center">What's Next?</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="text-white font-medium">Check Your Email</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  We've sent you a verification email. Please verify your account to get started.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Gift className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="text-white font-medium">Free Trial Access</h4>
                </div>
                <p className="text-gray-400 text-sm">
                  Enjoy 14 days of premium features completely free. No credit card required.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white text-center">Your Benefits</h3>
            <div className="space-y-3">
              {[
                "Access to AI-powered trading bots",
                "Real-time market analysis and signals",
                "Multi-exchange portfolio management",
                "24/7 automated trading capabilities",
                "Advanced risk management tools",
                "Priority customer support",
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/auth/login">
                Login to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          {/* Support */}
          <div className="text-center pt-6 border-t border-white/10">
            <p className="text-gray-400 text-sm mb-2">Need help getting started?</p>
            <div className="flex justify-center space-x-4 text-sm">
              <Link href="/help" className="text-blue-400 hover:text-blue-300">
                Help Center
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/contact" className="text-blue-400 hover:text-blue-300">
                Contact Support
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/tutorials" className="text-blue-400 hover:text-blue-300">
                Video Tutorials
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
