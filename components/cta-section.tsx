"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600">
      <div className="container mx-auto px-4">
        <div className="text-center text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Start Your <span className="text-emerald-200">Trading Journey?</span>
            </h2>

            <p className="text-xl md:text-2xl text-emerald-100 mb-8 leading-relaxed">
              Join thousands of successful traders who are already using our AI-powered platform to maximize their
              cryptocurrency profits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                asChild
              >
                <Link href="/auth/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
                asChild
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">50K+</div>
                <div className="text-emerald-200 text-sm">Active Traders</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">$100M+</div>
                <div className="text-emerald-200 text-sm">Volume Traded</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">94%</div>
                <div className="text-emerald-200 text-sm">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white">24/7</div>
                <div className="text-emerald-200 text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
