"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export function CTASection() {
  const { user } = useAuth()

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {" "}
            Trading Journey?
          </span>
        </h2>

        {/* Description */}
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of successful traders who are already using our AI-powered platform to maximize their crypto
          profits.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          {user ? (
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-white mb-1">14-Day</div>
            <div className="text-gray-400 text-sm">Free Trial</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">No Setup</div>
            <div className="text-gray-400 text-sm">Fees</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">24/7</div>
            <div className="text-gray-400 text-sm">Support</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">Cancel</div>
            <div className="text-gray-400 text-sm">Anytime</div>
          </div>
        </div>
      </div>
    </section>
  )
}
